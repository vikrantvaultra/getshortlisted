import { analyseDocument } from "@/lib/scoring/analyse";
import { scoreDocument } from "@/lib/scoring/score";
import { domainOptions } from "@/lib/server/library";
import { indexStats, lookupDocCounts } from "@/lib/server/phrase-index";
import { topLines } from "@/lib/server/top-lines";
import { paidEnabled } from "@/lib/site";
import { Home, type DemoLine } from "./_checker/home";

export const dynamic = "force-dynamic";

/** Two lines nobody else has written, to contrast with real copied ones. */
const ORIGINAL_EXAMPLES = [
  "Mapped 212 dabbawala handoffs across four Dadar stations to find where lunches actually went missing.",
  "Rewrote the webhook retry worker in Go, cutting duplicate deliveries from 1.8% to 0.2%.",
];

export default function HomePage() {
  const top = topLines(8);
  const copiedExamples = (top?.lines ?? []).slice(0, 3).map((line) => line.text);

  // The hero demo is scored live against the real index — nothing on it is staged.
  const demoText = [copiedExamples[0], ORIGINAL_EXAMPLES[0], copiedExamples[1], ORIGINAL_EXAMPLES[1], copiedExamples[2]].filter(Boolean).join("\n");
  const analysis = analyseDocument(demoText);
  const demo: DemoLine[] = scoreDocument(analysis, lookupDocCounts).lines.map((line) => ({
    text: line.text,
    common: line.common,
    seenIn: line.peakDocCount,
  }));

  return (
    <Home
      indexSize={indexStats().totalDocuments}
      demo={demo}
      topLines={top}
      exampleLines={[...copiedExamples.slice(0, 2), ORIGINAL_EXAMPLES[1]!]}
      paidEnabled={paidEnabled()}
      domains={paidEnabled() ? domainOptions() : []}
    />
  );
}
