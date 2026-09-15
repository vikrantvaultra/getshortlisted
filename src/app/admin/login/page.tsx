import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertIcon, LockIcon } from "@/components/icons";
import { adminPassword, isAdmin } from "@/lib/server/admin-auth";
import { login } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = adminPassword() !== null;

  return (
    <section className="mx-auto max-w-sm px-4 pt-14 sm:pt-24">
      <div className="panel pop p-6 sm:p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-text text-white">
          <LockIcon />
        </span>
        <p className="kicker mt-5">Admin</p>
        <h1 className="mt-1 text-3xl font-extrabold">
          Review <span className="marker">desk</span>
        </h1>
        {!configured ? (
          <p className="mt-5 rounded-2xl bg-wash p-4 text-sm text-soft">
            The admin panel is disabled because <code className="font-mono text-text">ADMIN_PASSWORD</code> is not set.
          </p>
        ) : (
          <form action={login} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" className="input" required autoFocus />
            </div>
            {error && (
              <p role="alert" className="flex items-center gap-2 rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-medium text-warn">
                <AlertIcon className="h-4 w-4 shrink-0" />
                {error === "rate" ? "Too many attempts. Wait fifteen minutes." : "Wrong password."}
              </p>
            )}
            <button type="submit" className="btn w-full">
              Sign in
            </button>
            {process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD && (
              <p className="chip w-full justify-center">
                Dev password: <code className="font-mono text-text">admin</code>
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
