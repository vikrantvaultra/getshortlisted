"use client";

import { useEffect, useRef, useState } from "react";
import type { TopLinesFile } from "@/lib/scoring/index-file";

const n = (value: number) => value.toLocaleString("en-IN");

/** Leaderboard of whole lines repeated word for word. Bars grow when scrolled into view. */
export function TopCopied({ data }: { data: TopLinesFile }) {
  const ref = useRef<HTMLOListElement>(null);
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const lines = showAll ? data.lines : data.lines.slice(0, 5);
  const max = data.lines[0]?.docCount ?? 1;

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return setVisible(true);
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setVisible(true), { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ol ref={ref} className="mt-8 space-y-3">
        {lines.map((line, i) => {
          const percent = (line.docCount / data.documents) * 100;
          return (
            <li key={line.text} className="panel flex gap-4 p-4 sm:p-5">
              <span className={`font-display text-3xl leading-none font-extrabold ${i < 3 ? "text-text" : "text-edge-strong"}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="leading-snug font-medium">&ldquo;{line.text}&rdquo;</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-wash">
                    <span
                      className="block h-full rounded-full bg-marker transition-[width] duration-1000 ease-out"
                      style={{ width: visible ? `${(line.docCount / max) * 100}%` : "0%", transitionDelay: `${i * 80}ms` }}
                    />
                  </span>
                  <span className="shrink-0 font-mono text-xs text-soft">
                    {n(line.docCount)} · {percent >= 1 ? Math.round(percent) : "<1"}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {data.lines.length > 5 && (
        <button type="button" className="mt-3 text-sm font-semibold text-pen hover:underline" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show top 5" : `Show all ${data.lines.length}`}
        </button>
      )}
    </>
  );
}
