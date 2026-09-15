import { NextResponse, type NextRequest } from "next/server";
import { randomId } from "@/lib/server/crypto";
import { cleanText, isEmail, jsonError, rateLimit } from "@/lib/server/request";
import { store } from "@/lib/server/store";

export async function POST(request: NextRequest) {
  const { blocked } = rateLimit(request, "form");
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isEmail(email)) return jsonError("That email doesn't look right.");

  const waitlist = store().waitlist;
  if (!waitlist.some((entry) => entry.email === email)) {
    waitlist.push({
      id: randomId("wl"),
      email,
      createdAt: new Date().toISOString(),
      source: cleanText(body?.source, 40) || "unknown",
      targetCompany: cleanText(body?.targetCompany, 80) || null,
    });
  }
  // Same response either way: don't reveal whether an email is already listed.
  return NextResponse.json({ ok: true });
}
