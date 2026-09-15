"use client";

import { useEffect, useState } from "react";
import type { DemoLine } from "./home";

/**
 * A resume sheet that highlights itself. The lines and verdicts are real —
 * scored against the live index on the server.
 */
export function HeroSheet({ lines }: { lines: DemoLine[] }) {
  const [marked, setMarked] = useState(0);
  const total = lines.length;
  const commonTotal = lines.filter((line) => line.common).length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setMarked(total);
    let i = 0;
    const timer = setInterval(() => {
      i = i >= total + 3 ? 0 : i + 1; // pause on the finished sheet, then replay
      setMarked(Math.min(i, total));
    }, 700);
    return () => clearInterval(timer);
  }, [total]);

  const counted = lines.slice(0, marked).filter((line) => line.common).length;

  return (
    <div className="relative mx-auto w-full max-w-md md:max-w-none">
      <div className="float sheet-paper relative px-5 pt-6 pb-7 sm:px-7" style={{ ["--tilt" as string]: "-1.5deg", transform: "rotate(-1.5deg)" }}>
        <div className="flex items-center gap-3 border-b border-edge pb-4">
          <span className="h-10 w-10 rounded-full bg-wash" />
          <span className="space-y-1.5">
            <span className="block h-2.5 w-28 rounded-full bg-edge-strong" />
            <span className="block h-2 w-40 rounded-full bg-edge" />
          </span>
        </div>
        <p className="mt-4 font-mono text-[0.7rem] tracking-wider text-pen uppercase">Experience</p>
        <ul className="mt-2 space-y-2.5 text-[0.93rem] leading-snug sm:text-[1rem]">
          {lines.map((line, i) => {
            const on = i < marked;
            return (
              <li key={i} className="flex gap-2">
                <span className={`mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full ${on && !line.common ? "bg-pen" : "bg-edge-strong"}`} />
                <span className={on && line.common ? "marker marker-sweep" : ""}>{line.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="absolute -top-4 -right-1 rotate-3 rounded-2xl bg-text px-4 py-3 text-white shadow-xl sm:-right-4" aria-live="polite">
        <p className="font-mono text-[0.68rem] tracking-wider text-white/60 uppercase">Copied lines</p>
        <p className="font-display text-3xl leading-none font-extrabold">
          <span className="text-marker">{counted}</span>
          <span className="text-white/50">/{total}</span>
        </p>
      </div>

      {marked >= total && commonTotal < total && (
        <div className="pop absolute -bottom-5 left-2 -rotate-2 rounded-xl bg-pen px-3 py-2 text-sm font-semibold text-white shadow-lg">
          {total - commonTotal} lines only this person wrote ✓
        </div>
      )}
    </div>
  );
}
