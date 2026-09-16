/**
 * Every job domain in the open datasets (147 of them), grouped into broad
 * fields for browsing. A scanned resume is matched to one domain (see
 * src/lib/server/domains.ts) so Compare and the Library show resumes from the
 * same line of work instead of a wall of software CVs.
 *
 * Safe to import from client components.
 */

export const FIELDS = [
  { id: "software", label: "Software & IT" },
  { id: "data", label: "Data & AI" },
  { id: "cloud-security", label: "Cloud, Infra & Security" },
  { id: "design", label: "Design & Creative" },
  { id: "management", label: "Product & Project Management" },
  { id: "teaching", label: "Education" },
  { id: "healthcare", label: "Healthcare & Fitness" },
  { id: "finance", label: "Finance & Banking" },
  { id: "sales-marketing", label: "Sales & Marketing" },
  { id: "engineering", label: "Engineering & Manufacturing" },
  { id: "hr-operations", label: "HR, Operations & Logistics" },
  { id: "service", label: "Hospitality & Service" },
  { id: "other", label: "Law, Agriculture & more" },
] as const;

export type FieldId = (typeof FIELDS)[number]["id"];

/** Dataset domain label → field. Every domain the import produces must be listed; the library build fails otherwise. */
export const DOMAIN_FIELDS: Record<string, FieldId> = {
  // Software & IT
  "Android Developer": "software",
  "Angular Developer": "software",
  "Ar/Vr Developer": "software",
  "Automation Testing": "software",
  "Backend Developer": "software",
  Blockchain: "software",
  "Blockchain Developer": "software",
  "Dotnet Developer": "software",
  "Embedded Systems Engineer": "software",
  "Flutter Developer": "software",
  "Frontend Developer": "software",
  "Full Stack Developer": "software",
  "Game Developer": "software",
  "Information Technology": "software",
  "Ios Developer": "software",
  "Java Developer": "software",
  "Javascript Developer": "software",
  "Jr. Java Developer": "software",
  "Mobile App Developer": "software",
  "Mobile Developer": "software",
  "Node.Js Developer": "software",
  "Python Developer": "software",
  "Python Restful Api Developer": "software",
  "Qa Engineer": "software",
  "React Developer": "software",
  "React Native Developer": "software",
  "Sap Developer": "software",
  "Sap Technical Architect": "software",
  "Senior Software Developer": "software",
  "Software Developer": "software",
  "Software Development": "software",
  "Software Engineer": "software",
  "Software Testing & Automation Engineer": "software",
  "Solutions Architect": "software",
  "Systems Engineer": "software",
  "Technical Architect": "software",
  Testing: "software",
  "Ui Engineer": "software",
  "Vue Developer": "software",
  "Web Developer": "software",
  // Data & AI
  "Adjunct Faculty & Data Scientist": "data",
  "Ai Engineer": "data",
  "Ai Researcher": "data",
  "Business Analyst": "data",
  "Computer Vision Engineer": "data",
  "Data Analyst": "data",
  "Data Architect": "data",
  "Data Engineer": "data",
  "Data Science": "data",
  "Data Scientist": "data",
  Database: "data",
  "Database Administrator": "data",
  "Database Engineer": "data",
  "Deep Learning Engineer": "data",
  "Etl Developer": "data",
  Hadoop: "data",
  "Machine Learning Engineer": "data",
  "Machine Learning Engineer Intern": "data",
  "Mlops Engineer": "data",
  "Nlp Engineer": "data",
  "Nosql Developer": "data",
  "Senior Business Analyst Rpa": "data",
  "Sql Developer": "data",
  // Cloud, Infra & Security
  "Cloud Architect": "cloud-security",
  "Cloud Engineer": "cloud-security",
  "Cloud Operations Architect (Devops)": "cloud-security",
  "Cybersecurity Analyst": "cloud-security",
  "Cybersecurity Engineer": "cloud-security",
  "Cybersecurity Specialist": "cloud-security",
  "Devops Engineer": "cloud-security",
  "Information Security Analyst": "cloud-security",
  "Infrastructure Engineer": "cloud-security",
  "It Support Specialist": "cloud-security",
  "Kubernetes Engineer": "cloud-security",
  "Network Administrator": "cloud-security",
  "Network Engineer": "cloud-security",
  "Network Security Engineer": "cloud-security",
  "Penetration Tester": "cloud-security",
  "Platform Engineer": "cloud-security",
  "Security Analyst": "cloud-security",
  "Security Engineer": "cloud-security",
  "Site Reliability Engineer": "cloud-security",
  "System Administrator": "cloud-security",
  "Systems Administrator": "cloud-security",
  // Design & Creative
  Apparel: "design",
  Arts: "design",
  "Content Writer": "design",
  Designer: "design",
  "Digital Media": "design",
  "Graphic Designer": "design",
  "Interior Designer": "design",
  "Ui Designer": "design",
  "Ui/Ux Designer": "design",
  "Ux Designer": "design",
  "Web Designing": "design",
  // Product & Project Management
  Consultant: "management",
  Pmo: "management",
  "Product Manager": "management",
  "Project Manager": "management",
  // Education
  "Language Instructor": "teaching",
  "School Principal": "teaching",
  Teacher: "teaching",
  // Healthcare & Fitness
  "Athletic Trainer": "healthcare",
  Fitness: "healthcare",
  "Health And Fitness": "healthcare",
  Healthcare: "healthcare",
  "Healthcare Administrator": "healthcare",
  "Nurse Practitioner": "healthcare",
  Nutritionist: "healthcare",
  // Finance & Banking
  Accountant: "finance",
  Banking: "finance",
  Finance: "finance",
  "Financial Analyst": "finance",
  // Sales & Marketing
  "Business Development": "sales-marketing",
  "Digital Marketing Specialist": "sales-marketing",
  "E Commerce Specialist": "sales-marketing",
  "Public Relations": "sales-marketing",
  "Real Estate Broker": "sales-marketing",
  Sales: "sales-marketing",
  "Sales Manager": "sales-marketing",
  "Social Media Manager": "sales-marketing",
  // Engineering & Manufacturing
  "Automation Engineer": "engineering",
  Automobile: "engineering",
  Aviation: "engineering",
  "Civil Engineer": "engineering",
  Construction: "engineering",
  "Electrical Engineer": "engineering",
  "Electrical Engineering": "engineering",
  Engineering: "engineering",
  "Mechanical Engineer": "engineering",
  "Robotics Engineer": "engineering",
  // HR, Operations & Logistics
  Bpo: "hr-operations",
  "Delivery Driver": "hr-operations",
  Hr: "hr-operations",
  "Hr Specialist": "hr-operations",
  "Human Resources Specialist": "hr-operations",
  "Operations Manager": "hr-operations",
  "Supply Chain Manager": "hr-operations",
  Warehouse: "hr-operations",
  "Warehouse Associate": "hr-operations",
  // Hospitality & Service
  Chef: "service",
  "Customer Service": "service",
  "Event Manager": "service",
  "Fastfood Manager": "service",
  "Security Guard": "service",
  // Law, Agriculture & more
  Advocate: "other",
  Agriculture: "other",
};

