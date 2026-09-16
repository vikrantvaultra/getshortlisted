import type { FieldId } from "../../src/lib/fields";

/**
 * Short, realistic Indian resumes across fields — the kind people actually
 * upload. Written for tests; no real person. Each lists the field it must be
 * matched to and the domains that count as a correct match.
 */
export type Fixture = { name: string; field: FieldId; domains: string[]; text: string };

export const INDIAN_RESUMES: Fixture[] = [
  {
    name: "school teacher (TGT science)",
    field: "teaching",
    domains: ["Teacher"],
    text: `Priya Sharma
TGT Science Teacher
EDUCATION
B.Ed — Maharshi Dayanand University — 2019
B.Sc (Physics, Chemistry, Biology) — 2017
CTET Paper II qualified — 2020
EXPERIENCE
TGT Science — Kendriya Vidyalaya, Rohtak — 2020 – Present
• Teach science to classes 6 to 10, 180 students across five sections
• Prepared lesson plans and worksheets aligned with the NCERT syllabus
• Raised class 10 board exam science average from 68% to 79% in two years
• Ran remedial classes for 25 students who scored below 40% in unit tests
• Organised the school science exhibition and coached students for the NSO olympiad
SKILLS
Classroom management, smart class tools, lesson planning, assessment design, parent-teacher meetings`,
  },
  {
    name: "primary teacher fresher",
    field: "teaching",
    domains: ["Teacher", "Language Instructor"],
    text: `Anjali Verma
Primary Teacher (PRT)
OBJECTIVE
Dedicated D.El.Ed graduate seeking a PRT position in a CBSE school.
EDUCATION
D.El.Ed — SCERT Lucknow — 2023
B.A. English — 2021
HTET Level 1 qualified
INTERNSHIP
School internship — Government Primary School — 2022
• Taught English and EVS to classes 3 and 4 for 16 weeks
• Used flash cards and activity-based learning to teach reading to 30 pupils
• Maintained attendance registers and assessment records for the class teacher
SKILLS
Storytelling, phonics, classroom activities, MS Word, handwriting practice`,
  },
  {
    name: "staff nurse",
    field: "healthcare",
    domains: ["Nurse Practitioner", "Healthcare"],
    text: `Reena Thomas
Staff Nurse
PROFESSIONAL SUMMARY
Registered GNM staff nurse with 4 years of ICU and ward experience, registered with the Kerala Nursing Council.
EXPERIENCE
Staff Nurse — Apollo Hospitals, Chennai — 2021 – Present
• Care for 8 to 10 patients per shift in a 30-bed medical ICU
• Monitor vital signs, administer medications and maintain infusion charts
• Assist doctors during central line insertion and emergency intubation
• Follow infection control and NABH documentation protocols
Staff Nurse — District Hospital, Kottayam — 2019 – 2021
• Worked in the general ward and OPD, handling 60 patients a day
EDUCATION
GNM — School of Nursing, Kottayam — 2019
CERTIFICATIONS
BLS and ACLS — American Heart Association`,
  },
  {
    name: "accountant",
    field: "finance",
    domains: ["Accountant", "Finance", "Financial Analyst", "Banking"],
    text: `Rahul Gupta
Accounts Executive
SUMMARY
B.Com graduate with 3 years of experience in accounting, GST returns and TDS compliance using Tally Prime.
EXPERIENCE
Accounts Executive — Sharma Traders Pvt Ltd, Jaipur — 2022 – Present
• Record purchase, sales and journal vouchers in Tally Prime for 400+ invoices a month
• File GSTR-1 and GSTR-3B returns and reconcile input tax credit with GSTR-2B
• Prepare monthly bank reconciliation statements and ledger scrutiny
• Deduct and deposit TDS, file quarterly returns and issue Form 16A
Accounts Assistant — CA firm (articleship support) — 2021 – 2022
• Assisted in statutory audit of 6 clients and preparation of balance sheets
EDUCATION
B.Com — University of Rajasthan — 2021
CA Intermediate — Group 1 cleared
SKILLS
Tally Prime, MS Excel, GST, TDS, accounts payable, accounts receivable`,
  },
  {
    name: "bank relationship officer",
    field: "finance",
    domains: ["Banking", "Finance", "Financial Analyst", "Accountant"],
    text: `Sandeep Kumar
Relationship Officer — Retail Banking
EXPERIENCE
Relationship Officer — HDFC Bank, Pune — 2022 – Present
• Manage a portfolio of 350 savings and current account customers
• Sourced 120 new CASA accounts and 45 personal loans in FY 2023-24
• Complete KYC verification and cross-sell insurance and mutual funds
• Achieved 112% of the quarterly target for liabilities
Sales Officer — Bajaj Finance — 2020 – 2022
• Processed consumer durable loans at dealer counters with 98% documentation accuracy
EDUCATION
MBA Finance — Savitribai Phule Pune University — 2020
SKILLS
Banking operations, loan processing, customer relationship, KYC, Finacle`,
  },
  {
    name: "field sales executive",
    field: "sales-marketing",
    domains: ["Sales", "Sales Manager", "Business Development", "E Commerce Specialist", "Real Estate Broker"],
    text: `Vikas Yadav
Sales Executive
SUMMARY
Field sales executive with 3 years of FMCG distribution experience across Lucknow territory.
EXPERIENCE
Sales Executive — Dabur India (via distributor) — 2021 – Present
• Cover 60 retail outlets a day on a fixed beat plan across two territories
• Grew monthly secondary sales from 8 lakh to 13 lakh rupees in 18 months
• Onboarded 90 new retailers and 4 sub-distributors
• Ran in-store promotions and tracked competitor schemes for the area sales manager
EDUCATION
BBA — Lucknow University — 2021
SKILLS
Field sales, distributor management, retail visibility, target achievement, negotiation, Hindi and English`,
  },
  {
    name: "digital marketing",
    field: "sales-marketing",
    domains: ["Digital Marketing Specialist", "Social Media Manager", "E Commerce Specialist"],
    text: `Neha Kapoor
Digital Marketing Executive
EXPERIENCE
Digital Marketing Executive — D2C skincare brand, Gurugram — 2022 – Present
• Manage Google Ads and Meta Ads campaigns with a monthly budget of 6 lakh rupees
• Cut cost per acquisition by 28% by restructuring campaigns and audiences
• Grew organic traffic 2.4x through SEO: keyword research, on-page fixes and 40 blog posts
• Run Instagram content calendar; followers grew from 18k to 61k
EDUCATION
BBA Marketing — Amity University — 2022
CERTIFICATIONS
Google Ads Search Certification, HubSpot Content Marketing
SKILLS
SEO, SEM, Google Analytics 4, Meta Business Suite, Canva, email marketing`,
  },
  {
    name: "mechanical design engineer",
    field: "engineering",
    domains: ["Mechanical Engineer", "Engineering", "Automobile", "Automation Engineer", "Robotics Engineer"],
    text: `Arjun Patil
Design Engineer — Mechanical
EDUCATION
B.E. Mechanical Engineering — Pune University — 2022
EXPERIENCE
Graduate Engineer Trainee — Auto components manufacturer, Chakan — 2022 – Present
• Designed 14 sheet metal fixtures in SolidWorks and CATIA for the welding line
• Reduced rejection rate on the machining line from 3.2% to 1.1% with a GD&T review
• Prepared 2D drawings and BOMs for CNC machining vendors
• Led a Kaizen that cut changeover time on press line 2 by 22 minutes
PROJECTS
Design and analysis of a two-wheeler brake disc
• Ran thermal analysis in ANSYS and cut disc weight by 9%
SKILLS
AutoCAD, SolidWorks, CATIA, ANSYS, GD&T, 5S, Six Sigma Yellow Belt`,
  },
  {
    name: "civil site engineer",
    field: "engineering",
    domains: ["Civil Engineer", "Construction", "Engineering"],
    text: `Mohammed Irfan
Site Engineer — Civil
EXPERIENCE
Site Engineer — L&T Construction subcontractor, Hyderabad — 2021 – Present
• Supervise RCC work for a G+14 residential tower with 80 workers on site
• Check reinforcement, shuttering and concrete pour quality before each slab
• Prepare BOQ, quantity estimates and daily progress reports for the project manager
• Reconciled cement and steel consumption, saving 4% material cost
EDUCATION
B.Tech Civil Engineering — JNTU Hyderabad — 2021
SKILLS
AutoCAD, STAAD Pro, quantity surveying, estimation, site execution, MS Project`,
  },
  {
    name: "hr recruiter",
    field: "hr-operations",
    domains: ["Hr", "Hr Specialist", "Human Resources Specialist"],
    text: `Pooja Singh
HR Executive — Talent Acquisition
EXPERIENCE
HR Executive — IT services company, Noida — 2022 – Present
• Handle end-to-end recruitment for 25 open positions a quarter
• Source candidates on Naukri, LinkedIn and employee referrals; screen 300 profiles a month
• Schedule interviews, roll out offers and manage onboarding and induction
• Maintain HRMS records, attendance and leave data for 400 employees
• Support payroll inputs, PF and ESIC compliance
EDUCATION
MBA Human Resources — IMS Ghaziabad — 2022
SKILLS
Recruitment, onboarding, employee engagement, HR policies, MS Excel`,
  },
  {
    name: "java backend developer",
    field: "software",
    domains: ["Java Developer", "Jr. Java Developer", "Backend Developer", "Software Developer", "Software Engineer", "Senior Software Developer", "Python Developer", "Web Developer", "Full Stack Developer", "Information Technology"],
    text: `Karthik Reddy
Software Engineer
EXPERIENCE
Software Engineer — Product startup, Bengaluru — 2022 – Present
• Built REST APIs in Java and Spring Boot for an order management service handling 2 lakh requests a day
• Moved reporting queries to read replicas, cutting p95 latency from 900 ms to 180 ms
• Wrote unit tests with JUnit and Mockito, raising coverage from 45% to 78%
• Deployed services on AWS with Docker and GitHub Actions
EDUCATION
B.Tech Computer Science — VIT Vellore — 2022
PROJECTS
Campus food ordering app — React, Node.js, MongoDB
• Used by 1,200 students in the first semester
SKILLS
Java, Spring Boot, MySQL, Redis, Docker, AWS, Git, data structures and algorithms`,
  },
  {
    name: "data analyst fresher",
    field: "data",
    domains: ["Data Analyst", "Business Analyst", "Data Scientist", "Data Science", "Data Engineer", "Sql Developer"],
    text: `Sneha Iyer
Data Analyst
EDUCATION
B.Sc Statistics — Madras Christian College — 2024
PROJECTS
Zomato restaurant ratings dashboard — Power BI, SQL
• Cleaned 9,500 restaurant records and built a dashboard of ratings by city and cuisine
• Found that delivery time explained more rating variance than price
Sales forecasting for a retail chain — Python, pandas, statsmodels
• Forecast weekly sales for 45 stores with 8% error using regression and seasonality features
INTERNSHIP
Data Analyst Intern — Fintech company — 2023
• Wrote SQL queries to track loan funnel conversion and built weekly KPI reports in Excel
SKILLS
SQL, Python, pandas, Power BI, Tableau, Excel, statistics`,
  },
  {
    name: "chef",
    field: "service",
    domains: ["Chef", "Fastfood Manager"],
    text: `Ramesh Negi
Commis Chef
EXPERIENCE
Commis I — Taj Hotel, Mumbai — 2021 – Present
• Prepare continental and Indian dishes for a 120-cover all-day dining restaurant
• Maintain mise en place, food cost records and HACCP hygiene standards in the kitchen
• Trained 3 new commis on knife skills and plating
Commis II — Cloud kitchen, Mumbai — 2019 – 2021
• Cooked 250 orders a day across tandoor and curry sections
EDUCATION
Diploma in Food Production — IHM Mumbai — 2019
SKILLS
Menu planning, kitchen management, food safety, inventory, tandoor, bakery basics`,
  },
  {
    name: "customer support bpo",
    field: "service",
    domains: ["Customer Service", "Bpo"],
    text: `Ankit Mishra
Customer Support Associate
EXPERIENCE
Customer Support Associate — International voice process, Gurugram — 2022 – Present
• Handle 80 inbound calls a day for a US telecom client
• Maintain 92% CSAT and average handle time under 6 minutes
• Resolve billing and service issues and escalate tickets through the CRM
• Mentored 5 new joiners during nesting
EDUCATION
B.A. — Delhi University — 2021
SKILLS
Customer service, communication, CRM, complaint resolution, typing 45 wpm, English and Hindi`,
  },
  {
    name: "advocate",
    field: "other",
    domains: ["Advocate"],
    text: `Aditi Deshmukh
Advocate
EXPERIENCE
Associate Advocate — Law chambers, Bombay High Court — 2021 – Present
• Draft plaints, written statements, bail applications and legal notices
• Appear before the civil court and consumer forum in 40+ matters
• Conduct legal research on contract and property disputes using SCC Online
• Handle client meetings and case documentation
EDUCATION
LL.B — Government Law College, Mumbai — 2021
Enrolled with the Bar Council of Maharashtra and Goa
SKILLS
Litigation, legal drafting, legal research, civil procedure, arbitration`,
  },
  {
    name: "graphic designer",
    field: "design",
    domains: ["Graphic Designer", "Designer", "Ui Designer", "Ux Designer", "Ui/Ux Designer", "Digital Media", "Web Designing", "Content Writer", "Arts"],
    text: `Rohan Das
Graphic Designer
EXPERIENCE
Graphic Designer — Advertising agency, Kolkata — 2022 – Present
• Design social media creatives, print ads and packaging for 12 brands
• Created brand identity and logo for 5 new clients
• Deliver 60 creatives a month in Adobe Photoshop, Illustrator and CorelDRAW
EDUCATION
Bachelor of Fine Arts (Applied Arts) — Rabindra Bharati University — 2022
SKILLS
Adobe Photoshop, Illustrator, InDesign, CorelDRAW, Figma, typography, branding`,
  },
  {
    name: "pharmacist",
    field: "healthcare",
    domains: ["Healthcare", "Nurse Practitioner", "Healthcare Administrator", "Nutritionist"],
    text: `Faizan Ahmed
Pharmacist
EXPERIENCE
Pharmacist — Apollo Pharmacy, Bhopal — 2022 – Present
• Dispense prescriptions for 150 patients a day and counsel on dosage and side effects
• Maintain drug inventory, expiry tracking and schedule H register
• Check prescriptions for drug interactions and coordinate with doctors
EDUCATION
B.Pharm — RGPV Bhopal — 2022
Registered Pharmacist — Madhya Pradesh State Pharmacy Council
SKILLS
Dispensing, patient counselling, pharmacology, inventory management, medical terminology`,
  },
  {
    name: "warehouse supervisor",
    field: "hr-operations",
    domains: ["Warehouse", "Warehouse Associate", "Supply Chain Manager", "Operations Manager", "Delivery Driver"],
    text: `Suresh Pal
Warehouse Supervisor
EXPERIENCE
Warehouse Supervisor — E-commerce fulfilment centre, Bhiwandi — 2020 – Present
• Supervise 35 pickers and packers across two shifts
• Dispatch 6,000 shipments a day with 99.2% order accuracy
• Run cycle counts and inventory reconciliation in the WMS
• Coordinate inbound trucks and vendor returns with the logistics team
EDUCATION
B.Com — Mumbai University — 2019
SKILLS
Warehouse operations, inventory control, forklift safety, WMS, team handling, MS Excel`,
  },
];
