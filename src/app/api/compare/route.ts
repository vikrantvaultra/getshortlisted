import { NextResponse, type NextRequest } from "next/server";
import { COMPARE, LEVELS, type Level } from "@/config";
import { extractResumeUpload, UploadError } from "@/lib/extract/extract";
import { hasAccess } from "@/lib/server/access";
import { compareSet } from "@/lib/server/library";
import { jsonError, rateLimit } from "@/lib/server/request";
import { paidEnabled } from "@/lib/site";
import { measureStructure, phraseOverlap, type Overlap, type StructureMetrics } from "@/lib/structure";

export const runtime = "nodejs";
export const maxDuration = 10;

export type CompareColumn = {
  label: string;
  id: string | null;
  meta: string;
  sample: boolean;
  metrics: StructureMetrics;
  /** You: overlap with all five. Each placed resume: overlap with the other four. */
  overlap: Overlap;
  /** Placed resumes only; the user's lines come from `overlap.lines`. */
  text: string | null;
};

/**
 * Without access the comparison still runs, but only the user's own column
 * comes back. The placed resumes' numbers and text never leave the server
 * until they pay, so the locked preview can't be read from devtools.
 */
export type CompareResponse =
  | { locked: false; company: string; columns: CompareColumn[] }
  | { locked: true; company: string; you: CompareColumn; placed: { meta: string; sample: boolean }[] };

/** Like Twin Score, the upload is processed in memory and never stored. */
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
  const company = String(form.get("company") ?? "");
  const level = LEVELS.includes(form.get("level") as Level) ? (form.get("level") as Level) : undefined;
  if (!(file instanceof File)) return jsonError("Choose your resume first.");

  const set = compareSet(company, level);
  if (set.length < COMPARE.SET_SIZE) return jsonError(`We don't have ${COMPARE.SET_SIZE} verified resumes for that company yet.`);

  try {
    const extracted = await extractResumeUpload(new Uint8Array(await file.arrayBuffer()));
    const setTexts = set.map((resume) => resume.redactedText);

    const columns: CompareColumn[] = [
      {
        label: "You",
        id: null,
        meta: "Your upload",
        sample: false,
        metrics: measureStructure(extracted.text, extracted.pageCount, extracted.pageCountEstimated),
        overlap: phraseOverlap(extracted.text, setTexts),
        text: null,
      },
      ...set.map((resume, i): CompareColumn => ({
        label: `${resume.role}`,
        id: resume.id,
        meta: `${resume.year} · ${resume.level} · ${resume.collegeTier}`,
        sample: resume.sample,
        metrics: measureStructure(resume.redactedText, resume.pageCount, false),
        overlap: phraseOverlap(resume.redactedText, setTexts.filter((_, j) => j !== i)),
        text: resume.redactedText,
      })),
    ];

    const you = columns[0]!;
    if (you.metrics.scoredLines === 0) {
      return jsonError("We couldn't find any full sentences in that file. If it's a scanned image, export a text PDF instead.", 422);
    }
    const body: CompareResponse = (await hasAccess())
      ? { locked: false, company, columns }
      : { locked: true, company, you, placed: columns.slice(1).map(({ meta, sample }) => ({ meta, sample })) };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status);
    console.error("[compare] unexpected failure");
    return jsonError("Something went wrong reading that file.", 500);
  }
}
