import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { SCORING } from "../src/config";
import { analyseDocument, documentPhrases, sha1, shingle } from "../src/lib/scoring/analyse";
import { scoreDocument } from "../src/lib/scoring/score";
import { isListLine, normaliseLine, splitIntoLines, stripContactDetails } from "../src/lib/scoring/text";

const fresher = readFileSync("fixtures/fresher-resume.txt", "utf8");
const experienced = readFileSync("fixtures/experienced-resume.txt", "utf8");

describe("normaliseLine", () => {
  test("lowercases, strips punctuation, collapses whitespace", () => {
    assert.equal(normaliseLine("  Built   REST APIs (Node.js, Express)!  "), "built rest apis node js express");
  });

  test("replaces every number with #, including decimals, ranges and percentages", () => {
    assert.equal(normaliseLine("Cut latency by 40% from 1.2s across 2019-2023"), "cut latency by # from # s across #");
    assert.equal(normaliseLine("CGPA 8.62/10"), "cgpa #");
    assert.equal(normaliseLine("handled 2,40,000 requests"), "handled # requests");
  });

  test("drops apostrophes without splitting words", () => {
    assert.equal(normaliseLine("the team’s on-call rota"), "the teams on call rota");
  });
});

describe("stripContactDetails", () => {
  test("removes emails, phone numbers and URLs entirely", () => {
    const stripped = stripContactDetails(
      "ananya.r@gmail.com | +91 98765 43210 | linkedin.com/in/ananya | https://github.com/ananyar | 099887-66554",
    );
    assert.doesNotMatch(stripped, /@|98765|linkedin|github|99887/);
  });

  test("keeps years, CGPA and tech names that look like domains", () => {
    const stripped = stripContactDetails("2019 – 2023, CGPA 8.5, ASP.NET, Node.js, Socket.io");
    assert.match(stripped, /2019 – 2023/);
    assert.match(stripped, /ASP\.NET/);
    assert.match(stripped, /Node\.js/);
  });
});

describe("splitIntoLines", () => {
  test("splits on newlines, bullet glyphs and sentence ends", () => {
    const lines = splitIntoLines("Summary line one. Second sentence here.\n• Bullet a ● Bullet b\n- dash bullet");
    assert.deepEqual(lines, ["Summary line one.", "Second sentence here.", "Bullet a", "Bullet b", "dash bullet"]);
  });

  test("rejoins PDF soft wraps that continue in lowercase", () => {
    assert.deepEqual(splitIntoLines("Developed a responsive web application using\nreact and node for students"), [
      "Developed a responsive web application using react and node for students",
    ]);
  });
});

describe("isListLine", () => {
  test("detects skill lists", () => {
    assert.equal(isListLine("Python, Java, JavaScript, React, Node.js, MongoDB"), true);
    assert.equal(isListLine("Languages: C, C++, Java, Python"), true);
    assert.equal(isListLine("React | Node | MongoDB | AWS"), true);
  });
  test("keeps sentences with commas", () => {
    assert.equal(isListLine("Designed, built and shipped the refund service, cutting tickets by half, in two sprints."), false);
  });
});

describe("shingle", () => {
  test("produces overlapping 5-grams", () => {
    assert.deepEqual(shingle("a b c d e f g".split(" ")), ["a b c d e", "b c d e f", "c d e f g"]);
  });
  test("returns nothing for fewer than 5 words", () => {
    assert.deepEqual(shingle("a b c d".split(" ")), []);
  });
});

describe("analyseDocument on fixtures", () => {
  for (const [name, text] of [
    ["fresher", fresher],
    ["experienced", experienced],
  ] as const) {
    test(`${name}: scores only lines of ≥${SCORING.MIN_LINE_WORDS} words, with no contact details`, () => {
      const { lines, skippedLineCount } = analyseDocument(text);
      assert.ok(lines.length >= 10, `expected at least 10 scored lines, got ${lines.length}`);
      assert.ok(skippedLineCount > 0, "headers and dates should be skipped");
      for (const line of lines) {
        assert.ok(line.normalised.split(" ").length >= SCORING.MIN_LINE_WORDS);
        assert.equal(line.hashes.length, line.shingles.length);
        assert.doesNotMatch(line.text, /@|linkedin\.com|github\.com|\+91/);
        assert.doesNotMatch(line.normalised, /\d/);
      }
    });

    test(`${name}: skill lists and section headers are not scored`, () => {
      const scored = analyseDocument(text).lines.map((line) => line.text);
      assert.ok(!scored.some((line) => /^(Python|Java), /.test(line)), "skills list was scored");
      assert.ok(!scored.some((line) => /^[A-Z ]+$/.test(line)), "a section header was scored");
    });
  }

  test("is deterministic", () => {
    assert.deepEqual(analyseDocument(fresher), analyseDocument(fresher));
  });
});

describe("documentPhrases", () => {
  test("counts a phrase once per document, however often it repeats", () => {
    const repeated = "Worked on the frontend of the college website.\nWorked on the frontend of the college website.";
    const analysis = analyseDocument(repeated);
    assert.equal(analysis.lines.length, 2);
    assert.equal(documentPhrases(analysis).size, analysis.lines[0]!.hashes.length);
  });

  test("hashes are sha1 of the normalised shingle", () => {
    const [line] = analyseDocument("Developed a responsive web application using React").lines;
    assert.equal(line!.hashes[0], sha1("developed a responsive web application"));
  });
});

