import Link from "next/link";
import { DownloadIcon } from "@/components/icons";
import { indexBreakdown } from "@/components/index-statement";
import { SampleTag } from "@/components/sample-tag";
import { requireAdmin } from "@/lib/server/admin-auth";
import { indexStats } from "@/lib/server/phrase-index";
import { store, type SubmissionStatus } from "@/lib/server/store";
import { listSubmissions } from "@/lib/server/submissions";
import { formatCount, paidEnabled } from "@/lib/site";

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  pending: "bg-marker text-text",
  approved: "bg-[#e3f6ea] text-[#0b6b35]",
  rejected: "bg-[#fdecec] text-warn",
};

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ deleted?: string; filter?: string }> }) {
  await requireAdmin();
  const { deleted, filter = "pending" } = await searchParams;
  const state = store();
  const submissions = listSubmissions();
  const shown = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
  const scans = state.scans;
  const cards = scans.filter((scan) => scan.shareCardGenerated).length;
  const averageShare = scans.length ? Math.round(scans.reduce((sum, scan) => sum + scan.percentage, 0) / scans.length) : null;
  const byStatus = (status: string) => submissions.filter((s) => s.status === status).length;

  const stats: { label: string; value: number; note?: string; accent?: boolean }[] = [
    { label: "Pending review", value: byStatus("pending"), accent: true },
    { label: "Scans run", value: scans.length, note: averageShare === null ? undefined : `avg ${averageShare}% copied` },
    { label: "Results shared", value: cards, note: scans.length ? `${Math.round((cards / scans.length) * 100)}% of scans` : undefined },
    { label: "Waitlist", value: state.waitlist.length },
  ];

  const waitlistItems = [...state.waitlist].reverse().slice(0, 25);
  const scanItems = [...scans].reverse().slice(0, 25);

  return (
    <div className="pb-10">
      {deleted && <p className="pop mt-5 rounded-2xl bg-[#e3f6ea] px-4 py-3 font-medium text-[#0b6b35]">Submission permanently deleted.</p>}

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`panel rise p-4 sm:p-5 ${stat.accent ? "!bg-marker-soft" : ""}`} style={{ ["--delay" as string]: `${i * 60}ms` }}>
            <p className="text-xs font-semibold text-soft">{stat.label}</p>
            <p className="mt-2 font-mono text-4xl font-medium tracking-tight">{formatCount(stat.value)}</p>
            {stat.note && <p className="mt-1 text-xs text-soft">{stat.note}</p>}
          </div>
        ))}
      </section>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="chip">{indexBreakdown(indexStats())}</span>
        <span className={`chip ${paidEnabled() ? "bg-pen-wash text-pen-dark" : ""}`}>Paid features {paidEnabled() ? "ON" : "OFF"}</span>
        <span className="chip">In memory since {dateTime(state.startedAt)} · restart resets</span>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">Submissions</h1>
          <nav className="flex gap-1 rounded-2xl bg-wash p-1 text-sm font-semibold">
            {(["pending", "approved", "rejected", "all"] as const).map((key) => (
              <Link
                key={key}
                href={`/admin?filter=${key}`}
                className={`rounded-xl px-3 py-1.5 capitalize ${filter === key ? "bg-white text-text shadow-sm" : "text-soft hover:text-text"}`}
              >
                {key}
                {key !== "all" && <span className="ml-1 font-mono text-xs text-faint">{byStatus(key)}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {shown.length === 0 ? (
          <div className="panel mt-4 p-8 text-center text-soft">Nothing here.</div>
        ) : (
          <ul className="panel mt-4 divide-y divide-edge overflow-hidden">
            {shown.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/submissions/${s.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-wash sm:flex-nowrap">
                  <span className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <span className="block truncate font-semibold">
                      {s.role}, {s.company}
                      {s.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block text-sm text-soft">
                      <span className="font-mono">{s.year}</span> · <span className="capitalize">{s.level}</span> · {dateTime(s.createdAt)}
                    </span>
                  </span>
                  <span className="flex gap-1.5">
                    {s.consentCorpus && <span className="chip px-2 py-0.5 text-xs">Index</span>}
                    {s.consentPublic && <span className="chip bg-pen-wash px-2 py-0.5 text-xs text-pen-dark">Public</span>}
                  </span>
                  <span className={`ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold capitalize sm:ml-0 ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <ListPanel title="Waitlist" href="/api/admin/export?type=waitlist" empty={waitlistItems.length === 0 ? "No one yet." : null}>
          {waitlistItems.map((entry) => (
            <li key={entry.id} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="truncate font-medium">{entry.email}</span>
              <span className="shrink-0 text-soft">{entry.targetCompany ?? "—"}</span>
            </li>
          ))}
        </ListPanel>
        <ListPanel title="Recent scans" href="/api/admin/export?type=scans" empty={scanItems.length === 0 ? "No scans yet." : null}>
          {scanItems.map((scan) => (
            <li key={scan.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  <span className="marker">{scan.commonCount}</span>/{scan.totalCount}
                </span>
                <span className="text-soft">{scan.percentage}%</span>
                {scan.shareCardGenerated && <span className="chip bg-pen-wash px-2 py-0.5 text-xs text-pen-dark">shared</span>}
              </span>
              <span className="text-soft">{dateTime(scan.createdAt)}</span>
            </li>
          ))}
        </ListPanel>
      </section>
    </div>
  );
}

function ListPanel({ title, href, empty, children }: { title: string; href: string; empty: string | null; children: React.ReactNode }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h2 className="text-lg font-extrabold">{title}</h2>
        <a href={href} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-pen hover:bg-pen-wash">
          <DownloadIcon className="h-4 w-4" /> CSV
        </a>
      </div>
      <ul className="max-h-96 divide-y divide-edge overflow-y-auto">
        {empty ? <li className="px-4 py-6 text-center text-sm text-soft">{empty}</li> : children}
      </ul>
    </div>
  );
}
