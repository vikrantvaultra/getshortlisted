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
    domain: "Software Engineer",
    company: "TCS",
    role: "Systems Engineer",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Nagpur",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "TCS",
    role: "Digital Systems Engineer",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Bhubaneswar",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "TCS",
    role: "Assistant Systems Engineer",
    year: 2023,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Lucknow",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "TCS",
    role: "IT Analyst",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Chennai",
    pageCount: 2,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Business Analyst",
    company: "TCS",
    role: "Business Analyst",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Kolkata",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Infosys",
    role: "Systems Engineer",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Mysuru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Infosys",
    role: "Specialist Programmer",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Infosys",
    role: "Technology Analyst",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Pune",
    pageCount: 2,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Infosys",
    role: "Digital Specialist Engineer",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Coimbatore",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Infosys",
    role: "Systems Engineer",
    year: 2022,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Visakhapatnam",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Flipkart",
    role: "SDE-1",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Business Analyst",
    company: "Flipkart",
    role: "Business Analyst",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Flipkart",
    role: "SDE-2",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 2,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Flipkart",
    role: "SDE-1",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Jaipur",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Data Analyst",
    company: "Flipkart",
    role: "Data Analyst",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Backend Developer",
    company: "Razorpay",
    role: "Backend Engineer",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Razorpay",
    role: "SDE-1",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Frontend Developer",
    company: "Razorpay",
    role: "Frontend Engineer",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Data Analyst",
    company: "Razorpay",
    role: "Data Analyst",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Indore",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Razorpay",
    role: "SDE-2",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 1",
    city: "Bengaluru",
    pageCount: 2,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Amazon",
    role: "SDE-1",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 1",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Data Analyst",
    company: "Amazon",
    role: "Business Intelligence Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Amazon",
    role: "SDE-2",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Chennai",
    pageCount: 2,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Cloud Engineer",
    company: "Amazon",
    role: "Cloud Support Associate",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Amazon",
    role: "SDE-1",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Noida",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2024,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Chennai",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Zoho",
    role: "Software Developer",
    year: 2023,
    level: "experienced",
    collegeTier: "Tier 2",
    city: "Madurai",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2025,
    level: "fresher",
    collegeTier: "Not disclosed",
    city: "Tenkasi",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Qa Engineer",
    company: "Zoho",
    role: "QA Engineer",
    year: 2022,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Tiruchirappalli",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
    domain: "Software Engineer",
    company: "Zoho",
    role: "Member Technical Staff",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Coimbatore",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
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
  // ─── Civil engineering ─────────────────────────────────────────────────────
  {
    id: "lib-civil-01",
    domain: "Civil Engineer",
    company: "L&T Construction",
    role: "Graduate Engineer Trainee — Civil",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Chennai",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      EDUCATION
      B.E., Civil Engineering — [College removed], Tier 2 — 2021 – 2025
      CGPA 8.2 / 10
      Class XII, Tamil Nadu State Board — 91%
      INTERNSHIPS
      Site Intern — Metro rail viaduct package, Chennai — 2024
      • Checked reinforcement of 14 pier caps against bar bending schedules before each pour
      • Recorded cube test results for 60 concrete batches; flagged 2 batches below M40 target strength
      • Updated the daily progress report and labour count for the section engineer
      Summer Trainee — PWD Building Division — 2023
      • Took measurements for the running account bill of a two-storey school block
      PROJECTS
      Design of a G+4 Residential Building | STAAD Pro, AutoCAD
      • Modelled frames for dead, live and seismic load (Zone III) as per IS 1893 and IS 456
      • Designed slabs, beams and isolated footings; reduced steel quantity 7% by revising beam sizes
      • Prepared structural drawings and a bar bending schedule for 42 members
      Strength of Concrete with 20% Fly Ash Replacement
      • Cast and tested 54 cubes; 28-day strength fell only 4% while cement use dropped by a fifth
      SKILLS
      AutoCAD, STAAD Pro, Revit (basics), MS Project, Excel, quantity estimation
      CERTIFICATIONS
      • NPTEL Design of Reinforced Concrete Structures — Elite
      ACHIEVEMENTS
      • Captain, college concrete canoe team; finished 3rd of 26 at a national civil fest
    `,
  },
  {
    id: "lib-civil-02",
    domain: "Civil Engineer",
    company: "Tata Projects",
    role: "Site Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Site engineer with 4 years on high-rise residential and industrial sheds. Comfortable owning a floor cycle from shuttering to de-shuttering.
      EXPERIENCE
      Site Engineer — Residential contractor, Hyderabad — 2021 – Present
      • Execute RCC work for two G+18 towers with 120 workers across three subcontractors
      • Brought the typical floor cycle from 12 days to 9 by sequencing shuttering and MEP sleeves in parallel
      • Check reinforcement, cover blocks and shuttering alignment before every slab pour; zero rework on 26 slabs
      • Reconcile cement and steel monthly; cut steel wastage from 3.1% to 1.8%
      • Prepare BOQ quantities and sub-contractor bills for the project manager
      Junior Engineer — Industrial shed builder, Medak — 2020 – 2021
      • Supervised PEB foundations and grade slab for a 40,000 sq ft warehouse
      • Maintained site safety register; the site went 210 days without a lost-time incident
      EDUCATION
      B.Tech, Civil Engineering — [College removed], Tier 3 — 2016 – 2020
      SKILLS
      Site execution, RCC, formwork, BBS, quantity surveying, AutoCAD, MS Project, Excel
      CERTIFICATIONS
      • IOSH Managing Safely
    `,
  },
  {
    id: "lib-civil-03",
    domain: "Civil Engineer",
    company: "Afcons Infrastructure",
    role: "Planning Engineer",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 1",
    city: "Mumbai",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Planning engineer on bridge and tunnel packages. I turn site progress into schedules the client can trust.
      EXPERIENCE
      Planning Engineer — Infrastructure EPC contractor, Mumbai — 2022 – Present
      • Own the Primavera P6 schedule for a 2.1 km elevated corridor with 1,400 activities
      • Built a weekly look-ahead that cut idle crane hours by 18% across 3 launching gantries
      • Prepared delay analysis that supported a 4-month extension of time without liquidated damages
      • Track cash flow against the baseline; monthly billing variance kept under 3%
      Quantity Surveyor — Same company — 2020 – 2022
      • Measured and certified 22 running bills worth 180 crore rupees
      • Reconciled BOQ against drawings and caught 6 crore rupees of missed variation items
      EDUCATION
      M.Tech, Construction Management — [College removed], Tier 1 — 2018 – 2020
      B.E., Civil Engineering — [College removed], Tier 2 — 2014 – 2018
      SKILLS
      Primavera P6, MS Project, quantity surveying, contract administration, earned value, Excel, Power BI
      CERTIFICATIONS
      • PMP — Project Management Institute
    `,
  },
  {
    id: "lib-civil-04",
    domain: "Civil Engineer",
    company: "Shapoorji Pallonji",
    role: "Graduate Engineer Trainee — Civil",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Pune",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      OBJECTIVE
      Civil engineering graduate looking for a site role on building projects, where I can learn execution from the ground up.
      EDUCATION
      B.E., Civil Engineering — [College removed], Tier 3 — 2022 – 2026
      CGPA 7.9 / 10
      Diploma in Civil Engineering — Government Polytechnic — 2019 – 2022
      INTERNSHIPS
      Site Trainee — Township developer, Pune — 2025
      • Supervised brickwork and plastering on 3 floors; checked line, level and plumb every morning
      • Measured work done for the contractor's bill and matched it with the site engineer's records
      • Maintained the material inward register for cement, sand and aggregate
      PROJECTS
      Rainwater Harvesting Design for the College Campus
      • Estimated 1.8 million litres a year of harvestable runoff and designed 4 recharge pits
      • Costed the plan at 6.2 lakh rupees; the college approved the first pit
      Road Estimate for a Village Link Road | Excel
      • Prepared a detailed estimate for 1.2 km of WBM road using the state schedule of rates
      SKILLS
      AutoCAD, estimation and costing, levelling, total station (basic), MS Excel
      ACHIEVEMENTS
      • Diploma topper in the district, 88%
      • NSS volunteer; led a 40-student team building soak pits in two villages
    `,
  },
  {
    id: "lib-civil-05",
    domain: "Civil Engineer",
    company: "NCC Limited",
    role: "Structural Design Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 1",
    city: "Hyderabad",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Structural design engineer, 3 years, RCC and steel buildings. Designs checked to IS 456, IS 800 and IS 1893.
      EXPERIENCE
      Structural Design Engineer — Design consultancy, Hyderabad — 2021 – Present
      • Designed 11 buildings from G+3 to G+22, including two hospitals with post-tensioned slabs
      • Optimised a raft foundation on black cotton soil, saving 140 tonnes of steel
      • Built an Excel tool for column design that cut checking time per building from 2 days to 3 hours
      • Reviewed shop drawings and answered 300+ site queries within 48 hours
      Design Intern — Same consultancy — 2020 – 2021
      • Modelled a 6-storey steel parking structure in STAAD Pro and prepared connection details
      EDUCATION
      M.Tech, Structural Engineering — [College removed], Tier 1 — 2019 – 2021
      B.Tech, Civil Engineering — [College removed], Tier 2 — 2015 – 2019
      GATE Civil — AIR 842
      SKILLS
      ETABS, SAFE, STAAD Pro, AutoCAD, Revit Structure, IS codes, Excel VBA
      PUBLICATIONS
      • Seismic response of RC frames with infill walls — national conference on structural engineering
    `,
  },
  {
    id: "lib-civil-06",
    domain: "Civil Engineer",
    company: "Godrej Properties",
    role: "Quality Engineer — Civil",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      EDUCATION
      B.Tech, Civil Engineering — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.5 / 10
      INTERNSHIPS
      Quality Control Intern — Residential developer, Bengaluru — 2025
      • Ran slump, cube and sieve tests for 3 towers; logged 240 results in the quality register
      • Wrote 18 non-conformance reports for honeycombing and cover issues and tracked each to closure
      • Prepared checklists for waterproofing and tiling that the site team now uses on every flat
      PROJECTS
      Self-Compacting Concrete with Recycled Aggregate
      • Replaced 30% of coarse aggregate with crushed demolition waste; met M30 strength with a superplasticiser
      Crack Mapping with a Phone Camera | Python, OpenCV
      • Measured crack width from photos within 0.1 mm on 50 test images
      SKILLS
      Concrete testing, quality checklists, AutoCAD, Excel, Python (basics)
      CERTIFICATIONS
      • NPTEL Concrete Technology — Elite + Silver
      ACHIEVEMENTS
      • Best project award, civil department, 2026
    `,
  },

  // ─── Mechanical engineering ────────────────────────────────────────────────
  {
    id: "lib-mech-01",
    domain: "Mechanical Engineer",
    company: "Tata Motors",
    role: "Graduate Engineer Trainee — Mechanical",
    year: 2025,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Pune",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      EDUCATION
      B.E., Mechanical Engineering — [College removed], Tier 2 — 2021 – 2025
      CGPA 8.4 / 10
      INTERNSHIPS
      Manufacturing Intern — Commercial vehicle plant, Pune — 2024
      • Studied cycle time on the axle assembly line and removed 2 non-value steps, saving 38 seconds per axle
      • Built a poka-yoke fixture sketch for a bolt-torque miss that caused 11 rework cases a month
      • Ran a 5S drive in the tool crib; search time for gauges dropped from 6 minutes to under 1
      PROJECTS
      Design of an Electric Go-Kart Chassis | SolidWorks, ANSYS
      • Designed a tubular chassis and ran static and modal analysis; weight 34 kg with a safety factor of 2.1
      • Team finished 5th of 48 at a national go-kart championship
      Heat Transfer Enhancement with Dimpled Tubes
      • Tested 3 dimple patterns; best one raised Nusselt number 22% for a 9% pressure-drop penalty
      SKILLS
      SolidWorks, CATIA V5 (basics), ANSYS Workbench, AutoCAD, GD&T, MS Excel
      CERTIFICATIONS
      • Lean Six Sigma Yellow Belt
      ACHIEVEMENTS
      • SAE collegiate club treasurer; managed a 9 lakh rupee budget
    `,
  },
  {
    id: "lib-mech-02",
    domain: "Mechanical Engineer",
    company: "Mahindra & Mahindra",
    role: "Design Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 1",
    city: "Chennai",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Design engineer, 4 years in automotive body and chassis parts, from concept CAD to PPAP.
      EXPERIENCE
      Design Engineer — Automotive R&D centre, Chennai — 2021 – Present
      • Own 26 sheet metal and plastic parts for an SUV tailgate module in CATIA V5
      • Cut tailgate mass by 1.9 kg by moving two brackets from steel to glass-filled nylon
      • Ran DFMEA with suppliers and closed 41 action items before tool kick-off
      • Released 180 drawings with full GD&T; zero drawing-related tooling changes at trial
      Graduate Engineer — Tier 1 supplier, Chennai — 2020 – 2021
      • Designed seat-track brackets and supported crash-test correlation in LS-DYNA
      EDUCATION
      B.Tech, Mechanical Engineering — [College removed], Tier 1 — 2016 – 2020
      SKILLS
      CATIA V5, NX, Teamcenter, GD&T (ASME Y14.5), DFMEA, tolerance stack-up, LS-DYNA (basics)
      CERTIFICATIONS
      • GD&T Professional — ASME
    `,
  },
  {
    id: "lib-mech-03",
    domain: "Mechanical Engineer",
    company: "Maruti Suzuki",
    role: "Production Engineer",
    year: 2025,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Gurugram",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Production engineer with 5 years on press and weld shops. I run shifts, fix bottlenecks and hold the line on quality.
      EXPERIENCE
      Production Engineer — Passenger car plant, Manesar — 2020 – Present
      • Run a weld shop shift of 64 operators and 38 robots producing 900 bodies a day
      • Raised line OEE from 78% to 86% by attacking the top 5 breakdown causes with the maintenance team
      • Brought spot-weld defects from 420 to 95 PPM through a Kaizen on electrode tip dressing
      • Trained 30 new operators on standard work and safety; zero reportable accidents in 2 years
      Junior Engineer — Auto components supplier, Gurugram — 2019 – 2020
      • Handled a 250-tonne press line and cut die changeover time from 45 to 18 minutes with SMED
      EDUCATION
      B.Tech, Mechanical Engineering — [College removed], Tier 3 — 2015 – 2019
      Diploma in Mechanical Engineering — 2012 – 2015
      SKILLS
      Production planning, OEE, TPM, Kaizen, SMED, 5S, root cause analysis, SAP PP
      CERTIFICATIONS
      • Six Sigma Green Belt
    `,
  },
  {
    id: "lib-mech-04",
    domain: "Mechanical Engineer",
    company: "Bosch India",
    role: "Quality Engineer",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 2",
    city: "Bengaluru",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      EDUCATION
      B.E., Mechanical Engineering — [College removed], Tier 2 — 2022 – 2026
      CGPA 8.7 / 10
      INTERNSHIPS
      Quality Intern — Fuel system components plant, Bengaluru — 2025
      • Ran a gauge R&R study on 4 bore gauges; replaced one with 31% variation
      • Built control charts for a honing process and spotted a drift two days before parts went out of tolerance
      • Supported 8D analysis for a customer complaint on burrs; the fix cut rejects from 1.2% to 0.3%
      PROJECTS
      Vision-Based Inspection of Gear Teeth | Python, OpenCV
      • Detected missing and chipped teeth on 300 gears with 97% accuracy using a phone camera rig
      Design of a Low-Cost Hydraulic Press
      • Designed and built a 5-tonne press for the college workshop for 38,000 rupees
      SKILLS
      SPC, MSA, 8D, 7 QC tools, CMM (basics), AutoCAD, SolidWorks, Minitab, Python
      ACHIEVEMENTS
      • Winner, college Kaizen competition — 34 teams
    `,
  },
  {
    id: "lib-mech-05",
    domain: "Mechanical Engineer",
    company: "Ashok Leyland",
    role: "Maintenance Engineer",
    year: 2024,
    level: "experienced",
    collegeTier: "Tier 3",
    city: "Hosur",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      SUMMARY
      Maintenance engineer, 6 years on CNC machining lines and utilities. Preventive first, breakdown second.
      EXPERIENCE
      Maintenance Engineer — Engine machining plant, Hosur — 2019 – Present
      • Maintain 42 CNC machines and 6 transfer lines running three shifts
      • Cut breakdown hours by 37% in a year by moving 18 machines to condition-based maintenance
      • Raised MTBF on the crankshaft line from 96 to 170 hours after spindle vibration monitoring
      • Kept spares inventory at 42 lakh rupees, down from 60, without a single stock-out stoppage
      Maintenance Technician — Foundry, Coimbatore — 2017 – 2019
      • Serviced hydraulics and pneumatics on 3 moulding machines
      EDUCATION
      B.E., Mechanical Engineering (part-time) — [College removed], Tier 3 — 2015 – 2019
      Diploma in Mechanical Engineering — 2012 – 2015
      SKILLS
      CNC maintenance (Fanuc, Siemens), hydraulics, pneumatics, TPM, vibration analysis, PLC basics, SAP PM
      CERTIFICATIONS
      • Certified Maintenance and Reliability Technician
    `,
  },
  {
    id: "lib-mech-06",
    domain: "Mechanical Engineer",
    company: "Bharat Forge",
    role: "Graduate Engineer Trainee — Mechanical",
    year: 2026,
    level: "fresher",
    collegeTier: "Tier 3",
    city: "Kolhapur",
    pageCount: 1,
    verified: true,
    sample: true,
    origin: "model",
    redactedText: text`
      OBJECTIVE
      Mechanical engineering graduate who wants to work on a forging or machining shop floor and grow into process engineering.
      EDUCATION
      B.E., Mechanical Engineering — [College removed], Tier 3 — 2022 – 2026
      CGPA 7.8 / 10
      Class XII, Maharashtra State Board — 84%
      INTERNSHIPS
      Shop Floor Trainee — Forging unit, Kolhapur — 2025
      • Recorded die temperatures on a 1,600-tonne press for 4 weeks and linked cold dies to underfill defects
      • Helped set up a die pre-heating checklist; underfill rejects fell from 2.4% to 1.1% that month
      • Measured 500 forgings with vernier and height gauge and entered data for SPC
      PROJECTS
      Solar-Powered Grain Dryer
      • Built a dryer that cut drying time for 50 kg of soybean from 3 days to 11 hours; used by 2 farmers in the village
      CNC Programming of a Flange | Fanuc G-code
      • Wrote and simulated the program; machined the part within 0.05 mm on the college lathe
      SKILLS
      AutoCAD, SolidWorks, CNC programming (G and M codes), metrology, MS Excel, Marathi, Hindi, English
      ACHIEVEMENTS
      • 2nd prize, state-level project exhibition
    `,
  },
];