describe("scoreDocument", () => {
  const doc = analyseDocument(
    [
      "Collaborated with cross functional teams to define design and ship new features.",
      "Mapped two hundred dabbawala handoffs across Dadar to find missing lunches.",
    ].join("\n"),
  );
  const [cliche, original] = doc.lines;

  test("marks a line common when ≥60% of its shingles are in ≥2 documents", () => {
    const counts = new Map(cliche!.hashes.map((hash) => [hash, 5]));
    const result = scoreDocument(doc, (hashes) => new Map(hashes.map((h) => [h, counts.get(h) ?? 0])));
    assert.equal(result.commonCount, 1);
    assert.equal(result.totalCount, 2);
    assert.equal(result.percentage, 50);
    assert.deepEqual(result.lines.map((line) => line.common), [true, false]);
  });

  test("doc_count of 1 is not enough", () => {
    const result = scoreDocument(doc, (hashes) => new Map(hashes.map((h) => [h, 1])));
    assert.equal(result.commonCount, 0);
  });

  test("the ratio threshold is inclusive and tunable", () => {
    const hashes = original!.hashes;
    const seen = new Set(hashes.slice(0, Math.ceil(hashes.length * 0.6)));
    const lookup = (all: string[]) => new Map(all.map((h) => [h, seen.has(h) ? 2 : 0]));
    assert.equal(scoreDocument(doc, lookup).lines[1]!.common, true);
    assert.equal(scoreDocument(doc, lookup, { commonLineRatio: 0.95 }).lines[1]!.common, false);
  });

  test("percentage rounds down, never up", () => {
    const three = analyseDocument("One two three four five six\nSeven eight nine ten eleven twelve\nThirteen fourteen fifteen sixteen seventeen");
    const first = new Set(three.lines[0]!.hashes);
    const result = scoreDocument(three, (all) => new Map(all.map((h) => [h, first.has(h) ? 9 : 0])));
    assert.equal(result.percentage, 33);
  });
});

describe("scoreDocument with shared wording", () => {
  const doc = analyseDocument(
    [
      "Monitored vital signs and administered medications to patients on the ward.",
      "Mapped two hundred dabbawala handoffs across Dadar to find missing lunches.",
      "Tuned forty seven pressure cookers for the Sunday langar queue.",
    ].join("\n"),
  );
  const [reworded, original, other] = doc.lines;
  const none = () => new Map<string, number>();
  const wordingFrom = (seen: Set<string>) => (all: string[]) => new Map(all.map((h) => [h, seen.has(h) ? 3 : 0]));

  test("3-word phrases skip stop-word-only phrases", () => {
    const [line] = analyseDocument("worked in the office of the principal for two years").lines;
    assert.equal(line!.wordingHashes.includes(sha1("of the principal")), true);
    assert.equal(line!.wordingHashes.includes(sha1("in the office")), true);
    assert.equal(analyseDocument("it is in the of the and to be at the").lines[0]!.wordingHashes.length, 0);
  });

  test("a line is copied when half its wording is seen, even with no 5-word match", () => {
    const seen = new Set(reworded!.wordingHashes.slice(0, Math.ceil(reworded!.wordingHashes.length / 2)));
    const result = scoreDocument(doc, none, { wordingLookup: wordingFrom(seen) });
    assert.deepEqual(result.lines.map((line) => line.common), [true, false, false]);
  });

  test("wording seen in fewer than WORDING_MIN_DOC_COUNT documents doesn't count", () => {
    const result = scoreDocument(doc, none, { wordingLookup: (all) => new Map(all.map((h) => [h, SCORING.WORDING_MIN_DOC_COUNT - 1])) });
    assert.equal(result.commonCount, 0);
    assert.equal(result.percentage, 0);
  });

  test("tops up to the minimum with the line that overlaps most", () => {
    const seen = new Set([original!.wordingHashes[0]!, ...other!.wordingHashes.slice(0, 2)]);
    const result = scoreDocument(doc, none, { wordingLookup: wordingFrom(seen), minCommonLines: 1 });
    assert.deepEqual(result.lines.map((line) => line.common), [false, false, true]);
    assert.equal(result.commonCount, 1);
  });

  test("never highlights a line that shares nothing, even to reach the minimum", () => {
    const result = scoreDocument(doc, none, { wordingLookup: none, minCommonLines: 1 });
    assert.equal(result.commonCount, 0);
    assert.equal(result.percentage, 0);
  });

  test("percentage is the share of wording seen, and any overlap shows as at least 1%", () => {
    const all = doc.lines.flatMap((line) => line.wordingHashes);
    const half = scoreDocument(doc, none, { wordingLookup: wordingFrom(new Set(all.slice(0, Math.floor(all.length / 2)))) });
    assert.equal(half.percentage, Math.floor((Math.floor(all.length / 2) / new Set(all).size) * 100));
    const long = analyseDocument(Array.from({ length: 40 }, (_, i) => {
      const w = (k: number) => `w${String.fromCharCode(97 + (i % 26), 97 + (Math.floor(i / 26) % 26), 97 + k)}`;
      return [0, 1, 2, 3, 4].map(w).join(" ");
    }).join("\n"));
    const first = long.lines[0]!.wordingHashes[0]!;
    const tiny = scoreDocument(long, none, { wordingLookup: wordingFrom(new Set([first])) });
    assert.equal(tiny.percentage, 1); // 1 of 120 phrases rounds down to 0, but overlap exists
  });

  test("without a wording lookup, only exact phrases count (Compare)", () => {
    const result = scoreDocument(doc, none, { minCommonLines: 1 });
    assert.equal(result.commonCount, 0);
  });
});
