import { NextResponse, type NextRequest } from "next/server";
import { COMPARE, LEVELS, type Level } from "@/config";
import type { LibraryResume, ResumeOrigin } from "@/data/types";
import { extractResumeUpload, UploadError } from "@/lib/extract/extract";
import { AUTO_DOMAIN, domainLabel, type FieldId } from "@/lib/fields";
import { hasAccess } from "@/lib/server/access";
import { detectDomain, domainBySlug } from "@/lib/server/domains";
import { compareCompanies, compareSet, moreFromShelf } from "@/lib/server/library";
import type { DomainStats, MeasureRange } from "@/lib/server/open-library-types";
import { jsonError, rateLimit } from "@/lib/server/request";
import { paidEnabled } from "@/lib/site";
import { measureStructure, phraseOverlap, type Overlap, type StructureMetrics } from "@/lib/structure";

export const runtime = "nodejs";
export const maxDuration = 10;

export type CompareColumn = {
  label: string;
  id: string | null;
  meta: string;
  company: string | null;
  origin: ResumeOrigin | null;
  sample: boolean;
  metrics: StructureMetrics;
  /** You: overlap with all five. Each other resume: overlap with the other four. */
  overlap: Overlap;
  /** Comparison resumes only; the user's lines come from `overlap.lines`. */
  text: string | null;
};

export type CompareTarget = {
  slug: string;
  label: string;
  field: FieldId;
  company: string | null;
  /** True when the role was read off the uploaded resume rather than picked. */
  detected: boolean;
  /** Resumes in the open datasets for this role — what the typical ranges are counted over. */
  total: number;
};

/** A library card on Compare. `preview` is empty without access, like the Library's locked cards. */
export type ShelfCard = {
  id: string;
  role: string;
  company: string | null;
  level: Level;
  year: number | null;
  pageCount: number;
  origin: ResumeOrigin;
  sample: boolean;
  preview: string[];
};

/** More of the role's library shelf, beyond the five in the comparison. */
export type MoreResumes = { slug: string; label: string; total: number; cards: ShelfCard[] };

/** Cards shown under the comparison. */
const MORE_CARDS = 6;

export type CompareRanges = Partial<Record<keyof DomainStats, MeasureRange>>;

/**
 * Without access the comparison still runs, but only the user's own column
 * comes back. The other resumes' numbers, text and the typical ranges never
 * leave the server until they pay, so the locked preview can't be read from devtools.
 */
export type CompareResponse =
  | { locked: false; target: CompareTarget; borrowedFrom: string | null; more: MoreResumes; ranges: CompareRanges; columns: CompareColumn[] }
  | {
      locked: true;
      target: CompareTarget;
      borrowedFrom: string | null;
      more: MoreResumes;
      you: CompareColumn;
      placed: { meta: string; origin: ResumeOrigin }[];
    };

/** The first two bullets, as the Library's cards show them. */
function previewLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[•\-*]\s/.test(line))
    .slice(0, 2)
    .map((line) => line.replace(/^[•\-*]\s+/, ""));
}

function describe(resume: LibraryResume): string {
  if (resume.origin === "open-dataset") return resume.level;
  return [resume.year, resume.level, resume.collegeTier !== "Not disclosed" ? resume.collegeTier : null].filter(Boolean).join(" · ");
}

/** Like the resume check, the upload is processed in memory and never stored. */
export async function POST(request: NextRequest) {
  if (!paidEnabled()) return jsonError("Not found", 404);
  const { blocked } = rateLimit(request, "upload");
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Upload a PDF or Word file.");
  }
  const file = form.get("resume");
  const domainParam = String(form.get("domain") ?? AUTO_DOMAIN);
  const companyParam = String(form.get("company") ?? "");
  const company = companyParam && compareCompanies().includes(companyParam) ? companyParam : undefined;
  const level = LEVELS.includes(form.get("level") as Level) ? (form.get("level") as Level) : undefined;
  if (!(file instanceof File)) return jsonError("Choose your resume first.");
  if (companyParam && !company) return jsonError(`We don't have ${COMPARE.SET_SIZE} resumes for that company yet.`);

  try {
    const extracted = await extractResumeUpload(new Uint8Array(await file.arrayBuffer()));
    const youMetrics = measureStructure(extracted.text, extracted.pageCount, extracted.pageCountEstimated);
    if (youMetrics.scoredLines === 0) {
      return jsonError("We couldn't find any full sentences in that file. If it's a scanned image, export a text PDF instead.", 422);
    }

    let entry = domainBySlug(domainParam);
    const detected = !entry;
    if (!entry) {
      const match = detectDomain(extracted.text);
      entry = match ? domainBySlug(match.slug) : undefined;
    }
    if (!entry) return jsonError("We couldn't tell which role this resume is for. Pick your role and try again.", 422);

    const set = compareSet(entry, { company, level });
    if (set.resumes.length < COMPARE.SET_SIZE) return jsonError(`We don't have ${COMPARE.SET_SIZE} resumes to compare with for that role yet.`);
    const setTexts = set.resumes.map((resume) => resume.redactedText);

    const you: CompareColumn = {
      label: "You",
      id: null,
      meta: "Your upload",
      company: null,
      origin: null,
      sample: false,
      metrics: youMetrics,
      overlap: phraseOverlap(extracted.text, setTexts),
      text: null,
    };
    const placed = set.resumes.map(
      (resume, i): CompareColumn => ({
        label: resume.role,
        id: resume.id,
        meta: describe(resume),
        company: resume.company,
        origin: resume.origin,
        sample: resume.sample,
        metrics: measureStructure(resume.redactedText, resume.pageCount, resume.origin === "open-dataset"),
        overlap: phraseOverlap(resume.redactedText, setTexts.filter((_, j) => j !== i)),
        text: resume.redactedText,
      }),
    );

    const target: CompareTarget = {
      slug: entry.slug,
      label: domainLabel(entry.domain),
      field: entry.field,
      company: company ?? null,
      detected,
      total: entry.real + entry.synthetic,
    };
    const borrowedFrom = set.borrowedFrom ? domainLabel(set.borrowedFrom) : null;
    const unlocked = await hasAccess();
    const shelf = moreFromShelf(
      entry,
      set.resumes.map((resume) => resume.id),
      MORE_CARDS,
    );
    const more: MoreResumes = {
      slug: entry.slug,
      label: target.label,
      total: shelf.total,
      cards: shelf.resumes.map((resume) => ({
        id: resume.id,
        role: resume.role,
        company: resume.company,
        level: resume.level,
        year: resume.year,
        pageCount: resume.pageCount,
        origin: resume.origin,
        sample: resume.sample,
        preview: unlocked ? previewLines(resume.redactedText) : [],
      })),
    };
    const body: CompareResponse = unlocked
      ? { locked: false, target, borrowedFrom, more, ranges: set.ranges, columns: [you, ...placed] }
      : { locked: true, target, borrowedFrom, more, you, placed: placed.map(({ meta, origin }) => ({ meta, origin: origin! })) };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status);
    console.error("[compare] unexpected failure");
    return jsonError("Something went wrong reading that file.", 500);
  }
}
