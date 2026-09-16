"use client";

import Link from "next/link";
import { useState } from "react";
import type { ScoreResponse } from "@/app/api/score/route";
import { AlertIcon, ArrowRightIcon, HighlighterIcon, ShareIcon, ShieldIcon, UploadIcon } from "@/components/icons";
import type { DomainOption } from "@/lib/fields";
import type { TopLinesFile } from "@/lib/scoring/index-file";
import { HeroSheet } from "./hero-sheet";
import { LineTester } from "./line-tester";
import { Result } from "./result";
import { Scanning } from "./scanning";
import { TopCopied } from "./top-copied";

export type DemoLine = { text: string; common: boolean; seenIn: number };

type Props = {
  indexSize: number;
  demo: DemoLine[];
  topLines: TopLinesFile | null;
  exampleLines: string[];
  paidEnabled: boolean;
  /** Every role, for the result's "Not right? Change it" picker. */
  domains: DomainOption[];
};

type State = { phase: "idle"; error: string | null } | { phase: "checking"; fileName: string } | { phase: "result"; result: ScoreResponse };

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const n = (value: number) => value.toLocaleString("en-IN");

export function Home({ indexSize, demo, topLines, exampleLines, paidEnabled, domains }: Props) {
  const [state, setState] = useState<State>({ phase: "idle", error: null });

  async function check(file: File) {
    setState({ phase: "checking", fileName: file.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
    const form = new FormData();
    form.append("resume", file);
    const started = Date.now();
    try {
      const response = await fetch("/api/score", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      // Let the scan animation finish one pass so the result doesn't flash in.
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1600 - (Date.now() - started))));
      if (!response.ok) return setState({ phase: "idle", error: data.error ?? "Something went wrong. Please try again." });
      setState({ phase: "result", result: data as ScoreResponse });
      window.scrollTo({ top: 0 });
    } catch {
      setState({ phase: "idle", error: "Couldn't connect. Check your internet and try again." });
    }
  }

  if (state.phase === "checking") return <Scanning fileName={state.fileName} indexSize={indexSize} />;
  if (state.phase === "result") {
    return (
      <Result
        result={state.result}
        paidEnabled={paidEnabled}
        domains={domains}
        onReset={() => {
          setState({ phase: "idle", error: null });
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  const uploadButton = (label: string, extra = "") => (
    <label className={`btn relative cursor-pointer ${extra}`}>
      <input
        type="file"
        accept={ACCEPT}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Upload your resume"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) check(file);
        }}
      />
      <UploadIcon />
      {label}
    </label>
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{ backgroundImage: "radial-gradient(#dfe3ea 1.2px, transparent 1.2px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(to bottom, black 40%, transparent)" }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-20">
          <div>
            <span className="sticker rise -rotate-2">Free · takes 10 seconds</span>
            <h1 className="rise mt-5 text-hero font-extrabold" style={{ ["--delay" as string]: "80ms" }}>
              Your resume has been <span className="marker">written before.</span>
            </h1>
            <p className="rise mt-5 max-w-lg text-lg text-soft sm:text-xl" style={{ ["--delay" as string]: "160ms" }}>
              Upload it and we&apos;ll highlight every line that already appears in other resumes — so you can see what sounds like
              everyone else.
            </p>

            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--delay" as string]: "240ms" }}>
              {uploadButton("Scan my resume", "w-full text-lg sm:w-auto")}
              <a href="#try-a-line" className="btn btn-outline w-full sm:w-auto">
                Try one line first
              </a>
            </div>

            {state.error && (
              <p role="alert" className="pop mt-4 flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-[#fff1f1] p-4 text-[0.95rem] text-[#8f1d21]">
                <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                {state.error}
              </p>
            )}

            <p className="rise mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.78rem] text-soft" style={{ ["--delay" as string]: "320ms" }}>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-good" />
                {n(indexSize)} resumes in the index
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldIcon className="h-4 w-4" /> file never saved
              </span>
              <span>PDF or Word</span>
            </p>
          </div>

          <HeroSheet lines={demo} />
        </div>
      </section>

      {/* ── Try one line ─────────────────────────────────────────────────── */}
      <section id="try-a-line" className="scroll-mt-20 bg-wash py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="kicker text-center">No upload needed</p>
          <h2 className="mt-3 text-center text-title font-extrabold">
            Paste one line. <span className="marker">Get a verdict.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-soft">Pick your proudest bullet point and see if someone else already wrote it.</p>
          <div className="mt-8">
            <LineTester examples={exampleLines} indexSize={indexSize} />
          </div>
        </div>
      </section>

      {/* ── Most copied ──────────────────────────────────────────────────── */}
      {topLines && topLines.lines.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <p className="kicker">Counted across {n(topLines.documents)} resumes</p>
            <h2 className="mt-3 text-title font-extrabold">
              The <span className="marker">most copied</span> lines right now
            </h2>
            <p className="mt-3 max-w-xl text-soft">Word for word, in resume after resume. Is one of them on yours?</p>
            <TopCopied data={topLines} />
            <div className="mt-8">{uploadButton("Check if mine has them")}</div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-wash py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-title font-extrabold">How it works</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: <UploadIcon className="h-6 w-6" />, title: "Upload", text: "Drop in your resume as a PDF or Word file. It's read once and thrown away.", tone: "bg-pen text-white" },
              {
                icon: <HighlighterIcon className="h-6 w-6" />,
                title: "We highlight",
                text: `Every line is checked against ${n(indexSize)} resumes. Lines others already use get marked yellow.`,
                tone: "bg-marker text-text",
              },
              { icon: <ShareIcon className="h-6 w-6" />, title: "See & share", text: "Get your count and a card to share — or quietly fix the lines first.", tone: "bg-text text-white" },
            ].map((step, i) => (
              <li key={step.title} className="panel relative p-6">
                <span className="absolute top-5 right-5 font-mono text-sm text-faint">0{i + 1}</span>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.tone}`}>{step.icon}</span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-1.5 text-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Got placed ───────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-marker px-6 py-12 sm:px-12 sm:py-16">
          <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-[#ffd21a] opacity-70" aria-hidden />
          <div className="relative max-w-2xl">
            <p className="kicker text-marker-ink">Got the offer?</p>
            <h2 className="mt-3 text-title font-extrabold">Your resume actually worked. That&apos;s rare — share it.</h2>
            <p className="mt-4 max-w-lg text-lg text-[#3d3300]">
              Help the next person see what a real, shortlisted resume looks like. We remove your personal details, and you can delete it any
              time.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/submit" className="btn btn-dark text-lg">
                Share my resume <ArrowRightIcon />
              </Link>
              <span className="flex items-center gap-2 text-sm font-medium text-[#3d3300]">
                <ShieldIcon className="h-4 w-4" /> Name, phone, email & photo removed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="pb-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-title font-extrabold">Questions</h2>
          <div className="mt-8 space-y-3">
            {([
              ["Is my resume saved anywhere?", "No. Your file is read in memory, checked, and discarded. We only keep the final count — never the file or its text."],
              ["Is this AI?", "No. Nothing reads or rewrites your resume. We split it into short phrases and count how many other resumes contain them."],
              [
                "What counts as “copied”?",
                "A line is highlighted when most of its five-word phrases appear in at least two other resumes. Short lines like headings, dates and skill lists aren't checked.",
              ],
              [
                `What are the ${n(indexSize)} resumes?`,
                <>
                  Real resumes from openly licensed public datasets, AI-generated resumes from open datasets, reference resumes we generated from
                  common resume phrasing, and real resumes shared by people who got placed. Exact and near-duplicate copies are removed.{" "}
                  <Link href="/sources" className="font-semibold text-pen underline underline-offset-2">
                    See every source and its license
                  </Link>
                  .
                </>,
              ],
            ] as [string, React.ReactNode][]).map(([question, answer]) => (
              <details key={question} className="group panel px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wash text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-soft">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
