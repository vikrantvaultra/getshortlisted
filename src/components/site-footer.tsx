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
            Self-serve resume analysis software. Every number here is counted, not guessed. No AI writes or judges anything, and your
            uploaded file is never saved.
          </p>
          <p className="mt-3 text-sm text-soft">
            Operated by{" "}
            <a href={SITE.operatorUrl} className="font-medium text-text hover:text-pen">
              {SITE.operator}
            </a>{" "}
            · {SITE.city.split(",")[0]} · {SITE.phone}
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm font-medium sm:justify-self-end">
          <Link href="/" className="text-soft hover:text-pen">Check a resume</Link>
          <Link href="/submit" className="text-soft hover:text-pen">Share your resume</Link>
          <Link href="/pricing" className="text-soft hover:text-pen">Pricing</Link>
          <Link href="/contact" className="text-soft hover:text-pen">Contact us</Link>
          <Link href="/terms" className="text-soft hover:text-pen">Terms</Link>
          <Link href="/refund" className="text-soft hover:text-pen">Refund policy</Link>
          <Link href="/privacy" className="text-soft hover:text-pen">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
