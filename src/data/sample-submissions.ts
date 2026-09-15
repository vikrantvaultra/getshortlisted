import type { Level } from "@/config";

/**
 * Three hardcoded demo submissions so the admin review queue isn't empty on
 * first run. The people are invented. They are marked `sample` throughout
 * and never counted as real verified resumes.
 */

type SampleSubmission = {
  id: string;
  createdAt: string;
  extractedText: string;
  pageCount: number;
  company: string;
  role: string;
  year: number;
  level: Level;
  college: string;
  city: string;
  submitterEmail: string;
  consentCorpus: boolean;
  consentPublic: boolean;
};

export const SAMPLE_SUBMISSIONS: SampleSubmission[] = [
  {
    id: "sub_sample_ananya",
    createdAt: "2026-09-12T10:24:00.000Z",
    company: "Razorpay",
    role: "Software Engineer",
    year: 2026,
    level: "fresher",
    college: "PES University, Bengaluru",
    city: "Bengaluru",
    submitterEmail: "ananya.sample@example.com",
    consentCorpus: true,
    consentPublic: true,
    pageCount: 1,
    extractedText: `Ananya Rao
ananya.rao.sample@example.com | +91 98450 11223 | linkedin.com/in/ananya-sample | Bengaluru

EDUCATION
B.Tech in Computer Science, PES University, Bengaluru — CGPA 8.9 — Aug 2022 – May 2026
Class XII, CBSE, Delhi Public School — 94.2% — March 2022

EXPERIENCE
Software Engineering Intern, Setu (Pine Labs) — Jan 2026 – Jun 2026
• Rewrote the webhook retry worker in Go, cutting duplicate deliveries from 1.8% to 0.2% across 3M monthly events
• Added idempotency keys to the payouts API and wrote the migration that backfilled 40 lakh historical rows without downtime
• Built a Grafana dashboard for bank-partner latency that the on-call team now uses as its first alert source

PROJECTS
UPI Split — Go, PostgreSQL, React
• Group expense app that settles balances with the minimum number of UPI transfers using a greedy debt-simplification pass
• Load-tested to 1,200 requests per second on a single 2 vCPU instance after replacing N+1 queries with batched reads
Compiler for a toy language — C++
• Lexer, recursive-descent parser and a stack VM; passes a 300-case test suite I wrote from the language spec

ACHIEVEMENTS
• ICPC Asia West Continent regionalist, 2025 — team rank 47
• Solved 900+ problems on Codeforces; peak rating 1874 (Expert)

SKILLS
Go, C++, TypeScript, PostgreSQL, Redis, Kafka, Docker, Grafana

PERSONAL DETAILS
Date of Birth: 14/02/2004
Languages Known: English, Kannada, Hindi`,
  },
  {
    id: "sub_sample_rohit",
    createdAt: "2026-09-13T16:02:00.000Z",
    company: "TCS",
    role: "Systems Engineer",
    year: 2025,
    level: "fresher",
    college: "Government Engineering College, Aurangabad",
    city: "Pune",
    submitterEmail: "rohit.sample@example.com",
    consentCorpus: true,
    consentPublic: false,
    pageCount: 2,
    extractedText: `ROHIT DESHMUKH
Email: rohit.d.sample@example.com  Mobile: +91-9823456710
Address: Flat 12, Shivaji Nagar, Aurangabad, Maharashtra

CAREER OBJECTIVE
To work in a challenging and dynamic environment where I can utilise my skills and knowledge for the growth of the organisation.

EDUCATION
B.E. (Information Technology), Government Engineering College, Aurangabad, 2021 – 2025, CGPA: 7.8
HSC, Maharashtra State Board, 2021, 82.40%
SSC, Maharashtra State Board, 2019, 89.60%

PROJECTS
Library Management System
• Developed a library management system using Java, JDBC and MySQL to manage book issue and return.
• Implemented login module for admin and students with role based access.
Attendance System using Face Recognition
• Built a face recognition based attendance system using Python and OpenCV with 91% accuracy on a class of 60 students.

INTERNSHIP
Web Development Intern, Techno Solutions Pvt. Ltd., Pune — 15 June 2024 to 15 August 2024
• Worked on front end development using HTML, CSS, JavaScript and Bootstrap.
• Collaborated with the team to fix bugs and improve the performance of the website.

CERTIFICATIONS
• TCS iON Career Edge – Young Professional
• NPTEL – Programming in Java (Elite)

STRENGTHS
• Hard working, quick learner and good team player with positive attitude.

PERSONAL DETAILS
Father's Name: Suresh Deshmukh
Date of Birth: 03/11/2003
Marital Status: Unmarried
Languages Known: English, Hindi, Marathi

DECLARATION
I hereby declare that the above information is true to the best of my knowledge and belief.`,
  },
  {
    id: "sub_sample_meera",
    createdAt: "2026-09-14T08:41:00.000Z",
    company: "Flipkart",
    role: "Data Analyst",
    year: 2024,
    level: "experienced",
    college: "St. Xavier's College, Mumbai",
    city: "Bengaluru",
    submitterEmail: "meera.sample@example.com",
    consentCorpus: false,
    consentPublic: true,
    pageCount: 1,
    extractedText: `Meera Iyer
meera.iyer.sample@example.com · +91 90040 55667 · github.com/meera-sample

SUMMARY
Analyst with three years in e-commerce operations analytics; moved a returns-fraud model from spreadsheet to production.

EXPERIENCE
Senior Business Analyst, Myntra — Mar 2022 – Jul 2024
• Built the returns-abuse score (logistic regression on 14 order features) that flagged 6% of accounts and cut refund leakage by ₹2.1 crore a quarter
• Replaced a 40-tab Excel planning model with a dbt + Looker pipeline; weekly category reviews went from 2 days of prep to 20 minutes
• Designed the A/B readout template adopted by 9 product pods, including pre-registered metrics and guardrails
Business Analyst, Mu Sigma — Jul 2021 – Feb 2022
• Forecasted weekly demand for 1,800 SKUs for a US grocery client with a hierarchical ARIMA model; MAPE 11%

EDUCATION
B.Sc. Statistics, St. Xavier's College, Mumbai — 2018 – 2021

SKILLS
SQL, Python, dbt, Looker, BigQuery, Airflow, Excel`,
  },
];

