import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertIcon, ArrowLeftIcon, CheckIcon, DownloadIcon } from "@/components/icons";
import { SampleTag } from "@/components/sample-tag";
import { COLLEGE_TIERS } from "@/config";
import { anonymise } from "@/lib/anonymise";
import { requireAdmin } from "@/lib/server/admin-auth";
import { store, type SubmissionStatus } from "@/lib/server/store";
import { getSubmission } from "@/lib/server/submissions";
import { approve, reject, remove } from "../../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; done?: string }> };

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  pending: "bg-marker text-text",
  approved: "bg-[#e3f6ea] text-[#0b6b35]",
  rejected: "bg-[#fdecec] text-warn",
};

export default async function ReviewPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { error, done } = await searchParams;
  const submission = getSubmission(id);
  if (!submission) notFound();

  const proof = store().files.get(submission.proofId);
  const original = submission.fileId ? store().files.get(submission.fileId) : undefined;
  const draft = submission.extractedText ? anonymise(submission.extractedText, { college: submission.college }) : "";
  const resume = submission.resumeId ? store().resumes.get(submission.resumeId) : undefined;
  const pending = submission.status === "pending";

  const meta: [string, string][] = [
    ["Year", String(submission.year)],
    ["Level", submission.level],
    ["College", submission.college || "—"],
    ["City", submission.city || "—"],
    ["Email", submission.submitterEmail],
    ["Pages", String(submission.pageCount)],
  ];

  return (
    <div className="pb-16">
      <Link href="/admin" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-text">
        <ArrowLeftIcon className="h-4 w-4" /> All submissions
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[submission.status]}`}>{submission.status}</span>
            {submission.sample && (
              <>
                <SampleTag className="" />
                <span className="text-xs text-soft">invented person</span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-4xl">
            {submission.role}, <span className="marker">{submission.company}</span>
          </h1>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-2xl bg-[#fdecec] px-4 py-3 font-medium text-warn">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </p>
      )}
      {done && (
        <p className={`pop mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 font-medium ${done === "approved" ? "bg-[#e3f6ea] text-[#0b6b35]" : "bg-wash text-soft"}`}>
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {done === "approved"
            ? `Approved. ${submission.consentCorpus ? `Indexed ${submission.indexedHashes?.length ?? 0} phrases. ` : "Not indexed (no consent). "}${
                resume ? "Published to the library." : "Not published (no consent)."
              }`
            : "Rejected. Files and extracted text deleted."}
        </p>
      )}

      <div className="panel mt-6 p-4 sm:p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {meta.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs font-semibold text-soft">{label}</dt>
              <dd className={`mt-0.5 font-medium ${label === "Email" ? "break-all" : "break-words"} ${label === "Level" ? "capitalize" : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-edge pt-4">
          <ConsentChip label="Index consent" granted={submission.consentCorpus} />
          <ConsentChip label="Public consent" granted={submission.consentPublic} />
        </div>
      </div>
      {submission.rejectReason && <p className="mt-4 rounded-2xl bg-wash px-4 py-3 text-sm text-soft">Reject reason: {submission.rejectReason}</p>}

      {pending ? (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <section className="panel p-4 sm:p-5">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pen font-mono text-sm font-medium text-white">1</span>
              Verify the offer proof
            </h2>
            <p className="mt-2 text-sm text-soft">Company, role and year should match the form. Salary should be hidden.</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-edge bg-wash">
              {proof ? (
                proof.mime === "application/pdf" ? (
                  <object data={`/api/admin/files/${proof.id}`} type="application/pdf" className="h-[560px] w-full">
                    <a href={`/api/admin/files/${proof.id}`} className="block p-4 font-semibold text-pen underline">
                      Open proof PDF
                    </a>
                  </object>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-only authenticated file
                  <img src={`/api/admin/files/${proof.id}`} alt="Offer proof" className="w-full" />
                )
              ) : (
                <p className="p-4 text-soft">Proof file missing.</p>
              )}
            </div>
            {original && (
              <a href={`/api/admin/files/${original.id}`} className="btn btn-outline mt-4 min-h-11 px-4 text-sm">
                <DownloadIcon className="h-4 w-4" />
                Original resume ({original.mime.includes("pdf") ? "PDF" : "DOCX"})
              </a>
            )}
            <details className="group mt-4 rounded-2xl bg-wash">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Extracted text (unredacted)</summary>
              <pre className="max-h-96 overflow-auto px-4 pb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-soft">{submission.extractedText}</pre>
            </details>
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pen font-mono text-sm font-medium text-white">2</span>
              Check the redaction, then decide
            </h2>
            <p className="mt-2 text-sm text-soft">
              Name, contacts, URLs, exact dates, address and personal rows were removed automatically. Read it all and edit anything that still identifies
              the person — this exact text is indexed and published.
            </p>
            <form action={approve} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={submission.id} />
              <textarea name="redactedText" defaultValue={draft} rows={20} className="input font-mono text-xs leading-relaxed" aria-label="Redacted text" />
              <div>
                <label htmlFor="collegeTier" className="field-label">
                  College tier <span className="font-normal text-soft">(shown instead of the name)</span>
                </label>
                <select id="collegeTier" name="collegeTier" className="input" defaultValue="Not disclosed">
                  {COLLEGE_TIERS.map((tier) => (
                    <option key={tier}>{tier}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn w-full">
                <CheckIcon className="h-5 w-5" />
                Approve — proof verified
              </button>
              <p className="rounded-xl bg-pen-wash px-3 py-2 text-sm text-pen-dark">
                Will {submission.consentCorpus ? "index its phrases" : "NOT index it"} and {submission.consentPublic ? "publish it to the library" : "NOT publish it"}, per
                the person&apos;s consent.
              </p>
            </form>

            <form action={reject} className="mt-6 space-y-3 border-t border-edge pt-5">
              <input type="hidden" name="id" value={submission.id} />
              <label htmlFor="reason" className="field-label">
                Or reject
              </label>
              <input id="reason" name="reason" className="input" placeholder="e.g. Proof doesn't match the company" maxLength={200} />
              <button type="submit" className="btn btn-outline w-full">
                Reject and delete files
              </button>
            </form>
          </section>
        </div>
      ) : (
        resume && (
          <section className="mt-8">
            <h2 className="text-xl font-extrabold">Published text</h2>
            <pre className="sheet-paper mt-3 max-w-3xl p-5 font-sans text-sm leading-relaxed whitespace-pre-wrap">{resume.redactedText}</pre>
          </section>
        )
      )}

      <form action={remove} className="mt-10 rounded-2xl border border-[#f5c2c3] bg-[#fff7f7] p-4 sm:p-5">
        <input type="hidden" name="id" value={submission.id} />
        <p className="font-semibold text-warn">Danger zone</p>
        <p className="mt-1 text-sm text-soft">
          Hard delete: removes the submission, files, published resume, and decrements its phrase counts. Same as the person&apos;s own deletion link.
        </p>
        <button type="submit" className="btn btn-outline mt-3 min-h-11 border-warn/40 px-4 text-sm text-warn hover:border-warn">
          Delete permanently
        </button>
      </form>
    </div>
  );
}

function ConsentChip({ label, granted }: { label: string; granted: boolean }) {
  return (
    <span className={`chip ${granted ? "bg-[#e3f6ea] text-[#0b6b35]" : "bg-[#fdecec] text-warn"}`}>
      {granted ? <CheckIcon className="h-4 w-4" /> : <AlertIcon className="h-4 w-4" />}
      {label}: {granted ? "yes" : "no"}
    </span>
  );
}
