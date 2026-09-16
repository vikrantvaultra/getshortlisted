# Get Shortlisted

**getshortlisted.in** — upload a resume and see how many of its lines already appear in resumes we've seen. People who got placed can send in the resume that worked. Nothing here uses AI: every number is counted.

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · `unpdf` + `mammoth` for file parsing · `next/og` for the share card.

## This build: no database, everything hardcoded

This build is meant for a single demo, so there are **no external services**: no Postgres, no Blob storage, no Redis, no AI.

| Thing | Where it lives |
|---|---|
| Phrase index (the scoring data) | `data/index/phrase-index.bin` (binary, ~37 MB) + `phrase-index.json` (metadata), committed, built by `npm run corpus:ingest` |
| Reference corpus (46,547 generated mock resumes) | `corpus/`, gitignored, produced by `npm run corpus:generate` |
| Open datasets (59,176 distinct resumes: 35,038 real, 24,138 AI-generated, 147 domains) | `corpus/open/<source>/`, gitignored, produced by `npm run corpus:import-open` |
| Sample library (30 anonymised demo resumes) | `src/data/library-resumes.ts`, every one labelled **Sample** in the UI |
| Sample admin queue (3 invented submissions) | `src/data/sample-submissions.ts` |
| Submissions, waitlist, scans, orders, rate limits | Server memory (`src/lib/server/store.ts`), **reset on restart** |
| Every tunable number (thresholds, limits, prices) | `src/config.ts` |

**Where to run it.** It's best run as one long-lived Node process (`npm run build && npm start`, or any single-instance host). On Vercel the public side works fully: landing, Twin Score, share card and privacy are stateless. But serverless instances don't share memory, so a submission may not appear in the admin panel, and data vanishes when an instance is recycled. The store mirrors the original table design (`submissions`, `resumes`, `scans`, `waitlist`, `orders`), so moving to Postgres later is mechanical.

## Run it

```bash
npm install
cp .env.example .env.local     # optional — everything has a dev default
npm run dev                    # http://localhost:3000 — the home page is the resume checker
npm test                       # 34 unit tests: normalise, shingle, score, extract, anonymise, structure
```

Admin: http://localhost:3000/admin — the password is `admin` in development unless `ADMIN_PASSWORD` is set. In production the panel stays disabled until `ADMIN_PASSWORD` is set.

## The seed index

The index ships pre-built from 46,547 generated reference resumes. To rebuild it or add your own:

```bash
npm run corpus:generate                # (re)writes 46,547 mock resumes to ./corpus  (--count N); clear ./corpus first
npm run corpus:ingest                  # adds any NEW files in ./corpus to the index
npm run corpus:ingest -- --rebuild     # start the index from scratch
npm run corpus:stats                   # print the summary any time (--top 25 for more phrases)
```

- `./corpus/` accepts `.txt`, `.md`, `.pdf` and `.docx`, one resume per file. It uses the same extraction path as user uploads.
- **Always exact:** every ingest recounts all files in `./corpus` (about 3 minutes for ~106k resumes, with 8 GB of heap). So adding, changing or removing files can never double-count. Identical files are counted once. `data/index/ingested-files.json` records what was counted.
- **Storage:** only phrases seen in ≥2 documents are stored, since those are the only ones that can mark a line as common. They go into a sorted binary table of 48-bit phrase keys and counts, looked up by binary search. `SCORING.MIN_DOC_COUNT` must stay ≥ 2.
- A phrase counts **once per document**, however often it repeats inside that resume.
- Ingest prints: documents ingested, unique phrases, phrases in ≥2 documents, and the ten most common phrases. Read that last list to check that the corpus looks like real resume language.
- To use your own corpus instead of the generated one, empty `./corpus`, add your files, and run `npm run corpus:ingest -- --rebuild`.
- **If you change anything in `src/lib/scoring/` or `SCORING` in `src/config.ts`, run `npm run corpus:ingest` again.** The index and the scorer must use an identical pipeline.

## Open resume datasets

On top of the generated corpus, the index includes resumes from **openly licensed public datasets** (Hugging Face). Only datasets with an explicit open license are used: CC0, MIT, Apache-2.0 and Unlicense. See `OPEN_DATA_NOTICE.md` for the list.

```bash
npm run corpus:import-open                 # download (cached in corpus/_cache), convert, de-duplicate → corpus/open/<source>/
npm run corpus:import-open -- --only opensporks,brackozi
npm run corpus:ingest                      # rebuild the index with generated + open resumes
```

- **Clean-up before saving:** emails, phone numbers and links are stripped before any file is written.
- **Duplicates removed:** exact copies go, and so do near-duplicates (≥80% of five-word phrases shared, estimated with MinHash). Resumes with fewer than 40 distinct phrases are dropped. Real sources are imported before synthetic ones, so a real resume wins over a synthetic copy.
- **Real and AI-generated are counted separately** (`documents.openReal` / `documents.openSynthetic` in the index) and shown separately in the admin dashboard.
- **Adding a dataset:** add an entry to `SOURCES` in `scripts/import-open-resumes.ts`, with its license checked first.
- **Removing a source:** delete `corpus/open/<source>/`, remove it from `data/index/open-sources.json`, and rebuild.
- **Excluded datasets:** ones with no license or a non-commercial license. `resume-atlas` is also excluded because its text has stop-words removed, so its phrases could never match a real resume.

## How the Twin Score works (plain English)

