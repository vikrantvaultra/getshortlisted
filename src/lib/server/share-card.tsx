import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE, UPLOADS } from "@/config";

/**
 * Share images in the "pen & highlighter" style.
 *
 * Story (1080×1920): the count, one sentence, the resume on paper with
 * copied lines highlighted, and the domain.
 * Link preview (1200×630): same identity, bars instead of text so a shared
 * URL never carries anyone's resume.
 */

const WHITE = "#ffffff";
const WASH = "#f5f6f8";
const EDGE = "#e6e8ec";
const TEXT = "#0f1115";
const SOFT = "#4b5160";
const FAINT = "#cfd3da";
const PEN = "#2b54ff";
const PEN_WASH = "#eaf0ff";
const MARKER = "#ffe24a";
const MARKER_SOFT = "#fff4b8";
const MARKER_INK = "#5c4a00";
const SHEET = "#fffdf7";

export type CardLine = { text: string; common: boolean };

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 800; style: "normal" };
let fontsPromise: Promise<Font[]> | null = null;

function loadFonts(): Promise<Font[]> {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const load = async (file: string, name: string, weight: Font["weight"]): Promise<Font> => {
    const buffer = await readFile(path.join(dir, file));
    return { name, weight, style: "normal", data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer };
  };
  fontsPromise ??= Promise.all([
    load("bricolage-grotesque-latin-800-normal.woff", "Display", 800),
    load("bricolage-grotesque-latin-600-normal.woff", "Display", 600),
    load("inter-latin-400-normal.woff", "Inter", 400),
    load("inter-latin-500-normal.woff", "Inter", 500),
    load("jetbrains-mono-latin-500-normal.woff", "Mono", 500),
  ]);
  return fontsPromise;
}

/** Satori only renders glyphs present in the loaded Latin subsets. */
function cardSafe(text: string, max = 140): string {
  const clean = text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/₹\s?/g, "Rs ")
    .replace(/[^ -ɏ–—•]/g, "")
    .trim();
  return clean.length > max ? `${clean.slice(0, max - 3).trimEnd()}...` : clean;
}

function lineTypography(lines: CardLine[]) {
  const chars = lines.reduce((sum, line) => sum + Math.min(line.text.length, 140), 0);
  if (chars < 700) return { fontSize: 29, gap: 14 };
  if (chars < 1200) return { fontSize: 25, gap: 11 };
  if (chars < 1900) return { fontSize: 22, gap: 9 };
  return { fontSize: 19, gap: 7 };
}

function Logo({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: size * 0.35,
          backgroundColor: PEN,
          marginRight: size * 0.4,
        }}
      >
        <div
          style={{
            display: "flex",
            width: size * 0.7,
            height: size * 0.38,
            borderLeft: `${size * 0.16}px solid ${WHITE}`,
            borderBottom: `${size * 0.16}px solid ${WHITE}`,
            transform: "rotate(-45deg)",
            marginTop: -size * 0.15,
          }}
        />
      </div>
      <div style={{ display: "flex", fontFamily: "Display", fontWeight: 800, fontSize: size * 1.1, color: TEXT }}>
        <span>get</span>
        <span style={{ backgroundColor: MARKER, padding: `0 ${size * 0.2}px`, borderRadius: size * 0.2 }}>shortlisted</span>
      </div>
    </div>
  );
}

