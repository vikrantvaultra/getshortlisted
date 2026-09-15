import { NextResponse, type NextRequest } from "next/server";
import type { ShareToken } from "@/app/api/share-card/route";
import { verifyPayload } from "@/lib/server/crypto";
import { rateLimit } from "@/lib/server/request";
import { store } from "@/lib/server/store";

/**
 * Funnel analytics: the result page pre-renders the card for every scan, so
 * "share card generated" is recorded here — when someone actually shares,
 * saves or copies the link.
 */
export async function POST(request: NextRequest) {
  const { blocked } = rateLimit(request, "shareCard");
  if (blocked) return blocked;
  const body = await request.json().catch(() => null);
  const token = verifyPayload<ShareToken>(body?.shareToken);
  const scan = token ? store().scans.find((entry) => entry.id === token.s) : undefined;
  if (scan) scan.shareCardGenerated = true;
  return NextResponse.json({ ok: true });
}
