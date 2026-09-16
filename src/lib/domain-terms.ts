/**
 * Shared by the library build (scripts/build-library.ts) and the runtime
 * domain matcher, so a resume is tokenised the same way on both sides.
 */

const STOPWORDS = new Set(
  (
    "a an and are as at be been being but by can could did do does for from had has have having he her his i if in into is it its " +
    "me my of on or our out over she so such than that the their them then there these they this those through to too under up " +
    "us was we were what when where which while who whom why will with within would you your also all any each other more most " +
    "new using used use well per via etc including include includes across both based work worked working team teams year years " +
    "month months present current skills skill experience summary education professional responsible responsibilities"
  ).split(" "),
);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.&/]+/g, " ")
    .split(" ")
    .map((word) => word.replace(/^[./&]+|[./&]+$/g, ""))
    .filter(Boolean);
}

const usable = (word: string) => word.length >= 2 && word.length <= 30 && !STOPWORDS.has(word) && !/^\d/.test(word);

/** Distinct unigrams and adjacent-word bigrams, stopwords and numbers dropped. */
export function documentTerms(text: string): Set<string> {
  const list = words(text);
  const terms = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    const word = list[i]!;
    if (!usable(word)) continue;
    terms.add(word);
    const next = list[i + 1];
    if (next && usable(next)) terms.add(`${word} ${next}`);
  }
  return terms;
}

/** [term, share of this domain's resumes containing it, share of all other resumes containing it] */
export type ProfileTerm = [string, number, number];

/**
 * Missing terms count for less than present ones: resumes are short, and a
 * two-page CV can't mention everything its field usually does.
 */
export const ABSENT_TERM_WEIGHT = 0.3;

/**
 * Bernoulli log-likelihood ratio over a domain's distinctive terms: present
 * terms add evidence for the domain, missing common ones take a little away.
 */
export function profileScore(terms: Set<string>, profile: ProfileTerm[]): number {
  let score = 0;
  for (const [term, inDomain, elsewhere] of profile) {
    score += terms.has(term) ? Math.log(inDomain / elsewhere) : ABSENT_TERM_WEIGHT * Math.log((1 - inDomain) / (1 - elsewhere));
  }
  return score;
}

/** Rough page count for text that didn't come from a PDF. */
export function estimatePages(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 475));
}

/** "fresher" unless the text shows two or more jobs or two-plus years of experience. */
export function guessLevel(text: string): "fresher" | "experienced" {
  const claimed = [...text.matchAll(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b(?:\s+of)?\s+(?:\w+\s+){0,3}experience/gi)].some((m) => Number(m[1]) >= 2);
  const ranges = text.match(/\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current|now|date)\b/gi)?.length ?? 0;
  return claimed || ranges >= 3 ? "experienced" : "fresher";
}
