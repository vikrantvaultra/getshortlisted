import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { readOpenSources } from "@/lib/scoring/index-file";
import { indexStats } from "@/lib/server/phrase-index";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Where our resumes come from",
  description: "Every dataset in the index behind the resume check, with its license, whether it's real or AI-generated, and how many resumes we kept.",
};

const n = (value: number) => value.toLocaleString("en-IN");

/** Public, exact breakdown of the index. Nothing here is rounded. */
export default function SourcesPage() {
  const stats = indexStats();
  const manifest = readOpenSources();
  const sources = manifest?.sources ?? [];
  const domainTotals = new Map<string, number>();
  for (const source of sources) for (const [domain, count] of Object.entries(source.domains)) domainTotals.set(domain, (domainTotals.get(domain) ?? 0) + count);
  const topDomains = [...domainTotals].sort((a, b) => b[1] - a[1]);

  const tiles = [
    { label: "Real resumes · open datasets", value: stats.openRealDocuments, tone: "bg-pen-wash text-pen" },
    { label: "AI-generated · open datasets", value: stats.openSyntheticDocuments, tone: "bg-marker-soft text-marker-ink" },
    { label: "Generated reference resumes", value: stats.seedDocuments, tone: "bg-wash text-soft" },
    { label: "Real verified submissions", value: stats.verifiedDocuments, tone: "bg-[#effaf3] text-[#0b6b35]" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-14">
      <span className="sticker rise -rotate-1">
        <ShieldIcon className="h-4 w-4" /> Open licenses only
      </span>
      <h1 className="rise mt-5 text-title font-extrabold" style={{ ["--delay" as string]: "60ms" }}>
        Where our <span className="font-mono">{n(stats.totalDocuments)}</span> resumes <span className="marker">come from</span>
      </h1>
      <p className="rise mt-4 max-w-2xl text-lg text-soft" style={{ ["--delay" as string]: "120ms" }}>
        Your resume is compared with every document below. Real people&apos;s resumes are only ever counted — their text is never shown to
        anyone. A few hundred of the AI-generated ones appear in the Library as labelled examples, with names removed. Emails, phone numbers and
        links were removed from everything before it was stored.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <div key={tile.label} className={`rise rounded-3xl p-4 sm:p-5 ${tile.tone}`} style={{ ["--delay" as string]: `${160 + i * 60}ms` }}>
            <p className="font-display text-3xl leading-none font-extrabold sm:text-4xl">{n(tile.value)}</p>
            <p className="mt-2 text-sm font-medium">{tile.label}</p>
          </div>
        ))}
      </div>

      {topDomains.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold">
            {n(topDomains.length)} domains covered by the open datasets
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topDomains.slice(0, 40).map(([domain, count]) => (
              <span key={domain} className="chip">
                {domain} <span className="font-mono text-xs text-faint">{n(count)}</span>
              </span>
            ))}
            {topDomains.length > 40 && <span className="chip bg-white ring-1 ring-edge">+{n(topDomains.length - 40)} more</span>}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-extrabold">Datasets</h2>
        {sources.length === 0 ? (
          <p className="panel mt-4 p-6 text-soft">No open datasets imported yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {sources.map((source) => {
              const removed = source.exactDuplicates + source.nearDuplicates + source.tooShort;
              const domains = Object.entries(source.domains).sort((a, b) => b[1] - a[1]);
              return (
                <li key={source.slug} className="panel flex flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`chip px-2.5 py-1 text-xs font-semibold ${source.kind === "real" ? "bg-pen-wash text-pen" : "bg-marker-soft text-marker-ink"}`}>
                      {source.kind === "real" ? "Real resumes" : (
                        <>
                          <SparkleIcon className="h-3.5 w-3.5" /> AI-generated
                        </>
                      )}
                    </span>
                    <span className="chip px-2.5 py-1 font-mono text-xs">{source.license}</span>
                  </div>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 font-display text-xl font-extrabold break-all hover:text-pen">
                    {source.dataset}
                  </a>
                  <p className="mt-1 text-sm text-soft">{source.description}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-wash p-3 text-center">
                    <div>
                      <dt className="text-[0.7rem] text-soft uppercase">Kept</dt>
                      <dd className="font-mono font-medium">{n(source.kept)}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.7rem] text-soft uppercase">Rows</dt>
                      <dd className="font-mono font-medium">{n(source.rows)}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.7rem] text-soft uppercase">Removed</dt>
                      <dd className="font-mono font-medium">{n(removed)}</dd>
                    </div>
                  </dl>
                  {removed > 0 && (
                    <p className="mt-2 text-xs text-faint">
                      {n(source.exactDuplicates)} exact copies · {n(source.nearDuplicates)} near-duplicates · {n(source.tooShort)} too short
                    </p>
                  )}
                  <p className="mt-3 text-sm text-soft">
                    <span className="font-medium text-text">{n(domains.length)} domains:</span> {domains.slice(0, 6).map(([d]) => d).join(", ")}
                    {domains.length > 6 ? "…" : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="panel mt-12 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">The rest of the index</h2>
        <p className="mt-2 text-soft">
          <strong className="text-text">{n(stats.seedDocuments)} reference resumes</strong> were generated from common resume phrasing, so everyday
          clichés are counted even before real data arrives. <strong className="text-text">{n(stats.verifiedDocuments)} real verified resumes</strong>{" "}
          come from people who got placed, sent their offer proof, and allowed us to include them.
        </p>
        {manifest && (
          <p className="mt-3 text-sm text-faint">
            Copies were detected by comparing five-word phrase sets; resumes at least {Math.round(manifest.nearDuplicateJaccard * 100)}% the same as
            one already kept were removed. Last imported {new Date(manifest.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
        )}
        <Link href="/" className="btn mt-6">
          Check my resume <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
