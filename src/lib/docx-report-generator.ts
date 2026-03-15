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

// ============ VIVID COLOR PALETTE — PowerPoint-like ============
const COLORS = {
  // Primary blues — rich and bold
  primary: "0A1F44",        // Deep midnight navy
  secondary: "1565C0",      // Vivid royal blue
  tertiary: "1E88E5",       // Bright sky blue
  muted: "546E7A",          // Blue-gray
  light: "90A4AE",          // Light blue-gray

  // Accent — vivid teal/cyan
  accent: "00838F",         // Deep teal
  accentBright: "00BCD4",   // Bright cyan
  accentLight: "B2EBF2",    // Light cyan tint

  // Warm accents — for highlights and warnings
  highlight: "FF6F00",      // Vivid amber
  highlightLight: "FFF3E0", // Light amber tint
  warmRed: "D32F2F",        // Bold red

  // Table colors — vibrant
  headerBg: "0A1F44",       // Dark navy header
  headerText: "FFFFFF",     // White text on headers
  headerBg2: "1565C0",      // Bright blue sub-header
  headerBg3: "00838F",      // Teal header variant
  rowAlt: "E3F2FD",         // Vivid light blue alternating
  rowWhite: "FFFFFF",       // Normal row
  cellLabel: "E1F5FE",      // Bright blue label cells
  sectionBg: "00838F",      // Teal section banner
  sectionText: "FFFFFF",    // White on section banner

  // Status colors — vivid and bold
  white: "FFFFFF",
  border: "B0BEC5",         // Medium gray border
  borderDark: "78909C",     // Strong gray border
  greenBg: "C8E6C9",        // Vivid green
  greenText: "1B5E20",      // Deep green text
  greenBright: "43A047",    // Bright green
  yellowBg: "FFF9C4",       // Vivid yellow
  yellowText: "F57F17",     // Deep amber text
  yellowBright: "FFB300",   // Bright amber
  redBg: "FFCDD2",          // Vivid red
  redText: "B71C1C",        // Deep red text
  redBright: "E53935",      // Bright red
  orangeBg: "FFE0B2",       // Vivid orange
  orangeText: "E65100",     // Deep orange text
  orangeBright: "FB8C00",   // Bright orange

  // Cover & decorative
  coverGradientTop: "0A1F44",   // Navy
  coverGradientMid: "1565C0",   // Blue
  coverAccent: "00BCD4",        // Cyan accent
  footerBg: "F5F5F5",
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

// ============ TEXT HELPERS — VIVID ============
function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  const isH1 = level === HeadingLevel.HEADING_1;
  const isH2 = level === HeadingLevel.HEADING_2;
  return new Paragraph({
    children: [
      new TextRun({
        text: isH1 ? `■  ${text}` : text,
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

function numberedItem(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", color: COLORS.primary })],
    numbering: { reference: "default-numbering", level: 0 },
    spacing: { after: 60 },
  });
}

function decorativeLine(color = COLORS.accentBright): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 2 } },
    spacing: { before: 100, after: 200 },
  });
}

function thickDivider(color = COLORS.secondary): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color, space: 4 } },
    spacing: { before: 200, after: 300 },
  });
}

