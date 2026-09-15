/**
 * Imports openly licensed resume datasets into ./corpus/open/<source>/.
 *
 *   npm run corpus:import-open            download (cached) + convert + de-duplicate
 *   npm run corpus:import-open -- --only opensporks,brackozi   (de-duplicates within the run only)
 *   npm run corpus:import-open -- --refresh   ignore the download cache
 *
 * Then rebuild the index:  npm run corpus:ingest -- --rebuild
 *
 * Only datasets that publish an open license are listed below. Every file is
 * cleaned of emails, phone numbers and links before it is written. Exact and
 * near-duplicate resumes (the same resume re-uploaded with small edits) are
 * dropped, so the count is distinct resumes. A manifest with source, license,
 * kind (real vs synthetic), domains and counts is written to
 * data/index/open-sources.json and powers the public /sources page.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { analyseDocument, documentPhrases } from "../src/lib/scoring/analyse";
import { stripContactDetails } from "../src/lib/scoring/text";
import { extractCorpusFile } from "../src/lib/extract/extract";
import { OPEN_SOURCES_FILE, type OpenSourceEntry, type OpenSourcesManifest } from "../src/lib/scoring/index-file";

const CORPUS_OPEN = path.resolve("corpus", "open");
const CACHE = path.resolve("corpus", "_cache");
const ROWS_API = "https://datasets-server.huggingface.co/rows";
const HF = "https://huggingface.co";

/** Near-duplicate threshold on estimated Jaccard similarity of 5-word phrase sets. */
const NEAR_DUPLICATE_JACCARD = 0.8;
/** Documents with fewer distinct phrases than this are too thin to be a resume. */
const MIN_PHRASES = 40;

type Row = Record<string, unknown>;
type Doc = { id: string; text: string; domain: string; ext?: "txt" | "md" };

type Source = {
  slug: string;
  dataset: string;
  license: string;
  kind: "real" | "synthetic";
  description: string;
  /** Arrays for small sets; async generators stream big files one resume at a time. */
  load: (refresh: boolean) => Promise<Iterable<Doc> | AsyncIterable<Doc>>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, attempts = 8, timeoutMs = 120_000): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : Math.min(60_000, 2000 * 2 ** attempt));
        continue;
      }
      throw new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function pool<T, R>(items: T[], concurrency: number, work: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await work(items[index]!, index);
      }
    }),
  );
  return results;
}

function cachePath(slug: string, name: string) {
  const dir = path.join(CACHE, slug);
  mkdirSync(dir, { recursive: true });
  return path.join(dir, name);
}

