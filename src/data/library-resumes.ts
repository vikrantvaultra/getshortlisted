import type { LibraryResume } from "./types";

/**
 * Hardcoded model-resume library. Every entry is written for this build —
 * `sample: true` — so no entry may be presented as a real person's resume or
 * carry the "Offer verified" badge. Buyers see these as "Model resumes":
 * written to show the structure a shortlisted resume has. As real approved
 * submissions arrive they sit alongside these and carry the verified badge.
 *
 * Format of `redactedText`: CAPS section headers on their own line, "• "
 * bullets, project/role title lines without a bullet, years only.
 */

/** Strips the leading newline and any common indentation from a template literal. */
function text(strings: TemplateStringsArray): string {
  const raw = strings.raw.join("").replace(/^\n/, "").replace(/\n\s*$/, "");
  const lines = raw.split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

export const LIBRARY_RESUMES: LibraryResume[] = [
  // ─── TCS ───────────────────────────────────────────────────────────────────
  {
    id: "lib-tcs-01",
    company: "TCS",
    role: "Systems Engineer",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Nagpur",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.E., Information Technology — [College removed], Tier 3 — 2020 – 2024
      CGPA 8.4 / 10, no active backlogs
      Class XII, Maharashtra State Board — 81%
      PROJECTS
      Hostel Mess Feedback Portal | PHP, MySQL, Bootstrap
      • Replaced paper feedback forms for 3 hostels; 640 students submitted ratings in the first month
      • Built a weekly report the mess committee used to drop two dishes rated below 2 out of 5
      • Added OTP login through the college email domain so only residents could vote
      Bus Pass Renewal Tracker | Java, Swing, SQLite
      • Desktop tool for the transport office that cut renewal queue time from about 40 minutes to 10
      • Exported monthly renewals to Excel for the accounts section
      SKILLS
      Java, SQL, PHP, HTML, CSS, Git
      Solved 210 problems on HackerRank (Java 5 star, SQL 4 star)
      CERTIFICATIONS
      • TCS iON Career Edge — Young Professional
      • NPTEL Programming in Java — Elite, top 5%
      ACHIEVEMENTS
      • Cleared TCS NQT in the first attempt with a Digital-eligible score in the coding section
      • Placement coordinator for the IT department, handled drives for 11 companies
    `,
  },
  {
    id: "lib-tcs-02",
    company: "TCS",
    role: "Digital Systems Engineer",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Bhubaneswar",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Final-year CSE student who ships small, finished tools. Comfortable in Python and Java; learning Spring Boot on the job.
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2021 – 2025
      CGPA 8.9 / 10
      TECHNICAL SKILLS
      Languages: Java, Python, SQL
      Frameworks: Spring Boot, Flask, React
      Tools: Git, Postman, Docker (basics)
      PROJECTS
      Odia–English Railway Announcement Transcriber | Python, Whisper, Flask
      • Fine-tuned a small speech model on 6 hours of recorded platform announcements
      • Word error rate dropped from 38% to 17% on a held-out set of 400 clips
      • Served captions to a web page that refreshes every 5 seconds
      • Presented at the department project expo; selected for the university innovation cell
      Placement Drive Scheduler | Spring Boot, PostgreSQL
      • Scheduled 1,900 student interview slots across 23 companies without a single double booking
      INTERNSHIPS
      Backend Intern — Government e-governance project — 2024
      • Wrote 14 REST endpoints for a grievance tracking portal used by 3 district offices
      • Added pagination and indexes that brought the slowest report from 12 s to under 1 s
      ACHIEVEMENTS
      • Rank 312 of 11,000+ in TCS CodeVita Season 12 (Round 2)
      • Smart India Hackathon finalist
    `,
  },
  {
    id: "lib-tcs-03",
    company: "TCS",
    role: "Assistant Systems Engineer",
    year: 2023,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Lucknow",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      CERTIFICATIONS
      • Microsoft Azure Fundamentals (AZ-900)
      • Oracle Database SQL Certified Associate
      • Infosys Springboard — Python Programming
      EDUCATION
      BCA — [College removed], Tier 3 — 2020 – 2023
      Percentage 78%
      PROJECTS
      Kirana Stock Register | Python, Tkinter, SQLite
      • Built for my father's shop; tracks 350 items and flags anything below reorder level every evening
      • Barcode lookup through a phone camera app that posts to a local Flask endpoint
      Library Fine Calculator | Java
      • Command-line tool used by the college library for one semester to calculate overdue fines
      SKILLS
      Python, Java, SQL, Excel, Azure basics
      EXTRA-CURRICULAR
      • Taught basic spreadsheet skills to 40 women from a local self-help group over 6 weekends
    `,
  },
  {
    id: "lib-tcs-04",
    company: "TCS",
    role: "IT Analyst",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Chennai",
    pageCount: 2,
    verified: true,
    sample: true,
    redactedText: text`
      PROFESSIONAL SUMMARY
      Mainframe-to-cloud migration engineer, 4 years. Moved COBOL batch workloads for an insurer onto Java services without a missed settlement cycle.
      EXPERIENCE
      Senior Software Engineer — Mid-size IT services company — 2022 – 2025
      • Led the migration of 38 nightly COBOL batch jobs to Spring Batch on AWS
      • Built a parallel-run harness comparing 2.1 million output records per night; mismatches fell to zero in 7 weeks
      • Reduced batch window from 6.5 hours to 2 hours by partitioning policy files by region
      • Wrote the runbook the client's operations team now uses for month-end
      Software Engineer — Same company — 2021 – 2022
      • Maintained a claims intake application in Java 8 and Oracle; closed 140 defects in 14 months
      • Automated the weekly defect ageing report with SQL and Python
      SKILLS
      Java 17, Spring Batch, Spring Boot, AWS (Step Functions, S3, RDS), Oracle, COBOL (reading), JCL, Python
      EDUCATION
      B.E., Electronics and Communication — [College removed], Tier 2 — 2017 – 2021
      CERTIFICATIONS
      • AWS Certified Developer – Associate
      • AWS Certified Solutions Architect – Associate
      ACHIEVEMENTS
      • Client appreciation for zero-incident go-live of the policy renewal batch
    `,
  },
  {
    id: "lib-tcs-05",
    company: "TCS",
    role: "Business Analyst",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Kolkata",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      MBA, Business Analytics — [College removed], Tier 1 — 2024 – 2026
      B.Com (Hons) — [College removed], Tier 2 — 2020 – 2023
      EXPERIENCE
      Summer Intern, Analytics — Regional FMCG distributor — 2025
      • Mapped the order-to-cash process across 4 depots and found 3 days of avoidable delay in credit approval
      • Built a Power BI view of 1,200 retailer accounts ranked by overdue days; collections team used it daily
      • Wrote the requirement document for an automated credit-limit rule, approved by the finance head
      Operations Analyst — Logistics startup — 2023 – 2024
      • Owned the weekly SLA report for 9 delivery hubs; spotted a routing issue costing 6% of next-day deliveries
      PROJECTS
      Dabbawala Route Study
      • Interviewed 22 dabbawalas and modelled handoff points in Excel to show why error rates stay low
      SKILLS
      SQL, Power BI, Excel (Power Query), BPMN, JIRA, Confluence
      ACHIEVEMENTS
      • Winner, inter-B-school case competition on supply chain, 140 teams
    `,
  },

  // ─── Infosys ───────────────────────────────────────────────────────────────
  {
    id: "lib-infy-01",
    company: "Infosys",
    role: "Systems Engineer",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Mysuru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.E., Computer Science — [College removed], Tier 3 — 2020 – 2024
      CGPA 7.9 / 10
      PROJECTS
      Agri Mandi Price Alerts | Python, Telegram Bot API
      • Scrapes daily mandi prices for 12 crops and messages farmers when tomato or onion crosses a set price
      • 180 farmers from two villages subscribed through a WhatsApp forward
      • Handles Kannada crop names through a small mapping table
      College Event Pass System | Django, PostgreSQL
      • Issued 2,300 QR passes for the annual fest; gate check-in took under 3 seconds per student
      • Caught 41 duplicate passes on day one
      TECHNICAL SKILLS
      Python, Django, SQL, JavaScript, Git, Linux
      CERTIFICATIONS
      • Infosys Springboard — Python Foundation and Django
      • HackerRank — Problem Solving (Intermediate)
      ACHIEVEMENTS
      • Cleared InfyTQ certification exam with 81%
    `,
  },
  {
    id: "lib-infy-02",
    company: "Infosys",
    role: "Specialist Programmer",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      CODING PROFILE
      Codeforces Expert (peak 1720), 900+ problems solved across Codeforces and LeetCode
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2021 – 2025
      CGPA 9.1 / 10
      PROJECTS
      Distributed Rate Limiter | Go, Redis
      • Token-bucket limiter shared across 4 service instances; load-tested at 12,000 requests per second
      • Kept p99 overhead under 2 ms by moving the check into a single Lua script
      • Wrote a failure-mode doc covering Redis outage behaviour
      Tiny SQL Engine | C++
      • Parser, B+ tree index and nested-loop joins in 4,000 lines; passes 160 query tests
      • Index lookups beat full scans by 40x on a 1 million row table
      INTERNSHIPS
      Software Engineering Intern — SaaS startup — 2024
      • Cut CI time from 19 minutes to 7 by caching Docker layers and splitting the test suite
      SKILLS
      C++, Go, Java, Python, Redis, PostgreSQL, Docker, Linux
      ACHIEVEMENTS
      • HackWithInfy 2024 — Top 100, qualified for the Specialist Programmer interview
      • ICPC Asia Regional qualifier
    `,
  },
  {
    id: "lib-infy-03",
    company: "Infosys",
    role: "Technology Analyst",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Pune",
    pageCount: 2,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Salesforce developer, 3.5 years, retail banking. I build the automations service agents actually use.
      EXPERIENCE
      Salesforce Developer — Banking technology partner — 2021 – 2023
      • Replaced 11 legacy Process Builders with 3 record-triggered Flows; save time on a case dropped from 4.1 s to 1.2 s
      • Built an Apex service that pulls account balances from the core banking API with retries and circuit breaking
      • Wrote 220 Apex tests keeping org coverage at 91%
      • Designed the case-routing rules for 400 agents across 5 language queues
      Associate Developer — Same company — 2020 – 2021
      • Created Lightning Web Components for a loan pre-approval screen used in 60 branches
      CERTIFICATIONS
      • Salesforce Platform Developer I
      • Salesforce Platform Developer II
      • Salesforce Administrator
      SKILLS
      Apex, Lightning Web Components, SOQL, Flows, REST integrations, Git, Copado
      EDUCATION
      B.Tech, Information Technology — [College removed], Tier 2 — 2016 – 2020
    `,
  },
  {
    id: "lib-infy-04",
    company: "Infosys",
    role: "Digital Specialist Engineer",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Coimbatore",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.E., Electronics and Communication — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.7 / 10
      PROJECTS
      Textile Loom Downtime Monitor | ESP32, MQTT, Node.js, Grafana
      • Vibration sensors on 16 power looms at a family-run unit in Tiruppur report stoppages in real time
      • Owner found that 31% of downtime came from one yarn supplier's batches
      • Runs on a ₹900-per-month cloud VM
      • Built an SMS fallback for days when the factory Wi-Fi drops
      • Documented wiring and setup so the unit's electrician can add looms without me
      Exam Seating Planner | Python
      • Generated seating for 2,800 students across 42 halls with no two same-branch students adjacent
      SKILLS
      C, Python, JavaScript, Node.js, MQTT, Embedded C, Grafana, Git
      INTERNSHIPS
      IoT Intern — Industrial automation firm — 2025
      • Wrote firmware to read Modbus energy meters and push readings every 30 seconds
      CERTIFICATIONS
      • NPTEL Introduction to Internet of Things — Elite + Gold
    `,
  },
  {
    id: "lib-infy-05",
    company: "Infosys",
    role: "Systems Engineer",
    year: 2022,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Visakhapatnam",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      SKILLS
      Java, Spring Boot, MySQL, HTML, CSS, JavaScript, Git
      EDUCATION
      B.Tech, Mechanical Engineering — [College removed], Tier 3 — 2018 – 2022
      CGPA 7.6 / 10
      PROJECTS
      Workshop Tool Crib Tracker | Spring Boot, MySQL, Thymeleaf
      • Tracks issue and return of 520 tools in the college workshop; lost tools dropped from 14 to 2 in a semester
      • Lab assistants scan a student ID card instead of writing in a register
      CAD File Version Log | Java
      • Tracked revisions for 60 SolidWorks files during the final-year project
      • Showed who changed what and when, which settled two disputes about a wrong drawing
      • Reused later by the SAE team for their go-kart build
      CERTIFICATIONS
      • Infosys Springboard — Java Full Stack
      • Coursera — Java Programming and Software Engineering Fundamentals (Duke)
      ACHIEVEMENTS
      • Switched from mechanical to software: 300+ problems on LeetCode in 8 months
    `,
  },

  // ─── Flipkart ──────────────────────────────────────────────────────────────
  {
    id: "lib-fk-01",
    company: "Flipkart",
    role: "SDE-1",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 1 — 2020 – 2024
      CGPA 8.8 / 10
      EXPERIENCE
      SDE Intern — E-commerce company — 2023
      • Built a service that precomputes delivery-date promises for 1.4 lakh pincodes; cut checkout API p99 by 120 ms
      • Added shadow traffic comparison before rollout; found and fixed 3 off-by-one-day bugs
      • Shipped behind a flag to 5% of traffic, then 100% in two weeks
      Research Intern — University systems lab — 2022
      • Benchmarked 4 LSM-tree compaction strategies; write amplification varied by 3.2x on a skewed workload
      PROJECTS
      Cart Consistency Simulator | Java, Kafka
      • Reproduced lost-update bugs in a multi-device cart and fixed them with version vectors
      • Jepsen-style fault injection across 3 nodes
      SKILLS
      Java, Go, Python, Kafka, Redis, MySQL, Docker, Kubernetes basics
      ACHIEVEMENTS
      • Flipkart GRiD 5.0 — National finalist, software development track
      • LeetCode Knight, rating 2050
    `,
  },
  {
    id: "lib-fk-02",
    company: "Flipkart",
    role: "Business Analyst",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      Integrated M.Sc, Mathematics and Computing — [College removed], Tier 1 — 2020 – 2025
      CGPA 8.3 / 10
      EXPERIENCE
      Analytics Intern — Quick-commerce company — 2024
      • Sized the loss from out-of-stock substitutions at 2.3% of GMV across 60 dark stores using order-line data
      • Built a SQL model ranking 4,000 SKUs by substitution acceptance; category team delisted 180 low-acceptance items
      • Presented findings to a category head; one recommendation went live in 3 cities
      PROJECTS
      Festive Sale Demand Decomposition | Python, statsmodels
      • Separated price effect from festival effect in 3 years of public sales data; MAPE 11% on holdout
      Return Reason Text Clustering | Python, scikit-learn
      • Grouped 50,000 return comments into 14 themes; "size mismatch" alone was 27%
      • Built a one-page dashboard for each theme
      SKILLS
      SQL (window functions, CTEs), Python (pandas, statsmodels), Excel, Tableau, A/B testing
      CERTIFICATIONS
      • Google Advanced Data Analytics Certificate
    `,
  },
  {
    id: "lib-fk-03",
    company: "Flipkart",
    role: "SDE-2",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 2,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Backend engineer, 5 years, high-traffic catalogue and search systems. I care about p99 and on-call sanity.
      EXPERIENCE
      Senior Software Engineer — Online travel company — 2021 – 2024
      • Owned the hotel availability cache serving 9,000 requests per second at peak; p99 from 480 ms to 140 ms
      • Replaced a cron-based price refresh with a Kafka event pipeline; stale-price complaints fell 72%
      • Introduced SLO-based alerting; pages per week for the team dropped from 19 to 4
      • Interviewed 60+ candidates and wrote the backend interview rubric
      Software Engineer — Fintech startup — 2019 – 2021
      • Built the merchant settlement service in Java; processed ₹400 crore per month without a reconciliation break
      • Wrote idempotency middleware later adopted by 6 other services
      SKILLS
      Java, Kotlin, Spring Boot, Kafka, Redis, Elasticsearch, MySQL, AWS, Grafana
      EDUCATION
      B.E., Computer Science — [College removed], Tier 2 — 2015 – 2019
      ACHIEVEMENTS
      • Tech talk on cache stampede prevention, attended by 300 engineers internally
    `,
  },
  {
    id: "lib-fk-04",
    company: "Flipkart",
    role: "SDE-1",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Jaipur",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Information Technology — [College removed], Tier 2 — 2022 – 2026
      CGPA 9.0 / 10
      PROJECTS
      Hindi Voice Search for Kirana Catalogues | Python, FastAPI, React
      • Maps spoken Hindi and Hinglish queries to 8,000 grocery SKUs; top-3 accuracy 84% on 600 recorded queries
      • Built a phonetic fallback that fixed "aata" vs "atta" style spelling misses
      • Latency under 400 ms on a free-tier server
      • Tested with 12 shop owners in two markets
      Open Source — Apache project contributor
      • 7 merged pull requests, including a fix for a memory leak in a connection pool
      INTERNSHIPS
      Backend Intern — B2B marketplace — 2025
      • Wrote a bulk price-update API handling 50,000 rows per upload with row-level error reports
      • Reduced seller support tickets about failed uploads by 45%
      SKILLS
      Java, Python, Spring Boot, FastAPI, PostgreSQL, Redis, React
      ACHIEVEMENTS
      • Flipkart GRiD 6.0 — Semi-finalist
      • CodeChef 5 star (peak 2110)
    `,
  },
  {
    id: "lib-fk-05",
    company: "Flipkart",
    role: "Data Analyst",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EXPERIENCE
      Data Analyst — Consumer lending app — 2021 – 2023
      • Built the collections funnel dashboard in Looker used every morning by a 70-person team
      • Found that reminder calls after 7 pm had a 40% lower promise-to-pay rate; shifting them recovered ₹1.1 crore per quarter
      • Automated 9 manual Excel reports with dbt and SQL, freeing about 12 analyst-hours a week
      MIS Executive — Regional retail chain — 2019 – 2021
      • Consolidated daily sales from 34 stores into one Google Sheets model with store-level alerts
      PROJECTS
      Pincode-Level Cash-on-Delivery Risk
      • Scored COD refusal risk for 19,000 pincodes from public census and my own delivery data
      SKILLS
      SQL, dbt, Looker, Python (pandas), Google Sheets, BigQuery
      EDUCATION
      B.Sc, Statistics — [College removed], Tier 3 — 2016 – 2019
      CERTIFICATIONS
      • dbt Fundamentals
      • Google Cloud — BigQuery for Data Analysts
    `,
  },

  // ─── Razorpay ──────────────────────────────────────────────────────────────
  {
    id: "lib-rzp-01",
    company: "Razorpay",
    role: "Backend Engineer",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EXPERIENCE
      Software Engineer II — Payments infrastructure startup — 2022 – 2025
      • Built the UPI collect-request retry scheduler; success rate on first retry went from 21% to 38%
      • Designed a double-entry ledger in PostgreSQL with append-only journal tables; passed an external audit with zero findings
      • Moved webhooks to an outbox pattern; duplicate merchant notifications fell from 0.4% to under 0.01%
      • On-call lead for 8 months; wrote 14 incident postmortems
      Software Engineer — IT services company — 2020 – 2022
      • Maintained a card-tokenisation module for a private bank; RBI tokenisation deadline met with 2 weeks spare
      SKILLS
      Go, Java, PostgreSQL, Kafka, Redis, Kubernetes, gRPC, Prometheus
      PROJECTS
      Open-source ISO 8583 parser in Go
      • 400 GitHub stars; used by two small acquirers for test tooling
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2016 – 2020
    `,
  },
  {
    id: "lib-rzp-02",
    company: "Razorpay",
    role: "SDE-1",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Electrical Engineering — [College removed], Tier 1 — 2020 – 2024
      CGPA 8.1 / 10
      INTERNSHIPS
      Software Engineering Intern — Fintech company — 2023
      • Built a reconciliation job matching 3 million bank statement lines per day to payouts; unmatched rate 0.08%
      • Wrote property-based tests that caught a rounding bug in paise-to-rupee conversion
      Engineering Intern — Early-stage SaaS startup — 2022
      • Shipped GST invoice PDF generation used by 1,100 small businesses in its first month
      PROJECTS
      Split-Bill UPI Links | Node.js, TypeScript, PostgreSQL
      • Generates per-person UPI deep links for a group bill and tracks who has paid via SMS parsing
      • 2,000 bills split by students at my college in one semester
      • Handles partial payments and rounding to the nearest rupee
      SKILLS
      TypeScript, Node.js, Go, PostgreSQL, Redis, AWS Lambda
      ACHIEVEMENTS
      • Winner, college fintech hackathon (sponsor track) — 90 teams
    `,
  },
  {
    id: "lib-rzp-03",
    company: "Razorpay",
    role: "Frontend Engineer",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Frontend engineer, 3 years. Checkout flows, accessibility, and making slow Android phones feel fast.
      EXPERIENCE
      Frontend Engineer — D2C commerce platform — 2021 – 2023
      • Rebuilt checkout in React with server-rendered first paint; conversion on sub-₹12,000 Android phones up 9%
      • Cut JavaScript shipped on checkout from 410 KB to 160 KB
      • Made the payment form screen-reader usable; passed a WCAG 2.1 AA audit
      • Built a design-token system shared across web and the React Native app
      Web Developer — Digital agency — 2020 – 2021
      • Delivered 14 client sites; set up Lighthouse CI so none shipped below 90 performance
      SKILLS
      TypeScript, React, Next.js, React Native, CSS, Playwright, Web Vitals
      CERTIFICATIONS
      • Meta Front-End Developer Professional Certificate
      EDUCATION
      BCA — [College removed], Tier 3 — 2017 – 2020
    `,
  },
  {
    id: "lib-rzp-04",
    company: "Razorpay",
    role: "Data Analyst",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Indore",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.5 / 10
      CERTIFICATIONS
      • Microsoft Power BI Data Analyst Associate (PL-300)
      • Google Data Analytics Professional Certificate
      PROJECTS
      Payment Failure Explorer | SQL, Metabase, Python
      • Simulated 1 million UPI and card transactions with realistic bank downtime windows
      • Dashboard splits failures by bank, hour and error code; one view shows which failures a retry would fix
      Small Merchant Churn Study
      • Interviewed 30 shop owners who stopped using a QR payment app; 18 cited settlement delays
      • Turned the interviews into a coded dataset and a 2-page brief
      • Shared the brief with the app's product team, who replied with questions
      INTERNSHIPS
      Data Intern — NBFC — 2025
      • Wrote SQL to flag 2,400 loan accounts with mismatched EMI dates; ops fixed them before month-end
      SKILLS
      SQL, Python (pandas), Metabase, Power BI, Excel
    `,
  },
  {
    id: "lib-rzp-05",
    company: "Razorpay",
    role: "SDE-2",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 2,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Platform engineer, 6 years. Rate limiting, API gateways, and multi-region failover for payment APIs.
      EXPERIENCE
      Senior Engineer — Global payments company, India office — 2022 – 2025
      • Designed the active-active failover between two regions; regional outage in 2024 caused 0 failed captures
      • Built a per-merchant adaptive rate limiter; blocked a credential-stuffing burst of 40,000 requests per minute without affecting real traffic
      • Led a team of 4 through a gateway rewrite from Nginx+Lua to Envoy
      Software Engineer — Ride-hailing company — 2019 – 2022
      • Owned the driver payout API; moved weekly payouts to daily for 2 lakh drivers
      • Cut payout batch failure rate from 1.8% to 0.2% by pre-validating bank accounts
      SKILLS
      Go, Java, Envoy, Kubernetes, Terraform, PostgreSQL, Cassandra, Kafka
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 1 — 2015 – 2019
      ACHIEVEMENTS
      • Speaker, a national Go conference — "Rate limiting that doesn't hurt good users"
    `,
  },

  // ─── Amazon ────────────────────────────────────────────────────────────────
  {
    id: "lib-amzn-01",
    company: "Amazon",
    role: "SDE-1",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 1 — 2021 – 2025
      CGPA 9.2 / 10
      EXPERIENCE
      SDE Intern — Large e-commerce company — 2024
      • Built a Lambda-based service that detects duplicate seller listings using image hashes; 62,000 duplicates flagged in pilot
      • Precision 94% on a hand-labelled set of 1,500 listings
      • Wrote the design doc and defended it in a review with 3 senior engineers
      PROJECTS
      Warehouse Pick-Path Optimiser | C++, Python
      • Heuristic order batching reduced simulated picker walking distance by 23% on a 400-aisle layout
      Distributed Key-Value Store | Go, Raft
      • Raft replication across 5 nodes; linearisable reads verified with a Porcupine checker
      • Survives leader kill every 30 seconds under 2,000 writes per second
      SKILLS
      Java, C++, Go, Python, AWS (Lambda, DynamoDB, SQS), Docker
      ACHIEVEMENTS
      • Amazon ML Challenge 2024 — Rank 41
      • Codeforces Candidate Master (peak 1985)
    `,
  },
  {
    id: "lib-amzn-02",
    company: "Amazon",
    role: "Business Intelligence Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EXPERIENCE
      Senior Analyst — Food delivery company — 2021 – 2024
      • Built the restaurant prep-time model inputs pipeline in Redshift; ETA error dropped 18% after the model team adopted it
      • Owned 6 weekly business review metrics for 11 cities; wrote the metric definitions doc now used company-wide
      • Found that 14% of cancellations came from 2% of restaurants; ops programme cut cancellations 3.1 points
      Analyst — Consulting firm — 2019 – 2021
      • Built demand forecasts for a cement client across 90 districts; MAPE 9%
      SKILLS
      SQL (Redshift, Presto), Python, Airflow, QuickSight, Tableau, Excel
      EDUCATION
      B.E., Industrial Engineering — [College removed], Tier 2 — 2015 – 2019
      CERTIFICATIONS
      • AWS Certified Data Analytics – Specialty
    `,
  },
  {
    id: "lib-amzn-03",
    company: "Amazon",
    role: "SDE-2",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Chennai",
    pageCount: 2,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Backend engineer, 5 years. Inventory and order systems at scale, strong on data modelling and operational excellence.
      EXPERIENCE
      Software Engineer III — Retail technology company — 2020 – 2023
      • Redesigned inventory reservation to avoid overselling during flash sales; oversell incidents from 1,300 per sale to 11
      • Migrated order history (2.8 billion rows) from MySQL shards to DynamoDB with zero downtime
      • Wrote the team's operational readiness checklist; adopted by 5 sister teams
      • Mentored 2 engineers to promotion
      Software Engineer — Product startup — 2018 – 2020
      • Built the first version of the order service in Java; scaled from 500 to 60,000 orders per day
      PROJECTS
      Chaos Day Tooling
      • Scripted fault injection for 9 dependencies and ran quarterly game days
      SKILLS
      Java, Kotlin, AWS (DynamoDB, SQS, Step Functions), MySQL, Kafka, CloudWatch
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2014 – 2018
    `,
  },
  {
    id: "lib-amzn-04",
    company: "Amazon",
    role: "Cloud Support Associate",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      CERTIFICATIONS
      • AWS Certified Solutions Architect – Associate
      • AWS Certified SysOps Administrator – Associate
      • Red Hat Certified System Administrator (RHCSA)
      EDUCATION
      B.Sc, Computer Science — [College removed], Tier 3 — 2021 – 2024
      Percentage 84%
      PROJECTS
      Home Lab: Three-Tier App on AWS | Terraform, EC2, RDS, ALB
      • Deployed a sample app across 2 availability zones; documented recovery from a killed database instance in 6 minutes
      • Kept the whole lab under ₹600 per month with scheduled shutdowns
      • Wrote 12 blog posts explaining each failure I caused and fixed; 9,000 total reads
      College Network Troubleshooting
      • Volunteer admin for the computer lab's 80 machines; traced a recurring outage to a looped switch port
      SKILLS
      Linux, Networking (TCP/IP, DNS, VPC), AWS, Terraform, Bash, Python
      ACHIEVEMENTS
      • AWS Community Builder (Cloud Operations)
    `,
  },
  {
    id: "lib-amzn-05",
    company: "Amazon",
    role: "SDE-1",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Noida",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Computer Science — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.9 / 10
      INTERNSHIPS
      SDE Intern — Large technology company — 2025
      • Added pagination and caching to an internal returns API; p50 latency from 900 ms to 110 ms
      • Wrote 48 integration tests and a canary that ran every 5 minutes
      PROJECTS
      Metro Crowd Estimator | Python, FastAPI, React
      • Estimates crowding per coach from public ridership data and station entry counts; 1,700 weekly users in Delhi NCR
      • Built a cron pipeline that refreshes predictions every 15 minutes
      Compiler for a Teaching Language | Rust
      • Lexer, parser, type checker and x86-64 codegen; used in a department lab by 60 students
      • Error messages point to the exact column, which the lab TA said halved doubts
      • Added a small optimiser for constant folding and dead-code removal
      • 180 golden tests run on every push
      • Wrote a 20-page guide for students
      SKILLS
      Java, Rust, Python, TypeScript, AWS, PostgreSQL, Redis
      ACHIEVEMENTS
      • Amazon WOW — selected for the SDE internship through the diversity hiring programme
    `,
  },

  // ─── Zoho ──────────────────────────────────────────────────────────────────
  {
    id: "lib-zoho-01",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Chennai",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.E., Computer Science — [College removed], Tier 3 — 2020 – 2024
      CGPA 8.2 / 10
      PROJECTS
      Tamil Handwriting Notes to Text | Java, Android, TensorFlow Lite
      • On-device recognition of 247 Tamil characters; 88% accuracy on 3,000 handwritten samples from classmates
      • Works fully offline on a 3 GB RAM phone
      Railway Reservation Simulator | C++
      • Implements berth allocation, RAC and waitlist promotion exactly as described in the IRCTC rules
      • 90 test scenarios including cancellation chains
      • Built in C++ without the STL to practise data structures by hand
      Chat Server | Java sockets
      • Multi-room chat over raw TCP; handled 500 simulated clients on a laptop
      SKILLS
      Java, C++, C, SQL, Android, Data Structures, Operating Systems
      ACHIEVEMENTS
      • Cleared all 5 Zoho interview rounds including the advanced programming round
    `,
  },
  {
    id: "lib-zoho-02",
    company: "Zoho",
    role: "Software Developer",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Madurai",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      SUMMARY
      Java developer, 3 years, accounting software for small businesses. Moved back from Bengaluru to a Tier-2 city office.
      EXPERIENCE
      Software Engineer — Accounting SaaS company — 2020 – 2023
      • Built e-invoicing integration with the GST portal; 22,000 invoices generated in the first month
      • Rewrote the bank-statement import parser for 17 Indian bank formats; import failures dropped 64%
      • Added optimistic locking to the voucher editor after tracing a lost-update bug reported by 40 customers
      SKILLS
      Java, JavaScript, PostgreSQL, Ember.js, REST, Git
      PROJECTS
      Tally XML to CSV converter
      • Open-source utility for accountants; 1,500 downloads
      EDUCATION
      MCA — [College removed], Tier 2 — 2018 – 2020
      CERTIFICATIONS
      • Oracle Certified Professional, Java SE 11 Developer
    `,
  },
  {
    id: "lib-zoho-03",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2025,
    level: "fresher",
    collegeTier: "Not disclosed",
    city: "Tenkasi",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      Zoho Schools of Learning — Software Development Programme — 2023 – 2025
      Class XII, Tamil Nadu State Board — 2023
      EXPERIENCE
      Trainee Developer — Product company (in-house training programme) — 2024 – 2025
      • Built the attachment preview service for a helpdesk product; supports 26 file types
      • Fixed 60 bugs in a CRM mobile web view during the internship rotation
      • Wrote a load test that found a thread-pool exhaustion issue before release
      PROJECTS
      Village Ration Shop Queue Token | Java, SQLite, SMS gateway
      • Token-by-SMS for a public distribution shop serving 900 families; average wait fell from 2 hours to 25 minutes
      SKILLS
      Java, JavaScript, MySQL, HTML, CSS, Linux, Data Structures
    `,
  },
  {
    id: "lib-zoho-04",
    company: "Zoho",
    role: "QA Engineer",
    year: 2022,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Tiruchirappalli",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      CERTIFICATIONS
      • ISTQB Certified Tester Foundation Level
      EDUCATION
      B.Sc, Mathematics — [College removed], Tier 3 — 2019 – 2022
      Percentage 88%
      PROJECTS
      Bug Bounty Notes
      • Reported 9 valid issues on public bug bounty programmes, including an IDOR in an invoice download link
      • Wrote reproduction steps good enough that 7 were triaged within 48 hours
      Selenium Suite for a College ERP | Java, Selenium, TestNG
      • 140 automated tests for attendance and marks modules; found 23 defects before the semester rollout
      • Parallel runs on 3 browsers finish in 11 minutes
      SKILLS
      Manual testing, Selenium, TestNG, Java, Postman, SQL, Burp Suite basics
      ACHIEVEMENTS
      • Switched from mathematics to QA through self-study; ranked in top 10% of a national testing contest
    `,
  },
  {
    id: "lib-zoho-05",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Coimbatore",
    pageCount: 1,
    verified: true,
    sample: true,
    redactedText: text`
      EDUCATION
      B.Tech, Information Technology — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.6 / 10
      SKILLS
      C, C++, Java, JavaScript, SQL, Linux, Computer Networks
      PROJECTS
      Spreadsheet Engine | Java
      • Formula parser with cell dependency graph and cycle detection; recalculates 50,000 cells in 300 ms
      • Supports 40 functions including VLOOKUP and SUMIF
      • Undo and redo through a command log
      • Saved files as a compact binary format 5x smaller than CSV
      Mini Mail Client | Java, IMAP, JavaFX
      • Reads and threads mail from a real IMAP account; handles 20,000-message folders without freezing
      Memory Allocator | C
      • Implemented malloc and free with segregated free lists; 1.6x faster than a naive first-fit on a benchmark
      INTERNSHIPS
      Development Intern — Product company — 2025
      • Added keyboard shortcuts to a web spreadsheet's filter panel; shipped to all users
      ACHIEVEMENTS
      • CodeChef 4 star
    `,
  },
];
