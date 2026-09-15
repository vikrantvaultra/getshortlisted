/** Renders redacted resume text on paper: CAPS lines as section heads, "•" lines as bullets. */
export function ResumeText({ text, compact = false }: { text: string; compact?: boolean }) {
  const blocks = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <div className={compact ? "text-[0.8rem] leading-snug" : "text-[0.97rem] leading-relaxed"}>
      {blocks.map((line, i) => {
        if (/^[A-Z][A-Z0-9 &/,'()-]{2,}$/.test(line)) {
          return (
            <p key={i} className={`font-mono text-[0.72rem] font-medium tracking-wider text-pen uppercase ${i === 0 ? "" : compact ? "mt-4" : "mt-7"}`}>
              {line}
            </p>
          );
        }
        if (/^[•\-*]\s/.test(line)) {
          return (
            <p key={i} className={`relative pl-4 text-soft ${compact ? "mt-1" : "mt-1.5"}`}>
              <span className="absolute top-[0.6em] left-0 h-1.5 w-1.5 rounded-full bg-edge-strong" />
              {line.replace(/^[•\-*]\s+/, "")}
            </p>
          );
        }
        return (
          <p key={i} className={`font-semibold ${compact ? "mt-2" : "mt-3"}`}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
