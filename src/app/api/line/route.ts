import { NextResponse, type NextRequest } from "next/server";
import { analyseDocument } from "@/lib/scoring/analyse";
import { scoreDocument } from "@/lib/scoring/score";
import { indexStats, lookupDocCounts } from "@/lib/server/phrase-index";
import { jsonError, rateLimit } from "@/lib/server/request";

export const runtime = "nodejs";

export type LineCheckResponse =
  | { status: "too-short" }
  | { status: "checked"; common: boolean; seenPhrases: number; totalPhrases: number; peakDocCount: number; indexSize: number };

/**
 * Checks one pasted line against the index. Same pipeline as a full scan.
 * The text is not stored or logged.
 */
export async function POST(request: NextRequest) {
  const { blocked } = rateLimit(request, "lineCheck");
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.replace(/\s+/g, " ").trim().slice(0, 400) : "";
  if (!text) return jsonError("Paste a line first.");

  const analysis = analyseDocument(text);
  // Treat whatever was pasted as a single line.
  const merged = analysis.lines.length > 1 ? analyseDocument(analysis.lines.map((l) => l.text).join(" ").replace(/[.!?;]\s+/g, " ")) : analysis;
  const line = merged.lines[0];
  if (!line) return NextResponse.json({ status: "too-short" } satisfies LineCheckResponse);

  const [verdict] = scoreDocument({ lines: [line], skippedLineCount: 0 }, lookupDocCounts).lines;
  const counts = lookupDocCounts(line.hashes);
  return NextResponse.json({
    status: "checked",
    common: verdict!.common,
    seenPhrases: line.hashes.filter((hash) => (counts.get(hash) ?? 0) >= 2).length,
    totalPhrases: line.hashes.length,
    peakDocCount: verdict!.peakDocCount,
    indexSize: indexStats().totalDocuments,
  } satisfies LineCheckResponse);
}
