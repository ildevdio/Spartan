import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, PageBreak,
  Header, Footer, TabStopPosition, TabStopType,
  ShadingType, convertInchesToTwip, ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, ReportType, Task, PsychosocialAnalysis, RiskAssessment, ActionPlan } from "./types";
import { riskLevelLabel, statusLabel } from "./types";
import { mockRiskAssessments, mockActionPlans, mockTasks, mockPsychosocialAnalyses } from "./mock-data";

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

const COLORS = {
  primary: "1e293b",
  secondary: "475569",
  muted: "64748b",
  light: "94a3b8",
  accent: "2563eb",
  headerBg: "f1f5f9",
  white: "FFFFFF",
  border: "D1D5DB",
};

function borderStyle() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  };
}

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Calibri", color: COLORS.primary })] })],
    shading: { type: ShadingType.SOLID, fill: COLORS.headerBg, color: COLORS.headerBg },
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
  });
}

function textCell(text: string, bold = false, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Calibri", bold, color: COLORS.primary })] })],
    borders: borderStyle(),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
  });
}

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 360, after: 120 },
  });
}

function body(text: string, options?: { bold?: boolean; spacing?: { before?: number; after?: number } }): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", bold: options?.bold, color: COLORS.primary })],
    spacing: options?.spacing || { after: 120 },
  });
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri", color: COLORS.primary })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function getToday(): string {
  return new Date().toLocaleDateString("pt-BR");
}

