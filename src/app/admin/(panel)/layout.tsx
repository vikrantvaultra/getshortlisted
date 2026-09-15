import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin-auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-text px-4 py-2.5 text-white">
        <Link href="/admin" className="flex items-center gap-2 font-mono text-xs font-medium tracking-wider uppercase">
          <span className="h-2 w-2 rounded-full bg-marker" />
          Admin · Review desk
        </Link>
        <form action={logout}>
          <button type="submit" className="rounded-lg px-2.5 py-1 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
