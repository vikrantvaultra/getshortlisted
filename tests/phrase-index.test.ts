import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { SCORING } from "../src/config";
import { analyseDocument, sha1 } from "../src/lib/scoring/analyse";
import {
  INDEX_FILES,
  lookupCount,
  looksLikeHeading,
  phraseKey,
  phraseKeyHex,
  readIndexMeta,
  readPhraseTable,
  totalDocuments,
} from "../src/lib/scoring/index-file";
import { scoreDocument } from "../src/lib/scoring/score";
import { lookupDocCounts, TWIN_SCORE_OPTIONS } from "../src/lib/server/phrase-index";
import { HOLDOUT_RESUMES } from "./fixtures/holdout-resumes";
import { INDIAN_RESUMES } from "./fixtures/indian-resumes";

describe("phrase keys", () => {
  test("are the first 48 bits of the sha1 hex digest, exact as numbers", () => {
    const hash = sha1("collaborated with cross functional teams");
    const key = phraseKey(hash);
    assert.ok(Number.isSafeInteger(key));
    assert.equal(phraseKeyHex(key), hash.slice(0, 12));
  });
});

describe("lookupCount (binary search)", () => {
  const keys = new Float64Array([3, 10, 42, 2 ** 47, 2 ** 48 - 1]);
  const counts = new Uint32Array([7, 2, 99, 5, 12]);
  const table = { keys, counts };

  test("finds every stored key", () => {
    keys.forEach((key, i) => assert.equal(lookupCount(table, key), counts[i]));
  });
  test("returns 0 for keys that aren't stored", () => {
    for (const key of [0, 4, 11, 43, 2 ** 47 + 1]) assert.equal(lookupCount(table, key), 0);
  });
  test("handles an empty table", () => {
    assert.equal(lookupCount({ keys: new Float64Array(0), counts: new Uint32Array(0) }, 5), 0);
  });
});

describe("looksLikeHeading", () => {
  test("flags section headings", () => {
    assert.equal(looksLikeHeading("Extracurricular Activities and Volunteering Opportunities"), true);
    assert.equal(looksLikeHeading("# Professional Background"), true);
  });
  test("keeps real lines", () => {
    assert.equal(looksLikeHeading("Collaborated with cross-functional teams to define, design and ship new features."), false);
    assert.equal(looksLikeHeading("Python for Everybody Specialization by University of Michigan on Coursera"), false);
  });
});

describe("committed index", { skip: !existsSync(INDEX_FILES.binary) && "index not built" }, () => {
  const meta = readIndexMeta(SCORING.SHINGLE_SIZE);
  const table = readPhraseTable();

  test("metadata matches the binary file", () => {
    assert.equal(meta.version, 2);
    assert.equal(table.keys.length, meta.storedPhrases);
    assert.ok(totalDocuments(meta.documents) > 0);
  });

  test("keys are strictly sorted and counts meet the stored threshold", () => {
    for (let i = 1; i < table.keys.length; i += 997) assert.ok(table.keys[i - 1]! < table.keys[i]!);
    for (let i = 0; i < table.counts.length; i += 997) assert.ok(table.counts[i]! >= meta.storedMinDocCount);
  });

  test("a well-known cliché is found; a unique sentence is not", () => {
    const [cliche] = analyseDocument("Collaborated with cross-functional teams to define, design and ship new features.").lines;
    const common = cliche!.hashes.map((hash) => lookupCount(table, phraseKey(hash)));
    assert.ok(common.every((count) => count >= 1000), `expected high counts, got ${common}`);

    const [unique] = analyseDocument("Mapped 212 dabbawala handoffs across four Dadar stations to find where lunches went missing.").lines;
    const rare = unique!.hashes.map((hash) => lookupCount(table, phraseKey(hash)));
    assert.ok(rare.filter((count) => count > 0).length <= 1, `expected almost no matches, got ${rare}`);
  });

  test("the wording table matches its metadata and threshold", () => {
    const wording = readPhraseTable(INDEX_FILES.wording);
    assert.ok(meta.wording, "phrase-index.json has no wording section — run `npm run corpus:ingest`");
    assert.equal(meta.wording.shingleSize, SCORING.WORDING_SHINGLE_SIZE);
    assert.equal(wording.keys.length, meta.wording.storedPhrases);
    assert.ok(SCORING.WORDING_MIN_DOC_COUNT >= meta.wording.storedMinDocCount);
    for (let i = 1; i < wording.keys.length; i += 997) assert.ok(wording.keys[i - 1]! < wording.keys[i]!);
    for (let i = 0; i < wording.counts.length; i += 997) assert.ok(wording.counts[i]! >= meta.wording.storedMinDocCount);
  });
});

describe("Twin Score against the committed index", { skip: !existsSync(INDEX_FILES.wording) && "index not built" }, () => {
  test("every realistic resume gets at least one copied line and a non-zero already-seen share", () => {
    const resumes = [
      ...["fresher", "experienced", "nurse", "accountant"].map((name) => ({ name, text: readFileSync(`fixtures/${name}-resume.txt`, "utf8") })),
      ...INDIAN_RESUMES,
      ...HOLDOUT_RESUMES,
    ];
    for (const { name, text } of resumes) {
      const result = scoreDocument(analyseDocument(text), lookupDocCounts, TWIN_SCORE_OPTIONS);
      assert.ok(result.commonCount >= 1, `${name}: ${result.commonCount}/${result.totalCount}`);
      assert.ok(result.percentage >= 1, `${name}: ${result.percentage}%`);
    }
  });

  test("a template resume still reads as mostly copied", () => {
    const result = scoreDocument(analyseDocument(readFileSync("fixtures/fresher-resume.txt", "utf8")), lookupDocCounts, TWIN_SCORE_OPTIONS);
    assert.ok(result.commonCount / result.totalCount >= 0.5, `${result.commonCount}/${result.totalCount}`);
  });
});
