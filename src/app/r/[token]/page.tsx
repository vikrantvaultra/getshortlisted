import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ShareToken } from "@/app/api/share-card/route";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { verifyPayload } from "@/lib/server/crypto";

type Props = { params: Promise<{ token: string }> };

async function readToken(params: Props["params"]) {
  const token = decodeURIComponent((await params).token);
  const payload = verifyPayload<ShareToken>(token);
  return payload ? { token, ...payload } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await readToken(params);
  if (!data) return {};
  const title = `${data.c} of my ${data.t} resume lines already appear in other resumes`;
  const image = `/api/share-card?t=${encodeURIComponent(data.token)}`;
  return {
    title,
    description: "Check how much of your resume sounds like everyone else's. Free, no signup.",
    openGraph: { title, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, images: [image] },
    robots: { index: false },
  };
}

/** Landing for shared links. Shows only the verified count — never anyone's resume. */
export default async function SharedResultPage({ params }: Props) {
  const data = await readToken(params);
  if (!data) notFound();
  const original = data.t - data.c;

  return (
    <section className="mx-auto max-w-xl px-4 pt-10 text-center sm:pt-16">
      <span className="sticker rise -rotate-2">A friend scanned their resume</span>

      <div className="rise sheet-paper relative mx-auto mt-8 max-w-sm px-6 pt-8 pb-7" style={{ ["--delay" as string]: "100ms" }}>
        <p className="kicker">Lines already out there</p>
        <p className="mt-2 font-display text-[6.5rem] leading-[0.9] font-extrabold tracking-tight tabular-nums">
          <span className="marker" style={{ backgroundSize: "100% 42%", backgroundPosition: "0 82%" }}>{data.c}</span>
          <span className="text-faint">/{data.t}</span>
        </p>
        <div className="mt-6 flex gap-1" aria-hidden>
          {Array.from({ length: data.t }, (_, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full ${i < data.c ? "bg-marker" : "bg-pen"}`} />
          ))}
        </div>
        <p className="mt-3 flex justify-between text-sm font-medium">
          <span className="text-marker-ink">{data.c} copied</span>
          <span className="text-pen">{original} original</span>
        </p>
      </div>

      <h1 className="rise mt-9 text-title font-extrabold" style={{ ["--delay" as string]: "200ms" }}>
        How much of <span className="marker">yours</span> is copied?
      </h1>
      <p className="rise mx-auto mt-3 max-w-sm text-lg text-soft" style={{ ["--delay" as string]: "260ms" }}>
        Upload your resume and see every line that already appears in other resumes.
      </p>
      <Link href="/" className="rise btn mt-7 w-full sm:w-auto" style={{ ["--delay" as string]: "320ms" }}>
        Scan my resume — free
        <ArrowRightIcon />
      </Link>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm text-soft">
        {["No signup", "File never saved", "No AI"].map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-good" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
