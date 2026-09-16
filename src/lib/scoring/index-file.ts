import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * The phrase index is a set of files committed to the repo, not a database.
 * `npm run corpus:ingest` writes them; the app reads the first two at runtime.
 * Approved submissions are layered on top in memory (src/lib/server/phrase-index.ts).
 *
 *   phrase-index.json    metadata: document counts by source, sizes, thresholds
 *   phrase-index.bin     sorted 48-bit phrase keys + doc counts (binary search)
 *   phrase-text.json     key → normalised phrase, common phrases only (stats script)
 *   ingested-files.json  every corpus file counted, with source + content hash
 *   top-lines.json       most repeated whole lines (home page)
 *   open-sources.json    openly licensed datasets imported
 *
 * Why binary: real resumes produce ~20M distinct phrases. Only phrases seen in
 * ≥ STORED_MIN_DOC_COUNT documents can ever mark a line as common, and those
 * (~3M) are stored as 12 bytes each — tens of MB instead of hundreds as JSON.
 * A phrase key is the first 48 bits of sha1(phrase); with tens of millions of
 * phrases the expected number of key collisions is below one.
 */

export const INDEX_DIR = path.join(process.cwd(), "data", "index");
export const INDEX_FILES = {
  meta: path.join(INDEX_DIR, "phrase-index.json"),
  binary: path.join(INDEX_DIR, "phrase-index.bin"),
  text: path.join(INDEX_DIR, "phrase-text.json"),
  ingested: path.join(INDEX_DIR, "ingested-files.json"),
  topLines: path.join(INDEX_DIR, "top-lines.json"),
};

export const OPEN_SOURCES_FILE = path.join(INDEX_DIR, "open-sources.json");

/** Phrases seen in fewer documents than this are not stored. SCORING.MIN_DOC_COUNT must be ≥ this. */
export const STORED_MIN_DOC_COUNT = 2;
/** Phrase text is kept only for phrases this common, so no rare fragment of one person's resume is written. */
export const PHRASE_TEXT_MIN_DOCS = 25;

const KEY_HEX_CHARS = 12; // 48 bits
const MAGIC = 0x49505347; // "GSPI"
const HEADER_BYTES = 16;

/** 48-bit key from a hex sha1 digest. Exact as a JS number (< 2^53). */
export function phraseKey(sha1Hex: string): number {
  return Number.parseInt(sha1Hex.slice(0, KEY_HEX_CHARS), 16);
}

export function phraseKeyHex(key: number): string {
  return key.toString(16).padStart(KEY_HEX_CHARS, "0");
}

// ─── Open datasets manifest ──────────────────────────────────────────────────

/** One openly licensed dataset imported by scripts/import-open-resumes.ts. */
export type OpenSourceEntry = {
  slug: string;
  dataset: string;
  url: string;
  license: string;
  /** "real": resumes written by people. "synthetic": AI-generated or template resumes. */
  kind: "real" | "synthetic";
  description: string;
  rows: number;
  kept: number;
  exactDuplicates: number;
  nearDuplicates: number;
  tooShort: number;
  domains: Record<string, number>;
};

export type OpenSourcesManifest = {
  updatedAt: string;
  nearDuplicateJaccard: number;
  sources: OpenSourceEntry[];
};

export function readOpenSources(): OpenSourcesManifest | null {
  return readJson<OpenSourcesManifest | null>(OPEN_SOURCES_FILE, null);
}

/** Where a corpus file came from, decided by its folder. */
export type CorpusSource = "generated" | "open-real" | "open-synthetic";

// ─── Top lines ───────────────────────────────────────────────────────────────

/** The most repeated whole lines across the corpus files, for the "most copied lines" list. */
export type TopLinesFile = {
  updatedAt: string;
  /** Corpus files the counts were taken from. */
  documents: number;
  lines: { text: string; docCount: number }[];
};

const HEADING_SMALL_WORDS = new Set(["and", "of", "the", "for", "in", "on", "to", "with", "&", "a", "an", "at", "by"]);

/**
 * Section headings ("Extracurricular Activities and Volunteering Opportunities")
 * aren't copied sentences: Title Case, no closing punctuation, short.
 */
