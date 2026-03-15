import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, PageBreak,
  Header, Footer, TabStopPosition, TabStopType,
  ShadingType, convertInchesToTwip, ImageRun,
  TableLayoutType, HeightRule, VerticalAlign, PageNumber, NumberFormat,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, ReportType, Task, PsychosocialAnalysis, RiskAssessment, ActionPlan } from "./types";
import { riskLevelLabel, statusLabel } from "./types";
import { mockRiskAssessments, mockActionPlans, mockTasks, mockPsychosocialAnalyses, mockPostureAnalyses } from "./mock-data";

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

// ============ PROFESSIONAL COLOR PALETTE ============
const COLORS = {
  // Main palette
  primary: "1B2A4A",      // Deep navy blue
  secondary: "3D5A80",    // Steel blue
  muted: "6B7B8D",        // Warm gray
  light: "98A2B3",        // Light gray
  accent: "2E86AB",       // Professional teal-blue accent
  accentDark: "1A6B8A",   // Darker accent

  // Table colors
  headerBg: "1B2A4A",     // Dark navy header
  headerText: "FFFFFF",   // White text on headers
  headerBg2: "3D5A80",    // Secondary header (sub-sections)
  rowAlt: "F0F4F8",       // Alternating row (light blue-gray)
  rowWhite: "FFFFFF",     // Normal row
  cellLabel: "EDF2F7",    // Label cells in info tables

  // Status colors
  white: "FFFFFF",
  border: "CBD5E1",       // Softer border
  borderDark: "94A3B8",   // Stronger border for headers
  greenBg: "D1FAE5",
  greenText: "065F46",
  yellowBg: "FEF3C7",
  yellowText: "92400E",
  redBg: "FEE2E2",
  redText: "991B1B",
  orangeBg: "FFEDD5",
  orangeText: "9A3412",

  // Cover & decorative
  coverBorder: "1B2A4A",
  coverAccent: "2E86AB",
  footerBg: "F8FAFC",
};

// ============ BORDER STYLES ============
function borderNone() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
}

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

// ============ CELL HELPERS ============
const CELL_MARGINS = {
  top: convertInchesToTwip(0.04),
  bottom: convertInchesToTwip(0.04),
  left: convertInchesToTwip(0.08),
  right: convertInchesToTwip(0.08),
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 19, font: "Calibri", color: COLORS.headerText })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40 },
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
      children: [new TextRun({ text, bold: true, size: 19, font: "Calibri", color: COLORS.white })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40 },
    })],
    shading: { type: ShadingType.SOLID, fill: COLORS.headerBg2, color: COLORS.headerBg2 },
    borders: borderHeader(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
  });
}

function textCell(text: string, bold = false, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: COLORS.primary })],
      spacing: { before: 30, after: 30 },
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
      spacing: { before: 30, after: 30 },
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
      spacing: { before: 30, after: 30 },
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
      spacing: { before: 30, after: 30 },
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
      children: [new TextRun({ text, size: 19, font: "Calibri", bold: true, color: colors[level] })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 30, after: 30 },
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
      children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: fill === COLORS.headerBg ? COLORS.white : COLORS.primary })],
      spacing: { before: 40, after: 40 },
    })],
    borders: fill === COLORS.headerBg ? borderHeader() : borderStyle(),
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
        size: isH1 ? 28 : isH2 ? 24 : 22,
        font: "Calibri",
        color: isH1 ? COLORS.primary : isH2 ? COLORS.secondary : COLORS.secondary,
      }),
    ],
    spacing: { before: isH1 ? 480 : 360, after: isH1 ? 200 : 120 },
    border: isH1 ? {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent, space: 4 },
    } : undefined,
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

function numberedItem(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", color: COLORS.primary })],
    numbering: { reference: "default-numbering", level: 0 },
    spacing: { after: 60 },
  });
}

function decorativeLine(color = COLORS.accent): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 2 } },
    spacing: { before: 100, after: 200 },
  });
}

function spacer(twips = 200): Paragraph {
  return new Paragraph({ spacing: { before: twips } });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

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
      children: [
        new ImageRun({
          data: buffer,
          transformation: { width: finalW, height: finalH },
          type: "png",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  ];

  if (caption) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: caption, size: 18, font: "Calibri", italics: true, color: COLORS.muted })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  return paragraphs;
}

function getToday(): string {
  return new Date().toLocaleDateString("pt-BR");
}

