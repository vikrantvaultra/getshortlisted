import { readTopLines, type TopLinesFile } from "@/lib/scoring/index-file";

let cached: TopLinesFile | null | undefined;

/** Most repeated whole lines, written by `npm run corpus:ingest`. */
export function topLines(limit = 10): TopLinesFile | null {
  if (cached === undefined) cached = readTopLines();
  if (!cached) return null;
  return { ...cached, lines: cached.lines.slice(0, limit) };
}
