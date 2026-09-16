"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FIELDS, type DomainOption } from "@/lib/fields";
import { CloseIcon, SearchIcon } from "./icons";

type Extra = { value: string; label: string };

type Props = {
  id?: string;
  domains: DomainOption[];
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  /** Shown on the button when nothing is chosen. */
  placeholder?: string;
  /** Options listed above the roles when the search box is empty (e.g. "Match it from my resume"). */
  extras?: Extra[];
  className?: string;
};

type Item = { value: string; label: string; group: string | null };

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * A role dropdown with a search box: 147 roles are too many to scroll.
 * Matches the role name and its field ("bank" finds everything under Finance & Banking).
 * The list opens in the page flow, not floating, so panels with overflow-hidden never clip it.
 */
export function RolePicker({ id, domains, value, onChange, disabled, placeholder = "Pick your role", extras = [], className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const items = useMemo<Item[]>(() => {
    const words = normalise(query).split(" ").filter(Boolean);
    const matches = (text: string) => words.every((word) => normalise(text).split(" ").some((part) => part.startsWith(word)));
    const roles = FIELDS.flatMap((field) =>
      domains
        .filter((option) => option.field === field.id)
        .filter((option) => !words.length || matches(`${option.label} ${field.label}`))
        .map((option) => ({ value: option.slug, label: option.label, group: field.label })),
    );
    // Roles whose own name matches come before ones matched only by their field.
    if (words.length) roles.sort((a, b) => Number(!matches(a.label)) - Number(!matches(b.label)));
    // While searching, only roles are listed, so Enter picks the best match.
    return [...(words.length ? [] : extras.map((extra) => ({ ...extra, group: null }))), ...roles];
  }, [domains, extras, query]);

  const selected = extras.find((extra) => extra.value === value)?.label ?? domains.find((option) => option.slug === value)?.label;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const current = items.findIndex((item) => item.value === value);
    setActive(current >= 0 ? current : 0);
    // Only when opening: highlight the current choice.
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    onChange(item.value);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(items[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const roleCount = items.filter((item) => item.group).length;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        className="input min-h-11 py-2 text-left font-semibold"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%230f1115' stroke-width='2'%3E%3Cpath d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1.05rem center",
          paddingRight: "2.6rem",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={selected ? "" : "text-soft"}>{selected ?? placeholder}</span>
      </button>

      {open && (
        <div className="fade mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-14px_rgba(15,17,21,0.3)] ring-1 ring-edge">
          <div className="flex items-center gap-2 border-b border-edge px-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-soft" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search roles — e.g. nurse, sales, teacher"
              className="min-h-12 w-full bg-transparent text-base font-normal outline-none [&::-webkit-search-cancel-button]:hidden"
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-autocomplete="list"
              aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
              autoComplete="off"
              enterKeyHint="done"
            />
            {query && (
              <button
                type="button"
                className="rounded-full p-1.5 text-soft hover:bg-wash"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto overscroll-contain py-1.5 text-left sm:max-h-80">
            {items.map((item, i) => {
              const header = item.group && item.group !== items[i - 1]?.group && !query;
              return (
                <li key={item.value} role="presentation">
                  {header && <p className="px-4 pt-2.5 pb-1 font-mono text-[0.68rem] tracking-wider text-soft uppercase">{item.group}</p>}
                  <button
                    type="button"
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={item.value === value}
                    tabIndex={-1}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[0.97rem] ${
                      i === active ? "bg-pen-wash text-pen" : ""
                    } ${item.value === value ? "font-semibold" : "font-normal"}`}
                  >
                    <span>{item.label}</span>
                    {query && item.group && <span className="shrink-0 text-xs text-soft">{item.group}</span>}
                  </button>
                </li>
              );
            })}
            {roleCount === 0 && (
              <li className="px-4 py-6 text-center text-sm text-soft">
                No role matches “{query}”. Try a broader word, like “engineer” or “sales”.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
