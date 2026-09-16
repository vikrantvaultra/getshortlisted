"use client";

import { useState } from "react";
import type { CompareColumn, CompareResponse } from "@/app/api/compare/route";
import { FileField } from "@/components/file-picker";
import { AlertIcon, ArrowRightIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { PayPanel } from "@/components/pay-panel";
import { ResumeText } from "@/components/resume-text";
import { ModelResumeTag } from "@/components/sample-tag";
import { COMPARE, type Level } from "@/config";

const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;

type Row = {
  label: string;
  value: (column: CompareColumn) => string;
  /** Numeric value for the placed-set range; omit for rows without one. */
  numeric?: (column: CompareColumn) => number | null;
};

const ROWS: Row[] = [
  {
    label: "Pages",
    value: (c) => `${c.metrics.pageCount}${c.metrics.pageCountEstimated ? " (est.)" : ""}`,
    numeric: (c) => c.metrics.pageCount,
  },
  { label: "Sections", value: (c) => String(c.metrics.sectionCount), numeric: (c) => c.metrics.sectionCount },
  { label: "Section order", value: (c) => c.metrics.sectionOrder.join(" → ") || "—" },
  { label: "Projects", value: (c) => String(c.metrics.projects.projects), numeric: (c) => c.metrics.projects.projects },
  {
    label: "Bullets per project",
    value: (c) => (c.metrics.projects.bulletsPerProject.length ? c.metrics.projects.bulletsPerProject.join(", ") : "—"),
  },
  {
    label: "Average bullets per project",
    value: (c) => (c.metrics.projects.average === null ? "—" : String(c.metrics.projects.average)),
    numeric: (c) => c.metrics.projects.average,
  },
  {
    label: "Certifications section",
    value: (c) => (c.metrics.certificationsPosition ? `${ordinal(c.metrics.certificationsPosition)} of ${c.metrics.sectionCount}` : "None"),
  },
  {
    label: "Lines overlapping the placed set",
    value: (c) => `${c.overlap.commonCount} of ${c.overlap.totalCount}`,
    numeric: (c) => c.overlap.commonCount,
  },
  { label: "Phrase-overlap score", value: (c) => `${c.overlap.percentage}%`, numeric: (c) => c.overlap.percentage },
  {
    label: "Average words per line",
    value: (c) => (c.metrics.averageWordsPerLine === null ? "—" : String(c.metrics.averageWordsPerLine)),
    numeric: (c) => c.metrics.averageWordsPerLine,
  },
  { label: "Bulleted lines", value: (c) => String(c.metrics.totalBullets), numeric: (c) => c.metrics.totalBullets },
  { label: "Words", value: (c) => String(c.metrics.wordCount), numeric: (c) => c.metrics.wordCount },
];

/** The rows shown as "You vs placed range" tiles on small screens. */
const TILE_ROWS = ["Pages", "Sections", "Average bullets per project", "Phrase-overlap score", "Average words per line", "Words"];

function range(row: Row, columns: CompareColumn[]): string {
  if (!row.numeric) return "";
  const values = columns.map(row.numeric).filter((v): v is number => v !== null);
  if (!values.length) return "—";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const suffix = row.label === "Phrase-overlap score" ? "%" : "";
  return min === max ? `${min}${suffix}` : `${min}–${max}${suffix}`;
}

const STEPS = [
  ["Pick a company", "Choose where you're applying. Narrow to fresher or experienced resumes if you like."],
  ["Upload your resume", "PDF or Word. It's read in memory and never stored."],
  ["See the counts", "Pages, sections, bullets per project and shared phrasing — yours next to five resumes built to the shortlisted standard."],
] as const;

type Props = { companies: string[]; price: string; accessDays: number; demo: boolean };

export function CompareClient({ companies, price, accessDays, demo }: Props) {
  const [company, setCompany] = useState(companies[0] ?? "");
  const [level, setLevel] = useState<Level | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);

  async function compare() {
    if (!file) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("resume", file);
    form.append("company", company);
    form.append("level", level);
    try {
      const response = await fetch("/api/compare", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error ?? "Something went wrong.");
      else setResult(data as CompareResponse);
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

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="max-w-2xl">
        <p className="kicker">Compare</p>
        <h1 className="mt-2 text-title font-extrabold">
          Your resume, next to <span className="marker">five that get shortlisted</span>.
        </h1>
        <p className="mt-3 text-lg text-soft">
          See how your resume is built compared with five resumes for your target company — model resumes written to the shortlisted standard,
          plus verified submissions where we have them. Everything is counted, nothing is guessed, and there&apos;s no AI commentary.
        </p>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {STEPS.map(([title, detail], i) => (
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
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr]">
          <div>
            <label htmlFor="company" className="field-label">
              Target company
            </label>
            <select id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} disabled={busy}>
              {companies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="level" className="field-label">
              Compare with
            </label>
            <select id="level" className="input" value={level} onChange={(e) => setLevel(e.target.value as Level | "")} disabled={busy}>
              <option value="">Any level</option>
              <option value="fresher">Freshers</option>
              <option value="experienced">Experienced hires</option>
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
                Compare with {COMPARE.SET_SIZE} {company} resumes <ArrowRightIcon className="h-4 w-4" />
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
            Counting your resume against five {company} resumes<span className="blink">…</span>
          </p>
        </div>
      )}

      {result?.locked && !busy && (
        <LockedResult result={result} price={price} accessDays={accessDays} demo={demo} onPaid={() => void compare()} />
      )}

      {unlocked && you && (
        <>
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-3xl font-extrabold">The counts</h2>
              <p className="text-sm text-soft">
                Placed range = lowest to highest across the five {unlocked.company} resumes.
              </p>
            </div>

            {/* Tiles: quick read on any screen */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
              {ROWS.filter((row) => TILE_ROWS.includes(row.label)).map((row, i) => (
                <div key={row.label} className="panel rise p-4" style={{ ["--delay" as string]: `${i * 60}ms` }}>
                  <p className="text-xs font-semibold text-soft">{row.label}</p>
                  <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-pen">{row.value(you)}</p>
                  <p className="mt-1 text-xs text-soft">
                    placed <span className="rounded bg-marker-soft px-1 font-mono text-text">{range(row, placed)}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Full table */}
            <div className="panel mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-collapse text-left text-[0.9rem]">
                  <thead>
                    <tr className="border-b border-edge bg-wash align-bottom">
                      <th className="sticky left-0 z-10 w-44 bg-wash px-4 py-3 text-xs font-semibold text-soft">Measure</th>
                      <th className="bg-pen px-3 py-3 font-semibold text-white">You</th>
                      <th className="bg-marker-soft px-3 py-3 font-semibold">Placed range</th>
                      {placed.map((column, i) => (
                        <th key={column.id} className="px-3 py-3 font-normal">
                          <span className="block font-semibold">
                            {i + 1}. {column.label}
                            {column.sample && <ModelResumeTag />}
                          </span>
                          <span className="block text-xs text-soft capitalize">{column.meta}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.label} className="border-b border-edge align-top last:border-0">
                        <th className="sticky left-0 z-10 w-44 bg-white px-4 py-3 font-semibold">{row.label}</th>
                        <td className="min-w-40 bg-pen-wash px-3 py-3 font-mono font-medium text-pen-dark">{row.value(you)}</td>
                        <td className="min-w-32 bg-marker-soft/50 px-3 py-3 font-mono">{range(row, placed)}</td>
                        {placed.map((column) => (
                          <td key={column.id} className="min-w-40 px-3 py-3 font-mono text-soft">
                            {row.value(column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-extrabold">Side by side</h2>
            <p className="mt-1 text-sm text-soft">
              Swipe across. In your column, <span className="marker">highlighted</span> lines use phrasing that also appears in the placed set.
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
                    {column.sample && <ModelResumeTag />}
                  </p>
                  <p className="text-sm text-soft">
                    <span className="font-semibold text-text">{unlocked.company}</span> · <span className="capitalize">{column.meta}</span>
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

/**
 * What an unpaid user sees once their comparison has run: their own numbers,
 * with every placed-set value blurred behind the pay panel. The placeholders
 * are not real values — the server doesn't send those without access.
 */
function LockedResult({
  result,
  price,
  accessDays,
  demo,
  onPaid,
}: {
  result: Extract<CompareResponse, { locked: true }>;
  price: string;
  accessDays: number;
  demo: boolean;
  onPaid: () => void;
}) {
  const { you, placed, company } = result;
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-3xl font-extrabold">The counts</h2>
        <p className="flex items-center gap-1.5 text-sm text-soft">
          <LockIcon className="h-4 w-4" /> The {placed.length} {company} resumes are locked
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {ROWS.filter((row) => TILE_ROWS.includes(row.label)).map((row, i) => (
          <div key={row.label} className="panel rise p-4" style={{ ["--delay" as string]: `${i * 60}ms` }}>
            <p className="text-xs font-semibold text-soft">{row.label}</p>
            <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-pen">{row.value(you)}</p>
            <p className="mt-1 text-xs text-soft">
              placed{" "}
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
              <p className="font-display text-lg font-extrabold">{i + 1}. Placed resume</p>
              <p className="text-sm text-soft capitalize">
                {company} · {column.meta}
              </p>
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
            title={`Your comparison with ${placed.length} ${company} resumes is ready`}
            price={price}
            accessDays={accessDays}
            demo={demo}
            onPaid={onPaid}
          />
        </div>
      </div>
    </section>
  );
}
