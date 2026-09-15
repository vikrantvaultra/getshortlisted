import { createHash } from "node:crypto";
import { SCORING } from "@/config";
import { displayLine, isListLine, normaliseLine, splitIntoLines, stripContactDetails } from "./text";

export type AnalysedLine = {
  /** Original line (contact details removed) for display. */
  text: string;
  normalised: string;
  shingles: string[];
  /** sha1(shingle), same order as `shingles`. */
  hashes: string[];
};

export type DocumentAnalysis = {
  /** Only lines that are scored (≥ MIN_LINE_WORDS words, not a list). */
  lines: AnalysedLine[];
  /** Lines seen but not scored — kept only as a count. */
  skippedLineCount: number;
};

export function sha1(value: string): string {
  return createHash("sha1").update(value).digest("hex");
}

export function shingle(words: string[], size: number = SCORING.SHINGLE_SIZE): string[] {
  if (words.length < size) return [];
  const out: string[] = [];
  for (let i = 0; i + size <= words.length; i++) out.push(words.slice(i, i + size).join(" "));
  return out;
}

/** The one pipeline: raw text → normalised, shingled, hashed lines. */
export function analyseDocument(rawText: string): DocumentAnalysis {
  const lines: AnalysedLine[] = [];
  let skippedLineCount = 0;

  for (const rawLine of splitIntoLines(stripContactDetails(rawText))) {
    const normalised = normaliseLine(rawLine);
    const words = normalised ? normalised.split(" ") : [];
    if (words.length < SCORING.MIN_LINE_WORDS || isListLine(rawLine)) {
      skippedLineCount++;
      continue;
    }
    const shingles = shingle(words);
    lines.push({ text: displayLine(rawLine), normalised, shingles, hashes: shingles.map(sha1) });
  }

  return { lines, skippedLineCount };
}

/**
 * Unique phrase hashes in a document. Indexing increments each phrase's
 * doc_count by one per document — never once per occurrence.
 */
export function documentPhrases(analysis: DocumentAnalysis): Map<string, string> {
  const phrases = new Map<string, string>();
  for (const line of analysis.lines) {
    line.hashes.forEach((hash, i) => {
      if (!phrases.has(hash)) phrases.set(hash, line.shingles[i]!);
    });
  }
  return phrases;
}