/** All rows of a Hugging Face dataset split via the datasets-server JSON API (100 rows per request), cached. */
async function datasetRows(slug: string, dataset: string, refresh: boolean, split = "train", config = "default"): Promise<Row[]> {
  const file = cachePath(slug, `${config}-${split}.json`);
  if (!refresh && existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as Row[];

  const q = encodeURIComponent(dataset);
  const first = (await (await fetchWithRetry(`${ROWS_API}?dataset=${q}&config=${config}&split=${split}&offset=0&length=100`)).json()) as {
    rows: { row: Row }[];
    num_rows_total: number;
  };
  const total = first.num_rows_total;
  const offsets = Array.from({ length: Math.ceil(total / 100) - 1 }, (_, i) => (i + 1) * 100);
  let done = 1;
  const pages = await pool(offsets, 5, async (offset) => {
    const page = (await (await fetchWithRetry(`${ROWS_API}?dataset=${q}&config=${config}&split=${split}&offset=${offset}&length=100`)).json()) as {
      rows: { row: Row }[];
    };
    if (++done % 25 === 0) process.stdout.write(`    ${dataset}: ${Math.min(done * 100, total)}/${total} rows\n`);
    return page.rows.map((r) => r.row);
  });
  const rows = [...first.rows.map((r) => r.row), ...pages.flat()];
  writeFileSync(file, JSON.stringify(rows));
  return rows;
}

/** Files of a dataset repo matching a filter, downloaded and cached. */
async function repoFiles(slug: string, dataset: string, refresh: boolean, match: (name: string) => boolean): Promise<{ name: string; bytes: Uint8Array }[]> {
  const info = (await (await fetchWithRetry(`${HF}/api/datasets/${dataset}`)).json()) as { siblings: { rfilename: string }[]; sha: string };
  const names = info.siblings.map((s) => s.rfilename).filter(match);
  let done = 0;
  return pool(names, 16, async (name) => {
    const file = cachePath(slug, createHash("sha1").update(name).digest("hex") + path.extname(name));
    if (refresh || !existsSync(file)) {
      const response = await fetchWithRetry(`${HF}/datasets/${dataset}/resolve/${info.sha}/${name.split("/").map(encodeURIComponent).join("/")}`);
      writeFileSync(file, new Uint8Array(await response.arrayBuffer()));
    }
    if (++done % 1000 === 0) process.stdout.write(`    ${dataset}: ${done}/${names.length} files\n`);
    return { name, bytes: new Uint8Array(readFileSync(file)) };
  });
}

/** One file from a dataset repo, downloaded once into the cache. */
async function rawFile(slug: string, dataset: string, file: string, refresh: boolean): Promise<string> {
  const cached = cachePath(slug, path.basename(file));
  if (refresh || !existsSync(cached)) {
    console.log(`    downloading ${dataset}/${file}…`);
    const response = await fetchWithRetry(`${HF}/datasets/${dataset}/resolve/main/${file}`, 8, 15 * 60_000);
    writeFileSync(cached, new Uint8Array(await response.arrayBuffer()));
  }
  return readFileSync(cached, "utf8");
}

/** Downloads a dataset file into the cache (if needed) and returns its local path. */
async function rawFilePath(slug: string, dataset: string, file: string, refresh: boolean): Promise<string> {
  const cached = cachePath(slug, path.basename(file));
  if (refresh || !existsSync(cached)) {
    console.log(`    downloading ${dataset}/${file}…`);
    const response = await fetchWithRetry(`${HF}/datasets/${dataset}/resolve/main/${file}`, 8, 15 * 60_000);
    writeFileSync(cached, new Uint8Array(await response.arrayBuffer()));
  }
  return cached;
}

/**
 * Streaming RFC 4180 CSV reader: yields one record (object keyed by header)
 * at a time, so a 200 MB file never has to fit in memory.
 */
export async function* streamCsv(file: string): AsyncGenerator<Row> {
  const { createReadStream } = await import("node:fs");
  let keys: string[] | null = null;
  let record: string[] = [];
  let field: string[] = [];
  let quoted = false;
  let pendingQuote = false; // saw a quote inside a quoted field; next char decides
  let skipLf = false;

  const endField = () => {
    record.push(field.join(""));
    field = [];
  };
  const endRecord = function* (): Generator<Row> {
    endField();
    const done = record;
    record = [];
    if (!keys) {
      keys = done.map((key) => key.replace(/^\uFEFF/, "").trim());
      return;
    }
    if (done.length > 1) yield Object.fromEntries(keys.map((key, i) => [key, done[i] ?? ""]));
  };

  for await (const chunk of createReadStream(file, { encoding: "utf8", highWaterMark: 1 << 20 }) as AsyncIterable<string>) {
    let start = 0;
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i]!;
      if (skipLf) {
        skipLf = false;
        if (char === "\n") {
          start = i + 1;
          continue;
        }
      }
      if (pendingQuote) {
        pendingQuote = false;
        if (char === '"') {
          // Escaped quote: keep one.
          start = i;
          continue;
        }
        quoted = false; // the previous quote closed the field; fall through
      }
      if (quoted) {
        if (char === '"') {
          field.push(chunk.slice(start, i));
          pendingQuote = true;
          start = i + 1;
        }
        continue;
      }
      if (char === '"') {
        field.push(chunk.slice(start, i));
        quoted = true;
        start = i + 1;
      } else if (char === ",") {
        field.push(chunk.slice(start, i));
        endField();
        start = i + 1;
      } else if (char === "\n" || char === "\r") {
        field.push(chunk.slice(start, i));
        yield* endRecord();
        if (char === "\r") skipLf = true;
        start = i + 1;
      }
    }
    if (start < chunk.length) field.push(chunk.slice(start));
  }
  if (field.length || record.length) yield* endRecord();
}

