"use client";

import { useEffect, useState } from "react";
import { CheckIcon, FileIcon } from "@/components/icons";

const n = (value: number) => value.toLocaleString("en-IN");

/** Shown while the resume is checked. The steps are what the server actually does. */
export function Scanning({ fileName, indexSize }: { fileName: string; indexSize: number }) {
  const steps = ["Reading your file", "Splitting it into lines", `Comparing with ${n(indexSize)} resumes`, "Highlighting what's copied"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, steps.length - 1)), 420);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section className="mx-auto max-w-md px-4 pt-10 pb-10 sm:pt-16" role="status" aria-live="polite">
      <div className="relative">
        <div className="sheet-paper relative overflow-hidden px-6 pt-6 pb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-soft">
            <FileIcon className="h-4 w-4" />
            <span className="truncate">{fileName}</span>
          </div>
          <div className="mt-5 space-y-3" aria-hidden>
            {[92, 70, 84, 58, 88, 76, 64, 80].map((width, i) => (
              <span
                key={i}
                className={`block h-3 rounded-full transition-colors duration-500 ${i % 3 === 0 && step >= 3 ? "bg-marker" : "bg-edge"}`}
                style={{ width: `${width}%`, transitionDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <div
            className="scan-beam pointer-events-none absolute inset-x-0 top-10 h-12 bg-gradient-to-b from-transparent via-pen/15 to-transparent"
            style={{ ["--scan-distance" as string]: "190px" }}
            aria-hidden
          >
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-pen shadow-[0_0_12px_#2b54ff]" />
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-center text-3xl font-extrabold">
        Scanning<span className="blink">…</span>
      </h1>
      <ol className="mx-auto mt-5 max-w-xs space-y-2.5">
        {steps.map((label, i) => (
          <li key={label} className={`flex items-center gap-3 text-[0.95rem] transition-opacity ${i <= step ? "opacity-100" : "opacity-35"}`}>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                i < step ? "bg-good text-white" : i === step ? "bg-pen-wash text-pen" : "bg-wash text-faint"
              }`}
            >
              {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={i === step ? "font-semibold" : ""}>{label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
