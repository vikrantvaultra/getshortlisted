import { NextResponse, type NextRequest } from "next/server";
import { extractResumeUpload, UploadError } from "@/lib/extract/extract";
import { analyseDocument } from "@/lib/scoring/analyse";
import { scoreDocument } from "@/lib/scoring/score";
import { detectDomain, type DomainMatch } from "@/lib/server/domains";
import { indexStats, lookupDocCounts } from "@/lib/server/phrase-index";
import { jsonError, rateLimit } from "@/lib/server/request";
import { randomId, signPayload } from "@/lib/server/crypto";
import { store } from "@/lib/server/store";

export const runtime = "nodejs";
export const maxDuration = 10;

export type ScoreResponse = {
  scanId: string;
  commonCount: number;
  totalCount: number;
  percentage: number;
  lines: { text: string; common: boolean; seenIn: number }[];
  index: ReturnType<typeof indexStats>;
  /** The job domain this resume reads like, so Compare and the Library can open on it. Not stored. */
  match: DomainMatch | null;
  /** Signed {scanId, commonCount, totalCount}: lets the share card and share link prove the numbers are real. */
  shareToken: string;
};

/**
 * Twin Score. The file and its text exist only inside this function call:
 * nothing about the resume is stored or logged — only counts go into `scans`.
 */
export async function POST(request: NextRequest) {
  const { ipHash, blocked } = rateLimit(request, "upload");
  if (blocked) return blocked;

  let file: File | null;
  try {
    const form = await request.formData();
    const value = form.get("resume");
    file = value instanceof File ? value : null;
  } catch {
    return jsonError("Upload a PDF or Word file.");
  }
  if (!file) return jsonError("Choose your resume first.");

  try {
    const extracted = await extractResumeUpload(new Uint8Array(await file.arrayBuffer()));
    const analysis = analyseDocument(extracted.text);
    const result = scoreDocument(analysis, lookupDocCounts);

    if (result.totalCount === 0) {
      return jsonError(
        "We couldn't find any full sentences in that file. If it's a scanned image or a photo, we can't read it — export it as a text PDF from Word or Google Docs.",
        422,
      );
    }

    const scanId = randomId("scan");
    store().scans.push({
      id: scanId,
      createdAt: new Date().toISOString(),
      commonCount: result.commonCount,
      totalCount: result.totalCount,
      percentage: result.percentage,
      phraseCount: result.phraseCount,
      matchedCount: result.matchedPhraseCount,
      ipHash,
      referrer: request.headers.get("referer")?.slice(0, 300) ?? null,
      shareCardGenerated: false,
    });

    const body: ScoreResponse = {
      scanId,
      commonCount: result.commonCount,
      totalCount: result.totalCount,
      percentage: result.percentage,
      lines: result.lines.map(({ text, common, peakDocCount }) => ({ text, common, seenIn: peakDocCount })),
      index: indexStats(),
      match: detectDomain(extracted.text),
      shareToken: signPayload({ s: scanId, c: result.commonCount, t: result.totalCount }),
    };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status);
    console.error("[score] unexpected failure"); // deliberately no error details: they can contain file contents
    return jsonError("Something went wrong reading that file. Try again, or try a PDF export.", 500);
  }
}