export async function renderStoryCard(commonCount: number, totalCount: number, lines: CardLine[]) {
  const shown = lines.slice(0, UPLOADS.SHARE_CARD_MAX_LINES);
  const { fontSize, gap } = lineTypography(shown);
  const digits = String(commonCount).length + String(totalCount).length;
  const numberSize = digits <= 3 ? 300 : digits === 4 ? 250 : 210;
  const unique = totalCount - commonCount;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: WHITE, padding: "96px 80px 80px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Mono",
              fontSize: 26,
              letterSpacing: "0.08em",
              color: TEXT,
              backgroundColor: MARKER,
              padding: "12px 24px",
              borderRadius: 999,
              transform: "rotate(-2deg)",
            }}
          >
            MY RESUME SCAN
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 48, flexShrink: 0, fontFamily: "Display", fontWeight: 800, lineHeight: 1 }}>
          <div style={{ display: "flex", backgroundColor: MARKER, borderRadius: 40, padding: "0 30px", fontSize: numberSize, color: TEXT }}>{commonCount}</div>
          <div style={{ display: "flex", fontSize: numberSize, color: FAINT, marginLeft: 12 }}>/{totalCount}</div>
        </div>

        <div style={{ display: "flex", marginTop: 36, flexShrink: 0, fontFamily: "Display", fontWeight: 800, fontSize: 66, lineHeight: 1.08, color: TEXT, letterSpacing: "-0.02em" }}>
          lines on my resume already appear in other resumes.
        </div>

        <div style={{ display: "flex", marginTop: 36, flexShrink: 0 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: MARKER_INK, backgroundColor: MARKER_SOFT, padding: "12px 26px", borderRadius: 999, marginRight: 16 }}>
            {commonCount} copied
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: PEN, backgroundColor: PEN_WASH, padding: "12px 26px", borderRadius: 999 }}>
            {unique} only mine
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflow: "hidden",
            marginTop: 44,
            backgroundColor: SHEET,
            border: `2px solid ${EDGE}`,
            borderRadius: 36,
            padding: "40px 40px 20px",
          }}
        >
          {shown.map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0, marginBottom: gap, fontSize, lineHeight: 1.35, color: TEXT }}>
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  marginTop: fontSize * 0.45,
                  marginRight: 16,
                  flexShrink: 0,
                  backgroundColor: line.common ? "#e0b800" : PEN,
                }}
              />
              <div style={line.common ? { display: "flex", backgroundColor: MARKER, borderRadius: 8, padding: "0 8px" } : { display: "flex", color: SOFT }}>
                {cardSafe(line.text)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 44, flexShrink: 0 }}>
          <Logo size={34} />
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 26, color: WHITE, backgroundColor: PEN, padding: "14px 26px", borderRadius: 20 }}>
            scan yours free
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await loadFonts(), headers: { "Cache-Control": "no-store" } },
  );
}

/** Link preview. Bars stand in for lines; their count and proportion are exact, their order illustrative. */
export async function renderLinkPreview(commonCount: number, totalCount: number) {
  const bars = Math.min(totalCount, 12);
  const commonBars = totalCount ? Math.round((commonCount / totalCount) * bars) : 0;
  const marked = new Set(Array.from({ length: commonBars }, (_, i) => Math.floor(((i + 0.5) * bars) / commonBars)));
  const widths = [92, 78, 100, 66, 88, 96, 72, 84, 100, 60, 90, 76];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: WHITE, padding: 60, fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <Logo size={26} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", fontFamily: "Display", fontWeight: 800, lineHeight: 1 }}>
              <div style={{ display: "flex", backgroundColor: MARKER, borderRadius: 28, padding: "0 22px", fontSize: 190, color: TEXT }}>{commonCount}</div>
              <div style={{ display: "flex", fontSize: 190, color: FAINT, marginLeft: 8 }}>/{totalCount}</div>
            </div>
            <div style={{ display: "flex", marginTop: 22, fontFamily: "Display", fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: TEXT, maxWidth: 540 }}>
              resume lines already appear in other resumes.
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 24, color: SOFT }}>{SITE.domain} · scan yours free</div>
        </div>
        <div style={{ display: "flex", flexGrow: 1, marginLeft: 40, backgroundColor: SHEET, border: `2px solid ${EDGE}`, borderRadius: 32, padding: 36, flexDirection: "column", justifyContent: "center" }}>
          {Array.from({ length: bars }, (_, i) => (
            <div key={i} style={{ display: "flex", height: 16, marginBottom: 14, width: `${widths[i % widths.length]}%`, borderRadius: 8, backgroundColor: marked.has(i) ? MARKER : WASH }} />
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