function createCoverPage(title: string, subtitle: string, company: Company, consultant: string): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 56, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, size: 36, font: "Calibri", color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: company.name, bold: true, size: 40, font: "Calibri", color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `CNPJ: ${company.cnpj}`, size: 22, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${company.address} — ${company.city}/${company.state}`, size: 22, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Emissão: ${getToday()}`, size: 22, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Revisão: 00`, size: 22, font: "Calibri", color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Responsável Técnico: ", size: 22, font: "Calibri", color: COLORS.secondary }),
        new TextRun({ text: consultant, bold: true, size: 22, font: "Calibri", color: COLORS.primary }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "MG Consultoria — Ergonomia & Segurança do Trabalho", size: 18, font: "Calibri", color: COLORS.light, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    pageBreak(),
  ];
}

function createInfoTable(company: Company, sectorName: string, wsName: string): Table {
  const rows = [
    ["Razão Social", company.name],
    ["CNPJ", company.cnpj],
    ["Endereço", company.address],
    ["Cidade/UF", `${company.city}/${company.state}`],
    ["Descrição", company.description],
    ["Setor Avaliado", sectorName],
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

// ========== AET REPORT ==========
function generateAETDocx(ctx: DocxReportContext): Document {
  const { company, sector, workstation, workstations, sectors, analyses, photos } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const wsIds = workstations.map(w => w.id);
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const tasks = mockTasks.filter(t => wsIds.includes(t.workstation_id));
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);
  const methods = [...new Set(analyses.map(a => a.method))].join(", ") || "N/A";
  const sectorName = sector?.name || "Geral";
  const wsName = workstation?.name || workstations.map(w => w.name).join(", ");

  const children: any[] = [];

  // Cover
  children.push(...createCoverPage("ANÁLISE ERGONÔMICA DO TRABALHO", "AET", company, consultant));

  // Table of Contents
  children.push(heading("ÍNDICE"));
  const tocItems = [
    "Introdução", "Identificação e Caracterização da Empresa", "Objetivos",
    "Referências Normativas", "Análise da Demanda e do Funcionamento da Organização",
    "Referencial Teórico", "Estudo Ergonômico do Trabalho",
    "Definição de Métodos, Técnicas e Ferramentas",
    "Agrupamento por GHE e Matriz de Avaliação Ergonômica",
    "Análise dos Riscos Psicossociais", "Responsabilidade Técnica",
  ];
  tocItems.forEach((item, i) => {
    children.push(body(`${i + 1}. ${item}`));
  });
  children.push(pageBreak());

  // 1. Introdução
  children.push(heading("1. INTRODUÇÃO"));
  children.push(body("Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana."));
  children.push(body("A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa."));
  children.push(body("Locais de trabalho planejados de forma incorreta tendem a reduzir o desempenho, comprometer a qualidade, elevar o absenteísmo e aumentar custos operacionais. A ergonomia busca tornar a interação entre trabalhador, equipamentos e ambiente o mais segura, eficiente e confortável possível."));
  children.push(body("Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho."));

  // 2. Identificação
  children.push(heading("2. IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectorName, wsName));

  // 3. Objetivos
  children.push(heading("3. OBJETIVOS"));
  children.push(body("O presente documento tem por objetivo:"));
  [
    "Realizar a Análise Ergonômica do Trabalho (AET) conforme as diretrizes da NR-17;",
    "Identificar e avaliar os riscos ergonômicos nos postos de trabalho analisados;",
    "Classificar os riscos utilizando métodos ergonômicos validados internacionalmente;",
    "Propor recomendações de melhoria baseadas em evidências científicas;",
    "Atender às exigências legais e normativas de segurança e saúde do trabalho;",
    "Contribuir para a melhoria contínua das condições de trabalho na organização.",
  ].forEach(t => children.push(bulletItem(t)));

  // 4. Referências Normativas
  children.push(heading("4. REFERÊNCIAS NORMATIVAS"));
  children.push(body("Este trabalho foi elaborado com base nas seguintes normas e legislações:"));
  const normasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Norma", 20), headerCell("Descrição", 80)] }),
      ...([
        ["NR-17", "Ergonomia — Parâmetros para adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores"],
        ["NR-01", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais — PGR"],
        ["ISO 11228", "Ergonomia — Movimentação manual de cargas"],
        ["ISO 11226", "Ergonomia — Avaliação de posturas de trabalho estáticas"],
        ["CLT Art. 157-158", "Obrigações do empregador e empregados quanto à segurança do trabalho"],
      ] as [string, string][]).map(([norm, desc]) =>
        new TableRow({ children: [textCell(norm, true, 20), textCell(desc, false, 80)] })
      ),
    ],
  });
  children.push(normasTable);

  // 5. Análise da Demanda
  children.push(heading("5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO"));
  children.push(body(`A empresa ${company.name} opera no segmento de ${company.description.toLowerCase()}. A organização do trabalho foi avaliada considerando a estrutura setorial, distribuição de tarefas, jornada de trabalho e ritmo de produção.`));
  workstations.forEach(ws => {
    const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
    const wsSector = sectors.find(s => s.id === ws.sector_id);
    children.push(heading(`Posto: ${ws.name}${wsSector ? ` (${wsSector.name})` : ""}`, HeadingLevel.HEADING_3));
    children.push(body(`Descrição da atividade: ${ws.activity_description || ws.description}`, { bold: false }));
    children.push(body("Tarefas executadas:", { bold: true }));
    if (wsTasks.length > 0) {
      wsTasks.forEach(t => children.push(bulletItem(t.description)));
    } else {
      children.push(bulletItem(ws.tasks_performed));
    }
  });

  // 6. Referencial Teórico
  children.push(heading("6. REFERENCIAL TEÓRICO"));
  children.push(body("A Ergonomia, segundo a International Ergonomics Association (IEA), é a disciplina científica que trata da compreensão das interações entre seres humanos e outros elementos de um sistema, aplicando teorias, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema."));
  children.push(body("A análise ergonômica do trabalho (AET) é uma metodologia que permite compreender o trabalho real, indo além da tarefa prescrita. Através da observação sistemática, registro fotográfico e utilização de ferramentas validadas, busca-se identificar as exigências biomecânicas, cognitivas e organizacionais impostas aos trabalhadores."));
  children.push(heading("Principais conceitos aplicados:", HeadingLevel.HEADING_3));
  children.push(bulletItem("Ergonomia Física: Características anatômicas, antropométricas, fisiológicas e biomecânicas relacionadas à atividade física"));
  children.push(bulletItem("Ergonomia Cognitiva: Processos mentais como percepção, memória, raciocínio e resposta motora"));
  children.push(bulletItem("Ergonomia Organizacional: Otimização de sistemas sociotécnicos, estruturas organizacionais, políticas e processos"));

  // 7. Estudo Ergonômico
  children.push(heading("7. ESTUDO ERGONÔMICO DO TRABALHO"));
  children.push(heading("7.1 Registro Postural", HeadingLevel.HEADING_3));
  if (photos.length > 0) {
    children.push(body(`Foram registradas ${photos.length} posturas de trabalho para documentação e análise biomecânica:`));
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
    analyses.forEach(a => {
      const ws = workstations.find(w => w.id === a.workstation_id);
      const risk = risks.find(r => r.analysis_id === a.id);
      const analysisTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: ws?.name || "—", bold: true, size: 22, font: "Calibri" })] })],
              borders: borderStyle(),
              shading: { type: ShadingType.SOLID, fill: COLORS.headerBg, color: COLORS.headerBg },
              columnSpan: 2,
            })],
          }),
          new TableRow({ children: [textCell("Método", true, 30), textCell(a.method, false, 70)] }),
          new TableRow({ children: [textCell("Score", true, 30), textCell(String(a.score), false, 70)] }),
          new TableRow({ children: [textCell("Nível de Risco", true, 30), textCell(risk ? riskLevelLabel(risk.risk_level) : "N/A", false, 70)] }),
          new TableRow({ children: [textCell("Observações", true, 30), textCell(a.notes, false, 70)] }),
        ],
      });
      children.push(analysisTable);
      children.push(new Paragraph({ spacing: { after: 200 } }));
    });
  } else {
    children.push(body("Nenhuma análise realizada."));
  }

  // 8. Métodos
  children.push(heading("8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS"));
  children.push(body("Para a avaliação ergonômica dos postos de trabalho, foram utilizados os seguintes métodos:"));
  const methodsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Método", 15), headerCell("Aplicação", 45), headerCell("Classificação", 40)] }),
      ...([
        ["REBA", "Avaliação rápida do corpo inteiro", "1-3: Baixo | 4-7: Médio | 8-10: Alto | 11+: Muito Alto"],
        ["RULA", "Avaliação rápida de membros superiores", "1-2: Aceitável | 3-4: Investigar | 5-6: Mudar breve | 7: Mudar já"],
        ["ROSA", "Avaliação de postos informatizados", "1-2: Desprezível | 3-4: Baixo | 5-6: Médio | 7+: Alto"],
        ["OWAS", "Sistema de análise de posturas", "1: Normal | 2: Leve | 3: Severo | 4: Muito severo"],
      ] as [string, string, string][]).map(([m, app, cls]) =>
        new TableRow({ children: [textCell(m, true, 15), textCell(app, false, 45), textCell(cls, false, 40)] })
      ),
    ],
  });
  children.push(methodsTable);
  children.push(body("A detecção de posturas foi realizada com auxílio de inteligência artificial (BlazePose/MediaPipe) para cálculo preciso dos ângulos articulares."));

  // 9. GHE e Matriz
  children.push(heading("9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA"));
  children.push(body("Os trabalhadores foram agrupados por Grupos Homogêneos de Exposição (GHE), considerando as atividades realizadas, posturas adotadas e riscos identificados."));
  if (risks.length > 0) {
    children.push(heading("Matriz de Risco Ergonômico", HeadingLevel.HEADING_3));
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

    if (actions.length > 0) {
      children.push(heading("Plano de Ação", HeadingLevel.HEADING_3));
      const actionTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("Ação Corretiva", 40), headerCell("Responsável", 20), headerCell("Prazo", 20), headerCell("Status", 20)] }),
          ...actions.map(ap => new TableRow({
            children: [
              textCell(ap.description, false, 40),
              textCell(ap.responsible, false, 20),
              textCell(ap.deadline, false, 20),
              textCell(statusLabel(ap.status), false, 20),
            ],
          })),
        ],
      });
      children.push(actionTable);
    }
  } else {
    children.push(body("Nenhum risco avaliado."));
  }

  // 10. Psicossocial
  children.push(heading("10. ANÁLISE DOS RISCOS PSICOSSOCIAIS"));
  if (psychosocial.length > 0) {
    psychosocial.forEach(psa => {
      children.push(heading(`Avaliação Psicossocial${psa.workstation_id ? ` — ${workstations.find(w => w.id === psa.workstation_id)?.name || ""}` : ""}`, HeadingLevel.HEADING_3));
      children.push(body(`Avaliador: ${psa.evaluator_name}`, { bold: true }));

      if (psa.nasa_tlx_details) {
        children.push(heading("NASA-TLX (Índice de Carga de Trabalho)", HeadingLevel.HEADING_4));
        const nasaRows = [
          ["Demanda Mental", String(psa.nasa_tlx_details.mental_demand)],
          ["Demanda Física", String(psa.nasa_tlx_details.physical_demand)],
          ["Demanda Temporal", String(psa.nasa_tlx_details.temporal_demand)],
          ["Performance", String(psa.nasa_tlx_details.performance)],
          ["Esforço", String(psa.nasa_tlx_details.effort)],
          ["Frustração", String(psa.nasa_tlx_details.frustration)],
          ["Score Geral", String(psa.nasa_tlx_score)],
        ];
        const nasaTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (0-100)", 50)] }),
            ...nasaRows.map(([dim, val]) => new TableRow({ children: [textCell(dim, dim === "Score Geral", 50), textCell(val, dim === "Score Geral", 50)] })),
          ],
        });
        children.push(nasaTable);
      }

      if (psa.hse_it_details) {
        children.push(heading("HSE-IT (Indicadores de Estresse Ocupacional)", HeadingLevel.HEADING_4));
        const hseRows = [
          ["Demandas", String(psa.hse_it_details.demands)],
          ["Controle", String(psa.hse_it_details.control)],
          ["Suporte", String(psa.hse_it_details.support)],
          ["Relacionamentos", String(psa.hse_it_details.relationships)],
          ["Papel", String(psa.hse_it_details.role)],
          ["Mudança", String(psa.hse_it_details.change)],
          ["Score Geral", String(psa.hse_it_score)],
        ];
        const hseTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (1-5)", 50)] }),
            ...hseRows.map(([dim, val]) => new TableRow({ children: [textCell(dim, dim === "Score Geral", 50), textCell(val, dim === "Score Geral", 50)] })),
          ],
        });
        children.push(hseTable);
      }

      if (psa.copenhagen_details) {
        children.push(heading("Copenhagen Psychosocial Questionnaire (COPSOQ)", HeadingLevel.HEADING_4));
        const copRows = [
          ["Demandas Quantitativas", String(psa.copenhagen_details.quantitative_demands)],
          ["Ritmo de Trabalho", String(psa.copenhagen_details.work_pace)],
          ["Demandas Cognitivas", String(psa.copenhagen_details.cognitive_demands)],
          ["Demandas Emocionais", String(psa.copenhagen_details.emotional_demands)],
          ["Influência no Trabalho", String(psa.copenhagen_details.influence)],
          ["Possibilidades de Desenvolvimento", String(psa.copenhagen_details.possibilities_development)],
          ["Significado do Trabalho", String(psa.copenhagen_details.meaning_work)],
          ["Compromisso", String(psa.copenhagen_details.commitment)],
          ["Previsibilidade", String(psa.copenhagen_details.predictability)],
          ["Suporte Social", String(psa.copenhagen_details.social_support)],
          ["Score Geral", String(psa.copenhagen_score)],
        ];
        const copTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell("Dimensão", 50), headerCell("Score (0-100)", 50)] }),
            ...copRows.map(([dim, val]) => new TableRow({ children: [textCell(dim, dim === "Score Geral", 50), textCell(val, dim === "Score Geral", 50)] })),
          ],
        });
        children.push(copTable);
      }

      children.push(body(`Observações: ${psa.observations}`));
    });
  } else {
    children.push(body("Nenhuma avaliação psicossocial realizada para esta empresa. Recomenda-se a aplicação dos questionários NASA-TLX, HSE-IT e Copenhagen Psychosocial Questionnaire para uma avaliação completa dos fatores psicossociais do trabalho."));
  }

  // 11. Responsabilidade Técnica
  children.push(heading("11. RESPONSABILIDADE TÉCNICA"));
  const respTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [textCell("Responsável Técnico", true, 30), textCell(consultant, false, 70)] }),
      new TableRow({ children: [textCell("Empresa", true, 30), textCell("MG Consultoria — Ergonomia & Segurança do Trabalho", false, 70)] }),
      new TableRow({ children: [textCell("Data de Emissão", true, 30), textCell(getToday(), false, 70)] }),
    ],
  });
  children.push(respTable);

  children.push(new Paragraph({ spacing: { before: 1200 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "_____________________________________________", size: 22, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: consultant, bold: true, size: 22, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Engenheiro de Segurança do Trabalho", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "CREA/CONFEA: XXXXX", size: 20, font: "Calibri", color: COLORS.secondary })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));
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
              new TextRun({ text: `AET — ${company.name}`, size: 16, font: "Calibri", color: COLORS.light, italics: true }),
            ],
            alignment: AlignmentType.RIGHT,
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
  const { company, workstations, sectors, analyses, photos } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));

  const children: any[] = [];

  children.push(...createCoverPage("PROGRAMA DE GERENCIAMENTO DE RISCOS", "PGR", company, consultant));

  children.push(heading("1. IDENTIFICAÇÃO DA EMPRESA"));
  children.push(createInfoTable(company, sectors.map(s => s.name).join(", "), workstations.map(w => w.name).join(", ")));

  children.push(heading("2. INVENTÁRIO DE RISCOS"));
  if (risks.length > 0) {
    const riskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("GHE/Posto", 25), headerCell("Risco", 35), headerCell("Score", 15), headerCell("Nível", 25)] }),
        ...risks.map((r, i) => {
          const analysis = analyses.find(a => a.id === r.analysis_id);
          const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
          return new TableRow({
            children: [
              textCell(ws?.name || `GHE ${i + 1}`, false, 25),
              textCell(r.description, false, 35),
              textCell(String(r.risk_score), true, 15),
              textCell(riskLevelLabel(r.risk_level), true, 25),
            ],
          });
        }),
      ],
    });
    children.push(riskTable);
  } else {
    children.push(body("Nenhum risco identificado."));
  }

  children.push(heading("3. PLANO DE AÇÃO"));
  if (actions.length > 0) {
    const actionTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell("Ação", 40), headerCell("Responsável", 20), headerCell("Prazo", 20), headerCell("Status", 20)] }),
        ...actions.map(ap => new TableRow({
          children: [
            textCell(ap.description, false, 40),
            textCell(ap.responsible, false, 20),
            textCell(ap.deadline, false, 20),
            textCell(statusLabel(ap.status), false, 20),
          ],
        })),
      ],
    });
    children.push(actionTable);
  } else {
    children.push(body("Sem ações definidas."));
  }

  children.push(new Paragraph({ spacing: { before: 600 } }));
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
      doc = generateAETDocx(ctx);
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
