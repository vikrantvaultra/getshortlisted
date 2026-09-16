/**
 * Builds the phrase index (data/index/*) from every file in ./corpus.
 *
 *   npm run corpus:ingest
 *   npm run corpus:ingest -- --dir ./somewhere-else
 *
 * Generated resumes live at the top level of ./corpus; openly licensed datasets
 * in ./corpus/open/<source>/ (see scripts/import-open-resumes.ts). Folders
 * starting with "_" (download caches) are ignored.
 *
 * Every run recounts all files, so counts are always exact and adding or
 * removing a dataset can never double-count anything. (--rebuild is accepted
 * for compatibility; it's what every run does.) Identical files are counted once.
 *
 * Uses the exact pipeline the resume check uses (src/lib/scoring).
 * Never prints file contents — only counts and the most common phrases.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { SCORING } from "../src/config";
import { extractCorpusFile } from "../src/lib/extract/extract";
import { analyseDocument, documentPhrases, documentWording, sha1 } from "../src/lib/scoring/analyse";
import {
  INDEX_FILES,
  looksLikeHeading,
  PHRASE_TEXT_MIN_DOCS,
  STORED_MIN_DOC_COUNT,
  WORDING_STORED_MIN_DOC_COUNT,
  phraseKey,
  phraseKeyHex,
  printSummary,
  readIngestedFiles,
  readOpenSources,
  summariseIndex,
  writeIndexFiles,
  writeTopLines,
  type CorpusSource,
  type IngestedFile,
  type PhraseIndexMeta,
} from "../src/lib/scoring/index-file";

const SUPPORTED = /\.(txt|md|pdf|docx)$/i;
const TOP_LINES = 25;
/** Whole-line text is remembered only once a line is this common. */
const TOP_LINE_TEXT_MIN_DOCS = 20;

/** Counts keyed by 48-bit numbers, split across 256 Maps (a single Map tops out near 16.7M entries). */
class ShardedCounter {
  private shards = Array.from({ length: 256 }, () => new Map<number, number>());
  increment(key: number): number {
    const shard = this.shards[Math.floor(key / 2 ** 40) & 0xff]!;
    const next = (shard.get(key) ?? 0) + 1;
    shard.set(key, next);
    return next;
  }
  get size() {
    return this.shards.reduce((sum, shard) => sum + shard.size, 0);
  }
  *entries(): Generator<[number, number]> {
    for (const shard of this.shards) yield* shard;
  }
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  if (SCORING.MIN_DOC_COUNT < STORED_MIN_DOC_COUNT) {
    console.error(`SCORING.MIN_DOC_COUNT (${SCORING.MIN_DOC_COUNT}) is below the stored threshold (${STORED_MIN_DOC_COUNT}).`);
    process.exit(1);
  }
  if (SCORING.WORDING_MIN_DOC_COUNT < WORDING_STORED_MIN_DOC_COUNT) {
    console.error(`SCORING.WORDING_MIN_DOC_COUNT (${SCORING.WORDING_MIN_DOC_COUNT}) is below the stored threshold (${WORDING_STORED_MIN_DOC_COUNT}).`);
    process.exit(1);
  }
  const corpusDir = path.resolve(argValue("--dir") ?? "corpus");

