/**
 * File type detection from the first bytes of the file. File names and the
 * browser-supplied MIME type are never trusted.
 */

export type DetectedType = "pdf" | "docx" | "png" | "jpeg" | "webp";

export const MIME_TYPES: Record<DetectedType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

export function detectFileType(bytes: Uint8Array): DetectedType | null {
  // %PDF-
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  // RIFF....WEBP
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  // DOCX is a ZIP (PK\x03\x04) whose entries include "word/". A plain ZIP, XLSX or PPTX is rejected.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && containsAscii(bytes, "word/")) return "docx";
  return null;
}

function containsAscii(bytes: Uint8Array, needle: string): boolean {
  const target = [...needle].map((c) => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - target.length; i++) {
    for (let j = 0; j < target.length; j++) if (bytes[i + j] !== target[j]) continue outer;
    return true;
  }
  return false;
}

export const RESUME_TYPES: DetectedType[] = ["pdf", "docx"];
export const PROOF_TYPES: DetectedType[] = ["pdf", "png", "jpeg", "webp"];
