import { SCORING } from "@/config";
import { analyseDocument, documentPhrases } from "@/lib/scoring/analyse";
import {
  emptyMeta,
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
 * Runtime view of the phrase index = committed index (data/index/phrase-index.{json,bin},
 * loaded once per server process) + in-memory overlay from approved submissions.
 */

let loaded: { meta: PhraseIndexMeta; table: PhraseTable } | null = null;

function index() {
  if (!loaded) {
    try {
      loaded = { meta: readIndexMeta(SCORING.SHINGLE_SIZE), table: readPhraseTable() };
    } catch (error) {
      console.warn(`[index] could not load the phrase index — run \`npm run corpus:ingest\`. (${error instanceof Error ? error.message : error})`);
      loaded = { meta: emptyMeta(SCORING.SHINGLE_SIZE), table: { keys: new Float64Array(0), counts: new Uint32Array(0) } };
    }
    if (SCORING.MIN_DOC_COUNT < loaded.meta.storedMinDocCount) {
      console.warn(`[index] SCORING.MIN_DOC_COUNT is below the stored threshold (${loaded.meta.storedMinDocCount}); rarer phrases aren't in the index.`);
    }
  }
  return loaded;
}

export function lookupDocCounts(hashes: string[]): Map<string, number> {
  const { table } = index();
  const overlay = store().phraseOverlay;
  const counts = new Map<string, number>();
  for (const hash of hashes) {
    const total = lookupCount(table, phraseKey(hash)) + (overlay.get(hash) ?? 0);
    if (total > 0) counts.set(hash, total);
  }
  return counts;
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
  const hashes = [...documentPhrases(analyseDocument(text)).keys()];
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
