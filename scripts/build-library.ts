/**
 * Builds data/library/open-library.json from the local open corpus, so every
 * one of the dataset domains has something to show in Compare and the Library.
 *
 *   npm run library:build          (after npm run corpus:import-open)
 *
 * What goes in, per domain:
 *   - profile   distinctive terms, used to match a scanned resume to its domain
 *   - stats     the middle half (p25–p75) of each Compare measure, counted over
 *               every resume in the domain, real and AI-generated
 *   - resumes   up to RESUMES_PER_DOMAIN readable resumes — AI-GENERATED ONLY.
 *               Real people's resumes are never exported as text: we
 *               promise they are only ever counted.
 *   - readableFrom  for a domain with too few AI-generated resumes, the
 *               closest domain that has them (same field preferred)
 *   - similar   the closest domains overall, so the app can prefer one that
 *               has hand-written resumes (src/data) over readableFrom
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { COMPARE } from "../src/config";
import { anonymise } from "../src/lib/anonymise";
import { documentTerms, estimatePages, guessLevel, type ProfileTerm } from "../src/lib/domain-terms";
import { DOMAIN_FIELDS, domainSlug, type FieldId } from "../src/lib/fields";
import { OPEN_SOURCES_FILE, type OpenSourcesManifest } from "../src/lib/scoring/index-file";
import { stripContactDetails } from "../src/lib/scoring/text";
import { measureStructure } from "../src/lib/structure";
import type { OpenLibraryFile, OpenResume, DomainEntry, MeasureRange } from "../src/lib/server/open-library-types";

process.env.IMPORT_OPEN_NO_MAIN = "1";
const { SOURCES } = await import("./import-open-resumes");
type Doc = import("./import-open-resumes").Doc;

const CORPUS_OPEN = path.resolve("corpus", "open");
const OUT = path.resolve("data", "library", "open-library.json");
const MANIFEST = JSON.parse(readFileSync(OPEN_SOURCES_FILE, "utf8")) as OpenSourcesManifest;

const RESUMES_PER_DOMAIN = 8;
/** Resumes per domain used for profiles and stats. Enough for stable shares, bounded runtime. */
const SAMPLE_PER_DOMAIN = 700;
const PROFILE_TERMS = 120;
const MIN_TERM_SHARE = 0.06;
/** Domains with fewer resumes than this still get stats and shelves but aren't auto-detected. */
const MIN_DOCS_TO_DETECT = 12;
/** How many similar domains each domain lists, for the app to borrow a shelf from. */
const SIMILAR_DOMAINS = 12;

const hash = (value: string) => createHash("sha1").update(value).digest("hex");

/** The import writes cleaned text to <source>/<id>.<ext> (or <id>-2… on a name clash). Returns it if this doc was kept. */
function keptText(slug: string, doc: Doc): string | null {
  const text = stripContactDetails(doc.text).replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const baseId = doc.id.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80);
  const ext = doc.ext ?? "txt";
  for (let n = 1; n < 50; n++) {
    const file = path.join(CORPUS_OPEN, slug, `${baseId}${n === 1 ? "" : `-${n}`}.${ext}`);
    if (!existsSync(file)) return null;
    if (n === 1 && ext === "txt") return text; // ids are unique within these sources; skip the read
    if (readFileSync(file, "utf8") === text) return text;
  }
  return null;
}

// ─── Readable text ───────────────────────────────────────────────────────────

const KNOWN_HEADER =
  /^(?:(?:professional |career |executive )?(?:summary|objective|profile)|(?:professional |work |relevant |teaching |clinical )?experience|(?:professional |educational |academic |career )?background|(?:employment|work|career) history|education(?: and training| background)?|extracurricular activities(?: and [\w ]+)?|(?:technical |core |key |relevant )?skills(?: and \w+)?|core competencies|certifications?(?: and \w+)?|licen[cs]es?(?: and certifications?)?|projects?|(?:key )?achievements|awards(?: and \w+)?|languages|interests|hobbies|volunteer(?:ing| experience| work)?|publications|training|professional development|affiliations|memberships|references|contact(?: information| details)?|personal (?:details|information))$/i;

