/**
 * Title and credential cues the open datasets barely contain, because they
 * are mostly US resumes: "B.Ed", "PGT", "GNM", "Tally", "SDE", "Site
 * Engineer". Each cue that appears adds evidence for its domain; a cue in the
 * headline (the first few lines) counts more. Weights are in the same units
 * as the profile scores, and tuned against tests/fixtures/indian-resumes.ts
 * without hurting accuracy on the dataset sample (tests/domains.test.ts).
 */

export type Hint = {
  domain: string;
  pattern: RegExp;
  weight: number;
  /** Words too common elsewhere ("bank", "driver") only count as a job title. */
  headlineOnly?: boolean;
  maxHits?: number;
};

const hint = (domain: string, weight: number, pattern: RegExp, options: Pick<Hint, "headlineOnly" | "maxHits"> = {}): Hint => ({
  domain,
  weight,
  pattern,
  ...options,
});

export const HINTS: Hint[] = [
  // Education
  hint("Teacher", 12, /\b(?:teachers?|teaching|b\.\s?ed|d\.?\s?el\.?\s?ed|c-?tet|h-?tet|reet|pgt|tgt|prt|lesson plans?|ncert)\b/i),
  // "BEd" without dots, but case-sensitive: "300-bed hospital" is not a teaching degree.
  hint("Teacher", 12, /\bB\s?Ed\b/),
  hint("School Principal", 14, /\b(?:principal|vice[- ]principal|headmaster|headmistress)\b/i),
  hint("Language Instructor", 10, /\b(?:language (?:teacher|trainer|instructor)|english trainer|spoken english|ielts trainer|phonics)\b/i),
  // Healthcare
  hint("Nurse Practitioner", 14, /\b(?:nurses?|nursing|gnm|anm|b\.?\s?sc\.? nursing)\b/i),
  hint("Healthcare", 12, /\b(?:pharmacist|b\.?\s?pharm|d\.?\s?pharm|m\.?\s?pharm|mbbs|physiotherap\w*|dmlt|lab technician|medical officer|pharmacy council)\b/i),
  hint("Healthcare Administrator", 8, /\b(?:hospital administration|mha|patient (?:services|relations|registration)|tpa|mrd|opd registration|admission and discharge|medical records|hospital information system)\b/i, { maxHits: 6 }),
  hint("Nutritionist", 12, /\b(?:dietitian|dietician|nutritionist)\b/i),
  hint("Health And Fitness", 10, /\b(?:gym trainer|fitness trainer|personal trainer|yoga (?:instructor|teacher|trainer))\b/i),
  // Finance
  hint("Accountant", 12, /\b(?:accountants?|accounts (?:executive|assistant|officer|manager)|tally(?: prime| erp)?|gstr-?\w*|tds|ca inter(?:mediate)?|articleship|chartered accountant|vouchers?|ledger scrutiny)\b/i),
  hint("Accountant", 4, /\b(?:b\.?\s?com|gst)\b/i),
  hint("Banking", 12, /\b(?:relationship officer|loan officer|casa|finacle|branch banking|bank po)\b/i),
  hint("Banking", 8, /\bbank(?:ing|er)?\b/i, { headlineOnly: true }),
  hint("Financial Analyst", 10, /\b(?:financial analyst|equity research|cfa|financial model(?:l)?ing|valuation)\b/i),
  // Sales & marketing
  hint("Sales", 12, /\b(?:sales (?:executive|officer|representative)|field sales|area sales|beat plan|retail outlets|secondary sales)\b/i),
  hint("Sales", 5, /\b(?:fmcg|distributors?|sales targets?)\b/i),
  hint("Business Development", 10, /\b(?:business development (?:executive|associate|manager)|bde|bda)\b/i),
  hint("Digital Marketing Specialist", 12, /\b(?:digital marketing|seo|sem|google ads|meta ads|performance marketing)\b/i),
  hint("Real Estate Broker", 10, /\b(?:real estate|property (?:consultant|advisor|dealer)|channel partners?)\b/i),
  // Engineering
  hint("Mechanical Engineer", 12, /\b(?:mechanical engineer|design engineer|solidworks|catia|creo|gd&t|sheet metal)\b/i),
  hint("Mechanical Engineer", 5, /\b(?:mechanical|cnc)\b/i),
  hint("Civil Engineer", 14, /\b(?:civil engineer(?:ing)?|staad(?: pro)?|quantity survey\w*|boq|rcc|shuttering)\b/i),
  // Every kind of engineer can be a site engineer; it only leans civil.
  hint("Civil Engineer", 5, /\bsite engineer\b/i),
  hint("Electrical Engineer", 12, /\b(?:electrical (?:site |design |maintenance )?engineer|site engineer \(electrical\)|substations?|switchgear|plc|scada)\b/i),
  hint("Electrical Engineer", 4, /\b(?:commissioning|\d+\s?kv|transformers?|circuit breakers?|earthing|ht\/lt|cable laying|relay testing)\b/i, { maxHits: 6 }),
  hint("Electrical Engineer", 5, /\belectrical engineering\b/i),
  hint("Electrical Engineer", 12, /\belectrician\b/i, { headlineOnly: true }),
  // HR & operations
  hint("Hr", 12, /\b(?:hr (?:executive|generalist|manager|recruiter)|human resources?|recruit(?:er|ment)|talent acquisition|naukri|payroll|esic|induction)\b/i),
  hint("Warehouse", 12, /\b(?:warehouse|pickers?|packers?|wms|forklift|fulfil?ment cent(?:er|re))\b/i),
  hint("Supply Chain Manager", 8, /\b(?:supply chain|logistics|procurement)\b/i),
  hint("Delivery Driver", 12, /\b(?:driving licen[cs]e|delivery (?:executive|boy|partner|associate)|(?:cab|truck|car|delivery) driver)\b/i),
  hint("Delivery Driver", 12, /\bdriver\b/i, { headlineOnly: true }),
  hint("Bpo", 10, /\b(?:bpo|kpo|voice process|non-voice|inbound calls|outbound calls|nesting)\b/i),
  // Service
  hint("Customer Service", 10, /\b(?:customer (?:support|service|care)|call cent(?:er|re)|csat|average handle time)\b/i),
  hint("Customer Service", 6, /\b(?:front (?:office|desk)|guest (?:service|relations|handling)|hospitality|hotel management|check-in|concierge|reservations|opera pms)\b/i, { maxHits: 6 }),
  hint("Chef", 14, /\b(?:chefs?|commis|cook|tandoor|kitchen|mise en place|food production|ihm)\b/i),
  hint("Security Guard", 14, /\b(?:security guard|security officer|watchman|guard duty)\b/i),
  hint("Event Manager", 10, /\b(?:event (?:management|manager|planner|coordinator)|wedding planner)\b/i),
  // Design
  hint("Graphic Designer", 12, /\b(?:graphic design(?:er)?|photoshop|illustrator|coreldraw|indesign|fine arts)\b/i),
  hint("Interior Designer", 12, /\b(?:interior design(?:er)?|false ceiling|modular kitchen|space planning)\b/i),
  hint("Content Writer", 10, /\b(?:content writ\w+|copywrit\w+|blog posts?|ghostwrit\w+)\b/i),
  // Law & agriculture
  hint("Advocate", 16, /\b(?:advocate|ll\.?\s?b|ll\.?\s?m|litigation|bar council|legal (?:drafting|associate|research)|high court)\b/i),
  hint("Agriculture", 14, /\b(?:agricultur\w*|agronom\w*|b\.?\s?sc\.? agri\w*|horticulture|krishi|agri(?:business)? officer)\b/i),
  hint("Agriculture", 12, /\bfarm(?:er|ing)?s?\b/i, { headlineOnly: true }),
  // Software & data (Indian titles the datasets don't use)
  hint("Software Engineer", 8, /\b(?:sde(?:-?\s?[123i]+)?|software (?:engineer|developer)|software engineering|systems engineer|member technical staff|associate software engineer|salesforce developer)\b/i),
  hint("Software Engineer", 8, /\b(?:developer|programmer)\b/i, { headlineOnly: true }),
  // Indian software resumes list their stack far more than their title.
  hint(
    "Software Engineer",
    4,
    /\b(?:java|python|javascript|typescript|c\+\+|react(?:\.js)?|node\.?js|spring boot|django|flask|rest apis?|github|docker|kubernetes|leetcode|hackerrank|codechef|codeforces|data structures|mysql|postgresql|mongodb|html|css|apex|soql|lightning web components|golang|redis|aws lambda)(?![\w+])/i,
    { maxHits: 8 },
  ),
  hint("Data Analyst", 10, /\b(?:data analyst|power bi|tableau|business intelligence)\b/i),
  hint("Data Analyst", 8, /\b(?:analyst|analytics)\b/i, { headlineOnly: true }),
  // …and analysts list theirs.
  hint(
    "Data Analyst",
    4,
    /\b(?:sql|pandas|numpy|statsmodels|scikit-learn|a\/b test(?:ing|s)?|excel|dashboards?|power query|looker|kpis?|cohorts?|funnels?|mape|regression|forecast(?:ing)?)\b/i,
    { maxHits: 8 },
  ),
  hint("Business Analyst", 10, /\bbusiness analyst\b/i),
  hint("Qa Engineer", 8, /\b(?:qa engineer|quality analyst|manual testing|test cases|selenium)\b/i),
  hint("Project Manager", 8, /\b(?:project manager|pmp|scrum master)\b/i),
  hint("Product Manager", 10, /\b(?:product manager|product owner|apm)\b/i),
];

/** Characters treated as the headline: name, title and the first line or two. */
export const HEADLINE_CHARS = 200;
/** A cue in the headline counts this many times over. */
export const HEADLINE_MULTIPLIER = 2;
/** Repeated cues add up, to a point. */
export const MAX_HINT_HITS = 3;

export function hintScores(text: string): Map<string, number> {
  const headline = text.slice(0, HEADLINE_CHARS);
  const scores = new Map<string, number>();
  for (const { domain, pattern, weight, headlineOnly, maxHits = MAX_HINT_HITS } of HINTS) {
    const inHeadline = pattern.test(headline);
    if (headlineOnly && !inHeadline) continue;
    const hits = headlineOnly ? 1 : Math.min(text.match(new RegExp(pattern.source, `${pattern.flags}g`))?.length ?? 0, maxHits);
    if (!hits) continue;
    const bonus = weight * hits + (inHeadline ? weight * HEADLINE_MULTIPLIER : 0);
    scores.set(domain, (scores.get(domain) ?? 0) + bonus);
  }
  return scores;
}
