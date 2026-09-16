"use client";

import { useState } from "react";
import type { CompareColumn, CompareRanges, CompareResponse } from "@/app/api/compare/route";
import { FileField } from "@/components/file-picker";
import { AlertIcon, ArrowRightIcon, LockIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { PayPanel } from "@/components/pay-panel";
import { ResumeText } from "@/components/resume-text";
import { OriginTag } from "@/components/sample-tag";
import { COMPARE, type Level } from "@/config";
import { AUTO_DOMAIN, FIELDS, fieldLabel, rememberDomain, type DomainOption, type FieldId } from "@/lib/fields";

const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;

type Row = {
  label: string;
  value: (column: CompareColumn) => string;
  /** Numeric value for the range column; omit for rows without one. */
  numeric?: (column: CompareColumn) => number | null;
  /** The role-wide typical range for this row, when the build has one. */
  rangeKey?: keyof CompareRanges;
};

const ROWS: Row[] = [
  {
    label: "Pages",
    value: (c) => `${c.metrics.pageCount}${c.metrics.pageCountEstimated ? " (est.)" : ""}`,
    numeric: (c) => c.metrics.pageCount,
    rangeKey: "pageCount",
  },
  { label: "Sections", value: (c) => String(c.metrics.sectionCount), numeric: (c) => c.metrics.sectionCount, rangeKey: "sectionCount" },
  { label: "Section order", value: (c) => c.metrics.sectionOrder.join(" → ") || "—" },
  { label: "Projects", value: (c) => String(c.metrics.projects.projects), numeric: (c) => c.metrics.projects.projects, rangeKey: "projects" },
  {
    label: "Bullets per project",
    value: (c) => (c.metrics.projects.bulletsPerProject.length ? c.metrics.projects.bulletsPerProject.join(", ") : "—"),
  },
  {
    label: "Average bullets per project",
    value: (c) => (c.metrics.projects.average === null ? "—" : String(c.metrics.projects.average)),
    numeric: (c) => c.metrics.projects.average,
    rangeKey: "bulletsPerProject",
  },
  {
    label: "Certifications section",
    value: (c) => (c.metrics.certificationsPosition ? `${ordinal(c.metrics.certificationsPosition)} of ${c.metrics.sectionCount}` : "None"),
  },
  {
    label: "Lines overlapping the other five",
    value: (c) => `${c.overlap.commonCount} of ${c.overlap.totalCount}`,
    numeric: (c) => c.overlap.commonCount,
  },
  { label: "Phrase-overlap score", value: (c) => `${c.overlap.percentage}%`, numeric: (c) => c.overlap.percentage },
  {
    label: "Average words per line",
    value: (c) => (c.metrics.averageWordsPerLine === null ? "—" : String(c.metrics.averageWordsPerLine)),
    numeric: (c) => c.metrics.averageWordsPerLine,
    rangeKey: "averageWordsPerLine",
  },
  { label: "Bulleted lines", value: (c) => String(c.metrics.totalBullets), numeric: (c) => c.metrics.totalBullets, rangeKey: "totalBullets" },
  { label: "Words", value: (c) => String(c.metrics.wordCount), numeric: (c) => c.metrics.wordCount, rangeKey: "wordCount" },
];

/** The rows shown as "You vs typical" tiles on small screens. */
const TILE_ROWS = ["Pages", "Sections", "Bulleted lines", "Phrase-overlap score", "Average words per line", "Words"];

const fmt = (value: number) => (Number.isInteger(value) ? value.toLocaleString("en-IN") : String(value));

/** The role-wide middle half when there is one, otherwise lowest–highest across the five. */
function range(row: Row, columns: CompareColumn[], ranges: CompareRanges): { text: string; typical: boolean } {
  if (!row.numeric) return { text: "", typical: false };
  const suffix = row.label === "Phrase-overlap score" ? "%" : "";
  const typical = row.rangeKey ? ranges[row.rangeKey] : undefined;
  if (typical) {
    const low = Math.round(typical.low);
    const high = Math.round(typical.high);
    return { text: low === high ? fmt(low) : `${fmt(low)}–${fmt(high)}`, typical: true };
  }
  const values = columns.map(row.numeric).filter((v): v is number => v !== null);
  if (!values.length) return { text: "—", typical: false };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { text: min === max ? `${fmt(min)}${suffix}` : `${fmt(min)}–${fmt(max)}${suffix}`, typical: false };
}

/** Where a value sits against its range: a short, factual word, no advice. */
function position(row: Row, you: CompareColumn, columns: CompareColumn[], ranges: CompareRanges): "below" | "within" | "above" | null {
  if (!row.numeric) return null;
  const value = row.numeric(you);
  if (value === null) return null;
  const typical = row.rangeKey ? ranges[row.rangeKey] : undefined;
  let low: number;
  let high: number;
  if (typical) {
    low = Math.round(typical.low);
    high = Math.round(typical.high);
  } else {
    const values = columns.map(row.numeric).filter((v): v is number => v !== null);
    if (!values.length) return null;
    low = Math.min(...values);
    high = Math.max(...values);
  }
  return value < low ? "below" : value > high ? "above" : "within";
}

// Outside the range isn't wrong, just different — so no red.
const POSITION_STYLE = { below: "bg-marker-soft text-marker-ink", within: "bg-[#effaf3] text-[#0b6b35]", above: "bg-marker-soft text-marker-ink" } as const;

const steps = (roles: number) => [
  ["Pick your role", `We match it from your resume, or choose from ${roles} roles. Add a target company if you have one.`],
  ["Upload your resume", "PDF or Word. It's read in memory and never stored."],
  ["See the counts", "Pages, sections, bullets and shared phrasing — yours next to five resumes for the same role and the typical range for it."],
];

type Props = {
  domains: DomainOption[];
  companies: string[];
  initialDomain: string;
  /** The initial role came from the visitor's own scan. */
  fromScan: boolean;
  demo: boolean;
};

/** Companies are only a useful target where the model resumes were written for them. */
const COMPANY_FIELDS: FieldId[] = ["software", "data", "cloud-security"];

export function CompareClient({ domains, companies, initialDomain, fromScan, demo }: Props) {
  const [domain, setDomain] = useState(initialDomain);
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);

  const chosen = domains.find((option) => option.slug === domain);
  const showCompanies = companies.length > 0 && (!chosen || COMPANY_FIELDS.includes(chosen.field) || !!company);
  const targetName = company || chosen?.label || "matching";

  function chooseDomain(slug: string) {
    setDomain(slug);
    if (slug !== AUTO_DOMAIN) rememberDomain(slug);
    const option = domains.find((d) => d.slug === slug);
    if (option && !COMPANY_FIELDS.includes(option.field)) setCompany("");
  }

  async function compare(domainOverride?: string) {
    if (!file) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("resume", file);
    form.append("domain", domainOverride ?? domain);
    form.append("company", company);
    form.append("level", level);
    try {
      const response = await fetch("/api/compare", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error ?? "Something went wrong.");
      else {
        const next = data as CompareResponse;
        setResult(next);
        // Keep the picker on the role that was actually used, so "compare again" repeats it.
        setDomain(next.target.slug);
        rememberDomain(next.target.slug);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  function run(event: React.FormEvent) {
    event.preventDefault();
    void compare();
  }

  const unlocked = result && !result.locked ? result : null;
  const you = unlocked?.columns[0];
  const placed = unlocked?.columns.slice(1) ?? [];
  const ranges = unlocked?.ranges ?? {};
  const hasTypical = Object.keys(ranges).length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="max-w-2xl">
        <p className="kicker">Compare</p>
        <h1 className="mt-2 text-title font-extrabold">
          Your resume, next to <span className="marker">five for your role</span>.
        </h1>
        <p className="mt-3 text-lg text-soft">
          See how your resume is built compared with resumes for the same job — a teacher against teachers, a nurse against nurses — and against
          the typical range for that role across our open datasets. Everything is counted, nothing is guessed, and there&apos;s no AI commentary.
        </p>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {steps(domains.length).map(([title, detail], i) => (
          <li key={title} className="flex gap-3 rounded-2xl bg-wash p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pen font-mono text-sm font-medium text-white">{i + 1}</span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="mt-0.5 block text-sm text-soft">{detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={run} className="panel mt-7 overflow-hidden">
        {fromScan && chosen && domain === initialDomain && (
          <p className="flex items-center gap-2 border-b border-edge bg-pen-wash px-4 py-2.5 text-sm text-pen sm:px-6">
            <SparkleIcon className="h-4 w-4 shrink-0" />
            <span>
              Set to <strong className="font-semibold">{chosen.label}</strong> from your resume scan. Change it if that&apos;s not your role.
            </span>
          </p>
        )}
        <div className={`grid gap-4 p-4 sm:p-6 md:grid-cols-2 ${showCompanies ? "lg:grid-cols-[1.2fr_1fr_0.8fr_1.35fr]" : "lg:grid-cols-[1.2fr_0.8fr_1.35fr]"}`}>
          <div>
            <label htmlFor="domain" className="field-label">
              Your role
            </label>
            <select id="domain" className="input" value={domain} onChange={(e) => chooseDomain(e.target.value)} disabled={busy}>
              <option value={AUTO_DOMAIN}>Match it from my resume</option>
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
          {showCompanies && (
            <div>
              <label htmlFor="company" className="field-label">
                Target company <span className="font-normal text-faint">(optional)</span>
              </label>
              <select id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} disabled={busy}>
                <option value="">Any employer</option>
                {companies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="level" className="field-label">
              Compare with
            </label>
            <select id="level" className="input" value={level} onChange={(e) => setLevel(e.target.value as Level | "")} disabled={busy}>
              <option value="">Any level</option>
              <option value="fresher">Freshers</option>
              <option value="experienced">Experienced</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <FileField
              label="Your resume"
              placeholder="Choose your resume"
              hint="PDF or Word, up to 5 MB"
              accept=".pdf,.docx"
              file={file}
              onChange={setFile}
              disabled={busy}
            />
          </div>
        </div>
        {chosen && chosen.borrowedFrom && !company && (
          <p className="border-t border-edge px-4 py-2.5 text-sm text-soft sm:px-6">
            We don&apos;t have five readable {chosen.label} resumes yet, so the side-by-side uses the closest role ({chosen.borrowedFrom}).
            {chosen.total >= 20 && ` The typical ranges are still counted across ${chosen.total.toLocaleString("en-IN")} ${chosen.label} resumes.`}
          </p>
        )}
        <div className="flex flex-col gap-3 border-t border-edge bg-wash px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 text-sm text-soft">
            <ShieldIcon className="h-4 w-4 shrink-0" />
            Read in memory to count, never stored.
          </p>
          <button type="submit" className="btn w-full sm:w-auto" disabled={!file || busy}>
            {busy ? (
              "Counting…"
            ) : (
              <>
                Compare with {COMPARE.SET_SIZE} {targetName} resumes <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl bg-[#fdecec] p-4 font-medium text-warn">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </p>
      )}

      {busy && (
        <div className="panel mt-8 flex items-center gap-4 p-5" role="status">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-edge bg-sheet">
            <span className="scan-beam absolute inset-x-0 top-0 h-1 bg-pen" style={{ ["--scan-distance" as string]: "52px" }} />
          </div>
          <p className="font-semibold">
            Counting your resume against five {targetName} resumes<span className="blink">…</span>
          </p>
        </div>
      )}

      {result && !busy && <TargetNote result={result} />}

      {result?.locked && !busy && <LockedResult result={result} demo={demo} onPaid={() => void compare(result.target.slug)} />}

      {unlocked && you && !busy && (
        <>
          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-3xl font-extrabold">The counts</h2>
              <p className="max-w-xl text-sm text-soft">
                {hasTypical ? (
                  <>
                    Typical = the middle half of {unlocked.target.total.toLocaleString("en-IN")} {unlocked.target.label} resumes in open datasets (real
                    resumes and generated examples). Rows without one use the five below.
                  </>
                ) : (
                  <>Range = lowest to highest across the five resumes below.</>
                )}
              </p>
            </div>

            {/* Tiles: quick read on any screen */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
              {ROWS.filter((row) => TILE_ROWS.includes(row.label)).map((row, i) => {
                const r = range(row, placed, ranges);
                const where = position(row, you, placed, ranges);
                return (
                  <div key={row.label} className="panel rise p-4" style={{ ["--delay" as string]: `${i * 60}ms` }}>
                    <p className="text-xs font-semibold text-soft">{row.label}</p>
                    <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-pen">{row.value(you)}</p>
                    <p className="mt-1 text-xs text-soft">
                      {r.typical ? "typical" : "these five"} <span className="rounded bg-marker-soft px-1 font-mono text-text">{r.text}</span>
                    </p>
                    {where && <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${POSITION_STYLE[where]}`}>{where} range</span>}
                  </div>
                );
              })}
            </div>

            {/* Full table */}
            <div className="panel mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-collapse text-left text-[0.9rem]">
                  <thead>
                    <tr className="border-b border-edge bg-wash align-bottom">
                      <th className="sticky left-0 z-10 w-44 bg-wash px-4 py-3 text-xs font-semibold text-soft">Measure</th>
                      <th className="bg-pen px-3 py-3 font-semibold text-white">You</th>
                      <th className="bg-marker-soft px-3 py-3 font-semibold">{hasTypical ? `Typical ${unlocked.target.label}` : "Range of the five"}</th>
                      {placed.map((column, i) => (
                        <th key={column.id} className="px-3 py-3 font-normal">
                          <span className="block font-semibold">
                            {i + 1}. {column.label}
                            <OriginTag resume={{ origin: column.origin ?? "submission", sample: column.sample }} />
                          </span>
                          <span className="block text-xs text-soft capitalize">
                            {column.company ? `${column.company} · ` : ""}
                            {column.meta}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => {
                      const r = range(row, placed, ranges);
                      return (
                        <tr key={row.label} className="border-b border-edge align-top last:border-0">
                          <th className="sticky left-0 z-10 w-44 bg-white px-4 py-3 font-semibold">{row.label}</th>
                          <td className="min-w-40 bg-pen-wash px-3 py-3 font-mono font-medium text-pen-dark">{row.value(you)}</td>
                          <td className="min-w-32 bg-marker-soft/50 px-3 py-3 font-mono">
                            {r.text}
                            {r.text && hasTypical && !r.typical && <span className="ml-1 font-sans text-xs text-soft">(five)</span>}
                          </td>
                          {placed.map((column) => (
                            <td key={column.id} className="min-w-40 px-3 py-3 font-mono text-soft">
                              {row.value(column)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-extrabold">Side by side</h2>
            <p className="mt-1 text-sm text-soft">
              Swipe across. In your column, <span className="marker">highlighted</span> lines use phrasing that also appears in the five.
            </p>
            <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6">
              <div className="sheet-paper w-[85vw] max-w-[380px] shrink-0 snap-start p-5 ring-2 ring-pen">
                <p className="font-mono text-[0.72rem] font-medium tracking-wider text-pen uppercase">You</p>
                <ol className="mt-4 space-y-2 text-[0.82rem] leading-snug">
                  {you.overlap.lines.map((line, i) => (
                    <li key={i}>{line.common ? <span className="marker">{line.text}</span> : line.text}</li>
                  ))}
                </ol>
              </div>
              {placed.map((column, i) => (
                <div key={column.id} className="sheet-paper w-[85vw] max-w-[380px] shrink-0 snap-start p-5">
                  <p className="font-display text-lg leading-tight font-extrabold">
                    {i + 1}. {column.label}
                    <OriginTag resume={{ origin: column.origin ?? "submission", sample: column.sample }} />
                  </p>
                  <p className="text-sm text-soft">
                    {column.company && <span className="font-semibold text-text">{column.company} · </span>}
                    <span className="capitalize">{column.meta}</span>
                  </p>
                  <div className="mt-4">
                    <ResumeText text={column.text ?? ""} compact />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/** Which role the comparison used, and why — so a wrong match is easy to spot and fix. */
function TargetNote({ result }: { result: CompareResponse }) {
  const { target, borrowedFrom } = result;
  return (
    <div className="mt-8 space-y-2">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-pen px-3 py-1 font-semibold text-white">{target.label}</span>
        <span className="text-soft">
          {fieldLabel(target.field)}
          {target.company && ` · ${target.company}`}
          {target.detected ? " · matched from your resume. Not right? Pick your role above and compare again." : ""}
        </span>
      </p>
      {borrowedFrom && (
        <p className="rounded-2xl bg-wash px-4 py-2.5 text-sm text-soft">
          There aren&apos;t five readable {target.label} resumes yet, so the five below are {borrowedFrom} resumes, the closest role we have.
        </p>
      )}
    </div>
  );
}

/**
 * What an unpaid user sees once their comparison has run: their own numbers,
 * with every comparison value blurred behind the pay panel. The placeholders
 * are not real values — the server doesn't send those without access.
 */
function LockedResult({
  result,
  demo,
  onPaid,
}: {
  result: Extract<CompareResponse, { locked: true }>;
  demo: boolean;
  onPaid: () => void;
}) {
  const { you, placed, target } = result;
  const name = target.company ?? target.label;
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-3xl font-extrabold">The counts</h2>
        <p className="flex items-center gap-1.5 text-sm text-soft">
          <LockIcon className="h-4 w-4" /> The {placed.length} {name} resumes and the typical range are locked
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {ROWS.filter((row) => TILE_ROWS.includes(row.label)).map((row, i) => (
          <div key={row.label} className="panel rise p-4" style={{ ["--delay" as string]: `${i * 60}ms` }}>
            <p className="text-xs font-semibold text-soft">{row.label}</p>
            <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-pen">{row.value(you)}</p>
            <p className="mt-1 text-xs text-soft">
              typical{" "}
              <span aria-label="locked" className="rounded bg-marker-soft px-1 font-mono text-text blur-[4px] select-none">
                0–0
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-6 min-h-[38rem] overflow-hidden">
        <div aria-hidden className="pointer-events-none flex gap-4 blur-[3px] select-none">
          {placed.map((column, i) => (
            <div key={i} className="sheet-paper w-[85vw] max-w-[300px] shrink-0 p-5">
              <p className="font-display text-lg font-extrabold">
                {i + 1}. {target.label} resume
              </p>
              <p className="text-sm text-soft capitalize">{column.meta}</p>
              {Array.from({ length: 22 }, (_, j) => (
                <span key={j} className={`mt-2.5 block h-2 rounded-full ${j % 4 === 0 ? "w-1/2 bg-pen/40" : "bg-edge-strong"}`} style={j % 4 ? { width: `${60 + ((i + j) * 17) % 40}%` } : undefined} />
              ))}
            </div>
          ))}
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/30 to-white" />
        <div className="absolute inset-0 flex items-start justify-center px-2 pt-6 sm:pt-10">
          <PayPanel
            className="w-full max-w-sm"
            title={`Your comparison with ${placed.length} ${name} resumes is ready`}
            demo={demo}
            onPaid={onPaid}
          />
        </div>
      </div>
    </section>
  );
}
