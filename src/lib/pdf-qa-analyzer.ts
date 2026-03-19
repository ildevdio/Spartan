/**
 * PDF QA Analyzer — Analyzes rendered canvas pages for quality issues.
 * Detects empty areas, clipped content, and suggests fixes.
 */

export interface PageDiagnosis {
  pageIndex: number;
  emptyRatio: number;        // 0–1: fraction of white/empty pixels
  topEmptyRatio: number;     // 0–1: empty ratio in top 1/3
  midEmptyRatio: number;     // 0–1: empty ratio in middle 1/3
  bottomEmptyRatio: number;  // 0–1: empty ratio in bottom 1/3
  bottomEdgeRisk: boolean;   // true if non-white pixels found in last 15px
  overallScore: number;      // 0–100 quality score
  thumbnail: string;         // data URL for miniature preview
}

export type FixSuggestion = "ok" | "merge_with_previous" | "merge_with_next" | "needs_reflow";

const EMPTY_THRESHOLD = 0.40; // 40% empty = problem

/**
 * Analyze a canvas for content quality.
 */
export function analyzePageCanvas(canvas: HTMLCanvasElement, pageIndex: number): PageDiagnosis {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const w = canvas.width;
  const h = canvas.height;

  // Generate thumbnail
  const thumbCanvas = document.createElement("canvas");
  const thumbH = 150;
  const thumbW = Math.round((w / h) * thumbH);
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const thumbCtx = thumbCanvas.getContext("2d")!;
  thumbCtx.drawImage(canvas, 0, 0, thumbW, thumbH);
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.6);

  if (!ctx || w < 50 || h < 50) {
    return { pageIndex, emptyRatio: 1, topEmptyRatio: 1, midEmptyRatio: 1, bottomEmptyRatio: 1, bottomEdgeRisk: false, overallScore: 0, thumbnail };
  }

  const step = Math.max(4, Math.floor(Math.sqrt((w * h) / 8000)));
  const thirdH = Math.floor(h / 3);
  const fullData = ctx.getImageData(0, 0, w, h).data;

  let topTotal = 0, topWhite = 0;
  let midTotal = 0, midWhite = 0;
  let botTotal = 0, botWhite = 0;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const isWhite = fullData[i + 3] < 8 || (fullData[i] > 245 && fullData[i + 1] > 245 && fullData[i + 2] > 245);

      if (y < thirdH) {
        topTotal++; if (isWhite) topWhite++;
      } else if (y < thirdH * 2) {
        midTotal++; if (isWhite) midWhite++;
      } else {
        botTotal++; if (isWhite) botWhite++;
      }
    }
  }

  const topEmptyRatio = topTotal > 0 ? topWhite / topTotal : 1;
  const midEmptyRatio = midTotal > 0 ? midWhite / midTotal : 1;
  const bottomEmptyRatio = botTotal > 0 ? botWhite / botTotal : 1;
  const totalAll = topTotal + midTotal + botTotal;
  const whiteAll = topWhite + midWhite + botWhite;
  const emptyRatio = totalAll > 0 ? whiteAll / totalAll : 1;

  // Check bottom edge for clipped content (last 15px)
  let bottomEdgeRisk = false;
  const edgeStart = Math.max(0, h - 15);
  outer: for (let y = edgeStart; y < h; y += 2) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      if (fullData[i + 3] > 8 && !(fullData[i] > 245 && fullData[i + 1] > 245 && fullData[i + 2] > 245)) {
        bottomEdgeRisk = true;
        break outer;
      }
    }
  }

  // Score calculation: penalize empty pages and clipped content
  let score = 100;
  if (emptyRatio >= EMPTY_THRESHOLD) {
    // Penalty proportional to how far over the threshold
    score -= Math.round((emptyRatio - EMPTY_THRESHOLD) * 100);
  }
  if (bottomEdgeRisk) score -= 15;
  if (bottomEmptyRatio > 0.85) score -= 10; // mostly empty bottom third
  score = Math.max(0, Math.min(100, score));

  return { pageIndex, emptyRatio, topEmptyRatio, midEmptyRatio, bottomEmptyRatio, bottomEdgeRisk, overallScore: score, thumbnail };
}

/**
 * Suggest a fix action based on page diagnosis.
 */
export function suggestFix(diagnosis: PageDiagnosis, isFirst: boolean, isLast: boolean): FixSuggestion {
  if (diagnosis.bottomEdgeRisk) return "needs_reflow";
  if (diagnosis.emptyRatio >= EMPTY_THRESHOLD) {
    if (!isFirst) return "merge_with_previous";
    if (!isLast) return "merge_with_next";
  }
  return "ok";
}

/**
 * Format diagnosis for display.
 */
export function formatDiagnosis(d: PageDiagnosis): string {
  const parts: string[] = [];
  if (d.emptyRatio >= EMPTY_THRESHOLD) {
    parts.push(`${Math.round(d.emptyRatio * 100)}% vazio`);
  }
  if (d.bottomEdgeRisk) {
    parts.push("conteúdo na borda inferior");
  }
  if (parts.length === 0) return "OK";
  return parts.join(" | ");
}
