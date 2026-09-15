import { SCORING } from "@/config";
import type { DocumentAnalysis } from "./analyse";

export type LineVerdict = {
  text: string;
  common: boolean;
  /** Share of this line's shingles seen in ≥ MIN_DOC_COUNT documents, 0–1. */
  seenRatio: number;
  /** Documents containing this line's most common 5-word phrase. */
  peakDocCount: number;
};

export type ScoreResult = {
  /** Lines that already appear in the index. The headline. */
  commonCount: number;
  /** Lines scored. */
  totalCount: number;
  /** Secondary only. Whole number, rounded down so it never overstates. */
  percentage: number;
  lines: LineVerdict[];
  phraseCount: number;
  matchedPhraseCount: number;
};

export type DocCountLookup = (hashes: string[]) => Map<string, number>;

export type ScoreOptions = {
  minDocCount?: number;
  commonLineRatio?: number;
};

export function scoreDocument(
  analysis: DocumentAnalysis,
  lookup: DocCountLookup,
  options: ScoreOptions = {},
): ScoreResult {
  const minDocCount = options.minDocCount ?? SCORING.MIN_DOC_COUNT;
  const commonLineRatio = options.commonLineRatio ?? SCORING.COMMON_LINE_RATIO;

  // One batch lookup for every hash in the document.
  const allHashes = [...new Set(analysis.lines.flatMap((line) => line.hashes))];
  const counts = lookup(allHashes);

  let matchedPhraseCount = 0;
  for (const hash of allHashes) if ((counts.get(hash) ?? 0) >= minDocCount) matchedPhraseCount++;

  const lines = analysis.lines.map((line): LineVerdict => {
    const seen = line.hashes.filter((hash) => (counts.get(hash) ?? 0) >= minDocCount).length;
    const seenRatio = line.hashes.length ? seen / line.hashes.length : 0;
    const peakDocCount = Math.max(0, ...line.hashes.map((hash) => counts.get(hash) ?? 0));
    return { text: line.text, common: seenRatio >= commonLineRatio, seenRatio, peakDocCount };
  });

  const commonCount = lines.filter((line) => line.common).length;
  const totalCount = lines.length;

  return {
    commonCount,
    totalCount,
    percentage: totalCount ? Math.floor((commonCount / totalCount) * 100) : 0,
    lines,
    phraseCount: allHashes.length,
    matchedPhraseCount,
  };
}
