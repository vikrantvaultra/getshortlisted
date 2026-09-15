"use client";

import Link from "next/link";
import { useState } from "react";
import { FilePicker } from "@/components/file-picker";
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, LinkIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { EARLIEST_OFFER_YEAR, type Level } from "@/config";

type Data = {
  resume: File | null;
  proof: File | null;
  company: string;
  role: string;
  year: string;
  level: Level | "";
  email: string;
  consentCorpus: boolean;
  consentPublic: boolean;
};

const INITIAL: Data = {
  resume: null,
  proof: null,
  company: "",
  role: "",
  year: "",
  level: "",
  email: "",
  // Both unticked by default. Never bundled.
  consentCorpus: false,
  consentPublic: false,
};

const STEPS = [
  { question: "Which resume got you the offer?", hint: "The exact version you applied with." },
  { question: "Show us the offer letter.", hint: "A screenshot of the email is fine — just hide the salary." },
  { question: "Where did you get in?", hint: "Company, role and the year of the offer." },
  { question: "A little about you.", hint: "So others can find resumes like theirs." },
  { question: "What can we do with it?", hint: "Tick what you're okay with — at least one." },
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 1 - EARLIEST_OFFER_YEAR + 1 }, (_, i) => THIS_YEAR + 1 - i);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pad = (n: number) => String(n).padStart(2, "0");

