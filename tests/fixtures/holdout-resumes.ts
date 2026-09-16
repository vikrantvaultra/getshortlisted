import type { Fixture } from "./indian-resumes";

/**
 * Held-out set: written without looking at the domain matcher's rules, so it
 * measures accuracy instead of confirming the tuning.
 */
export const HOLDOUT_RESUMES: Fixture[] = [
  {
    name: "school principal",
    field: "teaching",
    domains: ["School Principal", "Teacher"],
    text: `Dr. Meenakshi Raghavan
Principal
SUMMARY
Educationist with 22 years in CBSE schools, last 7 years heading a K-12 school of 2,400 students and 130 staff.
EXPERIENCE
Principal — Sri Venkateswara Vidyalaya, Chennai — 2018 – Present
• Lead academic and administrative functioning of the school affiliated to CBSE
• Improved Class X board pass percentage from 91% to 99.2% in three sessions
• Implemented NEP 2020 competency-based assessment and school-based CCE
• Handled CBSE affiliation renewal, mandatory disclosures and fee regulation committee
• Conducted monthly PTMs and staff appraisal; ran in-service teacher training workshops
Vice Principal — Kendriya Vidyalaya No. 2, Coimbatore — 2011 – 2018
• Prepared school timetable, supervised board exam centre as Centre Superintendent
• PGT Chemistry for classes XI and XII
EDUCATION
Ph.D. in Education — University of Madras — 2016
M.Sc. Chemistry, B.Ed. — Annamalai University — 2002
CERTIFICATIONS
CBSE Principal Leadership Programme; CTET qualified
SKILLS
School administration, curriculum planning, staff management, MS Office`,
  },
  {
    name: "college lecturer (assistant professor)",
    field: "teaching",
    domains: ["Teacher"],
    text: `Prakash Kumar Yadav
Assistant Professor, Department of Commerce
PROFILE
UGC-NET (JRF) qualified faculty with 6 years of undergraduate and postgraduate teaching experience.
EXPERIENCE
Assistant Professor — Kirori Mal College (University of Delhi), New Delhi — 2020 – Present
• Teaching Financial Accounting, Corporate Law and Business Statistics to B.Com (Hons) students
• Class mentor for 60 students; coordinate internal assessment and attendance
• Convener, Placement Cell — coordinated campus drives with 25 recruiters
Guest Lecturer — Maharaja Agrasen College, New Delhi — 2018 – 2020
• Took lectures for B.Com Programme and conducted tutorials and practicals
EDUCATION
Ph.D. (Commerce), pursuing — Jamia Millia Islamia
M.Com — Delhi School of Economics — 2017
B.Com (Hons) — Shri Ram College of Commerce — 2015
RESEARCH
• 4 papers in UGC-CARE listed journals on GST and MSME finance
• Presented paper at Indian Commerce Association annual conference
SKILLS
Classroom teaching, lesson planning, Moodle, Google Classroom, MS Excel, SPSS`,
  },
  {
    name: "spoken English trainer",
    field: "teaching",
    domains: ["Language Instructor", "Teacher"],
    text: `Sneha Joshi
Spoken English & Soft Skills Trainer
SUMMARY
Communication trainer with 5 years of experience helping students, homemakers and working professionals speak fluent English. Trained 1,500+ learners.
EXPERIENCE
Senior English Trainer — Veta Institute, Pune — 2021 – Present
• Take daily batches for basic, intermediate and advanced spoken English
• Conduct grammar, vocabulary, pronunciation and mock interview sessions
• Prepare learners for IELTS speaking module; average band improved to 6.5
• Mother tongue influence (MTI) neutralisation for Marathi and Hindi speakers
Communication Trainer — Freelance (Online), Pune — 2019 – 2021
• Took one-to-one online classes on Zoom for BPO aspirants and freshers
• Designed worksheets on tenses, public speaking and email etiquette
EDUCATION
M.A. English Literature — Savitribai Phule Pune University — 2019
B.A. — Fergusson College, Pune — 2017
CERTIFICATIONS
CELTA (Cambridge English), TKT Module 1
LANGUAGES
English, Hindi, Marathi`,
  },
  {
    name: "dietitian",
    field: "healthcare",
    domains: ["Nutritionist", "Healthcare", "Health And Fitness"],
    text: `Farzana Sheikh
Clinical Dietitian
PROFILE
Registered Dietitian with 4 years of hospital and OPD experience in diabetes, renal and cardiac diet management.
WORK EXPERIENCE
Clinical Dietitian — Apollo Hospitals, Hyderabad — 2022 – Present
• Do nutritional assessment of IPD patients within 24 hours of admission
• Plan therapeutic diets for ICU, renal and diabetic patients along with the treating doctors
• Counsel OPD patients on weight management, PCOD and gestational diabetes
• Coordinate with kitchen for diet preparation and patient feedback
• Enter diet orders in the hospital HIS (Medics) system
Dietitian Intern — NIMS, Hyderabad — 2021 – 2022
• Assisted in diet planning in the paediatric and oncology wards
EDUCATION
M.Sc. Food Science and Nutrition — Osmania University — 2021
B.Sc. Home Science — St. Francis College for Women — 2019
CERTIFICATIONS
Registered Dietitian (RD), Indian Dietetic Association
Certified Diabetes Educator
SKILLS
Diet counselling, meal planning, calorie calculation, BMI assessment`,
  },
  {
    name: "physiotherapist",
    field: "healthcare",
    domains: ["Healthcare", "Athletic Trainer", "Health And Fitness"],
    text: `Dr. Arjun Malhotra (PT)
Physiotherapist
SUMMARY
Musculoskeletal and sports physiotherapist, 6 years' experience, handled 40+ patients a week in clinic and home visits.
EXPERIENCE
Senior Physiotherapist — Fortis Hospital, Mohali — 2021 – Present
• Assess and treat post-operative knee and hip replacement patients
• Plan rehab protocols for ACL reconstruction and frozen shoulder
• Use IFT, TENS, ultrasound therapy and dry needling
• Train junior physios and BPT interns
Sports Physiotherapist — Punjab Kings academy camp, Chandigarh — 2019 – 2021
• Injury prevention screening, taping and on-field first aid for U-19 cricketers
• Strength and conditioning support during pre-season
EDUCATION
MPT (Sports) — Guru Nanak Dev University, Amritsar — 2019
BPT — Baba Farid University of Health Sciences — 2017
CERTIFICATIONS
Registered with Punjab State Council for Physiotherapy
Certified Dry Needling Practitioner, Kinesio Taping
SKILLS
Manual therapy, electrotherapy, exercise prescription, patient counselling`,
  },
  {
    name: "gym fitness trainer",
    field: "healthcare",
    domains: ["Fitness", "Health And Fitness", "Athletic Trainer"],
    text: `Rohit Chauhan
Certified Personal Trainer
ABOUT ME
Fitness trainer with 5 years in commercial gyms. Helped 200+ clients with fat loss, muscle gain and general fitness.
EXPERIENCE
Personal Trainer — Cult.fit, Bengaluru — 2022 – Present
• Take group workout classes (HRX, strength, boxing) 5 days a week
• Personal training of 15 clients, monthly PT revenue of ₹1.2 lakh
• Prepare workout plans and basic diet charts as per client goal
• Do body composition analysis and track client progress every month
Gym Instructor — Gold's Gym, Indiranagar, Bengaluru — 2020 – 2022
• Floor training, demonstrating correct form on machines and free weights
• Maintained gym hygiene and equipment checklist
EDUCATION
B.P.Ed — Bangalore University — 2020
12th (PUC) — Karnataka State Board — 2016
CERTIFICATIONS
ACE Certified Personal Trainer; K11 Nutrition Certification; CPR & First Aid
SKILLS
Strength training, functional training, weight loss programs, client motivation`,
  },
  {
    name: "hospital front office / healthcare administrator",
    field: "healthcare",
    domains: ["Healthcare Administrator", "Healthcare"],
    text: `Kavitha Nair
Front Office Executive – Hospital
SUMMARY
Hospital front office and patient services professional with 7 years of experience in a 300-bed multi-speciality hospital.
EXPERIENCE
Front Office In-charge — KIMS Health, Thiruvananthapuram — 2020 – Present
• Manage OPD registration, appointment scheduling and patient queue for 18 departments
• Handle admission and discharge desk, bed allocation with nursing station
• Process cashless insurance and TPA pre-authorisations; coordinate with billing
• Supervise a team of 9 front office and patient relations staff
• Resolve patient complaints and maintain NABH documentation for front office
Patient Care Coordinator — Ananthapuri Hospitals, Thiruvananthapuram — 2017 – 2020
• Registration in HIS, MRD file handling, health check-up package counselling
EDUCATION
MHA (Master of Hospital Administration) — Kerala University — 2017
B.Sc. — Mar Ivanios College — 2015
SKILLS
Hospital information system, TPA / insurance, NABH, patient relations, MS Excel`,
  },
  {
    name: "CA articleship trainee",
    field: "finance",
    domains: ["Accountant", "Finance"],
    text: `OBJECTIVE
CA Intermediate (both groups cleared) seeking to complete articleship and build a career in audit and taxation.
EDUCATION
CA Intermediate — ICAI — May 2024 (both groups)
CA Foundation — ICAI — Dec 2022
B.Com — Gujarat University (pursuing, distance)
12th Commerce — GSEB — 2022 — 91%
ARTICLESHIP
Article Assistant — Shah Mehta & Associates, Chartered Accountants, Ahmedabad — 2024 – Present
• Statutory audit of 6 private limited companies with turnover up to ₹80 crore
• Tax audit u/s 44AB and filing of ITR for individuals and firms
• GST monthly returns GSTR-1 and GSTR-3B, GST reconciliation with 2B
• TDS return filing and preparation of Form 26AS reconciliation
• Bank audit (concurrent audit) of Bank of Baroda branch
• Vouching, ledger scrutiny and finalisation of accounts in Tally Prime
SKILLS
Tally Prime, MS Excel (VLOOKUP, pivot), Income Tax portal, GST portal
PERSONAL DETAILS
Name: Harsh Patel
Languages: Gujarati, Hindi, English`,
  },
  {
    name: "investment banking / financial analyst",
    field: "finance",
    domains: ["Financial Analyst", "Finance", "Banking"],
    text: `Aditya Sinha
Investment Banking Analyst
SUMMARY
Analyst with 3 years in mid-market M&A and equity capital markets, worked on deals worth ₹4,500 crore.
EXPERIENCE
Analyst, Investment Banking — Avendus Capital, Mumbai — 2022 – Present
• Built three-statement financial models, DCF and comparable company valuations
• Prepared pitch books, information memorandums and teasers for sell-side mandates
• Supported due diligence and data room management for 4 closed transactions
• Worked on IPO DRHP drafting with merchant bankers and SEBI filings
Financial Analyst Intern — Kotak Mahindra Bank, Mumbai — 2021
• Credit appraisal notes and ratio analysis for SME loan proposals
EDUCATION
MBA (Finance) — IIM Lucknow — 2022
B.Tech (Mechanical) — NIT Trichy — 2019
CERTIFICATIONS
CFA Level II cleared; NISM Series XV Research Analyst
SKILLS
Financial modelling, valuation, Excel, PowerPoint, Capitaline, Bloomberg`,
  },
  {
    name: "insurance advisor",
    field: "sales-marketing",
    domains: ["Sales", "Business Development"],
    text: `Suresh Babu Reddy
Insurance Advisor
PROFILE
IRDAI licensed life and health insurance advisor with 8 years in field sales. MDRT qualifier 2023.
EXPERIENCE
Senior Relationship Manager — HDFC Life, Vijayawada — 2020 – Present
• Sell term, ULIP and pension plans to HNI and salaried customers
• Achieved 135% of annual premium target (₹1.8 crore) in FY 2023-24
• Generate leads through references, cold calling and bank branch activities
• Recruited and trained 12 agents under the agency channel
Insurance Advisor — LIC of India, Guntur — 2016 – 2020
• Built a portfolio of 600+ policyholders; collected renewal premiums on time
• Conducted financial needs analysis and claim settlement support for customers
EDUCATION
B.Com — Acharya Nagarjuna University — 2015
CERTIFICATIONS
IRDAI Life & Health Agent Licence; III Licentiate
SKILLS
Client acquisition, cross-selling, negotiation, relationship building
LANGUAGES
Telugu, English, Hindi`,
  },
  {
    name: "real estate sales",
    field: "sales-marketing",
    domains: ["Real Estate Broker", "Sales"],
    text: `Nikhil Aggarwal
Sales Manager – Real Estate
SUMMARY
Real estate sales professional with 6 years selling residential and commercial property in Gurugram and Noida. Closed 140+ units.
EXPERIENCE
Sales Manager — Square Yards, Gurugram — 2021 – Present
• Sell residential flats in projects of DLF, M3M and Godrej on Dwarka Expressway
• Closed bookings worth ₹95 crore in FY 2023-24
• Handle site visits, price negotiation and home loan tie-ups with banks
• Manage channel partners and brokers; follow up leads from 99acres and MagicBricks
Sales Executive — Omaxe Ltd, Noida — 2018 – 2021
• Walk-in client handling at sales gallery, cold calling and property presentations
• Coordinated with CRM team for agreement and RERA documentation
EDUCATION
MBA (Marketing) — Amity University, Noida — 2018
BBA — MDU Rohtak — 2016
SKILLS
Property sales, lead conversion, negotiation, CRM (Salesforce), client relationship`,
  },
  {
    name: "social media manager",
    field: "sales-marketing",
    domains: ["Social Media Manager", "Digital Marketing Specialist"],
    text: `Tanya Kapoor
Social Media Manager
SUMMARY
Social media professional with 5 years of experience growing D2C and lifestyle brands on Instagram, YouTube and LinkedIn.
EXPERIENCE
Social Media Manager — The Souled Store, Mumbai — 2022 – Present
• Own the monthly content calendar for Instagram (2.4M followers) and YouTube
• Grew Instagram engagement rate from 1.8% to 4.1% with reels and meme marketing
• Manage influencer collaborations with 80+ creators, budget of ₹15 lakh per month
• Run Meta ads with the performance team; ROAS 3.2x on festive campaigns
• Weekly reporting on reach, impressions and community growth
Social Media Executive — Social Beat, Bengaluru — 2020 – 2022
• Handled pages of 6 clients; wrote captions, briefed designers, community management
EDUCATION
PG Diploma in Digital Marketing — MICA, Ahmedabad — 2020
B.A. Mass Media — St. Xavier's College, Mumbai — 2019
TOOLS
Meta Business Suite, Hootsuite, Canva, Google Analytics, Sprout Social`,
  },
  {
    name: "content writer",
    field: "design",
    domains: ["Content Writer", "Digital Media"],
    text: `Ananya Bhattacharya
Content Writer
SUMMARY
Content writer with 4 years of experience writing SEO blogs, website copy and newsletters for edtech and fintech brands.
EXPERIENCE
Senior Content Writer — Groww, Bengaluru — 2022 – Present
• Write 12–15 long-form articles a month on mutual funds, SIP and personal finance
• Articles ranked on page 1 of Google for 60+ keywords
• Edit and proofread copies from freelance writers; maintain style guide
• Write push notifications, app copy and email newsletters
Content Writer — BYJU'S, Bengaluru — 2020 – 2022
• Wrote blog posts and exam preparation guides for UPSC and CAT aspirants
• Scripted short videos for YouTube channel
EDUCATION
M.A. English — Jadavpur University, Kolkata — 2020
B.A. English (Hons) — Presidency University — 2018
SKILLS
SEO writing, copywriting, editing, WordPress, Grammarly, Google Search Console, SEMrush
PORTFOLIO
Available on request`,
  },
  {
    name: "UI/UX designer",
    field: "design",
    domains: ["Ui/Ux Designer", "Ui Designer", "Ux Designer", "Designer"],
    text: `Varun Menon
Product Designer (UI/UX)
SUMMARY
UI/UX designer with 4 years designing mobile apps and dashboards for fintech and healthtech products. B.Com graduate who moved to design.
EXPERIENCE
UI/UX Designer — Razorpay, Bengaluru — 2022 – Present
• Designed onboarding flow for merchant dashboard, reduced drop-off by 18%
• Conducted user interviews, usability testing and created user personas
• Built and maintained the design system components in Figma
• Worked with product managers and frontend developers during handoff
Junior UI Designer — Practo, Bengaluru — 2020 – 2022
• Created wireframes, high-fidelity mockups and prototypes for the doctor app
• Designed icons, illustrations and marketing banners
EDUCATION
UX Design Certification — Google (Coursera) — 2020
B.Com — Christ University, Bengaluru — 2019
SKILLS
Figma, Adobe XD, Photoshop, Illustrator, wireframing, prototyping, user research, information architecture
PORTFOLIO
Behance and Dribbble links available`,
  },
  {
    name: "interior designer",
    field: "design",
    domains: ["Interior Designer", "Designer"],
    text: `Riya Deshpande
Interior Designer
SUMMARY
Interior designer with 5 years of experience in residential and office interiors. Completed 45+ projects in Mumbai and Thane.
EXPERIENCE
Interior Designer — Livspace, Mumbai — 2021 – Present
• Design 2BHK and 3BHK homes with budgets from ₹6 lakh to ₹35 lakh
• Prepare 2D layouts in AutoCAD and 3D renders in SketchUp with V-Ray
• Select materials, laminates, lighting and furniture with clients
• Coordinate with carpenters, site supervisors and vendors for timely handover
Junior Interior Designer — Studio Kaavya Design, Thane — 2019 – 2021
• Modular kitchen and wardrobe design, working drawings and BOQ preparation
• Site measurements and client presentations
EDUCATION
B.Des (Interior Design) — Rachana Sansad, Mumbai — 2019
12th — Maharashtra State Board — 2015
SOFTWARE
AutoCAD, SketchUp, V-Ray, 3ds Max, Photoshop, MS Excel
SKILLS
Space planning, colour schemes, furniture layout, false ceiling design`,
  },
  {
    name: "electrical site engineer (substation)",
    field: "engineering",
    domains: ["Electrical Engineer", "Electrical Engineering", "Engineering"],
    text: `Manoj Kumar Mishra
Electrical Site Engineer
SUMMARY
B.Tech Electrical with 7 years of experience in erection, testing and commissioning of 33/11 kV and 132 kV substations.
EXPERIENCE
Site Engineer (Electrical) — Kalpataru Projects International Ltd, Lucknow — 2020 – Present
• Execution of 132/33 kV substation for UPPTCL under RDSS scheme
• Supervised erection of power transformers, CTs, PTs, isolators and circuit breakers
• Cable laying, earthing and control panel wiring as per approved drawings
• Pre-commissioning tests: IR test, CT/PT ratio test, relay testing
• Managed 40 labourers and subcontractors; daily progress reports to project manager
Junior Engineer — Shyam Indus Power Solutions, Patna — 2017 – 2020
• 33/11 kV substation and HT/LT line work under DDUGJY
• Measurement book, billing and material reconciliation
EDUCATION
B.Tech (Electrical Engineering) — MMMUT, Gorakhpur — 2017
Diploma (Electrical) — Government Polytechnic, Varanasi — 2014
SKILLS
Substation erection, testing & commissioning, AutoCAD, safety (HIRA), MS Project`,
  },
  {
    name: "automobile service engineer",
    field: "engineering",
    domains: ["Automobile", "Mechanical Engineer", "Engineering"],
    text: `Sandeep Gill
Service Engineer – Automobile
SUMMARY
Diploma in Automobile Engineering with 6 years in dealership workshops of Maruti Suzuki and Tata Motors.
EXPERIENCE
Service Advisor / Service Engineer — Tata Motors dealership (Autovikas), Ludhiana — 2021 – Present
• Handle 25–30 vehicles a day for periodic maintenance and running repairs
• Diagnose engine, transmission and electrical faults using scan tools
• Prepare job cards and estimates in DMS; explain repairs to customers
• Process warranty claims with Tata Motors and ensure CSI score above 90%
• Guide technicians on EV (Nexon EV) battery and motor checks
Workshop Technician — Maruti Suzuki Arena (Sidhu Motors), Jalandhar — 2018 – 2021
• Engine overhauling, clutch and brake work, wheel alignment
EDUCATION
Diploma in Automobile Engineering — Government Polytechnic, Ludhiana — 2018
10th — PSEB — 2015
CERTIFICATIONS
Maruti Suzuki MASS Level 2; Tata Motors EV Technician training
SKILLS
Vehicle diagnostics, preventive maintenance, customer handling`,
  },
  {
    name: "quality engineer in manufacturing",
    field: "engineering",
    domains: ["Engineering", "Mechanical Engineer", "Automobile"],
    text: `Karthik Subramaniam
Quality Engineer
SUMMARY
Mechanical engineer with 5 years in quality assurance at automotive component plants supplying to Hyundai and Ashok Leyland.
EXPERIENCE
Quality Engineer — Sundram Fasteners Ltd, Hosur — 2021 – Present
• In-process and final inspection of fasteners and powertrain components
• Prepare PPAP documents, control plans and PFMEA for new parts
• Customer complaint analysis using 8D, why-why and fishbone diagrams
• Reduced customer PPM from 450 to 120 in one year
• Calibration of instruments — vernier, micrometer, bore gauge, CMM
• Internal auditor for IATF 16949 and ISO 9001
Graduate Engineer Trainee (QA) — Lucas TVS, Chennai — 2019 – 2021
• Incoming material inspection and supplier quality follow up
EDUCATION
B.E. Mechanical Engineering — PSG College of Technology, Coimbatore — 2019
CERTIFICATIONS
Six Sigma Green Belt; IATF 16949 Internal Auditor
SKILLS
SPC, MSA, APQP, Kaizen, 5S, Poka-yoke, MS Excel, Minitab`,
  },
  {
    name: "production supervisor in a plant",
    field: "engineering",
    domains: ["Engineering", "Mechanical Engineer"],
    text: `Ramesh Pawar
Production Supervisor
PROFILE
Production supervisor with 9 years of shop floor experience in machining and assembly lines.
EXPERIENCE
Production Supervisor — Kirloskar Oil Engines Ltd, Pune — 2019 – Present
• Supervise a shift of 45 operators on CNC machining and engine assembly line
• Achieve daily production target of 180 engines with OEE above 82%
• Prepare shift plan, manpower allocation and daily production report in SAP PP
• Coordinate with maintenance for breakdowns and with quality for rejections
• Implement 5S, TPM and Kaizen; 14 kaizens implemented in 2023
• Conduct toolbox talks and ensure PPE use on the shop floor
Line Incharge — Bharat Forge Ltd, Chakan — 2015 – 2019
• Forging line operations, loading of dies, cycle time monitoring
EDUCATION
Diploma in Mechanical Engineering — MSBTE (Government Polytechnic, Pune) — 2015
B.E. Mechanical (part-time) — Savitribai Phule Pune University — 2021
SKILLS
Production planning, manpower handling, lean manufacturing, SAP PP, safety`,
  },
  {
    name: "HR generalist / payroll",
    field: "hr-operations",
    domains: ["Hr", "Hr Specialist", "Human Resources Specialist"],
    text: `Pooja Srivastava
HR Generalist
SUMMARY
HR professional with 5 years in end-to-end recruitment, payroll, statutory compliance and employee engagement for a 700-employee company.
EXPERIENCE
HR Executive (Generalist) — Genpact, Noida — 2021 – Present
• Process monthly payroll for 700 employees on greytHR
• PF, ESIC, PT and LWF compliance; monthly challans and returns
• Handle onboarding, induction, background verification and exit formalities, full and final settlement
• Maintain attendance, leave records and HR MIS in Excel
• Organise employee engagement activities and POSH awareness sessions
HR Recruiter — TeamLease Services, Lucknow — 2019 – 2021
• Sourced candidates through Naukri and LinkedIn; closed 25 positions a month
• Scheduled interviews and released offer letters
EDUCATION
MBA (HR) — Lucknow University — 2019
B.Com — Isabella Thoburn College — 2017
SKILLS
Payroll, statutory compliance, recruitment, HRMS (greytHR, Keka), Advanced Excel
KNOWLEDGE
Labour laws — PF Act, ESI Act, Payment of Gratuity Act, Shops & Establishment Act`,
  },
  {
    name: "operations executive in logistics",
    field: "hr-operations",
    domains: ["Operations Manager", "Supply Chain Manager", "Warehouse"],
    text: `Imran Qureshi
Operations Executive – Logistics
SUMMARY
Logistics operations professional with 6 years in hub operations, first mile and line haul for e-commerce shipments.
EXPERIENCE
Senior Operations Executive — Delhivery, Bhiwandi (Mumbai) — 2021 – Present
• Manage inbound and outbound operations at a hub handling 60,000 shipments a day
• Plan line haul vehicles and track TAT; maintained 97% on-time dispatch
• Supervise 120 loaders, sorters and team leads across 2 shifts
• Handle RTO, shortage and damage cases; daily MIS to cluster manager
• Coordinate with vendors for vehicle placement and manpower billing
Operations Executive — Blue Dart Express, Nagpur — 2018 – 2021
• Inventory handling, dispatch planning and POD management
EDUCATION
PGDM in Logistics & Supply Chain Management — ITM Business School, Navi Mumbai — 2018
B.Sc. — RTM Nagpur University — 2016
SKILLS
Hub operations, WMS, dispatch planning, vendor management, Advanced Excel, SAP MM (basic)`,
  },
  {
    name: "delivery associate",
    field: "hr-operations",
    domains: ["Delivery Driver"],
    text: `Deepak Kumar
Delivery Associate
OBJECTIVE
Hardworking delivery boy with 3 years of experience looking for delivery job in Bengaluru with good incentives.
WORK EXPERIENCE
Delivery Associate — Amazon (through DSP partner), Bengaluru — 2023 – Present
• Deliver 120–150 parcels daily in Whitefield and Marathahalli area
• Collect COD cash and deposit same day; zero cash shortage
• Use delivery app for route, OTP and proof of delivery
• Handle returns pickup and customer calls politely
Delivery Partner — Swiggy, Bengaluru — 2021 – 2023
• Food delivery on my own bike; 4.8 rating
• Completed 25+ orders daily during peak hours
EDUCATION
12th — Bihar School Examination Board — 2020
DOCUMENTS
Driving licence (two wheeler), Aadhaar card, own bike with RC
SKILLS
Two wheeler driving, route knowledge, Google Maps, cash handling
LANGUAGES
Hindi, basic Kannada, basic English`,
  },
  {
    name: "security guard / supervisor",
    field: "service",
    domains: ["Security Guard"],
    text: `Balwinder Singh
Security Supervisor
PROFILE
Ex-serviceman (Indian Army, 17 years) now working as security supervisor in corporate and residential sites.
EXPERIENCE
Security Supervisor — SIS Security (Security and Intelligence Services), Gurugram — 2019 – Present
• Supervise 28 security guards at a corporate IT park in 3 shifts
• Prepare duty roster, conduct daily briefing and surprise night checks
• Access control, visitor management and vehicle checking at gates
• Monitor CCTV and fire alarm panel; conduct fire mock drills
• Maintain incident register, key register and material in/out register
Havildar — Indian Army (Sikh Light Infantry) — 2002 – 2019
• Section commander, weapon handling, guard duties
EDUCATION
10th — PSEB — 2001
Army Class I Certificate
TRAINING
PSARA security training certificate; basic fire fighting and first aid
SKILLS
Guarding, patrolling, crowd control, CCTV monitoring, team handling`,
  },
  {
    name: "event coordinator",
    field: "service",
    domains: ["Event Manager"],
    text: `Shruti Iyer
Event Coordinator
SUMMARY
Event coordinator with 4 years in weddings, corporate offsites and brand activations. Handled 90+ events with budgets up to ₹1.5 crore.
EXPERIENCE
Event Coordinator — Wizcraft International Entertainment, Mumbai — 2022 – Present
• Plan and execute corporate conferences, dealer meets and product launches
• Coordinate venues, AV, stage fabrication, decor and artist management
• Prepare event budgets, run sheets and vendor contracts
• On-ground management of 1,000+ guest events including registrations and hospitality
Wedding Planner — Shaadi Squad, Goa — 2020 – 2022
• Destination weddings: guest logistics, hotel blocks, mehendi and sangeet functions
• Liaised with caterers, photographers and decorators
EDUCATION
PG Diploma in Event Management — NAEMD, Mumbai — 2020
BMS — Mithibai College — 2019
SKILLS
Event planning, vendor management, budgeting, client servicing, MS Excel, Canva`,
  },
  {
    name: "hotel front office executive",
    field: "service",
    domains: ["Customer Service"],
    text: `Aman Thakur
Front Office Associate
SUMMARY
Hotel management graduate with 3 years at front desk in 5-star hotels. Good in guest handling and upselling rooms.
EXPERIENCE
Guest Service Associate — Taj Mahal Palace, Mumbai — 2023 – Present
• Check-in and check-out of guests, handle 150+ arrivals a day
• Resolve guest complaints and requests, coordinate with housekeeping
• Upsell room upgrades; earned ₹3.4 lakh upselling revenue in 2024
• Handle cash, credit card settlements and night audit on Opera PMS
Front Office Trainee — The Oberoi, Shimla — 2022 – 2023
• Reservations, telephone operations and concierge
EDUCATION
B.Sc. Hospitality & Hotel Administration — IHM Kufri (NCHMCT) — 2022
12th — HPBOSE — 2019
SKILLS
Opera PMS, IDS, guest relations, reservations, cashiering, MS Office
LANGUAGES
English, Hindi, basic French`,
  },
  {
    name: "BPO non-voice process associate",
    field: "hr-operations",
    domains: ["Bpo", "Customer Service"],
    text: `OBJECTIVE
To work in a reputed BPO in non-voice process where I can use my typing speed and accuracy.
EDUCATION
B.A. — Rajasthan University, Jaipur — 2022
12th — RBSE — 2019 — 72%
10th — RBSE — 2017 — 78%
WORK EXPERIENCE
Process Associate (Non-Voice) — Teleperformance, Jaipur — 2022 – Present
• Email and chat support for an international e-commerce client
• Handle 70–80 tickets per day with 96% quality score
• Refund and order status queries as per SOP within TAT
• Back office data entry and order verification
• Awarded "Star of the Month" twice
SKILLS
Typing speed 45 WPM, MS Excel, MS Word, Zendesk, Freshdesk
STRENGTHS
Punctual, ready for rotational shifts and night shifts
PERSONAL DETAILS
Name: Neha Sharma
Location: Jaipur, Rajasthan
Languages: Hindi, English`,
  },
  {
    name: "agriculture field officer",
    field: "other",
    domains: ["Agriculture"],
    text: `Vishal Patil
Agriculture Field Officer
SUMMARY
B.Sc. Agriculture graduate with 5 years of field experience in crop advisory, farmer meetings and agri input sales in Marathwada.
EXPERIENCE
Field Officer — Mahindra Agri Solutions, Latur — 2021 – Present
• Visit 20+ villages every month, give crop advisory on soybean, tur and cotton
• Conduct farmer meetings, field demonstrations and soil testing camps
• Promote seeds, fertilisers and crop protection products through dealers
• Register farmers in FPO and help with PM-KISAN and crop insurance (PMFBY) documents
• Monitor pest and disease incidence and report to agronomist
Agriculture Assistant (contract) — Krishi Vigyan Kendra, Osmanabad — 2019 – 2021
• Assisted in front line demonstrations and drip irrigation trainings
EDUCATION
B.Sc. (Agriculture) — Vasantrao Naik Marathwada Krishi Vidyapeeth, Parbhani — 2019
12th Science — Maharashtra State Board — 2015
SKILLS
Crop management, soil health, IPM, farmer training, MS Excel
LANGUAGES
Marathi, Hindi, English`,
  },
  {
    name: "DevOps engineer",
    field: "cloud-security",
    domains: [
      "Devops Engineer",
      "Cloud Engineer",
      "Cloud Operations Architect (Devops)",
      "Site Reliability Engineer",
      "Platform Engineer",
    ],
    text: `Siddharth Rao
DevOps Engineer
SUMMARY
DevOps engineer with 5 years of experience automating build, release and infrastructure on AWS for high traffic applications.
EXPERIENCE
DevOps Engineer — Swiggy, Bengaluru — 2022 – Present
• Manage 40+ EKS clusters running microservices with Helm and Argo CD
• Wrote Terraform modules for VPC, RDS and IAM; cut provisioning time from 2 days to 1 hour
• Built CI/CD pipelines in Jenkins and GitHub Actions for 120 services
• Set up monitoring with Prometheus, Grafana and alerting on PagerDuty
• Reduced AWS bill by ₹18 lakh per month through rightsizing and spot instances
Associate DevOps Engineer — Infosys, Mysuru — 2020 – 2022
• Linux server administration, shell scripting and Ansible playbooks
• Dockerised legacy Java applications for a banking client
EDUCATION
B.E. Computer Science — RV College of Engineering, Bengaluru — 2020
CERTIFICATIONS
AWS Certified Solutions Architect – Associate; Certified Kubernetes Administrator (CKA)
SKILLS
AWS, Kubernetes, Docker, Terraform, Ansible, Jenkins, Git, Python, Bash, Linux`,
  },
  {
    name: "cybersecurity analyst",
    field: "cloud-security",
    domains: [
      "Cybersecurity Analyst",
      "Security Analyst",
      "Information Security Analyst",
      "Cybersecurity Specialist",
    ],
    text: `Priyanka Dutta
Cyber Security Analyst
SUMMARY
SOC analyst with 4 years of experience in security monitoring, incident response and vulnerability management for BFSI clients.
EXPERIENCE
Security Analyst (SOC L2) — Wipro, Kolkata — 2022 – Present
• Monitor and triage alerts in Splunk SIEM for 3 banking clients, 24x7 SOC
• Investigate phishing, malware and brute force incidents; prepare RCA reports
• Run vulnerability scans with Nessus and track remediation with app teams
• Tune correlation rules and reduce false positives by 35%
• Support RBI cyber security framework and ISO 27001 audits
SOC Analyst L1 — Tata Consultancy Services, Kolkata — 2020 – 2022
• Log analysis, EDR (CrowdStrike) alert handling and ticketing in ServiceNow
EDUCATION
B.Tech (IT) — Heritage Institute of Technology, Kolkata — 2020
CERTIFICATIONS
CEH (EC-Council); CompTIA Security+; ISO 27001 Lead Auditor
SKILLS
SIEM, incident response, threat hunting, Wireshark, Nmap, Burp Suite, MITRE ATT&CK, firewall log analysis`,
  },
  {
    name: "data scientist (ML)",
    field: "data",
    domains: ["Data Scientist", "Data Science", "Machine Learning Engineer"],
    text: `Rahul Venkatesan
Data Scientist
SUMMARY
Data scientist with 4 years of experience building machine learning models for credit risk and customer churn in fintech.
EXPERIENCE
Data Scientist — PhonePe, Bengaluru — 2022 – Present
• Built XGBoost credit scoring model for BNPL; reduced default rate by 1.4%
• Developed churn prediction model and uplift modelling for cashback campaigns
• Feature engineering on 50 crore+ transaction records using PySpark
• Deployed models as APIs with MLflow and Docker; monitor data drift
• Present insights to business teams through Tableau dashboards
Associate Data Scientist — Fractal Analytics, Mumbai — 2020 – 2022
• Demand forecasting with time series (ARIMA, Prophet) for an FMCG client
• NLP-based text classification of customer reviews using BERT
EDUCATION
M.Tech (Data Science) — IIT Madras — 2020
B.Sc. Statistics — Loyola College, Chennai — 2018
SKILLS
Python, SQL, pandas, scikit-learn, TensorFlow, PyTorch, statistics, A/B testing, AWS SageMaker`,
  },
];
