import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, PageBreak,
  Header, Footer, TabStopPosition, TabStopType,
  ShadingType, convertInchesToTwip, ImageRun,
  HeightRule, VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, ReportType, Task, PsychosocialAnalysis, RiskAssessment, ActionPlan } from "./types";
import { riskLevelLabel, statusLabel } from "./types";
import { mockRiskAssessments, mockActionPlans, mockTasks, mockPsychosocialAnalyses, mockPostureAnalyses } from "./mock-data";
import { generateReportHTML } from "./report-templates";
import { analyzePageCanvas, suggestFix, formatDiagnosis, type PageDiagnosis, type FixSuggestion } from "./pdf-qa-analyzer";

export interface DocxReportContext {
  company: Company;
  sector?: Sector;
  workstation?: Workstation;
  workstations: Workstation[];
  sectors: Sector[];
  analyses: Analysis[];
  photos: PosturePhoto[];
  reportType: ReportType;
  consultantName?: string;
}

// ============ COLOR PALETTE ============
const COLORS = {
  primary: "0A1F44",
  secondary: "1565C0",
  tertiary: "1E88E5",
  muted: "546E7A",
  light: "90A4AE",
  accent: "00838F",
  accentBright: "00BCD4",
  accentLight: "B2EBF2",
  highlight: "FF6F00",
  highlightLight: "FFF3E0",
  warmRed: "D32F2F",
  headerBg: "0A1F44",
  headerText: "FFFFFF",
  headerBg2: "1565C0",
  headerBg3: "00838F",
  rowAlt: "E3F2FD",
  rowWhite: "FFFFFF",
  cellLabel: "E1F5FE",
  sectionBg: "00838F",
  sectionText: "FFFFFF",
  white: "FFFFFF",
  border: "B0BEC5",
  borderDark: "78909C",
  greenBg: "C8E6C9",
  greenText: "1B5E20",
  greenBright: "43A047",
  yellowBg: "FFF9C4",
  yellowText: "F57F17",
  yellowBright: "FFB300",
  redBg: "FFCDD2",
  redText: "B71C1C",
  redBright: "E53935",
  orangeBg: "FFE0B2",
  orangeText: "E65100",
  orangeBright: "FB8C00",
  coverGradientTop: "0A1F44",
  coverGradientMid: "1565C0",
  coverAccent: "00BCD4",
  footerBg: "F5F5F5",
};

// ============ BORDER STYLES ============
function borderStyle() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  };
}

function borderHeader() {
  return {
    top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.headerBg },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.headerBg },
    left: { style: BorderStyle.SINGLE, size: 2, color: COLORS.headerBg },
    right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.headerBg },
  };
}

function borderAccent() {
  return {
    top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent },
    left: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent },
    right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent },
  };
}

// ============ CELL HELPERS ============
const CELL_MARGINS = {
  top: convertInchesToTwip(0.05),
  bottom: convertInchesToTwip(0.05),
  left: convertInchesToTwip(0.1),
  right: convertInchesToTwip(0.1),
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: "Calibri", color: COLORS.headerText })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 50, after: 50 },
    })],
    shading: { type: ShadingType.SOLID, fill: COLORS.headerBg, color: COLORS.headerBg },
    borders: borderHeader(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function headerCell2(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: "Calibri", color: COLORS.white })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 50, after: 50 },
    })],
    shading: { type: ShadingType.SOLID, fill: COLORS.headerBg2, color: COLORS.headerBg2 },
    borders: borderAccent(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function headerCell3(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: "Calibri", color: COLORS.white })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 50, after: 50 },
    })],
    shading: { type: ShadingType.SOLID, fill: COLORS.headerBg3, color: COLORS.headerBg3 },
    borders: borderAccent(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function textCell(text: string, bold = false, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: COLORS.primary })],
      spacing: { before: 40, after: 40 },
    })],
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function altCell(text: string, isAlt: boolean, bold = false, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: COLORS.primary })],
      spacing: { before: 40, after: 40 },
    })],
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
    shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.rowAlt, color: COLORS.rowAlt } : undefined,
  });
}

function labelCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold: true, color: COLORS.secondary })],
      spacing: { before: 40, after: 40 },
    })],
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
    shading: { type: ShadingType.SOLID, fill: COLORS.cellLabel, color: COLORS.cellLabel },
  });
}

function shadedCell(text: string, fill: string, bold = false, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: COLORS.primary })],
      spacing: { before: 40, after: 40 },
    })],
    shading: { type: ShadingType.SOLID, fill, color: fill },
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function statusCell(text: string, level: "green" | "yellow" | "orange" | "red", width?: number): TableCell {
  const fills = { green: COLORS.greenBg, yellow: COLORS.yellowBg, orange: COLORS.orangeBg, red: COLORS.redBg };
  const colors = { green: COLORS.greenText, yellow: COLORS.yellowText, orange: COLORS.orangeText, red: COLORS.redText };
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold: true, color: colors[level] })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    })],
    shading: { type: ShadingType.SOLID, fill: fills[level], color: fills[level] },
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function mergedCell(text: string, colSpan: number, bold = false, fill?: string): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: fill === COLORS.headerBg || fill === COLORS.headerBg2 || fill === COLORS.headerBg3 || fill === COLORS.sectionBg ? COLORS.white : COLORS.primary })],
      spacing: { before: 50, after: 50 },
    })],
    borders: fill === COLORS.headerBg || fill === COLORS.headerBg2 ? borderHeader() : borderStyle(),
    columnSpan: colSpan,
    shading: fill ? { type: ShadingType.SOLID, fill, color: fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

// ============ TEXT HELPERS ============
function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  const isH1 = level === HeadingLevel.HEADING_1;
  const isH2 = level === HeadingLevel.HEADING_2;
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: isH1 ? 30 : isH2 ? 26 : 22,
        font: "Calibri",
        color: isH1 ? COLORS.white : isH2 ? COLORS.secondary : COLORS.accent,
      }),
    ],
    spacing: { before: isH1 ? 500 : 360, after: isH1 ? 200 : 140 },
    shading: isH1 ? { type: ShadingType.SOLID, fill: COLORS.headerBg, color: COLORS.headerBg } : undefined,
    border: isH1 ? undefined : isH2 ? {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.accentBright, space: 6 },
      left: { style: BorderStyle.SINGLE, size: 16, color: COLORS.secondary, space: 8 },
    } : {
      left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent, space: 6 },
    },
    indent: isH1 ? { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) } : undefined,
  });
}

function sectionBanner(text: string, bgColor = COLORS.sectionBg): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `  ${text}`, bold: true, size: 26, font: "Calibri", color: COLORS.white })],
    shading: { type: ShadingType.SOLID, fill: bgColor, color: bgColor },
    spacing: { before: 400, after: 200 },
    indent: { left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
  });
}

function accentCallout(text: string, type: "info" | "warning" | "success" | "danger" = "info"): Paragraph {
  const configs = {
    info: { bg: COLORS.cellLabel, border: COLORS.secondary, textColor: COLORS.secondary },
    warning: { bg: COLORS.highlightLight, border: COLORS.highlight, textColor: COLORS.highlight },
    success: { bg: COLORS.greenBg, border: COLORS.greenBright, textColor: COLORS.greenText },
    danger: { bg: COLORS.redBg, border: COLORS.warmRed, textColor: COLORS.redText },
  };
  const c = configs[type];
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: "Calibri", color: c.textColor, italics: true })],
    shading: { type: ShadingType.SOLID, fill: c.bg, color: c.bg },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: c.border, space: 8 } },
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.15) },
  });
}

function body(text: string, options?: { bold?: boolean; spacing?: { before?: number; after?: number }; italic?: boolean }): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      size: 22,
      font: "Calibri",
      bold: options?.bold,
      italics: options?.italic,
      color: COLORS.primary,
    })],
    spacing: options?.spacing || { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", color: COLORS.primary })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function spacer(twips = 200): Paragraph {
  return new Paragraph({ spacing: { before: twips } });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

// ============ IMAGE HELPERS ============
async function fetchImageAsBuffer(url: string): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> {
  try {
    if (url.startsWith("data:")) {
      const base64 = url.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const buffer = bytes.buffer;
      const dims = await getImageDimensions(url);
      return { buffer, ...dims };
    }
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const blobUrl = URL.createObjectURL(blob);
    const dims = await getImageDimensions(blobUrl);
    URL.revokeObjectURL(blobUrl);
    return { buffer, ...dims };
  } catch {
    return null;
  }
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 640, height: 480 });
    img.src = src;
  });
}

function createImageParagraph(buffer: ArrayBuffer, width: number, height: number, caption?: string): Paragraph[] {
  const maxWidth = 500;
  const scale = Math.min(maxWidth / width, 1);
  const finalW = Math.round(width * scale);
  const finalH = Math.round(height * scale);
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [new ImageRun({ data: buffer, transformation: { width: finalW, height: finalH }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  ];
  if (caption) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: caption, size: 18, font: "Calibri", italics: true, color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }
  return paragraphs;
}

// ============ DATE HELPERS ============
function getToday(): string {
  return new Date().toLocaleDateString("pt-BR");
}
function getYear(): number {
  return new Date().getFullYear();
}

// ============ COVER PAGE ============
// Matches the HTML preview: dark gradient-like cover with white text
function createCoverPage(title: string, subtitle: string, company: Company, consultant: string): Paragraph[] {
  const year = new Date().getFullYear().toString();
  const coverShading = { type: ShadingType.SOLID, fill: COLORS.coverGradientTop, color: COLORS.coverGradientTop };
  const coverShadingMid = { type: ShadingType.SOLID, fill: COLORS.secondary, color: COLORS.secondary };
  const coverShadingAccent = { type: ShadingType.SOLID, fill: COLORS.accentBright, color: COLORS.accentBright };
  return [
    // Top gradient bands
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 30 })] }),
    new Paragraph({ shading: coverShadingMid, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 20 })] }),
    new Paragraph({ shading: coverShadingAccent, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 8 })] }),
    // Spacer with dark bg
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 600, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    // Title
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 56, font: "Calibri", color: COLORS.white })],
      alignment: AlignmentType.CENTER, spacing: { after: 60 },
      shading: coverShading,
    }),
    // Divider line
    new Paragraph({
      shading: coverShading,
      spacing: { after: 60 },
      children: [new TextRun({ text: " ", size: 10 })],
    }),
    // Subtitle badge
    new Paragraph({
      children: [new TextRun({ text: `  ${subtitle}  `, size: 36, font: "Calibri", color: COLORS.accentLight, bold: false })],
      alignment: AlignmentType.CENTER, spacing: { after: 60 },
      shading: coverShading,
    }),
    // Year
    new Paragraph({
      children: [new TextRun({ text: " ", size: 10 })],
      shading: coverShading, spacing: { after: 400 },
    }),
    // Company name
    new Paragraph({
      children: [new TextRun({ text: (company.trade_name || company.name).toUpperCase(), bold: true, size: 40, font: "Calibri", color: COLORS.white })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
      shading: coverShading,
    }),
    // CNPJ
    new Paragraph({
      children: [
        new TextRun({ text: "CNPJ: ", size: 22, font: "Calibri", color: COLORS.accentLight }),
        new TextRun({ text: company.cnpj, size: 22, font: "Calibri", color: COLORS.accentLight, bold: true }),
      ],
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      shading: coverShading,
    }),
    // Address
    new Paragraph({
      children: [new TextRun({ text: `${company.address}${company.neighborhood ? ', ' + company.neighborhood : ''} — ${company.city}/${company.state}`, size: 20, font: "Calibri", color: COLORS.accentLight })],
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      shading: coverShading,
    }),
    // Spacer
    new Paragraph({ shading: coverShading, spacing: { before: 200, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    // Emission / Revision
    new Paragraph({
      children: [new TextRun({ text: `Emissão: ${getToday()} | Revisão: 00`, size: 20, font: "Calibri", color: COLORS.accentLight })],
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      shading: coverShading,
    }),
    // Responsible
    new Paragraph({
      children: [new TextRun({ text: `Responsável Técnico: ${consultant}`, size: 20, font: "Calibri", color: COLORS.accentLight })],
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      shading: coverShading,
    }),
    // Consultoria
    new Paragraph({
      children: [new TextRun({ text: "MG Consultoria — Ergonomia & Segurança do Trabalho", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 60 },
      shading: coverShading,
    }),
    // Bottom spacer + gradient bands
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 10 })] }),
    new Paragraph({ shading: coverShadingAccent, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 8 })] }),
    new Paragraph({ shading: coverShadingMid, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 20 })] }),
    new Paragraph({ shading: coverShading, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 30 })] }),
    pageBreak(),
  ];
}

// ============ SHARED COMPONENTS ============
function companyDataTable(company: Company): Table {
  const rows: [string, string][] = [
    ["Razão Social", company.name],
    ["Nome Fantasia", company.trade_name || company.name],
    ["CNPJ", company.cnpj],
    ["CNAE Principal", company.cnae_principal || "—"],
    ["CNAE Secundário", company.cnae_secundario || "—"],
    ["Grau de Risco", company.activity_risk || "—"],
    ["Endereço", company.address],
    ["Bairro", company.neighborhood || "—"],
    ["Cidade/UF", `${company.city} — ${company.state}`],
    ["CEP", company.cep || "—"],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({ children: [labelCell(label, 30), textCell(value, false, 70)] })
    ),
  });
}

function revisionTable(): (Paragraph | Table)[] {
  return [
    heading("CONTROLE DE REVISÕES"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Revisão", 20), headerCell("Data", 40), headerCell("Descrição", 40)] }),
        new TableRow({ children: [textCell("00", false, 20), textCell(getToday(), false, 40), textCell("Emissão do documento.", false, 40)] }),
      ],
    }),
  ];
}

function equipmentTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Agente", 25), headerCell("Instrumento", 40), headerCell("Método", 35)] }),
      new TableRow({ children: [labelCell("Calor", 25), textCell("Medidor de Stress Térmico (IBUTG)", false, 40), textCell("NR-15, Portaria 3214/78 / NHO-06", false, 35)] }),
      new TableRow({ children: [labelCell("Ruído", 25), textCell("Decibelímetro / Dosímetro", false, 40), textCell("NHO-01 FUNDACENTRO / NR-15 Anexo I", false, 35)] }),
      new TableRow({ children: [labelCell("Iluminação", 25), textCell("Luxímetro", false, 40), textCell("NHO-11", false, 35)] }),
      new TableRow({ children: [labelCell("Agentes Químicos", 25), textCell("Bomba de amostragem gravimétrica", false, 40), textCell("NHO-08 / NIOSH / ACGIH", false, 35)] }),
      new TableRow({ children: [labelCell("Vibração", 25), textCell("Acelerômetro triaxial", false, 40), textCell("NHO-09 / NHO-10", false, 35)] }),
    ],
  });
}

function riskMatrixTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("P \\ G", 20), headerCell("1 — Baixo", 20), headerCell("2 — Moderado", 20), headerCell("3 — Alto", 20), headerCell("4 — Excessivo", 20)] }),
      new TableRow({ children: [labelCell("1 — Baixo", 20), shadedCell("Irrelevante", COLORS.greenBg, false, 20), shadedCell("Baixo", COLORS.greenBg, false, 20), shadedCell("Baixo", COLORS.yellowBg, false, 20), shadedCell("Médio", COLORS.yellowBg, false, 20)] }),
      new TableRow({ children: [labelCell("2 — Moderado", 20), shadedCell("Baixo", COLORS.greenBg, false, 20), shadedCell("Baixo", COLORS.yellowBg, false, 20), shadedCell("Médio", COLORS.yellowBg, false, 20), shadedCell("Alto", COLORS.orangeBg, false, 20)] }),
      new TableRow({ children: [labelCell("3 — Alto", 20), shadedCell("Baixo", COLORS.yellowBg, false, 20), shadedCell("Médio", COLORS.yellowBg, false, 20), shadedCell("Alto", COLORS.orangeBg, false, 20), shadedCell("Alto", COLORS.orangeBg, false, 20)] }),
      new TableRow({ children: [labelCell("4 — Excessivo", 20), shadedCell("Médio", COLORS.yellowBg, false, 20), shadedCell("Alto", COLORS.orangeBg, false, 20), shadedCell("Alto", COLORS.orangeBg, false, 20), shadedCell("Crítico", COLORS.redBg, false, 20)] }),
    ],
  });
}

function signatureBlock(consultant: string, title = "Engenheiro de Segurança do Trabalho", registration = "CREA/CONFEA: XXXXX"): Paragraph[] {
  return [
    spacer(600),
    new Paragraph({ children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri", color: COLORS.primary })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: consultant, bold: true, size: 22, font: "Calibri", color: COLORS.primary })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: title, size: 20, font: "Calibri", color: COLORS.secondary })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: registration, size: 20, font: "Calibri", color: COLORS.muted })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: "Documento gerado pelo sistema Focus Spartan — MG Consultoria", size: 18, font: "Calibri", color: COLORS.light, italics: true })], alignment: AlignmentType.CENTER }),
  ];
}

function footer(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `MG Consultoria — Ergonomia & Segurança do Trabalho | ${getToday()}`, size: 18, font: "Calibri", color: COLORS.light, italics: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 300 },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border, space: 8 } },
  });
}

