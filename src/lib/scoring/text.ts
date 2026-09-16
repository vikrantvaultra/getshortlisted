import { SCORING } from "@/config";

/**
 * Text → scored lines. This module and ./analyse.ts are THE pipeline: the
 * Twin Score route, the ingest script, submission indexing and deletion all
 * go through them. Never re-implement any of this elsewhere — if two paths
 * normalise differently, every score becomes meaningless.
 *
 * Order matters and deviates slightly from a naive reading of the spec:
 * contact details are stripped and lines are split BEFORE normalising,
 * because normalising collapses newlines and strips the punctuation that
 * sentence splitting needs.
 */

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|org|dev|me|co)\b(?:\/\S*)?/gi;
// (.net/.io/.js are deliberately absent so "ASP.NET", "Socket.io", "Node.js" survive.)
// Indian and international phone numbers: +91 98765 43210, 098765-43210, (022) 2345 6789
const PHONE = /(?:\+?\d{1,3}[\s-]?)?(?:\(\d{2,5}\)[\s-]?)?\d{3,5}[\s-]?\d{3,5}(?:[\s-]?\d{2,4})?/g;

const BULLET_GLYPHS = /[•●▪◦■□◆◇►▸➢➤✓✔❖∙·]/g;
const LEADING_MARKER = /^\s*(?:[-*–—>]|\d{1,2}[.)])\s+/;

/** Removes emails, URLs and phone numbers entirely. */
export function stripContactDetails(raw: string): string {
  return raw
    .replace(EMAIL, " ")
    .replace(URL_PATTERN, " ")
    .replace(PHONE, (match) => {
      // Only strip digit runs long enough to be a phone number; leave "2019 – 2023" and "8.5 CGPA" alone.
      const digits = match.replace(/\D/g, "");
      return digits.length >= 10 ? " " : match;
    });
}

/**
 * Splits raw text into candidate lines: newlines, inline bullet glyphs, and
 * sentence boundaries. Also re-joins PDF soft wraps (a line that continues
 * in lowercase on the next line).
 */
export function splitIntoLines(raw: string): string[] {
  const physical = raw
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/\t/g, " ")
    .replace(BULLET_GLYPHS, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const joined: string[] = [];
  for (const line of physical) {
    const previous = joined[joined.length - 1];
    const continuesPrevious =
      previous !== undefined &&
      /^[a-z(]/.test(line) &&
      !LEADING_MARKER.test(line) &&
      !/[.!?:;]$/.test(previous);
    if (continuesPrevious) joined[joined.length - 1] = `${previous} ${line}`;
    else joined.push(line.replace(LEADING_MARKER, ""));
  }

  return joined
    .flatMap((line) => line.split(/(?<=[a-z0-9)%][.!?;])\s+(?=[A-Z])/))
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Lowercase, numbers → "#", punctuation stripped, whitespace collapsed.
 * "Improved API latency by 40% (from 1.2s)" → "improved api latency by # from #s"
 */
export function normaliseLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/\d+(?:[.,:/–-]\d+)*/g, " # ")
    .replace(/[^\p{L}\p{N}#]+/gu, " ")
    .replace(/#(?:\s+#)+/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set(
  "a an the and or of in on at to for with by from as is are was were be been i my me we our you your it its this that these those into over under per up about # s".split(" "),
);

/** "in the #", "to be a": phrases every text shares, so they never count as shared wording. */
export function isStopPhrase(normalisedPhrase: string): boolean {
  return normalisedPhrase.split(" ").every((word) => STOP_WORDS.has(word));
}

/** "Python, Java, SQL, Git, Docker" or "React | Node | MongoDB | AWS" */
export function isListLine(rawLine: string): boolean {
  if (!SCORING.DROP_LIST_LINES) return false;
  const labelled = /^[^,:]{2,30}:/.test(rawLine); // "Languages Known: English, Tamil, Hindi"
  const body = labelled ? rawLine.slice(rawLine.indexOf(":") + 1) : rawLine;
  const items = body.split(/[,|/]/).map((item) => item.trim()).filter(Boolean);
  // A "Label:" prefix is strong evidence of a list, so one fewer separator is enough.
  if (items.length - 1 < SCORING.LIST_MIN_SEPARATORS - (labelled ? 1 : 0)) return false;
  const wordsPerItem = items.reduce((sum, item) => sum + item.split(/\s+/).length, 0) / items.length;
  return wordsPerItem <= SCORING.LIST_MAX_WORDS_PER_ITEM;
}

/** The text shown back to the user (and on the share card) for a line. */
export function displayLine(rawLine: string): string {
  return rawLine.replace(/\s+/g, " ").trim();
}
