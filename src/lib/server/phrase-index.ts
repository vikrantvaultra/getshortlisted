import { SCORING } from "@/config";
import { analyseDocument, documentPhrases, documentWording } from "@/lib/scoring/analyse";
import {
  emptyMeta,
  INDEX_FILES,
  lookupCount,
  phraseKey,
  readIndexMeta,
  readPhraseTable,
  totalDocuments,
  type PhraseIndexMeta,
  type PhraseTable,
} from "@/lib/scoring/index-file";
import { store } from "./store";

/**
 * Runtime view of the phrase index = committed index (data/index/phrase-index.{json,bin}
 * and wording-index.bin, loaded once per server process) + in-memory overlay
 * from approved submissions. In the overlay, 3-word phrase hashes carry a
 * WORDING_PREFIX so both kinds share one map and one undo list.
 */

const WORDING_PREFIX = "w:";
const EMPTY_TABLE: PhraseTable = { keys: new Float64Array(0), counts: new Uint32Array(0) };

let loaded: { meta: PhraseIndexMeta; table: PhraseTable; wording: PhraseTable } | null = null;

function index() {
  if (!loaded) {
    try {
      loaded = {
        meta: readIndexMeta(SCORING.SHINGLE_SIZE),
        table: readPhraseTable(),
        wording: readPhraseTable(INDEX_FILES.wording),
      };
    } catch (error) {
      console.warn(`[index] could not load the phrase index — run \`npm run corpus:ingest\`. (${error instanceof Error ? error.message : error})`);
      loaded = { meta: emptyMeta(SCORING.SHINGLE_SIZE), table: EMPTY_TABLE, wording: EMPTY_TABLE };
    }
    if (!loaded.wording.keys.length) {
      console.warn("[index] no wording index (wording-index.bin) — run `npm run corpus:ingest`. Only exact 5-word matches will count.");
    }
    if (SCORING.MIN_DOC_COUNT < loaded.meta.storedMinDocCount) {
      console.warn(`[index] SCORING.MIN_DOC_COUNT is below the stored threshold (${loaded.meta.storedMinDocCount}); rarer phrases aren't in the index.`);
    }
  }
  return loaded;
}

function lookupIn(table: PhraseTable, prefix: string, hashes: string[]): Map<string, number> {
  const overlay = store().phraseOverlay;
  const counts = new Map<string, number>();
  for (const hash of hashes) {
    const total = lookupCount(table, phraseKey(hash)) + (overlay.get(prefix + hash) ?? 0);
    if (total > 0) counts.set(hash, total);
  }
  return counts;
}

export function lookupDocCounts(hashes: string[]): Map<string, number> {
  return lookupIn(index().table, "", hashes);
}

/** Document counts for 3-word phrases (AnalysedLine.wordingHashes). */
export function lookupWordingCounts(hashes: string[]): Map<string, number> {
  return lookupIn(index().wording, WORDING_PREFIX, hashes);
}

/** How the Twin Score scores a resume: exact phrases, shared wording, and at least one highlighted line. */
export const TWIN_SCORE_OPTIONS = { wordingLookup: lookupWordingCounts, minCommonLines: SCORING.MIN_COPIED_LINES };

/** Overlay entries added for a submission; the 5-word ones are unprefixed. */
export function countIndexedPhrases(hashes: string[]): number {
  return hashes.filter((hash) => !hash.startsWith(WORDING_PREFIX)).length;
}

export type IndexStats = {
  totalDocuments: number;
  /** Generated reference resumes. */
  seedDocuments: number;
  /** Real resumes from openly licensed public datasets. */
  openRealDocuments: number;
  /** AI-generated / template resumes from openly licensed public datasets. */
  openSyntheticDocuments: number;
  verifiedDocuments: number;
  sampleDocuments: number;
  updatedAt: string | null;
};

export function indexStats(): IndexStats {
  const { verified, sample } = store().overlayDocuments;
  const { meta } = index();
  return {
    totalDocuments: totalDocuments(meta.documents) + verified + sample,
    seedDocuments: meta.documents.seed,
    openRealDocuments: meta.documents.openReal,
    openSyntheticDocuments: meta.documents.openSynthetic,
    verifiedDocuments: verified,
    sampleDocuments: sample,
    updatedAt: meta.updatedAt,
  };
}

/** Same pipeline as ingest, source='submission'. Returns the hashes added so deletion can undo exactly this. */
export function indexSubmissionText(text: string, kind: "verified" | "sample"): string[] {
  const analysis = analyseDocument(text);
  const hashes = [
    ...documentPhrases(analysis).keys(),
    ...[...documentWording(analysis)].map((hash) => WORDING_PREFIX + hash),
  ];
  const overlay = store().phraseOverlay;
  for (const hash of hashes) overlay.set(hash, (overlay.get(hash) ?? 0) + 1);
  store().overlayDocuments[kind]++;
  return hashes;
}

export function unindexSubmission(hashes: string[], kind: "verified" | "sample") {
  const overlay = store().phraseOverlay;
  for (const hash of hashes) {
    const next = (overlay.get(hash) ?? 0) - 1;
    if (next > 0) overlay.set(hash, next);
    else overlay.delete(hash);
  }
  store().overlayDocuments[kind] = Math.max(0, store().overlayDocuments[kind] - 1);
}