function createProfessionalHeader(reportType: string, companyName: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${reportType} — ${companyName}`, size: 16, font: "Calibri", color: COLORS.light, italics: true }),
          new TextRun({ text: "    |    ", size: 16, font: "Calibri", color: COLORS.border }),
          new TextRun({ text: "MG Consultoria", size: 16, font: "Calibri", color: COLORS.secondary, bold: true }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.accentBright, space: 4 } },
        spacing: { after: 200 },
      }),
    ],
  });
}

function createProfessionalFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "Documento confidencial — ", size: 14, font: "Calibri", color: COLORS.light, italics: true }),
          new TextRun({ text: "Spartan / MG Consultoria", size: 14, font: "Calibri", color: COLORS.secondary, italics: true, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.accentBright, space: 4 } },
        spacing: { before: 200 },
      }),
    ],
  });
}

function createDocumentShell(title: string, companyName: string, reportType: string, children: any[]): Document {
  return new Document({
    creator: "Spartan - MG Consultoria",
    title: `${reportType} - ${companyName}`,
    description: title,
    sections: [{
      properties: {
        page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) } },
      },
      headers: { default: createProfessionalHeader(reportType, companyName) },
      footers: { default: createProfessionalFooter() },
      children,
    }],
  });
}

// ============ DATA HELPERS ============
function getCtxData(ctx: DocxReportContext) {
  const { company, workstations, sectors, analyses } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const wsIds = workstations.map(w => w.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const tasks = mockTasks.filter(t => wsIds.includes(t.workstation_id));
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);
  const sectorMap = new Map<string, { sectorName: string; workstations: typeof workstations }>();
  workstations.forEach(ws => {
    const sectorId = ws.sector?.id || ws.sector_id || "unknown";
    const sectorName = ws.sector?.name || sectors.find(s => s.id === ws.sector_id)?.name || "Geral";
    if (!sectorMap.has(sectorId)) sectorMap.set(sectorId, { sectorName, workstations: [] });
    sectorMap.get(sectorId)!.workstations.push(ws);
  });
  return { consultant, risks, actions, tasks, psychosocial, sectorMap };
}

function gheTable(workstations: Workstation[], ctx: DocxReportContext): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("GHE", 25), headerCell("Setor / Atividade", 35), headerCell("Descrição das Atividades", 40)] }),
      ...workstations.map((ws, i) => {
        const sector = ctx.sector || ws.sector || ctx.sectors.find(s => s.id === ws.sector_id);
        return new TableRow({
          children: [
            textCell(`GHE ${String(i + 1).padStart(2, '0')} — ${ws.name}`, false, 25),
            textCell((sector as any)?.name || "—", false, 35),
            textCell(ws.activity_description || ws.description || ws.tasks_performed, false, 40),
          ],
        });
      }),
    ],
  });
}

// ========== AET REPORT — Matches HTML preview exactly ==========
async function generateAETDocx(ctx: DocxReportContext): Promise<Document> {
  const { company, sector, workstation, workstations, sectors, analyses, photos } = ctx;
  const { consultant, risks, actions, tasks, psychosocial } = getCtxData(ctx);
  const methods = [...new Set(analyses.map(a => a.method))].join(", ") || "N/A";
  const sectorName = sector?.name || "Geral";
  const wsName = workstation?.name || workstations.map(w => w.name).join(", ");

  const children: any[] = [];

  // Cover
  children.push(...createCoverPage("ANÁLISE ERGONÔMICA DO TRABALHO", "AET", company, consultant));

  // ÍNDICE
  children.push(heading("ÍNDICE"));
  const tocItems = [
    ["1. Introdução", "3"], ["2. Dados da Empresa", "4"], ["3. Objetivos", "5"],
    ["4. Referências Normativas", "5"], ["5. Análise da Demanda e do Funcionamento da Organização", "6"],
    ["6. Referencial Teórico", "7"], ["7. Estudo Ergonômico do Trabalho", "9"],
    ["8. Definição de Métodos, Técnicas e Ferramentas", "10"],
    ["9. Agrupamento por GHE e Matriz de Avaliação Ergonômica", "12"],
    ["10. Análise dos Riscos Psicossociais", "14"], ["11. Responsabilidade Técnica", "15"],
    ["12. Anexos", "16"],
  ];
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tocItems.map(([item, page], i) =>
      new TableRow({ children: [altCell(item, i % 2 === 1, false, 85), altCell(page, i % 2 === 1, false, 15)] })
    ),
  }));
  children.push(pageBreak());

  // 1. INTRODUÇÃO
  children.push(heading("1. INTRODUÇÃO"));
  children.push(body("Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana."));
  children.push(body("A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa."));
  children.push(body("Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho."));

  // 2. DADOS DA EMPRESA
  children.push(heading("2. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  // 3. OBJETIVOS
  children.push(heading("3. OBJETIVOS"));
  [
    "Realizar a Análise Ergonômica do Trabalho (AET) conforme as diretrizes da NR-17;",
    "Identificar e avaliar os riscos ergonômicos nos postos de trabalho analisados;",
    "Classificar os riscos utilizando métodos ergonômicos validados internacionalmente;",
    "Propor recomendações de melhoria baseadas em evidências científicas;",
    "Contribuir para a melhoria contínua das condições de trabalho na organização.",
  ].forEach(t => children.push(bulletItem(t)));

  // 4. REFERÊNCIAS NORMATIVAS
  children.push(heading("4. REFERÊNCIAS NORMATIVAS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Norma", 25), headerCell("Descrição", 75)] }),
      ...([
        ["NR-17", "Ergonomia — Parâmetros de adaptação das condições de trabalho"],
        ["NR-01", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais (PGR)"],
        ["ISO 11228", "Ergonomia — Movimentação manual de cargas"],
        ["ISO 11226", "Ergonomia — Avaliação de posturas de trabalho estáticas"],
        ["CLT Art. 157-158", "Obrigações do empregador e empregados quanto à segurança"],
      ]).map(([norm, desc]) =>
        new TableRow({ children: [labelCell(norm, 25), textCell(desc, false, 75)] })
      ),
    ],
  }));

  // 5. ANÁLISE DA DEMANDA
  children.push(heading("5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO"));
  children.push(body(`A empresa ${company.name} opera no segmento de ${company.description.toLowerCase() || "atividades comerciais/industriais"}. A organização do trabalho foi avaliada considerando a estrutura setorial, distribuição de tarefas, jornada de trabalho e ritmo de produção.`));
  workstations.forEach(ws => {
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    children.push(heading(`Posto: ${ws.name}`, HeadingLevel.HEADING_3));
    children.push(body(`Descrição da atividade: ${ws.activity_description || ws.description}`, { bold: true }));
    children.push(body("Tarefas executadas:", { bold: true }));
    if (wsTasks.length > 0) {
      wsTasks.forEach(t => children.push(bulletItem(t.description)));
    } else {
      children.push(bulletItem(ws.tasks_performed || "Atividades gerais do posto"));
    }
  });

  // 6. REFERENCIAL TEÓRICO
  children.push(heading("6. REFERENCIAL TEÓRICO"));
  children.push(body("A Ergonomia, segundo a International Ergonomics Association (IEA), é a disciplina científica que trata da compreensão das interações entre seres humanos e outros elementos de um sistema, aplicando teorias, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema."));
  children.push(bulletItem("Ergonomia Física: Características anatômicas, antropométricas, fisiológicas e biomecânicas"));
  children.push(bulletItem("Ergonomia Cognitiva: Processos mentais como percepção, memória, raciocínio e resposta motora"));
  children.push(bulletItem("Ergonomia Organizacional: Otimização de sistemas sociotécnicos, estruturas organizacionais e processos"));

  // 7. ESTUDO ERGONÔMICO DO TRABALHO
  children.push(heading("7. ESTUDO ERGONÔMICO DO TRABALHO"));
  children.push(body("A realização do Estudo Ergonômico do Trabalho é indispensável não apenas pelo cumprimento da NR17, mas também por atuar como instrumento complementar ao PGR e ao PCMSO. Sua aplicação fortalece a empresa na prevenção de doenças ocupacionais, na manutenção da produtividade e na correção de inadequações ergonômicas do ambiente laboral. O presente trabalho foi elaborado com base nas análises e resultados desenvolvidos pela MG CONSULT."));

  if (photos.length > 0) {
    children.push(heading("Registro Postural", HeadingLevel.HEADING_3));
    children.push(body(`Foram registradas ${photos.length} posturas de trabalho:`));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Postura", 30), headerCell("Descrição", 50), headerCell("Data", 20)] }),
        ...photos.map(p => new TableRow({ children: [textCell(p.posture_type, true, 30), textCell(p.notes, false, 50), textCell(p.created_at, false, 20)] })),
      ],
    }));
  }

  if (analyses.length > 0) {
    children.push(heading("Análises Ergonômicas", HeadingLevel.HEADING_3));
    children.push(body(`Métodos utilizados: ${methods}`, { bold: true }));
    analyses.forEach(a => {
      const ws = workstations.find(w => w.id === a.workstation_id);
      const risk = risks.find(r => r.analysis_id === a.id);
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [mergedCell(ws?.name || "—", 2, true, COLORS.headerBg)] }),
          new TableRow({ children: [labelCell("Método", 30), textCell(a.method, false, 70)] }),
          new TableRow({ children: [labelCell("Score", 30), textCell(String(a.score), false, 70)] }),
          new TableRow({ children: [labelCell("Nível de Risco", 30), textCell(risk ? riskLevelLabel(risk.risk_level) : "N/A", false, 70)] }),
          new TableRow({ children: [labelCell("Observações", 30), textCell(a.notes, false, 70)] }),
        ],
      }));
    });
  } else {
    children.push(body("Nenhuma análise realizada."));
  }

  // 8. DEFINIÇÃO DE MÉTODOS
  children.push(heading("8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS"));
  children.push(body("REBA — Rapid Entire Body Assessment: Estima o risco de distúrbios musculoesqueléticos. Classificação: 1-3 Baixo | 4-7 Médio | 8-10 Alto | 11+ Muito Alto.", { bold: true }));
  children.push(body("RULA — Rapid Upper Limb Assessment: Avalia exposição dos membros superiores. Classificação: 1-2 Aceitável | 3-4 Investigar | 5-6 Mudar breve | 7 Mudar imediatamente.", { bold: true }));
  children.push(body("OCRA — Occupational Repetitive Actions: Avaliação de movimentos repetitivos dos membros superiores.", { bold: true }));
  children.push(body("ROSA — Rapid Office Strain Assessment: Riscos musculoesqueléticos em postos administrativos. Classificação: 1-2 Desprezível | 3-4 Baixo | 5-6 Médio | 7+ Alto.", { bold: true }));
  children.push(body("OWAS — Ovako Working Posture Analysing System: Classificação postural. 1: Normal | 2: Leve | 3: Severo | 4: Muito severo.", { bold: true }));
  children.push(heading("Equipamentos Utilizados para Medição", HeadingLevel.HEADING_3));
  children.push(equipmentTable());

  // 9. AGRUPAMENTO POR GHE E MATRIZ
  children.push(heading("9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA"));
  children.push(body(`A empresa ${company.trade_name || company.name} tem seus trabalhadores classificados em Grupos Homogêneos de Exposição (GHE), conforme metodologia do PGR.`));
  children.push(gheTable(workstations, ctx));
  children.push(heading("Matriz de Avaliação de Riscos (P × G)", HeadingLevel.HEADING_3));
  children.push(riskMatrixTable());
  children.push(body("Fonte: Matriz elaborada a partir de MULHAUSEN & DAMIANO (1998) e BS 8800 (BSI, 1996).", { italic: true }));

  if (risks.length > 0) {
    children.push(heading("Riscos Identificados", HeadingLevel.HEADING_3));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("GHE/Posto", 20), headerCell("Risco", 25), headerCell("P × E × C", 15), headerCell("Score", 15), headerCell("Nível", 25)] }),
        ...risks.map((r, i) => {
          const analysis = analyses.find(a => a.id === r.analysis_id);
          const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
          return new TableRow({
            children: [
              textCell(ws?.name || `GHE ${i + 1}`, false, 20),
              textCell(r.description, false, 25),
              textCell(`${r.probability}×${r.exposure}×${r.consequence}`, false, 15),
              textCell(String(r.risk_score), true, 15),
              textCell(riskLevelLabel(r.risk_level), true, 25),
            ],
          });
        }),
      ],
    }));
  }

  // 10. ANÁLISE DOS RISCOS PSICOSSOCIAIS
  children.push(heading("10. ANÁLISE DOS RISCOS PSICOSSOCIAIS"));
  if (psychosocial.length > 0) {
    const instruments: string[] = [];
    if (psychosocial.some(p => p.copenhagen_details)) instruments.push("COPSOQ II");
    if (psychosocial.some(p => p.nasa_tlx_details)) instruments.push("NASA-TLX");
    if (psychosocial.some(p => p.hse_it_details)) instruments.push("HSE-IT");
    children.push(body(`Instrumentos aplicados: ${instruments.join(", ")}`));
    psychosocial.forEach(psa => {
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Dimensão COPSOQ II", 60), headerCell3("Score (0-100)", 40)] }),
            ...([
              ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace],
              ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands],
              ["Influência", cd.influence], ["Desenvolvimento", cd.possibilities_development],
              ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment],
              ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), true, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.copenhagen_score), true, 40)] }),
          ],
        }));
      }
      if (psa.nasa_tlx_details) {
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell2("NASA-TLX", 60), headerCell2("Score", 40)] }),
            ...([
              ["Demanda Mental", psa.nasa_tlx_details.mental_demand],
              ["Demanda Física", psa.nasa_tlx_details.physical_demand],
              ["Demanda Temporal", psa.nasa_tlx_details.temporal_demand],
              ["Performance", psa.nasa_tlx_details.performance],
              ["Esforço", psa.nasa_tlx_details.effort],
              ["Frustração", psa.nasa_tlx_details.frustration],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), false, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.nasa_tlx_score), true, 40)] }),
          ],
        }));
      }
    });
  } else {
    children.push(accentCallout("Nenhuma avaliação psicossocial realizada. Recomenda-se aplicação dos questionários COPSOQ II, NASA-TLX e HSE-IT.", "warning"));
  }

  // 11. RESPONSABILIDADE TÉCNICA
  children.push(heading("11. RESPONSABILIDADE TÉCNICA"));
  children.push(body("O presente documento foi elaborado sob a responsabilidade técnica da MG CONSULT."));
  children.push(body(`${company.city}, ${getToday()}.`));
  children.push(...signatureBlock(consultant, "M.Sc Eng. de Produção (Ergonomia) / Eng. de Segurança do Trabalho"));
  children.push(pageBreak());

  // 12. ANEXOS
  children.push(heading("12. ANEXOS"));
  ["ANEXO I — Avaliação Ergonômica Preliminar (AEP)", "ANEXO II — Ferramentas e Métodos Aplicados",
   "ANEXO III — Relatório Técnico de Fatores Psicossociais", "ANEXO IV — Plano de Ação Ergonômico",
   "ANEXO V — Registro Fotográfico", "ANEXO VI — Checklist de Conformidade NR-17",
  ].forEach(t => children.push(bulletItem(t)));
  children.push(pageBreak());

  // ANEXO I — AEP
  children.push(heading("ANEXO I — AVALIAÇÃO ERGONÔMICA PRELIMINAR (AEP)"));
  children.push(body("A Avaliação Ergonômica Preliminar (AEP) tem como objetivo identificar os perigos ergonômicos de forma inicial, servindo como triagem para a AET detalhada. Conforme a NR-17, a AEP é obrigatória para todas as organizações."));
  workstations.forEach((ws, idx) => {
    const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
    const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
    const wsRisks = risks.filter(r => wsAnalyses.some(a => a.id === r.analysis_id));
    const sectorObj = ws.sector || sector || sectors.find(s => s.id === ws.sector_id);

    children.push(sectionBanner(`AEP ${String(idx + 1).padStart(2, '0')} — ${ws.name}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [labelCell("Posto de Trabalho", 30), textCell(ws.name, false, 70)] }),
        new TableRow({ children: [labelCell("Setor", 30), textCell((sectorObj as any)?.name || "Geral", false, 70)] }),
        new TableRow({ children: [labelCell("Descrição da Atividade", 30), textCell(ws.activity_description || ws.description, false, 70)] }),
        new TableRow({ children: [labelCell("Tarefas Executadas", 30), textCell(ws.tasks_performed || "—", false, 70)] }),
        new TableRow({ children: [labelCell("Fotos Capturadas", 30), textCell(String(wsPhotos.length), false, 70)] }),
      ],
    }));

    if (wsAnalyses.length > 0) {
      children.push(heading("Resultados da Avaliação", HeadingLevel.HEADING_3));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Método", 25), headerCell("Score", 15), headerCell("Status", 25), headerCell("Observações", 35)] }),
          ...wsAnalyses.map(a => new TableRow({
            children: [textCell(a.method, false, 25), textCell(String(a.score), true, 15), textCell(a.analysis_status, false, 25), textCell(a.notes || "—", false, 35)],
          })),
        ],
      }));
    } else {
      children.push(accentCallout("Nenhuma análise ergonômica realizada para este posto.", "warning"));
    }

    if (wsRisks.length > 0) {
      children.push(heading("Riscos Ergonômicos Identificados", HeadingLevel.HEADING_3));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Descrição", 35), headerCell("P×E×C", 20), headerCell("Score", 20), headerCell("Nível", 25)] }),
          ...wsRisks.map(r => new TableRow({
            children: [textCell(r.description, false, 35), textCell(`${r.probability}×${r.exposure}×${r.consequence}`, false, 20), textCell(String(r.risk_score), true, 20), textCell(riskLevelLabel(r.risk_level), true, 25)],
          })),
        ],
      }));
    }

    if (wsPhotos.length > 0) {
      children.push(heading("Registro Postural", HeadingLevel.HEADING_3));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Postura", 30), headerCell("Observações", 50), headerCell("Data", 20)] }),
          ...wsPhotos.map(p => new TableRow({
            children: [textCell(p.posture_type, true, 30), textCell(p.notes || "—", false, 50), textCell(p.created_at, false, 20)],
          })),
        ],
      }));
    }
  });
  children.push(pageBreak());

  // ANEXO II — FERRAMENTAS E MÉTODOS
  children.push(heading("ANEXO II — FERRAMENTAS E MÉTODOS APLICADOS"));
  children.push(body("Os seguintes métodos ergonômicos validados internacionalmente foram empregados na avaliação:"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Método", 15), headerCell("Aplicação", 45), headerCell("Classificação de Risco", 40)] }),
      new TableRow({ children: [labelCell("REBA", 15), textCell("Corpo inteiro — posturas dinâmicas", false, 45), textCell("1-3 Baixo | 4-7 Médio | 8-10 Alto | 11+ Muito Alto", false, 40)] }),
      new TableRow({ children: [labelCell("RULA", 15), textCell("Membros superiores", false, 45), textCell("1-2 Aceitável | 3-4 Investigar | 5-6 Mudar breve | 7 Imediato", false, 40)] }),
      new TableRow({ children: [labelCell("ROSA", 15), textCell("Postos administrativos", false, 45), textCell("1-2 Desprezível | 3-4 Baixo | 5-6 Médio | 7+ Alto", false, 40)] }),
      new TableRow({ children: [labelCell("OWAS", 15), textCell("Posturas de trabalho", false, 45), textCell("1 Normal | 2 Leve | 3 Severo | 4 Muito severo", false, 40)] }),
      new TableRow({ children: [labelCell("OCRA", 15), textCell("Movimentos repetitivos MMSS", false, 45), textCell("≤2.2 Aceitável | 2.3-3.5 Incerto | >3.5 Inaceitável", false, 40)] }),
      new TableRow({ children: [labelCell("ANSI-365", 15), textCell("Análise integrada de fatores ergonômicos", false, 45), textCell("Classificação multifatorial", false, 40)] }),
    ],
  }));
  children.push(heading("Equipamentos Utilizados para Medição", HeadingLevel.HEADING_3));
  children.push(equipmentTable());
  children.push(pageBreak());

  // ANEXO III — PSICOSSOCIAL
  children.push(heading("ANEXO III — RELATÓRIO TÉCNICO DE FATORES PSICOSSOCIAIS"));
  if (psychosocial.length > 0) {
    children.push(body(`Avaliações psicossociais realizadas: ${psychosocial.length}`, { bold: true }));
    psychosocial.forEach((psa, idx) => {
      children.push(sectionBanner(`Avaliação ${idx + 1} — ${psa.evaluator_name}`, COLORS.headerBg2));
      if (psa.nasa_tlx_details) {
        children.push(heading("NASA-TLX (Carga de Trabalho)", HeadingLevel.HEADING_3));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell2("Dimensão", 60), headerCell2("Score (0-100)", 40)] }),
            ...([
              ["Demanda Mental", psa.nasa_tlx_details.mental_demand], ["Demanda Física", psa.nasa_tlx_details.physical_demand],
              ["Demanda Temporal", psa.nasa_tlx_details.temporal_demand], ["Performance", psa.nasa_tlx_details.performance],
              ["Esforço", psa.nasa_tlx_details.effort], ["Frustração", psa.nasa_tlx_details.frustration],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), false, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.nasa_tlx_score), true, 40)] }),
          ],
        }));
      }
      if (psa.hse_it_details) {
        children.push(heading("HSE-IT (Estresse Ocupacional)", HeadingLevel.HEADING_3));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Dimensão", 60), headerCell3("Score (1-5)", 40)] }),
            ...([
              ["Demandas", psa.hse_it_details.demands], ["Controle", psa.hse_it_details.control],
              ["Suporte", psa.hse_it_details.support], ["Relacionamentos", psa.hse_it_details.relationships],
              ["Papel", psa.hse_it_details.role], ["Mudança", psa.hse_it_details.change],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), false, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.hse_it_score), true, 40)] }),
          ],
        }));
      }
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        children.push(heading("COPSOQ II (Copenhagen)", HeadingLevel.HEADING_3));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Dimensão", 60), headerCell3("Score (0-100)", 40)] }),
            ...([
              ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace],
              ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands],
              ["Influência", cd.influence], ["Desenvolvimento", cd.possibilities_development],
              ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment],
              ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), true, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.copenhagen_score), true, 40)] }),
          ],
        }));
      }
      if (psa.observations) children.push(accentCallout(psa.observations, "info"));
    });
  } else {
    children.push(accentCallout("Nenhuma avaliação psicossocial registrada. Recomenda-se aplicação dos questionários COPSOQ II, NASA-TLX, HSE-IT e JSS.", "warning"));
  }
  children.push(pageBreak());

  // ANEXO IV — PLANO DE AÇÃO
  children.push(heading("ANEXO IV — PLANO DE AÇÃO ERGONÔMICO"));
  if (actions.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Nº", 8), headerCell("Ação Corretiva / Preventiva", 32), headerCell("Responsável", 20), headerCell("Prazo", 20), headerCell("Status", 20)] }),
        ...actions.map((ap, i) => new TableRow({
          children: [textCell(String(i + 1), false, 8), textCell(ap.description, false, 32), textCell(ap.responsible, false, 20), textCell(ap.deadline, false, 20), textCell(statusLabel(ap.status), false, 20)],
        })),
      ],
    }));
  } else {
    children.push(accentCallout("Nenhum plano de ação registrado.", "warning"));
  }
  children.push(pageBreak());

  // ANEXO V — REGISTRO FOTOGRÁFICO
  children.push(heading("ANEXO V — REGISTRO FOTOGRÁFICO"));
  if (photos.length > 0) {
    children.push(body(`Total de registros fotográficos: ${photos.length}`, { bold: true }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Nº", 8), headerCell("Posto", 25), headerCell("Tipo de Postura", 22), headerCell("Observações", 30), headerCell("Data", 15)] }),
        ...photos.map((p, i) => {
          const ws = workstations.find(w => w.id === p.workstation_id);
          return new TableRow({
            children: [textCell(String(i + 1), false, 8), textCell(ws?.name || "—", false, 25), textCell(p.posture_type, false, 22), textCell(p.notes || "—", false, 30), textCell(p.created_at, false, 15)],
          });
        }),
      ],
    }));
  } else {
    children.push(accentCallout("Nenhum registro fotográfico disponível.", "warning"));
  }
  children.push(pageBreak());

  // ANEXO VI — CHECKLIST NR-17
  children.push(heading("ANEXO VI — CHECKLIST DE CONFORMIDADE NR-17"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Item", 10), headerCell("Requisito NR-17", 40), headerCell("Conforme", 20), headerCell("Observações", 30)] }),
      new TableRow({ children: [textCell("17.1", false, 10), textCell("AEP realizada para todos os postos", false, 40), textCell(workstations.length > 0 && analyses.length > 0 ? "✓ Sim" : "✗ Não", false, 20), textCell(`${analyses.length} análise(s) em ${workstations.length} posto(s)`, false, 30)] }),
      new TableRow({ children: [textCell("17.2", false, 10), textCell("Mobiliário adequado", false, 40), textCell("A verificar", false, 20), textCell("Avaliar in loco", false, 30)] }),
      new TableRow({ children: [textCell("17.3", false, 10), textCell("Equipamentos adequados", false, 40), textCell("A verificar", false, 20), textCell("Avaliar in loco", false, 30)] }),
      new TableRow({ children: [textCell("17.4", false, 10), textCell("Condições ambientais (iluminação, ruído, temperatura)", false, 40), textCell("A verificar", false, 20), textCell("Medições quantitativas recomendadas", false, 30)] }),
      new TableRow({ children: [textCell("17.5", false, 10), textCell("Organização do trabalho", false, 40), textCell("A verificar", false, 20), textCell("Pausas, ritmo, jornada", false, 30)] }),
      new TableRow({ children: [textCell("17.6", false, 10), textCell("Levantamento e transporte de cargas", false, 40), textCell("A verificar", false, 20), textCell("ISO 11228", false, 30)] }),
      new TableRow({ children: [textCell("17.7", false, 10), textCell("Trabalho com máquinas e equipamentos", false, 40), textCell("A verificar", false, 20), textCell("NR-12", false, 30)] }),
      new TableRow({ children: [textCell("17.8", false, 10), textCell("Fatores psicossociais avaliados", false, 40), textCell(psychosocial.length > 0 ? "✓ Sim" : "✗ Não", false, 20), textCell(`${psychosocial.length} avaliação(ões)`, false, 30)] }),
    ],
  }));

  children.push(footer());
  return createDocumentShell("Análise Ergonômica do Trabalho", company.name, "AET", children);
}

