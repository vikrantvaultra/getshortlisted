/**
 * Prints the phrase-index summary without changing anything.
 *
 *   npm run corpus:stats
 *   npm run corpus:stats -- --top 25
 */
import { SCORING } from "../src/config";
import { printSummary, readIndexMeta, readIngestedFiles, readPhraseTable, readPhraseText, summariseIndex } from "../src/lib/scoring/index-file";

const topIndex = process.argv.indexOf("--top");
const topN = topIndex >= 0 ? Number(process.argv[topIndex + 1]) || 10 : 10;

const meta = readIndexMeta(SCORING.SHINGLE_SIZE);
const ingested = readIngestedFiles();

console.log(`Phrase index — last updated ${meta.updatedAt ?? "never"}`);
console.log(`  Files on record           ${ingested.length.toLocaleString("en-IN")}`);
console.log(`  Shingle size              ${meta.shingleSize} words`);
console.log(`  Common-line threshold     ≥${SCORING.COMMON_LINE_RATIO * 100}% of shingles in ≥${SCORING.MIN_DOC_COUNT} documents`);
printSummary(summariseIndex(meta, readPhraseTable(), readPhraseText(), topN));
console.log("  Approved submissions are indexed in memory by the running app and are not included here.");
