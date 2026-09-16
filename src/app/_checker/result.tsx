"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScoreResponse } from "@/app/api/score/route";
import { CountUp } from "@/components/count-up";
import { ArrowRightIcon, CheckIcon, HighlighterIcon, RefreshIcon, ShareIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { indexSentence } from "@/components/index-statement";
import { WaitlistForm } from "@/components/waitlist-form";
import { COMPARE, PRODUCTS } from "@/config";
import { FIELDS, fieldLabel, rememberDomain, type DomainOption } from "@/lib/fields";
import { formatRupees } from "@/lib/site";
import { ShareSheet, type Card } from "./share-sheet";

const PREVIEW_LINES = 8;

const n = (value: number) => value.toLocaleString("en-IN");

type Props = { result: ScoreResponse; paidEnabled: boolean; domains: DomainOption[]; onReset: () => void };

export function Result({ result, paidEnabled, domains, onReset }: Props) {
  const [card, setCard] = useState<Card>({ status: "loading" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [openLine, setOpenLine] = useState<number | null>(null);
  const unique = result.totalCount - result.commonCount;
  const lines = showAll ? result.lines : result.lines.slice(0, PREVIEW_LINES);
  const [domain, setDomain] = useState(result.match?.slug ?? "");

  // Remember the role so Compare and the Library open on it — including after paying, or from the header.
  useEffect(() => {
    if (domain) rememberDomain(domain);
  }, [domain]);

  // Prepare the share image in the background so "Share" works in one tap
  // (browsers only open the share sheet straight after a tap).
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/share-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareToken: result.shareToken, lines: result.lines.map(({ text, common }) => ({ text, common })) }),
        });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setCard({ status: "ready", url, file: new File([blob], `resume-scan-${result.commonCount}-of-${result.totalCount}.png`, { type: "image/png" }) });
      } catch {
        if (!cancelled) setCard({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [result]);

  const headline =
    result.commonCount === 0
      ? "Not a single line matched. That's rare."
      : unique === 0
        ? "Every line you wrote is already out there."
        : "lines already appear in other resumes.";

  return (
    <>
      {/* ── Verdict ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pt-8 text-center sm:pt-14">
        <span className="sticker pop -rotate-1">
          <HighlighterIcon className="h-4 w-4" /> Scan complete
        </span>
        <p className="rise mt-6 font-display text-[clamp(6rem,34vw,10rem)] leading-[0.9] font-extrabold tracking-tight" style={{ ["--delay" as string]: "100ms" }}>
          <span className="marker marker-sweep" style={{ ["--delay" as string]: "450ms" }}>
            <CountUp value={result.commonCount} />
          </span>
          <span className="text-edge-strong">/{result.totalCount}</span>
        </p>
        <h1 className="rise mx-auto mt-4 max-w-xl text-2xl leading-snug font-bold sm:text-3xl" style={{ ["--delay" as string]: "220ms" }}>
          {result.commonCount > 0 && unique > 0 ? `${result.commonCount} of your ${result.totalCount} ` : ""}
          {headline}
        </h1>

        <div className="rise mx-auto mt-7 grid max-w-lg grid-cols-3 gap-2.5" style={{ ["--delay" as string]: "320ms" }}>
          <Stat value={result.commonCount} label="copied" tone="bg-marker-soft text-marker-ink ring-marker" />
          <Stat value={unique} label="only yours" tone="bg-pen-wash text-pen ring-pen/30" />
          <Stat value={`${result.percentage}%`} label="already seen" tone="bg-wash text-soft ring-edge" />
        </div>

        {/* One segment per line, in resume order. */}
        <div className="rise mx-auto mt-5 flex h-3 max-w-lg gap-[3px] overflow-hidden rounded-full" style={{ ["--delay" as string]: "380ms" }} aria-hidden>
          {result.lines.map((line, i) => (
            <span key={i} className={`flex-1 ${line.common ? "bg-marker" : "bg-pen"}`} />
          ))}
        </div>

        <div className="rise mx-auto mt-8 flex max-w-lg flex-col gap-2.5 sm:flex-row" style={{ ["--delay" as string]: "440ms" }}>
          <button type="button" className="btn flex-1 text-lg" onClick={() => setSheetOpen(true)}>
            <ShareIcon /> Share my result
          </button>
          <button type="button" className="btn btn-outline flex-1" onClick={onReset}>
            <RefreshIcon /> Scan another
          </button>
        </div>
      </section>

      {/* ── The sheet ───────────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-3xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">Your resume, marked up</h2>
          <p className="flex items-center gap-2 text-sm">
            <span className="marker font-medium">copied</span>
            <span className="pen-underline font-medium">only yours</span>
          </p>
        </div>

        <div className="sheet-paper px-4 py-5 sm:px-8 sm:py-8">
          <ol className="space-y-1">
            {lines.map((line, i) => {
              const open = openLine === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenLine(open ? null : i)}
                    className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-wash/70"
                    aria-expanded={open}
                  >
                    <span className={`mt-[0.5em] h-2 w-2 shrink-0 rounded-full ${line.common ? "bg-[#e0b800]" : "bg-pen"}`} />
                    <span className="text-[1rem] leading-relaxed">
                      {line.common ? (
                        <span className="marker marker-sweep" style={{ ["--delay" as string]: `${Math.min(600 + i * 110, 2600)}ms` }}>
                          {line.text}
                        </span>
                      ) : (
                        line.text
                      )}
                    </span>
                  </button>
                  {open && (
                    <p className={`fade mb-2 ml-7 rounded-xl px-3 py-2 text-sm ${line.common ? "bg-marker-soft text-marker-ink" : "bg-pen-wash text-pen"}`}>
                      {line.common
                        ? `Phrases from this line appear in up to ${n(line.seenIn)} of ${n(result.index.totalDocuments)} resumes.`
                        : line.seenIn >= 2
                          ? `A few phrases have been seen before, but most of this line is yours.`
                          : "We haven't seen this phrasing in other resumes."}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          {result.lines.length > PREVIEW_LINES && (
            <button type="button" className="btn btn-outline mt-4 w-full" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show less" : `Show all ${result.lines.length} lines`}
            </button>
          )}
        </div>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 text-center text-sm text-soft">
          <span>Tap any line for details.</span>
          <span className="flex items-center gap-1.5">
            <ShieldIcon className="h-4 w-4" /> {indexSentence(result.index)} Your file was not saved.
          </span>
        </p>
      </section>

      {/* ── What next ───────────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-3xl px-4">
        <div className="panel overflow-hidden">
          {paidEnabled ? (
            <NextSteps domains={domains} domain={domain} onDomain={setDomain} matched={result.match?.slug ?? null} />
          ) : (
            <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-marker text-text shadow-[0_3px_0_#d9b800]">
                <SparkleIcon className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-2xl leading-tight font-extrabold">See how resumes for your role are written</h2>
                <p className="mt-2 text-soft">We&apos;re collecting real ones from people who got placed. Get one email when it opens.</p>
                <div className="mt-5">
                  <WaitlistForm source="twin-score" />
                </div>
              </div>
            </div>
          )}
          <Link href="/submit" className="flex items-center justify-between gap-4 border-t border-edge bg-wash px-6 py-4 text-sm font-semibold sm:px-8">
            Already got an offer? Share the resume that did it.
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </section>

      {sheetOpen && <ShareSheet card={card} result={result} onClose={() => setSheetOpen(false)} />}
    </>
  );
}

/** What Compare counts, asked as the questions a job seeker actually has. */
const QUESTIONS = [
  { tag: "Length", text: "Is yours longer or shorter than theirs?" },
  { tag: "Bullets", text: "More bullet points, or fewer?" },
  { tag: "Sections", text: "Are your sections in the usual order?" },
];

function NextSteps({
  domains,
  domain,
  onDomain,
  matched,
}: {
  domains: DomainOption[];
  domain: string;
  onDomain: (slug: string) => void;
  matched: string | null;
}) {
  // Set once the button is tapped, while the report page loads.
  const [opening, setOpening] = useState(false);
  const chosen = domains.find((option) => option.slug === domain);
  const role = chosen?.label;

  // What's inside the report, as numbers. Each only when the role really has it.
  const inside = [
    { value: String(COMPARE.SET_SIZE), label: "resumes placed next to yours" },
    ...(chosen && chosen.total >= 20 ? [{ value: n(chosen.total), label: "counted for the typical range" }] : []),
    ...(chosen && chosen.readable > COMPARE.SET_SIZE ? [{ value: n(chosen.readable - COMPARE.SET_SIZE), label: "more to read in full" }] : []),
  ];

  return (
    <div className="p-5 sm:p-8">
      <span className="sticker -rotate-1">
        <SparkleIcon className="h-4 w-4" /> Next step · free to try
      </span>
      <h2 className="mt-4 text-[1.75rem] leading-[1.1] font-extrabold sm:text-4xl">
        How does your resume stack up against other{" "}
        {role ? <span className="marker">{role}</span> : <span className="marker">people in your role</span>}
        {role ? " resumes" : ""}?
      </h2>

      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {QUESTIONS.map((question, i) => (
          <li key={question.tag} className="rise rounded-2xl bg-wash px-4 py-3" style={{ ["--delay" as string]: `${i * 80}ms` }}>
            <span className="font-mono text-[0.68rem] tracking-wider text-pen uppercase">{question.tag}</span>
            <span className="mt-0.5 block text-[0.95rem] leading-snug font-semibold">{question.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor="result-domain" className="shrink-0 text-sm font-semibold">
          {domain && domain === matched ? "Your role (matched from your resume)" : "Your role"}
        </label>
        <select
          id="result-domain"
          className="input min-h-11 py-2 font-semibold sm:flex-1"
          value={domain}
          onChange={(event) => onDomain(event.target.value)}
          disabled={opening}
        >
          {!domain && <option value="">Pick your role</option>}
          {FIELDS.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {domains
                .filter((option) => option.field === group.id)
                .map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      <Link
        href={chosen ? `/compare?domain=${chosen.slug}` : "/compare"}
        onClick={(event) => {
          // A new-tab click leaves this page as it is.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          setOpening(true);
        }}
        aria-busy={opening}
        className={`group relative mt-5 block overflow-hidden rounded-3xl bg-pen p-5 text-white shadow-[0_18px_40px_-16px_rgba(43,84,255,0.75)] transition-transform sm:p-7 ${
          opening ? "pointer-events-none" : "hover:-translate-y-0.5"
        }`}
      >
        <span aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />

        <span className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto]">
          <span>
            <span className="font-mono text-[0.72rem] tracking-wider text-white/70 uppercase">Your report{role ? ` · ${role}` : ""}</span>
            <span className="mt-1 block font-display text-[1.7rem] leading-tight font-extrabold sm:text-3xl">See exactly where you stand</span>
            <span className="mt-1.5 block text-white/85">
              Your numbers against the typical {role ? `${role} resume` : "resume for your role"}, your resume beside {COMPARE.SET_SIZE} of them, and more to read — on one page.
            </span>
          </span>
          <ReportArt />
        </span>

        <span className={`relative mt-5 grid gap-2 ${inside.length === 3 ? "grid-cols-3" : inside.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {inside.map((item) => (
            <span key={item.label} className="rounded-2xl bg-white/12 px-3 py-2.5 ring-1 ring-white/15">
              <span className="block font-display text-2xl leading-none font-extrabold sm:text-3xl">{item.value}</span>
              <span className="mt-1 block text-xs leading-snug text-white/80 sm:text-sm">{item.label}</span>
            </span>
          ))}
        </span>

        <span className="relative mt-5 flex min-h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-4 text-lg font-bold text-pen shadow-[0_3px_0_rgba(15,17,21,0.18)] transition-colors group-hover:bg-marker group-hover:text-text">
          {opening ? (
            <>
              <Spinner /> Building your report…
            </>
          ) : (
            <>
              <span aria-hidden className="shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-pen/15 to-transparent" />
              Show my report <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
        <span className="relative mt-3 flex items-center justify-center gap-1.5 text-sm text-white/85">
          <CheckIcon className="h-4 w-4" /> Your resume is already loaded — ready in seconds
        </span>
        {opening && <LoadingBar />}
      </Link>

      <p className="mt-4 text-center text-sm text-soft">
        Free to try. To see everything, it&apos;s <strong className="font-semibold text-text">{formatRupees(PRODUCTS.pass.pricePaise)}</strong> for{" "}
        {PRODUCTS.pass.accessDays} days or <strong className="font-semibold text-text">{formatRupees(PRODUCTS.lifetime.pricePaise)}</strong> for life. No
        subscription.
      </p>
    </div>
  );
}

function Spinner() {
  return <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" />;
}

function LoadingBar() {
  return (
    <span role="status" className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden">
      <span className="sr-only">Loading your report</span>
      <span className="progress-run block h-full w-2/5 rounded-full bg-marker" />
    </span>
  );
}

/** Your sheet, with copied lines marked, in front of the others. */
function ReportArt() {
  return (
    <span aria-hidden className="relative hidden h-28 w-52 sm:block">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="absolute top-2" style={{ left: `${44 + i * 28}px`, transform: `rotate(${(i - 2) * 5}deg)` }}>
          <span
            className="flex h-20 w-14 flex-col gap-1 rounded-lg bg-white/25 p-2 transition-transform duration-300 group-hover:-translate-y-2"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <span className="h-1 w-3/4 rounded-full bg-white/80" />
            <span className="h-1 rounded-full bg-white/50" />
            <span className="h-1 w-5/6 rounded-full bg-white/50" />
            <span className="h-1 rounded-full bg-white/50" />
          </span>
        </span>
      ))}
      <span className="absolute top-3 left-0 flex h-24 w-[4.5rem] -rotate-6 flex-col gap-1.5 rounded-xl bg-white p-2.5 shadow-xl transition-transform duration-300 group-hover:-rotate-12">
        <span className="h-1.5 w-3/4 rounded-full bg-pen" />
        <span className="h-1.5 rounded-full bg-marker" />
        <span className="h-1.5 w-5/6 rounded-full bg-edge-strong" />
        <span className="h-1.5 rounded-full bg-marker" />
        <span className="h-1.5 w-2/3 rounded-full bg-edge-strong" />
        <span className="h-1.5 w-4/5 rounded-full bg-edge-strong" />
      </span>
    </span>
  );
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone: string }) {
  return (
    <div className={`rounded-2xl px-2 py-3 ring-1 ${tone}`}>
      <p className="font-display text-3xl leading-none font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[0.7rem] tracking-wide uppercase">{label}</p>
    </div>
  );
}