// ========== PGR REPORT — Matches HTML preview ==========
function generatePGRDocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const { consultant, risks, actions, tasks, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("PROGRAMA DE GERENCIAMENTO DE RISCOS", "PGR", company, consultant));
  children.push(...revisionTable());

  // 1. Definições
  children.push(heading("1. DEFINIÇÕES E ABREVIATURAS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Termo", 25), headerCell("Definição", 75)] }),
      ...([["GHE", "Grupo Homogêneo de Exposição"], ["GRO", "Gerenciamento de Riscos Ocupacionais"], ["PGR", "Programa de Gerenciamento de Riscos"],
        ["EPC", "Equipamento de Proteção Coletiva"], ["EPI", "Equipamento de Proteção Individual"],
        ["SESMT", "Serviço Especializado em Segurança e Medicina do Trabalho"], ["CIPA", "Comissão Interna de Prevenção de Acidentes"],
      ]).map(([t, d]) => new TableRow({ children: [labelCell(t, 25), textCell(d, false, 75)] })),
    ],
  }));

  // 2. Referências
  children.push(heading("2. REFERÊNCIAS"));
  ["NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais", "NR-09 — Avaliação e Controle das Exposições Ocupacionais",
   "NR-15 — Atividades e Operações Insalubres", "NR-17 — Ergonomia",
   "ABNT NBR ISO 31000:2009 — Gestão de Riscos", "FUNDACENTRO — NHO 01, NHO 06, NHO 11",
  ].forEach(r => children.push(bulletItem(r)));

  // 3. Identificação
  children.push(heading("3. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(companyDataTable(company));

  // 4. Responsabilidade técnica
  children.push(heading("4. RESPONSABILIDADE TÉCNICA"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [labelCell("Responsável Técnico", 35), textCell(consultant, false, 65)] }),
      new TableRow({ children: [labelCell("Título Profissional", 35), textCell("Engenheiro de Segurança do Trabalho", false, 65)] }),
      new TableRow({ children: [labelCell("Registro", 35), textCell("CREA/CONFEA: XXXXX", false, 65)] }),
      new TableRow({ children: [labelCell("Período de Avaliação", 35), textCell(getToday(), false, 65)] }),
    ],
  }));

  // 5-8
  children.push(heading("5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO"));
  children.push(body("Ao aprovar o PGR, a empresa compromete-se a cumprir rigorosamente o que nele consta, sua efetiva implementação, bem como zelar pela sua eficácia."));

  children.push(heading("6. INTRODUÇÃO"));
  children.push(body("A elaboração deste Programa de Gerenciamento de Riscos tem como propósito um estudo das condições ambientais atuais existentes nesta empresa, a fim de identificar os agentes de riscos e caracterizar as atividades e operações desenvolvidas."));

  children.push(heading("7. OBJETIVOS"));
  children.push(heading("7.1 Objetivo Geral", HeadingLevel.HEADING_3));
  children.push(body("Preservar a saúde e a integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e controle dos riscos ambientais."));
  children.push(heading("7.2 Objetivos Específicos", HeadingLevel.HEADING_3));
  ["Seguir a política da empresa relacionada à saúde e segurança;", "Proteção do meio ambiente e dos recursos naturais;",
   "Tratar os riscos ambientais existentes ou que venham a existir;", "Planejar ações para preservar a saúde e a segurança dos trabalhadores.",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("8. CAMPO DE APLICAÇÃO"));
  children.push(body("Este programa é aplicado a toda organização, estabelecimentos, canteiros de obras e/ou frentes de serviços."));

  // 9. Metodologia
  children.push(heading("9. METODOLOGIA UTILIZADA"));
  children.push(heading("9.1 Análise Qualitativa", HeadingLevel.HEADING_3));
  children.push(body("Análise preliminar e reconhecimento dos riscos ambientais, identificando perigos, fontes geradoras, exposição e medidas de controle existentes."));
  children.push(heading("9.2 Análise Quantitativa", HeadingLevel.HEADING_3));
  children.push(equipmentTable());
  children.push(heading("9.3 Critérios de Risco — Probabilidade (P) × Gravidade (G)", HeadingLevel.HEADING_3));
  children.push(riskMatrixTable());
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Nível de Risco", 25), headerCell("Ação Requerida", 45), headerCell("Prazo", 30)] }),
      new TableRow({ children: [statusCell("Crítico", "red", 25), textCell("Ações corretivas imediatas", false, 45), textCell("Imediato", false, 30)] }),
      new TableRow({ children: [statusCell("Alto", "orange", 25), textCell("Planejamento a curto prazo", false, 45), textCell("3 meses", false, 30)] }),
      new TableRow({ children: [statusCell("Médio", "yellow", 25), textCell("Planejamento a médio/longo prazo", false, 45), textCell("6 meses", false, 30)] }),
      new TableRow({ children: [statusCell("Baixo", "green", 25), textCell("Manter controle existente", false, 45), textCell("1 ano", false, 30)] }),
      new TableRow({ children: [textCell("Irrelevante", true, 25), textCell("Não requer nova ação", false, 45), textCell("N/A", false, 30)] }),
    ],
  }));
  children.push(pageBreak());

  // 10. Inventário de risco
  children.push(heading("10. INVENTÁRIO DE RISCO"));
  sectorMap.forEach(({ sectorName, workstations: sectorWs }, gheIndex) => {
    children.push(sectionBanner(`GHE ${String(Array.from(sectorMap.keys()).indexOf(gheIndex as any) + 1).padStart(2, '0')} / SETOR — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(body(`Postos: ${sectorWs.map(w => w.name).join(", ")}`, { bold: true }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Posto/Função", 35), headerCell("Descrição das Atividades", 65)] }),
        ...sectorWs.map(ws => {
          const wt = tasks.filter(t => t.workstation_id === ws.id);
          return new TableRow({ children: [textCell(ws.name, true, 35), textCell(wt.map(t => t.description).join("; ") || ws.tasks_performed || ws.activity_description, false, 65)] });
        }),
      ],
    }));
    const wsRisks = risks.filter(r => {
      const a = analyses.find(an => an.id === r.analysis_id);
      return a && sectorWs.some(w => w.id === a.workstation_id);
    });
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Agente/Perigo", 20), headerCell("Possíveis Danos", 20), headerCell("P", 10), headerCell("G", 10), headerCell("NR", 10), headerCell("Medidas de Controle", 30)] }),
        ...(wsRisks.length > 0 ? wsRisks.map(r => {
          const a = analyses.find(an => an.id === r.analysis_id);
          const ws = a ? sectorWs.find(w => w.id === a.workstation_id) : null;
          return new TableRow({
            children: [textCell(r.description, false, 20), textCell(ws?.name || "—", false, 20), textCell(String(r.probability), false, 10), textCell(String(r.consequence), false, 10), textCell(riskLevelLabel(r.risk_level).charAt(0), false, 10), textCell(mockActionPlans.filter(ap => ap.risk_assessment_id === r.id).map(ap => ap.description).join("; ") || "N.I.", false, 30)],
          });
        }) : [new TableRow({ children: [mergedCell("Nenhum risco identificado para este setor", 6)] })]),
      ],
    }));
  });

  // 11. Implementação
  children.push(heading("11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO"));
  if (actions.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Meta / Ação", 30), headerCell("Responsável", 25), headerCell("Prazo", 20), headerCell("Status", 25)] }),
        ...actions.map(ap => new TableRow({
          children: [textCell(ap.description, false, 30), textCell(ap.responsible, false, 25), textCell(ap.deadline, false, 20), textCell(statusLabel(ap.status), false, 25)],
        })),
      ],
    }));
  } else {
    children.push(body("Nenhuma ação registrada."));
  }

  // 12-15
  children.push(heading("12. EPC — EQUIPAMENTO DE PROTEÇÃO COLETIVA"));
  children.push(body("Medidas que eliminam ou reduzam a utilização ou a formação de agentes prejudiciais, previnam a liberação e reduzam os níveis no ambiente de trabalho."));

  children.push(heading("13. EPI — EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL"));
  children.push(body("Dispositivo de uso individual destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho, conforme NR-06."));

  children.push(heading("14. RESPONSABILIDADES"));
  children.push(body("Empregador: Estabelecer, implantar e assegurar o cumprimento do PGR. Informar os trabalhadores sobre os riscos.", { bold: true }));
  children.push(body("SESMT: Executar, coordenar e monitorar as etapas do programa. Manter arquivado por 20 anos.", { bold: true }));

  children.push(heading("15. META E OBJETIVOS"));
  ["Reduzir em 20% os riscos classificados como \"Alto\" ou \"Crítico\"",
   "Garantir treinamento a 100% dos trabalhadores expostos",
   "Implementar todas as ações do Plano de Ação dentro dos prazos",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("16. REFERÊNCIAS BIBLIOGRÁFICAS"));
  ["BRASIL. Normas Regulamentadoras (NR) — MTE", "ABNT NBR ISO 31000:2009 — Gestão de Riscos",
   "BS 8800:1996 — Guide to OHS Management Systems", "MULHAUSEN & DAMIANO (1998) — AIHA Strategy for Exposure Assessment",
   "FUNDACENTRO — NHO 01, NHO 06, NHO 11",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("Programa de Gerenciamento de Riscos", company.name, "PGR", children);
}

// ========== APR REPORT — Matches HTML preview ==========
function generateAPRDocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors } = ctx;
  const { consultant, psychosocial, sectorMap } = getCtxData(ctx);
  const sectorNames = [...new Set(workstations.map(w => w.sector?.name || sectors.find(s => s.id === w.sector_id)?.name || "Geral"))];

  const children: any[] = [];
  children.push(...createCoverPage("AVALIAÇÃO PRELIMINAR DE RISCOS PSICOSSOCIAIS", "APR — FRPRT", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. INFORMAÇÕES CADASTRAIS DA ORGANIZAÇÃO"));
  children.push(companyDataTable(company));

  children.push(heading("2. OBJETIVO"));
  children.push(accentCallout("A avaliação dos fatores de risco psicossociais é fundamental para a promoção da saúde mental no trabalho e cumprimento da NR-01.", "info"));
  children.push(body("Apresentar os resultados da Avaliação Preliminar de Fatores de Risco Psicossociais Relacionados ao Trabalho (FRPRT), conforme NR-01, articulada com o PGR e PCMSO da empresa."));

  children.push(heading("3. METODOLOGIA"));
  children.push(heading("3.1 Metodologia de Avaliação", HeadingLevel.HEADING_3));
  children.push(body("Metodologia baseada no COPSOQ II (Copenhagen Psychosocial Questionnaire), NASA-TLX (Índice de Carga de Trabalho) e HSE-IT (Health and Safety Executive)."));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Faixa de Score", 30), headerCell3("Classificação", 30), headerCell3("Ação Recomendada", 40)] }),
      new TableRow({ children: [shadedCell("0 a 49", COLORS.redBg, true, 30), textCell("Alto Risco", false, 30), textCell("Intervenção imediata requerida", false, 40)] }),
      new TableRow({ children: [shadedCell("50 a 74", COLORS.yellowBg, true, 30), textCell("Moderado", false, 30), textCell("Monitoramento e ações preventivas", false, 40)] }),
      new TableRow({ children: [shadedCell("75 a 100", COLORS.greenBg, true, 30), textCell("Baixo Risco", false, 30), textCell("Manter práticas existentes", false, 40)] }),
    ],
  }));
  children.push(heading("3.2 Critérios de Avaliação de Risco (PGR)", HeadingLevel.HEADING_3));
  children.push(riskMatrixTable());

  children.push(heading("4. AMOSTRA"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [labelCell("Setores Avaliados", 40), textCell(sectorNames.join(", "), false, 60)] }),
      new TableRow({ children: [labelCell("Postos de Trabalho", 40), textCell(String(workstations.length), false, 60)] }),
      new TableRow({ children: [labelCell("Avaliações Realizadas", 40), textCell(String(psychosocial.length), false, 60)] }),
      new TableRow({ children: [labelCell("Período", 40), textCell(getToday(), false, 60)] }),
    ],
  }));

  children.push(heading("5. RESULTADOS"));
  if (psychosocial.length > 0) {
    psychosocial.forEach(psa => {
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        const classify = (v: number) => v >= 75 ? "Baixo risco" : v >= 50 ? "Moderado" : "Alto risco";
        const riskColor = (v: number) => v >= 75 ? COLORS.greenBg : v >= 50 ? COLORS.yellowBg : COLORS.redBg;
        children.push(sectionBanner("COPSOQ II — Resultados por Domínio", COLORS.headerBg2));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Domínio Psicossocial", 40), headerCell3("Score", 20), headerCell3("Classificação", 40)] }),
            ...([
              ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace],
              ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands],
              ["Influência no Trabalho", cd.influence], ["Possibilidades de Desenvolvimento", cd.possibilities_development],
              ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment],
              ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support],
            ] as [string, number][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(dim, false, 40), textCell(String(val), true, 20), shadedCell(classify(val), riskColor(val), true, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Global", 40), textCell(String(psa.copenhagen_score), true, 20), shadedCell(classify(psa.copenhagen_score || 0), riskColor(psa.copenhagen_score || 0), true, 40)] }),
          ],
        }));
      }
      if (psa.nasa_tlx_details) {
        children.push(sectionBanner("NASA-TLX — Índice de Carga de Trabalho", COLORS.headerBg2));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell2("Dimensão", 60), headerCell2("Score (0-100)", 40)] }),
            ...([
              ["Demanda Mental", psa.nasa_tlx_details.mental_demand], ["Demanda Física", psa.nasa_tlx_details.physical_demand],
              ["Demanda Temporal", psa.nasa_tlx_details.temporal_demand], ["Performance", psa.nasa_tlx_details.performance],
              ["Esforço", psa.nasa_tlx_details.effort], ["Frustração", psa.nasa_tlx_details.frustration],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), false, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.nasa_tlx_score), true, 40)] }),
          ],
        }));
      }
      if (psa.hse_it_details) {
        children.push(sectionBanner("HSE-IT — Indicadores de Estresse Ocupacional", COLORS.headerBg2));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell2("Dimensão", 60), headerCell2("Score", 40)] }),
            ...([
              ["Demandas", psa.hse_it_details.demands], ["Controle", psa.hse_it_details.control],
              ["Suporte", psa.hse_it_details.support], ["Relacionamentos", psa.hse_it_details.relationships],
              ["Papel", psa.hse_it_details.role], ["Mudança", psa.hse_it_details.change],
            ] as [string, number][]).map(([d, v]) =>
              new TableRow({ children: [textCell(d, false, 60), textCell(String(v), false, 40)] })
            ),
            new TableRow({ children: [labelCell("Score Geral", 60), textCell(String(psa.hse_it_score), true, 40)] }),
          ],
        }));
      }
      children.push(body(`Observações: ${psa.observations}`, { bold: true }));
    });
  } else {
    children.push(accentCallout("Nenhuma avaliação psicossocial encontrada. Recomenda-se aplicação urgente dos questionários COPSOQ II, NASA-TLX e HSE-IT.", "danger"));
  }

  children.push(heading("6. RECOMENDAÇÕES TÉCNICAS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Ação", 25), headerCell3("Detalhamento", 40), headerCell3("Prazo", 15), headerCell3("Prioridade", 20)] }),
      new TableRow({ children: [textCell("Gestão de Estresse", true, 25), textCell("Capacitação sobre técnicas de manejo do estresse ocupacional", false, 40), textCell("60 dias", false, 15), shadedCell("Média", COLORS.yellowBg, true, 20)] }),
      new TableRow({ children: [textCell("Adequação da Carga", true, 25), textCell("Reorganizar tarefas nos setores com alto risco psicossocial", false, 40), textCell("45 dias", false, 15), shadedCell("Alta", COLORS.orangeBg, true, 20)] }),
      new TableRow({ children: [textCell("Canal de Feedback", true, 25), textCell("Implantar canais contínuos de relato de condições", false, 40), textCell("30 dias", false, 15), shadedCell("Alta", COLORS.orangeBg, true, 20)] }),
      new TableRow({ children: [textCell("Avaliações Periódicas", true, 25), textCell("Novas avaliações semestrais conforme NR-01", false, 40), textCell("6 meses", false, 15), shadedCell("Média", COLORS.yellowBg, true, 20)] }),
    ],
  }));

  children.push(heading("7. PLANO DE AÇÃO E MELHORIA"));
  children.push(accentCallout("O plano de ação deve ser revisado periodicamente conforme NR-01 e integrado ao PGR da empresa.", "info"));

  children.push(heading("8. CONSIDERAÇÕES FINAIS"));
  children.push(body(`A implementação das ações recomendadas contribuirá significativamente para a redução dos riscos psicossociais e promoção da saúde mental no ambiente de trabalho da ${company.trade_name || company.name}.`));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("Avaliação Preliminar de Riscos Psicossociais", company.name, "APR", children);
}

// ========== PCMSO REPORT — Matches HTML preview ==========
function generatePCMSODocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);
  const medico = ctx.consultantName || "Médico do Trabalho";

  const children: any[] = [];
  children.push(...createCoverPage("PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL", "PCMSO", company, medico));
  children.push(...revisionTable());

  children.push(heading("1. DEFINIÇÕES E ABREVIATURAS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Termo", 25), headerCell("Definição", 75)] }),
      ...([["ASO", "Atestado de Saúde Ocupacional"], ["PCMSO", "Programa de Controle Médico de Saúde Ocupacional"],
        ["PGR", "Programa de Gerenciamento de Riscos"], ["GHE", "Grupos Homogêneos de Exposição"],
        ["PAIR", "Perda Auditiva Induzida por Ruído"], ["LER/DORT", "Lesão por Esforço Repetitivo / Distúrbio Osteomuscular"],
      ]).map(([t, d]) => new TableRow({ children: [labelCell(t, 25), textCell(d, false, 75)] })),
    ],
  }));

  children.push(heading("2. REFERÊNCIAS"));
  ["NR-07 — Programa de Controle Médico de Saúde Ocupacional", "NR-09 — Avaliação e Controle das Exposições Ocupacionais",
   "NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais", "Portaria nº 19/1998 — Diretrizes e parâmetros para audiometria",
  ].forEach(r => children.push(bulletItem(r)));

  children.push(heading("3. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("4. INTRODUÇÃO"));
  children.push(accentCallout("O PCMSO é um programa de caráter preventivo, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.", "info"));
  children.push(body("Tem como finalidade a promoção e preservação da saúde do conjunto dos trabalhadores, planejado com base nos riscos identificados no PGR."));

  children.push(heading("5. OBJETIVOS"));
  children.push(heading("5.1 Objetivo Geral", HeadingLevel.HEADING_3));
  children.push(body("Promoção e preservação da saúde dos trabalhadores, através da prevenção, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho."));
  children.push(heading("5.2 Objetivos Específicos", HeadingLevel.HEADING_3));
  ["Definir exames médicos ocupacionais obrigatórios por função/risco", "Estabelecer critérios para exames complementares",
   "Monitorar a saúde dos trabalhadores expostos a riscos ocupacionais", "Subsidiar ações de prevenção e promoção da saúde",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("6. MÉDICO RESPONSÁVEL"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [labelCell("Médico Coordenador", 35), textCell(medico, false, 65)] }),
      new TableRow({ children: [labelCell("Especialidade", 35), textCell("Medicina do Trabalho", false, 65)] }),
      new TableRow({ children: [labelCell("CRM", 35), textCell("XXXXX", false, 65)] }),
      new TableRow({ children: [labelCell("Vigência", 35), textCell(`${getToday()} a ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}`, false, 65)] }),
    ],
  }));

  children.push(heading("7. RESPONSABILIDADES"));
  children.push(heading("7.1 Do Empregador", HeadingLevel.HEADING_3));
  ["Garantir a elaboração e efetiva implementação do PCMSO", "Custear todos os procedimentos relacionados ao PCMSO", "Indicar médico do trabalho responsável"].forEach(t => children.push(bulletItem(t)));
  children.push(heading("7.2 Dos Empregados", HeadingLevel.HEADING_3));
  ["Submeter-se aos exames médicos previstos", "Colaborar com a empresa na aplicação do PCMSO"].forEach(t => children.push(bulletItem(t)));

  children.push(heading("8. EXAMES MÉDICOS OCUPACIONAIS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell2("Tipo de Exame", 30), headerCell2("Momento", 40), headerCell2("Prazo", 30)] }),
      new TableRow({ children: [textCell("Admissional", true, 30), textCell("Antes do início das atividades", false, 40), textCell("Antes da admissão", false, 30)] }),
      new TableRow({ children: [textCell("Periódico", true, 30), textCell("Durante a vigência do contrato", false, 40), textCell("Anual ou conforme risco", false, 30)] }),
      new TableRow({ children: [textCell("Retorno ao Trabalho", true, 30), textCell("Após afastamento ≥ 30 dias", false, 40), textCell("1º dia de retorno", false, 30)] }),
      new TableRow({ children: [textCell("Mudança de Risco", true, 30), textCell("Ao alterar função/setor", false, 40), textCell("Antes da mudança", false, 30)] }),
      new TableRow({ children: [textCell("Demissional", true, 30), textCell("No desligamento", false, 40), textCell("Até 10 dias antes", false, 30)] }),
    ],
  }));

  children.push(heading("9. QUADRO DE RISCOS E EXAMES POR GHE"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    const wsRisks = risks.filter(r => {
      const a = analyses.find(an => an.id === r.analysis_id);
      return a && sectorWs.some(w => w.id === a.workstation_id);
    });
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 25), headerCell("Risco", 25), headerCell("Exames", 30), headerCell("Periodicidade", 20)] }),
        ...sectorWs.map(ws => {
          const wr = wsRisks.filter(r => { const a = analyses.find(an => an.id === r.analysis_id); return a && a.workstation_id === ws.id; });
          return new TableRow({
            children: [textCell(ws.name, true, 25), textCell(wr.map(r => r.description).join(", ") || "Ergonômico", false, 25), textCell("Clínico + complementares conforme risco", false, 30), textCell("Anual", false, 20)],
          });
        }),
      ],
    }));
  });

  children.push(heading("10. CONCLUSÃO"));
  children.push(body("O presente PCMSO foi elaborado com base nos riscos ocupacionais identificados no PGR. Sua efetiva implementação contribuirá para a promoção e preservação da saúde dos colaboradores."));
  children.push(accentCallout("O PCMSO deve ser revisado anualmente ou sempre que houver alteração nos riscos ocupacionais.", "info"));

  children.push(...signatureBlock(medico, "Médico do Trabalho", "CRM: XXXXX"));
  children.push(footer());
  return createDocumentShell("PCMSO", company.name, "PCMSO", children);
}

// ========== LTCAT REPORT — Matches HTML preview ==========
function generateLTCATDocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS DE TRABALHO", "LTCAT", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. INTRODUÇÃO"));
  children.push(body(`O LTCAT tem por objetivo documentar tecnicamente as condições ambientais de trabalho na empresa ${company.trade_name || company.name}, em cumprimento ao artigo 58 da Lei 8.213/91 e IN INSS/PRES 77/2015.`));

  children.push(heading("3. OBJETIVOS"));
  children.push(bulletItem("Documentar as condições ambientais de trabalho"));
  children.push(bulletItem("Identificar agentes nocivos à saúde dos trabalhadores"));
  children.push(bulletItem("Subsidiar a emissão do PPP (Perfil Profissiográfico Previdenciário)"));
  children.push(bulletItem("Verificar o enquadramento para aposentadoria especial"));

  children.push(heading("4. RESPONSABILIDADE TÉCNICA"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [labelCell("Responsável Técnico", 35), textCell(consultant, false, 65)] }),
      new TableRow({ children: [labelCell("Registro", 35), textCell("CREA/CONFEA: XXXXX", false, 65)] }),
      new TableRow({ children: [labelCell("Data", 35), textCell(getToday(), false, 65)] }),
    ],
  }));

  children.push(heading("5. FUNDAMENTAÇÃO LEGAL"));
  ["Lei 8.213/91 — Planos de Benefícios da Previdência Social", "Decreto 3.048/99 — Regulamento da Previdência Social",
   "IN INSS/PRES 77/2015 — Instruções Normativas", "NR-15 — Atividades e Operações Insalubres", "NR-09 — Avaliação e Controle das Exposições Ocupacionais",
  ].forEach(r => children.push(bulletItem(r)));

  children.push(heading("6. CRITÉRIOS TÉCNICOS"));
  children.push(equipmentTable());

  children.push(heading("7. DESCRIÇÃO DOS SETORES"));
  children.push(body(`A empresa possui ${sectors.length} setores e ${workstations.length} postos de trabalho avaliados.`));

  children.push(heading("8. MEDIÇÕES AMBIENTAIS"));
  children.push(body("Medições realizadas conforme NHO-01, NHO-06, NHO-08, NHO-11 e ACGIH."));

  children.push(heading("9. AVALIAÇÕES DAS CONDIÇÕES AMBIENTAIS"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 15), headerCell("Agente Nocivo", 15), headerCell("Intensidade", 15), headerCell("LT (NR-15)", 13), headerCell("Tempo Exposição", 14), headerCell("EPI Eficaz", 13), headerCell("Apos. Especial", 15)] }),
        ...sectorWs.map(ws => {
          const wsRisks = risks.filter(r => {
            const a = analyses.find(a2 => a2.id === r.analysis_id);
            return a && a.workstation_id === ws.id;
          });
          if (wsRisks.length === 0) {
            return new TableRow({ children: [textCell(ws.name, false, 15), mergedCell("Sem exposição a agentes nocivos acima dos limites de tolerância", 6)] });
          }
          return new TableRow({
            children: [textCell(ws.name, false, 15), textCell(wsRisks.map(r => r.description).join(", "), false, 15), textCell("A avaliar", false, 15), textCell("NR-15", false, 13), textCell("Habitual e permanente", false, 14), textCell("Sim", false, 13), textCell("Não enquadrado", false, 15)],
          });
        }),
      ],
    }));
  });

  children.push(heading("10. CONCLUSÃO"));
  children.push(body(`Com base nas avaliações realizadas, os trabalhadores da empresa ${company.trade_name || company.name} estão expostos aos agentes descritos nas tabelas acima. As medidas de controle existentes são adequadas para neutralizar/reduzir a exposição aos agentes nocivos identificados.`));
  children.push(accentCallout("O LTCAT deve ser atualizado sempre que houver mudança nas condições ambientais de trabalho ou nos processos produtivos.", "info"));

  children.push(heading("ANEXOS"));
  ["Anexo I — Equipamentos de Medição e Certificados de Calibração", "Anexo II — Avaliações de Ruído/Químico", "Anexo III — Habilitação do Responsável Técnico e ART"].forEach(t => children.push(bulletItem(t)));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("LTCAT", company.name, "LTCAT", children);
}

// ========== INSALUBRIDADE REPORT — Matches HTML preview ==========
function generateInsalubridadeDocx(ctx: DocxReportContext): Document {
  const { company, workstations, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("LAUDO TÉCNICO DE INSALUBRIDADE", "NR-15", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. INTRODUÇÃO"));
  children.push(body(`O presente Laudo Técnico de Insalubridade tem por objetivo avaliar as condições de trabalho da empresa ${company.trade_name || company.name}, verificando a existência ou não de agentes insalubres nos ambientes laborais, conforme preceitos da Norma Regulamentadora NR-15 (Portaria 3.214/78 do MTE) e legislação pertinente (CLT, artigos 189 a 197).`));

  children.push(heading("3. FUNDAMENTAÇÃO LEGAL"));
  ["CLT — Art. 189: Consideram-se insalubres as atividades que expõem os trabalhadores a agentes nocivos à saúde, acima dos limites de tolerância.",
   "CLT — Art. 192: Adicional de insalubridade de 40%, 20% ou 10% sobre o salário mínimo, conforme grau máximo, médio ou mínimo.",
   "NR-15: Atividades e operações insalubres — Limites de tolerância para ruído, calor, agentes químicos, poeiras, etc.",
   "NR-09: Avaliação e controle das exposições ocupacionais a agentes físicos, químicos e biológicos.",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("4. CONCEITOS E DEFINIÇÕES"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Conceito", 25), headerCell("Definição", 75)] }),
      new TableRow({ children: [labelCell("Insalubridade", 25), textCell("Condição de trabalho que expõe o trabalhador a agentes nocivos à saúde acima dos limites de tolerância (NR-15)", false, 75)] }),
      new TableRow({ children: [labelCell("Limite de Tolerância", 25), textCell("Concentração ou intensidade máxima de agente nocivo permitida sem causar dano à saúde do trabalhador", false, 75)] }),
      new TableRow({ children: [labelCell("Adicional 40%", 25), textCell("Grau Máximo — agentes com maior potencial de dano", false, 75)] }),
      new TableRow({ children: [labelCell("Adicional 20%", 25), textCell("Grau Médio — exposição moderada", false, 75)] }),
      new TableRow({ children: [labelCell("Adicional 10%", 25), textCell("Grau Mínimo — exposição controlada mas acima do LT", false, 75)] }),
    ],
  }));

  children.push(heading("5. METODOLOGIA"));
  children.push(equipmentTable());
  children.push(body("As medições foram realizadas conforme metodologias da FUNDACENTRO (NHO 01, NHO 06, NHO 08, NHO 11) e critérios da NR-15 e ACGIH."));

  children.push(heading("6. AVALIAÇÃO DOS RISCOS OCUPACIONAIS"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 14), headerCell("Agente", 14), headerCell("Classificação NR-15", 14), headerCell("Intensidade", 14), headerCell("LT", 14), headerCell("Insalubridade", 15), headerCell("Grau", 15)] }),
        ...sectorWs.map(ws => {
          const wsRisks = risks.filter(r => { const a = analyses.find(a2 => a2.id === r.analysis_id); return a && a.workstation_id === ws.id; });
          if (wsRisks.length === 0) {
            return new TableRow({ children: [textCell(ws.name, false, 14), mergedCell("Sem exposição insalubre identificada", 6)] });
          }
          return new TableRow({
            children: [textCell(ws.name, false, 14), textCell(wsRisks.map(r => r.description).join(", "), false, 14), textCell("Anexo NR-15", false, 14), textCell("A avaliar", false, 14), textCell("NR-15", false, 14),
              (wsRisks.some(r => r.risk_level === 'high' || r.risk_level === 'critical') ? shadedCell("SIM", COLORS.redBg, true, 15) : shadedCell("NÃO", COLORS.greenBg, true, 15)),
              textCell(wsRisks.some(r => r.risk_level === 'critical') ? "40% (Máximo)" : wsRisks.some(r => r.risk_level === 'high') ? "20% (Médio)" : "—", false, 15)],
          });
        }),
      ],
    }));
  });

  children.push(heading("7. CONCLUSÃO"));
  children.push(body(`Com base nas avaliações quantitativas e qualitativas realizadas nos ambientes de trabalho da empresa ${company.trade_name || company.name}, conclui-se:`));
  children.push(accentCallout("As atividades e condições de exposição foram avaliadas conforme NR-15 e os resultados estão detalhados nas tabelas acima. A empresa deve adotar as medidas de controle necessárias para eliminação ou neutralização dos agentes insalubres identificados.", "info"));
  children.push(body("A eliminação ou neutralização da insalubridade poderá ocorrer com a adoção de medidas de proteção coletiva (EPC) ou individual (EPI) que reduzam a intensidade do agente a níveis abaixo dos limites de tolerância."));

  children.push(heading("ANEXOS"));
  ["Anexo I — Certificados de Calibração dos Equipamentos", "Anexo II — Resultados das Medições Ambientais", "Anexo III — ART do Responsável Técnico"].forEach(t => children.push(bulletItem(t)));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("Laudo de Insalubridade", company.name, "Insalubridade", children);
}

// ========== PERICULOSIDADE REPORT — Matches HTML preview ==========
function generatePericulosidadeDocx(ctx: DocxReportContext): Document {
  const { company, workstations, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("LAUDO TÉCNICO DE PERICULOSIDADE", "NR-16", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. INTRODUÇÃO"));
  children.push(body(`O presente Laudo Técnico de Periculosidade tem por objetivo avaliar as atividades e operações realizadas pelos trabalhadores da empresa ${company.trade_name || company.name}, com a finalidade de verificar a caracterização ou não de condições de periculosidade, nos termos da CLT (artigos 193 a 197) e NR-16.`));

  children.push(heading("3. FUNDAMENTAÇÃO LEGAL"));
  ["CLT — Art. 193: São consideradas atividades ou operações perigosas aquelas que, por sua natureza ou métodos de trabalho, impliquem risco acentuado em virtude de exposição permanente a: inflamáveis, explosivos, energia elétrica, roubos ou outras espécies de violência física.",
   "NR-16: Atividades e Operações Perigosas — Estabelece os critérios para caracterização da periculosidade.",
   "Adicional de 30%: sobre o salário-base, sem os acréscimos resultantes de gratificações, prêmios ou participações nos lucros.",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("4. ATIVIDADES PERIGOSAS — CLASSIFICAÇÃO NR-16"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Anexo NR-16", 25), headerCell3("Descrição", 75)] }),
      ...([["Anexo 1", "Atividades com explosivos"], ["Anexo 2", "Atividades com inflamáveis"], ["Anexo 3", "Atividades com radiações ionizantes ou substâncias radioativas"],
        ["Anexo 4", "Atividades com exposição a roubos ou violência física (segurança)"], ["Anexo 5", "Atividades com energia elétrica"], ["Anexo 6", "Atividades com motocicleta"],
      ]).map(([a, d]) => new TableRow({ children: [labelCell(a, 25), textCell(d, false, 75)] })),
    ],
  }));

  children.push(heading("5. DESCRIÇÃO DAS ATIVIDADES"));
  workstations.forEach(ws => {
    children.push(heading(ws.name, HeadingLevel.HEADING_3));
    children.push(body(ws.activity_description || ws.description || ws.tasks_performed || "Atividades operacionais"));
  });

  children.push(heading("6. CONCEITOS DAS FORMAS DE EXPOSIÇÃO"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Forma de Exposição", 25), headerCell("Definição", 75)] }),
      new TableRow({ children: [labelCell("Permanente", 25), textCell("Exposição diária, contínua e habitual ao agente perigoso", false, 75)] }),
      new TableRow({ children: [labelCell("Intermitente", 25), textCell("Exposição em períodos alternados, com interrupções durante a jornada", false, 75)] }),
      new TableRow({ children: [labelCell("Eventual", 25), textCell("Exposição fortuita, sem regularidade ou previsibilidade", false, 75)] }),
    ],
  }));

  children.push(heading("7. FICHA DE PERÍCIA TÉCNICA"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 20), headerCell("Agente Perigoso", 20), headerCell("Enquadramento NR-16", 20), headerCell("Forma de Exposição", 20), headerCell("Periculosidade", 20)] }),
        ...sectorWs.map(ws => {
          const wsRisks = risks.filter(r => { const a = analyses.find(a2 => a2.id === r.analysis_id); return a && a.workstation_id === ws.id; });
          if (wsRisks.length === 0) {
            return new TableRow({ children: [textCell(ws.name, false, 20), mergedCell("Atividades não enquadradas como perigosas", 4)] });
          }
          return new TableRow({
            children: [textCell(ws.name, false, 20), textCell(wsRisks.map(r => r.description).join(", "), false, 20), textCell("A avaliar", false, 20), textCell("Habitual", false, 20),
              wsRisks.some(r => r.risk_level === 'critical') ? shadedCell("CARACTERIZADA (30%)", COLORS.redBg, true, 20) : shadedCell("NÃO CARACTERIZADA", COLORS.greenBg, true, 20)],
          });
        }),
      ],
    }));
  });

  children.push(heading("8. CONCLUSÃO E TERMO DE RESPONSABILIDADE"));
  children.push(body(`Com base na análise técnica realizada, conclui-se que as atividades e operações desenvolvidas na empresa ${company.trade_name || company.name} foram avaliadas conforme NR-16 e legislação pertinente.`));
  children.push(accentCallout("O laudo deve ser atualizado sempre que houver alteração nas condições de trabalho, processos ou introdução de novos agentes perigosos.", "info"));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("Laudo de Periculosidade", company.name, "Periculosidade", children);
}

// ========== PCA REPORT — Matches HTML preview ==========
function generatePCADocx(ctx: DocxReportContext): Document {
  const { company, workstations } = ctx;
  const { consultant, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("PROGRAMA DE CONSERVAÇÃO AUDITIVA", "PCA", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. INTRODUÇÃO"));
  children.push(body("O Programa de Conservação Auditiva (PCA) é um conjunto de medidas coordenadas que visam prevenir ou estabilizar as perdas auditivas ocupacionais. Constitui-se em uma das medidas de controle dos riscos à saúde mais importantes para trabalhadores expostos a Níveis de Pressão Sonora Elevados (NPSE), em conformidade com a NR-07, NR-09 e NR-15."));

  children.push(heading("3. OBJETIVOS ESPECÍFICOS DO PCA"));
  ["Identificar trabalhadores expostos a NPSE acima do nível de ação (80 dB(A))",
   "Estabelecer critérios audiométricos para monitoramento da audição",
   "Selecionar e controlar o uso adequado de Equipamentos de Proteção Auditiva (EPA)",
   "Reduzir ou eliminar a exposição a NPSE por meio de medidas de engenharia e administrativas",
   "Conscientizar os trabalhadores sobre os riscos e prevenção da PAIR",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("4. MECANISMO DA AUDIÇÃO"));
  children.push(body("O aparelho auditivo humano é composto por ouvido externo (pavilhão auricular e canal auditivo), ouvido médio (tímpano e ossículos) e ouvido interno (cóclea). A exposição prolongada a níveis sonoros elevados pode causar danos irreversíveis às células ciliadas da cóclea, resultando em Perda Auditiva Induzida por Ruído (PAIR)."));

  children.push(heading("5. DANOS PROVOCADOS PELO RUÍDO"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Tipo de Dano", 25), headerCell3("Descrição", 75)] }),
      new TableRow({ children: [labelCell("PAIR", 25), textCell("Perda auditiva sensorioneural, bilateral, irreversível e progressiva", false, 75)] }),
      new TableRow({ children: [labelCell("Zumbido (Tinnitus)", 25), textCell("Percepção de som sem estímulo externo", false, 75)] }),
      new TableRow({ children: [labelCell("Efeitos Extra-auditivos", 25), textCell("Estresse, irritabilidade, distúrbios do sono, hipertensão, dificuldade de concentração", false, 75)] }),
      new TableRow({ children: [labelCell("Trauma Acústico", 25), textCell("Perda auditiva súbita por exposição a ruído de impacto (≥130 dB)", false, 75)] }),
    ],
  }));

  children.push(heading("6. AVALIAÇÕES DA ÁREA DE TRABALHO"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 17), headerCell("Nível Ruído (dB(A))", 17), headerCell("LT NR-15", 16), headerCell("Nível Ação", 16), headerCell("EPA Recomendado", 17), headerCell("NRRsf (dB)", 17)] }),
        ...sectorWs.map(ws => new TableRow({
          children: [textCell(ws.name, false, 17), textCell("A avaliar", false, 17), textCell("85 dB(A) / 8h", false, 16), textCell("80 dB(A)", false, 16), textCell("Protetor tipo concha/plug", false, 17), textCell("A calcular", false, 17)],
        })),
      ],
    }));
  });

  children.push(heading("7. PROTEÇÃO AUDITIVA INDIVIDUAL"));
  children.push(heading("Cálculo de Atenuação — NRRsf", HeadingLevel.HEADING_3));
  children.push(body("O Nível de Ruído com Proteção (NRP) é calculado pela fórmula: NRP = NPS — NRRsf, onde NPS é o Nível de Pressão Sonora e NRRsf é o Nível de Redução de Ruído (simplificado) do protetor.", { bold: true }));

  children.push(heading("8. CRITÉRIOS AUDIOMÉTRICOS"));
  children.push(body("Conforme Portaria nº 19/1998, os exames audiométricos devem seguir os seguintes critérios:"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Critério", 30), headerCell("Descrição", 70)] }),
      new TableRow({ children: [labelCell("Audiometria de Referência", 30), textCell("Realizada na admissão, após repouso auditivo mínimo de 14 horas", false, 70)] }),
      new TableRow({ children: [labelCell("Audiometria Sequencial", 30), textCell("Semestral para expostos a ruído ≥ nível de ação", false, 70)] }),
      new TableRow({ children: [labelCell("Desencadeamento de PAIR", 30), textCell("Piora ≥10 dB na média (3000, 4000 e 6000 Hz) em relação à referência", false, 70)] }),
      new TableRow({ children: [labelCell("Agravamento", 30), textCell("Piora adicional ≥10 dB após diagnóstico de PAIR", false, 70)] }),
    ],
  }));

  children.push(heading("9. AÇÕES EDUCATIVAS"));
  ["Palestras de conscientização sobre riscos do ruído e uso correto de EPA",
   "Treinamento para colocação e retirada dos protetores auriculares",
   "Material informativo sobre prevenção de PAIR",
   "DDS (Diálogo Diário de Segurança) periódico sobre conservação auditiva",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("10. CRONOGRAMA DE ATIVIDADES"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Atividade", 36), headerCell("Jan-Mar", 16), headerCell("Abr-Jun", 16), headerCell("Jul-Set", 16), headerCell("Out-Dez", 16)] }),
      new TableRow({ children: [textCell("Monitoramento Ambiental", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16)] }),
      new TableRow({ children: [textCell("Audiometria Ocupacional", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16)] }),
      new TableRow({ children: [textCell("Treinamento EPA", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16)] }),
      new TableRow({ children: [textCell("Inspeção de EPAs", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), shadedCell("✓", COLORS.greenBg, false, 16), shadedCell("✓", COLORS.greenBg, false, 16), shadedCell("✓", COLORS.greenBg, false, 16)] }),
    ],
  }));

  children.push(heading("11. CONCLUSÃO"));
  children.push(body(`O PCA da empresa ${company.trade_name || company.name} visa garantir a preservação da saúde auditiva dos trabalhadores expostos a NPSE, através de ações integradas de monitoramento, proteção e conscientização.`));

  children.push(heading("ANEXOS"));
  ["Anexo I — Certificados de Calibração (Dosímetro/Decibelímetro)", "Anexo II — Laudos de Audiometria", "Anexo III — Fichas de Entrega de EPA"].forEach(t => children.push(bulletItem(t)));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("PCA", company.name, "PCA", children);
}

// ========== PPR REPORT — Matches HTML preview ==========
function generatePPRDocx(ctx: DocxReportContext): Document {
  const { company, workstations } = ctx;
  const { consultant, sectorMap } = getCtxData(ctx);

  const children: any[] = [];
  children.push(...createCoverPage("PROGRAMA DE PROTEÇÃO RESPIRATÓRIA", "PPR", company, consultant));
  children.push(...revisionTable());

  children.push(heading("1. DADOS DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. OBJETIVO"));
  children.push(body(`Estabelecer diretrizes e procedimentos para a seleção, utilização, manutenção e controle de Equipamentos de Proteção Respiratória (EPR) na empresa ${company.trade_name || company.name}, em conformidade com a IN SSST/MTE nº 01/1994, Portaria nº 672/2021 e NR-09.`));

  children.push(heading("3. APLICAÇÃO"));
  children.push(body("Este programa é aplicável a todas as atividades que exponham os trabalhadores a contaminantes atmosféricos (poeiras, fumos, névoas, gases e vapores) ou a atmosferas com deficiência de oxigênio."));

  children.push(heading("4. RESPONSABILIDADES"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Responsável", 25), headerCell("Atribuições", 75)] }),
      new TableRow({ children: [labelCell("Administrador do PPR", 25), textCell("Coordenar as atividades do programa, selecionar EPR adequados, manter registros", false, 75)] }),
      new TableRow({ children: [labelCell("Empregador", 25), textCell("Garantir implementação, fornecer EPR aprovados, treinar trabalhadores", false, 75)] }),
      new TableRow({ children: [labelCell("Trabalhador", 25), textCell("Usar EPR conforme orientação, inspecionar antes do uso, comunicar defeitos", false, 75)] }),
      new TableRow({ children: [labelCell("SESMT", 25), textCell("Monitorar exposições, avaliar eficácia dos EPR, acompanhar saúde respiratória", false, 75)] }),
    ],
  }));

  children.push(heading("5. DOCUMENTOS DE REFERÊNCIA"));
  ["IN SSST/MTE nº 01/1994 — Programa de Proteção Respiratória", "Portaria nº 672/2021 — Normas sobre EPR",
   "NR-06 — Equipamento de Proteção Individual", "NR-09 — Avaliação e Controle das Exposições Ocupacionais",
   "NR-15 — Atividades e Operações Insalubres", "ABNT/NBR 12543 — Equipamentos de Proteção Respiratória",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("6. DEFINIÇÕES"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Termo", 25), headerCell("Definição", 75)] }),
      ...([["EPR", "Equipamento de Proteção Respiratória"], ["FPA", "Fator de Proteção Atribuído"], ["IPVS", "Imediatamente Perigoso à Vida ou à Saúde"], ["PFF", "Peça Facial Filtrante"], ["LT", "Limite de Tolerância"]]).map(([t, d]) =>
        new TableRow({ children: [labelCell(t, 25), textCell(d, false, 75)] })
      ),
    ],
  }));

  children.push(heading("7. SELEÇÃO DE RESPIRADORES"));
  children.push(heading("7.1 Critérios de Seleção", HeadingLevel.HEADING_3));
  children.push(body("A seleção do tipo de EPR deve considerar: natureza do contaminante (partículas, gases/vapores), concentração do contaminante, Limite de Tolerância (NR-15 ou ACGIH), Fator de Proteção necessário e condições de uso."));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Tipo de Contaminante", 30), headerCell3("Tipo de EPR Recomendado", 45), headerCell3("FPA Mínimo", 25)] }),
      new TableRow({ children: [textCell("Poeiras e Névoas", false, 30), textCell("PFF2 ou Peça facial + filtro P2", false, 45), textCell("10", false, 25)] }),
      new TableRow({ children: [textCell("Fumos Metálicos", false, 30), textCell("PFF2/PFF3 ou Peça facial + filtro P3", false, 45), textCell("10-50", false, 25)] }),
      new TableRow({ children: [textCell("Gases e Vapores Orgânicos", false, 30), textCell("Peça facial + filtro químico VO", false, 45), textCell("10-50", false, 25)] }),
      new TableRow({ children: [textCell("Gases Ácidos", false, 30), textCell("Peça facial + filtro químico GA", false, 45), textCell("10-50", false, 25)] }),
      new TableRow({ children: [textCell("Atmosfera IPVS", false, 30), textCell("Máscara autônoma ou linha de ar", false, 45), textCell("1000+", false, 25)] }),
    ],
  }));

  children.push(heading("8. DESCRIÇÃO DAS ATIVIDADES E RISCOS RESPIRATÓRIOS"));
  let gheIdx = 0;
  sectorMap.forEach(({ sectorName, workstations: sectorWs }) => {
    gheIdx++;
    children.push(sectionBanner(`GHE ${String(gheIdx).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Função/Posto", 17), headerCell("Contaminante", 17), headerCell("Concentração", 16), headerCell("LT", 16), headerCell("EPR Recomendado", 17), headerCell("FPA", 17)] }),
        ...sectorWs.map(ws => new TableRow({
          children: [textCell(ws.name, false, 17), textCell("A avaliar", false, 17), textCell("A avaliar", false, 16), textCell("NR-15/ACGIH", false, 16), textCell("A definir conforme exposição", false, 17), textCell("—", false, 17)],
        })),
      ],
    }));
  });

  children.push(heading("9. TREINAMENTOS"));
  ["Natureza dos contaminantes e riscos à saúde respiratória", "Seleção, uso, colocação e retirada correta do EPR",
   "Ensaio de vedação (qualitativo e quantitativo)", "Inspeção, higienização, manutenção e guarda do EPR",
   "Situações de emergência e procedimentos de fuga",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("10. MANUTENÇÃO, INSPEÇÃO E GUARDA"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Ação", 35), headerCell("Frequência", 35), headerCell("Responsável", 30)] }),
      new TableRow({ children: [textCell("Inspeção Visual", false, 35), textCell("Antes de cada uso", false, 35), textCell("Trabalhador", false, 30)] }),
      new TableRow({ children: [textCell("Higienização", false, 35), textCell("Após cada uso", false, 35), textCell("Trabalhador/SESMT", false, 30)] }),
      new TableRow({ children: [textCell("Troca de Filtros", false, 35), textCell("Conforme saturação ou prazo", false, 35), textCell("SESMT", false, 30)] }),
      new TableRow({ children: [textCell("Ensaio de Vedação", false, 35), textCell("Anual ou na troca de modelo", false, 35), textCell("SESMT", false, 30)] }),
    ],
  }));

  children.push(heading("11. PREVENÇÃO DE PNEUMOCONIOSE"));
  children.push(body("Especial atenção deve ser dada à prevenção de pneumoconioses (silicose, asbestose, siderose), através do monitoramento contínuo da exposição, uso adequado de EPR e exames periódicos (espirometria e Rx de tórax)."));

  children.push(heading("12. CRONOGRAMA DE AÇÃO"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Atividade", 36), headerCell("Jan-Mar", 16), headerCell("Abr-Jun", 16), headerCell("Jul-Set", 16), headerCell("Out-Dez", 16)] }),
      new TableRow({ children: [textCell("Avaliação Ambiental", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16)] }),
      new TableRow({ children: [textCell("Treinamento EPR", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16)] }),
      new TableRow({ children: [textCell("Ensaio de Vedação", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), textCell("", false, 16), textCell("", false, 16)] }),
      new TableRow({ children: [textCell("Exames Complementares", false, 36), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16), shadedCell("✓", COLORS.greenBg, false, 16), textCell("", false, 16)] }),
    ],
  }));

  children.push(heading("13. ENCERRAMENTO"));
  children.push(body(`O presente PPR da empresa ${company.trade_name || company.name} estabelece as diretrizes para proteção respiratória dos trabalhadores, devendo ser revisado anualmente ou sempre que houver alteração nas condições de exposição.`));

  children.push(heading("ANEXOS"));
  ["Anexo 1 — Avaliação dos Riscos Respiratórios", "Anexo 2 — Tipos de Respiradores",
   "Anexo 3 — Fatores de Proteção Atribuídos", "Anexo 4 — Ensaio de Vedação da Máscara",
   "Anexo 5 — Certificados de Aprovação (CA) dos EPRs",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell("PPR", company.name, "PPR", children);
}

