import type { ReactNode } from "react";

/** Shared top of the policy pages: sticker, headline and last-updated date. */
export function LegalHeader({ label, icon, updated, children }: { label: string; icon: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <header className="rise">
      <span className="sticker -rotate-1">
        {icon}
        {label}
      </span>
      <h1 className="mt-5 text-title font-extrabold">{children}</h1>
      {updated && <p className="mt-3 font-mono text-sm text-soft">Updated {updated}</p>}
    </header>
  );
}