  const walk = (dir: string, prefix = ""): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) return [];
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return walk(path.join(dir, entry.name), relative);
      return entry.isFile() && SUPPORTED.test(entry.name) ? [relative] : [];
    });

  let files: string[];
  try {
    files = walk(corpusDir).sort();
  } catch {
    console.error(`No corpus directory at ${corpusDir}. Create it and add .txt/.md/.pdf/.docx files.`);
    process.exit(1);
  }

  const openKinds = new Map((readOpenSources()?.sources ?? []).map((source) => [source.slug, source.kind]));
  const sourceOf = (fileName: string): CorpusSource => {
    const match = fileName.match(/^open\/([^/]+)\//);
    if (!match) return "generated";
    return openKinds.get(match[1]!) === "real" ? "open-real" : "open-synthetic";
  };

  const previous = new Set(readIngestedFiles().map((file) => file.contentHash));
  const phraseCounts = new ShardedCounter();
  const phraseText = new Map<number, string>();
  const wordingCounts = new ShardedCounter();
  const lineCounts = new ShardedCounter();
  const lineText = new Map<number, string>();
  const seenContent = new Set<string>();
  const ingested: IngestedFile[] = [];
  const documents = { seed: 0, openReal: 0, openSynthetic: 0 };
  let duplicates = 0;
  let failed = 0;
  let newFiles = 0;
  const started = Date.now();

  console.log(`Indexing ${files.length.toLocaleString("en-IN")} files from ${corpusDir}`);

  for (const fileName of files) {
    const bytes = new Uint8Array(readFileSync(path.join(corpusDir, fileName)));
    const contentHash = createHash("sha256").update(bytes).digest("hex");
    if (seenContent.has(contentHash)) {
      duplicates++;
      continue;
    }
    seenContent.add(contentHash);

    try {
      const { text } = await extractCorpusFile(bytes, fileName);
      const analysis = analyseDocument(text);

      const phrases = documentPhrases(analysis);
      for (const [hash, phrase] of phrases) {
        const key = phraseKey(hash);
        if (phraseCounts.increment(key) === PHRASE_TEXT_MIN_DOCS) phraseText.set(key, phrase);
      }

      for (const hash of documentWording(analysis)) wordingCounts.increment(phraseKey(hash));

      const lines = new Map(analysis.lines.map((line) => [line.normalised, line.text]));
      for (const [normalised, display] of lines) {
        const key = phraseKey(sha1(normalised));
        if (lineCounts.increment(key) === TOP_LINE_TEXT_MIN_DOCS) lineText.set(key, display);
      }

      const source = sourceOf(fileName);
      if (source === "open-real") documents.openReal++;
      else if (source === "open-synthetic") documents.openSynthetic++;
      else documents.seed++;
      if (!previous.has(contentHash)) newFiles++;
      ingested.push({ fileName, contentHash, source, ingestedAt: new Date().toISOString(), phraseCount: phrases.size });

      if (ingested.length % 10_000 === 0) {
        const heap = Math.round(process.memoryUsage().heapUsed / 1e6);
        console.log(`  … ${ingested.length.toLocaleString("en-IN")} documents · ${Math.round((Date.now() - started) / 1000)}s · ${heap} MB`);
      }
    } catch (error) {
      failed++;
      console.warn(`  ! ${fileName}: ${error instanceof Error ? error.message : "could not be read"}`);
    }
  }

  const { keys, counts } = storedTable(phraseCounts, STORED_MIN_DOC_COUNT);
  const wording = storedTable(wordingCounts, WORDING_STORED_MIN_DOC_COUNT);

  const meta: PhraseIndexMeta = {
    version: 2,
    shingleSize: SCORING.SHINGLE_SIZE,
    updatedAt: new Date().toISOString(),
    documents,
    uniquePhrases: phraseCounts.size,
    storedPhrases: keys.length,
    storedMinDocCount: STORED_MIN_DOC_COUNT,
    wording: {
      shingleSize: SCORING.WORDING_SHINGLE_SIZE,
      uniquePhrases: wordingCounts.size,
      storedPhrases: wording.keys.length,
      storedMinDocCount: WORDING_STORED_MIN_DOC_COUNT,
    },
  };
  writeIndexFiles(meta, { keys, counts }, wording, phraseText, ingested);

  const commonLines: [number, number][] = [];
  for (const [key, count] of lineCounts.entries()) {
    const text = lineText.get(key);
    if (count >= TOP_LINE_TEXT_MIN_DOCS && text && !looksLikeHeading(text)) commonLines.push([key, count]);
  }
  const topLines = commonLines
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LINES)
    .map(([key, count]) => ({ text: lineText.get(key)!, docCount: count }));
  writeTopLines({ updatedAt: meta.updatedAt!, documents: ingested.length, lines: topLines });

  console.log("");
  console.log(`  Took                      ${Math.round((Date.now() - started) / 1000)}s`);
  console.log(`  New since last run        ${newFiles.toLocaleString("en-IN")}`);
  if (duplicates) console.log(`  Identical files skipped   ${duplicates.toLocaleString("en-IN")}`);
  if (failed) console.log(`  Failed                    ${failed}`);
  const text = Object.fromEntries([...phraseText].map(([key, phrase]) => [phraseKeyHex(key), phrase]));
  printSummary(summariseIndex(meta, { keys, counts }, text));
  console.log(`  Wrote ${path.relative(process.cwd(), INDEX_FILES.binary)} (${((12 * keys.length) / 1e6).toFixed(1)} MB)`);
  console.log(`  Wrote ${path.relative(process.cwd(), INDEX_FILES.wording)} (${((12 * wording.keys.length) / 1e6).toFixed(1)} MB)`);
}

/** Keeps only phrases that can ever count as "seen", sorted by key for binary search. */
function storedTable(counter: ShardedCounter, minDocCount: number) {
  const stored: [number, number][] = [];
  for (const entry of counter.entries()) if (entry[1] >= minDocCount) stored.push(entry);
  stored.sort((a, b) => a[0] - b[0]);
  const keys = new Float64Array(stored.length);
  const counts = new Uint32Array(stored.length);
  stored.forEach(([key, count], i) => {
    keys[i] = key;
    counts[i] = count;
  });
  return { keys, counts };
}

main();
