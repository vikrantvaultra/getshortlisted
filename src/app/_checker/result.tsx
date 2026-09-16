"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScoreResponse } from "@/app/api/score/route";
import { CountUp } from "@/components/count-up";
import { ArrowRightIcon, HighlighterIcon, RefreshIcon, ShareIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
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
          <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-marker text-text shadow-[0_3px_0_#d9b800]">
              <SparkleIcon className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-2xl leading-tight font-extrabold">See how resumes for your role are written</h2>
              {paidEnabled ? (
                <NextSteps domains={domains} domain={domain} onDomain={setDomain} matched={result.match?.slug ?? null} />
              ) : (
                <>
                  <p className="mt-2 text-soft">We&apos;re collecting real ones from people who got placed. Get one email when it opens.</p>
                  <div className="mt-5">
                    <WaitlistForm source="twin-score" />
                  </div>
                </>
              )}
            </div>
          </div>
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
  const chosen = domains.find((option) => option.slug === domain);
  const features = [
    {
      href: chosen ? `/compare?domain=${chosen.slug}` : "/compare",
      title: "Compare my resume",
      detail: chosen
        ? `See yours next to ${COMPARE.SET_SIZE} ${chosen.label} resumes${
            chosen.total >= 20 ? `, and against the typical ${chosen.label} resume across ${n(chosen.total)} of them` : ""
          }: pages, sections, bullets and shared phrasing.`
        : `See yours next to ${COMPARE.SET_SIZE} resumes for your role: pages, sections, bullets and shared phrasing.`,
      cta: "Start comparing",
      primary: true,
    },
    {
      href: chosen ? `/library?domain=${chosen.slug}` : "/library",
      title: chosen ? `Browse ${chosen.label} resumes` : "Browse the library",
      detail: chosen
        ? chosen.readable >= COMPARE.SET_SIZE
          ? `Read ${chosen.readable} ${chosen.label} resumes in full, then explore the rest of ${fieldLabel(chosen.field)}.`
          : `Read ${chosen.readable ? `${chosen.readable} ${chosen.label} ${chosen.readable === 1 ? "resume" : "resumes"}` : `${chosen.label} examples`}${
              chosen.borrowedFrom ? ` alongside the closest role, ${chosen.borrowedFrom}` : ""
            }, and the rest of ${fieldLabel(chosen.field)}.`
        : `Read example resumes for ${domains.length} roles, from teaching and nursing to sales and software.`,
      cta: "Start browsing",
      primary: false,
    },
  ];

  return (
    <>
      <div className="mt-3 rounded-2xl bg-wash p-3">
        <label htmlFor="result-domain" className="text-sm text-soft">
          {domain && domain === matched ? "Your resume reads like" : "Your role"}
        </label>
        <select
          id="result-domain"
          className={`input mt-1.5 font-semibold ${domain ? "border-pen bg-pen-wash" : ""}`}
          value={domain}
          onChange={(event) => onDomain(event.target.value)}
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
        <p className="mt-1.5 text-xs text-faint">
          {domain && domain === matched
            ? "Matched by counting the words in your resume. Not right? Pick yours — both options below follow it."
            : "Both options below follow this choice."}
        </p>
      </div>
      <p className="mt-4 text-soft">Try either one first; you only pay when you want to see the full results.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className={`group flex flex-col rounded-2xl p-4 ring-1 transition-transform hover:-translate-y-0.5 ${feature.primary ? "bg-pen-wash ring-pen/30" : "bg-white ring-edge"}`}
          >
            <span className="font-display text-lg leading-tight font-extrabold">{feature.title}</span>
            <span className="mt-1.5 flex-1 text-sm text-soft">{feature.detail}</span>
            <span className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${feature.primary ? "text-pen" : "text-text"}`}>
              {feature.cta} <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-sm text-soft">
        One payment unlocks both: {formatRupees(PRODUCTS.pass.pricePaise)} for {PRODUCTS.pass.accessDays} days, or{" "}
        {formatRupees(PRODUCTS.lifetime.pricePaise)} for lifetime access. No subscription either way.
      </p>
    </>
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