function spacer(twips = 200): Paragraph {
  return new Paragraph({ spacing: { before: twips } });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

// ============ CONTENT EXPANSION SYSTEM ============
// Adds rich, detailed supplementary content to fill empty page space
function expandSection(topic: string): Paragraph[] {
  const expansions: Record<string, string[]> = {
    ergonomia_intro: [
      "A Ergonomia, derivada dos termos gregos 'ergon' (trabalho) e 'nomos' (regras/leis), é a disciplina científica que estuda a interação entre o ser humano e os elementos de um sistema. Seu campo de atuação é amplo, englobando aspectos físicos, cognitivos, organizacionais e ambientais do trabalho.",
      "De acordo com a International Ergonomics Association (IEA), a ergonomia divide-se em três domínios: Ergonomia Física (anatomia, antropometria, fisiologia e biomecânica), Ergonomia Cognitiva (processos mentais como percepção, memória, raciocínio e resposta motora) e Ergonomia Organizacional (otimização de sistemas sociotécnicos, incluindo estruturas, políticas e processos).",
      "No contexto brasileiro, a NR-17 estabelece parâmetros que permitem a adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores, de modo a proporcionar conforto, segurança, saúde e desempenho eficiente. A norma abrange desde o mobiliário até os aspectos organizacionais, como pausas, turnos e metas de produtividade.",
      "Estudos epidemiológicos demonstram que ambientes de trabalho ergonomicamente inadequados são responsáveis por até 60% dos afastamentos por doenças ocupacionais no Brasil, sendo as LER/DORT (Lesões por Esforços Repetitivos / Distúrbios Osteomusculares Relacionados ao Trabalho) as mais prevalentes, correspondendo a cerca de 65% dos auxílios-doença acidentários concedidos pelo INSS.",
    ],
    biomecânica: [
      "A biomecânica ocupacional estuda as forças que atuam sobre o corpo humano durante a execução de tarefas laborais. Os principais fatores biomecânicos de risco incluem: força excessiva, repetitividade, postura inadequada, vibração e compressão mecânica localizada.",
      "O sistema musculoesquelético possui mecanismos de recuperação natural que, quando insuficientes frente à demanda imposta, resultam em microlesões cumulativas. O tempo de recuperação necessário varia conforme o tipo de esforço: contrações estáticas requerem períodos de descanso 2 a 3 vezes superiores aos de contrações dinâmicas.",
      "A fadiga muscular localizada inicia-se quando a demanda excede 15% da Contração Voluntária Máxima (CVM) em atividades estáticas prolongadas. Em atividades dinâmicas repetitivas, o risco aumenta significativamente quando a frequência excede 15 movimentos por minuto sem pausas adequadas.",
      "A postura de trabalho ideal mantém as articulações próximas à posição neutra: tronco ereto com apoio lombar, ombros relaxados e alinhados, cotovelos entre 90° e 110° de flexão, punhos em posição neutra, quadris entre 90° e 110°, e pés apoiados no solo ou em suporte. Desvios significativos destas posições aumentam exponencialmente a carga sobre as estruturas articulares e musculares.",
    ],
    nr17_detalhada: [
      "A NR-17 (Ergonomia) foi atualizada pela Portaria MTP nº 423/2021, passando a vigorar com nova redação que reforça a integração com o Gerenciamento de Riscos Ocupacionais (GRO) previsto na NR-01. As principais exigências incluem:",
      "• Levantamento, transporte e descarga de materiais: peso máximo admissível de 60 kg para trabalhadores do sexo masculino e 25 kg para trabalhadoras do sexo feminino. A movimentação manual de cargas deve ser avaliada considerando distância, frequência, postura e condições ambientais.",
      "• Mobiliário dos postos de trabalho: as dimensões devem ser ajustáveis, permitindo alternância de posturas. Assentos devem possuir encosto com apoio lombar, altura regulável e borda frontal arredondada. Superfícies de trabalho devem estar entre 65 cm e 78 cm de altura para postos sentados.",
      "• Equipamentos dos postos de trabalho: monitores devem estar posicionados a uma distância entre 50 cm e 75 cm dos olhos, com a borda superior na altura dos olhos ou ligeiramente abaixo. Teclados devem permitir apoio de antebraço e punhos em posição neutra.",
      "• Condições ambientais de trabalho: níveis de iluminamento conforme NBR 5413/ABNT, temperatura efetiva entre 20°C e 23°C, velocidade do ar não superior a 0,75 m/s, umidade relativa do ar não inferior a 40%. O nível de ruído aceitável para conforto acústico é de até 65 dB(A).",
      "• Organização do trabalho: a norma estabelece que nas atividades que exijam sobrecarga muscular estática ou dinâmica, devem ser incluídas pausas para descanso. Para atividades de processamento eletrônico de dados (digitação), é assegurada uma pausa de 10 minutos a cada 50 minutos trabalhados.",
    ],
    metodos_ergonomicos: [
      "Os métodos de avaliação ergonômica são instrumentos quantitativos que permitem classificar o nível de risco postural de forma objetiva e replicável. Cada método possui especificidades quanto ao tipo de atividade e segmentos corporais avaliados:",
      "REBA (Rapid Entire Body Assessment): Desenvolvido por Hignett e McAtamney (2000), avalia o corpo inteiro dividindo-o em dois grupos: Grupo A (tronco, pescoço e pernas) e Grupo B (braços, antebraços e punhos). A pontuação final varia de 1 a 15+, classificada em: Insignificante (1), Baixo (2-3), Médio (4-7), Alto (8-10) e Muito Alto (11+). É particularmente indicado para atividades com posturas estáticas e dinâmicas variadas.",
      "RULA (Rapid Upper Limb Assessment): Criado por McAtamney e Corlett (1993), é focado nos membros superiores. Avalia separadamente braço, antebraço e punho (Grupo A) e pescoço, tronco e pernas (Grupo B). A classificação final indica: Aceitável (1-2), Investigar (3-4), Mudança necessária em breve (5-6), e Mudança imediata (7). Ideal para postos de trabalho com uso intenso de computadores.",
      "ROSA (Rapid Office Strain Assessment): Desenvolvido por Sonne et al. (2012), é específico para ambientes de escritório. Avalia cadeira (altura, profundidade, apoio de braço, encosto), monitor e telefone, teclado e mouse. Classificação: Desprezível (1-2), Baixo (3-4), Médio (5-6), Alto (7+). É o método de referência para postos informatizados.",
      "OWAS (Ovako Working Posture Analysing System): Criado por Karhu et al. (1977), avalia as posturas de costas (4 posições), braços (3 posições), pernas (7 posições) e cargas manuseadas (3 faixas). Categoria de Ação: 1 — Normal, 2 — Ações corretivas em futuro próximo, 3 — Ações corretivas assim que possível, 4 — Ações corretivas imediatas.",
      "OCRA (Occupational Repetitive Actions): Avalia o risco de distúrbios musculoesqueléticos nos membros superiores em atividades repetitivas. Considera frequência de ações, força, postura, fatores complementares e recuperação insuficiente. O Índice OCRA classifica: ≤2.2 Aceitável, 2.3-3.5 Limítrofe, >3.5 Risco presente.",
    ],
    pgr_intro: [
      "O Programa de Gerenciamento de Riscos (PGR) é o documento-base do sistema de gestão de riscos ocupacionais das organizações brasileiras, conforme estabelecido pela NR-01. Ele substitui o antigo PPRA (Programa de Prevenção de Riscos Ambientais) da NR-09 e amplia significativamente o escopo de análise.",
      "Enquanto o PPRA se limitava a agentes físicos, químicos e biológicos, o PGR contempla todos os riscos ocupacionais, incluindo riscos de acidentes (mecânicos), riscos ergonômicos e riscos psicossociais. Esta abordagem integrada permite uma gestão mais eficiente e abrangente da saúde e segurança no trabalho.",
      "O PGR é composto por dois documentos fundamentais: o Inventário de Riscos Ocupacionais e o Plano de Ação. O Inventário deve conter a identificação dos perigos, a avaliação dos riscos e a classificação por nível de prioridade. O Plano de Ação deve definir medidas de prevenção, cronogramas, responsáveis e acompanhamento da implementação.",
      "A avaliação de riscos no PGR segue a metodologia de análise matricial, onde o Nível de Risco é determinado pelo cruzamento da Probabilidade de ocorrência com a Gravidade das consequências. Esta abordagem permite priorizar as ações de prevenção de forma objetiva e alinhada com os recursos disponíveis da organização.",
    ],
    riscos_ambientais: [
      "Os riscos ambientais são classificados em cinco categorias conforme sua natureza: físicos (ruído, vibração, radiações, pressões anormais, temperaturas extremas, umidade), químicos (poeiras, fumos, névoas, neblinas, gases, vapores e substâncias compostas), biológicos (vírus, bactérias, protozoários, fungos, parasitas e bacilos), ergonômicos (esforço físico intenso, postura inadequada, ritmo excessivo, monotonia e repetitividade) e de acidentes (arranjo físico inadequado, máquinas sem proteção, ferramentas defeituosas, incêndio e explosão).",
      "A mensuração dos agentes físicos segue protocolos específicos da FUNDACENTRO: NHO-01 para ruído contínuo ou intermitente (limite de tolerância de 85 dB(A) para jornada de 8h), NHO-06 para calor (avaliação por IBUTG), NHO-11 para iluminamento (conforme NBR ISO 8995-1). A avaliação quantitativa deve ser realizada por profissional habilitado utilizando equipamentos devidamente calibrados.",
      "Para agentes químicos, os Limites de Exposição Ocupacional (LEO) são definidos na NR-15 e atualizados pela ACGIH (TLV-TWA, TLV-STEL, TLV-C). A avaliação quantitativa envolve coleta de amostras pessoais e análise laboratorial, devendo considerar as vias de absorção (inalação, cutânea e ingestão) e os efeitos sinérgicos entre agentes diferentes.",
    ],
    epc_detalhado: [
      "Os Equipamentos de Proteção Coletiva (EPCs) têm prioridade sobre os EPIs conforme a hierarquia de controle de riscos estabelecida pela NR-01. A implementação deve seguir a ordem: eliminação do perigo, substituição por processo menos perigoso, controles de engenharia (EPCs), controles administrativos e, por último, uso de EPIs.",
      "Os principais tipos de EPCs incluem: sistemas de ventilação e exaustão (para controle de agentes químicos e térmicos), enclausuramento de fontes de ruído (para redução de níveis sonoros), proteções de máquinas (para prevenção de acidentes mecânicos), sistemas de iluminação adequada (para conforto visual e prevenção de acidentes), sinalização de segurança (para orientação e alerta), sistemas de combate a incêndio (para proteção patrimonial e pessoal) e barreiras de proteção (para delimitação de áreas de risco).",
      "A eficácia dos EPCs deve ser monitorada continuamente através de inspeções periódicas, manutenção preventiva e medições ambientais de verificação. O registro destas atividades deve ser mantido em arquivo por no mínimo 20 anos, conforme exigência da NR-01.",
    ],
    epi_detalhado: [
      "O Equipamento de Proteção Individual (EPI) é regulamentado pela NR-06 e deve possuir Certificado de Aprovação (CA) emitido pelo Ministério do Trabalho. O CA tem validade de 5 anos, devendo ser renovado antes do vencimento para garantir a conformidade legal.",
      "A seleção do EPI adequado deve considerar: o tipo de risco e o nível de proteção necessário, o conforto e a aceitação pelo trabalhador, as condições de trabalho (temperatura, umidade, esforço físico), a compatibilidade com outros EPIs utilizados simultaneamente e as recomendações do fabricante quanto à vida útil e condições de uso.",
      "As obrigações do empregador quanto aos EPIs incluem: aquisição do tipo adequado à atividade, fornecimento gratuito, treinamento sobre uso correto, exigência de utilização, substituição imediata quando danificado ou fora da validade do CA, higienização e manutenção periódica, registro do fornecimento e comunicação ao MTE sobre irregularidades observadas.",
      "O trabalhador tem a obrigação de: utilizar o EPI apenas para a finalidade a que se destina, responsabilizar-se por sua guarda e conservação, comunicar ao empregador qualquer alteração que o torne impróprio para uso e cumprir as determinações do empregador sobre o uso adequado.",
    ],
    psicossocial_detalhado: [
      "Os fatores de risco psicossociais no trabalho referem-se a aspectos do desenho do trabalho, da organização e da gestão que possuem potencial de causar danos físicos ou psicológicos aos trabalhadores. A Organização Internacional do Trabalho (OIT) os classifica em seis categorias: conteúdo do trabalho, carga e ritmo de trabalho, horários de trabalho, controle sobre o trabalho, relações interpessoais e papel na organização.",
      "A exposição prolongada a fatores psicossociais adversos está associada a: transtornos de ansiedade e depressão, síndrome de burnout (esgotamento profissional), distúrbios do sono, doenças cardiovasculares (hipertensão, cardiopatias), distúrbios gastrointestinais, comprometimento imunológico e agravamento de condições musculoesqueléticas pré-existentes.",
      "O COPSOQ II (Copenhagen Psychosocial Questionnaire) é o instrumento mais utilizado internacionalmente para avaliação de riscos psicossociais no trabalho. Desenvolvido pelo National Research Centre for the Working Environment da Dinamarca, avalia 28 dimensões agrupadas em: exigências no trabalho, organização do trabalho e conteúdo, relações interpessoais e liderança, interface trabalho-indivíduo, valores no local de trabalho, saúde e bem-estar.",
      "O NASA-TLX (Task Load Index) é um instrumento de avaliação multidimensional da carga de trabalho percebida. Desenvolvido pelo NASA Ames Research Center, avalia seis dimensões: Demanda Mental, Demanda Física, Demanda Temporal, Performance Percebida, Esforço e Frustração. Cada dimensão é pontuada de 0 a 100, e o score geral é calculado pela média ponderada.",
      "A NR-01, atualizada em 2024, estabelece expressamente a obrigatoriedade de identificação e gerenciamento dos riscos psicossociais no PGR. As organizações devem realizar avaliação periódica destes fatores e implementar medidas de prevenção, incluindo adequação da organização do trabalho, programas de saúde mental, treinamentos de gestão de pessoas e canais de comunicação e apoio.",
    ],
    pcmso_detalhado: [
      "O PCMSO deve ser planejado e implantado com base nos riscos à saúde identificados no PGR, conferindo caráter de prevenção, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho. A nova NR-7 (Portaria 6.734/2020) trouxe mudanças significativas, incluindo a obrigatoriedade de relatório analítico anual e a integração com o PGR.",
      "Os exames médicos ocupacionais obrigatórios são: Admissional (antes do início das atividades), Periódico (conforme periodicidade definida pelo médico coordenador), Retorno ao Trabalho (no primeiro dia de retorno após afastamento ≥ 30 dias por motivo de doença ou acidente), Mudança de Riscos Ocupacionais (antes da data da alteração) e Demissional (até 10 dias antes do término do contrato).",
      "O exame clínico compreende anamnese ocupacional (história clínica e ocupacional do trabalhador, incluindo exposições pregressas), exame físico completo e exames complementares conforme riscos identificados. O ASO (Atestado de Saúde Ocupacional) deve ser emitido em duas vias, sendo uma para o empregador e outra para o trabalhador.",
      "O relatório analítico anual do PCMSO deve conter: número de exames clínicos e complementares realizados, estatísticas de resultados anormais por tipo de exame, incidência de doenças ocupacionais e comuns, indicadores de saúde coletiva (absenteísmo, taxa de afastamentos, acidentes de trabalho), análise epidemiológica dos dados e planejamento das ações para o próximo período.",
    ],
    medições_ambientais: [
      "As medições ambientais são realizadas para quantificar a exposição dos trabalhadores aos agentes de risco presentes no ambiente de trabalho. Os parâmetros avaliados incluem:",
      "• Iluminância (NHO-11): medida em lux com luxímetro calibrado, seguindo a NBR ISO 8995-1. Os níveis mínimos variam conforme o tipo de atividade: 150 lux (circulação), 300 lux (trabalho bruto), 500 lux (trabalho moderado), 750 lux (trabalho fino), 1000+ lux (trabalho muito fino). A uniformidade de iluminação (relação entre mínimo e médio) deve ser ≥ 0,7.",
      "• Ruído Ocupacional (NHO-01): avaliado com dosímetro de ruído pessoal calibrado, durante toda a jornada de trabalho. O limite de tolerância é de 85 dB(A) para jornada de 8 horas, com incremento de duplicação (q) de 3 dB conforme NR-15 Anexo 1. Acima de 115 dB(A) a exposição é proibida sem proteção adequada.",
      "• Calor (NHO-06): avaliado pelo Índice de Bulbo Úmido e Termômetro de Globo (IBUTG). Os limites de tolerância dependem do tipo de atividade: trabalho leve (30,0°C IBUTG), trabalho moderado (26,7°C IBUTG) e trabalho pesado (25,0°C IBUTG). O regime de trabalho-descanso é determinado conforme o IBUTG medido.",
      "• Vibração (NHO-09 e NHO-10): avaliada para mãos-braços (HAV) e corpo inteiro (WBV). Os limites de exposição normalizada (aren) são: HAV — nível de ação 2,5 m/s² e limite 5,0 m/s²; WBV — nível de ação 0,5 m/s² e limite 1,1 m/s² para aceleração em qualquer eixo.",
    ],
    legislacao_sst: [
      "O arcabouço legal de Segurança e Saúde no Trabalho (SST) no Brasil é composto por normas constitucionais, legais e regulamentares. A Constituição Federal (Art. 7°, XXII) garante a redução dos riscos inerentes ao trabalho por meio de normas de saúde, higiene e segurança.",
      "A Consolidação das Leis do Trabalho (CLT), nos artigos 154 a 201, estabelece as disposições gerais sobre segurança e medicina do trabalho, incluindo obrigações de empregadores e empregados. A Lei nº 8.213/1991 dispõe sobre os Planos de Benefícios da Previdência Social e regulamenta os acidentes de trabalho e doenças ocupacionais.",
      "As Normas Regulamentadoras (NRs), instituídas pela Portaria MTb nº 3.214/1978, são de observância obrigatória pelas empresas. As principais NRs aplicáveis incluem: NR-01 (Disposições Gerais e GRO), NR-04 (SESMT), NR-05 (CIPA), NR-06 (EPI), NR-07 (PCMSO), NR-09 (Agentes de Risco), NR-15 (Insalubridade), NR-17 (Ergonomia), NR-23 (Proteção contra Incêndios), NR-24 (Condições Sanitárias), NR-26 (Sinalização de Segurança) e NR-35 (Trabalho em Altura).",
      "O descumprimento das NRs pode resultar em: autuações e multas pelo MTE (variando de R$ 2.396,35 a R$ 6.708,59 por infração), embargo ou interdição de atividades, ações regressivas da Previdência Social, indenizações civis e criminais, e aumento do Fator Acidentário de Prevenção (FAP), que pode majorar a alíquota do Seguro de Acidente de Trabalho (SAT) em até 100%.",
    ],
    ginastica_laboral: [
      "A Ginástica Laboral é um programa de exercícios físicos realizados no ambiente de trabalho, com duração de 10 a 15 minutos, visando prevenir lesões musculoesqueléticas e promover o bem-estar dos trabalhadores. Classificações: Preparatória (antes da jornada — aquecimento e preparação neuromuscular), Compensatória (durante a jornada — alívio de tensões e fadiga) e Relaxamento (ao final — redução do estresse e reorganização corporal).",
      "Estudos demonstram que programas regulares de ginástica laboral podem reduzir em até 40% a incidência de doenças ocupacionais, diminuir o absenteísmo em até 25%, aumentar a produtividade em até 15% e melhorar significativamente a satisfação e o clima organizacional.",
      "Exercícios recomendados incluem: alongamentos de cervical e trapézio (manutenção por 15-20 segundos), rotação e flexão de ombros, alongamento de flexores e extensores de punho (essencial para digitadores), fortalecimento de musculatura paravertebral, exercícios de mobilidade articular de membros inferiores e técnicas de respiração diafragmática para redução do estresse.",
    ],
    cronograma_acoes: [
      "O cronograma de ações é uma ferramenta de gestão que organiza temporalmente todas as atividades previstas no programa. Deve incluir: capacitações e treinamentos (frequência trimestral ou semestral), inspeções de segurança (mensal), medições ambientais (conforme agente — semestral ou anual), revisão de procedimentos operacionais (anual), simulações de emergência (semestral), campanhas de saúde (conforme calendário — SIPAT, Outubro Rosa, Novembro Azul), auditorias internas (semestral) e reuniões da CIPA (mensal).",
      "A responsabilidade pelo cumprimento do cronograma é compartilhada: o SESMT coordena as ações técnicas, a CIPA participa das inspeções e campanhas, a gerência operacional viabiliza a liberação dos trabalhadores, e o RH gerencia os aspectos administrativos (convocações, registros, prontuários). O acompanhamento deve ser realizado mensalmente em reunião específica.",
    ],
  };

  const texts = expansions[topic];
  if (!texts || texts.length === 0) return [];

  const paragraphs: Paragraph[] = [];
  texts.forEach(text => {
    if (text.startsWith("•")) {
      paragraphs.push(bulletItem(text.substring(2)));
    } else {
      paragraphs.push(body(text));
    }
  });
  return paragraphs;
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

// ============ VIVID COVER PAGE ============
function createCoverPage(title: string, subtitle: string, company: Company, consultant: string): Paragraph[] {
  const year = new Date().getFullYear().toString();
  return [
    // Top decorative thick bar
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.coverGradientTop, color: COLORS.coverGradientTop },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 24 })],
    }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.secondary, color: COLORS.secondary },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 16 })],
    }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.accentBright, color: COLORS.accentBright },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 8 })],
    }),
    // Spacer
    new Paragraph({ spacing: { before: 1600 } }),
    // Title — large and bold
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 56, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    // Accent line under title
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accentBright, space: 1 } },
      spacing: { after: 60 },
      indent: { left: convertInchesToTwip(1.5), right: convertInchesToTwip(1.5) },
    }),
    // Subtitle badge
    new Paragraph({
      children: [
        new TextRun({ text: `  ${subtitle}  `, size: 40, font: "Calibri", color: COLORS.white, bold: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      shading: { type: ShadingType.SOLID, fill: COLORS.secondary, color: COLORS.secondary },
      indent: { left: convertInchesToTwip(2.5), right: convertInchesToTwip(2.5) },
    }),
    // Year
    new Paragraph({
      children: [new TextRun({ text: year, size: 28, font: "Calibri", color: COLORS.accent, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Company name — vivid
    new Paragraph({
      children: [new TextRun({ text: company.name.toUpperCase(), bold: true, size: 40, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    // CNPJ in accent
    new Paragraph({
      children: [
        new TextRun({ text: "CNPJ: ", size: 22, font: "Calibri", color: COLORS.muted }),
        new TextRun({ text: company.cnpj, size: 22, font: "Calibri", color: COLORS.secondary, bold: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    // Address
    new Paragraph({
      children: [new TextRun({ text: `${company.address} — ${company.city}/${company.state}`, size: 20, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Consultant box
    new Paragraph({
      children: [
        new TextRun({ text: "  RESPONSÁVEL TÉCNICO:  ", size: 18, font: "Calibri", color: COLORS.white, bold: true }),
        new TextRun({ text: `  ${consultant}  `, size: 20, font: "Calibri", color: COLORS.white }),
      ],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, fill: COLORS.accent, color: COLORS.accent },
      spacing: { after: 120 },
      indent: { left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
    }),
    // Firm name
    new Paragraph({
      children: [new TextRun({ text: "MG Consultoria — Ergonomia & Segurança do Trabalho", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    // Bottom decorative bars
    spacer(400),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.accentBright, color: COLORS.accentBright },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 8 })],
    }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.secondary, color: COLORS.secondary },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 16 })],
    }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: COLORS.coverGradientTop, color: COLORS.coverGradientTop },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", size: 24 })],
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
          height: { value: convertInchesToTwip(0.35), rule: HeightRule.ATLEAST },
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
        height: { value: convertInchesToTwip(0.4), rule: HeightRule.ATLEAST },
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
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) },
        },
      },
      headers: { default: createProfessionalHeader(reportType, companyName) },
      footers: { default: createProfessionalFooter() },
      children,
    }],
  });
}

function signatureBlock(consultant: string, title = "Engenheiro de Segurança do Trabalho"): Paragraph[] {
  return [
    spacer(600),
    new Paragraph({
      children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: consultant, bold: true, size: 22, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: title, size: 20, font: "Calibri", color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: "CREA/CONFEA: XXXXX", size: 20, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Documento gerado pelo sistema Spartan — MG Consultoria", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// ========== AET REPORT ==========
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

  // Cover
  children.push(...createCoverPage("ANÁLISE ERGONÔMICA DO TRABALHO", "AET", company, consultant));

  // TOC
  children.push(heading("ÍNDICE"));
  const tocItems = [
    "INTRODUÇÃO", "IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA", "OBJETIVOS",
    "REFERÊNCIAS NORMATIVAS", "ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO",
    "REFERENCIAL TEÓRICO", "ESTUDO ERGONÔMICO DO TRABALHO",
    "DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS",
    "AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA",
    "ANÁLISE DOS RISCOS PSICOSSOCIAIS", "RESPONSABILIDADE TÉCNICA",
  ];
  tocItems.forEach((item, i) => children.push(body(`${i + 1}. ${item}`)));
  children.push(pageBreak());

  // Revision control
  children.push(...createRevisionTable());
  children.push(pageBreak());

  // 1. Introdução
  children.push(heading("1. INTRODUÇÃO"));
  children.push(accentCallout("A ergonomia é fundamental para a saúde, segurança e produtividade dos trabalhadores.", "info"));
  children.push(body("Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana."));
  children.push(body("A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa."));
  children.push(body("Locais de trabalho planejados de forma incorreta tendem a reduzir o desempenho, comprometer a qualidade, elevar o absenteísmo e aumentar custos operacionais. A ergonomia busca tornar a interação entre trabalhador, equipamentos e ambiente o mais segura, eficiente e confortável possível."));
  children.push(body(`Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17.`));
  children.push(pageBreak());

  // 2. Identificação
  children.push(heading("2. IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectorName, wsName));
  children.push(pageBreak());

  // 3. Objetivos
  children.push(heading("3. OBJETIVOS"));
  [
    "Observar e descrever o posto de trabalho e suas funções correspondentes;",
    "Avaliar a questão da biomecânica nas diferentes atividades;",
    "Estudar as condições de trabalho físico e mental dos colaboradores;",
    "Identificar situações de risco quanto ao mobiliário, equipamentos e atitudes posturais inadequadas;",
    "Criar sensibilização para a cultura ergonômica dentro da empresa;",
    "Sugerir soluções ergonômicas visando redução de queixas e melhora do desempenho;",
    "Atender a NR 17 do Ministério do Trabalho e Emprego.",
  ].forEach(t => children.push(bulletItem(t)));

  // 4. Referências normativas
  children.push(heading("4. REFERÊNCIAS NORMATIVAS"));
  children.push(body("Este trabalho foi elaborado com base nas seguintes normas e legislações:"));
  const normasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Norma", 20), headerCell("Descrição", 80)] }),
      ...[
        ["NR-17", "Ergonomia — Parâmetros para adaptação das condições de trabalho"],
        ["NR-01", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais"],
        ["NR-15", "Atividades e Operações Insalubres"],
        ["ISO 11228", "Ergonomia — Movimentação manual de cargas"],
        ["ISO 11226", "Ergonomia — Avaliação de posturas de trabalho estáticas"],
        ["CLT Art. 157-158", "Obrigações do empregador e empregados quanto à segurança"],
      ].map(([norm, desc]) =>
        new TableRow({ children: [textCell(norm, true, 20), textCell(desc, false, 80)] })
      ),
    ],
  });
  children.push(normasTable);
  children.push(pageBreak());

  // 5. Análise da demanda
  children.push(heading("5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO"));
  children.push(body(`A ${company.name} atua no segmento de ${company.description.toLowerCase()}. Suas atividades envolvem processos diversos desenvolvidos em ambiente interno e externo.`));

  const orgTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [mergedCell("ORGANIZAÇÃO DO TRABALHO", 2, true, COLORS.headerBg2)] }),
      new TableRow({ children: [labelCell("Setores Avaliados", 35), textCell(sectors.map(s => s.name).join(", "), false, 65)] }),
      new TableRow({ children: [labelCell("Nº de Postos", 35), textCell(String(workstations.length), false, 65)] }),
      new TableRow({ children: [labelCell("Métodos Aplicados", 35), textCell(methods, false, 65)] }),
      new TableRow({ children: [labelCell("Nº de Fotos", 35), textCell(String(photos.length), false, 65)] }),
      new TableRow({ children: [labelCell("Nº de Análises", 35), textCell(String(analyses.length), false, 65)] }),
      new TableRow({ children: [labelCell("Riscos Identificados", 35), textCell(String(risks.length), false, 65)] }),
    ],
  });
  children.push(orgTable);

  workstations.forEach(ws => {
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
    const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
    const posAnalysis = mockPostureAnalyses.find(pa => pa.workstation_id === ws.id);

    children.push(sectionBanner(`POSTO: ${ws.name}${wsSector ? ` — ${wsSector.name}` : ""}`, COLORS.headerBg2));

    const wsDetailTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [labelCell("Setor", 30), textCell(wsSector?.name || "—", false, 70)] }),
        new TableRow({ children: [labelCell("Descrição da Atividade", 30), textCell(ws.activity_description || ws.description, false, 70)] }),
        new TableRow({ children: [labelCell("Tarefas Executadas", 30), textCell(ws.tasks_performed, false, 70)] }),
        new TableRow({ children: [labelCell("Nº de Fotos", 30), textCell(String(wsPhotos.length), false, 70)] }),
        new TableRow({ children: [labelCell("Análises", 30), textCell(wsAnalyses.map(a => `${a.method} (Score: ${a.score})`).join(", ") || "Nenhuma", false, 70)] }),
      ],
    });
    children.push(wsDetailTable);

    if (posAnalysis) {
      children.push(body("Ângulos Articulares Medidos:", { bold: true, spacing: { before: 120, after: 60 } }));
      const angleTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell3("Articulação", 40), headerCell3("Ângulo (°)", 30), headerCell3("Classificação", 30)] }),
          ...Object.entries(posAnalysis.joint_angles).map(([joint, angle]) => {
            const jointLabel = { neck: "Pescoço", shoulder: "Ombro", elbow: "Cotovelo", trunk: "Tronco", hip: "Quadril", knee: "Joelho" }[joint] || joint;
            const riskClass = angle > 45 ? "Atenção" : angle > 20 ? "Moderado" : "Aceitável";
            const fill = angle > 45 ? COLORS.redBg : angle > 20 ? COLORS.yellowBg : COLORS.greenBg;
            return new TableRow({
              children: [textCell(jointLabel, false, 40), textCell(`${angle}°`, true, 30), shadedCell(riskClass, fill, true, 30)],
            });
          }),
        ],
      });
      children.push(angleTable);
    }

    if (wsTasks.length > 0) {
      children.push(body("Tarefas:", { bold: true, spacing: { before: 120, after: 60 } }));
      wsTasks.forEach(t => children.push(bulletItem(t.description)));
    }
  });
  children.push(pageBreak());

  // 6. Referencial teórico
  children.push(heading("6. REFERENCIAL TEÓRICO"));
  children.push(accentCallout("O uso inadequado do sistema osteomuscular pode levar a lesões quando os mecanismos de recuperação são insuficientes.", "warning"));
  children.push(body("A produtividade tende a aumentar quando o trabalhador adota posturas corretas e quando o ambiente é organizado para prevenir riscos. As pausas durante atividades físicas trazem benefícios relevantes: em esforços estáticos auxiliam na remoção do ácido lático; em tarefas repetitivas oferecem tempo para recuperação dos tendões."));
  children.push(body("Os principais fatores biomecânicos relacionados ao surgimento de lesões incluem força excessiva, posturas inadequadas, repetitividade elevada e compressões mecânicas, sendo o descanso insuficiente o fator crítico."));

  children.push(heading("Posturas dos membros superiores e sua relação patológica:", HeadingLevel.HEADING_3));
  [
    "Braço fletido ou abduzido — tendinite do ombro",
    "Movimentação frequente de supinação e pronação — tendinite de pronador redondo",
    "Flexão frequente do punho — tenossinovite dos flexores, síndrome do túnel do carpo",
    "Extensão frequente do punho — tenossinovite dos extensores, epicondilite lateral",
    "Desvio ulnar frequente — Tenossinovite de Quervain",
    "Cabeça excessivamente estendida — fibromialgia do trapézio",
    "Cabeça excessivamente fletida — cervicobraquialgia",
  ].forEach(t => children.push(bulletItem(t)));
  children.push(pageBreak());

  // 7. Estudo ergonômico
  children.push(heading("7. ESTUDO ERGONÔMICO DO TRABALHO"));
  children.push(body("A realização do Estudo Ergonômico do Trabalho é indispensável não apenas pelo cumprimento da NR-17, mas também por atuar como instrumento complementar ao PGR e ao PCMSO."));

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
    children.push(body(`As análises foram realizadas utilizando os métodos: ${methods}.`));
    const bodyPartLabels: Record<string, string> = {
      trunk: "Tronco", neck: "Pescoço", legs: "Pernas", upper_arm: "Braço Superior",
      lower_arm: "Antebraço", wrist: "Punho", chair: "Cadeira", monitor: "Monitor",
      keyboard: "Teclado", mouse: "Mouse", telephone: "Telefone",
    };

    analyses.forEach(a => {
      const ws = workstations.find(w => w.id === a.workstation_id);
      children.push(sectionBanner(`${ws?.name || "—"} — ${a.method}`, COLORS.accent));
      const bpEntries = Object.entries(a.body_parts || {});
      if (bpEntries.length > 0) {
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Segmento Corporal", 40), headerCell3("Score Parcial", 30), headerCell3("Classificação", 30)] }),
            ...bpEntries.map(([part, score]) => {
              const label = bodyPartLabels[part] || part;
              const cls = score <= 2 ? "Aceitável" : score <= 4 ? "Investigar" : score <= 6 ? "Médio" : "Alto";
              const fill = score <= 2 ? COLORS.greenBg : score <= 4 ? COLORS.yellowBg : score <= 6 ? COLORS.orangeBg : COLORS.redBg;
              return new TableRow({
                children: [textCell(label, false, 40), textCell(String(score), true, 30), shadedCell(cls, fill, true, 30)],
              });
            }),
          ],
        }));
      }
      children.push(body(`Score Final: ${a.score} — ${a.notes}`));
    });
  } else {
    children.push(body("Nenhuma análise realizada."));
  }

  // 8. Métodos
  children.push(heading("8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Método", 15), headerCell("Aplicação", 45), headerCell("Classificação", 40)] }),
      new TableRow({ children: [textCell("REBA", true, 15), textCell("Avaliação rápida do corpo inteiro", false, 45), textCell("1-3: Baixo | 4-7: Médio | 8-10: Alto | 11+: Muito Alto", false, 40)] }),
      new TableRow({ children: [textCell("RULA", true, 15), textCell("Avaliação rápida de membros superiores", false, 45), textCell("1-2: Aceitável | 3-4: Investigar | 5-6: Mudar breve | 7: Mudar já", false, 40)] }),
      new TableRow({ children: [textCell("ROSA", true, 15), textCell("Avaliação de postos informatizados", false, 45), textCell("1-2: Desprezível | 3-4: Baixo | 5-6: Médio | 7+: Alto", false, 40)] }),
      new TableRow({ children: [textCell("OWAS", true, 15), textCell("Sistema de análise de posturas", false, 45), textCell("1: Normal | 2: Leve | 3: Severo | 4: Muito severo", false, 40)] }),
    ],
  }));
  children.push(pageBreak());

  // 9. GHE
  children.push(heading("9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA"));
  if (risks.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("GHE/Posto", 25), headerCell("Risco", 25), headerCell("P × E × C", 15), headerCell("Score", 15), headerCell("Nível", 20)] }),
        ...risks.map((r, i) => {
          const analysis = analyses.find(a => a.id === r.analysis_id);
          const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
          const levelColor = r.risk_level === "critical" ? "red" : r.risk_level === "high" ? "orange" : r.risk_level === "medium" ? "yellow" : "green";
          return new TableRow({
            children: [
              textCell(ws?.name || `GHE ${i + 1}`, true, 25),
              textCell(r.description, false, 25),
              textCell(`${r.probability} × ${r.exposure} × ${r.consequence}`, false, 15),
              textCell(String(r.risk_score), true, 15),
              statusCell(riskLevelLabel(r.risk_level), levelColor as any, 20),
            ],
          });
        }),
      ],
    }));

    children.push(heading("Plano de Ação", HeadingLevel.HEADING_3));
    if (actions.length > 0) {
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Ação", 35), headerCell("Responsável", 20), headerCell("Prazo", 20), headerCell("Status", 25)] }),
          ...actions.map(ap => {
            const stColor = ap.status === "completed" ? "green" : ap.status === "in_progress" ? "yellow" : "orange";
            return new TableRow({
              children: [
                textCell(ap.description, false, 35),
                textCell(ap.responsible, false, 20),
                textCell(ap.deadline, false, 20),
                statusCell(statusLabel(ap.status), stColor as any, 25),
              ],
            });
          }),
        ],
      }));
    }
  } else {
    children.push(body("Nenhum risco avaliado."));
  }
  children.push(pageBreak());

  // 10. Psicossocial
  children.push(heading("10. ANÁLISE DOS RISCOS PSICOSSOCIAIS"));
  if (psychosocial.length > 0) {
    psychosocial.forEach(psa => {
      children.push(heading(`Avaliação — ${psa.evaluator_name}`, HeadingLevel.HEADING_3));

      if (psa.nasa_tlx_details) {
        children.push(sectionBanner("NASA-TLX — Carga de Trabalho", COLORS.headerBg2));
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
            ] as [string, number | null][]).map(([dim, val], i) =>
              new TableRow({ children: [altCell(String(dim), i % 2 === 0, dim === "Score Geral", 50), altCell(String(val ?? "—"), i % 2 === 0, dim === "Score Geral", 50)] })
            ),
          ],
        });
        children.push(nasaTable);
      }

      if (psa.copenhagen_details) {
        children.push(sectionBanner("COPSOQ II — Riscos Psicossociais", COLORS.accent));
        const classifyPsyRisk = (v: number) => v >= 75 ? "Baixo risco" : v >= 50 ? "Moderado" : "Alto risco";
        const riskColor = (v: number) => v >= 75 ? COLORS.greenBg : v >= 50 ? COLORS.yellowBg : COLORS.redBg;
        const copTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell3("Dimensão", 40), headerCell3("Score", 20), headerCell3("Classificação", 40)] }),
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
            ] as [string, number][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(dim, false, 40), textCell(String(val), true, 20), shadedCell(classifyPsyRisk(val), riskColor(val), true, 40)] })
            ),
          ],
        });
        children.push(copTable);
      }

      if (psa.hse_it_details) {
        children.push(heading("HSE-IT", HeadingLevel.HEADING_4));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (1-5)", 50)] }),
            ...([
              ["Demandas", psa.hse_it_details.demands], ["Controle", psa.hse_it_details.control],
              ["Suporte", psa.hse_it_details.support], ["Relacionamentos", psa.hse_it_details.relationships],
              ["Papel", psa.hse_it_details.role], ["Mudança", psa.hse_it_details.change],
              ["Score Geral", psa.hse_it_score],
            ] as [string, number | null][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(String(dim), dim === "Score Geral", 50), textCell(String(val ?? "—"), dim === "Score Geral", 50)] })
            ),
          ],
        }));
      }

      children.push(body(`Observações: ${psa.observations}`));
    });
  } else {
    children.push(accentCallout("Nenhuma avaliação psicossocial realizada. Recomenda-se aplicação dos questionários NASA-TLX, HSE-IT e COPSOQ.", "warning"));
  }
  children.push(pageBreak());

  // 11. Responsabilidade técnica
  children.push(heading("11. RESPONSABILIDADE TÉCNICA"));
  children.push(body("O presente documento foi elaborado sob a responsabilidade técnica de profissional habilitado, Especialista em Ergonomia e Engenheiro(a) de Segurança do Trabalho."));
  children.push(body(`${company.city}, ${getTodayFull()}.`));
  children.push(...signatureBlock(consultant));
  children.push(pageBreak());

  // ANEXOS
  children.push(heading("ANEXOS"));
  ["ANÁLISE ERGONÔMICA DOS POSTOS;", "FERRAMENTAS APLICADAS;", "RELATÓRIO TÉCNICO FATORES PSICOSSOCIAIS;", "PLANO DE AÇÃO;"].forEach(t => children.push(bulletItem(t)));
  children.push(pageBreak());

  // Per-workstation annexes
  for (const ws of workstations) {
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
    const wsRisks = wsAnalyses.flatMap(a => risks.filter(r => r.analysis_id === a.id));
    const posAnalysis = mockPostureAnalyses.find(pa => pa.workstation_id === ws.id);
    const gheIndex = workstations.indexOf(ws) + 1;

    children.push(sectionBanner(`RELATÓRIO DA ANÁLISE ERGONÔMICA — GHE ${String(gheIndex).padStart(2, "0")}`, COLORS.headerBg));

    // Header table
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("SETOR", 30), headerCell("FUNÇÕES", 50), headerCell("Nº", 20)] }),
        new TableRow({ children: [textCell(wsSector?.name || "—", false, 30), textCell(`GHE ${String(gheIndex).padStart(2, "0")}: ${ws.name}`, true, 50), textCell(String(gheIndex).padStart(2, "0"), false, 20)] }),
      ],
    }));
    children.push(spacer(100));

    // Description
    children.push(heading("DESCRIÇÃO FÍSICA DO POSTO", HeadingLevel.HEADING_3));
    children.push(body(ws.activity_description || ws.description));
    children.push(body(`Tarefas: ${ws.tasks_performed}`));
    if (wsTasks.length > 0) wsTasks.forEach(t => children.push(bulletItem(t.description)));

    // Measurements
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [mergedCell("MEDIÇÕES AMBIENTAIS", 2, true, COLORS.headerBg2)] }),
        new TableRow({ children: [labelCell("ILUMINAÇÃO – NHO11", 50), textCell("586 lux", false, 50)] }),
        new TableRow({ children: [labelCell("CONFORTO TÉRMICO", 50), textCell("Ventilação artificial e natural", false, 50)] }),
        new TableRow({ children: [labelCell("RUÍDO", 50), textCell("Dentro dos limites aceitáveis", false, 50)] }),
      ],
    }));

    // Joint angles
    if (posAnalysis) {
      children.push(heading("ÂNGULOS ARTICULARES MEDIDOS", HeadingLevel.HEADING_3));
      const jointLabels: Record<string, string> = { neck: "Pescoço", shoulder: "Ombro", elbow: "Cotovelo", trunk: "Tronco", hip: "Quadril", knee: "Joelho" };
      const acceptableRanges: Record<string, string> = { neck: "0° – 20°", shoulder: "0° – 20°", elbow: "80° – 100°", trunk: "0° – 10°", hip: "85° – 100°", knee: "160° – 180°" };
      const angleRows: TableRow[] = [
        new TableRow({ children: [headerCell3("Articulação", 25), headerCell3("Ângulo", 20), headerCell3("Faixa Aceitável", 25), headerCell3("Classificação", 30)] }),
      ];
      Object.entries(posAnalysis.joint_angles).forEach(([joint, angle]) => {
        const label = jointLabels[joint] || joint;
        const range = acceptableRanges[joint] || "—";
        let classification: string;
        let fill: string;
        if (joint === "knee") {
          classification = angle >= 160 ? "Aceitável" : angle >= 140 ? "Atenção" : "Risco Alto";
          fill = angle >= 160 ? COLORS.greenBg : angle >= 140 ? COLORS.yellowBg : COLORS.redBg;
        } else if (joint === "trunk") {
          classification = angle <= 10 ? "Aceitável" : angle <= 20 ? "Atenção" : "Risco Alto";
          fill = angle <= 10 ? COLORS.greenBg : angle <= 20 ? COLORS.yellowBg : COLORS.redBg;
        } else if (joint === "shoulder" || joint === "neck") {
          classification = angle <= 20 ? "Aceitável" : angle <= 45 ? "Atenção" : "Risco Alto";
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
    }

    // Situações encontradas
    children.push(heading("SITUAÇÕES ENCONTRADAS", HeadingLevel.HEADING_3));
    const situacoes: string[] = [
      `Permanência prolongada em posição ortostática (em pé) durante a jornada – NR-17, item 17.3.4.`,
      `Ausência de assentos para descanso ou alternância postural – NR-17, item 17.3.4.`,
    ];
    if (posAnalysis) {
      const angles = posAnalysis.joint_angles;
      if (angles.trunk > 10) situacoes.push(`Flexão de tronco de ${angles.trunk}° – NR-17, item 17.3.2.`);
      if (angles.neck > 20) situacoes.push(`Flexão cervical de ${angles.neck}° – NR-17, item 17.3.2.`);
      if (angles.shoulder > 20) situacoes.push(`Elevação dos braços com ângulo de ${angles.shoulder}° – NR-17, item 17.2.3.`);
    }
    situacoes.push(`Exigência de atenção contínua e concentração – NR-17, item 17.6.`);
    [...new Set(situacoes)].forEach((s, i) => children.push(body(`${i + 1}. ${s}`)));

    // Risk table
    children.push(heading("DESCRIÇÃO DOS RISCOS ERGONÔMICOS", HeadingLevel.HEADING_3));
    const riskDescRows: TableRow[] = [
      new TableRow({ children: [headerCell("Tipos", 12), headerCell("Perigo", 20), headerCell("Danos", 16), headerCell("Fonte", 16), headerCell("Exposição", 12), headerCell("P", 6), headerCell("S", 6), headerCell("NR", 8)] }),
    ];
    const defaultRiskData = [
      { type: "Biomecânico", hazard: "Permanência prolongada em pé", damage: "Fadiga muscular, dores lombares", source: "Atividade contínua", exposure: "Contínuo", p: "M", s: "B", nr: "Baixo" },
      { type: "Biomecânico", hazard: "Movimentos repetitivos de membros superiores", damage: "Tendinites, dores em punhos", source: ws.name, exposure: "Frequente", p: "M", s: "B", nr: "Baixo" },
      { type: "Organizacionais", hazard: "Ritmo intenso de trabalho", damage: "Fadiga física e mental", source: "Organização do trabalho", exposure: "Diário", p: "M", s: "B", nr: "Baixo" },
    ];
    if (wsRisks.length > 0) {
      wsRisks.forEach(r => {
        const pLabel = r.probability <= 3 ? "B" : r.probability <= 6 ? "M" : "A";
        const sLabel = r.consequence <= 3 ? "B" : r.consequence <= 6 ? "M" : "A";
        riskDescRows.push(new TableRow({
          children: [textCell("Biomecânico", false, 12), textCell(r.description, false, 20), textCell("LER/DORT, fadiga", false, 16), textCell(ws.name, false, 16), textCell("Contínuo", false, 12), textCell(pLabel, true, 6), textCell(sLabel, true, 6), textCell(riskLevelLabel(r.risk_level), true, 8)],
        }));
      });
    }
    defaultRiskData.forEach(d => {
      riskDescRows.push(new TableRow({
        children: [textCell(d.type, false, 12), textCell(d.hazard, false, 20), textCell(d.damage, false, 16), textCell(d.source, false, 16), textCell(d.exposure, false, 12), textCell(d.p, true, 6), textCell(d.s, true, 6), textCell(d.nr, true, 8)],
      }));
    });
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: riskDescRows }));

    // Photos
    if (wsPhotos.length > 0) {
      children.push(heading("Registro Fotográfico", HeadingLevel.HEADING_3));
      for (const photo of wsPhotos) {
        if (photo.image_url && photo.image_url !== "/placeholder.svg") {
          const imgData = await fetchImageAsBuffer(photo.image_url);
          if (imgData) children.push(...createImageParagraph(imgData.buffer, imgData.width, imgData.height, `${photo.posture_type} — ${photo.notes}`));
        }
      }
    }

    // Analysis results
    if (wsAnalyses.length > 0) {
      wsAnalyses.forEach(a => {
        const bpLabels: Record<string, string> = { trunk: "Tronco", neck: "Pescoço", legs: "Pernas", upper_arm: "Braço Superior", lower_arm: "Antebraço", wrist: "Punho", chair: "Cadeira", monitor: "Monitor", keyboard: "Teclado", mouse: "Mouse", telephone: "Telefone" };
        children.push(sectionBanner(`RESULTADO ${a.method} — Score: ${a.score}`, COLORS.accent));
        const entries = Object.entries(a.body_parts || {});
        if (entries.length > 0) {
          children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell3("Segmento", 40), headerCell3("Score", 30), headerCell3("Classificação", 30)] }),
              ...entries.map(([part, score]) => {
                const cls = score <= 2 ? "Aceitável" : score <= 4 ? "Investigar" : "Risco";
                const fill = score <= 2 ? COLORS.greenBg : score <= 4 ? COLORS.yellowBg : COLORS.redBg;
                return new TableRow({ children: [textCell(bpLabels[part] || part, false, 40), textCell(String(score), true, 30), shadedCell(cls, fill, true, 30)] });
              }),
            ],
          }));
        }
      });
    }
    children.push(pageBreak());
  }

  // Psychosocial annex
  if (psychosocial.length > 0) {
    children.push(sectionBanner("ANÁLISE DE RISCOS PSICOSSOCIAIS", COLORS.headerBg));
    children.push(heading("1. Introdução", HeadingLevel.HEADING_2));
    children.push(body("Este relatório apresenta os resultados da análise dos riscos psicossociais no ambiente de trabalho, realizados com o apoio da ferramenta COPSOQ II."));
    children.push(heading("2. Metodologia", HeadingLevel.HEADING_2));
    children.push(bulletItem("Demandas Quantitativas: Nível de intensidade e volume de trabalho."));
    children.push(bulletItem("Demandas Cognitivas: Exigências de raciocínio e concentração."));
    children.push(bulletItem("Demandas Emocionais: Impacto emocional devido ao trabalho."));
    children.push(accentCallout("0 a 49: Alto risco  |  50 a 74: Moderado  |  75+: Baixo risco", "info"));

    children.push(heading("3. Resultados", HeadingLevel.HEADING_2));
    psychosocial.forEach(psa => {
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        const classifyPsyRisk = (v: number) => v >= 75 ? "Baixo risco" : v >= 50 ? "Moderado" : "Alto risco";
        const riskColor = (v: number) => v >= 75 ? COLORS.greenBg : v >= 50 ? COLORS.yellowBg : COLORS.redBg;
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Domínio", 40), headerCell("Score", 20), headerCell("Classificação", 40)] }),
            ...([
              ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace],
              ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands],
              ["Influência no Trabalho", cd.influence], ["Desenvolvimento", cd.possibilities_development],
              ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment],
              ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support],
            ] as [string, number][]).map(([dim, val]) =>
              new TableRow({ children: [textCell(dim, false, 40), textCell(String(val), true, 20), shadedCell(classifyPsyRisk(val), riskColor(val), true, 40)] })
            ),
          ],
        }));
      }
    });

    children.push(heading("4. Recomendações", HeadingLevel.HEADING_2));
    children.push(bulletItem("Treinamentos de Gestão de Estresse: capacitação sobre técnicas de manejo do estresse."));
    children.push(bulletItem("Adequação da Carga de Trabalho: ajustes na carga nos setores com alto risco."));
    children.push(bulletItem("Avaliações Periódicas semestrais para monitorar mudanças nos níveis de risco."));
    children.push(pageBreak());
  }

  // Action plan annex
  children.push(heading("PLANO DE AÇÃO — MELHORIAS ERGONÔMICAS"));
  if (actions.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("MELHORIA", 30), headerCell("DETALHAMENTO", 40), headerCell("PRAZO", 15), headerCell("PRIORIDADE", 15)] }),
        ...actions.map(ap => new TableRow({
          children: [textCell(ap.description, true, 30), textCell(ap.description, false, 40), textCell(ap.deadline, false, 15), textCell(ap.status === "completed" ? "Concluída" : "Alta", true, 15)],
        })),
      ],
    }));
  } else {
    const defActions = [
      ["Micropausas ergonômicas", "Pausa de 10 min para mudança postural e alongamentos.", "Imediato", "Altíssima"],
      ["Treinamento NR-17", "Orientar sobre postura e prevenção de LER/DORT.", "60 dias", "Média"],
      ["Adequação de mobiliário", "Verificar e ajustar alturas conforme NR-17.", "60 dias", "Alta"],
    ];
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("MELHORIA", 25), headerCell("DETALHAMENTO", 40), headerCell("PRAZO", 15), headerCell("PRIORIDADE", 20)] }),
        ...defActions.map(([t, d, p, pr]) => new TableRow({ children: [textCell(t, true, 25), textCell(d, false, 40), textCell(p, false, 15), textCell(pr, true, 20)] })),
      ],
    }));
  }

  children.push(...signatureBlock(consultant));

  return createDocumentShell("Análise Ergonômica do Trabalho", company.name, "AET", children);
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
  [
    "Definições e Abreviaturas", "Referências", "Identificação da Empresa",
    "Responsabilidade Técnica", "Aprovação, Distribuição e Implementação", "Introdução",
    "Objetivos", "Campo de Aplicação", "Metodologia Utilizada", "Inventário de Risco",
    "Implementação das Medidas de Prevenção", "EPC — Equipamento de Proteção Coletiva",
    "EPI — Equipamento de Proteção Individual", "Responsabilidades", "Meta e Objetivos",
    "Referências Bibliográficas",
  ].forEach((item, i) => children.push(body(`${i + 1}. ${item}`)));
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
      ...defs.map(([term, def], i) => new TableRow({ children: [altCell(term, i % 2 === 0, true, 30), altCell(def, i % 2 === 0, false, 70)] })),
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

  // 3. Identificação
  children.push(heading("3. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectors.map(s => s.name).join(", "), workstations.map(w => w.name).join(", ")));

  // 4. Responsabilidade
  children.push(heading("4. RESPONSABILIDADE TÉCNICA"));
  children.push(body("Profissional legalmente habilitado e responsável pela elaboração deste programa."));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell2("Campo", 35), headerCell2("Informação", 65)] }),
      new TableRow({ children: [labelCell("Responsável Técnico", 35), textCell(consultant, false, 65)] }),
      new TableRow({ children: [labelCell("Título", 35), textCell("Engenheiro de Segurança do Trabalho", false, 65)] }),
      new TableRow({ children: [labelCell("Registro", 35), textCell("CREA/CONFEA: XXXXX", false, 65)] }),
      new TableRow({ children: [labelCell("Período", 35), textCell(today, false, 65)] }),
    ],
  }));

  // 5-8 
  children.push(heading("5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO"));
  children.push(body("Ao aprovar o Programa de Gerenciamento de Riscos, a empresa compromete-se a cumprir rigorosamente o que nele consta."));

  children.push(heading("6. INTRODUÇÃO"));
  children.push(accentCallout("O PGR tem como objetivo a identificação, avaliação e controle de riscos ocupacionais de forma sistemática e contínua.", "info"));
  children.push(body("A elaboração deste Programa de Gerenciamento de Riscos tem como propósito um estudo das condições ambientais atuais existentes nesta empresa, a fim de identificar os agentes de riscos e caracterizar as atividades e operações desenvolvidas."));

  children.push(heading("7. OBJETIVOS"));
  children.push(heading("7.1 Objetivo Geral", HeadingLevel.HEADING_3));
  children.push(body("Preservar a saúde e a integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e consequente controle dos riscos ambientais."));
  children.push(heading("7.2 Objetivos Específicos", HeadingLevel.HEADING_3));
  ["Seguir a política da empresa relacionada à saúde e segurança",
   "Proteção do meio ambiente e dos recursos naturais",
   "Tratar os riscos ambientais existentes",
   "Planejar ações para preservar a saúde dos trabalhadores",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("7.3 Antecipação", HeadingLevel.HEADING_3));
  children.push(body("Análise dos setores, funções e horários para identificar riscos potenciais e introduzir medidas de proteção."));
  children.push(heading("7.4 Reconhecimento", HeadingLevel.HEADING_3));
  children.push(body("Trabalho de campo para identificar atividades, tarefas, fontes e tipos de riscos ambientais."));
  children.push(heading("7.5 Controle", HeadingLevel.HEADING_3));
  children.push(body("Adotar medidas de controle administrativas, de engenharia, EPCs e EPIs."));
  children.push(heading("7.6 Monitoramento", HeadingLevel.HEADING_3));
  children.push(body("Mensurar a exposição ou inexistência dos riscos e acompanhar eficácia das medidas de controle."));

  children.push(heading("8. CAMPO DE APLICAÇÃO"));
  children.push(body("Este programa é aplicado a toda organização. A avaliação de riscos deve ser revista a cada dois anos ou quando da ocorrência de mudanças significativas."));

  // 9. Metodologia
  children.push(heading("9. METODOLOGIA UTILIZADA"));
  children.push(heading("9.1 Análise Qualitativa", HeadingLevel.HEADING_3));
  children.push(body("Análise preliminar dos riscos ambientais envolvendo instalações, métodos e processos de trabalho."));
  children.push(heading("9.2 Análise Quantitativa", HeadingLevel.HEADING_3));
  children.push(body("Monitoramento ambiental que mensura a exposição dos trabalhadores utilizando dosimetria de ruído, medição de luminosidade e calor/IBUTG."));

  children.push(heading("9.3 Probabilidade (P)", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Índice", 15), headerCell("Exposição", 45), headerCell("Fator de Proteção", 40)] }),
      new TableRow({ children: [shadedCell("1 — Baixo", COLORS.greenBg, true, 15), textCell("Contato baixo ou eventual", false, 45), textCell("Medidas adequadas e com manutenção", false, 40)] }),
      new TableRow({ children: [shadedCell("2 — Moderado", COLORS.yellowBg, true, 15), textCell("Contato moderado ou intermitente", false, 45), textCell("Medidas sem garantia de manutenção", false, 40)] }),
      new TableRow({ children: [shadedCell("3 — Alto", COLORS.orangeBg, true, 15), textCell("Contato alto ou permanente", false, 45), textCell("Desvios significativos", false, 40)] }),
      new TableRow({ children: [shadedCell("4 — Excessivo", COLORS.redBg, true, 15), textCell("Exposição excessiva ou permanente", false, 45), textCell("Medidas inexistentes", false, 40)] }),
    ],
  }));

  children.push(heading("9.4 Gravidade (G)", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Índice", 15), headerCell("Critério", 40), headerCell("Pessoas Expostas", 20)] }),
      new TableRow({ children: [shadedCell("1 — Baixo", COLORS.greenBg, true, 15), textCell("Lesão leve, efeitos reversíveis", false, 40), textCell("Até 10%", false, 20)] }),
      new TableRow({ children: [shadedCell("2 — Moderado", COLORS.yellowBg, true, 15), textCell("Lesão séria, efeitos reversíveis severos", false, 40), textCell("10% a 30%", false, 20)] }),
      new TableRow({ children: [shadedCell("3 — Alto", COLORS.orangeBg, true, 15), textCell("Lesão crítica, efeitos irreversíveis", false, 40), textCell("30% a 60%", false, 20)] }),
      new TableRow({ children: [shadedCell("4 — Excessivo", COLORS.redBg, true, 15), textCell("Lesão incapacitante ou fatal", false, 40), textCell("Acima de 60%", false, 20)] }),
    ],
  }));

  children.push(heading("9.5 Nível de Risco e Priorização", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Nível", 20), headerCell("Ação Requerida", 50), headerCell("Prazo", 30)] }),
      new TableRow({ children: [statusCell("Crítico", "red", 20), textCell("Ações corretivas imediatas", false, 50), textCell("Implementação imediata", false, 30)] }),
      new TableRow({ children: [statusCell("Alto", "orange", 20), textCell("Planejamento a curto prazo", false, 50), textCell("Máximo 3 meses", false, 30)] }),
      new TableRow({ children: [statusCell("Médio", "yellow", 20), textCell("Planejamento a médio/longo prazo", false, 50), textCell("Máximo 6 meses", false, 30)] }),
      new TableRow({ children: [statusCell("Baixo", "green", 20), textCell("Manter controle existente", false, 50), textCell("Máximo 1 ano", false, 30)] }),
    ],
  }));
  children.push(pageBreak());

  // 10. Inventário de Risco por GHE/Setor
  children.push(heading("10. INVENTÁRIO DE RISCO"));
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
    children.push(sectionBanner(`GHE ${String(gheIndex).padStart(2, '0')} — ${sectorName.toUpperCase()}`, COLORS.headerBg2));
    children.push(body(`Caracterização: ${sectorWs.map(w => w.activity_description || w.description).join(". ")}.`));

    children.push(heading("Descrição das Atividades", HeadingLevel.HEADING_3));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell3("Posto/Função", 30), headerCell3("Atividades", 70)] }),
        ...sectorWs.map(ws => {
          const wsTasks = allTasks.filter(t => t.workstation_id === ws.id);
          return new TableRow({ children: [textCell(ws.name, true, 30), textCell(wsTasks.map(t => t.description).join("; ") || ws.tasks_performed, false, 70)] });
        }),
      ],
    }));

    const sectorRisks = risks.filter(r => {
      const a = analyses.find(an => an.id === r.analysis_id);
      return a && sectorWs.some(w => w.id === a.workstation_id);
    });

    children.push(heading("Inventário de Riscos", HeadingLevel.HEADING_3));
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
              children: [textCell(r.description, false, 25), textCell(ws?.name || "—", false, 20), textCell(ws?.activity_description || "—", false, 20), textCell(pL, false, 8), textCell(gL, false, 8), textCell(riskLevelLabel(r.risk_level).charAt(0), false, 8), textCell(ctrl, false, 16)],
            });
          }),
        ],
      }));
    } else {
      children.push(accentCallout("Nenhum risco identificado para este setor.", "success"));
    }
    children.push(accentCallout("Recomendação: Realizar Análise Ergonômica do Trabalho (AET).", "warning"));
  });
  children.push(pageBreak());

  // 11-16
  children.push(heading("11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO"));
  children.push(body("A implementação das medidas de prevenção e respectivos ajustes são registrados no PLANO DE AÇÃO."));
  children.push(heading("11.1 Plano de Ação", HeadingLevel.HEADING_3));
  children.push(body("O Ciclo PDCA (Plan, Do, Check, Act) é utilizado para acompanhamento das ações."));
  if (actions.length > 0) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Ação", 30), headerCell("Estratégia", 25), headerCell("Responsável", 15), headerCell("Prazo", 15), headerCell("Status", 15)] }),
        ...actions.map(ap => new TableRow({
          children: [textCell(ap.description, false, 30), textCell("Implementar conforme PGR", false, 25), textCell(ap.responsible, false, 15), textCell(ap.deadline, false, 15), textCell(statusLabel(ap.status), false, 15)],
        })),
      ],
    }));
  }

  children.push(heading("12. EPC — EQUIPAMENTO DE PROTEÇÃO COLETIVA"));
  children.push(body("O estudo e implantação de medidas de proteção coletiva deverá obedecer à hierarquia: eliminação na fonte, prevenção de disseminação, redução de níveis."));

  children.push(heading("13. EPI — EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL"));
  children.push(body("O EPI é todo dispositivo de uso individual destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho."));
  ["Adquirir o EPI adequado ao risco", "Exigir seu uso", "Orientar e treinar sobre uso, guarda e conservação", "Substituir imediatamente quando danificado", "Registrar o fornecimento ao trabalhador"].forEach(item => children.push(bulletItem(`Cabe ao empregador: ${item}`)));

  children.push(heading("14. RESPONSABILIDADES"));
  children.push(heading("Do Empregador", HeadingLevel.HEADING_3));
  ["Estabelecer e assegurar o cumprimento do PGR", "Informar trabalhadores sobre riscos", "Garantir interrupção de atividades em risco grave"].forEach(item => children.push(bulletItem(item)));
  children.push(heading("Do SESMT", HeadingLevel.HEADING_3));
  ["Executar, coordenar e monitorar as etapas", "Programar e aplicar treinamentos", "Manter arquivado por 20 anos os relatórios"].forEach(item => children.push(bulletItem(item)));

  children.push(heading("15. META E OBJETIVOS"));
  ["Reduzir em 20% os riscos Alto/Crítico", "Garantir treinamento a 100% dos trabalhadores expostos", "Implementar ações do Plano dentro dos prazos"].forEach(item => children.push(bulletItem(item)));

  children.push(heading("16. REFERÊNCIAS BIBLIOGRÁFICAS"));
  ["Normas Regulamentadoras — Ministério do Trabalho", "ABNT NBR ISO 31000:2009 — Gestão de Riscos", "BS 8800:1996 — OHS Management Systems", "FUNDACENTRO — NHO 01, NHO 06, NHO 11"].forEach(item => children.push(bulletItem(item)));

  children.push(...signatureBlock(consultant));

  return createDocumentShell("Programa de Gerenciamento de Riscos", company.name, "PGR", children);
}

