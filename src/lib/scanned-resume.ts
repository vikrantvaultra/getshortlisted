"use client";

/**
 * The resume from the home-page scan, kept in this tab's memory so Compare can
 * run on it without a second upload. Only client-side navigation keeps it: a
 * reload or a new tab starts empty and Compare asks for the file again. It is
 * never written to storage, which keeps "your file is not saved" true.
 */
let held: File | null = null;

export function holdScannedResume(file: File | null) {
  held = file;
}

export function scannedResume(): File | null {
  return held;
}