// ========== GENERIC REPORT ==========
function generateGenericDocx(ctx: DocxReportContext): Document {
  const { company, sector, workstation, workstations, analyses, reportType } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));

  const children: any[] = [];
  children.push(...createCoverPage(reportType, reportType, company, consultant));

  children.push(heading("1. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(companyDataTable(company));

  children.push(heading("2. ANÁLISES REALIZADAS"));
  if (analyses.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Posto", 25), headerCell("Método", 20), headerCell("Score", 15), headerCell("Observações", 40)] }),
        ...analyses.map(a => {
          const ws = workstations.find(w => w.id === a.workstation_id);
          return new TableRow({ children: [textCell(ws?.name || "—", false, 25), textCell(a.method, false, 20), textCell(String(a.score), false, 15), textCell(a.notes, false, 40)] });
        }),
      ],
    }));
  } else {
    children.push(body("Nenhuma análise realizada."));
  }

  children.push(heading("3. RISCOS IDENTIFICADOS"));
  if (risks.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Descrição", 50), headerCell("Score", 25), headerCell("Nível", 25)] }),
        ...risks.map(r => new TableRow({
          children: [textCell(r.description, false, 50), textCell(String(r.risk_score), true, 25), textCell(riskLevelLabel(r.risk_level), true, 25)],
        })),
      ],
    }));
  } else {
    children.push(body("Nenhum risco identificado."));
  }

  children.push(heading("4. RECOMENDAÇÕES"));
  if (actions.length > 0) {
    actions.forEach(ap => children.push(bulletItem(`${ap.description} (${ap.responsible} — ${ap.deadline})`)));
  } else {
    children.push(body("Sem recomendações."));
  }

  children.push(...signatureBlock(consultant));
  children.push(footer());
  return createDocumentShell(reportType, company.name, reportType, children);
}

