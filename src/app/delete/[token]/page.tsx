import type { Metadata } from "next";
import Link from "next/link";
import { AlertIcon, CheckIcon, SearchIcon } from "@/components/icons";
import { findByDeleteToken } from "@/lib/server/submissions";
import { deleteMySubmission } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Delete your submission", robots: { index: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ deleted?: string }> };

/**
 * Opening the link never deletes anything by itself — email scanners and
 * link previewers open links automatically. One button press does.
 */
export default async function DeletePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { deleted } = await searchParams;
  const submission = findByDeleteToken(token);

  if (deleted === "1") {
    return (
      <Shell>
        <span className="pop mx-auto flex h-20 w-20 -rotate-3 items-center justify-center rounded-[1.6rem] bg-good text-white shadow-[0_6px_0_#0b7a3b]">
          <CheckIcon className="h-10 w-10" />
        </span>
        <h1 className="rise mt-8 text-title font-extrabold">
          <span className="marker">Deleted.</span> For good.
        </h1>
        <p className="rise mx-auto mt-4 max-w-sm text-lg text-soft" style={{ ["--delay" as string]: "120ms" }}>
          Your resume, offer letter and everything made from them are gone. There&apos;s no backup to restore from.
        </p>
        <Link href="/" className="btn btn-outline mt-8">
          Back to home
        </Link>
      </Shell>
    );
  }

  if (!submission) {
    return (
      <Shell>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-wash text-soft">
          <SearchIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-8 text-title font-extrabold">Nothing to delete here</h1>
        <p className="mx-auto mt-4 max-w-sm text-lg text-soft">
          This link was already used, or it got cut off when copying. Check you copied the whole link.
        </p>
        <Link href="/privacy#delete" className="btn btn-outline mt-8">
          Other ways to delete
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="kicker">Your submission</p>
      <h1 className="mt-3 text-title font-extrabold">Delete everything you sent?</h1>

      <div className="sheet-paper mt-8 p-5 text-left">
        <p className="font-mono text-[0.72rem] font-medium tracking-wider text-pen uppercase">Offer</p>
        <p className="mt-1 text-xl font-semibold">
          {submission.role}, {submission.company}
        </p>
        <p className="mt-1 text-sm text-soft">
          Sent {new Date(submission.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {submission.status === "pending" ? "waiting for review" : submission.status}
        </p>
      </div>

      <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#fdeeee] p-4 text-left text-[0.95rem] text-warn">
        <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <span>This permanently deletes your resume, offer letter, the anonymised copy and its phrases in our index. It can&apos;t be undone.</span>
      </p>

      <form action={deleteMySubmission} className="mt-7 grid gap-2.5">
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn btn-dark w-full">
          Yes, delete everything
        </button>
        <Link href="/" className="btn btn-outline w-full">
          Keep it
        </Link>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-md px-4 pt-12 text-center sm:pt-20">{children}</section>;
}
