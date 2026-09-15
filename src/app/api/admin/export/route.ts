import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { store } from "@/lib/server/store";

function csv(rows: (string | number | boolean | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          let value = cell === null ? "" : String(cell);
          if (/^[=+\-@]/.test(value)) value = `'${value}`; // block spreadsheet formula injection
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const type = request.nextUrl.searchParams.get("type");
  const state = store();

  let body: string;
  if (type === "waitlist") {
    body = csv([
      ["id", "email", "created_at", "source", "target_company"],
      ...state.waitlist.map((w) => [w.id, w.email, w.createdAt, w.source, w.targetCompany]),
    ]);
  } else if (type === "scans") {
    body = csv([
      ["id", "created_at", "common_count", "total_count", "percentage", "phrase_count", "matched_count", "ip_hash", "referrer", "share_card_generated"],
      ...state.scans.map((s) => [s.id, s.createdAt, s.commonCount, s.totalCount, s.percentage, s.phraseCount, s.matchedCount, s.ipHash, s.referrer, s.shareCardGenerated]),
    ]);
  } else {
    return new Response("Unknown export", { status: 400 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
