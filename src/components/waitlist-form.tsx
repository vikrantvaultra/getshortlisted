"use client";

import { useState } from "react";
import { CheckIcon } from "./icons";

export function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Couldn't add you. Try again.");
        return setStatus("error");
      }
      setStatus("done");
    } catch {
      setError("Couldn't connect. Try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="pop flex items-center gap-2.5 rounded-2xl bg-[#effaf3] p-4 font-semibold text-[#0b6b35]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-good text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
        You&apos;re on the list — we&apos;ll email you once.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          aria-label="Email"
          className="input flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-dark shrink-0" disabled={status === "sending"}>
          {status === "sending" ? "Adding…" : "Notify me"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm font-medium text-warn">
          {error}
        </p>
      )}
    </form>
  );
}