export const rejected = new Map<string, number>();
const reject = (reason: string) => {
  rejected.set(reason, (rejected.get(reason) ?? 0) + 1);
  return null;
};

/** Words that make a capitalised line a job title or heading, not a person's name. */
const NOT_A_NAME =
  /\b(?:developer|engineer|manager|analyst|designer|specialist|scientist|administrator|architect|consultant|assistant|associate|officer|executive|coordinator|director|lead|intern|trainer|teacher|instructor|nurse|practitioner|chef|driver|guard|broker|writer|researcher|principal|candidate|resume|curriculum|vitae|profile|summary|objective|professional|contact|information|experience|education|skills)\b/i;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unmark = (line: string) =>
  line
    .replace(/\[([^\]]*)\]\([^)]*\)?/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/^#{1,6}\s*/, "")
    .trim();

const CREDENTIALS = /,?\s+(?:ph\.?d|m\.?d|dvm|dds|mba|rn|cpa|pmp|jr\.?|sr\.?)\.?$/i;
const PERSON = /^[a-z][a-z'.-]+(?: [a-z][a-z'.-]+){1,3}$/i;

function isSectionHeading(line: string): boolean {
  if (/^(?:[*•●▪◦-]|\d{1,2}[.)])\s+/.test(line)) return false;
  const bare = line.replace(/:$/, "").trim();
  const words = bare.split(" ").length;
  const caps = /^[A-Z][A-Z &/,'-]+$/.test(bare);
  if (!bare || words > 8 || /\d/.test(bare) || (words > 5 && !caps)) return false;
  return KNOWN_HEADER.test(bare) || (line.endsWith(":") && words <= 3) || (caps && bare.length >= 4);
}

/** Names the generator put in the header block: "Amy Campbell", "ALEX MARTINEZ", "Karina Harrison, DVM", "pihu basu: data scientist candidate". */
function namesIn(head: string[]): string[] {
  const names = new Set<string>();
  for (const [i, line] of head.entries()) {
    const candidates = [
      line.replace(/^dr\.?\s+/i, "").replace(CREDENTIALS, ""),
      line.match(/^(.+?)\s*:\s*.*\b(?:candidate|profile)\b/i)?.[1],
      line.match(/\b(?:candidate|profile)\s*:\s*(.+)$/i)?.[1],
      line.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+){1,2}) (?:is|has)\b/)?.[1],
    ];
    for (const candidate of candidates) {
      const name = candidate?.trim();
      if (!name || NOT_A_NAME.test(name) || KNOWN_HEADER.test(name)) continue;
      // A lone word is only a name when it opens the resume ("Padma").
      if (PERSON.test(name) || (i === 0 && /^[A-Z][a-z]{2,}$/.test(name))) names.add(name);
    }
  }
  return [...names];
}

/** "Alex Martinez is…" → "The candidate is…", everywhere the name appears. */
function withoutNames(lines: string[], names: string[]): string[] {
  if (!names.length) return lines;
  // The full name anywhere; a lone first or last name only where it's the subject,
  // so "Jordan Consulting Group" keeps its name. Case-insensitive: markdown
  // headings arrive upper-cased while the summary says "Alex Martinez".
  const full = new RegExp(`\\b(?:${names.map(escapeRegex).join("|")})(['’]s)?\\b`, "gi");
  const parts = [...new Set(names.flatMap((name) => name.split(" ")).filter((part) => part.length > 2))].map(escapeRegex);
  const subject = new RegExp(`\\b(?:${parts.join("|")})(?=(?:['’]s\\b|\\s+(?:is|has|was|brings|holds|specializes|specialises)\\b))`, "gi");
  return lines.map((line) =>
    line.replace(full, (_, possessive: string | undefined) => (possessive ? "The candidate's" : "The candidate")).replace(subject, "The candidate"),
  );
}

