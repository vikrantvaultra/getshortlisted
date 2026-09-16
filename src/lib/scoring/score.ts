import { SCORING } from "@/config";
import type { DocumentAnalysis } from "./analyse";

export type LineVerdict = {
  text: string;
  common: boolean;
  /** Share of this line's shingles seen in ≥ MIN_DOC_COUNT documents, 0–1. */
  seenRatio: number;
  /** Share of this line's 3-word phrases seen in ≥ WORDING_MIN_DOC_COUNT documents, 0–1 (0 without a wording lookup). */
  wordingRatio: number;
  /** Documents containing this line's most common 5-word phrase. */
  peakDocCount: number;
};

export type ScoreResult = {
  /** Lines that already appear in the index. The headline. */
  commonCount: number;
  /** Lines scored. */
  totalCount: number;
  /**
   * Secondary only. With a wording lookup: the share of the resume's 3-word
   * phrases already seen; otherwise the share of common lines. Whole number,
   * rounded down so it never overstates — except that any real overlap shows
   * as at least 1%.
   */
  percentage: number;
  lines: LineVerdict[];
  phraseCount: number;
  matchedPhraseCount: number;
};

export type DocCountLookup = (hashes: string[]) => Map<string, number>;

export type ScoreOptions = {
  minDocCount?: number;
  commonLineRatio?: number;
  /** Counts for 3-word phrases. Without it only exact 5-word matches count (Compare does this). */
  wordingLookup?: DocCountLookup;
  /** Lines to highlight at minimum, taken from the lines with the most real overlap. */
  minCommonLines?: number;
};

export function scoreDocument(
  analysis: DocumentAnalysis,
  lookup: DocCountLookup,
  options: ScoreOptions = {},
): ScoreResult {
  const minDocCount = options.minDocCount ?? SCORING.MIN_DOC_COUNT;
  const commonLineRatio = options.commonLineRatio ?? SCORING.COMMON_LINE_RATIO;
  const minCommonLines = options.minCommonLines ?? 0;

  // One batch lookup for every hash in the document.
  const allHashes = [...new Set(analysis.lines.flatMap((line) => line.hashes))];
  const counts = lookup(allHashes);
  const allWording = options.wordingLookup ? [...new Set(analysis.lines.flatMap((line) => line.wordingHashes))] : [];
  const wordingCounts = options.wordingLookup ? options.wordingLookup(allWording) : new Map<string, number>();
  const wordingSeen = (hash: string) => (wordingCounts.get(hash) ?? 0) >= SCORING.WORDING_MIN_DOC_COUNT;

  let matchedPhraseCount = 0;
  for (const hash of allHashes) if ((counts.get(hash) ?? 0) >= minDocCount) matchedPhraseCount++;

  const lines = analysis.lines.map((line): LineVerdict => {
    const seen = line.hashes.filter((hash) => (counts.get(hash) ?? 0) >= minDocCount).length;
    const seenRatio = line.hashes.length ? seen / line.hashes.length : 0;
    const wordingRatio =
      options.wordingLookup && line.wordingHashes.length ? line.wordingHashes.filter(wordingSeen).length / line.wordingHashes.length : 0;
    const peakDocCount = Math.max(0, ...line.hashes.map((hash) => counts.get(hash) ?? 0));
    const common = seenRatio >= commonLineRatio || (options.wordingLookup !== undefined && wordingRatio >= SCORING.WORDING_LINE_RATIO);
    return { text: line.text, common, seenRatio, wordingRatio, peakDocCount };
  });

  // Top up to the minimum with the lines that overlap most — never with a line that shares nothing.
  const missing = minCommonLines - lines.filter((line) => line.common).length;
  if (missing > 0) {
    const overlap = (line: LineVerdict) => Math.max(line.seenRatio, line.wordingRatio);
    lines
      .filter((line) => !line.common && overlap(line) > 0)
      .sort((a, b) => overlap(b) - overlap(a) || b.peakDocCount - a.peakDocCount)
      .slice(0, missing)
      .forEach((line) => (line.common = true));
  }

  const commonCount = lines.filter((line) => line.common).length;
  const totalCount = lines.length;
  const seenWording = allWording.filter(wordingSeen).length;
  const share = options.wordingLookup
    ? allWording.length ? seenWording / allWording.length : 0
    : totalCount ? commonCount / totalCount : 0;

  return {
    commonCount,
    totalCount,
    percentage: share > 0 || commonCount > 0 ? Math.max(1, Math.floor(share * 100)) : 0,
    lines,
    phraseCount: allHashes.length,
    matchedPhraseCount,
  };
}
