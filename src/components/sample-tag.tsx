/** Marks hardcoded demo content so it's never mistaken for a real person's resume. */
export function SampleTag({ className = "ml-2" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center rounded-md bg-wash px-1.5 py-0.5 align-middle font-mono text-[0.65rem] font-medium tracking-wide text-soft uppercase ring-1 ring-edge`}
      title="Demo content written for this build — not a real person's resume"
    >
      Sample
    </span>
  );
}
