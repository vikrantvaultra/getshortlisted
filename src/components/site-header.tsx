import Link from "next/link";
import { paidEnabled } from "@/lib/site";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1.5 text-[0.92rem] font-semibold">
          {paidEnabled() && (
            <Link href="/library" className="hidden rounded-xl px-3 py-2 text-soft hover:bg-wash sm:inline hover:text-text">
              Library
            </Link>
          )}
          <Link href="/submit" className="whitespace-nowrap rounded-xl bg-marker px-3 py-2 shadow-[0_2px_0_#d9b800] transition-transform hover:-translate-y-px">
            Got placed?
          </Link>
        </nav>
      </div>
    </header>
  );
}
