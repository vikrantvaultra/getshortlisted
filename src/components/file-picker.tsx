"use client";

import { useId } from "react";
import { CheckIcon, FileIcon, UploadIcon } from "./icons";

type Props = {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

/** A plain <input type="file"> behind a big tap target (works in in-app browsers; drop works on desktop). */
export function FilePicker({ label, hint, accept, file, onChange, disabled }: Props) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-all ${
        file ? "border-good bg-[#effaf3]" : "border-edge-strong bg-wash hover:border-pen hover:bg-pen-wash"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${file ? "bg-good text-white" : "bg-white text-pen shadow-sm"}`}>
        {file ? <CheckIcon /> : <UploadIcon />}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{file ? file.name : label}</span>
        <span className="mt-0.5 block text-sm text-soft">{file ? "Looks good · tap to change" : hint}</span>
      </span>
    </label>
  );
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * The same picker sized like an `.input`, with a label above, so it lines up
 * with the selects and text fields next to it in a form row.
 */
export function FileField({ label, placeholder, hint, accept, file, onChange, disabled }: Props & { placeholder: string }) {
  const id = useId();
  const extension = file?.name.split(".").pop()?.toUpperCase();

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div
        className={`group relative flex min-h-[3.4rem] items-center gap-3 rounded-2xl border-[1.5px] bg-white py-1.5 pr-2 pl-1.5 transition-[border-color,box-shadow,background-color] focus-within:border-pen focus-within:shadow-[0_0_0_4px_var(--color-pen-wash)] ${
          file ? "border-edge-strong hover:border-text" : "border-dashed border-edge-strong hover:border-pen hover:bg-pen-wash/40"
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${file ? "bg-pen-wash text-pen" : "bg-wash text-soft group-hover:text-pen"}`}>
          {file ? <FileIcon /> : <UploadIcon />}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          {file ? (
            <>
              <span className="block truncate text-[0.95rem] font-semibold" title={file.name}>
                {file.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[0.72rem] text-faint">
                <CheckIcon className="h-3.5 w-3.5 text-good" />
                {extension} · {formatSize(file.size)}
              </span>
            </>
          ) : (
            <>
              <span className="block truncate text-[0.95rem] font-semibold">{placeholder}</span>
              <span className="mt-0.5 block truncate text-[0.8rem] text-faint">{hint}</span>
            </>
          )}
        </span>
        <span
          aria-hidden
          className="shrink-0 rounded-lg bg-wash px-2.5 py-1.5 text-xs font-semibold text-soft transition-colors group-hover:bg-text group-hover:text-white"
        >
          {file ? "Change" : "Browse"}
        </span>
      </div>
    </div>
  );
}