/** How a domain reads on screen. The datasets title-case everything ("Hr", "Ui/Ux Designer"). */
const DISPLAY_FIXES: Record<string, string> = {
  Hr: "HR",
  "Hr Specialist": "HR Specialist",
  "Ai Engineer": "AI Engineer",
  "Ai Researcher": "AI Researcher",
  "Ar/Vr Developer": "AR/VR Developer",
  Bpo: "BPO",
  "Etl Developer": "ETL Developer",
  "Ios Developer": "iOS Developer",
  "It Support Specialist": "IT Support Specialist",
  "Mlops Engineer": "MLOps Engineer",
  "Nlp Engineer": "NLP Engineer",
  "Node.Js Developer": "Node.js Developer",
  "Nosql Developer": "NoSQL Developer",
  Pmo: "PMO",
  "Python Restful Api Developer": "Python REST API Developer",
  "Qa Engineer": "QA Engineer",
  "Sap Developer": "SAP Developer",
  "Sap Technical Architect": "SAP Technical Architect",
  "Senior Business Analyst Rpa": "Senior Business Analyst (RPA)",
  "Sql Developer": "SQL Developer",
  "Ui Designer": "UI Designer",
  "Ui Engineer": "UI Engineer",
  "Ui/Ux Designer": "UI/UX Designer",
  "Ux Designer": "UX Designer",
  "E Commerce Specialist": "E-commerce Specialist",
  "Dotnet Developer": ".NET Developer",
  "Fastfood Manager": "Fast Food Manager",
  "Devops Engineer": "DevOps Engineer",
  "Cloud Operations Architect (Devops)": "Cloud Operations Architect (DevOps)",
  "Javascript Developer": "JavaScript Developer",
  "Jr. Java Developer": "Junior Java Developer",
};

export function domainLabel(domain: string): string {
  return DISPLAY_FIXES[domain] ?? domain;
}

export function domainSlug(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isFieldId(value: unknown): value is FieldId {
  return FIELDS.some((field) => field.id === value);
}

export function fieldLabel(id: FieldId): string {
  return FIELDS.find((field) => field.id === id)!.label;
}

/** Compare's "work it out from my resume" choice. */
export const AUTO_DOMAIN = "auto";

/** Remembers the domain from the last scan (or the last one picked), so every page after it stays on topic. */
export const DOMAIN_COOKIE = "gs_domain";

/** Client-side: remember the domain for 30 days. It's a job category, not resume content. */
export function rememberDomain(slug: string) {
  document.cookie = `${DOMAIN_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
}

/** A domain as the client sees it. */
export type DomainOption = {
  slug: string;
  label: string;
  field: FieldId;
  /** Resumes of this domain in the open datasets, real and AI-generated — what Compare's typical range is counted over. */
  total: number;
  /** Readable resumes on this domain's own shelf. */
  readable: number;
  /** Label of the closest domain whose resumes fill this shelf, when it's short. */
  borrowedFrom: string | null;
};
