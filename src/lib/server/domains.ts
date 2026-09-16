import { readFileSync } from "node:fs";
import path from "node:path";
import { documentTerms, profileScore } from "@/lib/domain-terms";
import { HEADLINE_CHARS, hintScores } from "./domain-hints";
import { DOMAIN_FIELDS, FIELDS, domainLabel, type FieldId } from "@/lib/fields";
import type { DomainEntry, OpenLibraryFile } from "./open-library-types";

/**
 * The per-domain data built by `npm run library:build`: profiles for matching
 * a resume to its domain, typical ranges for Compare, and AI-generated
 * resumes to read. Loaded once per server process.
 */

export const OPEN_LIBRARY_FILE = path.join(process.cwd(), "data", "library", "open-library.json");

type Loaded = { file: OpenLibraryFile; bySlug: Map<string, DomainEntry>; byDomain: Map<string, DomainEntry> };

const globalCache = globalThis as unknown as { __openLibrary?: Loaded };

function load(): Loaded {
  if (!globalCache.__openLibrary) {
    let file: OpenLibraryFile;
    try {
      file = JSON.parse(readFileSync(OPEN_LIBRARY_FILE, "utf8")) as OpenLibraryFile;
    } catch {
      console.warn("[domains] data/library/open-library.json missing — run `npm run library:build`");
      file = { generatedAt: "", sources: {}, domains: [], resumes: [] };
    }
    globalCache.__openLibrary = {
      file,
      bySlug: new Map(file.domains.map((entry) => [entry.slug, entry])),
      byDomain: new Map(file.domains.map((entry) => [entry.domain, entry])),
    };
  }
  return globalCache.__openLibrary;
}

export function openLibrary(): OpenLibraryFile {
  return load().file;
}

export function domainBySlug(slug: string | undefined | null): DomainEntry | undefined {
  return slug ? load().bySlug.get(slug) : undefined;
}

export function domainByName(domain: string): DomainEntry | undefined {
  return load().byDomain.get(domain);
}

const FIELD_ORDER = new Map(FIELDS.map((field, i) => [field.id, i]));

/** Every domain entry, grouped by field in FIELDS order, then alphabetical. */
export function domainEntries(): DomainEntry[] {
  return [...load().file.domains].sort(
    (a, b) => FIELD_ORDER.get(a.field)! - FIELD_ORDER.get(b.field)! || domainLabel(a.domain).localeCompare(domainLabel(b.domain)),
  );
}

export type DomainMatch = { slug: string; domain: string; label: string; field: FieldId };

/** The dataset's own job title in the headline is the strongest single cue there is. */
const TITLE_BONUS = 15;
const titlePatterns = new Map<string, RegExp>();
function titlePattern(domain: string): RegExp {
  let pattern = titlePatterns.get(domain);
  if (!pattern) {
    const title = domain.replace(/ \(.*\)$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`\\b${title}s?\\b`, "i");
    titlePatterns.set(domain, pattern);
  }
  return pattern;
}

/** Every domain's score for this text, best first. Exposed for tests. */
export function rankDomains(text: string): { entry: DomainEntry; score: number }[] {
  const terms = documentTerms(text);
  const headline = text.trim().slice(0, HEADLINE_CHARS);
  const hints = hintScores(text);
  const ranked: { entry: DomainEntry; score: number }[] = [];
  for (const entry of load().file.domains) {
    const hint = hints.get(entry.domain) ?? 0;
    if (!entry.profile.length || (!entry.detectable && !hint)) continue;
    const title = titlePattern(entry.domain).test(headline) ? TITLE_BONUS : 0;
    ranked.push({ entry, score: profileScore(terms, entry.profile) + title + hint });
  }
  return ranked.sort((a, b) => b.score - a.score);
}

/**
 * The domain this resume fits best: its vocabulary against each domain's
 * profile, plus title and credential cues. Counting only — no AI. Returns
 * null when the text is too thin to say anything.
 */
export function detectDomain(text: string): DomainMatch | null {
  if (documentTerms(text).size < 20) return null;
  const best = rankDomains(text)[0];
  if (!best) return null;
  return { slug: best.entry.slug, domain: best.entry.domain, label: domainLabel(best.entry.domain), field: best.entry.field };
}

/** For content outside the build (hand-written model resumes, approved submissions). */
export function fieldOf(domain: string): FieldId {
  return DOMAIN_FIELDS[domain] ?? "other";
}