/** RFC 4180 CSV → objects keyed by the header row (quoted fields may contain commas, quotes and newlines). */
function parseCsv(text: string): Row[] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else field += char;
  }
  if (field || record.length) {
    record.push(field);
    records.push(record);
  }
  const [header, ...rows] = records;
  if (!header) return [];
  const keys = header.map((key) => key.replace(/^\uFEFF/, "").trim());
  return rows.filter((row) => row.length > 1).map((row) => Object.fromEntries(keys.map((key, i) => [key, row[i] ?? ""])));
}

function parseJsonl(text: string): Row[] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Row];
      } catch {
        return [];
      }
    });
}

/** Shallow git clone of a dataset repo (text files only, LFS skipped) — one request instead of thousands. */
async function cloneRepo(slug: string, dataset: string, refresh: boolean): Promise<string> {
  const dir = path.join(CACHE, slug, "repo");
  if (refresh) rmSync(dir, { recursive: true, force: true });
  if (!existsSync(path.join(dir, ".git"))) {
    mkdirSync(path.dirname(dir), { recursive: true });
    console.log(`    cloning ${dataset}…`);
    const { execFileSync } = await import("node:child_process");
    execFileSync("git", ["clone", "--depth", "1", `${HF}/datasets/${dataset}`, dir], {
      stdio: "ignore",
      env: { ...process.env, GIT_LFS_SKIP_SMUDGE: "1", GIT_TERMINAL_PROMPT: "0" },
    });
  }
  return dir;
}