const isHeadingOut = (line: string) => /^[A-Z][A-Z0-9 &/,'()-]{2,}$/.test(line);

export function toLibraryText(raw: string): string | null {
  const lines = raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(unmark)
    .filter(Boolean)
    // "Here is a sample professional resume for Amy Campbell:" — the generator talking, not the resume.
    .filter((line, i) => !(i === 0 && /^(?:here(?:'s| is)|below is|sure\b)/i.test(line)));

  // A markdown "# Name" arrives upper-cased and would pass for a section heading.
  const leadingName = lines[0] && /^[A-Z][A-Z'.-]+(?: [A-Z][A-Z'.-]+){1,3}$/.test(lines[0]) && !NOT_A_NAME.test(lines[0]) && !KNOWN_HEADER.test(lines[0]);
  const namedFirst = leadingName ? lines.shift()! : null;

  const start = lines.findIndex(isSectionHeading);
  if (start < 0) return reject("no section headings");

  // Before the first heading is the header block: name, title, address,
  // contact rows, sometimes a summary paragraph. Keep only a job title and
  // any prose; everything else there is personal.
  const head = lines.slice(0, start);
  const names = [...namesIn(head), ...(namedFirst ? [namedFirst] : [])];
  const title = head
    .map((line) => line.replace(/\s+(?:candidate|profile)(?: profile)?$/i, "").trim())
    .find((line) => line.split(" ").length <= 8 && NOT_A_NAME.test(line) && !/[\d:@[\]|,]/.test(line) && !namesIn([line]).length);
  const prose = head.filter((line) => line.split(" ").length >= 12 && !/[@|]/.test(line));
  // Prose from the header block goes under the resume's own summary heading when it opens with one.
  const summaryFirst = /summary|objective|profile/i.test(lines[start]!);
  const opening = [
    ...(title ? [title.replace(/^[a-z]/, (c) => c.toUpperCase())] : []),
    ...(prose.length ? [summaryFirst ? lines[start]! : "SUMMARY"] : []),
    ...prose,
  ];
  const rest = lines.slice(prose.length && summaryFirst ? start + 1 : start);

  // anonymise() treats its first line as a possible name and deletes that
  // name's words everywhere. Names are handled above, so give it a line that
  // can't be one (it has a colon), or it would strip the job title instead.
  // It also reads a leading "•" as a contact-row separator; hand it dashes.
  const guard = "Resume:";
  const cleaned = anonymise([guard, ...withoutNames([...opening, ...rest], names)].join("\n").replace(/^[ \t]*[•●▪◦][ \t]*/gm, "- "))
    .split("\n")
    .filter((line) => line !== guard);

  const out: string[] = [];
  let skipping = false;
  for (let line of cleaned) {
    line = unmark(line).replace(/\s+/g, " ").trim();
    if (!line || /^[-=_*]{3,}$/.test(line)) continue;
    // What's left of a contact row once the details were stripped: "LinkedIn | Blog", "[| Phone: ]".
    const bareContact = line.replace(/^(?:[*•●▪◦-])\s+/, "").replace(/[[\]()]/g, "").trim();
    if (/^(?:address|location|twitter|x|instagram|portfolio|personal website|website|blog|linkedin|github|behance|dribbble|email|e-mail|phone|mobile)\s*:/i.test(bareContact)) continue;
    if (/^(?:(?:linkedin(?: profile)?|blog|portfolio(?:\/personal website)?|website|email|e-mail|phone|mobile|github|twitter|address|location|contact information|generated address)\b[\s:|,·•/-]*)+$/i.test(bareContact)) continue;
    if (/^[|·•,:\s/-]*$/.test(bareContact)) continue;
    if (/^(?:note:|i hope|feel free|this resume|let me know|\(?note\b)/i.test(line)) continue;
    if (/\[(?:your|insert|company|name|date|phone|email|address|generated)[^\]]*\]/i.test(line)) continue;
    if (/^references? (?:are )?available/i.test(line)) continue;

    const bullet = /^(?:[*•●▪◦-]|\d{1,2}[.)])\s+/.test(line);
    if (isSectionHeading(line)) {
      const bare = line.replace(/:$/, "").trim();
      skipping = /^(?:contact|personal|references)/i.test(bare);
      if (!skipping) out.push(bare.toUpperCase().replace(/[^A-Z0-9 &/,'()-]/g, ""));
      continue;
    }
    if (skipping) continue;
    const body = bullet ? line.replace(/^(?:[*•●▪◦-]|\d{1,2}[.)])\s+/, "") : line;
    // anonymise() may have removed a name that opened a sentence: "is a teacher with…".
    const sentence = /^(?:is|has|was|brings)\s/.test(body) ? `The candidate ${body}` : body;
    out.push(bullet ? `• ${sentence}` : sentence);
  }

  const text = out.join("\n");
  const words = text.split(/\s+/).length;
  const prose2 = out.filter((line) => !isHeadingOut(line));
  if (prose2.filter((line) => /^[a-z]/.test(line.replace(/^• /, ""))).length > prose2.length / 3) return reject("mostly lower-case");
  if (words < 150) return reject("under 150 words");
  if (words > 1100) return reject("over 1,100 words");
  if (out.filter(isHeadingOut).length < 3) return reject("under 3 section headings");
  if (out.filter((line) => line.startsWith("• ")).length < 4) return reject("under 4 bullets");
  return text;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

type Sample = Record<keyof DomainEntry["stats"] & string, number | null>;

function measure(text: string): Sample | null {
  const words = text.split(/\s+/).filter(Boolean).length;
  const metrics = measureStructure(text, estimatePages(words), true);
  // Text that lost its line structure (one of the real sets strips punctuation) says nothing about structure.
  if (metrics.sectionCount < 2 || metrics.scoredLines < 5) return null;
  return {
    pageCount: metrics.pageCount,
    sectionCount: metrics.sectionCount,
    projects: metrics.projects.projects,
    bulletsPerProject: metrics.projects.average,
    averageWordsPerLine: metrics.averageWordsPerLine,
    totalBullets: metrics.totalBullets,
    wordCount: metrics.wordCount,
  };
}

function quartiles(values: number[]): MeasureRange | null {
  if (values.length < 5) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q: number) => {
    const position = (sorted.length - 1) * q;
    const low = Math.floor(position);
    const value = sorted[low]! + (sorted[Math.ceil(position)]! - sorted[low]!) * (position - low);
    return Math.round(value * 10) / 10;
  };
  return { low: at(0.25), median: at(0.5), high: at(0.75), n: sorted.length };
}

// ─── Profiles ────────────────────────────────────────────────────────────────

/** Terms far more common in this group's resumes than in everyone else's, strongest first. */
function distinctive(
  group: { sampled: number; termCounts: Map<string, number> },
  totalSampled: number,
  globalCounts: Map<string, number>,
  limit: number,
): ProfileTerm[] {
  const others = totalSampled - group.sampled;
  const scored: [string, number, number, number][] = [];
  for (const [term, count] of group.termCounts) {
    if (count < 3 || count / group.sampled < MIN_TERM_SHARE) continue;
    const inGroup = (count + 0.5) / (group.sampled + 1);
    const elsewhere = (globalCounts.get(term)! - count + 0.5) / (others + 1);
    const ratio = Math.log(inGroup / elsewhere);
    if (ratio < 0.7) continue;
    scored.push([term, inGroup, elsewhere, inGroup * ratio]);
  }
  scored.sort((a, b) => b[3] - a[3]);
  const round = (v: number) => Math.min(0.995, Math.max(0.0005, Math.round(v * 10000) / 10000));
  return scored.slice(0, limit).map(([term, a, b]) => [term, round(a), round(b)]);
}

// ─── Main ────────────────────────────────────────────────────────────────────

type DomainWork = {
  label: string;
  field: FieldId;
  real: number;
  synthetic: number;
  termCounts: Map<string, number>;
  sampled: number;
  measures: Sample[];
  candidates: { id: string; source: string; text: string; level: OpenResume["level"]; order: string }[];
};

/** Share of a domain's resumes to sample, from the import manifest's per-domain counts. */
function sampleRate(domain: string): number {
  const total = MANIFEST.sources.reduce((sum, source) => sum + (source.domains[domain] ?? 0), 0);
  return total ? Math.min(1, SAMPLE_PER_DOMAIN / total) : 1;
}

async function main() {
  const domains = new Map<string, DomainWork>();
  const unmapped = new Set<string>();
  const sources: OpenLibraryFile["sources"] = {};

  for (const source of SOURCES) {
    console.log(`▸ ${source.dataset}`);
    let docs: Iterable<Doc> | AsyncIterable<Doc>;
    try {
      docs = await source.load(false);
    } catch (error) {
      console.warn(`  ! skipped: ${error instanceof Error ? error.message : error}`);
      continue;
    }
    sources[source.slug] = { dataset: source.dataset, license: source.license, url: `https://huggingface.co/datasets/${source.dataset}`, kind: source.kind };
    let seen = 0;
    for await (const doc of docs) {
      const text = keptText(source.slug, doc);
      if (!text) continue;
      const label = doc.domain || "Other";
      const field = DOMAIN_FIELDS[label];
      if (!field) {
        unmapped.add(label);
        continue;
      }
      if (++seen % 10000 === 0) console.log(`    … ${seen.toLocaleString("en-IN")}`);

      let work = domains.get(label);
      if (!work) {
        work = { label, field, real: 0, synthetic: 0, termCounts: new Map(), sampled: 0, measures: [], candidates: [] };
        domains.set(label, work);
      }
      if (source.kind === "real") work.real++;
      else work.synthetic++;

      // Deterministic sample of about SAMPLE_PER_DOMAIN docs, spread across every source in the domain.
      const order = hash(`${source.slug}/${doc.id}`);
      if (Number.parseInt(order.slice(0, 8), 16) / 0xffffffff < sampleRate(label)) {
        work.sampled++;
        for (const term of documentTerms(text)) work.termCounts.set(term, (work.termCounts.get(term) ?? 0) + 1);
        const sample = measure(text);
        if (sample) work.measures.push(sample);
      }

      if (source.kind === "synthetic" && doc.tier !== "weak") {
        const readable = toLibraryText(stripContactDetails(doc.display ?? text));
        if (readable) work.candidates.push({ id: `open-${source.slug}-${doc.id}`.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase(), source: source.slug, text: readable, level: guessLevel(readable), order });
      }
    }
    console.log(`  ${seen.toLocaleString("en-IN")} resumes`);
  }

  if (unmapped.size) {
    throw new Error(`Add these domains to DOMAIN_FIELDS in src/lib/fields.ts: ${[...unmapped].sort().join(", ")}`);
  }

  // ── Profiles: share of the domain's sample containing a term vs everyone else's.
  const totalSampled = [...domains.values()].reduce((sum, d) => sum + d.sampled, 0);
  const globalCounts = new Map<string, number>();
  for (const work of domains.values()) for (const [term, count] of work.termCounts) globalCounts.set(term, (globalCounts.get(term) ?? 0) + count);

  const profiles = new Map<string, ProfileTerm[]>();
  for (const work of domains.values()) profiles.set(work.label, distinctive(work, totalSampled, globalCounts, PROFILE_TERMS));

  // ── Shelves: up to N readable resumes, mixing levels, in a stable order.
  const shelves = new Map<string, OpenResume[]>();
  for (const work of domains.values()) {
    const byLevel = (level: OpenResume["level"]) => work.candidates.filter((c) => c.level === level).sort((a, b) => a.order.localeCompare(b.order));
    const fresher = byLevel("fresher");
    const experienced = byLevel("experienced");
    const picked: typeof work.candidates = [];
    while (picked.length < RESUMES_PER_DOMAIN && (fresher.length || experienced.length)) {
      const next = (picked.length % 2 === 0 ? experienced.shift() ?? fresher.shift() : fresher.shift() ?? experienced.shift())!;
      picked.push(next);
    }
    shelves.set(
      work.label,
      picked.map((c) => {
        const words = c.text.split(/\s+/).length;
        return { id: c.id, domain: work.label, source: c.source, level: c.level, pageCount: estimatePages(words), text: c.text };
      }),
    );
  }

  // ── Fallbacks for domains without enough readable resumes: most similar profile, same field preferred.
  const cosine = (a: Map<string, number>, b: Map<string, number>) => {
    let dot = 0;
    for (const [term, value] of a) dot += value * (b.get(term) ?? 0);
    const norm = (m: Map<string, number>) => Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0)) || 1;
    return dot / (norm(a) * norm(b));
  };
  // Similarity uses each domain's most common terms, not its profile: profiles are
  // built to differ from each other, which is the opposite of what's wanted here.
  const shares = new Map<string, Map<string, number>>();
  const spread = new Map<string, number>();
  for (const work of domains.values()) {
    const top = [...work.termCounts].sort((a, b) => b[1] - a[1]).slice(0, 400);
    shares.set(work.label, new Map(top.map(([term, count]) => [term, count / work.sampled])));
    for (const [term] of top) spread.set(term, (spread.get(term) ?? 0) + 1);
  }
  // Down-weight terms every domain shares ("management", "communication"), or the most generic domain wins every match.
  for (const vector of shares.values()) {
    for (const [term, share] of vector) vector.set(term, share * Math.log(domains.size / spread.get(term)!));
  }
  const stocked = [...domains.values()].filter((d) => (shelves.get(d.label)?.length ?? 0) >= COMPARE.SET_SIZE);

  const entries: DomainEntry[] = [...domains.values()]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((work) => {
      const own = shelves.get(work.label)!.length;
      let readableFrom: string | null = null;
      if (own < COMPARE.SET_SIZE) {
        const mine = shares.get(work.label)!;
        const sameField = stocked.filter((other) => other.field === work.field);
        const best = (sameField.length ? sameField : stocked)
          .map((other) => ({ other, score: cosine(mine, shares.get(other.label)!) }))
          .sort((a, b) => b.score - a.score)[0];
        readableFrom = best ? best.other.label : null;
      }
      // Every other domain, most similar first (same field ahead of the rest). The app picks
      // the first one that has a full shelf once hand-written resumes are counted too.
      const mine = shares.get(work.label)!;
      const similar = [...domains.values()]
        .filter((other) => other.label !== work.label)
        .map((other) => ({ other, score: cosine(mine, shares.get(other.label)!) + (other.field === work.field ? 1 : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, SIMILAR_DOMAINS)
        .map(({ other }) => other.label);
      const column = (key: keyof Sample) => quartiles(work.measures.map((m) => m[key]).filter((v): v is number => v !== null));
      return {
        slug: domainSlug(work.label),
        domain: work.label,
        field: work.field,
        real: work.real,
        synthetic: work.synthetic,
        detectable: work.sampled >= MIN_DOCS_TO_DETECT,
        readableFrom,
        similar,
        stats: {
          pageCount: column("pageCount"),
          sectionCount: column("sectionCount"),
          projects: column("projects"),
          bulletsPerProject: column("bulletsPerProject"),
          averageWordsPerLine: column("averageWordsPerLine"),
          totalBullets: column("totalBullets"),
          wordCount: column("wordCount"),
        },
        profile: profiles.get(work.label)!,
      };
    });

  const file: OpenLibraryFile = {
    generatedAt: new Date().toISOString(),
    sources,
    domains: entries,
    resumes: entries.flatMap((entry) => shelves.get(entry.domain)!),
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(file));

  const withOwn = entries.filter((e) => !e.readableFrom).length;
  console.log(
    `\nDone: ${entries.length} domains · ${file.resumes.length} readable AI-generated resumes · ${withOwn} domains with their own shelf, ${entries.length - withOwn} borrowing the closest one.`,
  );
  console.log("Rejected for display:", Object.fromEntries(rejected));
  for (const e of entries.filter((e) => e.readableFrom)) console.log(`  ${e.domain} (${e.synthetic} AI) → ${e.readableFrom}`);
}

if (process.env.BUILD_LIBRARY_NO_MAIN !== "1") await main();