/** A stand-in "offer email screenshot" with the salary blacked out. */
export function sampleProofSvg(company: string, role: string, year: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <rect width="720" height="900" fill="#ffffff"/>
  <rect width="720" height="64" fill="#f1f3f4"/>
  <text x="32" y="40" font-family="Arial, sans-serif" font-size="18" fill="#5f6368">Inbox</text>
  <text x="32" y="120" font-family="Arial, sans-serif" font-size="26" fill="#202124">Offer of Employment — ${role}</text>
  <text x="32" y="160" font-family="Arial, sans-serif" font-size="16" fill="#5f6368">careers@${company.toLowerCase().replace(/\s+/g, "")}.example · ${year}</text>
  <line x1="32" y1="190" x2="688" y2="190" stroke="#e0e0e0"/>
  <text x="32" y="240" font-family="Arial, sans-serif" font-size="17" fill="#202124">Dear Candidate,</text>
  <text x="32" y="285" font-family="Arial, sans-serif" font-size="17" fill="#202124">We are pleased to offer you the position of ${role} at ${company}.</text>
  <text x="32" y="320" font-family="Arial, sans-serif" font-size="17" fill="#202124">Your annual compensation will be</text>
  <rect x="300" y="302" width="220" height="26" fill="#111111"/>
  <text x="32" y="355" font-family="Arial, sans-serif" font-size="17" fill="#202124">Please confirm your acceptance within 7 days of this letter.</text>
  <rect x="32" y="420" width="656" height="14" fill="#eeeeee"/>
  <rect x="32" y="450" width="590" height="14" fill="#eeeeee"/>
  <rect x="32" y="480" width="620" height="14" fill="#eeeeee"/>
  <text x="32" y="580" font-family="Arial, sans-serif" font-size="17" fill="#202124">Regards,</text>
  <text x="32" y="610" font-family="Arial, sans-serif" font-size="17" fill="#202124">Talent Acquisition, ${company}</text>
  <text x="32" y="860" font-family="Arial, sans-serif" font-size="14" fill="#b00020">SAMPLE PROOF — generated for the demo, not a real offer</text>
</svg>`;
}
