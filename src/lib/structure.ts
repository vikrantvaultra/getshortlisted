import { analyseDocument, documentPhrases } from "@/lib/scoring/analyse";
import { scoreDocument } from "@/lib/scoring/score";
import { COMPARE } from "@/config";

/**
 * Countable resume structure for Compare. Everything here is a count or a
 * position read off the text — no judgement, no advice.
 */

const SECTION_ALIASES: [string, RegExp][] = [
  ["Summary", /^(?:professional |career )?(?:summary|objective|profile|about me)$/],
  ["Education", /^(?:education(?:al)?(?: qualifications?| details| background)?|academic (?:qualifications?|details|background)|academics|qualifications?)$/],
  ["Experience", /^(?:(?:work|professional|industry|relevant) )?experience$|^(?:internships?|employment(?: history)?|work history|internship experience)$/],
  ["Projects", /^(?:(?:academic|personal|key|major|technical|selected) )?projects?$/],
  ["Skills", /^(?:(?:technical|key|core|it) )?skills(?: (?:&|and) (?:tools|technologies))?$|^(?:technologies|tech stack|tools)$/],
  ["Certifications", /^(?:certifications?|certificates?|courses?(?: (?:&|and) certifications?)?|licenses? (?:&|and) certifications?|trainings?(?: (?:&|and) certifications?)?)$/],
  ["Achievements", /^(?:achievements?|awards?(?: (?:&|and) achievements?)?|honou?rs?(?: (?:&|and) awards?)?|accomplishments?)$/],
  ["Activities", /^(?:extra[- ]?curricular(?: activities)?|co[- ]?curricular(?: activities)?|positions? of responsibility|leadership|volunteering|activities)$/],
  ["Publications", /^(?:publications?|research(?: papers?)?)$/],
  ["Strengths", /^(?:strengths?|soft skills|interests|hobbies(?: (?:&|and) interests)?)$/],
  ["Personal details", /^(?:personal (?:details|information|profile)|languages(?: known)?)$/],
  ["Declaration", /^declaration$/],
];

const BULLET_START = /^\s*(?:[•●▪◦■□◆◇►▸➢➤✓✔❖∙·*]|[-–—]\s|\d{1,2}[.)]\s)/;

export type Section = { name: string; lines: string[] };

const KEYWORD_SECTIONS: [RegExp, string][] = [
  [/experience|intern|employment/, "Experience"],
  [/project/, "Projects"],
  [/certif|course|training/, "Certifications"],
  [/skill|technolog/, "Skills"],
  [/achiev|award|honou?r|accomplish/, "Achievements"],
  [/curricular|responsibilit|activit|volunteer|leadership/, "Activities"],
  [/educat|academ|qualification/, "Education"],
  [/summary|objective|profile|about/, "Summary"],
  [/personal/, "Personal details"],
  [/declar/, "Declaration"],
  [/strength|hobb|interest/, "Strengths"],
];

function sectionName(line: string): string | null {
  const candidate = line.trim().replace(/[:\s]+$/, "");
  if (!candidate || candidate.split(/\s+/).length > 5) return null;
  const lower = candidate.toLowerCase();
  for (const [name, pattern] of SECTION_ALIASES) if (pattern.test(lower)) return name;
  // Any other short ALL-CAPS line is a header too: "ACHIEVEMENTS & AWARDS", "CODING PROFILE".
  if (/^[A-Z][A-Z &/-]+$/.test(candidate) && candidate.length >= 4) {
    for (const [pattern, name] of KEYWORD_SECTIONS) if (pattern.test(lower)) return name;
    return lower.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return null;
}

export function detectSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!rawLine.trim()) continue;
    const name = sectionName(rawLine);
    if (name) {
      current = { name, lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(rawLine.trim());
    }
  }
  return sections;
}

export type ProjectCounts = { projects: number; bulletsPerProject: number[]; average: number | null };

export function countProjectBullets(sections: Section[]): ProjectCounts {
  const lines = sections.filter((section) => section.name === "Projects").flatMap((section) => section.lines);
  const counts: number[] = [];
  let previousWasTitle = false;
  for (const line of lines) {
    const words = line.replace(BULLET_START, "").trim().split(/\s+/).length;
    const isBullet = BULLET_START.test(line) || words > 12; // unbulleted long lines are bullets whose glyph was lost
    if (isBullet) {
      if (counts.length === 0) counts.push(0);
      counts[counts.length - 1]!++;
      previousWasTitle = false;
    } else if (previousWasTitle) {
      // A second short line right after a title is its subtitle or tech-stack line, not a new project.
      previousWasTitle = false;
    } else {
      counts.push(0);
      previousWasTitle = true;
    }
  }
  return {
    projects: counts.length,
    bulletsPerProject: counts,
    average: counts.length ? round1(counts.reduce((a, b) => a + b, 0) / counts.length) : null,
  };
}

export type StructureMetrics = {
  sectionOrder: string[];
  pageCount: number;
  pageCountEstimated: boolean;
  projects: ProjectCounts;
  /** 1-based position of Certifications among detected sections, or null if absent. */
  certificationsPosition: number | null;
  sectionCount: number;
  scoredLines: number;
  averageWordsPerLine: number | null;
  totalBullets: number;
  wordCount: number;
};

export function measureStructure(text: string, pageCount: number, pageCountEstimated: boolean): StructureMetrics {
  const sections = detectSections(text);
  const analysis = analyseDocument(text);
  const certIndex = sections.findIndex((section) => section.name === "Certifications");
  const words = analysis.lines.reduce((sum, line) => sum + line.normalised.split(" ").length, 0);
  return {
    sectionOrder: sections.map((section) => section.name),
    pageCount,
    pageCountEstimated,
    projects: countProjectBullets(sections),
    certificationsPosition: certIndex >= 0 ? certIndex + 1 : null,
    sectionCount: sections.length,
    scoredLines: analysis.lines.length,
    averageWordsPerLine: analysis.lines.length ? round1(words / analysis.lines.length) : null,
    totalBullets: text.split("\n").filter((line) => BULLET_START.test(line)).length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

export type Overlap = { commonCount: number; totalCount: number; percentage: number; lines: { text: string; common: boolean }[] };

/**
 * How much of `text` appears in `set`, using the Twin Score pipeline with
 * the set as the index. One containing document is enough (COMPARE.OVERLAP_MIN_DOCS).
 */
export function phraseOverlap(text: string, set: string[]): Overlap {
  const counts = new Map<string, number>();
  for (const other of set) {
    for (const hash of documentPhrases(analyseDocument(other)).keys()) counts.set(hash, (counts.get(hash) ?? 0) + 1);
  }
  const result = scoreDocument(analyseDocument(text), (hashes) => new Map(hashes.map((h) => [h, counts.get(h) ?? 0])), {
    minDocCount: COMPARE.OVERLAP_MIN_DOCS,
  });
  return {
    commonCount: result.commonCount,
    totalCount: result.totalCount,
    percentage: result.percentage,
    lines: result.lines.map(({ text, common }) => ({ text, common })),
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