// ========== APR REPORT — Avaliação Preliminar de Riscos Psicossociais ==========
function generateAPRDocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);

  const children: any[] = [];

  // Cover
  children.push(...createCoverPage("AVALIAÇÃO PRELIMINAR DE RISCOS PSICOSSOCIAIS", "APR — FRPRT", company, consultant));

  // Sumário
  children.push(heading("SUMÁRIO"));
  ["Objetivo", "Metodologia", "Amostra", "Práticas Preventivas da Organização", "Resultado da Avaliação", "Recomendações", "Considerações Finais"].forEach((item, i) => children.push(body(`${i + 1}. ${item}`)));
  children.push(pageBreak());

  // Revision
  children.push(...createRevisionTable());
  children.push(pageBreak());

  // 1. Objetivo
  children.push(heading("1. OBJETIVO"));
  children.push(accentCallout("A avaliação dos fatores de risco psicossociais é fundamental para a promoção da saúde mental no trabalho e cumprimento da NR-01.", "info"));
  children.push(body("O presente relatório tem por objetivo apresentar os resultados da Avaliação Preliminar de Fatores de Risco Psicossociais Relacionados ao Trabalho (FRPRT), conforme estabelecido pela Norma Regulamentadora NR-01, que determina que as organizações devem identificar e gerenciar os riscos ocupacionais, incluindo os fatores psicossociais."));
  children.push(body("A avaliação busca identificar, de forma sistematizada, os principais fatores psicossociais que podem impactar a saúde mental e o bem-estar dos trabalhadores, subsidiando a elaboração de planos de ação preventivos e corretivos."));

  // Company ID
  children.push(heading("IDENTIFICAÇÃO DA EMPRESA", HeadingLevel.HEADING_2));
  children.push(createInfoTable(company, sectors.map(s => s.name).join(", "), workstations.map(w => w.name).join(", ")));
  children.push(pageBreak());

  // 2. Metodologia
  children.push(heading("2. METODOLOGIA"));
  children.push(body("A metodologia utilizada para a avaliação preliminar dos riscos psicossociais é baseada no instrumento COPSOQ II (Copenhagen Psychosocial Questionnaire), reconhecido internacionalmente como ferramenta de referência para avaliação de fatores psicossociais no trabalho."));
  children.push(body("O questionário contempla dimensões como demandas quantitativas, cognitivas e emocionais, influência no trabalho, possibilidades de desenvolvimento, significado do trabalho, compromisso, previsibilidade e suporte social."));

  children.push(heading("Critérios de Classificação", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Faixa de Score", 30), headerCell("Classificação", 35), headerCell("Ação Requerida", 35)] }),
      new TableRow({ children: [statusCell("0 a 49", "red", 30), statusCell("ALTO RISCO", "red", 35), textCell("Intervenção imediata, ações corretivas urgentes", false, 35)] }),
      new TableRow({ children: [statusCell("50 a 74", "yellow", 30), statusCell("RISCO MODERADO", "yellow", 35), textCell("Monitoramento e ações preventivas", false, 35)] }),
      new TableRow({ children: [statusCell("75 a 100", "green", 30), statusCell("BAIXO RISCO", "green", 35), textCell("Manter práticas existentes", false, 35)] }),
    ],
  }));

  // 3. Amostra
  children.push(heading("3. AMOSTRA"));
  children.push(body(`A avaliação abrangeu ${workstations.length} postos de trabalho distribuídos em ${sectors.length} setores da empresa ${company.name}.`));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell2("Dados da Amostra", 40), headerCell2("Quantidade", 60)] }),
      new TableRow({ children: [labelCell("Setores avaliados", 40), textCell(String(sectors.length), false, 60)] }),
      new TableRow({ children: [labelCell("Postos de trabalho", 40), textCell(String(workstations.length), false, 60)] }),
      new TableRow({ children: [labelCell("Avaliações psicossociais", 40), textCell(String(psychosocial.length), false, 60)] }),
      new TableRow({ children: [labelCell("Período de avaliação", 40), textCell(getTodayFull(), false, 60)] }),
    ],
  }));

  // 4. Práticas preventivas
  children.push(heading("4. PRÁTICAS PREVENTIVAS DA ORGANIZAÇÃO"));
  children.push(body("Foram identificadas as seguintes práticas preventivas já adotadas pela organização:"));
  ["Pausas para descanso durante a jornada de trabalho", "Comunicação interna sobre saúde e segurança", "Treinamentos periódicos sobre segurança do trabalho", "Disponibilidade de EPIs adequados", "Acompanhamento médico ocupacional (PCMSO)"].forEach(p => children.push(bulletItem(p)));
  children.push(pageBreak());

  // 5. Resultados
  children.push(heading("5. RESULTADO DA AVALIAÇÃO"));
  if (psychosocial.length > 0) {
    psychosocial.forEach(psa => {
      if (psa.copenhagen_details) {
        const cd = psa.copenhagen_details;
        const classifyPsyRisk = (v: number) => v >= 75 ? "Baixo risco" : v >= 50 ? "Moderado" : "Alto risco";
        const riskColor = (v: number): "green" | "yellow" | "red" => v >= 75 ? "green" : v >= 50 ? "yellow" : "red";

        children.push(sectionBanner("RESULTADO POR DOMÍNIO — COPSOQ II", COLORS.accent));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Domínio", 35), headerCell("Score", 15), headerCell("Classificação", 25), headerCell("Prioridade", 25)] }),
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
            ] as [string, number][]).map(([dim, val]) => {
              const priority = val < 50 ? "Urgente" : val < 75 ? "Média" : "Baixa";
              return new TableRow({
                children: [textCell(dim, false, 35), textCell(String(val), true, 15), statusCell(classifyPsyRisk(val), riskColor(val), 25), textCell(priority, true, 25)],
              });
            }),
          ],
        }));

        // Score geral
        children.push(spacer(200));
        const overallScore = psa.copenhagen_score || Math.round(
          (cd.quantitative_demands + cd.work_pace + cd.cognitive_demands + cd.emotional_demands +
          cd.influence + cd.possibilities_development + cd.meaning_work + cd.commitment +
          cd.predictability + cd.social_support) / 10
        );
        const overallLevel = overallScore >= 75 ? "green" : overallScore >= 50 ? "yellow" : "red";
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                mergedCell("SCORE GERAL DA AVALIAÇÃO", 1, true, COLORS.headerBg),
                statusCell(String(overallScore), overallLevel, undefined),
              ],
            }),
          ],
        }));
      }

      if (psa.nasa_tlx_details) {
        children.push(sectionBanner("NASA-TLX — CARGA DE TRABALHO", COLORS.headerBg2));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell2("Dimensão", 50), headerCell2("Score (0-100)", 50)] }),
            ...([
              ["Demanda Mental", psa.nasa_tlx_details.mental_demand],
              ["Demanda Física", psa.nasa_tlx_details.physical_demand],
              ["Demanda Temporal", psa.nasa_tlx_details.temporal_demand],
              ["Performance", psa.nasa_tlx_details.performance],
              ["Esforço", psa.nasa_tlx_details.effort],
              ["Frustração", psa.nasa_tlx_details.frustration],
            ] as [string, number][]).map(([dim, val], i) =>
              new TableRow({ children: [altCell(dim, i % 2 === 0, false, 50), altCell(String(val), i % 2 === 0, true, 50)] })
            ),
            new TableRow({ children: [mergedCell("Score Geral", 1, true, COLORS.cellLabel), textCell(String(psa.nasa_tlx_score), true)] }),
          ],
        }));
      }

      children.push(body(`Observações: ${psa.observations}`));
    });
  } else {
    children.push(accentCallout("Nenhuma avaliação psicossocial encontrada. Recomenda-se aplicação urgente dos questionários COPSOQ II e NASA-TLX.", "danger"));
  }
  children.push(pageBreak());

  // 6. Recomendações
  children.push(heading("6. RECOMENDAÇÕES"));
  children.push(sectionBanner("PLANO DE AÇÃO PARA RISCOS PSICOSSOCIAIS", COLORS.accent));
  const recTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Ação", 30), headerCell3("Detalhamento", 40), headerCell3("Prazo", 15), headerCell3("Prioridade", 15)] }),
      new TableRow({ children: [textCell("Gestão de Estresse", true, 30), textCell("Programas de capacitação sobre técnicas de manejo do estresse, meditação e relaxamento.", false, 40), textCell("60 dias", false, 15), statusCell("Média", "yellow", 15)] }),
      new TableRow({ children: [textCell("Adequação da Carga", true, 30), textCell("Reorganizar tarefas e ajustar prazos nos setores com alto risco quantitativo.", false, 40), textCell("45 dias", false, 15), statusCell("Alta", "orange", 15)] }),
      new TableRow({ children: [textCell("Canal de Feedback", true, 30), textCell("Criar canais contínuos para relato de alterações nas condições de trabalho.", false, 40), textCell("30 dias", false, 15), statusCell("Alta", "orange", 15)] }),
      new TableRow({ children: [textCell("Avaliações Periódicas", true, 30), textCell("Realizar novas avaliações semestrais para monitorar mudanças nos níveis de risco.", false, 40), textCell("6 meses", false, 15), statusCell("Média", "yellow", 15)] }),
      new TableRow({ children: [textCell("Programa de Qualidade de Vida", true, 30), textCell("Implementar atividades de promoção da saúde: ginástica laboral, rodas de conversa.", false, 40), textCell("90 dias", false, 15), statusCell("Média", "yellow", 15)] }),
    ],
  });
  children.push(recTable);

  // 7. Considerações finais
  children.push(heading("7. CONSIDERAÇÕES FINAIS"));
  children.push(body("A análise dos dados revelou o perfil de riscos psicossociais da empresa. A implementação das ações recomendadas pode contribuir significativamente para a redução desses riscos, promovendo um ambiente de trabalho mais saudável e produtivo."));
  children.push(accentCallout("A avaliação dos fatores de risco psicossociais deve ser revisada periodicamente, conforme determina a NR-01, sendo recomendável a realização semestral.", "info"));
  children.push(body(`${company.city}, ${getTodayFull()}.`));

  children.push(...signatureBlock(consultant));

  return createDocumentShell("Avaliação Preliminar de Riscos Psicossociais", company.name, "APR", children);
}

