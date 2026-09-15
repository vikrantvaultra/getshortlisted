"use client";

import { useEffect, useState } from "react";
import type { ScoreResponse } from "@/app/api/score/route";
import { CheckIcon, CloseIcon, DownloadIcon, LinkIcon, ShareIcon } from "@/components/icons";

export type Card = { status: "loading" } | { status: "error" } | { status: "ready"; url: string; file: File };

type Nav = Navigator & { canShare?: (data: ShareData) => boolean };

/**
 * Bottom sheet on phones, dialog on desktop. Native share with the image when
 * the browser supports it, otherwise save; the image itself is always shown
 * so in-app browsers can press-and-hold to save.
 */
export function ShareSheet({ card, result, onClose }: { card: Card; result: ScoreResponse; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const shareLink = typeof window === "undefined" ? "" : `${window.location.origin}/r/${result.shareToken}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (card.status === "ready") setCanShareFiles(!!(navigator as Nav).canShare?.({ files: [card.file] }));
  }, [card]);

  function markShared() {
    fetch("/api/shared", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareToken: result.shareToken }),
      keepalive: true,
    }).catch(() => {});
  }

  async function shareImage() {
    if (card.status !== "ready") return;
    markShared();
    try {
      await navigator.share({ files: [card.file] });
    } catch {
      // Cancelled or refused — Save and the image are right there.
    }
  }

  async function copyLink() {
    markShared();
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowLink(true); // clipboard is often blocked in in-app browsers
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Share your result">
      <button type="button" aria-label="Close" className="fade absolute inset-0 bg-text/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="sheet-up relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-[2rem] sm:p-7">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-edge sm:hidden" />
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker">Share</p>
            <h2 className="text-2xl font-extrabold">Show your scan</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-wash hover:bg-edge" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="relative mx-auto mt-5 w-full max-w-[220px]">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-3 rounded-2xl bg-marker" aria-hidden />
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-edge bg-wash">
            {card.status === "ready" ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob URL
              <img src={card.url} alt={`My resume scan: ${result.commonCount} of ${result.totalCount} lines copied`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-soft">
                {card.status === "loading" ? (
                  <>
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-edge border-t-pen" />
                    Making your card…
                  </>
                ) : (
                  "Couldn't make the image. You can still copy the link."
                )}
              </div>
            )}
          </div>
        </div>
        {card.status === "ready" && <p className="mt-4 text-center text-xs text-soft">On Instagram? Press and hold the image to save it.</p>}

        <div className="mt-5 grid gap-2.5">
          {card.status === "ready" && canShareFiles && (
            <button type="button" className="btn w-full text-lg" onClick={shareImage}>
              <ShareIcon /> Share to Stories & chats
            </button>
          )}
          {card.status === "ready" && (
            <a href={card.url} download={card.file.name} onClick={markShared} className={`btn w-full ${canShareFiles ? "btn-outline" : ""}`}>
              <DownloadIcon /> Save image
            </a>
          )}
          <button type="button" className="btn btn-outline w-full" onClick={copyLink}>
            {copied ? <CheckIcon /> : <LinkIcon />}
            {copied ? "Link copied!" : "Copy link"}
          </button>
        </div>
        {showLink && <input readOnly value={shareLink} className="input mt-2.5 text-sm" onFocus={(e) => e.currentTarget.select()} aria-label="Share link" />}
        <p className="mt-4 text-center text-xs text-soft">Links show your count only — never your resume.</p>
      </div>
    </div>
  );
}
