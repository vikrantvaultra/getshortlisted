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
