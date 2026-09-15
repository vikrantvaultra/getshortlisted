import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { anonymise } from "../src/lib/anonymise";
import { extractCorpusFile, extractResumeUpload, UploadError } from "../src/lib/extract/extract";
import { detectFileType } from "../src/lib/extract/magic";
import { analyseDocument } from "../src/lib/scoring/analyse";
import { countProjectBullets, detectSections, measureStructure } from "../src/lib/structure";

/** A minimal, valid one-page PDF with the given text lines, built by hand (correct xref offsets). */
function makePdf(lines: string[]): Uint8Array {
  const escape = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const content = `BT /F1 12 Tf 14 TL 72 720 Td ${lines.map((line) => `(${escape(line)}) Tj T*`).join(" ")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

describe("detectFileType (magic bytes, not extensions)", () => {
  test("recognises PDF, PNG, JPEG, WebP", () => {
    assert.equal(detectFileType(makePdf(["x"])), "pdf");
    assert.equal(detectFileType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "png");
    assert.equal(detectFileType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
    assert.equal(detectFileType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ")), "webp");
  });

  test("a ZIP is only DOCX if it contains word/", () => {
    const zipHeader = [0x50, 0x4b, 0x03, 0x04];
    assert.equal(detectFileType(new Uint8Array([...zipHeader, ...new TextEncoder().encode("xl/workbook.xml")])), null);
    assert.equal(detectFileType(new Uint8Array([...zipHeader, ...new TextEncoder().encode("word/document.xml")])), "docx");
  });

  test("rejects text renamed to .pdf", () => {
    assert.equal(detectFileType(new TextEncoder().encode("Just some text")), null);
  });
});

describe("extraction", () => {
  test("extracts text from a real PDF with the same pipeline", async () => {
    const pdf = makePdf([
      "Collaborated with cross functional teams to define design and ship new features.",
      "Built a face recognition attendance system used by 120 students.",
    ]);
    const extracted = await extractResumeUpload(pdf);
    assert.equal(extracted.type, "pdf");
    assert.equal(extracted.pageCount, 1);
    assert.match(extracted.text, /cross functional teams/);
    assert.equal(analyseDocument(extracted.text).lines.length, 2);
  });

  test("uploads reject non-PDF/DOCX content", async () => {
    await assert.rejects(extractResumeUpload(new TextEncoder().encode("plain text")), UploadError);
  });

  test("corpus accepts .txt and .md", async () => {
    const extracted = await extractCorpusFile(new TextEncoder().encode("hello resume"), "a.md");
    assert.equal(extracted.text, "hello resume");
  });
});

describe("anonymise", () => {
  const fresher = readFileSync("fixtures/fresher-resume.txt", "utf8");
  const experienced = readFileSync("fixtures/experienced-resume.txt", "utf8");

  for (const [name, text, person, college] of [
    ["fresher", fresher, ["Ananya", "Raghavan"], "PSG College of Technology"],
    ["experienced", experienced, ["ROHAN", "MEHTA"], "College of Engineering Pune"],
  ] as const) {
    test(`${name}: removes name, contacts, URLs, exact dates and personal rows`, () => {
      const out = anonymise(text, { college });
      for (const token of person) assert.doesNotMatch(out, new RegExp(token, "i"), `name token ${token} survived`);
      assert.doesNotMatch(out, /@/);
      assert.doesNotMatch(out, /\+91|98765|99887/);
      assert.doesNotMatch(out, /linkedin|github/i);
      assert.doesNotMatch(out, /\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
      assert.doesNotMatch(out, /\b(January|February|March|April|June|July|August|September|October|November|December)\s+\d{4}/);
      assert.doesNotMatch(out, /Date of Birth|Father|Marital/i);
      assert.doesNotMatch(out, /hereby declare/i);
      assert.doesNotMatch(out, new RegExp(college, "i"));
    });
  }

  test("keeps years and the substance", () => {
    const out = anonymise(fresher);
    assert.match(out, /2020/);
    assert.match(out, /face recognition attendance system/);
  });
});

describe("structure", () => {
  const sample = [
    "SUMMARY",
    "Backend engineer.",
    "PROJECTS",
    "Ledger | Go",
    "• One",
    "• Two",
    "Tracker",
    "React, Node",
    "• Three",
    "CERTIFICATIONS",
    "• AWS",
    "ACHIEVEMENTS & AWARDS",
    "• ICPC regionalist",
  ].join("\n");

  test("detects sections, including non-standard headers", () => {
    assert.deepEqual(detectSections(sample).map((s) => s.name), ["Summary", "Projects", "Certifications", "Achievements"]);
  });

  test("counts bullets per project, ignoring tech-stack subtitle lines", () => {
    assert.deepEqual(countProjectBullets(detectSections(sample)).bulletsPerProject, [2, 1]);
  });

  test("reports where certifications sit", () => {
    assert.equal(measureStructure(sample, 1, false).certificationsPosition, 3);
  });
});
