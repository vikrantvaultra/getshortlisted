import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COMPARE } from "../src/config";
import { LIBRARY_RESUMES } from "../src/data/library-resumes";
import { DOMAIN_FIELDS, domainLabel, domainSlug } from "../src/lib/fields";
import { ALL_DOMAINS, libraryHref, parseLibraryParams } from "../src/lib/library-query";
import { HINTS } from "../src/lib/server/domain-hints";
import { detectDomain, domainBySlug, openLibrary } from "../src/lib/server/domains";
import { compareSet, domainOptions, queryLibrary } from "../src/lib/server/library";
import { HOLDOUT_RESUMES } from "./fixtures/holdout-resumes";
import { INDIAN_RESUMES, type Fixture } from "./fixtures/indian-resumes";

const library = openLibrary();

function accuracy(fixtures: Fixture[]) {
  const misses: string[] = [];
  let field = 0;
  let domain = 0;
  for (const fixture of fixtures) {
    const match = detectDomain(fixture.text);
    if (match?.field === fixture.field) field++;
    if (match && fixture.domains.includes(match.domain)) domain++;
    else misses.push(`${fixture.name} → ${match?.domain ?? "no match"}`);
  }
  return { field: field / fixtures.length, domain: domain / fixtures.length, misses };
}

describe("open library build", () => {
  test("covers every domain in DOMAIN_FIELDS, with the same field", () => {
    const built = new Map(library.domains.map((entry) => [entry.domain, entry.field]));
    for (const [domain, field] of Object.entries(DOMAIN_FIELDS)) {
      assert.equal(built.get(domain), field, `${domain} missing or in the wrong field — run npm run library:build`);
    }
  });

  test("every domain can fill a Compare set, on its own shelf or a borrowed one", () => {
    for (const entry of library.domains) {
      const { resumes } = compareSet(entry);
      assert.equal(resumes.length, COMPARE.SET_SIZE, entry.domain);
    }
  });

  test("a borrowed shelf stays in the same field whenever that field has one", () => {
    const stocked = new Set(domainOptions().filter((option) => option.readable >= COMPARE.SET_SIZE).map((option) => option.field));
    for (const entry of library.domains) {
      if (!entry.readableFrom || !stocked.has(entry.field)) continue;
      assert.equal(DOMAIN_FIELDS[entry.readableFrom], entry.field, `${entry.domain} borrows ${entry.readableFrom}`);
    }
  });

  test("only AI-generated resumes are ever exported as readable text", () => {
    for (const resume of library.resumes) {
      assert.equal(library.sources[resume.source]?.kind, "synthetic", `${resume.id} comes from ${resume.source}`);
    }
  });

  test("readable resumes carry no contact details or placeholder names", () => {
    for (const resume of library.resumes) {
      assert.doesNotMatch(resume.text, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, resume.id);
      assert.doesNotMatch(resume.text, /linkedin\.com|github\.com|https?:\/\//i, resume.id);
      assert.doesNotMatch(resume.text, /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, resume.id);
      assert.doesNotMatch(resume.text, /\[(?:your|insert) /i, resume.id);
    }
  });

  test("slugs are unique", () => {
    const slugs = library.domains.map((entry) => entry.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const entry of library.domains) assert.equal(entry.slug, domainSlug(entry.domain));
  });

  test("every hint and model resume points at a real domain", () => {
    for (const hint of HINTS) assert.ok(DOMAIN_FIELDS[hint.domain], hint.domain);
    for (const resume of LIBRARY_RESUMES) assert.ok(DOMAIN_FIELDS[resume.domain], resume.domain);
  });
});

describe("detectDomain", () => {
  test("matches Indian resumes across fields to the right field and role", () => {
    const result = accuracy(INDIAN_RESUMES);
    assert.equal(result.field, 1, result.misses.join("; "));
    assert.ok(result.domain >= 0.95, result.misses.join("; "));
  });

  test("holds up on a held-out set written without seeing the rules", () => {
    const result = accuracy(HOLDOUT_RESUMES);
    assert.ok(result.field >= 0.9, `field ${result.field}: ${result.misses.join("; ")}`);
    assert.ok(result.domain >= 0.85, `domain ${result.domain}: ${result.misses.join("; ")}`);
  });

  test("keeps software and data resumes in tech", () => {
    const tech = new Set(["software", "data", "cloud-security"]);
    const inTech = LIBRARY_RESUMES.filter((resume) => tech.has(detectDomain(resume.redactedText)?.field ?? "")).length;
    assert.ok(inTech >= 28, `${inTech}/30`);
  });

  test("a 300-bed hospital is not a B.Ed", () => {
    const match = detectDomain(
      "Front Office Executive\nManaged patient registration and bed allocation in a 300-bed hospital. Handled TPA approvals, OPD registration and admission and discharge for 18 departments with the hospital information system.",
    );
    assert.equal(match?.field, "healthcare");
  });

  test("returns null for text too thin to judge", () => {
    assert.equal(detectDomain("Hello world"), null);
  });
});

describe("library and compare scope", () => {
  const teacher = domainBySlug("teacher")!;

  test("a teacher sees teacher resumes, not software ones", () => {
    const result = queryLibrary({ domain: teacher.slug }, 1);
    assert.ok(result.total >= COMPARE.SET_SIZE);
    assert.ok(result.resumes.every((resume) => resume.domain === "Teacher"));
    const set = compareSet(teacher);
    assert.ok(set.resumes.every((resume) => resume.domain === "Teacher"));
    assert.equal(set.borrowedFrom, null);
  });

  test("a role without its own shelf borrows one and says so, and keeps its own typical ranges", () => {
    const accountant = domainBySlug("accountant")!;
    const set = compareSet(accountant);
    assert.ok(set.borrowedFrom);
    assert.equal(DOMAIN_FIELDS[set.borrowedFrom!], "finance");
    assert.ok(set.ranges.wordCount && set.ranges.wordCount.n >= 20, "accountant word-count range comes from real accountant resumes");
    const result = queryLibrary({ domain: accountant.slug }, 1);
    assert.equal(result.borrowedFrom, set.borrowedFrom);
  });

  test("a company target keeps same-role resumes first", () => {
    const analyst = domainBySlug("data-analyst")!;
    const set = compareSet(analyst, { company: "Flipkart" });
    assert.ok(set.resumes.every((resume) => resume.company === "Flipkart"));
    assert.equal(set.resumes[0]!.domain, "Data Analyst");
  });

  test("field filter narrows to the field", () => {
    const result = queryLibrary({ field: "healthcare" }, 1);
    assert.ok(result.total > 0);
    assert.ok(result.resumes.every((resume) => DOMAIN_FIELDS[resume.domain] === "healthcare"));
  });
});

describe("library URL", () => {
  const facets = { companies: ["TCS"], years: [2024], domains: ["teacher", "accountant"] };

  test("falls back to the remembered domain only when the URL names no field or domain", () => {
    assert.equal(parseLibraryParams({}, facets, "teacher").filters.domain, "teacher");
    assert.equal(parseLibraryParams({}, facets, "teacher").fromScan, true);
    assert.equal(parseLibraryParams({ domain: ALL_DOMAINS }, facets, "teacher").filters.domain, ALL_DOMAINS);
    assert.equal(parseLibraryParams({ field: "finance" }, facets, "teacher").filters.domain, undefined);
    assert.equal(parseLibraryParams({ field: "finance" }, facets, "teacher").filters.field, "finance");
    assert.equal(parseLibraryParams({ domain: "nonsense" }, facets, "teacher").filters.domain, undefined);
  });

  test("round-trips through libraryHref", () => {
    assert.equal(libraryHref({ domain: "teacher", level: "fresher" }, 2), "/library?domain=teacher&level=fresher&page=2");
    assert.equal(libraryHref({ domain: ALL_DOMAINS, field: "finance" }), "/library?field=finance");
    assert.equal(libraryHref({ domain: ALL_DOMAINS }), "/library?domain=all");
    const parsed = parseLibraryParams({ domain: "accountant", company: "tcs" }, facets);
    assert.equal(parsed.filters.company, "TCS");
  });

  test("display labels fix the datasets' casing", () => {
    assert.equal(domainLabel("Hr"), "HR");
    assert.equal(domainLabel("Ui/Ux Designer"), "UI/UX Designer");
    assert.equal(domainLabel("Teacher"), "Teacher");
  });
});
