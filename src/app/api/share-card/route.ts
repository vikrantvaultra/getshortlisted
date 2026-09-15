import type { NextRequest } from "next/server";
import { verifyPayload } from "@/lib/server/crypto";
import { jsonError, rateLimit } from "@/lib/server/request";
import { renderLinkPreview, renderStoryCard, type CardLine } from "@/lib/server/share-card";

export const runtime = "nodejs";

export type ShareToken = { s: string; c: number; t: number };

/**
 * POST { shareToken, lines } → 1080×1920 story PNG.
 * The server kept no copy of the resume, so the browser sends the lines back.
 * The numbers come from the signed token, and the lines must agree with them.
 */
export async function POST(request: NextRequest) {
  const { blocked } = rateLimit(request, "shareCard");
  if (blocked) return blocked;

  let body: { shareToken?: string; lines?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request.");
  }

  const token = verifyPayload<ShareToken>(body.shareToken);
  if (!token) return jsonError("This result can't be verified. Run the score again.", 403);

  const lines = Array.isArray(body.lines)
    ? body.lines
        .filter((line): line is CardLine => typeof line?.text === "string" && typeof line?.common === "boolean")
        .map((line) => ({ text: line.text.slice(0, 400), common: line.common }))
    : [];
  const common = lines.filter((line) => line.common).length;
  if (lines.length !== token.t || common !== token.c) return jsonError("These lines don't match your result.", 400);

  return renderStoryCard(token.c, token.t, lines);
}

/** GET ?t=<shareToken> → 1200×630 link preview with no resume text. Used as og:image. */
export async function GET(request: NextRequest) {
  const token = verifyPayload<ShareToken>(request.nextUrl.searchParams.get("t"));
  if (!token) return jsonError("Invalid share link.", 404);
  return renderLinkPreview(token.c, token.t);
}
