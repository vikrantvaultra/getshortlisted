import Link from "next/link";
import { SITE } from "@/config";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-edge bg-wash">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr] sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-soft">
            Every number here is counted, not guessed. No AI writes or judges anything, and your uploaded file is never saved.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm font-medium sm:justify-self-end">
          <Link href="/" className="text-soft hover:text-pen">Check a resume</Link>
          <Link href="/submit" className="text-soft hover:text-pen">Share your resume</Link>
          <Link href="/privacy" className="text-soft hover:text-pen">Privacy</Link>
          <a href={`mailto:${SITE.contactEmail}`} className="text-soft hover:text-pen">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
