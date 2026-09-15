import { UPLOADS } from "@/config";
import { detectFileType, RESUME_TYPES, type DetectedType } from "./magic";

export type ExtractedDocument = {
  text: string;
  type: DetectedType | "txt";
  /** Known for PDFs. Estimated from word count for DOCX/text. */
  pageCount: number;
  pageCountEstimated: boolean;
};

export class UploadError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const WORDS_PER_PAGE_ESTIMATE = 450;

/** User uploads: PDF or DOCX only, validated by magic bytes. */
export async function extractResumeUpload(bytes: Uint8Array): Promise<ExtractedDocument> {
  if (bytes.byteLength === 0) throw new UploadError("That file is empty.");
  if (bytes.byteLength > UPLOADS.MAX_BYTES) {
    throw new UploadError(`That file is over ${UPLOADS.MAX_BYTES / 1024 / 1024} MB.`, 413);
  }
  const type = detectFileType(bytes);
  if (!type || !RESUME_TYPES.includes(type)) {
    throw new UploadError("Upload a PDF or a Word (.docx) file.", 415);
  }
  return extractByType(bytes, type);
}

/** Corpus files may also be plain text or markdown. Same extraction for PDF/DOCX. */
export async function extractCorpusFile(bytes: Uint8Array, fileName: string): Promise<ExtractedDocument> {
  const type = detectFileType(bytes);
  if (type && RESUME_TYPES.includes(type)) return extractByType(bytes, type);
  if (/\.(txt|md)$/i.test(fileName)) {
    const text = new TextDecoder("utf-8").decode(bytes);
    return { text, type: "txt", ...estimatePages(text) };
  }
  throw new UploadError(`Unsupported corpus file: ${fileName}`);
}

async function extractByType(bytes: Uint8Array, type: DetectedType): Promise<ExtractedDocument> {
  try {
    if (type === "pdf") {
      const { extractText } = await import("unpdf");
      // unpdf may transfer the buffer to pdf.js, so hand it a copy.
      const { text, totalPages } = await extractText(new Uint8Array(bytes), { mergePages: true });
      return { text, type, pageCount: totalPages, pageCountEstimated: false };
    }
    if (type === "docx") {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      return { text: value, type, ...estimatePages(value) };
    }
  } catch {
    // Never include the error message: parser errors can quote file contents.
    throw new UploadError("We couldn't read that file. Is it password-protected or damaged?", 422);
  }
  throw new UploadError("Upload a PDF or a Word (.docx) file.", 415);
}

function estimatePages(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return { pageCount: Math.max(1, Math.ceil(words / WORDS_PER_PAGE_ESTIMATE)), pageCountEstimated: true };
}