export function looksLikeHeading(text: string): boolean {
  const trimmed = text.trim();
  if (/^#/.test(trimmed)) return true;
  if (/[.!?]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  return words.length <= 8 && words.every((word) => HEADING_SMALL_WORDS.has(word.toLowerCase()) || !/^[a-z]/.test(word));
}

export function readTopLines(): TopLinesFile | null {
  const file = readJson<TopLinesFile | null>(INDEX_FILES.topLines, null);
  return file && { ...file, lines: file.lines.filter((line) => !looksLikeHeading(line.text)) };
}

export function writeTopLines(file: TopLinesFile) {
  mkdirSync(INDEX_DIR, { recursive: true });
  writeFileSync(INDEX_FILES.topLines, JSON.stringify(file, null, 2));
}

// ─── Phrase index ────────────────────────────────────────────────────────────

export type DocumentCounts = { seed: number; openReal: number; openSynthetic: number };

export type PhraseIndexMeta = {
  version: 2;
  shingleSize: number;
  updatedAt: string | null;
  /** seed = generated reference resumes; openReal / openSynthetic = openly licensed datasets. */
  documents: DocumentCounts;
  /** Distinct phrases seen across all documents (including ones seen once). */
  uniquePhrases: number;
  /** Phrases stored in the binary file (doc count ≥ storedMinDocCount). */
  storedPhrases: number;
  storedMinDocCount: number;
};

export type PhraseTable = { keys: Float64Array; counts: Uint32Array };

export type IngestedFile = {
  fileName: string;
  contentHash: string;
  source: CorpusSource;
  ingestedAt: string;
  phraseCount: number;
};

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

export function emptyMeta(shingleSize: number): PhraseIndexMeta {
  return {
    version: 2,
    shingleSize,
    updatedAt: null,
    documents: { seed: 0, openReal: 0, openSynthetic: 0 },
    uniquePhrases: 0,
    storedPhrases: 0,
    storedMinDocCount: STORED_MIN_DOC_COUNT,
  };
}

export function readIndexMeta(shingleSize: number): PhraseIndexMeta {
  const meta = readJson<Partial<PhraseIndexMeta> & { version?: number }>(INDEX_FILES.meta, {});
  return meta.version === 2 ? (meta as PhraseIndexMeta) : emptyMeta(shingleSize);
}

/** Reads the binary table. The data is copied so typed-array views are correctly aligned. */
export function readPhraseTable(): PhraseTable {
  if (!existsSync(INDEX_FILES.binary)) return { keys: new Float64Array(0), counts: new Uint32Array(0) };
  const file = readFileSync(INDEX_FILES.binary);
  const header = new DataView(file.buffer, file.byteOffset, HEADER_BYTES);
  if (header.getUint32(0, true) !== MAGIC) throw new Error("phrase-index.bin is not a Get Shortlisted index");
  const count = header.getUint32(8, true);
  const keysBytes = count * 8;
  const keys = new Float64Array(count);
  const counts = new Uint32Array(count);
  new Uint8Array(keys.buffer).set(file.subarray(HEADER_BYTES, HEADER_BYTES + keysBytes));
  new Uint8Array(counts.buffer).set(file.subarray(HEADER_BYTES + keysBytes, HEADER_BYTES + keysBytes + count * 4));
  return { keys, counts };
}

/** Binary search. Returns 0 for phrases that aren't stored. */
export function lookupCount(table: PhraseTable, key: number): number {
  let low = 0;
  let high = table.keys.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const value = table.keys[mid]!;
    if (value === key) return table.counts[mid]!;
    if (value < key) low = mid + 1;
    else high = mid - 1;
  }
  return 0;
}

export function writeIndexFiles(meta: PhraseIndexMeta, table: PhraseTable, text: Map<number, string>, ingested: IngestedFile[]) {
  mkdirSync(INDEX_DIR, { recursive: true });
  const count = table.keys.length;
  const buffer = Buffer.alloc(HEADER_BYTES + count * 12);
  buffer.writeUInt32LE(MAGIC, 0);
  buffer.writeUInt32LE(2, 4);
  buffer.writeUInt32LE(count, 8);
  Buffer.from(table.keys.buffer, table.keys.byteOffset, count * 8).copy(buffer, HEADER_BYTES);
  Buffer.from(table.counts.buffer, table.counts.byteOffset, count * 4).copy(buffer, HEADER_BYTES + count * 8);
  writeFileSync(INDEX_FILES.binary, buffer);
  writeFileSync(INDEX_FILES.meta, JSON.stringify(meta, null, 2));
  writeFileSync(INDEX_FILES.text, JSON.stringify(Object.fromEntries([...text].map(([key, phrase]) => [phraseKeyHex(key), phrase]))));
  writeFileSync(INDEX_FILES.ingested, JSON.stringify(ingested));
}

export function readPhraseText(): Record<string, string> {
  return readJson(INDEX_FILES.text, {});
}

export function readIngestedFiles(): IngestedFile[] {
  return readJson(INDEX_FILES.ingested, []);
}

export function totalDocuments(documents: DocumentCounts): number {
  return documents.seed + documents.openReal + documents.openSynthetic;
}

// ─── Summary (scripts) ───────────────────────────────────────────────────────

export type IndexSummary = {
  documents: DocumentCounts;
  uniquePhrases: number;
  storedPhrases: number;
  topPhrases: { phrase: string; docCount: number }[];
};

export function summariseIndex(meta: PhraseIndexMeta, table: PhraseTable, text: Record<string, string>, topN = 10): IndexSummary {
  // Partial selection of the top N counts without sorting millions of entries.
  const top: { index: number; count: number }[] = [];
  for (let i = 0; i < table.counts.length; i++) {
    const count = table.counts[i]!;
    if (top.length < topN || count > top[top.length - 1]!.count) {
      top.push({ index: i, count });
      top.sort((a, b) => b.count - a.count);
      if (top.length > topN) top.pop();
    }
  }
  return {
    documents: meta.documents,
    uniquePhrases: meta.uniquePhrases,
    storedPhrases: meta.storedPhrases,
    topPhrases: top.map(({ index, count }) => ({
      phrase: text[phraseKeyHex(table.keys[index]!)] ?? "(phrase text not kept)",
      docCount: count,
    })),
  };
}

export function printSummary(summary: IndexSummary) {
  const n = (value: number) => value.toLocaleString("en-IN");
  const d = summary.documents;
  console.log("");
  console.log(`  Documents in index        ${n(totalDocuments(d))}`);
  console.log(`    generated reference     ${n(d.seed)}`);
  console.log(`    open datasets · real    ${n(d.openReal)}`);
  console.log(`    open datasets · AI      ${n(d.openSynthetic)}`);
  console.log(`  Distinct phrases          ${n(summary.uniquePhrases)}`);
  console.log(`  Phrases in ≥${STORED_MIN_DOC_COUNT} documents   ${n(summary.storedPhrases)}`);
  console.log("");
  console.log("  Ten most common phrases (doc_count · phrase)");
  for (const { phrase, docCount } of summary.topPhrases) {
    console.log(`    ${String(docCount).padStart(7)} · ${phrase}`);
  }
  console.log("");
}
