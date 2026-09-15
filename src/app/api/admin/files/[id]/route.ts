import { isAdmin } from "@/lib/server/admin-auth";
import { store } from "@/lib/server/store";

export const runtime = "nodejs";

/** Uploaded files are only ever served to the admin. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const file = store().files.get((await params).id);
  if (!file) return new Response("Not found", { status: 404 });

  const inline = file.mime.startsWith("image/") || file.mime === "application/pdf";
  const headers: Record<string, string> = {
    "Content-Type": file.mime,
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${file.name}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  // Images (including the SVG samples) can't run scripts; the PDF viewer needs an unsandboxed document.
  if (file.mime !== "application/pdf") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

  return new Response(Buffer.from(file.bytes), { headers });
}
