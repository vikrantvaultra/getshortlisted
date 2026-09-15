import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg px-4 pt-16 text-center sm:pt-24">
      <p className="font-display text-[7.5rem] leading-[1.05] font-extrabold tracking-tight">
        4<span className="marker" style={{ backgroundSize: "100% 42%", backgroundPosition: "0 82%" }}>0</span>4
      </p>
      <h1 className="mt-6 text-[1.9rem] leading-tight font-extrabold">This page went missing.</h1>
      <p className="mt-3 text-lg text-soft">Unlike the lines on most resumes — those are everywhere.</p>
      <Link href="/" className="btn mt-8">
        Check your resume
        <ArrowRightIcon />
      </Link>
    </section>
  );
}
