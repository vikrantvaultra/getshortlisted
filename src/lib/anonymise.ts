/**
 * Heuristic anonymisation for approved resumes. It produces a DRAFT: the
 * admin reviews and edits the redacted text before anything is published.
 *
 * Removes: name, phone, email, URLs, exact dates (keeps years), address,
 * personal-details rows common on Indian resumes (DOB, father's name,
 * marital status…), and the college name when supplied. Photos never
 * survive because only text is published.
 */

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+|\b(?:linkedin|github|gitlab|leetcode|behance|medium)\.com\/\S*/gi;
const PHONE = /(?:\+?91[\s-]?)?(?:\(?0\d{2,4}\)?[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\+?\d[\d\s-]{9,}\d/g;

const MONTHS =
  "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const DAY_MONTH_YEAR = new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?[\\s-]+(?:${MONTHS})[,\\s-]+((?:19|20)\\d{2})\\b`, "gi");
const MONTH_DAY_YEAR = new RegExp(`\\b(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+((?:19|20)\\d{2})\\b`, "gi");
const MONTH_YEAR = new RegExp(`\\b(?:${MONTHS})\\.?[\\s'-]*((?:19|20)\\d{2})\\b`, "gi");
const NUMERIC_DATE = /\b\d{1,2}[/.-]\d{1,2}[/.-]((?:19|20)\d{2})\b/g;
const NUMERIC_MONTH_YEAR = /\b(?:0?[1-9]|1[0-2])[/.-]((?:19|20)\d{2})\b/g;

const PERSONAL_ROW =
  /^\s*(?:date of birth|dob|d\.o\.b|father'?s? name|mother'?s? name|husband'?s? name|marital status|gender|sex|nationality|religion|caste|address|permanent address|current address|residential address|passport|aadhaar|aadhar|pan|blood group|age|place)\b.*$/i;
const PERSONAL_SECTION = /^\s*(?:personal (?:details|information|profile)|declaration)\s*:?\s*$/i;
const SECTION_HEADER = /^\s*[A-Z][A-Z &/-]{2,40}:?\s*$/;
const DECLARATION_LINE = /\b(?:hereby declare|true to the best of my knowledge)\b/i;

function looksLikeName(line: string): boolean {
  const words = line.trim().split(/\s+/);
  return (
    words.length >= 1 &&
    words.length <= 4 &&
    !/\d|@|:|\|/.test(line) &&
    words.every((word) => /^[A-Z][a-zA-Z.'-]*$/.test(word) || /^[A-Z.]+$/.test(word))
  );
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type AnonymiseOptions = { college?: string };

export function anonymise(text: string, options: AnonymiseOptions = {}): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  // Name: the first non-empty line, if it looks like one.
  const firstIndex = lines.findIndex((line) => line.trim().length > 0);
  const nameTokens: string[] = [];
  if (firstIndex >= 0 && looksLikeName(lines[firstIndex]!)) {
    nameTokens.push(...lines[firstIndex]!.trim().split(/\s+/).filter((token) => token.replace(/\./g, "").length > 1));
    lines.splice(firstIndex, 1);
  }

  const out: string[] = [];
  let inPersonalSection = false;

  for (const rawLine of lines) {
    if (PERSONAL_SECTION.test(rawLine)) {
      inPersonalSection = true;
      continue;
    }
    if (inPersonalSection) {
      if (SECTION_HEADER.test(rawLine) && rawLine.trim().length > 0) inPersonalSection = false;
      else continue;
    }
    if (PERSONAL_ROW.test(rawLine) || DECLARATION_LINE.test(rawLine)) continue;

    let line = rawLine
      .replace(EMAIL, "")
      .replace(URL_PATTERN, "")
      .replace(PHONE, "")
      .replace(DAY_MONTH_YEAR, "$1")
      .replace(MONTH_DAY_YEAR, "$1")
      .replace(MONTH_YEAR, "$1")
      .replace(NUMERIC_DATE, "$1")
      .replace(NUMERIC_MONTH_YEAR, "$1");

    for (const token of nameTokens) {
      line = line.replace(new RegExp(`\\b${escapeRegex(token)}\\b`, "gi"), "");
    }
    if (options.college?.trim()) {
      line = line.replace(new RegExp(escapeRegex(options.college.trim()), "gi"), "[College removed]");
    }

    line = line
      .replace(/\b(?:email|e-mail|mobile|phone|mob|contact|linkedin|github)\s*:\s*(?=[|·•,]|$)/gi, "")
      .replace(/\s*[|·•]\s*(?=[|·•]|$)/g, "")
      .replace(/^\s*[|·•,]\s*/, "")
      .replace(/[ \t]{2,}/g, " ")
      .trimEnd();

    // Drop lines that were nothing but contact details.
    if (rawLine.trim() && !line.replace(/[^a-z0-9]/gi, "")) continue;
    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