function getTodayFull(): string {
  const d = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

function createCoverPage(title: string, subtitle: string, company: Company, consultant: string): Paragraph[] {
  const year = new Date().getFullYear().toString();
  return [
    // Top decorative line
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent, space: 1 } },
      spacing: { before: 800, after: 200 },
    }),
    new Paragraph({ spacing: { before: 1200 } }),
    // Title
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 52, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    // Accent line under title
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.accent, space: 1 } },
      spacing: { after: 80 },
      indent: { left: convertInchesToTwip(2), right: convertInchesToTwip(2) },
    }),
    // Subtitle / year
    new Paragraph({
      children: [
        new TextRun({ text: subtitle, size: 36, font: "Calibri", color: COLORS.accent, bold: true }),
        new TextRun({ text: `  —  ${year}`, size: 28, font: "Calibri", color: COLORS.muted }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Company name
    new Paragraph({
      children: [new TextRun({ text: company.name.toUpperCase(), bold: true, size: 36, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    // CNPJ
    new Paragraph({
      children: [new TextRun({ text: `CNPJ: ${company.cnpj}`, size: 22, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    // Address
    new Paragraph({
      children: [new TextRun({ text: `${company.address} — ${company.city}/${company.state}`, size: 20, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Consultant
    new Paragraph({
      children: [
        new TextRun({ text: "Responsável Técnico: ", size: 20, font: "Calibri", color: COLORS.secondary }),
        new TextRun({ text: consultant, size: 20, font: "Calibri", color: COLORS.primary, bold: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    // Firm name
    new Paragraph({
      children: [new TextRun({ text: "MG Consultoria — Ergonomia & Segurança do Trabalho", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    // Bottom decorative line
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent, space: 1 } },
      spacing: { before: 400, after: 200 },
    }),
    pageBreak(),
  ];
}

function createRevisionTable(): (Paragraph | Table)[] {
  return [
    heading("CONTROLE DE REVISÕES", HeadingLevel.HEADING_2),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [headerCell("REVISÃO", 15), headerCell("DATA", 30), headerCell("PÁGINA", 20), headerCell("DESCRIÇÃO", 35)],
          height: { value: convertInchesToTwip(0.35), rule: HeightRule.AT_LEAST },
        }),
        new TableRow({ children: [textCell("00", false, 15), textCell(getTodayFull(), false, 30), textCell("TODAS", false, 20), textCell("Emissão Inicial", false, 35)] }),
      ],
    }),
    spacer(200),
  ];
}

function createInfoTable(company: Company, sectorName: string, wsName: string): Table {
  const rows: [string, string][] = [
    ["Razão Social", company.name],
    ["Nome Fantasia", company.name],
    ["CNPJ", company.cnpj],
    ["Endereço", company.address],
    ["Cidade/UF", `${company.city}/${company.state}`],
    ["Descrição", company.description],
    ["Setor(es) Avaliado(s)", sectorName],
    ["Posto(s) de Trabalho", wsName],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [mergedCell("DADOS DA ORGANIZAÇÃO", 2, true, COLORS.headerBg)],
        height: { value: convertInchesToTwip(0.35), rule: HeightRule.AT_LEAST },
      }),
      ...rows.map(([label, value], i) =>
        new TableRow({
          children: [
            labelCell(label, 30),
            altCell(value, i % 2 === 1, false, 70),
          ],
        })
      ),
    ],
  });
}

function createProfessionalHeader(reportType: string, companyName: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${reportType} — ${companyName}`, size: 16, font: "Calibri", color: COLORS.light, italics: true }),
          new TextRun({ text: "    |    ", size: 16, font: "Calibri", color: COLORS.border }),
          new TextRun({ text: "MG Consultoria", size: 16, font: "Calibri", color: COLORS.accent, bold: true }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent, space: 4 } },
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
          new TextRun({ text: "Spartan / MG Consultoria", size: 14, font: "Calibri", color: COLORS.accent, italics: true }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent, space: 4 } },
        spacing: { before: 200 },
      }),
    ],
  });
}
    ["Cidade/UF", `${company.city}/${company.state}`],
    ["Descrição", company.description],
    ["Setor(es) Avaliado(s)", sectorName],
    ["Posto(s) de Trabalho", wsName],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          textCell(label, true, 30),
          textCell(value, false, 70),
        ],
      })
    ),
  });
}

// ========== AET REPORT — Full professional structure ==========
async function generateAETDocx(ctx: DocxReportContext): Promise<Document> {
  const { company, sector, workstation, workstations, sectors, analyses, photos } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const wsIds = workstations.map(w => w.id);
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const tasks = mockTasks.filter(t => wsIds.includes(t.workstation_id));
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);
  const methods = [...new Set(analyses.map(a => a.method))].join(", ") || "REBA, OCRA, ROSA";
  const sectorName = sector?.name || sectors.map(s => s.name).join(", ") || "Geral";
  const wsName = workstation?.name || workstations.map(w => w.name).join(", ");

  const children: any[] = [];

  // ===== COVER PAGE =====
  children.push(...createCoverPage("ANÁLISE ERGONÔMICA DO TRABALHO", "AET", company, consultant));

  // ===== TABLE OF CONTENTS =====
  children.push(heading("ÍNDICE"));
  const tocItems = [
    "INTRODUÇÃO",
    "IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA",
    "OBJETIVOS",
    "REFERÊNCIAS NORMATIVAS",
    "ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO",
    "REFERENCIAL TEÓRICO",
    "ESTUDO ERGONÔMICO DO TRABALHO",
    "DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS",
    "AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA",
    "ANÁLISE DOS RISCOS PSICOSSOCIAIS",
    "RESPONSABILIDADE TÉCNICA",
  ];
  tocItems.forEach((item, i) => {
    children.push(body(`${i + 1}. ${item}`));
  });
  children.push(pageBreak());

  // ===== REVISION CONTROL =====
  children.push(...createRevisionTable());
  children.push(pageBreak());

  // ===== 1. INTRODUÇÃO =====
  children.push(heading("1. INTRODUÇÃO"));
  children.push(body("Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana."));
  children.push(body("A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa. Em qualquer ambiente industrial, pode-se compreender a atividade como um sistema que integra pessoas, máquinas e o meio ao redor. Quando esse sistema opera em condições inadequadas, surgem desconfortos imediatos, fadiga e até lesões ao longo do tempo."));
  children.push(body("Locais de trabalho planejados de forma incorreta tendem a reduzir o desempenho, comprometer a qualidade, elevar o absenteísmo e aumentar custos operacionais. A ergonomia busca tornar a interação entre trabalhador, equipamentos e ambiente o mais segura, eficiente e confortável possível, priorizando inicialmente a preservação da saúde e o bem-estar do colaborador e, como consequência, contribuindo para melhores resultados empresariais."));
  children.push(body(`Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho.`));
  children.push(pageBreak());

  // ===== 2. IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA =====
  children.push(heading("2. IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA"));
  children.push(heading("DADOS DA ORGANIZAÇÃO", HeadingLevel.HEADING_2));
  children.push(createInfoTable(company, sectorName, wsName));
  children.push(pageBreak());

  // ===== 3. OBJETIVOS =====
  children.push(heading("3. OBJETIVOS"));
  [
    "Observar e descrever o posto de trabalho e suas funções correspondentes;",
    "Avaliar a questão da biomecânica nas diferentes atividades;",
    "Estudar as condições de trabalho físico e mental dos colaboradores;",
    "Levantamento das relações interpessoais nos grupos;",
    "Identificar situações de risco quanto ao mobiliário, equipamentos, ferramentas e atitudes posturais inadequadas nos setores da empresa;",
    "Criar sensibilização para a cultura ergonômica dentro da empresa, através dos resultados da Análise Ergonômica do Trabalho;",
    "Sugerir soluções ergonômicas visando redução de queixas e melhora do desempenho e bem estar dos colaboradores.",
    "Atender a NR 17 do Ministério do Trabalho e Emprego.",
  ].forEach(t => children.push(bulletItem(t)));

  // ===== 4. REFERÊNCIAS NORMATIVAS =====
  children.push(heading("4. REFERÊNCIAS NORMATIVAS"));
  children.push(body("Norma Regulamentadora nº 17 – Ergonomia;"));
  children.push(body("Norma Regulamentadora nº 17 – Ergonomia – Anexo II – Call Center"));
  children.push(body("Esta Norma Regulamentadora tem como propósito definir critérios que permitam ajustar as condições laborais às características psicofisiológicas dos trabalhadores, garantindo maior conforto, segurança e eficiência na execução das atividades."));
  children.push(body("As condições de trabalho abrangem fatores relacionados ao levantamento, movimentação e descarga de materiais, ao mobiliário e equipamentos utilizados, bem como aos aspectos ambientais do posto e à própria forma de organização das tarefas."));

  const normasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Norma", 20), headerCell("Descrição", 80)] }),
      ...([
        ["NR-17", "Ergonomia — Parâmetros para adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores"],
        ["NR-01", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais — PGR"],
        ["NR-15", "Atividades e Operações Insalubres"],
        ["ISO 11228", "Ergonomia — Movimentação manual de cargas"],
        ["ISO 11226", "Ergonomia — Avaliação de posturas de trabalho estáticas"],
        ["ABNT NBR 11226", "Avaliação de Postura Estática do Trabalho"],
        ["CLT Art. 157-158", "Obrigações do empregador e empregados quanto à segurança do trabalho"],
      ] as [string, string][]).map(([norm, desc]) =>
        new TableRow({ children: [textCell(norm, true, 20), textCell(desc, false, 80)] })
      ),
    ],
  });
  children.push(normasTable);
  children.push(pageBreak());

  // ===== 5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO =====
  children.push(heading("5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO"));
  children.push(body(`A ${company.name} atua no segmento de ${company.description.toLowerCase()}. Suas atividades envolvem processos diversos desenvolvidos em ambiente interno e externo. As rotinas operacionais exigem permanência prolongada em pé, movimentos repetitivos de membros superiores, atenção constante e ritmo de trabalho variável conforme a demanda, fatores considerados na presente Análise Ergonômica do Trabalho, em conformidade com os preceitos da NR-17.`));

  // Organizational summary table
  const orgTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [mergedCell("ORGANIZAÇÃO DO TRABALHO", 2, true, COLORS.headerBg)] }),
      new TableRow({ children: [textCell("Setores Avaliados", true, 35), textCell(sectors.map(s => s.name).join(", "), false, 65)] }),
      new TableRow({ children: [textCell("Nº de Postos Analisados", true, 35), textCell(String(workstations.length), false, 65)] }),
      new TableRow({ children: [textCell("Métodos Aplicados", true, 35), textCell(methods, false, 65)] }),
      new TableRow({ children: [textCell("Nº de Fotos Posturais", true, 35), textCell(String(photos.length), false, 65)] }),
      new TableRow({ children: [textCell("Nº de Análises Realizadas", true, 35), textCell(String(analyses.length), false, 65)] }),
      new TableRow({ children: [textCell("Riscos Identificados", true, 35), textCell(String(risks.length), false, 65)] }),
    ],
  });
  children.push(orgTable);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  workstations.forEach(ws => {
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
    const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
    const posAnalysis = mockPostureAnalyses.find(pa => pa.workstation_id === ws.id);

    children.push(heading(`Posto: ${ws.name}${wsSector ? ` (${wsSector.name})` : ""}`, HeadingLevel.HEADING_3));

    // Per-workstation detail table
    const wsDetailTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [textCell("Setor", true, 30), textCell(wsSector?.name || "—", false, 70)] }),
        new TableRow({ children: [textCell("Descrição da Atividade", true, 30), textCell(ws.activity_description || ws.description, false, 70)] }),
        new TableRow({ children: [textCell("Descrição Física do Posto", true, 30), textCell(ws.description, false, 70)] }),
        new TableRow({ children: [textCell("Tarefas Executadas", true, 30), textCell(ws.tasks_performed, false, 70)] }),
        new TableRow({ children: [textCell("Nº de Fotos Registradas", true, 30), textCell(String(wsPhotos.length), false, 70)] }),
        new TableRow({ children: [textCell("Análises Aplicadas", true, 30), textCell(wsAnalyses.map(a => `${a.method} (Score: ${a.score})`).join(", ") || "Nenhuma", false, 70)] }),
      ],
    });
    children.push(wsDetailTable);

    if (posAnalysis) {
      children.push(body("Ângulos Articulares Medidos:", { bold: true, spacing: { before: 120, after: 60 } }));
      const angleTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Articulação", 40), headerCell("Ângulo (°)", 30), headerCell("Classificação", 30)] }),
          ...Object.entries(posAnalysis.joint_angles).map(([joint, angle]) => {
            const jointLabel = { neck: "Pescoço", shoulder: "Ombro", elbow: "Cotovelo", trunk: "Tronco", hip: "Quadril", knee: "Joelho" }[joint] || joint;
            const riskClass = angle > 45 ? "Atenção" : angle > 20 ? "Moderado" : "Aceitável";
            return new TableRow({
              children: [textCell(jointLabel, false, 40), textCell(`${angle}°`, true, 30), textCell(riskClass, false, 30)],
            });
          }),
        ],
      });
      children.push(angleTable);
    }

    children.push(body("Tarefas executadas:", { bold: true, spacing: { before: 120, after: 60 } }));
    if (wsTasks.length > 0) {
      wsTasks.forEach(t => children.push(bulletItem(t.description)));
    } else {
      children.push(bulletItem(ws.tasks_performed));
    }
  });
  children.push(pageBreak());

  // ===== 6. REFERENCIAL TEÓRICO (expanded) =====
  children.push(heading("6. REFERENCIAL TEÓRICO"));
  children.push(body("O uso inadequado do sistema osteomuscular pode ser compensado por mecanismos naturais de recuperação, que restauram tecidos desgastados. Entretanto, quando esforços contínuos e traumas repetitivos se acumulam, torna-se essencial oferecer períodos de repouso para permitir a regeneração muscular; caso contrário, instala-se o processo de lesão."));
  children.push(body("A produtividade tende a aumentar quando o trabalhador adota posturas corretas e quando o ambiente é organizado para prevenir riscos. Medidas como a eliminação de barreiras à movimentação, remoção de passagens estreitas, correção de pisos escorregadios e proteção de superfícies cortantes tornam o local mais seguro e eficiente."));
  children.push(body("As pausas durante atividades físicas trazem benefícios relevantes. Em esforços estáticos, auxiliam na remoção do ácido lático das fibras musculares; em tarefas muito repetitivas, oferecem tempo para que tendões recuperem sua forma, respeitando sua natureza viscoelástica. Além disso, as interrupções favorecem a produção de líquido sinovial, que reduz o atrito entre estruturas articulares."));
  children.push(body("Os principais fatores biomecânicos relacionados ao surgimento de lesões incluem força excessiva, posturas inadequadas, repetitividade elevada e compressões mecânicas, sendo o descanso insuficiente o fator crítico. Temperaturas baixas reduzem o fluxo sanguíneo periférico e dificultam a nutrição e reparação dos tecidos, enquanto ambientes muito quentes geram desconforto e potencializam o componente psicológico do adoecimento."));
  children.push(body("As mulheres apresentam maior suscetibilidade ao desenvolvimento de lesões musculoesqueléticas devido a particularidades fisiológicas, como menor resistência de determinadas estruturas e influência hormonal dos estrógenos, que podem retardar a resolução de processos inflamatórios. Soma-se a isso a sobrecarga decorrente da dupla jornada, incluindo atividades domésticas."));
  children.push(body("Um trabalho é classificado como altamente repetitivo quando o ciclo de execução possui duração inferior a 30 segundos ou, quando superior a esse tempo, mais de 50% do ciclo é dedicado ao mesmo padrão de movimento."));

  children.push(heading("Posturas dos membros superiores e sua relação patológica:", HeadingLevel.HEADING_3));
  [
    "Braço fletido ou abduzido durante um tempo significativo – contribui para o aparecimento de tendinite do ombro;",
    "O antebraço fletido sobre o braço, associado à supinação – gera uma sobrecarga tensional sobre o bíceps, com a possibilidade de tendinite do músculo bíceps;",
    "Movimentação frequente de supinação e pronação – leva a tendinite de pronador redondo;",
    "Flexão frequente do punho – leva a tenossinovite dos flexores, compressão do nervo mediano no túnel do carpo e a epicondilite medial;",
    "Extensão frequente do punho – leva a tenossinovite dos extensores, compressão do nervo mediano no túnel do carpo e epicondilite lateral;",
    "Desvio ulnar frequente – leva a Tenossinovite de Quervain;",
    "Cabeça excessivamente estendida – leva a fibromialgia do trapézio e esternocleidomastóideo;",
    "Cabeça excessivamente fletida – leva a cervicobraquialgia.",
  ].forEach(t => children.push(bulletItem(t)));
  children.push(body("Com base nos pontos analisados, conclui-se que as ações ergonômicas necessárias devem priorizar a diminuição de posturas inadequadas da cabeça, tronco e membros superiores, a redução de movimentos repetitivos e a adequação da altura dos equipamentos à estatura dos trabalhadores, além da implementação de um rodízio de funções eficaz."));
  children.push(pageBreak());

  // ===== 7. ESTUDO ERGONÔMICO DO TRABALHO =====
  children.push(heading("7. ESTUDO ERGONÔMICO DO TRABALHO"));
  children.push(body("A realização do Estudo Ergonômico do Trabalho é indispensável não apenas pelo cumprimento da NR-17, mas também por atuar como instrumento complementar ao PGR e ao PCMSO. Sua aplicação fortalece a empresa na prevenção de doenças ocupacionais, na manutenção da produtividade e na correção de inadequações ergonômicas do ambiente laboral. Há diversas metodologias para conduzir esse estudo, e o presente trabalho foi elaborado com base nas análises e resultados desenvolvidos pela MG CONSULT."));

  children.push(heading("7.1 Registro Postural", HeadingLevel.HEADING_3));
  if (photos.length > 0) {
    children.push(body(`Foram registradas ${photos.length} posturas de trabalho para documentação e análise biomecânica:`));
    for (const photo of photos) {
      if (photo.image_url && photo.image_url !== "/placeholder.svg") {
        const imgData = await fetchImageAsBuffer(photo.image_url);
        if (imgData) {
          children.push(...createImageParagraph(imgData.buffer, imgData.width, imgData.height, `${photo.posture_type} — ${photo.notes}`));
        }
      }
    }
    const photoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Postura", 30), headerCell("Observações", 50), headerCell("Data", 20)] }),
        ...photos.map(p => new TableRow({
          children: [textCell(p.posture_type, true, 30), textCell(p.notes, false, 50), textCell(p.created_at, false, 20)],
        })),
      ],
    });
    children.push(photoTable);
  } else {
    children.push(body("Nenhuma postura registrada."));
  }

  children.push(heading("7.2 Análises Ergonômicas", HeadingLevel.HEADING_3));
  if (analyses.length > 0) {
    children.push(body(`As análises foram realizadas utilizando os métodos: ${methods}. O detalhamento por segmento corporal é apresentado a seguir:`));

    const bodyPartLabels: Record<string, string> = {
      trunk: "Tronco", neck: "Pescoço", legs: "Pernas", upper_arm: "Braço Superior",
      lower_arm: "Antebraço", wrist: "Punho", chair: "Cadeira", monitor: "Monitor",
      keyboard: "Teclado", mouse: "Mouse", telephone: "Telefone",
    };

    analyses.forEach(a => {
      const ws = workstations.find(w => w.id === a.workstation_id);
      const risk = risks.find(r => r.analysis_id === a.id);
      const wsSector = sectors.find(s => s.id === ws?.sector_id);

      // Summary table
      const analysisTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [mergedCell(`${ws?.name || "—"} — ${wsSector?.name || ""}`, 2, true, COLORS.headerBg)] }),
          new TableRow({ children: [textCell("Método", true, 30), textCell(a.method, false, 70)] }),
          new TableRow({ children: [textCell("Score Final", true, 30), textCell(String(a.score), false, 70)] }),
          new TableRow({ children: [textCell("Nível de Risco", true, 30), textCell(risk ? riskLevelLabel(risk.risk_level) : "N/A", false, 70)] }),
          new TableRow({ children: [textCell("Status", true, 30), textCell(a.analysis_status === "completed" ? "Concluída" : a.analysis_status === "in_progress" ? "Em Andamento" : "Pendente", false, 70)] }),
          new TableRow({ children: [textCell("Observações", true, 30), textCell(a.notes, false, 70)] }),
        ],
      });
      children.push(analysisTable);
      children.push(new Paragraph({ spacing: { after: 100 } }));

      // Body parts breakdown
      if (Object.keys(a.body_parts).length > 0) {
        children.push(body("Pontuação por Segmento Corporal:", { bold: true, spacing: { before: 60, after: 60 } }));
        const bpRows: TableRow[] = [
          new TableRow({ children: [headerCell("Segmento Corporal", 40), headerCell("Pontuação", 20), headerCell("Interpretação", 40)] }),
        ];
        Object.entries(a.body_parts).forEach(([part, score]) => {
          const label = bodyPartLabels[part] || part;
          const interp = score <= 1 ? "Postura aceitável" : score <= 2 ? "Risco leve – monitorar" : score <= 3 ? "Risco moderado – investigar" : score <= 4 ? "Risco alto – ação necessária" : "Risco muito alto – ação imediata";
          const fill = score <= 1 ? COLORS.greenBg : score <= 2 ? COLORS.greenBg : score <= 3 ? COLORS.yellowBg : COLORS.redBg;
          bpRows.push(new TableRow({
            children: [textCell(label, false, 40), textCell(String(score), true, 20), shadedCell(interp, fill, false, 40)],
          }));
        });
        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: bpRows }));
      }

      // Risk details if available
      if (risk) {
        children.push(body(`Avaliação de Risco: Probabilidade ${risk.probability} × Exposição ${risk.exposure} × Consequência ${risk.consequence} = Score ${risk.risk_score} (${riskLevelLabel(risk.risk_level)})`, { spacing: { before: 60, after: 60 } }));
      }

      children.push(new Paragraph({ spacing: { after: 300 } }));
    });
  } else {
    children.push(body("Nenhuma análise realizada."));
  }
  children.push(pageBreak());

  // ===== 8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS =====
  children.push(heading("8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS"));
  children.push(body("No âmbito do Programa de Análise Ergonômica do Trabalho da empresa, adotou-se a seguinte abordagem metodológica:"));
  [
    "Consultoria Inicial: Etapa destinada à coleta de informações sobre a empresa, seus colaboradores e as prioridades de avaliação, realizada em conjunto com os setores de Segurança e Medicina do Trabalho.",
    "Observação dos Postos e Postura de Trabalho Descritiva: Inspeção presencial minuciosa de cada posto, aliada a entrevistas e troca de informações com os trabalhadores.",
    "Aplicação de questionários: Utilizados para identificar a percepção dos colaboradores quanto às condições ergonômicas.",
  ].forEach(t => children.push(bulletItem(t)));

  children.push(heading("Ferramentas Ergonômicas:", HeadingLevel.HEADING_3));
  children.push(body("REBA (Rapid Entire Body Assessment): Criado por Hignett e McAtamney (2000), o método tem como finalidade estimar o risco de desenvolvimento de distúrbios musculoesqueléticos decorrentes das posturas adotadas no trabalho. Trata-se de uma ferramenta indicada para analisar tarefas que envolvem manipulação de pessoas ou cargas em movimento. O REBA considera fatores posturais estáticos e dinâmicos na interação trabalhador–carga e incorpora o conceito de \"assistência gravitacional\". A análise é realizada por meio de observação estruturada dos ciclos de trabalho, pontuando posturas de tronco, pescoço, membros superiores e inferiores conforme tabelas específicas para cada segmento corporal."));
  children.push(body("OCRA (Occupational Repetitive Actions): Metodologia internacionalmente reconhecida para avaliação do risco de lesões musculoesqueléticas associadas a movimentos repetitivos dos membros superiores. Desenvolvido por Colombini, Occhipinti e colaboradores, sendo amplamente utilizado em setores que exigem repetição contínua de tarefas."));
  children.push(body("ROSA (Rapid Office Strain Assessment): Ferramenta ergonômica usada para identificar riscos musculoesqueléticos em postos administrativos, especialmente aqueles com uso contínuo de computador. O método avalia cadeira, mesa, monitor, teclado, mouse e telefone, gerando um escore que indica o nível de risco."));

  // Methods classification table
  const methodsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Método", 15), headerCell("Aplicação", 45), headerCell("Classificação", 40)] }),
      ...([
        ["REBA", "Avaliação rápida do corpo inteiro", "1: Insignificante | 2-3: Baixo | 4-7: Médio | 8-10: Alto | >11: Muito Alto"],
        ["RULA", "Avaliação rápida de membros superiores", "1-2: Aceitável | 3-4: Investigar | 5-6: Mudar breve | 7: Mudar já"],
        ["ROSA", "Avaliação de postos informatizados", "1-2: Desprezível | 3-4: Baixo | 5-6: Médio | 7+: Alto"],
        ["OWAS", "Sistema de análise de posturas", "1: Normal | 2: Leve | 3: Severo | 4: Muito severo"],
        ["OCRA", "Avaliação de movimentos repetitivos", "≤2.2: Aceitável | 2.3-3.5: Borderline | >3.5: Risco"],
      ] as [string, string, string][]).map(([m, app, cls]) =>
        new TableRow({ children: [textCell(m, true, 15), textCell(app, false, 45), textCell(cls, false, 40)] })
      ),
    ],
  });
  children.push(methodsTable);

  children.push(body("Normas referenciais consideradas:", { bold: true }));
  children.push(bulletItem("Levantamento, transporte e descarga individual de materiais."));
  children.push(bulletItem("Mobiliário dos postos de trabalho."));
  children.push(bulletItem("Equipamentos dos postos de trabalho."));
  children.push(bulletItem("Condições ambientais de trabalho."));
  children.push(bulletItem("Pausas para descanso."));

  // 8.1 Equipment
  children.push(heading("8.1 EQUIPAMENTOS UTILIZADOS PARA MEDIÇÃO NO AMBIENTE DE TRABALHO", HeadingLevel.HEADING_2));

  const equipCalor = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [mergedCell("CALOR", 2, true, COLORS.headerBg)] }),
      new TableRow({ children: [textCell("Instrumento", true, 30), textCell("Medidor de stress térmico", false, 70)] }),
      new TableRow({ children: [textCell("Método", true, 30), textCell("NR-15, Portaria 3214/78, do MTE.", false, 70)] }),
      new TableRow({ children: [textCell("MOD", true, 30), textCell("Protemp-3", false, 70)] }),
      new TableRow({ children: [textCell("MARCA", true, 30), textCell("CRIFFER", false, 70)] }),
    ],
  });
  children.push(equipCalor);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  const equipRuido = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [mergedCell("RUÍDO", 2, true, COLORS.headerBg)] }),
      new TableRow({ children: [textCell("Instrumentos", true, 30), textCell("Decibelímetro", false, 70)] }),
      new TableRow({ children: [textCell("Método", true, 30), textCell("NHT – 06, FUNDACENTRO / NR-15, Portaria 3214/78, do MTE.", false, 70)] }),
      new TableRow({ children: [textCell("MOD", true, 30), textCell("DEC 490", false, 70)] }),
      new TableRow({ children: [textCell("MARCA", true, 30), textCell("INTRUTERM", false, 70)] }),
    ],
  });
  children.push(equipRuido);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  const equipLuz = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [mergedCell("ILUMINAÇÃO", 2, true, COLORS.headerBg)] }),
      new TableRow({ children: [textCell("Instrumento", true, 30), textCell("Luxímetro", false, 70)] }),
      new TableRow({ children: [textCell("Método", true, 30), textCell("NHO 11", false, 70)] }),
      new TableRow({ children: [textCell("MOD", true, 30), textCell("Ld 550", false, 70)] }),
      new TableRow({ children: [textCell("MARCA", true, 30), textCell("INSTRUTERM", false, 70)] }),
    ],
  });
  children.push(equipLuz);
  children.push(pageBreak());

  // ===== 9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA =====
  children.push(heading("9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA"));
  children.push(body(`A ${company.name} atua no segmento de ${company.description.toLowerCase()}, os trabalhadores são classificados em Grupos Homogêneos de Exposição (GHE), conforme metodologia adotada pelo Programa de Gerenciamento de Riscos (PGR). Essa classificação visa agrupar funções com condições de exposição semelhantes, possibilitando uma avaliação mais precisa dos riscos ergonômicos, biomecânicos e psicossociais presentes nas diferentes áreas da empresa.`));
  children.push(body("O enquadramento por GHE permite a integração entre os programas de gestão de riscos (GRO/PGR) e a Análise Ergonômica do Trabalho (AET), promovendo uma visão unificada da exposição ocupacional e das ações preventivas aplicáveis."));
  children.push(body(`Para isso, foram utilizadas metodologias reconhecidas, como ${methods}, associadas à Matriz de Classificação de Risco.`));

  // 9.1 GHE Table
  children.push(heading("9.1 Grupo Homogêneo de Exposição – GHE", HeadingLevel.HEADING_2));
  const gheRows: TableRow[] = [
    new TableRow({ children: [headerCell("GHE", 30), headerCell("Setor / Atividade", 20), headerCell("Descrição das Atividades", 50)] }),
  ];
  workstations.forEach((ws, i) => {
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    gheRows.push(new TableRow({
      children: [
        textCell(`GHE ${String(i + 1).padStart(2, "0")} - ${ws.name}`, true, 30),
        textCell(wsSector?.name || "—", false, 20),
        textCell(ws.activity_description || ws.description, false, 50),
      ],
    }));
  });
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: gheRows }));
  children.push(pageBreak());

  // 9.2 Risk Matrix
  children.push(heading("9.2 Matriz de Avaliação de Riscos", HeadingLevel.HEADING_2));
  children.push(body("A análise dos riscos ergonômicos foi realizada com base na Matriz de Probabilidade × Severidade, metodologia utilizada no PGR da empresa e alinhada aos princípios da AIHA (1998) e da norma BS 8800 (1996):"));
  children.push(body("Essa matriz permite avaliar o potencial de dano de uma situação de trabalho combinando dois fatores principais:"));
  children.push(bulletItem("Probabilidade (P): representa a chance de o trabalhador desenvolver um agravo ergonômico, considerando tempo de exposição, frequência e intensidade da tarefa;"));
  children.push(bulletItem("Severidade (S): expressa o grau de gravidade do possível dano à saúde, como desconforto, dor musculoesquelética, ou distúrbio osteomuscular (LER/DORT);"));
  children.push(body("O cruzamento desses dois fatores resulta no Nível de Risco (NR), que orienta a priorização das medidas corretivas ou preventivas:"));

  const riskMatrixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Severidade (S)", 25), headerCell("Probabilidade (P)", 25), headerCell("Nível de Risco", 15), headerCell("Classificação / Ação Recomendada", 35)] }),
      new TableRow({ children: [
        shadedCell("Leve / Reversível – desconfortos temporários, sem impacto funcional", COLORS.greenBg, false, 25),
        textCell("Baixa probabilidade – exposição eventual ou sob controle", false, 25),
        shadedCell("Baixo (Aceitável)", COLORS.greenBg, true, 15),
        textCell("Manter as condições atuais, reforçando boas práticas e pausas.", false, 35),
      ] }),
      new TableRow({ children: [
        shadedCell("Moderada / Desconforto persistente – sintomas repetitivos ou leves", COLORS.yellowBg, false, 25),
        textCell("Média probabilidade – exposição frequente, posturas mantidas", false, 25),
        shadedCell("Médio (Tolerável)", COLORS.yellowBg, true, 15),
        textCell("Promover ajustes ergonômicos, pausas regulares e orientação postural.", false, 35),
      ] }),
      new TableRow({ children: [
        shadedCell("Grave / Potencial de LER/DORT – dor crônica, limitação de movimento", COLORS.redBg, false, 25),
        textCell("Alta probabilidade – exposição contínua, sem pausas ou ajustes", false, 25),
        shadedCell("Alto (Crítico)", COLORS.redBg, true, 15),
        textCell("Implementar medidas corretivas imediatas no posto de trabalho.", false, 35),
      ] }),
    ],
  });
  children.push(riskMatrixTable);
  children.push(body("Critério de interpretação: quanto maior a severidade e a probabilidade combinadas, mais urgente é a necessidade de intervenção."));
  children.push(body("As medidas de controle podem envolver adequação de mobiliário, redistribuição de tarefas, pausas, ou revezamento funcional."));

  if (risks.length > 0) {
    children.push(heading("Matriz de Risco por Posto", HeadingLevel.HEADING_3));
    const riskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("GHE/Posto", 20), headerCell("Risco", 30), headerCell("P × E × C", 20), headerCell("Score", 15), headerCell("Nível", 15)] }),
        ...risks.map((r, i) => {
          const analysis = analyses.find(a => a.id === r.analysis_id);
          const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
          return new TableRow({
            children: [
              textCell(ws?.name || `GHE ${i + 1}`, false, 20),
              textCell(r.description, false, 30),
              textCell(`${r.probability} × ${r.exposure} × ${r.consequence}`, false, 20),
              textCell(String(r.risk_score), true, 15),
              textCell(riskLevelLabel(r.risk_level), true, 15),
            ],
          });
        }),
      ],
    });
    children.push(riskTable);
  }
  children.push(pageBreak());

  // ===== 10. ANÁLISE DOS RISCOS PSICOSSOCIAIS =====
  children.push(heading("10. ANÁLISE DOS RISCOS PSICOSSOCIAIS"));
  children.push(heading("10.1 Análise Complementar dos Riscos Psicossociais", HeadingLevel.HEADING_2));
  if (psychosocial.length > 0) {
    children.push(body(`A validação dos resultados psicossociais foi realizada também por meio da aplicação do instrumento COPSOQ II (Copenhagen Psychosocial Questionnaire), aplicado junto aos colaboradores da ${company.name}.`));
    children.push(body("Os resultados confirmam integralmente as observações descritas nesta AET: o ambiente organizacional apresenta níveis predominantemente baixos de risco psicossocial, com atenção pontual às demandas quantitativas e ao ritmo de trabalho, classificadas como moderadas, especialmente nos setores de produção."));
    children.push(body("A convergência entre as duas ferramentas (AET e COPSOQ II) reforça a confiabilidade da análise e evidencia a eficácia das medidas preventivas já adotadas pela empresa. Sendo apenas recomendada a manutenção do monitoramento contínuo dos fatores psicossociais no contexto do PGR e do PCMSO."));

    psychosocial.forEach(psa => {
      children.push(heading(`Avaliação${psa.workstation_id ? ` — ${workstations.find(w => w.id === psa.workstation_id)?.name || ""}` : ""}`, HeadingLevel.HEADING_3));
      children.push(body(`Avaliador: ${psa.evaluator_name}`, { bold: true }));

      if (psa.nasa_tlx_details) {
        children.push(heading("NASA-TLX", HeadingLevel.HEADING_4));
        const nasaTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (0-100)", 50)] }),
            ...([
              ["Demanda Mental", psa.nasa_tlx_details.mental_demand],
              ["Demanda Física", psa.nasa_tlx_details.physical_demand],
              ["Demanda Temporal", psa.nasa_tlx_details.temporal_demand],
              ["Performance", psa.nasa_tlx_details.performance],
              ["Esforço", psa.nasa_tlx_details.effort],
              ["Frustração", psa.nasa_tlx_details.frustration],
              ["Score Geral", psa.nasa_tlx_score],
            ] as [string, number | null][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(String(dim), dim === "Score Geral", 50), textCell(String(val ?? "—"), dim === "Score Geral", 50)] })
            ),
          ],
        });
        children.push(nasaTable);
      }

      if (psa.copenhagen_details) {
        children.push(heading("COPSOQ II (Copenhagen Psychosocial Questionnaire)", HeadingLevel.HEADING_4));
        const copTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (0-100)", 50)] }),
            ...([
              ["Demandas Quantitativas", psa.copenhagen_details.quantitative_demands],
              ["Ritmo de Trabalho", psa.copenhagen_details.work_pace],
              ["Demandas Cognitivas", psa.copenhagen_details.cognitive_demands],
              ["Demandas Emocionais", psa.copenhagen_details.emotional_demands],
              ["Influência no Trabalho", psa.copenhagen_details.influence],
              ["Possibilidades de Desenvolvimento", psa.copenhagen_details.possibilities_development],
              ["Significado do Trabalho", psa.copenhagen_details.meaning_work],
              ["Compromisso", psa.copenhagen_details.commitment],
              ["Previsibilidade", psa.copenhagen_details.predictability],
              ["Suporte Social", psa.copenhagen_details.social_support],
              ["Score Geral", psa.copenhagen_score],
            ] as [string, number | null][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(String(dim), dim === "Score Geral", 50), textCell(String(val ?? "—"), dim === "Score Geral", 50)] })
            ),
          ],
        });
        children.push(copTable);
      }

      if (psa.hse_it_details) {
        children.push(heading("HSE-IT", HeadingLevel.HEADING_4));
        const hseTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (1-5)", 50)] }),
            ...([
              ["Demandas", psa.hse_it_details.demands],
              ["Controle", psa.hse_it_details.control],
              ["Suporte", psa.hse_it_details.support],
              ["Relacionamentos", psa.hse_it_details.relationships],
              ["Papel", psa.hse_it_details.role],
              ["Mudança", psa.hse_it_details.change],
              ["Score Geral", psa.hse_it_score],
            ] as [string, number | null][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(String(dim), dim === "Score Geral", 50), textCell(String(val ?? "—"), dim === "Score Geral", 50)] })
            ),
          ],
        });
        children.push(hseTable);
      }

      children.push(body(`Observações: ${psa.observations}`));
    });
  } else {
    children.push(body("Nenhuma avaliação psicossocial realizada para esta empresa. Recomenda-se a aplicação dos questionários NASA-TLX, HSE-IT e Copenhagen Psychosocial Questionnaire para uma avaliação completa dos fatores psicossociais do trabalho."));
  }
  children.push(pageBreak());

  // ===== 11. RESPONSABILIDADE TÉCNICA =====
  children.push(heading("11. RESPONSABILIDADE TÉCNICA"));
  children.push(body("O presente documento foi elaborado sob a responsabilidade técnica de profissional habilitado, Especialista em Ergonomia e Engenheiro(a) de Segurança do Trabalho com registro nos seus respectivos conselhos."));
  children.push(body("Sendo de responsabilidade da empresa, programar, monitorar e assegurar o cumprimento desta Análise Ergonômica."));
  children.push(body(`${company.city}, ${getTodayFull()}.`));

  children.push(new Paragraph({ spacing: { before: 800 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Empregador ou Preposto", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: consultant, bold: true, size: 22, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Eng. de Segurança do Trabalho", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Especialista em Ergonomia", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "CREA/CONFEA: XXXXX", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));
  children.push(pageBreak());

  // ===== ANEXOS — Cover =====
  children.push(heading("ANEXOS"));
  [
    "ANÁLISE ERGONÔMICA DOS POSTOS;",
    "FERRAMENTAS APLICADAS;",
    "RELATÓRIO TÉCNICO FATORES PSICOSSOCIAIS;",
    "PLANO DE AÇÃO;",
  ].forEach(t => children.push(bulletItem(t)));
  children.push(pageBreak());

  // ===== ANEXO: Per-Workstation Detailed Analysis =====
  for (const ws of workstations) {
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
    const wsRisks = wsAnalyses.flatMap(a => risks.filter(r => r.analysis_id === a.id));
    const posAnalysis = mockPostureAnalyses.find(pa => pa.workstation_id === ws.id);
    const gheIndex = workstations.indexOf(ws) + 1;

    children.push(heading("RELATÓRIO DA ANÁLISE ERGONÔMICA", HeadingLevel.HEADING_1));

    // Header table
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("SETOR", 30), headerCell("FUNÇÕES", 50), headerCell("Nº AVALIAÇÃO", 20)] }),
        new TableRow({ children: [
          textCell(wsSector?.name || "—", false, 30),
          textCell(`GHE ${String(gheIndex).padStart(2, "0")}: ${ws.name}`, true, 50),
          textCell(String(gheIndex).padStart(2, "0"), false, 20),
        ] }),
      ],
    });
    children.push(headerTable);
    children.push(new Paragraph({ spacing: { after: 200 } }));

    // Equipment & tools
    const detailTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("MÁQUINAS E EQUIPAMENTOS", 50), headerCell("FERRAMENTAS E ACESSÓRIOS", 50)] }),
        new TableRow({ children: [textCell(ws.description || "—", false, 50), textCell(ws.tasks_performed || "—", false, 50)] }),
      ],
    });
    children.push(detailTable);
    children.push(new Paragraph({ spacing: { after: 100 } }));

    // Description física
    children.push(heading("DESCRIÇÃO FÍSICA DO POSTO", HeadingLevel.HEADING_3));
    children.push(body(ws.activity_description || ws.description));
    children.push(body(`Tarefas: ${ws.tasks_performed}`));
    if (wsTasks.length > 0) {
      wsTasks.forEach(t => children.push(bulletItem(t.description)));
    }
    children.push(new Paragraph({ spacing: { after: 100 } }));

    // Measurements
    const measTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [mergedCell("MEDIÇÕES", 2, true, COLORS.headerBg)] }),
        new TableRow({ children: [textCell("ILUMINAÇÃO – NHO11", true, 50), textCell("586 lux", false, 50)] }),
        new TableRow({ children: [textCell("CONFORTO TÉRMICO – NR-17", true, 50), textCell("Ventilação artificial e natural", false, 50)] }),
        new TableRow({ children: [textCell("RUÍDO", true, 50), textCell("Dentro dos limites aceitáveis", false, 50)] }),
      ],
    });
    children.push(measTable);
    children.push(new Paragraph({ spacing: { after: 200 } }));

    // Joint angles table if available
    if (posAnalysis) {
      children.push(heading("ÂNGULOS ARTICULARES MEDIDOS", HeadingLevel.HEADING_3));
      const jointLabels: Record<string, string> = {
        neck: "Pescoço", shoulder: "Ombro", elbow: "Cotovelo",
        trunk: "Tronco", hip: "Quadril", knee: "Joelho",
      };
      const angleRows: TableRow[] = [
        new TableRow({ children: [headerCell("Articulação", 25), headerCell("Ângulo Medido", 20), headerCell("Faixa Aceitável", 25), headerCell("Classificação", 30)] }),
      ];
      const acceptableRanges: Record<string, string> = {
        neck: "0° – 20°", shoulder: "0° – 20°", elbow: "80° – 100°",
        trunk: "0° – 10°", hip: "85° – 100°", knee: "160° – 180°",
      };
      Object.entries(posAnalysis.joint_angles).forEach(([joint, angle]) => {
        const label = jointLabels[joint] || joint;
        const range = acceptableRanges[joint] || "—";
        let classification: string;
        let fill: string;
        if (joint === "knee") {
          classification = angle >= 160 ? "Aceitável" : angle >= 140 ? "Atenção" : angle >= 110 ? "Risco Alto" : "Crítico";
          fill = angle >= 160 ? COLORS.greenBg : angle >= 140 ? COLORS.yellowBg : COLORS.redBg;
        } else if (joint === "trunk") {
          classification = angle <= 10 ? "Aceitável" : angle <= 20 ? "Atenção" : angle <= 40 ? "Risco Alto" : "Crítico";
          fill = angle <= 10 ? COLORS.greenBg : angle <= 20 ? COLORS.yellowBg : COLORS.redBg;
        } else if (joint === "shoulder" || joint === "neck") {
          classification = angle <= 20 ? "Aceitável" : angle <= 45 ? "Atenção" : angle <= 90 ? "Risco Alto" : "Crítico";
          fill = angle <= 20 ? COLORS.greenBg : angle <= 45 ? COLORS.yellowBg : COLORS.redBg;
        } else {
          classification = "Aceitável";
          fill = COLORS.greenBg;
        }
        angleRows.push(new TableRow({
          children: [textCell(label, false, 25), textCell(`${angle}°`, true, 20), textCell(range, false, 25), shadedCell(classification, fill, true, 30)],
        }));
      });
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: angleRows }));
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // Situações encontradas — generated from actual data
    children.push(heading("SITUAÇÕES ENCONTRADAS", HeadingLevel.HEADING_3));
    const situacoes: string[] = [];

    // Always add base situações
    situacoes.push(`Permanência prolongada em posição ortostática (em pé) durante praticamente toda a jornada – NR-17, item 17.3.4.`);
    situacoes.push(`Ausência de assentos para descanso ou alternância postural durante a atividade – NR-17, item 17.3.4.`);

    // Add specific situações based on analysis data
    if (posAnalysis) {
      const angles = posAnalysis.joint_angles;
      if (angles.trunk && angles.trunk > 10) {
        situacoes.push(`Postura estática com flexão de tronco de ${angles.trunk}° durante a execução da atividade, acima do limite aceitável de 10° – NR-17, item 17.3.2.`);
      }
      if (angles.neck && angles.neck > 20) {
        situacoes.push(`Flexão cervical de ${angles.neck}° durante a atividade, exigindo inclinação da cabeça para visualização do trabalho – NR-17, item 17.3.2.`);
      }
      if (angles.shoulder && angles.shoulder > 20) {
        situacoes.push(`Elevação dos braços com ângulo de ${angles.shoulder}° nos ombros, acima da faixa neutra de 20° – NR-17, item 17.2.3.`);
      }
      if (angles.knee && angles.knee < 160) {
        situacoes.push(`Flexão dos joelhos a ${angles.knee}°, indicando posição agachada ou semi-agachada durante partes da tarefa – NR-17, item 17.3.4.`);
      }
    }

    // Add from analysis notes
    wsAnalyses.forEach(a => {
      if (a.notes.toLowerCase().includes("repetitivo") || a.notes.toLowerCase().includes("movimentos")) {
        situacoes.push(`Movimentos repetitivos de membros superiores identificados pela análise ${a.method} – NR-17, item 17.6.`);
      }
      if (a.notes.toLowerCase().includes("elevação") || a.notes.toLowerCase().includes("ombro")) {
        situacoes.push(`Alcance frequente de objetos posicionados acima da linha dos ombros – NR-17, item 17.2.3.`);
      }
    });

    situacoes.push(`Exigência de atenção contínua, agilidade e concentração durante a jornada de trabalho – NR-17, item 17.6.`);

    // Remove duplicates
    const uniqueSituacoes = [...new Set(situacoes)];
    uniqueSituacoes.forEach((s, i) => children.push(body(`${i + 1}. ${s}`)));

    // Risk description table — enriched with multiple risk types
    children.push(heading("DESCRIÇÃO DOS RISCOS ERGONÔMICOS", HeadingLevel.HEADING_3));
    const riskDescRows: TableRow[] = [
      new TableRow({
        children: [
          headerCell("Tipos", 12),
          headerCell("Identificação de perigos", 20),
          headerCell("Possíveis Danos", 16),
          headerCell("Fonte Geradora", 16),
          headerCell("Tempo de exposição", 12),
          headerCell("P", 6),
          headerCell("S", 6),
          headerCell("NR", 8),
        ],
      }),
    ];

    // Always add base risks
    const defaultRiskData = [
      { type: "Biomecânico", hazard: "Permanência prolongada em pé, sem alternância postural", damage: "Fadiga muscular, dores lombares e em membros inferiores", source: "Atividade contínua", exposure: "Contínuo (6–8h/dia)", p: "M", s: "B", nr: "Baixo" },
      { type: "Biomecânico", hazard: "Movimentos repetitivos de membros superiores", damage: "Tendinites, dores em punhos, braços e ombros", source: ws.activity_description || ws.name, exposure: "Frequente", p: "M", s: "B", nr: "Baixo" },
      { type: "Organizacionais", hazard: "Ritmo intenso de trabalho, especialmente em horários de pico", damage: "Fadiga física e mental", source: "Organização do trabalho", exposure: "Diário", p: "M", s: "B", nr: "Baixo" },
      { type: "Psicossociais", hazard: "Ausência de pausas programadas", damage: "Sobrecarga física", source: "Jornada contínua em pé", exposure: "Frequente", p: "M", s: "B", nr: "Baixo" },
    ];

    // Enrich with actual risk data if available
    if (wsRisks.length > 0) {
      wsRisks.forEach(r => {
        const pLabel = r.probability <= 3 ? "B" : r.probability <= 6 ? "M" : "A";
        const sLabel = r.consequence <= 3 ? "B" : r.consequence <= 6 ? "M" : "A";
        riskDescRows.push(new TableRow({
          children: [
            textCell("Biomecânico", false, 12),
            textCell(r.description, false, 20),
            textCell("Desconfortos, fadiga, LER/DORT", false, 16),
            textCell(ws.name, false, 16),
            textCell("Contínuo", false, 12),
            textCell(pLabel, true, 6),
            textCell(sLabel, true, 6),
            textCell(riskLevelLabel(r.risk_level), true, 8),
          ],
        }));
      });
    }

    // Add default rows
    defaultRiskData.forEach(d => {
      riskDescRows.push(new TableRow({
        children: [
          textCell(d.type, false, 12),
          textCell(d.hazard, false, 20),
          textCell(d.damage, false, 16),
          textCell(d.source, false, 16),
          textCell(d.exposure, false, 12),
          textCell(d.p, true, 6),
          textCell(d.s, true, 6),
          textCell(d.nr, true, 8),
        ],
      }));
    });

    // Add posture-specific risks based on joint angles
    if (posAnalysis) {
      const angles = posAnalysis.joint_angles;
      if (angles.trunk && angles.trunk > 20) {
        riskDescRows.push(new TableRow({
          children: [
            textCell("Biomecânico", false, 12),
            textCell(`Flexão de tronco acentuada (${angles.trunk}°)`, false, 20),
            textCell("Lombalgias, hérnias discais", false, 16),
            textCell("Bancadas e preparo manual", false, 16),
            textCell("Frequente", false, 12),
            textCell("M", true, 6),
            textCell("M", true, 6),
            textCell("Médio", true, 8),
          ],
        }));
      }
      if (angles.shoulder && angles.shoulder > 20) {
        riskDescRows.push(new TableRow({
          children: [
            textCell("Biomecânico", false, 12),
            textCell(`Elevação dos ombros (${angles.shoulder}°)`, false, 20),
            textCell("Tendinite do ombro, bursite", false, 16),
            textCell("Alcance de objetos elevados", false, 16),
            textCell("Frequente", false, 12),
            textCell("M", true, 6),
            textCell("M", true, 6),
            textCell("Médio", true, 8),
          ],
        }));
      }
      if (angles.neck && angles.neck > 20) {
        riskDescRows.push(new TableRow({
          children: [
            textCell("Biomecânico", false, 12),
            textCell(`Flexão cervical excessiva (${angles.neck}°)`, false, 20),
            textCell("Cervicalgia, cervicobraquialgia", false, 16),
            textCell("Posição de visualização do trabalho", false, 16),
            textCell("Contínuo", false, 12),
            textCell("M", true, 6),
            textCell("B", true, 6),
            textCell("Baixo", true, 8),
          ],
        }));
      }
    }

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: riskDescRows }));
    children.push(body("Legendas: P: Probabilidade / S: Gravidade (Severidade) / B: Baixa / M: Médio / A: Alta / NR: Nível de Risco", { spacing: { before: 60, after: 200 } }));

    // Embed photos for this workstation
    if (wsPhotos.length > 0) {
      children.push(heading("Registro Fotográfico", HeadingLevel.HEADING_3));
      for (const photo of wsPhotos) {
        if (photo.image_url && photo.image_url !== "/placeholder.svg") {
          const imgData = await fetchImageAsBuffer(photo.image_url);
          if (imgData) {
            children.push(...createImageParagraph(imgData.buffer, imgData.width, imgData.height, `${photo.posture_type} — ${photo.notes}`));
          }
        }
      }
    }

    // REBA/RULA/ROSA result with Tabela A/B/C format
    if (wsAnalyses.length > 0) {
      wsAnalyses.forEach(a => {
        const bodyPartLabels: Record<string, string> = {
          trunk: "Tronco", neck: "Pescoço", legs: "Pernas", upper_arm: "Braço Superior",
          lower_arm: "Antebraço", wrist: "Punho", chair: "Cadeira", monitor: "Monitor",
          keyboard: "Teclado", mouse: "Mouse", telephone: "Telefone",
        };

        children.push(heading(`${a.method} (${a.method === "REBA" ? "Rapid Entire Body Assessment" : a.method === "RULA" ? "Rapid Upper Limb Assessment" : a.method === "ROSA" ? "Rapid Office Strain Assessment" : a.method})`, HeadingLevel.HEADING_3));

        // Reference line
        if (a.method === "REBA") {
          children.push(body("Referência: Sue Hignett and Lynn McAtamney, Rapid entire body assessment (REBA); Applied Ergonomics. 31:201-205, 2000.", { spacing: { after: 60 } }));
        } else if (a.method === "RULA") {
          children.push(body("Referência: McAtamney, L. & Corlett, E.N. RULA: a survey method for the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91-99, 1993.", { spacing: { after: 60 } }));
        }

        // Info header
        const infoTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [textCell("Empresa", true, 25), textCell(company.name, false, 75)] }),
            new TableRow({ children: [textCell("Função", true, 25), textCell(`GHE ${String(gheIndex).padStart(2, "0")}: ${ws.name}`, false, 75)] }),
            new TableRow({ children: [textCell("Data", true, 25), textCell(a.created_at, false, 75)] }),
            new TableRow({ children: [textCell("Local", true, 25), textCell(wsSector?.name || "—", false, 75)] }),
            new TableRow({ children: [textCell("Atividade", true, 25), textCell(ws.activity_description || ws.description, false, 75)] }),
            new TableRow({ children: [textCell("Analista", true, 25), textCell(consultant, false, 75)] }),
          ],
        });
        children.push(infoTable);
        children.push(new Paragraph({ spacing: { after: 120 } }));

        // Body parts score table (Tabela A/B/C format)
        if (a.method === "REBA" || a.method === "RULA") {
          const tabelaAparts = ["trunk", "neck", "legs"];
          const tabelaBparts = ["upper_arm", "lower_arm", "wrist"];

          children.push(body("Tabela A — Tronco, Pescoço e Pernas:", { bold: true, spacing: { before: 100, after: 60 } }));
          const tabARows: TableRow[] = [
            new TableRow({ children: [headerCell("Segmento", 40), headerCell("Pontuação", 30), headerCell("Observação", 30)] }),
          ];
          tabelaAparts.forEach(part => {
            const score = a.body_parts[part] ?? 0;
            const label = bodyPartLabels[part] || part;
            const obs = score >= 4 ? "Ação imediata" : score >= 3 ? "Ação necessária" : score >= 2 ? "Monitorar" : "Aceitável";
            tabARows.push(new TableRow({
              children: [textCell(label, false, 40), textCell(String(score), true, 30), textCell(obs, false, 30)],
            }));
          });
          // Add load/force
          tabARows.push(new TableRow({
            children: [textCell("Carga/Força", true, 40), textCell("0-1", true, 30), textCell("Carga leve ou intermitente", false, 30)],
          }));
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tabARows }));
          children.push(new Paragraph({ spacing: { after: 120 } }));

          children.push(body("Tabela B — Braço, Antebraço e Punho:", { bold: true, spacing: { before: 60, after: 60 } }));
          const tabBRows: TableRow[] = [
            new TableRow({ children: [headerCell("Segmento", 40), headerCell("Pontuação", 30), headerCell("Observação", 30)] }),
          ];
          tabelaBparts.forEach(part => {
            const score = a.body_parts[part] ?? 0;
            const label = bodyPartLabels[part] || part;
            const obs = score >= 4 ? "Ação imediata" : score >= 3 ? "Ação necessária" : score >= 2 ? "Monitorar" : "Aceitável";
            tabBRows.push(new TableRow({
              children: [textCell(label, false, 40), textCell(String(score), true, 30), textCell(obs, false, 30)],
            }));
          });
          // Add coupling
          tabBRows.push(new TableRow({
            children: [textCell("Pega (Coupling)", true, 40), textCell("0-1", true, 30), textCell("Pega aceitável", false, 30)],
          }));
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tabBRows }));
          children.push(new Paragraph({ spacing: { after: 120 } }));

          children.push(body("Tabela C — Resultado:", { bold: true, spacing: { before: 60, after: 60 } }));
          const tabCRows: TableRow[] = [
            new TableRow({ children: [headerCell("Score Tabela A", 25), headerCell("Score Tabela B", 25), headerCell("Atividade (+1)", 25), headerCell("Score Final", 25)] }),
            new TableRow({ children: [
              textCell(String(tabelaAparts.reduce((s, p) => s + (a.body_parts[p] ?? 0), 0)), true, 25),
              textCell(String(tabelaBparts.reduce((s, p) => s + (a.body_parts[p] ?? 0), 0)), true, 25),
              textCell("1", true, 25),
              textCell(String(a.score), true, 25),
            ] }),
          ];
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tabCRows }));
        } else if (a.method === "ROSA") {
          // ROSA specific table
          children.push(body("Avaliação por Componente do Posto:", { bold: true, spacing: { before: 100, after: 60 } }));
          const rosaRows: TableRow[] = [
            new TableRow({ children: [headerCell("Componente", 40), headerCell("Pontuação", 30), headerCell("Observação", 30)] }),
          ];
          Object.entries(a.body_parts).forEach(([part, score]) => {
            const label = bodyPartLabels[part] || part;
            const obs = score >= 4 ? "Inadequado – ajustar" : score >= 3 ? "Atenção – verificar" : "Adequado";
            rosaRows.push(new TableRow({
              children: [textCell(label, false, 40), textCell(String(score), true, 30), textCell(obs, false, 30)],
            }));
          });
          rosaRows.push(new TableRow({
            children: [textCell("Score Final ROSA", true, 40), textCell(String(a.score), true, 30), textCell(
              a.score <= 2 ? "Desprezível" : a.score <= 4 ? "Baixo" : a.score <= 6 ? "Médio" : "Alto"
            , true, 30)],
          }));
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rosaRows }));
        }

        children.push(new Paragraph({ spacing: { after: 120 } }));

        // Classification legend
        const legendTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Pontuação", 20), headerCell("Nível do Risco", 30), headerCell("Ação", 50)] }),
            new TableRow({ children: [shadedCell("1", COLORS.greenBg, false, 20), shadedCell("Insignificante", COLORS.greenBg, false, 30), textCell("Não necessária", false, 50)] }),
            new TableRow({ children: [shadedCell("2 a 3", COLORS.greenBg, false, 20), shadedCell("Baixo", COLORS.greenBg, false, 30), textCell("Pode ser necessária", false, 50)] }),
            new TableRow({ children: [shadedCell("4 a 7", COLORS.yellowBg, false, 20), shadedCell("Médio", COLORS.yellowBg, false, 30), textCell("Necessária", false, 50)] }),
            new TableRow({ children: [shadedCell("8 a 10", COLORS.redBg, false, 20), shadedCell("Alto", COLORS.redBg, false, 30), textCell("Necessária em breve", false, 50)] }),
            new TableRow({ children: [shadedCell("> 11", COLORS.redBg, false, 20), shadedCell("Muito alto", COLORS.redBg, false, 30), textCell("Necessária imediatamente", false, 50)] }),
          ],
        });
        children.push(legendTable);
        children.push(new Paragraph({ spacing: { after: 200 } }));

        // Conclusion paragraph
        const riskLevel = a.score <= 1 ? "insignificante" : a.score <= 3 ? "baixo" : a.score <= 7 ? "médio" : a.score <= 10 ? "alto" : "muito alto";
        const actionNeeded = a.score <= 1 ? "não sendo necessária intervenção imediata" : a.score <= 3 ? "com ação que pode ser necessária" : a.score <= 7 ? "com ação necessária" : a.score <= 10 ? "com ação necessária em breve" : "com ação necessária imediatamente";
        children.push(body(`Com base na análise ergonômica realizada, verificou-se que a atividade desenvolvida no setor de ${wsSector?.name || "—"} apresenta risco ergonômico de nível ${riskLevel}, decorrente principalmente de ${a.notes.toLowerCase()}.`));
        children.push(body(`A aplicação do método ${a.method} resultou em pontuação ${a.score}, caracterizando Nível de Risco ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}, ${actionNeeded}, sendo recomendada a adoção de medidas corretivas, como melhoria na organização do posto de trabalho, adequação das alturas de armazenamento e manuseio, incentivo à alternância postural e orientação ergonômica aos trabalhadores, com o objetivo de reduzir a sobrecarga musculoesquelética e prevenir o surgimento de desconfortos e possíveis distúrbios osteomusculares relacionados ao trabalho.`));
      });
    }
    children.push(pageBreak());
  }

  // ===== ANEXO: COPSOQ II Full Report =====
  if (psychosocial.length > 0) {
    children.push(heading("Relatório Técnico — Análise de Riscos Psicossociais no Ambiente de Trabalho"));
    children.push(body(`Empresa: ${company.name}`, { bold: true }));
    children.push(body("Ferramenta: COPSOQ II"));
    children.push(body(`Data da Análise: ${getTodayFull()}`));
    children.push(body(`Responsável pela Análise: ${consultant}`));

    children.push(heading("1. Introdução", HeadingLevel.HEADING_2));
    children.push(body("Este relatório apresenta os resultados da análise dos riscos psicossociais no ambiente de trabalho, realizados com o apoio da ferramenta COPSOQ II. O objetivo da análise foi identificar os setores e os domínios com maior risco psicossocial, classificando-os conforme a demanda quantitativa, cognitiva e emocional, a fim de direcionar ações corretivas e de prevenção."));

    children.push(heading("2. Metodologia", HeadingLevel.HEADING_2));
    children.push(body("A análise foi realizada a partir da aplicação do COPSOQ II, que coleta respostas dos colaboradores de diferentes setores da empresa. Os dados obtidos são organizados e classificados conforme os seguintes critérios:"));
    children.push(bulletItem("Demandas Quantitativas: Nível de intensidade e volume de trabalho."));
    children.push(bulletItem("Demandas Cognitivas: Exigências de raciocínio, concentração e tomada de decisão."));
    children.push(bulletItem("Demandas Emocionais: Impacto emocional devido ao trabalho."));
    children.push(body("Cada setor foi classificado com base nos seguintes níveis de risco:"));
    children.push(bulletItem("0 a 49: Alto risco (vermelho)"));
    children.push(bulletItem("50 a 74: Moderado risco (amarelo)"));
    children.push(bulletItem("75+: Baixo risco (verde)"));

    children.push(heading("3. Resultados da Análise", HeadingLevel.HEADING_2));

    psychosocial.forEach(psa => {
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        const classifyPsyRisk = (v: number) => v >= 75 ? "Baixo risco" : v >= 50 ? "Moderado risco" : "Alto risco";
        const riskColor = (v: number) => v >= 75 ? COLORS.greenBg : v >= 50 ? COLORS.yellowBg : COLORS.redBg;

        const psyTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Domínio", 40), headerCell("Score", 20), headerCell("Classificação", 40)] }),
            ...([
              ["Demandas Quantitativas", cd.quantitative_demands],
              ["Ritmo de Trabalho", cd.work_pace],
              ["Demandas Cognitivas", cd.cognitive_demands],
              ["Demandas Emocionais", cd.emotional_demands],
              ["Influência no Trabalho", cd.influence],
              ["Possibilidades de Desenvolvimento", cd.possibilities_development],
              ["Significado do Trabalho", cd.meaning_work],
              ["Compromisso", cd.commitment],
              ["Previsibilidade", cd.predictability],
              ["Suporte Social", cd.social_support],
            ] as [string, number][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(dim, false, 40), textCell(String(val), true, 20), shadedCell(classifyPsyRisk(val), riskColor(val), true, 40)] })
            ),
          ],
        });
        children.push(psyTable);
      }
    });

    children.push(heading("4. Recomendações", HeadingLevel.HEADING_2));
    children.push(heading("Ações para Redução de Riscos", HeadingLevel.HEADING_3));
    children.push(bulletItem("Treinamentos de Gestão de Estresse: Implementar programas regulares de capacitação sobre técnicas de manejo do estresse, principalmente nos setores com moderado risco emocional."));
    children.push(bulletItem("Adequação da Carga de Trabalho: Realizar ajustes na carga de trabalho dos setores com alto risco quantitativo."));
    children.push(heading("Ações de Monitoramento Contínuo", HeadingLevel.HEADING_3));
    children.push(bulletItem("Avaliações Periódicas: Recomenda-se a realização de novas avaliações semestrais para monitorar as mudanças nos níveis de risco e a efetividade das ações corretivas implementadas."));
    children.push(bulletItem("Feedback dos Colaboradores: Criar canais contínuos de feedback para que os colaboradores possam relatar qualquer alteração nas condições de trabalho."));

    children.push(heading("5. Conclusão", HeadingLevel.HEADING_2));
    children.push(body("A análise dos dados do COPSOQ II revelou o perfil de riscos psicossociais da empresa. A implementação das ações recomendadas pode contribuir significativamente para a redução desses riscos, promovendo um ambiente de trabalho mais saudável e produtivo."));
    children.push(pageBreak());
  }

  // ===== ANEXO: PLANO DE AÇÃO =====
  children.push(heading("PLANO DE AÇÃO – MELHORIAS ERGONÔMICAS"));
  if (actions.length > 0) {
    const actionTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("MELHORIAS / PROPOSTAS", 30), headerCell("DETALHAMENTO DA AÇÃO", 40), headerCell("PRAZO", 15), headerCell("PRIORIDADE", 15)] }),
        ...actions.map(ap => {
          const priority = ap.status === "completed" ? "Concluída" : ap.deadline ? "Alta" : "Média";
          return new TableRow({
            children: [
              textCell(ap.description, true, 30),
              textCell(ap.description, false, 40),
              textCell(ap.deadline, false, 15),
              textCell(priority, true, 15),
            ],
          });
        }),
      ],
    });
    children.push(actionTable);
  } else {
    // Default action plan items
    const defaultActions = [
      ["Implantação formal de micropausas ergonômicas", "Realizar uma pausa de 10 minutos por período de trabalho para mudança postural, alongamentos leves e descanso visual.", "Imediato", "Altíssima"],
      ["Treinamento ergonômico específico (NR-17)", "Orientar sobre postura, ajuste do posto, uso correto de suportes e prevenção de LER/DORT.", "60 dias", "Média"],
      ["Adequação de mobiliário e equipamentos", "Verificar e ajustar alturas de bancadas, cadeiras e monitores conforme NR-17.", "60 dias", "Alta"],
    ];
    const defTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("MELHORIAS / PROPOSTAS", 25), headerCell("DETALHAMENTO DA AÇÃO", 40), headerCell("PRAZO", 15), headerCell("PRIORIDADE", 20)] }),
        ...defaultActions.map(([title, detail, prazo, prio]) =>
          new TableRow({ children: [textCell(title, true, 25), textCell(detail, false, 40), textCell(prazo, false, 15), textCell(prio, true, 20)] })
        ),
      ],
    });
    children.push(defTable);
  }

  // Psychosocial action plan
  children.push(new Paragraph({ spacing: { after: 300 } }));
  children.push(heading("PLANO DE AÇÃO – FATORES DE RISCOS PSICOSSOCIAIS", HeadingLevel.HEADING_2));
  const psyActionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("AÇÃO", 30), headerCell("DETALHAMENTO", 40), headerCell("PRAZO", 15), headerCell("PRIORIDADE", 15)] }),
      new TableRow({ children: [
        textCell("Treinamentos de Gestão de Estresse", true, 30),
        textCell("Implementar programas de capacitação regulares sobre técnicas de manejo do estresse, meditação e relaxamento.", false, 40),
        textCell("60 dias", false, 15),
        textCell("Média", true, 15),
      ] }),
      new TableRow({ children: [
        textCell("Adequação da Carga de Trabalho", true, 30),
        textCell("Reorganizar as tarefas e ajustar prazos, com foco na redução do volume excessivo de trabalho e na melhoria da qualidade do ambiente laboral.", false, 40),
        textCell("45 dias", false, 15),
        textCell("Alta", true, 15),
      ] }),
    ],
  });
  children.push(psyActionTable);

  children.push(new Paragraph({ spacing: { before: 600 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Documento gerado pelo sistema Spartan — MG Consultoria", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
    alignment: AlignmentType.CENTER,
  }));

  return new Document({
    creator: "Spartan - MG Consultoria",
    title: `AET - ${company.name}`,
    description: "Análise Ergonômica do Trabalho",
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `${company.name}`, size: 16, font: "Calibri", color: COLORS.muted }),
              new TextRun({ text: `     ANÁLISE ERGONÔMICA DO TRABALHO     `, size: 16, font: "Calibri", color: COLORS.muted, bold: true }),
              new TextRun({ text: `Emissão: ${getToday()}`, size: 16, font: "Calibri", color: COLORS.muted }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: "MG Consultoria — Ergonomia & Segurança do Trabalho", size: 14, font: "Calibri", color: COLORS.light, italics: true }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });
}

// ========== PGR REPORT ==========
function generatePGRDocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const allTasks = mockTasks.filter(t => workstations.some(w => w.id === t.workstation_id));
  const today = new Date().toLocaleDateString("pt-BR");

  const children: any[] = [];

  // Cover
  children.push(...createCoverPage("PROGRAMA DE GERENCIAMENTO DE RISCOS", "PGR", company, consultant));

  // Sumário
  children.push(heading("SUMÁRIO"));
  const sumarioItems = [
    "Definições e Abreviaturas", "Referências", "Identificação da Empresa",
    "Responsabilidade Técnica", "Aprovação, Distribuição e Implementação", "Introdução",
    "Objetivos", "Campo de Aplicação", "Metodologia Utilizada", "Inventário de Risco",
    "Implementação das Medidas de Prevenção", "EPC — Equipamento de Proteção Coletiva",
    "EPI — Equipamento de Proteção Individual", "Responsabilidades", "Meta e Objetivos",
    "Referências Bibliográficas",
  ];
  sumarioItems.forEach((item, i) => children.push(body(`${i + 1}. ${item}`)));
  children.push(pageBreak());

  // Controle de Revisões
  children.push(heading("CONTROLE DE REVISÕES"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Revisão", 15), headerCell("Data", 25), headerCell("Página", 20), headerCell("Descrição", 40)] }),
      new TableRow({ children: [textCell("00", false, 15), textCell(today, false, 25), textCell("TODAS", false, 20), textCell("PRIMEIRA APLICAÇÃO", false, 40)] }),
    ],
  }));
  children.push(pageBreak());

  // 1. Definições
  children.push(heading("1. DEFINIÇÕES E ABREVIATURAS"));
  const defs: [string, string][] = [
    ["ART", "Anotação de Responsabilidade Técnica"],
    ["CIPA", "Comissão Interna de Prevenção de Acidentes"],
    ["EPC", "Equipamento de Proteção Coletiva"],
    ["EPI", "Equipamento de Proteção Individual"],
    ["GHE", "Grupos Homogêneos de Exposição"],
    ["NR", "Norma Regulamentadora"],
    ["PCMSO", "Programa de Controle Médico de Saúde Ocupacional"],
    ["PGR", "Programa de Gerenciamento de Riscos"],
    ["SESMT", "Serviços Especializados em Eng. de Segurança e Medicina do Trabalho"],
    ["Risco Ocupacional", "Combinação da probabilidade de lesão e da severidade dessa lesão"],
    ["Perigo", "Fonte com potencial de causar lesões ou agravos à saúde"],
  ];
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Termo", 30), headerCell("Definição", 70)] }),
      ...defs.map(([term, def]) => new TableRow({ children: [textCell(term, true, 30), textCell(def, false, 70)] })),
    ],
  }));

  // 2. Referências
  children.push(heading("2. REFERÊNCIAS"));
  [
    "NR 1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais",
    "NR 4 — SESMT", "NR 5 — CIPA", "NR 6 — EPI", "NR 7 — PCMSO",
    "NR 9 — Agentes Físicos, Químicos e Biológicos",
    "NR 15 — Atividades e Operações Insalubres", "NR 17 — Ergonomia",
    "NR 23 — Proteção contra Incêndios", "NR 26 — Sinalização de Segurança",
  ].forEach(ref => children.push(bulletItem(ref)));

  // 3. Identificação da Empresa
  children.push(heading("3. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectors.map(s => s.name).join(", "), workstations.map(w => w.name).join(", ")));

  // 4. Responsabilidade Técnica
  children.push(heading("4. RESPONSABILIDADE TÉCNICA"));
  children.push(body("Profissional legalmente habilitado e responsável pela elaboração deste programa."));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Campo", 35), headerCell("Informação", 65)] }),
      new TableRow({ children: [textCell("Responsável Técnico", true, 35), textCell(consultant, false, 65)] }),
      new TableRow({ children: [textCell("Título Profissional", true, 35), textCell("Engenheiro de Segurança do Trabalho", false, 65)] }),
      new TableRow({ children: [textCell("Registro", true, 35), textCell("CREA/CONFEA: XXXXX", false, 65)] }),
      new TableRow({ children: [textCell("Período de Avaliação", true, 35), textCell(today, false, 65)] }),
    ],
  }));

  // 5. Aprovação
  children.push(heading("5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO"));
  children.push(body("Ao aprovar o Programa de Gerenciamento de Riscos, a empresa compromete-se a cumprir rigorosamente o que nele consta, sua efetiva implementação, bem como zelar pela sua eficácia."));

  // 6. Introdução
  children.push(heading("6. INTRODUÇÃO"));
  children.push(body("A elaboração deste Programa de Gerenciamento de Riscos tem como propósito um estudo das condições ambientais atuais existentes nesta empresa, a fim de identificar os agentes de riscos e caracterizar as atividades e operações desenvolvidas. Tal programa está direcionado no reconhecimento e avaliação dos fatores ambientais ou de locais de trabalho que possam causar prejuízos à saúde e ao bem-estar dos colaboradores."));

  // 7. Objetivos
  children.push(heading("7. OBJETIVOS"));
  children.push(heading("7.1 Objetivo Geral", HeadingLevel.HEADING_3));
  children.push(body("Preservar a saúde e a integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e consequente controle da ocorrência de riscos ambientais existentes ou que venham a existir nos locais de trabalho."));
  children.push(heading("7.2 Objetivos Específicos", HeadingLevel.HEADING_3));
  ["Seguir a política da empresa relacionada à saúde e segurança dos colaboradores",
   "Proteção do meio ambiente e dos recursos naturais",
   "Tratar os riscos ambientais existentes ou que venham a existir",
   "Planejar ações para preservar a saúde e a segurança dos trabalhadores",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("7.3 Antecipação", HeadingLevel.HEADING_3));
  children.push(body("Consiste na análise dos setores de trabalho, funções e horários de trabalho, formação dos GHEs, visando identificar riscos potenciais e introduzir medidas de proteção."));
  children.push(heading("7.4 Reconhecimento", HeadingLevel.HEADING_3));
  children.push(body("Trabalho de campo para identificar atividades, tarefas, fontes e tipos de riscos ambientais."));
  children.push(heading("7.5 Controle", HeadingLevel.HEADING_3));
  children.push(body("Adotar medidas de controle administrativas, de engenharia, EPCs e EPIs para eliminar, neutralizar ou reduzir a exposição."));
  children.push(heading("7.6 Monitoramento", HeadingLevel.HEADING_3));
  children.push(body("Mensurar a exposição ou inexistência dos riscos e acompanhar eficácia das medidas de controle."));

  // 8. Campo de Aplicação
  children.push(heading("8. CAMPO DE APLICAÇÃO"));
  children.push(body("Este programa é aplicado a toda organização. A avaliação de riscos deve ser revista a cada dois anos ou quando da ocorrência de mudanças significativas."));

  // 9. Metodologia
  children.push(heading("9. METODOLOGIA UTILIZADA"));
  children.push(heading("9.1 Análise Qualitativa", HeadingLevel.HEADING_3));
  children.push(body("Análise preliminar dos riscos ambientais envolvendo instalações, métodos e processos de trabalho."));
  children.push(heading("9.2 Análise Quantitativa", HeadingLevel.HEADING_3));
  children.push(body("Monitoramento ambiental que mensura a exposição dos trabalhadores utilizando dosimetria de ruído (NHO 01), medição de luminosidade (NHO 11) e medição de calor/IBUTG (NHO 06)."));
  children.push(heading("9.3 Probabilidade (P)", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Índice", 15), headerCell("Exposição", 45), headerCell("Fator de Proteção", 40)] }),
      new TableRow({ children: [textCell("1 — Baixo", true, 15), textCell("Contato baixo ou eventual", false, 45), textCell("Medidas adequadas e com manutenção", false, 40)] }),
      new TableRow({ children: [textCell("2 — Moderado", true, 15), textCell("Contato moderado ou intermitente", false, 45), textCell("Medidas adequadas mas sem garantia de manutenção", false, 40)] }),
      new TableRow({ children: [textCell("3 — Alto", true, 15), textCell("Contato alto ou permanente", false, 45), textCell("Medidas com desvios significativos", false, 40)] }),
      new TableRow({ children: [textCell("4 — Excessivo", true, 15), textCell("Exposição excessiva ou permanente a intensidade elevada", false, 45), textCell("Medidas inexistentes ou inadequadas", false, 40)] }),
    ],
  }));
  children.push(heading("9.4 Gravidade (G)", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Índice", 15), headerCell("Critério", 40), headerCell("Pessoas Expostas", 20)] }),
      new TableRow({ children: [textCell("1 — Baixo", true, 15), textCell("Lesão leve, efeitos reversíveis", false, 40), textCell("Até 10%", false, 20)] }),
      new TableRow({ children: [textCell("2 — Moderado", true, 15), textCell("Lesão séria, efeitos reversíveis severos", false, 40), textCell("10% a 30%", false, 20)] }),
      new TableRow({ children: [textCell("3 — Alto", true, 15), textCell("Lesão crítica, efeitos irreversíveis", false, 40), textCell("30% a 60%", false, 20)] }),
      new TableRow({ children: [textCell("4 — Excessivo", true, 15), textCell("Lesão incapacitante ou fatal", false, 40), textCell("Acima de 60%", false, 20)] }),
    ],
  }));
  children.push(heading("9.5 Nível de Risco e Priorização", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Nível", 20), headerCell("Ação Requerida", 50), headerCell("Prazo", 30)] }),
      new TableRow({ children: [textCell("Crítico", true, 20), textCell("Ações corretivas imediatas", false, 50), textCell("Implementação imediata", false, 30)] }),
      new TableRow({ children: [textCell("Alto", true, 20), textCell("Planejamento a curto prazo", false, 50), textCell("Máximo 3 meses", false, 30)] }),
      new TableRow({ children: [textCell("Médio", true, 20), textCell("Planejamento a médio/longo prazo", false, 50), textCell("Máximo 6 meses", false, 30)] }),
      new TableRow({ children: [textCell("Baixo", true, 20), textCell("Manter controle existente", false, 50), textCell("Máximo 1 ano", false, 30)] }),
    ],
  }));
  children.push(pageBreak());

  // 10. Inventário de Risco por GHE/Setor
  children.push(heading("10. INVENTÁRIO DE RISCO"));

  // Group by sector
  const sectorMap = new Map<string, { sectorName: string; sectorWs: typeof workstations }>();
  workstations.forEach(ws => {
    const sId = (ws as any).sector_id || "unknown";
    const sName = sectors.find(s => s.id === sId)?.name || "Geral";
    if (!sectorMap.has(sId)) sectorMap.set(sId, { sectorName: sName, sectorWs: [] });
    sectorMap.get(sId)!.sectorWs.push(ws);
  });

  let gheIndex = 0;
  sectorMap.forEach(({ sectorName, sectorWs }) => {
    gheIndex++;
    children.push(heading(`GHE ${String(gheIndex).padStart(2, '0')} / SETOR — ${sectorName.toUpperCase()}`, HeadingLevel.HEADING_2));
    children.push(body(`Caracterização dos processos: ${sectorWs.map(w => w.activity_description || w.description).join(". ")}.`));

    // Activities table
    children.push(heading("Descrição das Atividades Exercidas", HeadingLevel.HEADING_3));
    const actRows = sectorWs.map(ws => {
      const wsTasks = allTasks.filter(t => t.workstation_id === ws.id);
      return new TableRow({
        children: [
          textCell(ws.name, true, 30),
          textCell(wsTasks.map(t => t.description).join("; ") || ws.tasks_performed, false, 70),
        ],
      });
    });
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Posto/Função", 30), headerCell("Descrição das Atividades", 70)] }),
        ...actRows,
      ],
    }));

    // Risk inventory for this sector
    const sectorRisks = risks.filter(r => {
      const a = analyses.find(an => an.id === r.analysis_id);
      return a && sectorWs.some(w => w.id === a.workstation_id);
    });

    children.push(heading("Inventário de Riscos Ocupacionais", HeadingLevel.HEADING_3));
    if (sectorRisks.length > 0) {
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Perigo", 25), headerCell("Danos", 20), headerCell("Fonte", 20), headerCell("P", 8), headerCell("G", 8), headerCell("NR", 8), headerCell("Controle", 16)] }),
          ...sectorRisks.map(r => {
            const a = analyses.find(an => an.id === r.analysis_id);
            const ws = a ? sectorWs.find(w => w.id === a.workstation_id) : null;
            const pL = r.probability <= 1 ? "B" : r.probability <= 2 ? "M" : r.probability <= 3 ? "A" : "E";
            const gL = r.consequence <= 1 ? "B" : r.consequence <= 2 ? "M" : r.consequence <= 3 ? "A" : "E";
            const ctrl = mockActionPlans.filter(ap => ap.risk_assessment_id === r.id).map(ap => ap.description).join("; ") || "N.I.";
            return new TableRow({
              children: [
                textCell(r.description, false, 25), textCell(ws?.name || "—", false, 20),
                textCell(ws?.activity_description || "—", false, 20),
                textCell(pL, false, 8), textCell(gL, false, 8),
                textCell(riskLevelLabel(r.risk_level).charAt(0), false, 8), textCell(ctrl, false, 16),
              ],
            });
          }),
        ],
      }));
    } else {
      children.push(body("Nenhum risco identificado para este setor."));
    }
    children.push(body("Recomendação: Realizar Análise Ergonômica do Trabalho (AET).", { bold: true }));
  });

  children.push(pageBreak());

  // 11. Implementação
  children.push(heading("11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO"));
  children.push(body("A implementação das medidas de prevenção e respectivos ajustes são registrados no PLANO DE AÇÃO, com a indicação clara do que deve ser realizado, responsabilidades e prazos."));
  children.push(heading("11.1 Plano de Ação", HeadingLevel.HEADING_3));
  children.push(body("O Ciclo PDCA (Plan, Do, Check, Act) é utilizado para acompanhamento das ações."));

  if (actions.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Ação", 30), headerCell("Estratégia", 25), headerCell("Responsável", 15), headerCell("Prazo", 15), headerCell("Status", 15)] }),
        ...actions.map(ap => new TableRow({
          children: [
            textCell(ap.description, false, 30), textCell("Implementar medidas conforme PGR", false, 25),
            textCell(ap.responsible, false, 15), textCell(ap.deadline, false, 15), textCell(statusLabel(ap.status), false, 15),
          ],
        })),
      ],
    }));
  }

  // 12. EPC
  children.push(heading("12. EPC — EQUIPAMENTO DE PROTEÇÃO COLETIVA"));
  children.push(body("O estudo, desenvolvimento e implantação de medidas de proteção coletiva deverá obedecer à hierarquia: eliminação na fonte, prevenção de disseminação, redução de níveis."));

  // 13. EPI
  children.push(heading("13. EPI — EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL"));
  children.push(body("O EPI é todo dispositivo de uso individual destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho."));
  ["Adquirir o EPI adequado ao risco", "Exigir seu uso", "Orientar e treinar sobre uso, guarda e conservação",
   "Substituir imediatamente quando danificado", "Registrar o fornecimento ao trabalhador"
  ].forEach(item => children.push(bulletItem(`Cabe ao empregador: ${item}`)));

  // 14. Responsabilidades
  children.push(heading("14. RESPONSABILIDADES"));
  children.push(heading("Responsabilidades do Empregador", HeadingLevel.HEADING_3));
  ["Estabelecer e assegurar o cumprimento do PGR", "Informar trabalhadores sobre riscos ambientais",
   "Garantir interrupção de atividades em risco grave", "Incentivar participação dos trabalhadores no PGR"
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("Responsabilidades do SESMT", HeadingLevel.HEADING_3));
  ["Executar, coordenar e monitorar as etapas do programa", "Programar e aplicar treinamentos",
   "Manter arquivado por 20 anos os relatórios"
  ].forEach(item => children.push(bulletItem(item)));

  // 15. Meta e Objetivos
  children.push(heading("15. META E OBJETIVOS"));
  ["Reduzir em 20% os riscos Alto/Crítico", "Garantir treinamento a 100% dos trabalhadores expostos",
   "Implementar ações do Plano dentro dos prazos"
  ].forEach(item => children.push(bulletItem(item)));

  // 16. Referências
  children.push(heading("16. REFERÊNCIAS BIBLIOGRÁFICAS"));
  ["Normas Regulamentadoras — Ministério do Trabalho e Emprego",
   "ABNT NBR ISO 31000:2009 — Gestão de Riscos", "BS 8800:1996 — Guide to OHS Management Systems",
   "MULHAUSEN & DAMIANO (1998) — Strategy for Assessing Occupational Exposures",
   "FUNDACENTRO — NHO 01, NHO 06, NHO 11",
  ].forEach(item => children.push(bulletItem(item)));

  // Signature
  children.push(new Paragraph({ spacing: { before: 600 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri", color: COLORS.primary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: consultant, size: 22, font: "Calibri", bold: true, color: COLORS.primary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Engenheiro de Segurança do Trabalho — CREA/CONFEA: XXXXX", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Documento gerado pelo sistema Spartan — MG Consultoria", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
    alignment: AlignmentType.CENTER,
  }));

  return new Document({
    creator: "Spartan - MG Consultoria",
    title: `PGR - ${company.name}`,
    sections: [{
      properties: {
        page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: `PGR — ${company.name}`, size: 16, font: "Calibri", color: COLORS.light, italics: true })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      children,
    }],
  });
}

// ========== GENERIC REPORT ==========
function generateGenericDocx(ctx: DocxReportContext): Document {
  const { company, sector, workstation, workstations, analyses, reportType } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));

  const children: any[] = [];
  const title = `${reportType} — ${company.name}`;

  children.push(...createCoverPage(reportType, title, company, consultant));

  children.push(heading("1. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sector?.name || "Geral", workstation?.name || workstations.map(w => w.name).join(", ")));

  children.push(heading("2. ANÁLISES REALIZADAS"));
  if (analyses.length > 0) {
    analyses.forEach(a => {
      const ws = workstations.find(w => w.id === a.workstation_id);
      children.push(body(`${ws?.name || "—"} — ${a.method}, Score: ${a.score}. ${a.notes}`));
    });
  } else {
    children.push(body("Nenhuma análise."));
  }

  children.push(heading("3. RISCOS IDENTIFICADOS"));
  if (risks.length > 0) {
    const riskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Descrição", 50), headerCell("Score", 25), headerCell("Nível", 25)] }),
        ...risks.map(r => new TableRow({
          children: [textCell(r.description, false, 50), textCell(String(r.risk_score), true, 25), textCell(riskLevelLabel(r.risk_level), true, 25)],
        })),
      ],
    });
    children.push(riskTable);
  } else {
    children.push(body("Nenhum risco."));
  }

  children.push(heading("4. RECOMENDAÇÕES"));
  if (actions.length > 0) {
    actions.forEach(ap => children.push(bulletItem(`${ap.description} (${ap.responsible} — ${ap.deadline})`)));
  } else {
    children.push(body("Sem recomendações."));
  }

  return new Document({
    creator: "Spartan - MG Consultoria",
    title,
    sections: [{
      properties: {
        page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) } },
      },
      children,
    }],
  });
}

// ========== MAIN EXPORT ==========
export async function generateAndDownloadDocx(ctx: DocxReportContext): Promise<void> {
  let doc: Document;

  switch (ctx.reportType) {
    case "AET":
      doc = await generateAETDocx(ctx);
      break;
    case "PGR":
      doc = generatePGRDocx(ctx);
      break;
    default:
      doc = generateGenericDocx(ctx);
      break;
  }

  const blob = await Packer.toBlob(doc);
  const fileName = `${ctx.reportType}_${ctx.company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}