// ========== PCMSO REPORT ==========
function generatePCMSODocx(ctx: DocxReportContext): Document {
  const { company, workstations, sectors, analyses } = ctx;
  const consultant = ctx.consultantName || "Médico do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));

  const children: any[] = [];

  // Cover
  children.push(...createCoverPage("PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL", "PCMSO", company, consultant));

  // Sumário
  children.push(heading("SUMÁRIO"));
  [
    "Definições e Abreviaturas", "Referências", "Identificação da Empresa", "Introdução",
    "Objetivos", "Aplicação", "Aprovação, Distribuição e Implementação",
    "Médico Responsável", "Responsabilidades", "Exames Médicos Ocupacionais",
    "Condutas com Base nos Exames", "Diretrizes do PCMSO", "Desenvolvimento do PCMSO",
    "Avaliação dos Riscos e Exames Recomendados", "Registro e Manutenção dos Dados",
    "Relatórios Estatísticos e Gerenciais", "Ações Médicas Preventivas",
    "Cronograma Anual de Ações", "Primeiros Socorros", "Procedimentos em Acidentes",
    "Conclusão",
  ].forEach((item, i) => children.push(body(`${i + 1}. ${item}`)));
  children.push(pageBreak());

  // Revision
  children.push(...createRevisionTable());
  children.push(pageBreak());

  // 1. Definições
  children.push(heading("1. DEFINIÇÕES E ABREVIATURAS"));
  const defs: [string, string][] = [
    ["ASO", "Atestado de Saúde Ocupacional"],
    ["CA", "Certificado de Aprovação"],
    ["CBO", "Classificação Brasileira de Ocupações"],
    ["CLT", "Consolidação das Leis do Trabalho"],
    ["EPI", "Equipamento de Proteção Individual"],
    ["GHE", "Grupos Homogêneos de Exposição"],
    ["NR", "Norma Regulamentadora"],
    ["PCMSO", "Programa de Controle Médico de Saúde Ocupacional"],
    ["PGR", "Programa de Gerenciamento de Riscos"],
    ["SESMT", "Serviços Especializados em Eng. de Segurança e Medicina do Trabalho"],
  ];
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Termo", 25), headerCell("Definição", 75)] }),
      ...defs.map(([term, def], i) => new TableRow({ children: [altCell(term, i % 2 === 0, true, 25), altCell(def, i % 2 === 0, false, 75)] })),
    ],
  }));

  // 2. Referências
  children.push(heading("2. REFERÊNCIAS"));
  ["NR 7 — PCMSO", "NR 1 — Disposições Gerais e GRO", "NR 9 — Agentes Físicos, Químicos e Biológicos",
   "NR 15 — Atividades e Operações Insalubres", "NR 17 — Ergonomia",
   "Portaria 6.734/2020 — Nova NR-7", "CLT — Art. 168 e 169",
  ].forEach(ref => children.push(bulletItem(ref)));

  // 3. Identificação
  children.push(heading("3. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectors.map(s => s.name).join(", "), workstations.map(w => w.name).join(", ")));

  // 4. Introdução
  children.push(heading("4. INTRODUÇÃO"));
  children.push(accentCallout("O PCMSO é um programa de caráter preventivo, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.", "info"));
  children.push(body("O Programa de Controle Médico de Saúde Ocupacional (PCMSO) tem como finalidade a promoção e preservação da saúde do conjunto dos trabalhadores da empresa. Deve ser planejado e implantado com base nos riscos à saúde dos trabalhadores, especialmente os identificados nas avaliações previstas na NR-1 (PGR)."));
  children.push(body("O PCMSO deve considerar as questões incidentes sobre o indivíduo e a coletividade de trabalhadores, privilegiando o instrumental clínico-epidemiológico na abordagem da relação entre sua saúde e o trabalho."));

  // 5. Objetivos
  children.push(heading("5. OBJETIVOS"));
  children.push(heading("5.1 Objetivo Geral", HeadingLevel.HEADING_3));
  children.push(body("A promoção e preservação da saúde do conjunto dos trabalhadores, através da prevenção, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho, inclusive de natureza subclínica, além de constatação de casos de doenças profissionais ou danos irreversíveis à saúde dos trabalhadores."));
  children.push(heading("5.2 Objetivos Específicos", HeadingLevel.HEADING_3));
  ["Definir exames médicos ocupacionais obrigatórios", "Estabelecer critérios para exames complementares conforme riscos",
   "Monitorar a saúde dos trabalhadores expostos a riscos ocupacionais", "Subsidiar ações de prevenção e promoção da saúde",
   "Registrar e analisar dados estatísticos de saúde ocupacional",
  ].forEach(item => children.push(bulletItem(item)));

  // 6. Aplicação
  children.push(heading("6. APLICAÇÃO"));
  children.push(body(`Este programa aplica-se a todos os trabalhadores da ${company.name}, incluindo empregados, terceiros e estagiários que atuem nas dependências da empresa.`));

  // 7. Aprovação
  children.push(heading("7. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO"));
  children.push(body("O PCMSO entra em vigor na data de sua aprovação pelo representante legal da empresa e pelo médico coordenador. Sua distribuição deve contemplar as áreas de Segurança do Trabalho, Recursos Humanos e Gerências operacionais."));

  // 8. Médico responsável
  children.push(heading("8. MÉDICO RESPONSÁVEL"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell2("Campo", 35), headerCell2("Informação", 65)] }),
      new TableRow({ children: [labelCell("Médico Coordenador", 35), textCell(consultant, false, 65)] }),
      new TableRow({ children: [labelCell("Especialidade", 35), textCell("Medicina do Trabalho", false, 65)] }),
      new TableRow({ children: [labelCell("CRM", 35), textCell("XXXXX", false, 65)] }),
      new TableRow({ children: [labelCell("Vigência", 35), textCell(`${getToday()} a ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}`, false, 65)] }),
    ],
  }));

  // 9. Responsabilidades
  children.push(heading("9. RESPONSABILIDADES"));
  children.push(heading("9.1 Do Empregador", HeadingLevel.HEADING_3));
  ["Garantir a elaboração e efetiva implementação do PCMSO", "Custear todos os procedimentos relacionados ao PCMSO",
   "Indicar médico do trabalho responsável pelo programa",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("9.2 Do SESMT/Administração", HeadingLevel.HEADING_3));
  ["Coordenar e executar as ações previstas no PCMSO", "Controlar a periodicidade dos exames",
   "Encaminhar trabalhadores para avaliações médicas",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("9.3 Dos Empregados", HeadingLevel.HEADING_3));
  ["Submeter-se aos exames médicos previstos", "Informar ao médico sobre condições de saúde relevantes",
   "Cumprir as recomendações médicas",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(pageBreak());

  // 10. Exames médicos ocupacionais
  children.push(heading("10. EXAMES MÉDICOS OCUPACIONAIS"));
  children.push(sectionBanner("TIPOS DE EXAMES OBRIGATÓRIOS", COLORS.headerBg2));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Tipo de Exame", 30), headerCell("Momento", 35), headerCell("Prazo", 35)] }),
      new TableRow({ children: [textCell("Admissional", true, 30), textCell("Antes do início das atividades", false, 35), textCell("Antes da admissão", false, 35)] }),
      new TableRow({ children: [textCell("Periódico", true, 30), textCell("Durante a vigência do contrato", false, 35), textCell("Anual ou semestral conforme risco", false, 35)] }),
      new TableRow({ children: [textCell("Retorno ao Trabalho", true, 30), textCell("Após afastamento ≥30 dias", false, 35), textCell("No 1º dia de retorno", false, 35)] }),
      new TableRow({ children: [textCell("Mudança de Risco", true, 30), textCell("Ao mudar de função/setor", false, 35), textCell("Antes da mudança", false, 35)] }),
      new TableRow({ children: [textCell("Demissional", true, 30), textCell("No desligamento", false, 35), textCell("Até 10 dias antes da data", false, 35)] }),
    ],
  }));

  // 14. Avaliação dos riscos e exames
  children.push(heading("14. AVALIAÇÃO DOS RISCOS E EXAMES RECOMENDADOS"));
  children.push(body("Com base no inventário de riscos do PGR, os seguintes exames complementares são recomendados por GHE:"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Risco Ocupacional", 25), headerCell("Exames Complementares", 50), headerCell("Periodicidade", 25)] }),
      new TableRow({ children: [textCell("Ruído", true, 25), textCell("Audiometria tonal e vocal", false, 50), textCell("Semestral", false, 25)] }),
      new TableRow({ children: [textCell("Ergonômico", true, 25), textCell("Avaliação clínica osteomuscular", false, 50), textCell("Anual", false, 25)] }),
      new TableRow({ children: [textCell("Químico", true, 25), textCell("Hemograma, função hepática e renal", false, 50), textCell("Semestral", false, 25)] }),
      new TableRow({ children: [textCell("Biológico", true, 25), textCell("Hemograma completo, sorologia", false, 50), textCell("Anual", false, 25)] }),
      new TableRow({ children: [textCell("Calor", true, 25), textCell("Avaliação clínica, eletrólitos séricos", false, 50), textCell("Anual", false, 25)] }),
    ],
  }));

  // 17. Ações médicas preventivas
  children.push(heading("17. AÇÕES MÉDICAS PREVENTIVAS"));
  children.push(heading("17.1 Vacinação", HeadingLevel.HEADING_3));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell3("Vacina", 30), headerCell3("Esquema", 35), headerCell3("Indicação", 35)] }),
      new TableRow({ children: [textCell("Hepatite B", true, 30), textCell("3 doses (0, 1 e 6 meses)", false, 35), textCell("Todos os trabalhadores", false, 35)] }),
      new TableRow({ children: [textCell("Tétano/Difteria (dT)", true, 30), textCell("3 doses + reforço a cada 10 anos", false, 35), textCell("Todos os trabalhadores", false, 35)] }),
      new TableRow({ children: [textCell("Influenza", true, 30), textCell("Dose anual", false, 35), textCell("Todos os trabalhadores", false, 35)] }),
      new TableRow({ children: [textCell("COVID-19", true, 30), textCell("Conforme orientação vigente", false, 35), textCell("Todos os trabalhadores", false, 35)] }),
    ],
  }));

  // 18. Cronograma
  children.push(heading("18. CRONOGRAMA ANUAL DE AÇÕES"));
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  children.push(accentCallout("O cronograma deve ser revisado anualmente e ajustado conforme demandas identificadas.", "info"));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Ação", 25), ...months.slice(0, 6).map(m => headerCell(m))] }),
      new TableRow({ children: [textCell("Exames Periódicos", true, 25), ...["X", "X", "X", "X", "X", "X"].map(v => textCell(v, false))] }),
      new TableRow({ children: [textCell("Campanha Vacinação", true, 25), ...["", "", "X", "", "", ""].map(v => textCell(v, false))] }),
      new TableRow({ children: [textCell("SIPAT/Treinamentos", true, 25), ...["", "", "", "", "X", ""].map(v => textCell(v, false))] }),
      new TableRow({ children: [textCell("Relatório Analítico", true, 25), ...["", "", "", "", "", "X"].map(v => textCell(v, false))] }),
    ],
  }));

  // 19. Primeiros socorros
  children.push(heading("19. CONTEÚDO DA CAIXA DE PRIMEIROS SOCORROS"));
  ["Compressas de gaze estéril", "Ataduras de crepe", "Esparadrapo", "Luvas descartáveis",
   "Solução antisséptica (PVPI ou clorexidina)", "Tesoura de ponta romba", "Pinça",
   "Algodão hidrófilo", "Soro fisiológico", "Termômetro clínico",
  ].forEach(item => children.push(bulletItem(item)));

  // 20. Procedimentos em acidentes
  children.push(heading("20. PROCEDIMENTOS EM CASOS DE ACIDENTE"));
  children.push(heading("20.1 Acidentes Típicos ou de Trajeto", HeadingLevel.HEADING_3));
  ["Prestar primeiros socorros", "Comunicar imediatamente à chefia e ao SESMT",
   "Emitir CAT em até 24 horas", "Encaminhar ao atendimento médico",
  ].forEach(item => children.push(bulletItem(item)));
  children.push(heading("20.2 Acidentes com Produtos Químicos", HeadingLevel.HEADING_3));
  ["Remover o trabalhador da área contaminada", "Lavar abundantemente com água corrente",
   "Consultar a FISPQ do produto", "Encaminhar ao pronto-socorro de referência",
  ].forEach(item => children.push(bulletItem(item)));

  // 21. Conclusão
  children.push(heading("21. CONCLUSÃO"));
  children.push(body("O presente PCMSO foi elaborado com base nos riscos ocupacionais identificados no PGR, contemplando todos os trabalhadores da empresa. Sua efetiva implementação contribuirá para a promoção e preservação da saúde dos colaboradores."));
  children.push(accentCallout("O PCMSO deve ser revisado anualmente ou sempre que houver alteração nos riscos ocupacionais identificados no PGR.", "info"));
  children.push(body(`${company.city}, ${getTodayFull()}.`));

  children.push(...signatureBlock(consultant, "Médico do Trabalho"));

  return createDocumentShell("Programa de Controle Médico de Saúde Ocupacional", company.name, "PCMSO", children);
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
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Descrição", 50), headerCell("Score", 25), headerCell("Nível", 25)] }),
        ...risks.map(r => {
          const levelColor = r.risk_level === "critical" ? "red" : r.risk_level === "high" ? "orange" : r.risk_level === "medium" ? "yellow" : "green";
          return new TableRow({
            children: [textCell(r.description, false, 50), textCell(String(r.risk_score), true, 25), statusCell(riskLevelLabel(r.risk_level), levelColor as any, 25)],
          });
        }),
      ],
    }));
  } else {
    children.push(body("Nenhum risco."));
  }

  children.push(heading("4. RECOMENDAÇÕES"));
  if (actions.length > 0) {
    actions.forEach(ap => children.push(bulletItem(`${ap.description} (${ap.responsible} — ${ap.deadline})`)));
  } else {
    children.push(body("Sem recomendações."));
  }

  children.push(...signatureBlock(consultant));

  return createDocumentShell(reportType, company.name, reportType, children);
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
    case "APR":
      doc = generateAPRDocx(ctx);
      break;
    case "PCMSO":
      doc = generatePCMSODocx(ctx);
      break;
    default:
      doc = generateGenericDocx(ctx);
      break;
  }

  const blob = await Packer.toBlob(doc);
  const fileName = `${ctx.reportType}_${ctx.company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}
