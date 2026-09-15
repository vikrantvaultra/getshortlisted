"use client";

import { useState } from "react";
import type { LineCheckResponse } from "@/app/api/line/route";
import { HighlighterIcon, SearchIcon, SparkleIcon } from "@/components/icons";

const n = (value: number) => value.toLocaleString("en-IN");

export function LineTester({ examples, indexSize }: { examples: string[]; indexSize: number }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ text: string; data: LineCheckResponse } | null>(null);

  async function run(value = text) {
    const line = value.trim();
    if (!line) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/line", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: line }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error ?? "Couldn't check that. Try again.");
      else setResult({ text: line, data: data as LineCheckResponse });
    } catch {
      setError("Couldn't connect. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel p-4 sm:p-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
      >
        <label htmlFor="line" className="sr-only">
          A line from your resume
        </label>
        <textarea
          id="line"
          rows={3}
          maxLength={400}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run();
            }
          }}
          placeholder="e.g. Developed a responsive web application using React and Node.js"
          className="input resize-none text-[1.02rem] leading-snug"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-sm text-faint">Try:</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="chip max-w-[15rem] truncate transition-colors hover:bg-pen-wash hover:text-pen"
                onClick={() => {
                  setText(example);
                  run(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
          <button type="submit" className="btn shrink-0" disabled={busy || !text.trim()}>
            <SearchIcon />
            {busy ? "Checking…" : "Check line"}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-warn">{error}</p>}

      {result && <Verdict key={result.text} text={result.text} data={result.data} indexSize={indexSize} />}
    </div>
  );
}

function Verdict({ text, data, indexSize }: { text: string; data: LineCheckResponse; indexSize: number }) {
  if (data.status === "too-short") {
    return (
      <div className="pop mt-5 rounded-2xl bg-wash p-4 text-soft">
        That&apos;s too short to check. Lines need at least five words — try a full bullet point.
      </div>
    );
  }

  const share = Math.max(1, Math.round((data.peakDocCount / data.indexSize) * 100));

  if (data.common) {
    return (
      <div className="pop mt-5 rounded-2xl border-2 border-marker bg-marker-soft p-5">
        <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-wider text-marker-ink uppercase">
          <HighlighterIcon className="h-4 w-4" /> Seen before
        </p>
        <p className="mt-3 text-lg leading-snug">
          <span className="marker marker-sweep">{text}</span>
        </p>
        <p className="mt-4 text-[0.95rem] text-[#3d3300]">
          Its most common phrase appears in <strong className="font-display text-xl font-extrabold">{n(data.peakDocCount)}</strong> of{" "}
          {n(indexSize)} resumes{share >= 1 ? ` — about ${share}%` : ""}. {data.seenPhrases} of its {data.totalPhrases} phrases are already out
          there.
        </p>
      </div>
    );
  }

  return (
    <div className="pop mt-5 rounded-2xl border-2 border-pen/30 bg-pen-wash p-5">
      <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-wider text-pen uppercase">
        <SparkleIcon className="h-4 w-4" /> Looks like yours
      </p>
      <p className="mt-3 text-lg leading-snug">
        <span className="pen-underline">{text}</span>
      </p>
      <p className="mt-4 text-[0.95rem] text-soft">
        {data.seenPhrases === 0
          ? `None of its phrases appear in two or more of our ${n(indexSize)} resumes.`
          : `${data.seenPhrases} of its ${data.totalPhrases} phrases have been seen before — not enough to count as copied.`}
      </p>
    </div>
  );
}