1. **Read.** We pull the text out of your PDF or Word file (checked by its first bytes, not its extension). Emails, phone numbers and links are deleted first.
2. **Split.** The text is cut into sentences and bullet lines. Lines under 5 words (headings, dates) and comma-lists ("Python, Java, SQL, Git") are ignored because they would inflate the score meaninglessly.
3. **Normalise.** Each line is lowercased, punctuation is stripped, and every number becomes `#`. So "Improved latency by 40%" and "improved latency by 25 %" look the same.
4. **Shingle.** Each line becomes overlapping five-word phrases: "collaborated with cross functional teams", "with cross functional teams to", and so on.
5. **Look up.** Every phrase is SHA-1 hashed and looked up in the index in one batch. A phrase is *seen* if **at least 2** different documents contain it.
6. **Judge each line.** A line is *common* if **at least 60%** of its phrases are seen.
7. **Count.** The headline is the **count**: *"12 of your 19 lines already appear in resumes we've seen."* The percentage is secondary and rounds down.

The result always states the real denominator, broken down by source. For example: *"Measured against 46,547 resumes (46,547 generated reference, 46,547 real verified)."* Approved submissions raise the "real verified" number live. Nothing is rounded up or invented.

The uploaded file and its text are never stored. A scan keeps only counts, a hashed IP, the referrer and whether a card was made.

Thresholds live in `src/config.ts` → `SCORING`.

## Submissions → admin → library

1. `/submit` is five short steps: resume → offer proof → company/role/year → fresher or experienced + email → **two separate unticked consents**.
2. The confirmation screen shows a one-click deletion link, and it's emailed too when `RESEND_API_KEY` is set. `/delete/[token]` hard-deletes the submission, its files and its published copy, and decrements its phrase counts. Opening the link alone never deletes (email scanners open links); pressing the button does.
3. `/admin` shows the review queue. For each submission you: look at the proof, edit the auto-redacted draft (name, contacts, URLs, exact dates, address and personal rows are removed), pick a college tier, then approve or reject.
   - **Approve** indexes the text if index consent was given, and publishes it to the library if public consent was given. Consents are applied independently.
   - Original files are deleted after review.
   - **Reject** deletes the documents and keeps only metadata.
4. The dashboard shows the funnel (scans, share cards, waitlist) with CSV export.

## Paid features (v2) — flipping the flag

Library and Compare, sold together as one ₹49 pass, are fully built and return **404** until:

```bash
NEXT_PUBLIC_PAID_ENABLED=true
```

This is inlined at build time, so restart `next dev` or redeploy after changing it. Prices and access length are in `src/config.ts` → `PRODUCTS`.

- **Try first, pay at the result:** anyone can run a comparison or browse and filter the library. The placed resumes in a comparison and the text of each library resume are locked behind an inline pay panel; the server doesn't send that data without access.
- **Checkout:** the pay panel (or `/unlock`) → Razorpay Checkout → `/api/pay/verify` checks the HMAC signature → a signed access cookie is set for 30 days. There are no accounts; the email plus the order ID is the receipt.
- **Restore on another device:** `/unlock?restore=1` looks the order up with Razorpay directly, so no database is needed.
- **Webhook:** add `https://<domain>/api/pay/webhook` in Razorpay for `order.paid` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET`. The signature is verified on every call.
- **No keys in development** → a simulated checkout grants access instantly, so you can try the flow. This mode is disabled in production.
- **Compare** puts the upload next to 5 resumes for the chosen company, using only counts: pages, section order, bullets per project, where certifications sit, phrase overlap with the placed set, average words per line, bulleted lines and word count. There's no commentary.
- ⚠️ The library is currently **sample content**. Replace it with approved real submissions before charging anyone.

## Environment

See `.env.example`; every variable is documented there. For production you need at least `ADMIN_PASSWORD`, `SIGNING_SECRET` and `NEXT_PUBLIC_SITE_URL`. Real keys go in `.env.local` (gitignored) or your host's settings, never in `.env.example`.

## Layout

```
src/config.ts                 every tunable constant
src/lib/scoring/              THE pipeline (text → lines → shingles → hashes → score), shared by app + scripts
src/lib/extract/              magic-byte detection, PDF/DOCX extraction
src/lib/anonymise.ts          redaction draft for admin review
src/lib/structure.ts          countable structure metrics for Compare
src/lib/server/               store, phrase index, rate limit, crypto, admin auth, access, razorpay, email, share card
src/data/                     hardcoded sample library + sample submissions
src/app/                      pages and API routes
scripts/                      corpus generate / ingest / stats
data/index/                   the built phrase index (committed)
fixtures/ tests/              sample resumes and unit tests
```

## Deliberate deviations from the original brief

- **No Neon, Drizzle, Blob, Upstash or Resend SDK**, per the no-database decision. Rate limiting is in memory per instance. Resend and Razorpay are called with plain `fetch`, so there are no SDK dependencies.
- **`tsx` was added as a dev dependency** to run the TypeScript scripts and tests (with Node's built-in test runner).
- **Skill-list lines are dropped** in addition to short lines (`SCORING.DROP_LIST_LINES`). Otherwise a long comma-separated skills row would count as a "common line".
- **Contact stripping and line splitting run before normalisation**, because normalising destroys the newlines and punctuation that splitting needs.
- **Upload limit:** 5 MB per file as specified, but Vercel rejects request bodies over 4.5 MB, and a submission sends two files together.