export function SubmitFlow() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(INITIAL);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ deletePath: string; emailed: boolean } | null>(null);

  const set = <K extends keyof Data>(key: K, value: Data[K]) => setData((current) => ({ ...current, [key]: value }));
  const last = step === STEPS.length - 1;

  const canContinue = [
    !!data.resume,
    !!data.proof,
    !!data.company.trim() && !!data.role.trim() && !!data.year,
    !!data.level && EMAIL.test(data.email.trim()),
    data.consentCorpus || data.consentPublic,
  ][step];

  async function submit() {
    setSending(true);
    setError("");
    const form = new FormData();
    form.append("resume", data.resume!);
    form.append("proof", data.proof!);
    form.append("company", data.company);
    form.append("role", data.role);
    form.append("year", data.year);
    form.append("level", data.level);
    form.append("email", data.email.trim());
    form.append("consentCorpus", String(data.consentCorpus));
    form.append("consentPublic", String(data.consentPublic));
    try {
      const response = await fetch("/api/submit", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(response.status === 413 ? "Those files are too large together. Try a smaller screenshot." : (body.error ?? "Something went wrong."));
        return;
      }
      setDone({ deletePath: body.deletePath, emailed: body.emailed });
      window.scrollTo({ top: 0 });
    } catch {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  }

  function next(event: React.FormEvent) {
    event.preventDefault();
    if (!canContinue) return;
    setError("");
    if (last) submit();
    else {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (done) return <Done deletePath={done.deletePath} emailed={done.emailed} />;

  return (
    <section className="mx-auto max-w-xl px-4 pt-8 sm:px-6 sm:pt-14">
      {step === 0 && (
        <div className="rise mb-8 text-center">
          <span className="sticker -rotate-2">
            <SparkleIcon className="h-4 w-4" />
            Takes 2 minutes
          </span>
          <h1 className="mt-5 text-title font-extrabold">
            Got placed? Your resume can get <span className="marker">someone else</span> shortlisted.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-soft">
            Real resumes that worked are the one thing nobody can fake. Share yours — anonymously.
          </p>
        </div>
      )}

      <form onSubmit={next} className="panel p-5 sm:p-8">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={sending}
              className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-soft transition-colors hover:bg-wash hover:text-text disabled:opacity-40"
              aria-label="Back"
            >
              <ArrowLeftIcon />
            </button>
          )}
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-wash" aria-hidden>
            <div className="h-full rounded-full bg-pen transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <span className="font-mono text-sm font-medium text-soft tabular-nums">
            {pad(step + 1)} / {pad(STEPS.length)}
          </span>
        </div>

        <div key={step} className="rise">
          <h2 className="mt-7 text-[1.85rem] leading-[1.08] font-extrabold sm:text-[2.2rem]">{STEPS[step]!.question}</h2>
          <p className="mt-2 text-soft">{STEPS[step]!.hint}</p>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <>
                <FilePicker
                  label="Choose your resume"
                  hint="PDF or Word file, up to 5 MB"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  file={data.resume}
                  onChange={(file) => set("resume", file)}
                />
                <Reassure>We remove your name, phone, email, photo and exact dates before anything is used.</Reassure>
              </>
            )}

            {step === 1 && (
              <>
                <FilePicker
                  label="Choose a screenshot or PDF"
                  hint="PNG, JPG, WebP or PDF, up to 5 MB"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  file={data.proof}
                  onChange={(file) => set("proof", file)}
                />
                <Reassure>Only used to verify the offer is real. Never shown to anyone, deleted after review.</Reassure>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Company" id="company">
                  <input id="company" className="input" placeholder="e.g. TCS, Flipkart, Zoho" value={data.company} onChange={(e) => set("company", e.target.value)} maxLength={80} autoFocus />
                </Field>
                <Field label="Role" id="role">
                  <input id="role" className="input" placeholder="e.g. Software Engineer" value={data.role} onChange={(e) => set("role", e.target.value)} maxLength={80} />
                </Field>
                <Field label="Year of the offer" id="year">
                  <select id="year" className="input" value={data.year} onChange={(e) => set("year", e.target.value)}>
                    <option value="">Select year</option>
                    {YEARS.map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <fieldset>
                  <legend className="field-label">When you got the offer, you were</legend>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      [
                        ["fresher", "Fresher", "First job"],
                        ["experienced", "Experienced", "Switching jobs"],
                      ] as const
                    ).map(([value, title, sub]) => {
                      const selected = data.level === value;
                      return (
                        <label
                          key={value}
                          className={`relative flex min-h-[4.5rem] cursor-pointer flex-col justify-center rounded-2xl border-2 px-4 py-3 transition-all ${
                            selected ? "border-pen bg-pen-wash" : "border-edge bg-white hover:border-edge-strong"
                          }`}
                        >
                          <input type="radio" name="level" value={value} className="sr-only" checked={selected} onChange={() => set("level", value)} />
                          <span className="font-semibold">{title}</span>
                          <span className="text-sm text-soft">{sub}</span>
                          {selected && (
                            <span className="pop absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-pen text-white">
                              <CheckIcon className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label="Your email" id="email">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    className="input"
                    value={data.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  <span className="mt-2 block text-sm text-soft">Only to send you a link that deletes everything, any time. No newsletters.</span>
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <Consent
                  checked={data.consentCorpus}
                  onChange={(value) => set("consentCorpus", value)}
                  title="You may include my resume in the index that powers the score tool"
                  detail="People see counts, never your resume."
                />
                <Consent
                  checked={data.consentPublic}
                  onChange={(value) => set("consentPublic", value)}
                  title="You may show my resume (with my name and contact details removed) to other job seekers"
                  detail="Shown with company, role, year and college tier only."
                />
                <p className="text-sm text-soft">
                  Change your mind any time.{" "}
                  <Link href="/privacy" className="font-medium text-pen underline underline-offset-2">
                    Read the privacy policy
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-2xl bg-[#fdeeee] p-3.5 text-[0.95rem] font-medium text-warn">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" className={`btn mt-7 w-full ${last ? "btn-marker" : ""}`} disabled={!canContinue || sending}>
          {last ? (sending ? "Sending…" : "Send my resume") : "Continue"}
          {!sending && <ArrowRightIcon />}
        </button>
      </form>

      {step === 0 && (
        <ul className="rise mt-6 grid gap-2 text-sm text-soft sm:grid-cols-3" style={{ ["--delay" as string]: "150ms" }}>
          {["Checked by a human", "Two separate permissions", "Delete any time"].map((item) => (
            <li key={item} className="flex items-center justify-center gap-1.5">
              <CheckIcon className="h-4 w-4 text-good" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Reassure({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-2xl bg-pen-wash p-3.5 text-sm text-pen-dark">
      <ShieldIcon className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
    </div>
  );
}

function Consent({ checked, onChange, title, detail }: { checked: boolean; onChange: (value: boolean) => void; title: string; detail: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 transition-all ${
        checked ? "border-pen bg-pen-wash" : "border-edge bg-white hover:border-edge-strong"
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
          checked ? "border-pen bg-pen text-white" : "border-edge-strong bg-white"
        }`}
        aria-hidden
      >
        {checked && <CheckIcon className="h-4 w-4" />}
      </span>
      <span>
        <span className="block leading-snug font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-soft">{detail}</span>
      </span>
    </label>
  );
}

function Done({ deletePath, emailed }: { deletePath: string; emailed: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? deletePath : `${window.location.origin}${deletePath}`;

  return (
    <section className="mx-auto max-w-xl px-4 pt-12 text-center sm:px-6 sm:pt-20">
      <span className="pop mx-auto flex h-20 w-20 rotate-3 items-center justify-center rounded-[1.6rem] bg-good text-white shadow-[0_6px_0_#0b7a3b]">
        <CheckIcon className="h-10 w-10" />
      </span>
      <h1 className="rise mt-8 text-title font-extrabold" style={{ ["--delay" as string]: "150ms" }}>
        You just helped <span className="marker">the next person</span>.
      </h1>
      <p className="rise mx-auto mt-4 max-w-md text-lg text-soft" style={{ ["--delay" as string]: "250ms" }}>
        We&apos;ll verify your offer by hand and remove your personal details before anything is used.
      </p>

      <div className="rise panel mt-9 p-5 text-left sm:p-6" style={{ ["--delay" as string]: "350ms" }}>
        <p className="kicker">Keep this safe</p>
        <p className="mt-1.5 text-lg font-semibold">Your deletion link</p>
        <p className="mt-1 text-sm text-soft">{emailed ? "We've emailed it to you too. " : ""}Opening it lets you delete everything you sent, in one tap.</p>
        <div className="mt-4 flex items-center gap-2">
          <input readOnly value={url} className="input min-h-12 flex-1 font-mono text-sm" onFocus={(e) => e.currentTarget.select()} aria-label="Deletion link" />
          <button
            type="button"
            className={`btn min-h-12 shrink-0 px-4 ${copied ? "" : "btn-outline"}`}
            onClick={() =>
              navigator.clipboard
                ?.writeText(url)
                .then(() => setCopied(true))
                .catch(() => {})
            }
            aria-label="Copy deletion link"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      <Link href="/" className="btn mt-8 w-full sm:w-auto">
        Now check your own resume
        <ArrowRightIcon />
      </Link>
    </section>
  );
}