function listFiles(dir: string, match: (relative: string) => boolean, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listFiles(path.join(dir, entry.name), match, relative);
    return match(relative) ? [relative] : [];
  });
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Text double-encoded as Latin-1 ("NaÃ¯ve", "â¢") is decoded back to UTF-8. */
function fixMojibake(text: string): string {
  if (!/[ÃÂâ][-ÿ]/.test(text)) return text;
  try {
    const decoded = Buffer.from(text, "latin1").toString("utf8");
    return decoded.includes("�") ? text : decoded;
  } catch {
    return text;
  }
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Renders the structured (JSON) resume schema used by hehhe89/resumes into plain text. */
function renderStructured(row: Row): string {
  const out: string[] = [];
  const clean = (value: unknown) => {
    const s = str(value).trim();
    return s && s.toLowerCase() !== "unknown" ? s : "";
  };
  const info = (row.personal_info ?? {}) as Row;
  if (clean(info.summary)) out.push("SUMMARY", clean(info.summary));

  const experience = (row.experience ?? []) as Row[];
  if (experience.length) out.push("EXPERIENCE");
  for (const job of experience) {
    const heading = [clean(job.title), clean(job.company)].filter(Boolean).join(", ");
    if (heading) out.push(heading);
    for (const item of (job.responsibilities ?? []) as unknown[]) if (clean(item)) out.push(`• ${clean(item)}`);
  }
  const projects = [...((row.projects ?? []) as Row[]), ...((row.internships ?? []) as Row[])];
  if (projects.length) out.push("PROJECTS");
  for (const project of projects) {
    const heading = clean(project.name) || clean(project.title) || clean(project.company);
    if (heading) out.push(heading);
    if (clean(project.description)) out.push(`• ${clean(project.description)}`);
    for (const item of (project.responsibilities ?? []) as unknown[]) if (clean(item)) out.push(`• ${clean(item)}`);
  }
  const education = (row.education ?? []) as Row[];
  if (education.length) out.push("EDUCATION");
  for (const entry of education) {
    const degree = (entry.degree ?? {}) as Row;
    const institution = (entry.institution ?? {}) as Row;
    const line = [clean(degree.level), clean(degree.field), clean(institution.name)].filter(Boolean).join(", ");
    if (line) out.push(line);
  }
  const certs = clean(row.certifications);
  if (certs) out.push("CERTIFICATIONS", certs);
  for (const item of (row.achievements ?? []) as unknown[]) {
    const text = typeof item === "string" ? clean(item) : clean((item as Row)?.description) || clean((item as Row)?.title);
    if (text) out.push(`• ${text}`);
  }
  return out.join("\n");
}

// ─── Sources (open licenses only) ────────────────────────────────────────────

const SOURCES: Source[] = [
  {
    slug: "opensporks",
    dataset: "opensporks/resumes",
    license: "CC0-1.0",
    kind: "real",
    description: "Resumes across 24 job categories, from a public resume collection.",
    load: async (refresh) =>
      (await datasetRows("opensporks", "opensporks/resumes", refresh)).map((row) => ({
        id: String(row.ID),
        // Fields are separated by runs of spaces in this export; make them lines.
        text: str(row.Resume_str).replace(/[ \t]{3,}/g, "\n"),
        domain: titleCase(str(row.Category)),
      })),
  },
  {
    slug: "brackozi",
    dataset: "brackozi/Resume",
    license: "MIT",
    kind: "real",
    description: "Resumes across 25 categories, many from India.",
    load: async (refresh) =>
      (await datasetRows("brackozi", "brackozi/Resume", refresh)).map((row, i) => ({
        id: String(i + 1),
        text: fixMojibake(str(row.Resume))
          .replace(/\s[•*]\s|•/g, "\n")
          .replace(/\r/g, ""),
        domain: titleCase(str(row.Category)),
      })),
  },
  {
    slug: "inferenceprince",
    dataset: "InferencePrince555/Resume-Dataset",
    license: "Apache-2.0",
    kind: "real",
    description: "Resumes across dozens of occupations, punctuation removed by the publisher.",
    load: async (refresh) => {
      const file = await rawFilePath("inferenceprince", "InferencePrince555/Resume-Dataset", "updated_data_final_cleaned.csv", refresh);
      return (async function* () {
        let i = 0;
        for await (const row of streamCsv(file)) {
          i++;
          yield {
            id: String(i),
            text: str(row.Resume_test),
            domain: titleCase(str(row.instruction).replace(/^Generate a Resume for an? /i, "").replace(/ Job$/i, "")),
          };
        }
      })();
    },
  },
  {
    slug: "structured",
    dataset: "hehhe89/resumes",
    license: "MIT",
    kind: "real",
    description: "Structured resumes (converted to text), largely Indian IT and engineering profiles.",
    load: async (refresh) =>
      parseJsonl(await rawFile("structured", "hehhe89/resumes", "master_resumes.jsonl", refresh)).map((row, i) => {
        const jobs = (row.experience ?? []) as Row[];
        return { id: String(i + 1), text: renderStructured(row), domain: titleCase(str(jobs[0]?.title) || "Other") };
      }),
  },
  {
    slug: "screening-synthetic",
    dataset: "AzharAli05/Resume-Screening-Dataset",
    license: "MIT",
    kind: "synthetic",
    description: "AI-generated resumes for many roles, published for resume-screening research.",
    load: async (refresh) =>
      (await datasetRows("screening-synthetic", "AzharAli05/Resume-Screening-Dataset", refresh)).map((row, i) => ({
        id: String(i + 1),
        text: str(row.Resume).replace(/^\s*Here(?:'|’)s[^\n]*\n/i, ""),
        domain: titleCase(str(row.Role)),
      })),
  },
  {
    slug: "asenion-synthetic",
    dataset: "asenion-ai/sampled-local-resumes",
    license: "Apache-2.0",
    kind: "synthetic",
    description: "AI-generated resumes across 47 occupations, at varying quality levels.",
    load: async (refresh) => {
      const dir = await cloneRepo("asenion-synthetic", "asenion-ai/sampled-local-resumes", refresh);
      return listFiles(dir, (name) => name.startsWith("synthetic_resumes/") && name.endsWith(".md")).map((name) => ({
        id: path.basename(name, ".md"),
        // Markdown → plain text: drop heading markers and bold/italic syntax.
        text: readFileSync(path.join(dir, name), "utf8")
          .replace(/^\s{0,3}#{1,6}\s+/gm, "")
          .replace(/\*\*|__/g, "")
          .replace(/^\s*[-*]\s+/gm, "• "),
        domain: titleCase(name.split("/")[1]!.replace(/^(mediocre|synthetic)_/, "").replace(/^(synthetic|bad)_/, "").replace(/_resumes$/, "")),
        ext: "md" as const,
      }));
    },
  },
  {
    slug: "summary-synthetic",
    dataset: "burberg92/resume_summary",
    license: "Unlicense",
    kind: "synthetic",
    description: "Short AI-generated resumes with summaries.",
    load: async (refresh) =>
      (await datasetRows("summary-synthetic", "burberg92/resume_summary", refresh)).map((row, i) => ({
        id: String(i + 1),
        text: str(row.resume),
        domain: titleCase(str(row.resume).match(/\|\s*([^\n]+)/)?.[1] ?? "Other"),
      })),
  },
  {
    slug: "lithivr-samples",
    dataset: "LithiVR/Resumes",
    license: "Apache-2.0",
    kind: "synthetic",
    description: "Sample and template resumes for software roles (PDF/DOCX).",
    load: async (refresh) => {
      const files = await repoFiles("lithivr-samples", "LithiVR/Resumes", refresh, (name) => /\.(pdf|docx)$/i.test(name));
      const docs: Doc[] = [];
      for (const { name, bytes } of files) {
        try {
          const { text } = await extractCorpusFile(bytes, name);
          docs.push({ id: path.basename(name).replace(/\.[^.]+$/, ""), text, domain: "Software Development" });
        } catch {
          // unreadable file — skipped
        }
      }
      return docs;
    },
  },
];

// ─── Near-duplicate detection (bottom-k MinHash over phrase hashes) ─────────

const K = 128;
const BAND = 16;

type Sketch = number[];

function sketch(hashes: string[]): Sketch {
  const values = hashes.map((hash) => Number.parseInt(hash.slice(0, 13), 16));
  values.sort((a, b) => a - b);
  return values.slice(0, K);
}

function estimateJaccard(a: Sketch, b: Sketch): number {
  // Bottom-k of the union, then the share of those present in both.
  const setA = new Set(a);
  const setB = new Set(b);
  const union = [...new Set([...a, ...b])].sort((x, y) => x - y).slice(0, K);
  let both = 0;
  for (const value of union) if (setA.has(value) && setB.has(value)) both++;
  return both / union.length;
}

class NearDuplicateIndex {
  private sketches: Sketch[] = [];
  private buckets = new Map<number, number[]>();

  isDuplicate(candidate: Sketch): boolean {
    const hits = new Map<number, number>();
    for (const value of candidate.slice(0, BAND)) {
      for (const id of this.buckets.get(value) ?? []) hits.set(id, (hits.get(id) ?? 0) + 1);
    }
    for (const [id, shared] of hits) {
      if (shared >= BAND / 4 && estimateJaccard(candidate, this.sketches[id]!) >= NEAR_DUPLICATE_JACCARD) return true;
    }
    return false;
  }

  add(candidate: Sketch) {
    const id = this.sketches.push(candidate) - 1;
    for (const value of candidate.slice(0, BAND)) {
      const bucket = this.buckets.get(value);
      if (bucket) bucket.push(id);
      else this.buckets.set(value, [id]);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const refresh = process.argv.includes("--refresh");
  const onlyIndex = process.argv.indexOf("--only");
  const only = onlyIndex >= 0 ? new Set((process.argv[onlyIndex + 1] ?? "").split(",")) : null;
  const sources = SOURCES.filter((source) => !only || only.has(source.slug));

  const exact = new Set<string>();
  const near = new NearDuplicateIndex();
  const entries: OpenSourceEntry[] = [];

  // Real resumes first, so when a synthetic copy exists the real one is kept.
  sources.sort((a, b) => Number(a.kind === "synthetic") - Number(b.kind === "synthetic"));

  for (const source of sources) {
    console.log(`\n▸ ${source.dataset} (${source.license}, ${source.kind})`);
    let docs: Iterable<Doc> | AsyncIterable<Doc>;
    try {
      docs = await source.load(refresh);
    } catch (error) {
      console.warn(`  ! could not load: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    const outDir = path.join(CORPUS_OPEN, source.slug);
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });

    const entry: OpenSourceEntry = {
      slug: source.slug,
      dataset: source.dataset,
      url: `${HF}/datasets/${source.dataset}`,
      license: source.license,
      kind: source.kind,
      description: source.description,
      rows: 0,
      kept: 0,
      exactDuplicates: 0,
      nearDuplicates: 0,
      tooShort: 0,
      domains: {},
    };

    for await (const doc of docs) {
      entry.rows++;
      if (entry.rows % 5000 === 0) console.log(`    … ${entry.rows.toLocaleString("en-IN")} rows processed`);
      const text = stripContactDetails(doc.text).replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      const contentHash = createHash("sha256").update(text.replace(/\s+/g, " ").toLowerCase()).digest("hex");
      if (exact.has(contentHash)) {
        entry.exactDuplicates++;
        continue;
      }
      exact.add(contentHash);

      const phrases = [...documentPhrases(analyseDocument(text)).keys()];
      if (phrases.length < MIN_PHRASES) {
        entry.tooShort++;
        continue;
      }
      const signature = sketch(phrases);
      if (near.isDuplicate(signature)) {
        entry.nearDuplicates++;
        continue;
      }
      near.add(signature);

      const baseId = doc.id.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || String(entry.kept + 1);
      // Different folders in a dataset can reuse a file name; never let one resume overwrite another.
      let fileName = `${baseId}.${doc.ext ?? "txt"}`;
      for (let n = 2; existsSync(path.join(outDir, fileName)); n++) fileName = `${baseId}-${n}.${doc.ext ?? "txt"}`;
      writeFileSync(path.join(outDir, fileName), text);
      entry.kept++;
      const domain = doc.domain || "Other";
      entry.domains[domain] = (entry.domains[domain] ?? 0) + 1;
    }

    console.log(
      `  kept ${entry.kept.toLocaleString("en-IN")} of ${entry.rows.toLocaleString("en-IN")} · exact dup ${entry.exactDuplicates} · near dup ${entry.nearDuplicates} · too short ${entry.tooShort}`,
    );
    entries.push(entry);
  }

  // A partial run (--only) keeps the other sources' entries from the previous manifest.
  const previous: OpenSourcesManifest | null = existsSync(OPEN_SOURCES_FILE) ? JSON.parse(readFileSync(OPEN_SOURCES_FILE, "utf8")) : null;
  const ranSlugs = new Set(entries.map((e) => e.slug));
  const merged = [...(only ? (previous?.sources ?? []).filter((e) => !ranSlugs.has(e.slug)) : []), ...entries];
  const manifest: OpenSourcesManifest = {
    updatedAt: new Date().toISOString(),
    nearDuplicateJaccard: NEAR_DUPLICATE_JACCARD,
    sources: merged,
  };
  mkdirSync(path.dirname(OPEN_SOURCES_FILE), { recursive: true });
  writeFileSync(OPEN_SOURCES_FILE, JSON.stringify(manifest, null, 2));

  const real = merged.filter((e) => e.kind === "real").reduce((sum, e) => sum + e.kept, 0);
  const synthetic = merged.filter((e) => e.kind === "synthetic").reduce((sum, e) => sum + e.kept, 0);
  const domains = new Set(merged.flatMap((e) => Object.keys(e.domains)));
  console.log(`\nDone: ${(real + synthetic).toLocaleString("en-IN")} distinct resumes (${real.toLocaleString("en-IN")} real, ${synthetic.toLocaleString("en-IN")} synthetic) across ${domains.size} domains.`);
  console.log("Next: npm run corpus:ingest -- --rebuild");
}

// Importable for tests without running the import.
if (process.env.IMPORT_OPEN_NO_MAIN !== "1") main();