// ========== MAIN EXPORT ==========

function buildPreviewHtmlDocument(ctx: DocxReportContext): string {
  return generateReportHTML({
    company: ctx.company,
    sector: ctx.sector,
    workstation: ctx.workstation,
    workstations: ctx.workstations,
    analyses: ctx.analyses,
    photos: ctx.photos,
    reportType: ctx.reportType,
    consultantName: ctx.consultantName,
  });
}

export async function generateAndDownloadDocx(ctx: DocxReportContext): Promise<void> {
  const fileName = `${ctx.reportType}_${ctx.company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;

  try {
    // Download do MESMO arquivo da visualização nativa (HTML idêntico)
    const htmlDocument = buildPreviewHtmlDocument(ctx);
    const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
    saveAs(blob, fileName);
    return;
  } catch (error) {
    console.error("Falha ao baixar o HTML da visualização.", error);
    throw error;
  }
}

// ============ PDF GENERATION — ROBUST ON-SCREEN CAPTURE ============

const PDF_W_MM = 210;
const PDF_H_MM = 297;
const PDF_RENDER_WIDTH_PX = 794; // exact A4 width at 96 DPI — 1:1 ratio eliminates zoom

/**
 * Rich diagnostic overlay with progress, thumbnails, logs, and score.
 */
interface OverlayControls {
  element: HTMLDivElement;
  setIteration: (current: number, max: number) => void;
  setProgress: (percent: number, label: string) => void;
  setPageStatus: (pageIdx: number, thumbnail: string, status: "capturing" | "ok" | "warning" | "fixing" | "error", detail: string) => void;
  addLog: (msg: string) => void;
  setScore: (score: number) => void;
  setPhase: (phase: string) => void;
  finish: (totalPages: number, fixedPages: number, score: number) => void;
  remove: () => void;
}

function showPdfOverlay(): OverlayControls {
  const overlay = document.createElement("div");
  overlay.id = "__pdf_overlay__";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "999998",
    background: "rgba(10, 31, 68, 0.97)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    backdropFilter: "blur(8px)",
    color: "#e2e8f0",
  });

  overlay.innerHTML = `
    <style>
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      #__pdf_overlay__ * { box-sizing: border-box; }
      .qa-panel { width: 560px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; gap: 16px; }
      .qa-header { text-align: center; }
      .qa-header h2 { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 4px; }
      .qa-header .phase { font-size: 13px; color: #94a3b8; }
      .qa-header .iteration { font-size: 12px; color: #64748b; margin-top: 2px; }
      .qa-progress-bar { width: 100%; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden; }
      .qa-progress-fill { height: 100%; background: linear-gradient(90deg, #1565C0, #00BCD4); transition: width 0.3s; width: 0%; border-radius: 4px; }
      .qa-progress-label { font-size: 11px; color: #94a3b8; margin-top: 4px; text-align: right; }
      .qa-pages { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-height: 200px; overflow-y: auto; padding: 8px 0; }
      .qa-page-thumb { width: 72px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
      .qa-page-thumb img { width: 68px; height: 96px; object-fit: cover; border-radius: 4px; border: 2px solid #334155; }
      .qa-page-thumb.ok img { border-color: #22c55e; }
      .qa-page-thumb.warning img { border-color: #eab308; }
      .qa-page-thumb.fixing img { border-color: #f97316; animation: pulse 1s ease-in-out infinite; }
      .qa-page-thumb.error img { border-color: #ef4444; }
      .qa-page-thumb.capturing img { border-color: #3b82f6; animation: pulse 0.8s ease-in-out infinite; }
      .qa-page-thumb .badge { font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 8px; }
      .qa-page-thumb.ok .badge { background: #166534; color: #bbf7d0; }
      .qa-page-thumb.warning .badge { background: #854d0e; color: #fef08a; }
      .qa-page-thumb.fixing .badge { background: #9a3412; color: #fed7aa; }
      .qa-page-thumb.error .badge { background: #991b1b; color: #fecaca; }
      .qa-page-thumb.capturing .badge { background: #1e40af; color: #bfdbfe; }
      .qa-page-thumb .detail { font-size: 8px; color: #64748b; text-align: center; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .qa-log { background: #0f172a; border-radius: 6px; padding: 10px 12px; max-height: 140px; overflow-y: auto; font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 11px; line-height: 1.5; color: #94a3b8; }
      .qa-log .log-entry { margin: 0; }
      .qa-log .log-entry.fix { color: #facc15; }
      .qa-log .log-entry.ok { color: #4ade80; }
      .qa-log .log-entry.err { color: #f87171; }
      .qa-score { text-align: center; }
      .qa-score .num { font-size: 32px; font-weight: 800; }
      .qa-score .label { font-size: 11px; color: #64748b; }
      .qa-score.good .num { color: #4ade80; }
      .qa-score.mid .num { color: #facc15; }
      .qa-score.bad .num { color: #f87171; }
      .qa-done { text-align: center; padding: 12px 0; }
      .qa-done h3 { color: #4ade80; font-size: 16px; margin: 0 0 6px; }
      .qa-done p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
    <div class="qa-panel">
      <div class="qa-header">
        <h2>🔄 Gerando PDF com QA Automático</h2>
        <div class="phase" id="qa-phase">Iniciando...</div>
        <div class="iteration" id="qa-iteration"></div>
      </div>
      <div>
        <div class="qa-progress-bar"><div class="qa-progress-fill" id="qa-progress-fill"></div></div>
        <div class="qa-progress-label" id="qa-progress-label">0%</div>
      </div>
      <div class="qa-pages" id="qa-pages"></div>
      <div class="qa-score" id="qa-score" style="display:none">
        <div class="num" id="qa-score-num">—</div>
        <div class="label">Score de Qualidade</div>
      </div>
      <div class="qa-log" id="qa-log"></div>
      <div class="qa-done" id="qa-done" style="display:none"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const $fill = overlay.querySelector("#qa-progress-fill") as HTMLDivElement;
  const $label = overlay.querySelector("#qa-progress-label") as HTMLDivElement;
  const $phase = overlay.querySelector("#qa-phase") as HTMLDivElement;
  const $iteration = overlay.querySelector("#qa-iteration") as HTMLDivElement;
  const $pages = overlay.querySelector("#qa-pages") as HTMLDivElement;
  const $log = overlay.querySelector("#qa-log") as HTMLDivElement;
  const $score = overlay.querySelector("#qa-score") as HTMLDivElement;
  const $scoreNum = overlay.querySelector("#qa-score-num") as HTMLDivElement;
  const $done = overlay.querySelector("#qa-done") as HTMLDivElement;

  const statusLabels: Record<string, string> = {
    capturing: "⏳", ok: "✓", warning: "⚠", fixing: "🔧", error: "✗",
  };

  return {
    element: overlay,
    setIteration(current, max) { $iteration.textContent = `Tentativa ${current}/${max}`; },
    setProgress(pct, label) { $fill.style.width = `${pct}%`; $label.textContent = `${Math.round(pct)}% — ${label}`; },
    setPhase(phase) { $phase.textContent = phase; },
    setPageStatus(idx, thumb, status, detail) {
      let el = $pages.querySelector(`[data-page="${idx}"]`) as HTMLDivElement | null;
      if (!el) {
        el = document.createElement("div");
        el.className = `qa-page-thumb ${status}`;
        el.setAttribute("data-page", String(idx));
        el.innerHTML = `<img src="${thumb}" alt="Pág ${idx + 1}"/><span class="badge">${statusLabels[status]} ${idx + 1}</span><span class="detail">${detail}</span>`;
        $pages.appendChild(el);
      } else {
        el.className = `qa-page-thumb ${status}`;
        const img = el.querySelector("img");
        if (img && thumb) img.src = thumb;
        const badge = el.querySelector(".badge");
        if (badge) badge.textContent = `${statusLabels[status]} ${idx + 1}`;
        const det = el.querySelector(".detail");
        if (det) det.textContent = detail;
      }
    },
    addLog(msg) {
      const cls = msg.includes("→") || msg.includes("fix") || msg.includes("consolid") ? "fix" : msg.includes("✓") || msg.includes("OK") ? "ok" : msg.includes("✗") || msg.includes("ERRO") ? "err" : "";
      const p = document.createElement("p");
      p.className = `log-entry ${cls}`;
      p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      $log.appendChild(p);
      $log.scrollTop = $log.scrollHeight;
    },
    setScore(score) {
      $score.style.display = "";
      $scoreNum.textContent = `${score}/100`;
      $score.className = `qa-score ${score >= 80 ? "good" : score >= 60 ? "mid" : "bad"}`;
    },
    finish(totalPages, fixedPages, score) {
      $done.style.display = "";
      $done.innerHTML = `<h3>✅ PDF Gerado com Sucesso</h3><p>${totalPages} páginas analisadas · ${fixedPages} corrigidas · Score final: ${score}/100</p>`;
      $phase.textContent = "Concluído";
      $fill.style.width = "100%";
      $label.textContent = "100% — Finalizado";
      setTimeout(() => overlay.remove(), 3000);
    },
    remove() { overlay.remove(); },
  };
}

/**
 * Split HTML string into sections by page-break markers.
 */
function splitHtmlByPageBreaks(html: string): string[] {
  const parts = html.split(/<div\s+class=["']page-break["'][^>]*>\s*<\/div>/gi);
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * CSS injected into the render container for PDF fidelity.
 */
const PDF_A4_HEIGHT_PX = Math.floor(PDF_RENDER_WIDTH_PX * PDF_H_MM / PDF_W_MM);

const PDF_INJECT_CSS = `
  [data-pdf-render="true"] * { box-sizing: border-box; }
  [data-pdf-render="true"] .pdf-page {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #1e293b;
    line-height: 1.6;
    background: #fff;
    width: ${PDF_RENDER_WIDTH_PX}px;
    padding: 20px 30px;
    overflow: visible;
  }
  [data-pdf-render="true"] .pdf-page.pdf-page--cover {
    padding: 0;
    min-height: ${PDF_A4_HEIGHT_PX}px;
    max-height: ${PDF_A4_HEIGHT_PX}px;
    overflow: hidden;
  }
  [data-pdf-render="true"] .pdf-page.pdf-page--cover .rpt-cover {
    min-height: ${PDF_A4_HEIGHT_PX}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #0A1F44 !important;
    background: linear-gradient(135deg, #0A1F44 0%, #1565C0 50%, #00838F 100%) !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 60px 40px !important;
  }
  [data-pdf-render="true"] .pdf-page .rpt-cover h1 { color: white !important; }
  [data-pdf-render="true"] .pdf-page .rpt-cover h2 { color: #B2EBF2 !important; }
  [data-pdf-render="true"] .pdf-page .rpt-cover .company { color: white !important; }
  [data-pdf-render="true"] .pdf-page .rpt-cover .meta { color: #B2EBF2 !important; }
  [data-pdf-render="true"] .pdf-page.pdf-page--index {
    min-height: ${PDF_A4_HEIGHT_PX}px;
  }
  [data-pdf-render="true"] .pdf-page img { max-width: 100%; height: auto; }
`;

function createOnScreenContainer(htmlSections: string[]): HTMLDivElement {
  const container = document.createElement("div");
  container.setAttribute("data-pdf-render", "true");
  Object.assign(container.style, {
    position: "fixed", top: "0", left: "0",
    width: `${PDF_RENDER_WIDTH_PX}px`, background: "#ffffff",
    zIndex: "999997", overflow: "visible", opacity: "1", pointerEvents: "none",
  });

  const pagesHtml = htmlSections.map((sectionHtml, idx) => {
    const isCover = idx === 0 && sectionHtml.includes('rpt-cover');
    const isIndex = (idx === 1 && !sectionHtml.includes('rpt-cover')) || sectionHtml.includes('SUMÁRIO') || sectionHtml.includes('ÍNDICE');
    const extraClass = isCover ? ' pdf-page--cover' : isIndex ? ' pdf-page--index' : '';
    return `<div class="pdf-page${extraClass}">${sectionHtml}</div>`;
  }).join("");

  container.innerHTML = `<style>${PDF_INJECT_CSS}</style>${pagesHtml}`;
  document.body.appendChild(container);
  return container;
}

async function waitForFullRender(root: HTMLElement): Promise<void> {
  try { await (document as any).fonts?.ready; } catch {}
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(imgs.map((img) => new Promise<void>((resolve) => {
    if (img.complete && img.naturalHeight > 0) return resolve();
    img.onload = () => resolve();
    img.onerror = () => resolve();
  })));
  for (let i = 0; i < 3; i++) { await new Promise<void>((r) => requestAnimationFrame(() => r())); }
  await new Promise<void>((r) => setTimeout(r, 300));
}

function hasContent(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width < 50 || canvas.height < 50) return false;
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const step = Math.max(4, Math.floor(Math.sqrt((w * h) / 5000)));
  let total = 0, nonWhite = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      total++;
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 8 && !(data[idx] > 245 && data[idx + 1] > 245 && data[idx + 2] > 245)) nonWhite++;
    }
  }
  return total > 0 ? (nonWhite / total) > 0.003 : false;
}

async function capturePageElement(
  pageEl: HTMLElement,
  html2canvasFn: typeof import("html2canvas").default,
  pdf: import("jspdf").jsPDF,
  pageIndex: number,
  scale: number
): Promise<{ pagesAdded: number; canvases: HTMLCanvasElement[] }> {
  const elHeight = pageEl.scrollHeight;
  const maxPageH = PDF_A4_HEIGHT_PX;

  if (elHeight <= maxPageH + 20) {
    const canvas = await html2canvasFn(pageEl, {
      scale, useCORS: true, backgroundColor: "#ffffff", logging: false,
      width: pageEl.scrollWidth, height: pageEl.scrollHeight,
      windowWidth: pageEl.scrollWidth, windowHeight: pageEl.scrollHeight, scrollX: 0, scrollY: 0,
    });
    if (!hasContent(canvas)) return { pagesAdded: 0, canvases: [] };
    if (pageIndex > 0) pdf.addPage();
    const heightMm = (canvas.height * PDF_W_MM) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PDF_W_MM, heightMm);
    return { pagesAdded: 1, canvases: [canvas] };
  }

  const children = Array.from(pageEl.children) as HTMLElement[];
  const parentTop = pageEl.getBoundingClientRect().top;
  const pageChunks: { startIdx: number; endIdx: number }[] = [];
  let currentChunkStart = 0;
  let currentChunkBottom = 0;

  for (let i = 0; i < children.length; i++) {
    const childBottom = children[i].getBoundingClientRect().bottom - parentTop;
    if (currentChunkBottom === 0) { currentChunkBottom = childBottom; continue; }
    if (childBottom - (children[currentChunkStart].getBoundingClientRect().top - parentTop) > maxPageH) {
      pageChunks.push({ startIdx: currentChunkStart, endIdx: i - 1 });
      currentChunkStart = i;
      currentChunkBottom = childBottom;
    } else {
      currentChunkBottom = childBottom;
    }
  }
  if (currentChunkStart < children.length) pageChunks.push({ startIdx: currentChunkStart, endIdx: children.length - 1 });

  let pagesAdded = 0;
  const canvases: HTMLCanvasElement[] = [];

  for (const chunk of pageChunks) {
    const tempDiv = document.createElement("div");
    tempDiv.className = "pdf-page";
    Object.assign(tempDiv.style, {
      width: `${PDF_RENDER_WIDTH_PX}px`, padding: "20px 30px", background: "#fff",
      fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "13px", color: "#1e293b",
      lineHeight: "1.6", position: "fixed", top: "0", left: "0", zIndex: "999996",
      overflow: "visible", pointerEvents: "none",
    });
    for (let i = chunk.startIdx; i <= chunk.endIdx; i++) tempDiv.appendChild(children[i].cloneNode(true));
    document.body.appendChild(tempDiv);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const canvas = await html2canvasFn(tempDiv, {
      scale, useCORS: true, backgroundColor: "#ffffff", logging: false,
      width: tempDiv.scrollWidth, height: tempDiv.scrollHeight,
      windowWidth: tempDiv.scrollWidth, windowHeight: tempDiv.scrollHeight, scrollX: 0, scrollY: 0,
    });
    tempDiv.remove();
    if (!hasContent(canvas)) continue;
    if (pageIndex + pagesAdded > 0) pdf.addPage();
    const heightMm = (canvas.height * PDF_W_MM) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PDF_W_MM, heightMm);
    canvases.push(canvas);
    pagesAdded++;
  }

  return { pagesAdded, canvases };
}

function mergeSections(sections: string[], idxA: number, idxB: number): string[] {
  if (idxA < 0 || idxB >= sections.length || idxA === idxB) return sections;
  const merged = sections[idxA] + "\n" + sections[idxB];
  const result = [...sections];
  result[idxA] = merged;
  result.splice(idxB, 1);
  return result;
}

const MAX_QA_ITERATIONS = 2;

/**
 * Main PDF generation with automatic QA analysis and correction loop.
 */
export async function generateAndDownloadPdf(ctx: DocxReportContext): Promise<void> {
  const overlay = showPdfOverlay();
  let container: HTMLDivElement | null = null;

  try {
    overlay.setPhase("Preparando HTML do relatório...");
    overlay.addLog("Iniciando geração do PDF com QA automático");

    const previewNode = document.querySelector(".report-preview-content") as HTMLDivElement | null;
    const html =
      previewNode?.innerHTML?.trim() && previewNode.innerHTML.trim().length > 50
        ? previewNode.innerHTML
        : generateReportHTML({
            company: ctx.company, sector: ctx.sector, workstation: ctx.workstation,
            workstations: ctx.workstations, analyses: ctx.analyses,
            photos: ctx.photos, reportType: ctx.reportType,
          });

    const fileName = `${ctx.reportType}_${ctx.company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    let sections = splitHtmlByPageBreaks(html);
    overlay.addLog(`HTML dividido em ${sections.length} seções`);

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    let finalScore = 0;
    let totalFixed = 0;

    for (let iteration = 1; iteration <= MAX_QA_ITERATIONS + 1; iteration++) {
      const isLastIteration = iteration > MAX_QA_ITERATIONS;
      overlay.setIteration(Math.min(iteration, MAX_QA_ITERATIONS), MAX_QA_ITERATIONS);
      overlay.setPhase(iteration === 1 ? "Capturando e analisando páginas..." : `Re-capturando após correções (tentativa ${iteration})...`);

      // Clear page thumbnails for new iteration
      const $pages = overlay.element.querySelector("#qa-pages");
      if ($pages) $pages.innerHTML = "";

      container?.remove();
      container = createOnScreenContainer(sections);
      await waitForFullRender(container);

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageElements = Array.from(container.querySelectorAll(".pdf-page")) as HTMLElement[];

      overlay.addLog(`${iteration === 1 ? "Capturando" : "Re-capturando"} ${pageElements.length} página(s)...`);

      let totalPages = 0;
      const diagnoses: PageDiagnosis[] = [];
      const allCanvases: HTMLCanvasElement[] = [];

      for (let i = 0; i < pageElements.length; i++) {
        const pct = ((i + 1) / pageElements.length) * 90;
        overlay.setProgress(pct, `Página ${i + 1} de ${pageElements.length}`);

        const placeholderThumb = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='68' height='96'%3E%3Crect fill='%231e293b' width='68' height='96'/%3E%3C/svg%3E";
        overlay.setPageStatus(i, placeholderThumb, "capturing", "Capturando...");

        let result = await capturePageElement(pageElements[i], html2canvas, pdf, totalPages, 1);

        if (result.pagesAdded === 0) {
          result = await capturePageElement(pageElements[i], html2canvas, pdf, totalPages, 1.5);
        }

        totalPages += result.pagesAdded;
        result.canvases.forEach(c => allCanvases.push(c));

        // Analyze captured canvases for this section
        const startCi = allCanvases.length - result.pagesAdded;
        for (let ci = startCi; ci < allCanvases.length; ci++) {
          const diagnosis = analyzePageCanvas(allCanvases[ci], ci);
          diagnoses.push(diagnosis);
          const fix = suggestFix(diagnosis, ci === 0, false);
          const statusType = fix === "ok" ? "ok" : fix === "needs_reflow" ? "error" : "warning";
          overlay.setPageStatus(ci, diagnosis.thumbnail, statusType, formatDiagnosis(diagnosis));
        }
      }

      const avgScore = diagnoses.length > 0 ? Math.round(diagnoses.reduce((s, d) => s + d.overallScore, 0) / diagnoses.length) : 100;
      finalScore = avgScore;
      overlay.setScore(avgScore);
      overlay.addLog(`Score de qualidade: ${avgScore}/100 (${diagnoses.length} páginas)`);

      // Check for problems
      const problemPages: { idx: number; fix: FixSuggestion; diagnosis: PageDiagnosis }[] = [];
      diagnoses.forEach((d, idx) => {
        const fix = suggestFix(d, idx === 0, idx === diagnoses.length - 1);
        if (fix !== "ok") problemPages.push({ idx, fix, diagnosis: d });
      });

      if (problemPages.length === 0 || isLastIteration) {
        if (problemPages.length > 0) {
          overlay.addLog(`⚠ ${problemPages.length} página(s) com alerta(s) restante(s)`);
        } else {
          overlay.addLog("✓ Todas as páginas passaram na análise de qualidade");
        }

        if (totalPages === 0) {
          overlay.addLog("⚠ Nenhuma página capturada. Usando fallback...");
          overlay.setPhase("Usando método alternativo...");
          await new Promise<void>((resolve) => {
            const fallbackPdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
            fallbackPdf.html(container!, {
              x: 0, y: 0, width: PDF_W_MM, windowWidth: container!.scrollWidth,
              autoPaging: "text",
              html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
              callback: (doc) => { doc.save(fileName); resolve(); },
            });
          });
        } else {
          pdf.save(fileName);
        }

        overlay.setProgress(100, "Concluído");
        overlay.finish(totalPages, totalFixed, finalScore);
        return;
      }

      // Apply corrections
      overlay.setPhase("Aplicando correções automáticas...");
      overlay.addLog(`${problemPages.length} página(s) com problemas — corrigindo...`);

      let newSections = [...sections];
      const mergeActions = problemPages
        .filter(p => p.fix === "merge_with_previous" || p.fix === "merge_with_next")
        .sort((a, b) => b.idx - a.idx);

      for (const action of mergeActions) {
        if (action.fix === "merge_with_previous" && action.idx > 0 && action.idx < newSections.length) {
          overlay.addLog(`→ Pág ${action.idx + 1}: ${Math.round(action.diagnosis.emptyRatio * 100)}% vazia → consolidando com anterior`);
          overlay.setPageStatus(action.idx, action.diagnosis.thumbnail, "fixing", "Consolidando...");
          newSections = mergeSections(newSections, action.idx - 1, action.idx);
          totalFixed++;
        } else if (action.fix === "merge_with_next" && action.idx < newSections.length - 1) {
          overlay.addLog(`→ Pág ${action.idx + 1}: ${Math.round(action.diagnosis.emptyRatio * 100)}% vazia → consolidando com próxima`);
          overlay.setPageStatus(action.idx, action.diagnosis.thumbnail, "fixing", "Consolidando...");
          newSections = mergeSections(newSections, action.idx, action.idx + 1);
          totalFixed++;
        }
      }

      const reflowActions = problemPages.filter(p => p.fix === "needs_reflow");
      for (const action of reflowActions) {
        overlay.addLog(`→ Pág ${action.idx + 1}: conteúdo na borda inferior → re-dividindo`);
        overlay.setPageStatus(action.idx, action.diagnosis.thumbnail, "fixing", "Re-dividindo...");
        totalFixed++;
      }

      sections = newSections;
      overlay.addLog(`Seções ajustadas: ${sections.length}. Re-capturando...`);
    }
  } catch (error) {
    overlay.addLog(`✗ ERRO: ${(error as Error).message}`);
    overlay.setPhase("Erro na geração");
    console.error("[PDF] Generation failed:", error);
    setTimeout(() => overlay.remove(), 4000);
    throw new Error("Não foi possível gerar o PDF. Tente novamente.");
  } finally {
    container?.remove();
  }
}
