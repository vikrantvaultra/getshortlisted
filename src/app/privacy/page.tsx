import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import { SITE } from "@/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Get Shortlisted collects, why, how long we keep it, and how to withdraw consent or delete your data under India's DPDP Act, 2023.",
};

const UPDATED = "15 September 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-14">
      <header className="rise">
        <span className="sticker -rotate-1">
          <ShieldIcon className="h-4 w-4" />
          Privacy policy
        </span>
        <h1 className="mt-5 text-title font-extrabold">
          We hold other people&apos;s documents. Here&apos;s <span className="marker">exactly how</span>.
        </h1>
        <p className="mt-3 font-mono text-sm text-soft">Updated {UPDATED}</p>
      </header>

      <section id="short" className="rise panel mt-9 grid divide-y divide-edge px-5 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 sm:py-3" style={{ ["--delay" as string]: "100ms" }}>
        {[
          ["Checking your resume", "We read it, count, and throw it away. The file is never saved."],
          ["Sharing your resume", "Used only in the ways you tick, after your personal details are removed."],
          ["Deleting", "One link deletes everything, any time. No account needed."],
          ["What we never do", "Sell data, show ads, or send your documents to any AI."],
        ].map(([title, text]) => (
          <div key={title} className="flex items-start gap-3 py-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pen-wash text-pen">
              <CheckIcon className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="mt-0.5 block text-[0.95rem] text-soft">{text}</span>
            </span>
          </div>
        ))}
      </section>

      <nav className="mt-9 flex flex-wrap gap-2" aria-label="Sections">
        {[
          ["twin-score", "Checking"],
          ["submissions", "Submissions"],
          ["waitlist", "Waitlist & purchases"],
          ["processors", "Service providers"],
          ["rights", "Your rights"],
          ["delete", "Delete"],
          ["contact", "Grievances"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="chip hover:bg-pen-wash hover:text-pen">
            {label}
          </a>
        ))}
      </nav>

      <p className="mt-9 text-soft">
        The details below explain what personal data {SITE.name} (&ldquo;we&rdquo;) processes, why, and your rights under India&apos;s Digital
        Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;). We are the Data Fiduciary for this data.
      </p>

      <div>
        <div className="prose-legal [&_section]:scroll-mt-24">
          <section id="twin-score">
            <h2>Checking your resume (free tool)</h2>
            <p>
              <strong>What we process:</strong> the resume file you upload. Contact details are stripped, the text is split into phrases and
              compared against our index, and the result is returned to you. The index is made of resumes from openly licensed public datasets, reference resumes we generated, and real resumes that people have submitted and allowed us to
              include. Only phrase counts are used — no resume from the index is ever shown to anyone through the score.
            </p>
            <p>
              <strong>What we keep:</strong> not the file, not its text, not its lines. We record only the outcome of the scan — the number of
              lines scored and matched, the percentage, a one-way hash of your IP address (for rate limiting and abuse prevention), the
              referring page, and whether you generated a share card.
            </p>
            <p>
              <strong>Share card:</strong> to draw your card, your browser sends the lines back to us once; the image is generated and returned
              immediately and nothing is stored. Share links show only your count, never your resume.
            </p>
            <p>
              <strong>Why:</strong> to give you the result you asked for (your consent, given by uploading), and to understand whether the tool
              works.
            </p>
          </section>

          <section id="submissions">
            <h2>Resume submissions</h2>
            <p>
              <strong>What we collect:</strong> your resume; a screenshot or PDF of your offer (we ask you to hide salary); the company, role,
              year and whether you were a fresher; optionally your college and city; and your email address.
            </p>
            <p>
              <strong>Two separate consents.</strong> Each is optional, unticked by default, and recorded on its own:
            </p>
            <ul>
              <li>
                <strong>Index consent</strong> — we may add the phrases of your anonymised resume to the index behind Twin Score. People see
                counts; nobody can read your resume through it.
              </li>
              <li>
                <strong>Public consent</strong> — we may show your anonymised resume to other job seekers, alongside company, role, year, level
                and college tier. This may be part of a paid library.
              </li>
            </ul>
            <p>
              <strong>Anonymisation:</strong> before your resume is used in either way, we remove your name, phone number, email address, links,
              exact dates (years remain), photo, address, date of birth and family details. A person reviews every redaction before approval.
              Your college is shown only as a tier.
            </p>
            <p>
              <strong>Offer proof</strong> is used only to verify that the offer is real. It is never published and is deleted once your
              submission is reviewed.
            </p>
            <p>
              <strong>Retention:</strong> your original file and proof are deleted when your submission is approved or rejected. For rejected
              submissions we keep only the non-document details (company, role, year, status, reason) for our records. Approved anonymised
              resumes are kept until you withdraw consent or ask us to delete them. Your email is kept only so the deletion link can work and so
              we can reach you about your submission.
            </p>
          </section>

          <section id="waitlist">
            <h2>Waitlist and purchases</h2>
            <p>
              If you join the waitlist we store your email, the company you&apos;re aiming for (if you give one) and where you signed up, only to
              tell you when paid features open. One email; unsubscribe by replying.
            </p>
            <p>
              If paid features are available and you buy one, payment is handled by Razorpay. We never see your card, UPI or bank details. We
              receive your email, the product, the amount and Razorpay&apos;s order and payment IDs, which we keep as required for tax and
              accounting records. There are no user accounts; your email and order ID are how we recognise a purchase.
            </p>
          </section>

          <section id="processors">
            <h2>Who else touches it</h2>
            <p>We use a small number of service providers (Data Processors) who process data only on our instructions:</p>
            <ul>
              <li>
                <strong>Vercel</strong> — hosting and running the website.
              </li>
              <li>
                <strong>Resend</strong> — sending the confirmation email with your deletion link.
              </li>
              <li>
                <strong>Razorpay</strong> — payments, if you buy something.
              </li>
            </ul>
            <p>Some of these providers may process data outside India. We do not sell or rent personal data to anyone.</p>
          </section>

          <section id="rights">
            <h2>Your rights under the DPDP Act</h2>
            <ul>
              <li>
                <strong>Access</strong> — ask what personal data we hold about you and how it&apos;s been used.
              </li>
              <li>
                <strong>Correction and completion</strong> — ask us to fix anything inaccurate.
              </li>
              <li>
                <strong>Erasure</strong> — ask us to delete your data (or use your deletion link).
              </li>
              <li>
                <strong>Withdraw consent</strong> — at any time, as easily as you gave it. Withdrawal doesn&apos;t affect processing that
                already happened, but we stop from then on.
              </li>
              <li>
                <strong>Grievance redressal</strong> — complain to us, and if you&apos;re not satisfied, to the Data Protection Board of India.
              </li>
              <li>
                <strong>Nominate</strong> — name someone to exercise these rights on your behalf in case of death or incapacity.
              </li>
            </ul>
          </section>

          <section id="delete">
            <h2>How to withdraw consent or delete</h2>
            <p>
              <strong>Fastest:</strong> open the deletion link from your confirmation email (it looks like{" "}
              <code>{SITE.domain}/delete/…</code>) and press the button. It immediately and permanently deletes your submission, your files,
              any published anonymised copy, and removes your resume&apos;s phrases from the score index.
            </p>
            <p>
              <strong>Lost the link, or want to withdraw only one consent?</strong> Email{" "}
              <a href={`mailto:${SITE.grievanceEmail}`} className="underline underline-offset-4">
                {SITE.grievanceEmail}
              </a>{" "}
              from the address you submitted with, and tell us what you&apos;d like. We&apos;ll act within 7 days and confirm by email.
            </p>
          </section>

          <section id="children">
            <h2>Children</h2>
            <p>
              {SITE.name} is meant for people aged 18 and over. We don&apos;t knowingly accept submissions from anyone younger. If you believe a
              child has submitted a resume, write to us and we&apos;ll delete it.
            </p>
          </section>

          <section id="security">
            <h2>Security and breaches</h2>
            <p>
              Uploaded files are served only to our reviewer behind a password. IP addresses are stored only as one-way hashes. Resume text is
              never written to logs. If a personal data breach happens, we will inform affected people and the Data Protection Board as the DPDP
              Act requires.
            </p>
          </section>

          <section id="contact">
            <h2>Grievances and contact</h2>
            <p>
              Grievance Officer, {SITE.name} —{" "}
              <a href={`mailto:${SITE.grievanceEmail}`} className="underline underline-offset-4">
                {SITE.grievanceEmail}
              </a>
              . We respond within 7 days. We&apos;ll post changes to this policy on this page and update the date at the top; if a change
              affects how we use a submission you&apos;ve already made, we&apos;ll email you.
            </p>
            <p>
              <Link href="/submit" className="underline underline-offset-4">
                Back to submitting
              </Link>{" "}
              ·{" "}
              <Link href="/" className="underline underline-offset-4">
                Twin Score
              </Link>
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
