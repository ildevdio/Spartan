import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, ReportType, Task, PsychosocialAnalysis } from "./types";
import { mockRiskAssessments, mockActionPlans, mockTasks, mockPsychosocialAnalyses } from "./mock-data";
import { riskLevelLabel, statusLabel, analysisStatusLabel } from "./types";

interface ReportContext {
  company: Company;
  sector?: Sector;
  workstation?: Workstation;
  workstations: Workstation[];
  analyses: Analysis[];
  photos: PosturePhoto[];
  reportType: ReportType;
  consultantName?: string;
}

function getToday(): string {
  return new Date().toLocaleDateString("pt-BR");
}
function getYear(): number {
  return new Date().getFullYear();
}

export function generateReportHTML(ctx: ReportContext): string {
  const { reportType } = ctx;
  switch (reportType) {
    case "AET": return generateAETReport(ctx);
    case "PGR": return generatePGRReport(ctx);
    case "APR": return generateAPRReport(ctx);
    case "PCMSO": return generatePCMSOReport(ctx);
    case "LTCAT": return generateLTCATReport(ctx);
    case "Insalubridade": return generateInsalubridadeReport(ctx);
    case "Periculosidade": return generatePericulosidadeReport(ctx);
    case "PCA": return generatePCAReport(ctx);
    case "PPR": return generatePPRReport(ctx);
    default: return generateGenericReport(ctx);
  }
}

// ==================== SHARED STYLES & HELPERS ====================

function sharedStyles() {
  return `<style>
    body, .rpt-body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6; }
    .rpt-cover { text-align:center; padding:60px 40px; background: linear-gradient(135deg, #0A1F44 0%, #1565C0 50%, #00838F 100%); color:white; border-radius:8px; margin-bottom:30px; }
    .rpt-cover h1 { font-size:28px; margin-bottom:8px; color:white; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .rpt-cover h2 { font-size:20px; color:#B2EBF2; margin-bottom:30px; }
    .rpt-cover .company { font-size:24px; font-weight:bold; color:white; }
    .rpt-cover .meta { font-size:14px; color:#B2EBF2; }
    .rpt-section { background: linear-gradient(90deg, #0A1F44, #1565C0); color:white; padding:12px 20px; margin:30px 0 15px 0; border-radius:6px; font-size:16px; font-weight:bold; }
    .rpt-section2 { background: linear-gradient(90deg, #1565C0, #00838F); color:white; padding:10px 18px; margin:24px 0 12px 0; border-radius:5px; font-size:15px; font-weight:bold; }
    .rpt-section3 { border-left:5px solid #00BCD4; padding:8px 14px; margin:20px 0 10px 0; font-size:14px; font-weight:bold; color:#0A1F44; background:#E1F5FE; border-radius:0 5px 5px 0; }
    .rpt-callout { border-left:5px solid #1565C0; background:#E3F2FD; padding:12px 16px; margin:12px 0; border-radius:0 6px 6px 0; font-style:italic; color:#0A1F44; }
    .rpt-callout.warning { border-left-color:#FF6F00; background:#FFF3E0; }
    .rpt-callout.success { border-left-color:#43A047; background:#C8E6C9; }
    .rpt-callout.danger { border-left-color:#D32F2F; background:#FFCDD2; }
    .rpt-table { width:100%; border-collapse:collapse; margin:12px 0; border-radius:6px; overflow:hidden; }
    .rpt-table th { background:#0A1F44; color:white; padding:10px 12px; font-size:12px; text-align:left; border:1px solid #0A1F44; }
    .rpt-table th.alt { background:#1565C0; border-color:#1565C0; }
    .rpt-table th.teal { background:#00838F; border-color:#00838F; }
    .rpt-table td { padding:9px 12px; font-size:12px; border:1px solid #B0BEC5; }
    .rpt-table tr:nth-child(even) td { background:#E3F2FD; }
    .rpt-table td.label { background:#E1F5FE; font-weight:bold; color:#1565C0; }
    .rpt-badge { display:inline-block; padding:4px 12px; border-radius:12px; font-size:11px; font-weight:bold; }
    .rpt-badge.green { background:#C8E6C9; color:#1B5E20; }
    .rpt-badge.yellow { background:#FFF9C4; color:#F57F17; }
    .rpt-badge.orange { background:#FFE0B2; color:#E65100; }
    .rpt-badge.red { background:#FFCDD2; color:#B71C1C; }
    .rpt-divider { height:4px; background: linear-gradient(90deg, #00BCD4, #1565C0, #0A1F44); margin:20px 0; border-radius:2px; }
    .rpt-sig { text-align:center; margin-top:50px; padding-top:20px; border-top:2px solid #B0BEC5; }
    .rpt-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0A1F44; padding-bottom:8px; margin-bottom:20px; font-size:11px; color:#64748b; }
    .rpt-footer { text-align:center; font-size:10px; color:#94a3b8; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:8px; }
    .page-break { page-break-after: always; break-after: page; }
    .rpt-section, .rpt-section2, .rpt-section3 { page-break-before: auto; page-break-after: avoid; break-after: avoid; }
    .rpt-table { page-break-inside: avoid; break-inside: avoid; }
    .rpt-table tr { page-break-inside: avoid; break-inside: avoid; }
    .rpt-callout { page-break-inside: avoid; break-inside: avoid; }
    .rpt-cover { page-break-inside: avoid; break-inside: avoid; }
    .rpt-sig { page-break-inside: avoid; break-inside: avoid; }
    ul, ol { page-break-inside: avoid; break-inside: avoid; }
    h1, h2, h3, h4 { page-break-after: avoid; break-after: avoid; }
  </style>`;
}

function coverPage(title: string, subtitle: string, company: Company, consultant: string) {
  return `
<div class="rpt-cover">
  <img src="/mg-consult-logo.png" alt="MG Consult" style="height:50px; margin-bottom:20px;" onerror="this.style.display='none'" />
  <h1>${title}</h1>
  <h2>${subtitle}</h2>
  <p class="company">${company.trade_name || company.name}</p>
  <p class="meta">CNPJ: ${company.cnpj}</p>
  <p class="meta">${company.address}${company.neighborhood ? ', ' + company.neighborhood : ''} — ${company.city}/${company.state}</p>
  <p class="meta" style="margin-top:30px;">Emissão: ${getToday()} | Revisão: 00</p>
  <p class="meta">Responsável Técnico: ${consultant}</p>
  <p class="meta" style="font-size:12px; margin-top:15px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div><div class="page-break"></div>`;
}

function companyDataTable(company: Company) {
  return `
<table class="rpt-table">
  <tr><td class="label" style="width:200px;">Razão Social</td><td>${company.name}</td></tr>
  <tr><td class="label">Nome Fantasia</td><td>${company.trade_name || company.name}</td></tr>
  <tr><td class="label">CNPJ</td><td>${company.cnpj}</td></tr>
  <tr><td class="label">CNAE Principal</td><td>${company.cnae_principal || "—"}</td></tr>
  <tr><td class="label">CNAE Secundário</td><td>${company.cnae_secundario || "—"}</td></tr>
  <tr><td class="label">Grau de Risco</td><td>${company.activity_risk || "—"}</td></tr>
  <tr><td class="label">Endereço</td><td>${company.address}</td></tr>
  <tr><td class="label">Bairro</td><td>${company.neighborhood || "—"}</td></tr>
  <tr><td class="label">Cidade/UF</td><td>${company.city} — ${company.state}</td></tr>
  <tr><td class="label">CEP</td><td>${company.cep || "—"}</td></tr>
</table>`;
}

function revisionTable() {
  return `
<div class="rpt-section">CONTROLE DE REVISÕES</div>
<table class="rpt-table">
  <tr><th>Revisão</th><th>Data</th><th>Descrição</th></tr>
  <tr><td>00</td><td>${getToday()}</td><td>Emissão do documento.</td></tr>
</table>`;
}

function signatureBlock(consultant: string, title: string = "Engenheiro de Segurança do Trabalho", registration: string = "CREA/CONFEA: XXXXX") {
  return `
<div class="rpt-divider"></div>
<div class="rpt-sig">
  <p>_____________________________________________</p>
  <p><strong>${consultant}</strong></p>
  <p>${title}</p>
  <p>${registration}</p>
  <p style="font-size:11px; color:#90A4AE; margin-top:15px;"><em>Documento gerado pelo sistema Focus Spartan — MG Consultoria</em></p>
</div>`;
}

function footer() {
  return `<div class="rpt-footer">MG Consultoria — Ergonomia & Segurança do Trabalho | ${getToday()}</div>`;
}

function getCtxData(ctx: ReportContext) {
  const { company, workstations, analyses } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const wsIds = workstations.map(w => w.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const tasks = mockTasks.filter(t => wsIds.includes(t.workstation_id));
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);
  const sectors = [...new Set(workstations.map(w => w.sector?.name || "Geral"))];
  const sectorMap = new Map<string, { sectorName: string; workstations: typeof workstations }>();
  workstations.forEach(ws => {
    const sectorId = ws.sector?.id || ws.sector_id || "unknown";
    const sectorName = ws.sector?.name || "Geral";
    if (!sectorMap.has(sectorId)) sectorMap.set(sectorId, { sectorName, workstations: [] });
    sectorMap.get(sectorId)!.workstations.push(ws);
  });
  return { consultant, risks, actions, tasks, psychosocial, sectors, sectorMap };
}

function gheTable(workstations: Workstation[], ctx: ReportContext) {
  return `
<table class="rpt-table">
  <tr><th>GHE</th><th>Setor / Atividade</th><th>Descrição das Atividades</th></tr>
  ${workstations.map((ws, i) => {
    const sector = ctx.sector || ws.sector || { name: "Geral" };
    return `<tr>
      <td>GHE ${String(i + 1).padStart(2, '0')} — ${ws.name}</td>
      <td>${(sector as any)?.name || "—"}</td>
      <td>${ws.activity_description || ws.description || ws.tasks_performed}</td>
    </tr>`;
  }).join("")}
</table>`;
}

function riskMatrix() {
  return `
<div class="rpt-section3">Matriz de Avaliação de Riscos (P × G)</div>
<table class="rpt-table" style="text-align:center;">
  <tr><th>P \\ G</th><th>1 — Baixo</th><th>2 — Moderado</th><th>3 — Alto</th><th>4 — Excessivo</th></tr>
  <tr><td class="label">1 — Baixo</td><td style="background:#C8E6C9;">Irrelevante</td><td style="background:#C8E6C9;">Baixo</td><td style="background:#FFF9C4;">Baixo</td><td style="background:#FFF9C4;">Médio</td></tr>
  <tr><td class="label">2 — Moderado</td><td style="background:#C8E6C9;">Baixo</td><td style="background:#FFF9C4;">Baixo</td><td style="background:#FFF9C4;">Médio</td><td style="background:#FFE0B2;">Alto</td></tr>
  <tr><td class="label">3 — Alto</td><td style="background:#FFF9C4;">Baixo</td><td style="background:#FFF9C4;">Médio</td><td style="background:#FFE0B2;">Alto</td><td style="background:#FFE0B2;">Alto</td></tr>
  <tr><td class="label">4 — Excessivo</td><td style="background:#FFF9C4;">Médio</td><td style="background:#FFE0B2;">Alto</td><td style="background:#FFE0B2;">Alto</td><td style="background:#FFCDD2;">Crítico</td></tr>
</table>
<p style="font-size:10px; color:#64748b;">Fonte: Matriz elaborada a partir de MULHAUSEN & DAMIANO (1998) e BS 8800 (BSI, 1996).</p>`;
}

function equipmentTable() {
  return `
<div class="rpt-section3">Equipamentos Utilizados para Medição</div>
<table class="rpt-table">
  <tr><th>Agente</th><th>Instrumento</th><th>Método</th></tr>
  <tr><td class="label">Calor</td><td>Medidor de Stress Térmico (IBUTG)</td><td>NR-15, Portaria 3214/78 / NHO-06</td></tr>
  <tr><td class="label">Ruído</td><td>Decibelímetro / Dosímetro</td><td>NHO-01 FUNDACENTRO / NR-15 Anexo I</td></tr>
  <tr><td class="label">Iluminação</td><td>Luxímetro</td><td>NHO-11</td></tr>
  <tr><td class="label">Agentes Químicos</td><td>Bomba de amostragem gravimétrica</td><td>NHO-08 / NIOSH / ACGIH</td></tr>
  <tr><td class="label">Vibração</td><td>Acelerômetro triaxial</td><td>NHO-09 / NHO-10</td></tr>
</table>`;
}
// ==================== AET MANDATORY TABLES ====================

function psgLabel(val: number): string {
  if (val <= 1) return "B";
  if (val <= 2) return "M";
  if (val <= 3) return "A";
  return "E";
}

function nrLabel(p: number, s: number): string {
  const score = p * s;
  if (score <= 2) return "Baixo";
  if (score <= 4) return "Baixo";
  if (score <= 6) return "Médio";
  if (score <= 9) return "Alto";
  return "Crítico";
}

function nrBadgeStyle(nr: string): string {
  if (nr === "Crítico") return "background:#FFCDD2; color:#B71C1C; font-weight:bold;";
  if (nr === "Alto") return "background:#FFE0B2; color:#E65100; font-weight:bold;";
  if (nr === "Médio") return "background:#FFF9C4; color:#F57F17; font-weight:bold;";
  return "background:#C8E6C9; color:#1B5E20; font-weight:bold;";
}

function exposureTimeLabel(exposure: number): string {
  if (exposure <= 1) return "Esporádico";
  if (exposure <= 2) return "Intermitente";
  if (exposure <= 3) return "Frequente";
  return "Contínuo durante a jornada";
}

interface RiskRow {
  type: string;
  typeColor: string;
  hazard: string;
  damage: string;
  source: string;
  trajectory: string;
  exposure: string;
  p: string;
  s: string;
  nr: string;
  epc: string;
  adm: string;
  epi: string;
}

function buildOccupationalRiskRows(
  risks: { probability: number; exposure: number; consequence: number; risk_level: string; description: string; analysis_id: string }[],
  analyses: Analysis[],
  ws: Workstation,
  psychosocial: PsychosocialAnalysis[]
): RiskRow[] {
  const rows: RiskRow[] = [];

  // Biológico - default row
  rows.push({
    type: "Biológico", typeColor: "#8B4513",
    hazard: "Ausência de fator de risco", damage: "N.A.", source: "N.A.",
    trajectory: "N.A.", exposure: "N.A.", p: "N.A.", s: "N.A.", nr: "N.A.",
    epc: "N.A.", adm: "N.A.", epi: "N.A."
  });

  // Ergonômico risks from analyses
  const ergoRisks = risks.filter(r => {
    const a = analyses.find(x => x.id === r.analysis_id);
    return a && a.workstation_id === ws.id;
  });

  if (ergoRisks.length > 0) {
    ergoRisks.forEach(r => {
      const pVal = psgLabel(r.probability);
      const sVal = psgLabel(r.consequence);
      rows.push({
        type: "Ergonômico", typeColor: "#DAA520",
        hazard: r.description || "Postura inadequada durante atividade",
        damage: "Cansaço; Dor muscular",
        source: ws.activity_description || ws.description || "Atividade do posto",
        trajectory: "Sistema Musculoesquelético",
        exposure: exposureTimeLabel(r.exposure),
        p: pVal, s: sVal, nr: nrLabel(r.probability, r.consequence),
        epc: "N.A.", adm: "N.I.", epi: "N.A."
      });
    });
  } else {
    rows.push({
      type: "Ergonômico", typeColor: "#DAA520",
      hazard: "Postura em pé por longos períodos",
      damage: "Cansaço e dor muscular",
      source: ws.activity_description || "Atividade do posto",
      trajectory: "Sistema Musculoesquelético",
      exposure: "Intermitente",
      p: "B", s: "M", nr: "Baixo",
      epc: "N.A.", adm: "N.I.", epi: "N.A."
    });
  }

  // Mecânico/Acidente
  rows.push({
    type: "Mecânico/ Acidente", typeColor: "#555555",
    hazard: "Objetos cortantes e/ou perfurocortantes",
    damage: "Cortes; lesões na pele",
    source: "Ferramentas e equipamentos",
    trajectory: "Sistema musculoesquelético",
    exposure: "Intermitente",
    p: "M", s: "M", nr: "Baixo",
    epc: "N.A.", adm: "N.A.", epi: "Luva de proteção"
  });

  rows.push({
    type: "Mecânico/ Acidente", typeColor: "#555555",
    hazard: "Quedas, torções e tropeços",
    damage: "Lesões e escoriações",
    source: "Desnível no piso",
    trajectory: "Sistema musculoesquelético",
    exposure: "Intermitente",
    p: "M", s: "M", nr: "Baixo",
    epc: "N.A.", adm: "N.A.", epi: "Calçado ocupacional"
  });

  // Psicossocial
  const hasPsycho = psychosocial.length > 0;
  rows.push({
    type: "Fatores Psicossociais", typeColor: "#1565C0",
    hazard: "Ritmo intenso de trabalho, pressão por tempo, conflitos na equipe",
    damage: "Estresse, ansiedade, fadiga mental, irritabilidade, síndrome de burnout",
    source: "Alta demanda de produção, organização do trabalho",
    trajectory: "Interações no ambiente de trabalho, exigências constantes, pressão por prazos",
    exposure: "Contínuo durante a jornada",
    p: hasPsycho ? "M" : "M", s: "B", nr: "Baixo",
    epc: "N.A.", adm: "N.A.", epi: "N.A."
  });

  return rows;
}

function occupationalRiskInventoryTable(
  risks: any[], analyses: Analysis[], ws: Workstation, psychosocial: PsychosocialAnalysis[]
): string {
  const rows = buildOccupationalRiskRows(risks, analyses, ws, psychosocial);

  // Group rows by type for rowspan
  const typeGroups = new Map<string, number>();
  rows.forEach(r => typeGroups.set(r.type, (typeGroups.get(r.type) || 0) + 1));

  let currentType = "";
  return `
<table class="rpt-table" style="font-size:11px;">
  <tr><th colspan="13" style="text-align:center; font-size:13px; background:#333; color:white;">INVENTÁRIO DE RISCOS OCUPACIONAIS</th></tr>
  <tr>
    <th rowspan="2" style="background:#E0E0E0; color:#333;">Agente</th>
    <th colspan="2" style="background:#E0E0E0; color:#333;">Identificação</th>
    <th colspan="2" style="background:#E0E0E0; color:#333;">Perfil de Exposição Existente</th>
    <th colspan="3" style="background:#E0E0E0; color:#333;">Avaliação do Risco¹</th>
    <th colspan="3" style="background:#E0E0E0; color:#333;">Medidas de Controle²</th>
  </tr>
  <tr>
    <th style="background:#F5F5F5; color:#333;">Identificação de perigos</th>
    <th style="background:#F5F5F5; color:#333;">Possíveis Danos</th>
    <th style="background:#F5F5F5; color:#333;">Fonte Geradora</th>
    <th style="background:#F5F5F5; color:#333;">Tempo de exposição</th>
    <th style="background:#F5F5F5; color:#333;">P</th>
    <th style="background:#F5F5F5; color:#333;">S</th>
    <th style="background:#F5F5F5; color:#333;">NR</th>
    <th style="background:#F5F5F5; color:#333;">EPC</th>
    <th style="background:#F5F5F5; color:#333;">ADM</th>
    <th style="background:#F5F5F5; color:#333;">EPI</th>
  </tr>
  ${rows.map(r => {
    let typeCell = "";
    if (r.type !== currentType) {
      const count = typeGroups.get(r.type) || 1;
      typeCell = `<td rowspan="${count}" style="background:${r.typeColor}; color:white; font-weight:bold; text-align:center; writing-mode:horizontal-tb; font-size:11px;">${r.type}</td>`;
      currentType = r.type;
    }
    return `<tr>${typeCell}
      <td>${r.hazard}</td><td>${r.damage}</td>
      <td>${r.source}</td><td>${r.exposure}</td>
      <td style="text-align:center;">${r.p}</td><td style="text-align:center;">${r.s}</td>
      <td style="text-align:center; ${nrBadgeStyle(r.nr)}">${r.nr}</td>
      <td style="text-align:center;">${r.epc}</td><td style="text-align:center;">${r.adm}</td>
      <td style="text-align:center;">${r.epi}</td>
    </tr>`;
  }).join("")}
</table>
<div style="font-size:10px; margin-top:4px; color:#555;">
  <p><strong>Legenda:</strong></p>
  <p>1 - <strong>P:</strong> Probabilidade / <strong>S:</strong> Gravidade (Severidade) / <strong>B:</strong> Baixa / <strong>M:</strong> Moderada / <strong>A:</strong> Alta / <strong>E:</strong> Excessivo</p>
  <p><strong>NR:</strong> Nível de Risco / <strong>C:</strong> Crítico / <strong>A:</strong> Alto / <strong>M:</strong> Médio / <strong>B:</strong> Baixo / <strong>I:</strong> Irrelevante</p>
  <p>2 - <strong>EPC:</strong> Equipamento de Proteção Coletiva / <strong>ADM:</strong> Medida Administrativa / <strong>EPI:</strong> Equipamento de Proteção Individual / <strong>N.A:</strong> Não se Aplica / <strong>N.I:</strong> Não Identificado</p>
</div>`;
}

function ergonomicAnalysisReportTable(ws: Workstation, idx: number, ctx: ReportContext, risks: any[], analyses: Analysis[], psychosocial: PsychosocialAnalysis[]): string {
  const sector = ws.sector || ctx.sector;
  const sectorName = (sector as any)?.name || "Geral";
  const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
  const wsRisks = risks.filter(r => wsAnalyses.some(a => a.id === r.analysis_id));

  // Build risk description rows categorized
  interface ErgRiskRow { type: string; hazard: string; damage: string; source: string; exposure: string; p: string; s: string; nr: string; }
  const ergRiskRows: ErgRiskRow[] = [];

  // Biomecânico risks
  if (wsRisks.length > 0) {
    wsRisks.forEach(r => {
      ergRiskRows.push({
        type: "Biomecânico",
        hazard: r.description || "Postura inadequada",
        damage: "Fadiga muscular, dores lombares e nos membros inferiores",
        source: ws.activity_description || "Atividades do posto",
        exposure: exposureTimeLabel(r.exposure),
        p: psgLabel(r.probability), s: psgLabel(r.consequence),
        nr: nrLabel(r.probability, r.consequence)
      });
    });
  } else {
    ergRiskRows.push({
      type: "Biomecânico",
      hazard: "Permanência prolongada em pé durante as atividades",
      damage: "Fadiga muscular, dores lombares e nos membros inferiores",
      source: "Atividades de " + (ws.activity_description || ws.description || "trabalho").toLowerCase().substring(0, 50),
      exposure: "Contínuo",
      p: "M", s: "B", nr: "Baixo"
    });

    ergRiskRows.push({
      type: "Biomecânico",
      hazard: "Inclinação do tronco e agachamentos durante a atividade",
      damage: "Dores lombares e cervicais",
      source: ws.activity_description || ws.description || "Atividades do posto",
      exposure: "Frequente",
      p: "M", s: "B", nr: "Baixo"
    });
  }

  // Movimentos Repetitivos
  ergRiskRows.push({
    type: "Movimentos Repetitivos",
    hazard: "Manipulação constante de materiais e ferramentas",
    damage: "Tendinites, dores em punhos e antebraços",
    source: "Organização e execução das atividades",
    exposure: "Contínuo",
    p: "M", s: "B", nr: "Baixo"
  });

  // Levantamento de cargas
  ergRiskRows.push({
    type: "Levantamento de cargas",
    hazard: "Transporte manual de materiais e equipamentos",
    damage: "Lombalgias e fadiga física",
    source: "Movimentação de materiais",
    exposure: "Frequente",
    p: "M", s: "B", nr: "Baixo"
  });

  // Organizacionais
  ergRiskRows.push({
    type: "Organizacionais",
    hazard: "Ritmo de trabalho condicionado à necessidade de produção constante",
    damage: "Fadiga física e mental",
    source: "Demanda operacional",
    exposure: "Diário",
    p: "M", s: "B", nr: "Baixo"
  });

  // Psicossociais
  ergRiskRows.push({
    type: "Psicossociais",
    hazard: "Pressão por produtividade e organização do setor",
    damage: "Estresse ocupacional",
    source: "Exigências da função",
    exposure: "Contínuo",
    p: "M", s: "B", nr: "Baixo"
  });

  // Group rows by type for rowspan
  const typeGroups = new Map<string, number>();
  ergRiskRows.forEach(r => typeGroups.set(r.type, (typeGroups.get(r.type) || 0) + 1));

  let currentType = "";

  return `
<div style="page-break-inside:avoid; break-inside:avoid; margin-top:20px;">
<table class="rpt-table" style="font-size:11px;">
  <tr><th colspan="9" style="text-align:center; font-size:13px;">RELATÓRIO DA ANÁLISE ERGONÔMICA</th></tr>
  <tr>
    <td class="label" style="width:100px;">SETOR</td>
    <td colspan="5" style="text-align:center; font-weight:bold;">FUNÇÕES</td>
    <td class="label" colspan="3" style="text-align:center;">Nº AVALIAÇÃO</td>
  </tr>
  <tr>
    <td style="text-align:center; font-weight:bold; padding:10px;">${sectorName.toUpperCase()}</td>
    <td colspan="5" style="text-align:center; font-weight:bold; padding:10px;">GHE ${String(idx + 1).padStart(2, '0')}: ${ws.name}</td>
    <td colspan="3" style="text-align:center; font-weight:bold; padding:10px;">${String(idx + 1).padStart(2, '0')}</td>
  </tr>
</table>

<table class="rpt-table" style="font-size:11px;">
  <tr>
    <td class="label" rowspan="2" style="width:120px;">DESCRIÇÃO FÍSICA</td>
    <td class="label" style="width:200px;">MÁQUINAS E EQUIPAMENTOS</td>
    <td colspan="7">${ws.description || "Equipamentos e mobiliário do posto de trabalho"}</td>
  </tr>
  <tr>
    <td class="label">FERRAMENTAS E ACESSÓRIOS</td>
    <td colspan="7">${ws.tasks_performed || "Ferramentas e utensílios utilizados na atividade"}</td>
  </tr>
  <tr>
    <td class="label" rowspan="2" style="width:120px;">MEDIÇÕES</td>
    <td class="label">ILUMINAÇÃO – NHO11</td>
    <td colspan="7">A verificar in loco (lux)</td>
  </tr>
  <tr>
    <td class="label">CONFORTO TÉRMICO – NR-17</td>
    <td colspan="7">A verificar in loco</td>
  </tr>
</table>

<div style="background:#333; color:white; padding:6px 12px; font-weight:bold; font-size:12px; text-align:center; margin-top:2px;">SITUAÇÕES ENCONTRADAS</div>
<div style="border:1px solid #B0BEC5; padding:8px 12px; font-size:12px;">
  <ol style="margin:0; padding-left:20px;">
    ${ws.activity_description ? `<li>${ws.activity_description}</li>` : ''}
    ${wsAnalyses.map(a => a.notes ? `<li>${a.notes}</li>` : '').filter(Boolean).join('')}
    ${wsRisks.map(r => `<li>${r.description}</li>`).join('')}
    ${!ws.activity_description && wsAnalyses.length === 0 ? '<li>Avaliação pendente</li>' : ''}
  </ol>
</div>

<div style="background:#333; color:white; padding:6px 12px; font-weight:bold; font-size:12px; text-align:center; margin-top:2px;">DESCRIÇÃO DOS RISCOS ERGONÔMICOS</div>
<table style="width:100%; border-collapse:collapse; font-size:11px; border:1px solid #000;">
  <tr>
    <td rowspan="2" style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px; width:90px;"></td>
    <td colspan="2" style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Identificação</td>
    <td colspan="2" style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Perfil de Exposição Existente</td>
    <td colspan="3" style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Avaliação do Risco¹</td>
  </tr>
  <tr>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Tipos</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Identificação de perigos</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Possíves Danos</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Fonte Geradora</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">Tempo de exposição</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">P</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">S</td>
    <td style="border:1px solid #000; background:#c6efce; text-align:center; font-weight:bold; font-size:10px; padding:4px;">NR</td>
  </tr>
  ${ergRiskRows.map(r => {
    let typeCell = "";
    if (r.type !== currentType) {
      const count = typeGroups.get(r.type) || 1;
      typeCell = `<td rowspan="${count}" style="border:1px solid #000; text-align:center; font-weight:bold; font-size:10px; padding:4px; vertical-align:middle;">${r.type}</td>`;
      currentType = r.type;
    }
    return `<tr>${typeCell}
      <td style="border:1px solid #000; padding:4px; font-size:10px;">${r.hazard}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px;">${r.damage}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px;">${r.source}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px;">${r.exposure}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px; text-align:center;">${r.p}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px; text-align:center;">${r.s}</td>
      <td style="border:1px solid #000; padding:4px; font-size:10px; text-align:center; font-weight:bold; ${nrBadgeStyle(r.nr)}">${r.nr}</td>
    </tr>`;
  }).join('')}
</table>
<div style="border:1px solid #000; padding:6px 10px; font-size:9px; color:#333; margin-top:0;">
  <p style="margin:2px 0;"><strong>Legendas</strong></p>
  <table style="width:100%; font-size:9px; border-collapse:collapse;">
    <tr>
      <td style="padding:4px; border:1px solid #000;">1 - <strong>P:</strong> Probabilidade / <strong>S:</strong> Gravidade (Severidade) / <strong>B:</strong> Baixa/ <strong>M:</strong> Moderada / <strong>A:</strong> Alta/ <strong>E:</strong> excessivo</td>
      <td style="padding:4px; border:1px solid #000;"><strong>NR:</strong> Nível de Risco/ <strong>C:</strong> Crítico / <strong>A:</strong> Alto / <strong>M:</strong> Médio / <strong>B:</strong> Baixo / <strong>I:</strong> Irrelevante</td>
    </tr>
  </table>
</div>
</div>`;
}

function rebaAssessmentSheet(ws: Workstation, idx: number, analysis: Analysis, risk: any, ctx: ReportContext): string {
  const sector = ws.sector || ctx.sector;
  const sectorName = (sector as any)?.name || "Geral";
  const bp = analysis.body_parts || {};
  const trunk = bp.trunk ?? bp.tronco ?? 1;
  const neck = bp.neck ?? bp.pescoço ?? bp.pescoco ?? 1;
  const legs = bp.legs ?? bp.pernas ?? 1;
  const upperArm = bp.upper_arm ?? bp.ombro ?? bp.shoulder ?? 1;
  const lowerArm = bp.lower_arm ?? bp.cotovelo ?? bp.elbow ?? 1;
  const wrist = bp.wrist ?? bp.punho ?? 1;
  const load = bp.load ?? bp.carga ?? bp["carga/força"] ?? 0;
  const coupling = bp.coupling ?? bp.pega ?? 1;
  const activity = bp.activity ?? bp.atividade ?? 1;

  const tableA = Math.max(1, Math.min(trunk + load, 12));
  const tableB = Math.max(1, Math.min(upperArm + coupling, 12));
  const tableC = Math.max(1, Math.min(Math.ceil((tableA + tableB) / 2), 12));
  const finalScore = analysis.score || (tableC + activity);
  const riskLevel = finalScore <= 1 ? "Insignificante" : finalScore <= 3 ? "Baixo" : finalScore <= 7 ? "Médio" : finalScore <= 10 ? "Alto" : "Muito alto";
  const riskAction = finalScore <= 1 ? "Não necessária" : finalScore <= 3 ? "Pode ser necessária" : finalScore <= 7 ? "Necessária" : finalScore <= 10 ? "Necessária em breve" : "Necessária imediatamente";
  const resultColor = finalScore <= 1 ? "#C8E6C9" : finalScore <= 3 ? "#C8E6C9" : finalScore <= 7 ? "#FFF9C4" : finalScore <= 10 ? "#FFE0B2" : "#FFCDD2";

  const cs = "border:1px solid #000; padding:5px; font-size:11px;";
  const hs = "border:1px solid #000; padding:6px; font-size:11px; font-weight:bold; background:#D9E2F3; text-align:center;";
  const gs = "border:1px solid #000; padding:6px; font-size:12px; font-weight:bold; background:#4472C4; color:white; text-align:center;";
  const ls = "border:1px solid #000; padding:5px; font-size:11px; background:#F2F2F2; font-weight:bold;";
  const ss = "border:1px solid #000; padding:5px; font-size:14px; font-weight:bold; text-align:center;";

  const companyName = ctx.company.trade_name || ctx.company.name;
  const gheLabel = "GHE " + String(idx + 1).padStart(2, "0") + ": " + ws.name;
  const analysisDate = new Date(analysis.created_at).toLocaleDateString("pt-BR");
  const activityDesc = ws.activity_description || ws.description || "—";

  function hlRow(min: number, max: number): string {
    return (finalScore >= min && finalScore <= max) ? "background:#DAEEF3; font-weight:bold;" : "";
  }

  return '<div style="page-break-inside:avoid; break-inside:avoid; margin-top:24px; border:2px solid #000; background:white;">' +
    '<div style="background:#4472C4; color:white; text-align:center; padding:10px; font-size:14px; font-weight:bold; letter-spacing:1px;">REBA — RAPID ENTIRE BODY ASSESSMENT</div>' +
    '<div style="text-align:center; font-size:9px; color:#555; padding:4px; border-bottom:1px solid #000; background:#f9f9f9;">Referência: Sue Hignett and Lynn McAtamney, <em>Rapid entire body assessment (REBA)</em>; Applied Ergonomics. 31:201-205, 2000.</div>' +

    // Header info
    '<table style="width:100%; border-collapse:collapse; font-size:11px;">' +
    '<tr><td style="' + ls + ' width:15%;">Empresa:</td><td style="' + cs + ' width:35%;">' + companyName + '</td>' +
    '<td style="' + ls + ' width:15%;">Função:</td><td style="' + cs + ' width:35%;">' + gheLabel + '</td></tr>' +
    '<tr><td style="' + ls + '">Setor:</td><td style="' + cs + '">' + sectorName + '</td>' +
    '<td style="' + ls + '">Data:</td><td style="' + cs + '">' + analysisDate + '</td></tr>' +
    '<tr><td style="' + ls + '">Atividade:</td><td style="' + cs + '">' + activityDesc + '</td>' +
    '<td style="' + ls + '">Analista:</td><td style="' + cs + '">MG Consult</td></tr>' +
    '</table>' +

    // Two-column: Group A | Group B
    '<table style="width:100%; border-collapse:collapse;"><tr>' +

    // GROUP A
    '<td style="width:50%; vertical-align:top; border:1px solid #000; padding:0;">' +
    '<div style="' + gs + '">GRUPO A — Tronco, Pescoço e Pernas</div>' +
    '<table style="width:100%; border-collapse:collapse;"><tr>' +
    '<td style="width:50%; vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Tronco</td></tr>' +
    '<tr><td style="' + cs + '">Posição 1 (ereto)</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Posição 2 (0-20° flexão)</td><td style="' + ss + '">2</td></tr>' +
    '<tr><td style="' + cs + '">Posição 3 (20-60° flexão)</td><td style="' + ss + '">3</td></tr>' +
    '<tr><td style="' + cs + '">Posição 4 (>60° flexão)</td><td style="' + ss + '">4</td></tr>' +
    '<tr><td style="' + cs + ' font-size:9px;" colspan="2">+1 se rotação ou flexão lateral</td></tr>' +
    '</table></td>' +
    '<td style="width:50%; vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/tronco.png" alt="Tronco" style="width:120px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr><tr>' +
    '<td style="vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Pescoço</td></tr>' +
    '<tr><td style="' + cs + '">Posição 1 (0-20° flexão)</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Posição 2 (>20° ou extensão)</td><td style="' + ss + '">2</td></tr>' +
    '<tr><td style="' + cs + ' font-size:9px;" colspan="2">+1 se rotação ou flexão lateral</td></tr>' +
    '</table></td>' +
    '<td style="vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/pescoco.png" alt="Pescoço" style="width:100px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr><tr>' +
    '<td style="vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Pernas</td></tr>' +
    '<tr><td style="' + cs + '">Bilateral, andando ou sentado</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Unilateral, instável ou de joelhos</td><td style="' + ss + '">2</td></tr>' +
    '<tr><td style="' + cs + ' font-size:9px;" colspan="2">+1 se flexão 30-60° / +2 se >60°</td></tr>' +
    '</table></td>' +
    '<td style="vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/pernas.png" alt="Pernas" style="width:100px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr></table>' +

    // Scores Group A
    '<table style="width:100%; border-collapse:collapse; margin-top:4px;">' +
    '<tr><td style="' + ls + ' text-align:center; width:33%;">Tronco: <span style="font-size:14px; color:#4472C4;">' + trunk + '</span></td>' +
    '<td style="' + ls + ' text-align:center; width:33%;">Pescoço: <span style="font-size:14px; color:#4472C4;">' + neck + '</span></td>' +
    '<td style="' + ls + ' text-align:center; width:34%;">Pernas: <span style="font-size:14px; color:#4472C4;">' + legs + '</span></td></tr>' +
    '<tr><td style="' + hs + '" colspan="2">Pontuação Tabela A</td><td style="' + ss + ' background:#D9E2F3; font-size:16px;">' + tableA + '</td></tr>' +
    '<tr><td style="' + ls + ' text-align:center;" colspan="2">Carga / Força</td><td style="' + ss + '">' + load + '</td></tr>' +
    '</table></td>' +

    // GROUP B
    '<td style="width:50%; vertical-align:top; border:1px solid #000; padding:0;">' +
    '<div style="' + gs + '">GRUPO B — Ombro, Cotovelo e Punho</div>' +
    '<table style="width:100%; border-collapse:collapse;"><tr>' +
    '<td style="width:50%; vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Ombro</td></tr>' +
    '<tr><td style="' + cs + '">Posição 1 (0-20° flexão/ext.)</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Posição 2 (20-45° ou >20° ext.)</td><td style="' + ss + '">2</td></tr>' +
    '<tr><td style="' + cs + '">Posição 3 (45-90° flexão)</td><td style="' + ss + '">3</td></tr>' +
    '<tr><td style="' + cs + '">Posição 4 (>90° flexão)</td><td style="' + ss + '">4</td></tr>' +
    '<tr><td style="' + cs + ' font-size:9px;" colspan="2">+1 abdução/rotação | +1 elevação | −1 apoio</td></tr>' +
    '</table></td>' +
    '<td style="width:50%; vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/ombro.png" alt="Ombro" style="width:120px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr><tr>' +
    '<td style="vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Cotovelo</td></tr>' +
    '<tr><td style="' + cs + '">Posição 1 (60-100° flexão)</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Posição 2 (<60° ou >100°)</td><td style="' + ss + '">2</td></tr>' +
    '</table></td>' +
    '<td style="vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/cotovelo.png" alt="Cotovelo" style="width:100px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr><tr>' +
    '<td style="vertical-align:top; padding:0;">' +
    '<table style="width:100%; border-collapse:collapse;">' +
    '<tr><td colspan="2" style="' + hs + '">Punho</td></tr>' +
    '<tr><td style="' + cs + '">Posição 1 (0-15° flexão/ext.)</td><td style="' + ss + '">1</td></tr>' +
    '<tr><td style="' + cs + '">Posição 2 (>15° flexão/ext.)</td><td style="' + ss + '">2</td></tr>' +
    '<tr><td style="' + cs + ' font-size:9px;" colspan="2">+1 se desvio radial ou ulnar</td></tr>' +
    '</table></td>' +
    '<td style="vertical-align:middle; text-align:center; padding:8px;">' +
    '<img src="/reba/punho.png" alt="Punho" style="width:100px; height:auto;" onerror="this.style.display=\'none\'" />' +
    '</td></tr></table>' +

    // Scores Group B
    '<table style="width:100%; border-collapse:collapse; margin-top:4px;">' +
    '<tr><td style="' + ls + ' text-align:center; width:33%;">Ombro: <span style="font-size:14px; color:#4472C4;">' + upperArm + '</span></td>' +
    '<td style="' + ls + ' text-align:center; width:33%;">Cotovelo: <span style="font-size:14px; color:#4472C4;">' + lowerArm + '</span></td>' +
    '<td style="' + ls + ' text-align:center; width:34%;">Punho: <span style="font-size:14px; color:#4472C4;">' + wrist + '</span></td></tr>' +
    '<tr><td style="' + hs + '" colspan="2">Pontuação Tabela B</td><td style="' + ss + ' background:#D9E2F3; font-size:16px;">' + tableB + '</td></tr>' +
    '<tr><td style="' + ls + ' text-align:center;" colspan="2">Pega (Coupling)</td><td style="' + ss + '">' + coupling + '</td></tr>' +
    '</table></td>' +

    '</tr></table>' +

    // Final Scoring
    '<table style="width:100%; border-collapse:collapse; margin-top:0;">' +
    '<tr><td style="' + hs + ' width:25%;">Pontuação A + Carga</td><td style="' + ss + ' width:25%; background:#D9E2F3; font-size:16px;">' + (tableA + load) + '</td>' +
    '<td style="' + hs + ' width:25%;">Pontuação B + Pega</td><td style="' + ss + ' width:25%; background:#D9E2F3; font-size:16px;">' + (tableB + coupling) + '</td></tr>' +
    '<tr><td style="' + hs + '" colspan="2">Tabela C</td><td style="' + ss + ' background:#BDD7EE; font-size:18px;" colspan="2">' + tableC + '</td></tr>' +
    '<tr><td style="' + hs + '" colspan="2">Pontuação de Atividade</td><td style="' + ss + '" colspan="2">' + activity + '</td></tr>' +
    '<tr><td style="border:2px solid #000; padding:10px; font-size:14px; font-weight:bold; text-align:center; background:#4472C4; color:white;" colspan="2">PONTUAÇÃO FINAL REBA</td>' +
    '<td style="border:2px solid #000; padding:10px; font-size:22px; font-weight:bold; text-align:center; background:' + resultColor + ';" colspan="2">' + finalScore + '</td></tr>' +
    '</table>' +

    // Classification table
    '<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:11px; text-align:center;">' +
    '<tr><td style="border:1px solid #000; padding:6px; background:#4472C4; color:white; font-weight:bold; width:25%;">Pontuação</td>' +
    '<td style="border:1px solid #000; padding:6px; background:#4472C4; color:white; font-weight:bold; width:25%;">Nível do Risco</td>' +
    '<td style="border:1px solid #000; padding:6px; background:#4472C4; color:white; font-weight:bold; width:50%;">Ação</td></tr>' +
    '<tr style="' + hlRow(1, 1) + '"><td style="' + cs + ' text-align:center;">1</td><td style="' + cs + ' text-align:center; background:#C8E6C9;">Insignificante</td><td style="' + cs + '">Não necessária</td></tr>' +
    '<tr style="' + hlRow(2, 3) + '"><td style="' + cs + ' text-align:center;">2 – 3</td><td style="' + cs + ' text-align:center; background:#C8E6C9;">Baixo</td><td style="' + cs + '">Pode ser necessária</td></tr>' +
    '<tr style="' + hlRow(4, 7) + '"><td style="' + cs + ' text-align:center;">4 – 7</td><td style="' + cs + ' text-align:center; background:#FFF9C4;">Médio</td><td style="' + cs + '">Necessária</td></tr>' +
    '<tr style="' + hlRow(8, 10) + '"><td style="' + cs + ' text-align:center;">8 – 10</td><td style="' + cs + ' text-align:center; background:#FFE0B2;">Alto</td><td style="' + cs + '">Necessária em breve</td></tr>' +
    '<tr style="' + hlRow(11, 99) + '"><td style="' + cs + ' text-align:center;">≥ 11</td><td style="' + cs + ' text-align:center; background:#FFCDD2;">Muito Alto</td><td style="' + cs + '">Necessária imediatamente</td></tr>' +
    '</table>' +

    // Conclusion
    '<div style="border-top:2px solid #4472C4; padding:12px; margin-top:0; font-size:11px; line-height:1.6; background:#F2F7FB;">' +
    '<strong>Conclusão:</strong> A atividade em <strong>' + ws.name + '</strong> apresenta risco <strong>' + riskLevel.toLowerCase() + '</strong> (pontuação <strong>' + finalScore + '</strong>). Ação: <strong>' + riskAction.toLowerCase() + '</strong>. ' +
    'Recomenda-se adoção de medidas corretivas como melhoria na organização do posto, adequação de alturas, alternância postural e orientação ergonômica.</div>' +
    '</div>';
}

// ==================== AET ====================
function generateAETReport(ctx: ReportContext): string {
  const { company, sector, workstation, workstations, analyses, photos } = ctx;
  const { consultant, risks, actions, tasks, psychosocial } = getCtxData(ctx);
  const methods = [...new Set(analyses.map(a => a.method))].join(", ") || "N/A";
  const sectorName = sector?.name || "Geral";
  const wsName = workstation?.name || workstations.map(w => w.name).join(", ");

  return `${sharedStyles()}
${coverPage("ANÁLISE ERGONÔMICA DO TRABALHO", "AET", company, consultant)}

<div class="rpt-section">ÍNDICE</div>
<table class="rpt-table">
  <tr><td>1. Introdução</td><td style="text-align:right;">3</td></tr>
  <tr><td>2. Dados da Empresa</td><td style="text-align:right;">4</td></tr>
  <tr><td>3. Objetivos</td><td style="text-align:right;">5</td></tr>
  <tr><td>4. Referências Normativas</td><td style="text-align:right;">5</td></tr>
  <tr><td>5. Análise da Demanda e do Funcionamento da Organização</td><td style="text-align:right;">6</td></tr>
  <tr><td>6. Referencial Teórico</td><td style="text-align:right;">7</td></tr>
  <tr><td>7. Estudo Ergonômico do Trabalho</td><td style="text-align:right;">9</td></tr>
  <tr><td>8. Definição de Métodos, Técnicas e Ferramentas</td><td style="text-align:right;">10</td></tr>
  <tr><td>9. Agrupamento por GHE e Matriz de Avaliação Ergonômica</td><td style="text-align:right;">12</td></tr>
  <tr><td>10. Análise dos Riscos Psicossociais</td><td style="text-align:right;">14</td></tr>
  <tr><td>11. Responsabilidade Técnica</td><td style="text-align:right;">15</td></tr>
  <tr><td>12. Anexos</td><td style="text-align:right;">16</td></tr>
</table>
<div class="page-break"></div>

<div class="rpt-section">1. INTRODUÇÃO</div>
<p>Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana.</p>
<p>A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa.</p>
<p>Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho.</p>

<div class="page-break"></div>
<div class="rpt-section">2. DADOS DA EMPRESA</div>
${companyDataTable(company)}

<div class="page-break"></div>
<div class="rpt-section">3. OBJETIVOS</div>
<ul>
  <li>Realizar a Análise Ergonômica do Trabalho (AET) conforme as diretrizes da NR-17;</li>
  <li>Identificar e avaliar os riscos ergonômicos nos postos de trabalho analisados;</li>
  <li>Classificar os riscos utilizando métodos ergonômicos validados internacionalmente;</li>
  <li>Propor recomendações de melhoria baseadas em evidências científicas;</li>
  <li>Contribuir para a melhoria contínua das condições de trabalho na organização.</li>
</ul>

<div class="page-break"></div>
<div class="rpt-section">4. REFERÊNCIAS NORMATIVAS</div>
<table class="rpt-table">
  <tr><th>Norma</th><th>Descrição</th></tr>
  <tr><td class="label">NR-17</td><td>Ergonomia — Parâmetros de adaptação das condições de trabalho</td></tr>
  <tr><td class="label">NR-01</td><td>Disposições Gerais e Gerenciamento de Riscos Ocupacionais (PGR)</td></tr>
  <tr><td class="label">ISO 11228</td><td>Ergonomia — Movimentação manual de cargas</td></tr>
  <tr><td class="label">ISO 11226</td><td>Ergonomia — Avaliação de posturas de trabalho estáticas</td></tr>
  <tr><td class="label">CLT Art. 157-158</td><td>Obrigações do empregador e empregados quanto à segurança</td></tr>
</table>

<div class="page-break"></div>
<div class="rpt-section">5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO</div>
<p>A empresa <strong>${company.name}</strong> opera no segmento de ${company.description.toLowerCase() || "atividades comerciais/industriais"}. A organização do trabalho foi avaliada considerando a estrutura setorial, distribuição de tarefas, jornada de trabalho e ritmo de produção.</p>
${workstations.map(ws => {
  const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
  return `<div class="rpt-section3">Posto: ${ws.name}</div>
<p><strong>Descrição da atividade:</strong> ${ws.activity_description || ws.description}</p>
<p><strong>Tarefas executadas:</strong></p>
<ul>${wsTasks.map(t => `<li>${t.description}</li>`).join("") || `<li>${ws.tasks_performed || "Atividades gerais do posto"}</li>`}</ul>`;
}).join("")}

<div class="page-break"></div>
<div class="rpt-section">6. REFERENCIAL TEÓRICO</div>
<p>A Ergonomia, segundo a International Ergonomics Association (IEA), é a disciplina científica que trata da compreensão das interações entre seres humanos e outros elementos de um sistema, aplicando teorias, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema.</p>
<ul>
  <li><strong>Ergonomia Física:</strong> Características anatômicas, antropométricas, fisiológicas e biomecânicas</li>
  <li><strong>Ergonomia Cognitiva:</strong> Processos mentais como percepção, memória, raciocínio e resposta motora</li>
  <li><strong>Ergonomia Organizacional:</strong> Otimização de sistemas sociotécnicos, estruturas organizacionais e processos</li>
</ul>

<div class="page-break"></div>
<div class="rpt-section">7. ESTUDO ERGONÔMICO DO TRABALHO</div>
<p>A realização do Estudo Ergonômico do Trabalho (EET) é indispensável não apenas pelo cumprimento da NR-17, mas também por atuar como instrumento complementar ao PGR e ao PCMSO. Sua aplicação fortalece a empresa na prevenção de doenças ocupacionais, na manutenção da produtividade e na correção de inadequações ergonômicas do ambiente laboral.</p>
<p>O presente estudo foi elaborado com base nas análises e resultados desenvolvidos pela MG CONSULT, contemplando <strong>${workstations.length}</strong> posto(s) de trabalho, <strong>${analyses.length}</strong> análise(s) ergonômica(s) e <strong>${photos.length}</strong> registro(s) fotográfico(s) de postura.</p>
${analyses.length > 0 ? `
<div class="rpt-section3">Resumo das Avaliações</div>
<table class="rpt-table">
  <tr><th>Posto de Trabalho</th><th>Método Aplicado</th><th>Pontuação</th><th>Nível de Risco</th></tr>
  ${analyses.map(a => {
    const ws = workstations.find(w => w.id === a.workstation_id);
    const risk = risks.find(r => r.analysis_id === a.id);
    return `<tr><td>${ws?.name || "—"}</td><td>${a.method}</td><td><strong>${a.score}</strong></td><td><strong>${risk ? riskLevelLabel(risk.risk_level) : "N/A"}</strong></td></tr>`;
  }).join("")}
</table>
<p style="font-size:11px; color:#64748b;">Os detalhes completos de cada avaliação estão apresentados nas seções 7.1 (Relatório por Posto) e 7.2 (Fichas REBA), e o registro fotográfico encontra-se no Anexo V.</p>` : '<div class="rpt-callout warning">Nenhuma análise ergonômica realizada até o momento. Recomenda-se a aplicação dos métodos REBA, RULA ou ROSA conforme o tipo de posto.</div>'}

<div class="page-break"></div>
<div class="rpt-section2">7.1 RELATÓRIO DA ANÁLISE ERGONÔMICA POR POSTO</div>
<p>Relatórios individuais por posto de trabalho com descrição física, situações encontradas e riscos ergonômicos classificados:</p>
${workstations.map((ws, idx) => ergonomicAnalysisReportTable(ws, idx, ctx, risks, analyses, psychosocial)).join('<div class="page-break"></div>')}

${analyses.filter(a => a.method === "REBA").length > 0 ? `
<div class="page-break"></div>
<div class="rpt-section2">7.2 FICHAS REBA — RAPID ENTIRE BODY ASSESSMENT</div>
<p>Avaliação detalhada utilizando o método REBA para cada posto analisado:</p>
${analyses.filter(a => a.method === "REBA").map(a => {
  const ws = workstations.find(w => w.id === a.workstation_id);
  if (!ws) return '';
  const wsIdx = workstations.indexOf(ws);
  const risk = risks.find(r => r.analysis_id === a.id);
  return '<div class="page-break"></div>' + rebaAssessmentSheet(ws, wsIdx, a, risk, ctx);
}).join('')}` : ''}

<div class="page-break"></div>
<div class="rpt-section">8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS</div>
<p><strong>REBA</strong> — Rapid Entire Body Assessment: Estima o risco de distúrbios musculoesqueléticos. Classificação: 1-3 Baixo | 4-7 Médio | 8-10 Alto | 11+ Muito Alto.</p>
<p><strong>RULA</strong> — Rapid Upper Limb Assessment: Avalia exposição dos membros superiores. Classificação: 1-2 Aceitável | 3-4 Investigar | 5-6 Mudar breve | 7 Mudar imediatamente.</p>
<p><strong>OCRA</strong> — Occupational Repetitive Actions: Avaliação de movimentos repetitivos dos membros superiores.</p>
<p><strong>ROSA</strong> — Rapid Office Strain Assessment: Riscos musculoesqueléticos em postos administrativos. Classificação: 1-2 Desprezível | 3-4 Baixo | 5-6 Médio | 7+ Alto.</p>
<p><strong>OWAS</strong> — Ovako Working Posture Analysing System: Classificação postural. 1: Normal | 2: Leve | 3: Severo | 4: Muito severo.</p>
${equipmentTable()}

<div class="page-break"></div>
<div class="rpt-section">9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA</div>
<p>A empresa <strong>${company.trade_name || company.name}</strong> tem seus trabalhadores classificados em Grupos Homogêneos de Exposição (GHE), conforme metodologia do PGR.</p>
${gheTable(workstations, ctx)}
${riskMatrix()}

${risks.length > 0 ? `<div class="rpt-section3">Riscos Identificados</div>
<table class="rpt-table">
  <tr><th>Posto de Trabalho</th><th>Descrição do Risco</th><th>Cálculo (P×E×C)</th><th>Pontuação</th><th>Nível de Risco</th></tr>
  ${risks.map((r, i) => {
    const analysis = analyses.find(a => a.id === r.analysis_id);
    const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
    return `<tr><td>${ws?.name || 'GHE ' + (i + 1)}</td><td>${r.description}</td><td>${r.probability}×${r.exposure}×${r.consequence}</td><td><strong>${r.risk_score}</strong></td><td><strong>${riskLevelLabel(r.risk_level)}</strong></td></tr>`;
  }).join("")}
</table>` : ""}

<div class="page-break"></div>
<div class="rpt-section2">9.1 INVENTÁRIO DE RISCOS OCUPACIONAIS POR POSTO</div>
<p>Inventário completo de riscos ocupacionais com classificação por agente, conforme metodologia do PGR/NR-01:</p>
${workstations.map((ws, idx) => {
  return `<div class="rpt-section3">GHE ${String(idx + 1).padStart(2, '0')} — ${ws.name}</div>
${occupationalRiskInventoryTable(risks, analyses, ws, psychosocial)}`;
}).join('<div class="page-break"></div>')}

<div class="page-break"></div>
<div class="rpt-section">10. ANÁLISE DOS RISCOS PSICOSSOCIAIS</div>
${psychosocial.length > 0 ? `<p>Instrumentos aplicados: ${psychosocial.some(p => p.copenhagen_details) ? '<strong>COPSOQ II</strong>, ' : ''}${psychosocial.some(p => p.nasa_tlx_details) ? '<strong>NASA-TLX</strong>, ' : ''}${psychosocial.some(p => p.hse_it_details) ? '<strong>HSE-IT</strong>' : ''}</p>
${psychosocial.map(psa => {
  let html = '';
  if (psa.copenhagen_details) {
    const cd = psa.copenhagen_details;
    html += `<table class="rpt-table"><tr><th class="teal">Dimensão COPSOQ II</th><th class="teal">Score (0-100)</th></tr>
      ${([ ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace], ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands], ["Influência", cd.influence], ["Desenvolvimento", cd.possibilities_development], ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment], ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support] ] as [string, number][]).map(([d, v]) => `<tr><td>${d}</td><td><strong>${v}</strong></td></tr>`).join("")}
      <tr><td class="label">Score Geral</td><td><strong>${psa.copenhagen_score}</strong></td></tr></table>`;
  }
  if (psa.nasa_tlx_details) {
    html += `<table class="rpt-table"><tr><th class="alt">NASA-TLX</th><th class="alt">Score</th></tr>
      <tr><td>Demanda Mental</td><td>${psa.nasa_tlx_details.mental_demand}</td></tr>
      <tr><td>Demanda Física</td><td>${psa.nasa_tlx_details.physical_demand}</td></tr>
      <tr><td>Demanda Temporal</td><td>${psa.nasa_tlx_details.temporal_demand}</td></tr>
      <tr><td>Performance</td><td>${psa.nasa_tlx_details.performance}</td></tr>
      <tr><td>Esforço</td><td>${psa.nasa_tlx_details.effort}</td></tr>
      <tr><td>Frustração</td><td>${psa.nasa_tlx_details.frustration}</td></tr>
      <tr><td class="label">Score Geral</td><td><strong>${psa.nasa_tlx_score}</strong></td></tr></table>`;
  }
  return html;
}).join("")}` : '<div class="rpt-callout warning">Nenhuma avaliação psicossocial realizada. Recomenda-se aplicação dos questionários COPSOQ II, NASA-TLX e HSE-IT.</div>'}

<div class="page-break"></div>
<div class="rpt-section">11. RESPONSABILIDADE TÉCNICA</div>
<p>O presente documento foi elaborado sob a responsabilidade técnica da MG CONSULT.</p>
<p>${company.city}, ${getToday()}.</p>
${signatureBlock(consultant, "M.Sc Eng. de Produção (Ergonomia) / Eng. de Segurança do Trabalho")}

<div class="page-break"></div>
<div class="rpt-section">12. ANEXOS</div>
<ul style="font-size:14px; line-height:2;">
  <li>ANEXO I — Avaliação Ergonômica Preliminar (AEP)</li>
  <li>ANEXO II — Ferramentas e Métodos Aplicados</li>
  <li>ANEXO III — Relatório Técnico de Fatores Psicossociais</li>
  <li>ANEXO IV — Plano de Ação Ergonômico</li>
  <li>ANEXO V — Registro Fotográfico</li>
  <li>ANEXO VI — Checklist de Conformidade NR-17</li>
</ul>

<div class="page-break"></div>
<div class="rpt-section">ANEXO I — AVALIAÇÃO ERGONÔMICA PRELIMINAR (AEP)</div>
<p>A Avaliação Ergonômica Preliminar (AEP) tem como objetivo identificar os perigos ergonômicos de forma inicial, servindo como triagem para a AET detalhada. Conforme a NR-17, a AEP é obrigatória para todas as organizações.</p>
${workstations.map((ws, idx) => {
  const wsAnalyses = analyses.filter(a => a.workstation_id === ws.id);
  const wsPhotos = photos.filter(p => p.workstation_id === ws.id);
  const wsRisks = risks.filter(r => wsAnalyses.some(a => a.id === r.analysis_id));
  const sectorObj = ws.sector || ctx.sector;
  return `
<div class="rpt-section2">AEP ${String(idx + 1).padStart(2, '0')} — ${ws.name}</div>
<table class="rpt-table">
  <tr><td class="label" style="width:200px;">Posto de Trabalho</td><td>${ws.name}</td></tr>
  <tr><td class="label">Setor</td><td>${(sectorObj as any)?.name || "Geral"}</td></tr>
  <tr><td class="label">Descrição da Atividade</td><td>${ws.activity_description || ws.description}</td></tr>
  <tr><td class="label">Tarefas Executadas</td><td>${ws.tasks_performed || "—"}</td></tr>
  <tr><td class="label">Fotos Capturadas</td><td>${wsPhotos.length}</td></tr>
</table>
${wsAnalyses.length > 0 ? `
<div class="rpt-section3">Resultados da Avaliação</div>
<table class="rpt-table">
  <tr><th>Método</th><th>Pontuação</th><th>Situação</th><th>Observações</th></tr>
  ${wsAnalyses.map(a => `<tr><td>${a.method}</td><td><strong>${a.score}</strong></td><td>${analysisStatusLabel(a.analysis_status as any)}</td><td>${a.notes || "—"}</td></tr>`).join("")}
</table>` : '<div class="rpt-callout warning">Nenhuma análise ergonômica realizada para este posto.</div>'}
${wsRisks.length > 0 ? `
<div class="rpt-section3">Riscos Ergonômicos Identificados</div>
<table class="rpt-table">
  <tr><th>Descrição do Risco</th><th>Cálculo (P×E×C)</th><th>Pontuação</th><th>Nível de Risco</th></tr>
  ${wsRisks.map(r => `<tr><td>${r.description}</td><td>${r.probability}×${r.exposure}×${r.consequence}</td><td><strong>${r.risk_score}</strong></td><td><strong>${riskLevelLabel(r.risk_level)}</strong></td></tr>`).join("")}
</table>` : ''}
${wsPhotos.length > 0 ? `
<div class="rpt-section3">Registro Postural</div>
<table class="rpt-table">
  <tr><th>Tipo de Postura</th><th>Observações</th><th>Data do Registro</th></tr>
  ${wsPhotos.map(p => {
    const postureLabel = p.posture_type === 'sentado' ? 'Sentado' : p.posture_type === 'em_pe' ? 'Em pé' : p.posture_type;
    return `<tr><td><strong>${postureLabel}</strong></td><td>${p.notes || "—"}</td><td>${p.created_at}</td></tr>`;
  }).join("")}
</table>` : ''}`;
}).join("")}

<div class="page-break"></div>
<div class="rpt-section">ANEXO II — FERRAMENTAS E MÉTODOS APLICADOS</div>
<p>Os seguintes métodos ergonômicos validados internacionalmente foram empregados na avaliação:</p>
<table class="rpt-table">
  <tr><th>Método</th><th>Aplicação</th><th>Classificação de Risco</th></tr>
  <tr><td class="label">REBA</td><td>Corpo inteiro — posturas dinâmicas</td><td>1-3 Baixo | 4-7 Médio | 8-10 Alto | 11+ Muito Alto</td></tr>
  <tr><td class="label">RULA</td><td>Membros superiores</td><td>1-2 Aceitável | 3-4 Investigar | 5-6 Mudar breve | 7 Imediato</td></tr>
  <tr><td class="label">ROSA</td><td>Postos administrativos</td><td>1-2 Desprezível | 3-4 Baixo | 5-6 Médio | 7+ Alto</td></tr>
  <tr><td class="label">OWAS</td><td>Posturas de trabalho</td><td>1 Normal | 2 Leve | 3 Severo | 4 Muito severo</td></tr>
  <tr><td class="label">OCRA</td><td>Movimentos repetitivos MMSS</td><td>≤2.2 Aceitável | 2.3-3.5 Incerto | >3.5 Inaceitável</td></tr>
  <tr><td class="label">ANSI-365</td><td>Análise integrada de fatores ergonômicos</td><td>Classificação multifatorial</td></tr>
</table>
${equipmentTable()}

<div class="page-break"></div>
<div class="rpt-section">ANEXO III — RELATÓRIO TÉCNICO DE FATORES PSICOSSOCIAIS</div>
${psychosocial.length > 0 ? `
<p>Avaliações psicossociais realizadas: <strong>${psychosocial.length}</strong></p>
${psychosocial.map((psa, idx) => {
  let html = `<div class="rpt-section2">Avaliação ${idx + 1} — ${psa.evaluator_name}</div>`;
  if (psa.nasa_tlx_details) {
    const nasaClass = psa.nasa_tlx_score! <= 30 ? "green" : psa.nasa_tlx_score! <= 50 ? "yellow" : psa.nasa_tlx_score! <= 70 ? "orange" : "red";
    html += `<div class="rpt-section3">NASA-TLX (Carga de Trabalho)</div>
    <table class="rpt-table">
      <tr><th class="alt">Dimensão</th><th class="alt">Score (0-100)</th></tr>
      <tr><td>Demanda Mental</td><td>${psa.nasa_tlx_details.mental_demand}</td></tr>
      <tr><td>Demanda Física</td><td>${psa.nasa_tlx_details.physical_demand}</td></tr>
      <tr><td>Demanda Temporal</td><td>${psa.nasa_tlx_details.temporal_demand}</td></tr>
      <tr><td>Performance</td><td>${psa.nasa_tlx_details.performance}</td></tr>
      <tr><td>Esforço</td><td>${psa.nasa_tlx_details.effort}</td></tr>
      <tr><td>Frustração</td><td>${psa.nasa_tlx_details.frustration}</td></tr>
      <tr><td class="label">Score Geral</td><td><span class="rpt-badge ${nasaClass}"><strong>${psa.nasa_tlx_score}</strong></span></td></tr>
    </table>`;
  }
  if (psa.hse_it_details) {
    const hseClass = psa.hse_it_score! >= 4 ? "green" : psa.hse_it_score! >= 3 ? "yellow" : psa.hse_it_score! >= 2 ? "orange" : "red";
    html += `<div class="rpt-section3">HSE-IT (Estresse Ocupacional)</div>
    <table class="rpt-table">
      <tr><th class="teal">Dimensão</th><th class="teal">Score (1-5)</th></tr>
      <tr><td>Demandas</td><td>${psa.hse_it_details.demands}</td></tr>
      <tr><td>Controle</td><td>${psa.hse_it_details.control}</td></tr>
      <tr><td>Suporte</td><td>${psa.hse_it_details.support}</td></tr>
      <tr><td>Relacionamentos</td><td>${psa.hse_it_details.relationships}</td></tr>
      <tr><td>Papel</td><td>${psa.hse_it_details.role}</td></tr>
      <tr><td>Mudança</td><td>${psa.hse_it_details.change}</td></tr>
      <tr><td class="label">Score Geral</td><td><span class="rpt-badge ${hseClass}"><strong>${psa.hse_it_score}</strong></span></td></tr>
    </table>`;
  }
  if (psa.copenhagen_details) {
    const cd = psa.copenhagen_details;
    html += `<div class="rpt-section3">COPSOQ II (Copenhagen)</div>
    <table class="rpt-table">
      <tr><th class="teal">Dimensão</th><th class="teal">Score (0-100)</th></tr>
      ${([["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace], ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands], ["Influência", cd.influence], ["Desenvolvimento", cd.possibilities_development], ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment], ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support]] as [string, number][]).map(([d, v]) => `<tr><td>${d}</td><td><strong>${v}</strong></td></tr>`).join("")}
      <tr><td class="label">Score Geral</td><td><strong>${psa.copenhagen_score}</strong></td></tr>
    </table>`;
  }
  if (psa.observations) html += `<div class="rpt-callout">${psa.observations}</div>`;
  return html;
}).join("")}` : '<div class="rpt-callout warning">Nenhuma avaliação psicossocial registrada. Recomenda-se aplicação dos questionários COPSOQ II, NASA-TLX, HSE-IT e JSS.</div>'}

<div class="page-break"></div>
<div class="rpt-section">ANEXO IV — PLANO DE AÇÃO ERGONÔMICO</div>
${actions.length > 0 ? `
<table class="rpt-table">
  <tr><th>Nº</th><th>Ação Corretiva / Preventiva</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr>
  ${actions.map((ap, i) => `<tr><td>${i + 1}</td><td>${ap.description}</td><td>${ap.responsible}</td><td>${ap.deadline}</td><td>${statusLabel(ap.status)}</td></tr>`).join("")}
</table>` : '<div class="rpt-callout warning">Nenhum plano de ação registrado.</div>'}

<div class="page-break"></div>
<div class="rpt-section">ANEXO V — REGISTRO FOTOGRÁFICO</div>
${photos.length > 0 ? `
<p>Total de registros fotográficos capturados: <strong>${photos.length}</strong></p>
<table class="rpt-table">
  <tr><th>Nº</th><th>Posto de Trabalho</th><th>Tipo de Postura</th><th>Observações</th><th>Data do Registro</th></tr>
  ${photos.map((p, i) => {
    const ws = workstations.find(w => w.id === p.workstation_id);
    const postureLabel = p.posture_type === 'sentado' ? 'Sentado' : p.posture_type === 'em_pe' ? 'Em pé' : p.posture_type;
    return `<tr><td>${i + 1}</td><td>${ws?.name || "—"}</td><td>${postureLabel}</td><td>${p.notes || "—"}</td><td>${p.created_at}</td></tr>`;
  }).join("")}
</table>` : '<div class="rpt-callout warning">Nenhum registro fotográfico disponível.</div>'}

<div class="page-break"></div>
<div class="rpt-section">ANEXO VI — CHECKLIST DE CONFORMIDADE NR-17</div>
<table class="rpt-table">
  <tr><th>Item</th><th>Requisito NR-17</th><th>Conforme</th><th>Observações</th></tr>
  <tr><td>17.1</td><td>AEP realizada para todos os postos</td><td>${workstations.length > 0 && analyses.length > 0 ? '✓ Sim' : '✗ Não'}</td><td>${analyses.length} análise(s) em ${workstations.length} posto(s)</td></tr>
  <tr><td>17.2</td><td>Mobiliário adequado</td><td>A verificar</td><td>Avaliar in loco</td></tr>
  <tr><td>17.3</td><td>Equipamentos adequados</td><td>A verificar</td><td>Avaliar in loco</td></tr>
  <tr><td>17.4</td><td>Condições ambientais (iluminação, ruído, temperatura)</td><td>A verificar</td><td>Medições quantitativas recomendadas</td></tr>
  <tr><td>17.5</td><td>Organização do trabalho</td><td>A verificar</td><td>Pausas, ritmo, jornada</td></tr>
  <tr><td>17.6</td><td>Levantamento e transporte de cargas</td><td>A verificar</td><td>ISO 11228</td></tr>
  <tr><td>17.7</td><td>Trabalho com máquinas e equipamentos</td><td>A verificar</td><td>NR-12</td></tr>
  <tr><td>17.8</td><td>Fatores psicossociais avaliados</td><td>${psychosocial.length > 0 ? '✓ Sim' : '✗ Não'}</td><td>${psychosocial.length} avaliação(ões)</td></tr>
</table>

${footer()}`;
}

// ==================== PGR ====================
function generatePGRReport(ctx: ReportContext): string {
  const { company, workstations, analyses } = ctx;
  const { consultant, risks, actions, tasks, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("PROGRAMA DE GERENCIAMENTO DE RISCOS", "PGR", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. DEFINIÇÕES E ABREVIATURAS</div>
<table class="rpt-table">
  <tr><th>Termo</th><th>Definição</th></tr>
  <tr><td class="label">GHE</td><td>Grupo Homogêneo de Exposição</td></tr>
  <tr><td class="label">GRO</td><td>Gerenciamento de Riscos Ocupacionais</td></tr>
  <tr><td class="label">PGR</td><td>Programa de Gerenciamento de Riscos</td></tr>
  <tr><td class="label">EPC</td><td>Equipamento de Proteção Coletiva</td></tr>
  <tr><td class="label">EPI</td><td>Equipamento de Proteção Individual</td></tr>
  <tr><td class="label">SESMT</td><td>Serviço Especializado em Segurança e Medicina do Trabalho</td></tr>
  <tr><td class="label">CIPA</td><td>Comissão Interna de Prevenção de Acidentes</td></tr>
</table>

<div class="rpt-section">2. REFERÊNCIAS</div>
<ul>
  <li>NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais</li>
  <li>NR-09 — Avaliação e Controle das Exposições Ocupacionais</li>
  <li>NR-15 — Atividades e Operações Insalubres</li>
  <li>NR-17 — Ergonomia</li>
  <li>ABNT NBR ISO 31000:2009 — Gestão de Riscos</li>
  <li>FUNDACENTRO — NHO 01, NHO 06, NHO 11</li>
</ul>

<div class="rpt-section">3. IDENTIFICAÇÃO DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">4. RESPONSABILIDADE TÉCNICA</div>
<table class="rpt-table">
  <tr><td class="label">Responsável Técnico</td><td>${consultant}</td></tr>
  <tr><td class="label">Título Profissional</td><td>Engenheiro de Segurança do Trabalho</td></tr>
  <tr><td class="label">Registro</td><td>CREA/CONFEA: XXXXX</td></tr>
  <tr><td class="label">Período de Avaliação</td><td>${getToday()}</td></tr>
</table>

<div class="rpt-section">5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO</div>
<p>Ao aprovar o PGR, a empresa compromete-se a cumprir rigorosamente o que nele consta, sua efetiva implementação, bem como zelar pela sua eficácia.</p>

<div class="rpt-section">6. INTRODUÇÃO</div>
<p>A elaboração deste Programa de Gerenciamento de Riscos tem como propósito um estudo das condições ambientais atuais existentes nesta empresa, a fim de identificar os agentes de riscos e caracterizar as atividades e operações desenvolvidas.</p>

<div class="rpt-section">7. OBJETIVOS</div>
<div class="rpt-section3">7.1 Objetivo Geral</div>
<p>Preservar a saúde e a integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e controle dos riscos ambientais.</p>
<div class="rpt-section3">7.2 Objetivos Específicos</div>
<ul>
  <li>Seguir a política da empresa relacionada à saúde e segurança;</li>
  <li>Proteção do meio ambiente e dos recursos naturais;</li>
  <li>Tratar os riscos ambientais existentes ou que venham a existir;</li>
  <li>Planejar ações para preservar a saúde e a segurança dos trabalhadores.</li>
</ul>

<div class="rpt-section">8. CAMPO DE APLICAÇÃO</div>
<p>Este programa é aplicado a toda organização, estabelecimentos, canteiros de obras e/ou frentes de serviços.</p>

<div class="rpt-section">9. METODOLOGIA UTILIZADA</div>
<div class="rpt-section3">9.1 Análise Qualitativa</div>
<p>Análise preliminar e reconhecimento dos riscos ambientais, identificando perigos, fontes geradoras, exposição e medidas de controle existentes.</p>
<div class="rpt-section3">9.2 Análise Quantitativa</div>
${equipmentTable()}
<div class="rpt-section3">9.3 Critérios de Risco — Probabilidade (P) × Gravidade (G)</div>
${riskMatrix()}

<table class="rpt-table">
  <tr><th>Nível de Risco</th><th>Ação Requerida</th><th>Prazo</th></tr>
  <tr><td style="color:#dc2626;"><strong>Crítico</strong></td><td>Ações corretivas imediatas</td><td>Imediato</td></tr>
  <tr><td style="color:#ea580c;"><strong>Alto</strong></td><td>Planejamento a curto prazo</td><td>3 meses</td></tr>
  <tr><td style="color:#d97706;"><strong>Médio</strong></td><td>Planejamento a médio/longo prazo</td><td>6 meses</td></tr>
  <tr><td style="color:#16a34a;"><strong>Baixo</strong></td><td>Manter controle existente</td><td>1 ano</td></tr>
  <tr><td><strong>Irrelevante</strong></td><td>Não requer nova ação</td><td>N/A</td></tr>
</table>
<div class="page-break"></div>

<div class="rpt-section">10. INVENTÁRIO DE RISCO</div>
${Array.from(sectorMap.entries()).map(([sectorId, { sectorName, workstations: sectorWs }], gheIndex) => {
  const wsRisks = risks.filter(r => {
    const analysis = analyses.find(a => a.id === r.analysis_id);
    return analysis && sectorWs.some(w => w.id === analysis.workstation_id);
  });
  return `
<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} / SETOR — ${sectorName.toUpperCase()}</div>
<p><strong>Postos:</strong> ${sectorWs.map(w => w.name).join(", ")}</p>
<table class="rpt-table">
  <tr><th>Posto / Função</th><th>Descrição das Atividades</th></tr>
  ${sectorWs.map(ws => {
    const wt = tasks.filter(t => t.workstation_id === ws.id);
    return `<tr><td><strong>${ws.name}</strong></td><td>${wt.map(t => t.description).join("; ") || ws.tasks_performed || ws.activity_description}</td></tr>`;
  }).join("")}
</table>
<table class="rpt-table">
  <tr><th>Agente / Perigo</th><th>Possíveis Danos</th><th>Probabilidade</th><th>Gravidade</th><th>Nível de Risco</th><th>Medidas de Controle</th></tr>
  ${wsRisks.length > 0 ? wsRisks.map(r => {
    const analysis = analyses.find(a => a.id === r.analysis_id);
    const ws = analysis ? sectorWs.find(w => w.id === analysis.workstation_id) : null;
    return `<tr><td>${r.description}</td><td>${ws?.name || "—"}</td><td style="text-align:center;">${r.probability}</td><td style="text-align:center;">${r.consequence}</td><td style="text-align:center;">${riskLevelLabel(r.risk_level)}</td><td>${mockActionPlans.filter(ap => ap.risk_assessment_id === r.id).map(ap => ap.description).join("; ") || "N.I."}</td></tr>`;
  }).join("") : `<tr><td colspan="6" style="text-align:center;">Nenhum risco identificado para este setor</td></tr>`}
</table>`;
}).join("")}

<div class="rpt-section">11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO</div>
${actions.length > 0 ? `<table class="rpt-table">
  <tr><th>Ação Corretiva / Preventiva</th><th>Responsável</th><th>Prazo</th><th>Situação</th></tr>
  ${actions.map(ap => `<tr><td>${ap.description}</td><td>${ap.responsible}</td><td>${ap.deadline}</td><td>${statusLabel(ap.status)}</td></tr>`).join("")}
</table>` : "<p>Nenhuma ação registrada.</p>"}

<div class="rpt-section">12. EPC — EQUIPAMENTO DE PROTEÇÃO COLETIVA</div>
<p>Medidas que eliminam ou reduzam a utilização ou a formação de agentes prejudiciais, previnam a liberação e reduzam os níveis no ambiente de trabalho.</p>

<div class="rpt-section">13. EPI — EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL</div>
<p>Dispositivo de uso individual destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho, conforme NR-06.</p>

<div class="rpt-section">14. RESPONSABILIDADES</div>
<p><strong>Empregador:</strong> Estabelecer, implantar e assegurar o cumprimento do PGR. Informar os trabalhadores sobre os riscos.</p>
<p><strong>SESMT:</strong> Executar, coordenar e monitorar as etapas do programa. Manter arquivado por 20 anos.</p>

<div class="rpt-section">15. META E OBJETIVOS</div>
<ul>
  <li>Reduzir em 20% os riscos classificados como "Alto" ou "Crítico"</li>
  <li>Garantir treinamento a 100% dos trabalhadores expostos</li>
  <li>Implementar todas as ações do Plano de Ação dentro dos prazos</li>
</ul>

<div class="rpt-section">16. REFERÊNCIAS BIBLIOGRÁFICAS</div>
<ul style="font-size:12px;">
  <li>BRASIL. Normas Regulamentadoras (NR) — MTE</li>
  <li>ABNT NBR ISO 31000:2009 — Gestão de Riscos</li>
  <li>BS 8800:1996 — Guide to OHS Management Systems</li>
  <li>MULHAUSEN & DAMIANO (1998) — AIHA Strategy for Exposure Assessment</li>
  <li>FUNDACENTRO — NHO 01, NHO 06, NHO 11</li>
</ul>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== APR (Avaliação Preliminar de Riscos Psicossociais) ====================
function generateAPRReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const { consultant, psychosocial, sectors } = getCtxData(ctx);
  const classifyRisk = (v: number) => v >= 75 ? `<span class="rpt-badge green">Baixo risco</span>` : v >= 50 ? `<span class="rpt-badge yellow">Moderado</span>` : `<span class="rpt-badge red">Alto risco</span>`;

  return `${sharedStyles()}
${coverPage("AVALIAÇÃO PRELIMINAR DE RISCOS PSICOSSOCIAIS", "APR — FRPRT", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. INFORMAÇÕES CADASTRAIS DA ORGANIZAÇÃO</div>
${companyDataTable(company)}

<div class="rpt-section">2. OBJETIVO</div>
<div class="rpt-callout">A avaliação dos fatores de risco psicossociais é fundamental para a promoção da saúde mental no trabalho e cumprimento da NR-01.</div>
<p>Apresentar os resultados da Avaliação Preliminar de Fatores de Risco Psicossociais Relacionados ao Trabalho (FRPRT), conforme NR-01, articulada com o PGR e PCMSO da empresa.</p>

<div class="rpt-section">3. METODOLOGIA</div>
<div class="rpt-section3">3.1 Metodologia de Avaliação</div>
<p>Metodologia baseada no <strong>COPSOQ II</strong> (Copenhagen Psychosocial Questionnaire), <strong>NASA-TLX</strong> (Índice de Carga de Trabalho) e <strong>HSE-IT</strong> (Health and Safety Executive).</p>
<table class="rpt-table">
  <tr><th class="teal">Faixa de Score</th><th class="teal">Classificação</th><th class="teal">Ação Recomendada</th></tr>
  <tr><td><span class="rpt-badge red">0 a 49</span></td><td>Alto Risco</td><td>Intervenção imediata requerida</td></tr>
  <tr><td><span class="rpt-badge yellow">50 a 74</span></td><td>Moderado</td><td>Monitoramento e ações preventivas</td></tr>
  <tr><td><span class="rpt-badge green">75 a 100</span></td><td>Baixo Risco</td><td>Manter práticas existentes</td></tr>
</table>

<div class="rpt-section3">3.2 Critérios de Avaliação de Risco (PGR)</div>
${riskMatrix()}

<div class="rpt-section">4. AMOSTRA</div>
<table class="rpt-table">
  <tr><td class="label">Setores Avaliados</td><td>${sectors.join(", ")}</td></tr>
  <tr><td class="label">Postos de Trabalho</td><td>${workstations.length}</td></tr>
  <tr><td class="label">Avaliações Realizadas</td><td>${psychosocial.length}</td></tr>
  <tr><td class="label">Período</td><td>${getToday()}</td></tr>
</table>

<div class="rpt-section">5. RESULTADOS</div>
${psychosocial.length > 0 ? psychosocial.map(psa => {
  let html = '';
  if (psa.copenhagen_details) {
    const cd = psa.copenhagen_details;
    html += `<div class="rpt-section2">COPSOQ II — Resultados por Domínio</div>
    <table class="rpt-table">
      <tr><th class="teal">Domínio Psicossocial</th><th class="teal">Score</th><th class="teal">Classificação</th></tr>
      ${([ ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace], ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands], ["Influência no Trabalho", cd.influence], ["Possibilidades de Desenvolvimento", cd.possibilities_development], ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment], ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support] ] as [string, number][]).map(([dim, val]) => `<tr><td>${dim}</td><td><strong>${val}</strong></td><td>${classifyRisk(val)}</td></tr>`).join("")}
      <tr><td class="label"><strong>Score Global</strong></td><td><strong>${psa.copenhagen_score}</strong></td><td>${classifyRisk(psa.copenhagen_score || 0)}</td></tr>
    </table>`;
  }
  if (psa.nasa_tlx_details) {
    html += `<div class="rpt-section2">NASA-TLX — Índice de Carga de Trabalho</div>
    <table class="rpt-table">
      <tr><th class="alt">Dimensão</th><th class="alt">Score (0-100)</th></tr>
      <tr><td>Demanda Mental</td><td>${psa.nasa_tlx_details.mental_demand}</td></tr>
      <tr><td>Demanda Física</td><td>${psa.nasa_tlx_details.physical_demand}</td></tr>
      <tr><td>Demanda Temporal</td><td>${psa.nasa_tlx_details.temporal_demand}</td></tr>
      <tr><td>Performance</td><td>${psa.nasa_tlx_details.performance}</td></tr>
      <tr><td>Esforço</td><td>${psa.nasa_tlx_details.effort}</td></tr>
      <tr><td>Frustração</td><td>${psa.nasa_tlx_details.frustration}</td></tr>
      <tr><td class="label"><strong>Score Geral</strong></td><td><strong>${psa.nasa_tlx_score}</strong></td></tr>
    </table>`;
  }
  if (psa.hse_it_details) {
    html += `<div class="rpt-section2">HSE-IT — Indicadores de Estresse Ocupacional</div>
    <table class="rpt-table">
      <tr><th class="alt">Dimensão</th><th class="alt">Score</th></tr>
      <tr><td>Demandas</td><td>${psa.hse_it_details.demands}</td></tr>
      <tr><td>Controle</td><td>${psa.hse_it_details.control}</td></tr>
      <tr><td>Suporte</td><td>${psa.hse_it_details.support}</td></tr>
      <tr><td>Relacionamentos</td><td>${psa.hse_it_details.relationships}</td></tr>
      <tr><td>Papel</td><td>${psa.hse_it_details.role}</td></tr>
      <tr><td>Mudança</td><td>${psa.hse_it_details.change}</td></tr>
      <tr><td class="label"><strong>Score Geral</strong></td><td><strong>${psa.hse_it_score}</strong></td></tr>
    </table>`;
  }
  html += `<p><strong>Observações:</strong> ${psa.observations}</p>`;
  return html;
}).join("<hr>") : '<div class="rpt-callout danger">Nenhuma avaliação psicossocial encontrada. Recomenda-se aplicação urgente dos questionários COPSOQ II, NASA-TLX e HSE-IT.</div>'}

<div class="rpt-section">6. RECOMENDAÇÕES TÉCNICAS</div>
<table class="rpt-table">
  <tr><th class="teal">Ação</th><th class="teal">Detalhamento</th><th class="teal">Prazo</th><th class="teal">Prioridade</th></tr>
  <tr><td><strong>Gestão de Estresse</strong></td><td>Capacitação sobre técnicas de manejo do estresse ocupacional</td><td>60 dias</td><td><span class="rpt-badge yellow">Média</span></td></tr>
  <tr><td><strong>Adequação da Carga</strong></td><td>Reorganizar tarefas nos setores com alto risco psicossocial</td><td>45 dias</td><td><span class="rpt-badge orange">Alta</span></td></tr>
  <tr><td><strong>Canal de Feedback</strong></td><td>Implantar canais contínuos de relato de condições</td><td>30 dias</td><td><span class="rpt-badge orange">Alta</span></td></tr>
  <tr><td><strong>Avaliações Periódicas</strong></td><td>Novas avaliações semestrais conforme NR-01</td><td>6 meses</td><td><span class="rpt-badge yellow">Média</span></td></tr>
</table>

<div class="rpt-section">7. PLANO DE AÇÃO E MELHORIA</div>
<div class="rpt-callout">O plano de ação deve ser revisado periodicamente conforme NR-01 e integrado ao PGR da empresa.</div>

<div class="rpt-section">8. CONSIDERAÇÕES FINAIS</div>
<p>A implementação das ações recomendadas contribuirá significativamente para a redução dos riscos psicossociais e promoção da saúde mental no ambiente de trabalho da <strong>${company.trade_name || company.name}</strong>.</p>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== PCMSO ====================
function generatePCMSOReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const { consultant, sectors, risks, sectorMap } = getCtxData(ctx);
  const medico = ctx.consultantName || "Médico do Trabalho";

  return `${sharedStyles()}
${coverPage("PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL", "PCMSO", company, medico)}

${revisionTable()}

<div class="rpt-section">1. DEFINIÇÕES E ABREVIATURAS</div>
<table class="rpt-table">
  <tr><th>Termo</th><th>Definição</th></tr>
  <tr><td class="label">ASO</td><td>Atestado de Saúde Ocupacional</td></tr>
  <tr><td class="label">PCMSO</td><td>Programa de Controle Médico de Saúde Ocupacional</td></tr>
  <tr><td class="label">PGR</td><td>Programa de Gerenciamento de Riscos</td></tr>
  <tr><td class="label">GHE</td><td>Grupos Homogêneos de Exposição</td></tr>
  <tr><td class="label">PAIR</td><td>Perda Auditiva Induzida por Ruído</td></tr>
  <tr><td class="label">LER/DORT</td><td>Lesão por Esforço Repetitivo / Distúrbio Osteomuscular</td></tr>
</table>

<div class="rpt-section">2. REFERÊNCIAS</div>
<ul>
  <li>NR-07 — Programa de Controle Médico de Saúde Ocupacional</li>
  <li>NR-09 — Avaliação e Controle das Exposições Ocupacionais</li>
  <li>NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais</li>
  <li>Portaria nº 19/1998 — Diretrizes e parâmetros para audiometria</li>
</ul>

<div class="rpt-section">3. IDENTIFICAÇÃO DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">4. INTRODUÇÃO</div>
<div class="rpt-callout">O PCMSO é um programa de caráter preventivo, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.</div>
<p>Tem como finalidade a promoção e preservação da saúde do conjunto dos trabalhadores, planejado com base nos riscos identificados no PGR.</p>

<div class="rpt-section">5. OBJETIVOS</div>
<div class="rpt-section3">5.1 Objetivo Geral</div>
<p>Promoção e preservação da saúde dos trabalhadores, através da prevenção, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.</p>
<div class="rpt-section3">5.2 Objetivos Específicos</div>
<ul>
  <li>Definir exames médicos ocupacionais obrigatórios por função/risco</li>
  <li>Estabelecer critérios para exames complementares</li>
  <li>Monitorar a saúde dos trabalhadores expostos a riscos ocupacionais</li>
  <li>Subsidiar ações de prevenção e promoção da saúde</li>
</ul>

<div class="rpt-section">6. MÉDICO RESPONSÁVEL</div>
<table class="rpt-table">
  <tr><td class="label">Médico Coordenador</td><td>${medico}</td></tr>
  <tr><td class="label">Especialidade</td><td>Medicina do Trabalho</td></tr>
  <tr><td class="label">CRM</td><td>XXXXX</td></tr>
  <tr><td class="label">Vigência</td><td>${getToday()} a ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("pt-BR")}</td></tr>
</table>

<div class="rpt-section">7. RESPONSABILIDADES</div>
<div class="rpt-section3">7.1 Do Empregador</div>
<ul>
  <li>Garantir a elaboração e efetiva implementação do PCMSO</li>
  <li>Custear todos os procedimentos relacionados ao PCMSO</li>
  <li>Indicar médico do trabalho responsável</li>
</ul>
<div class="rpt-section3">7.2 Dos Empregados</div>
<ul>
  <li>Submeter-se aos exames médicos previstos</li>
  <li>Colaborar com a empresa na aplicação do PCMSO</li>
</ul>

<div class="rpt-section">8. EXAMES MÉDICOS OCUPACIONAIS</div>
<table class="rpt-table">
  <tr><th class="alt">Tipo de Exame</th><th class="alt">Momento</th><th class="alt">Prazo</th></tr>
  <tr><td><strong>Admissional</strong></td><td>Antes do início das atividades</td><td>Antes da admissão</td></tr>
  <tr><td><strong>Periódico</strong></td><td>Durante a vigência do contrato</td><td>Anual ou semestral conforme risco</td></tr>
  <tr><td><strong>Retorno ao Trabalho</strong></td><td>Após afastamento ≥30 dias</td><td>No 1º dia de retorno</td></tr>
  <tr><td><strong>Mudança de Risco</strong></td><td>Ao mudar de função/setor com risco diferente</td><td>Antes da mudança</td></tr>
  <tr><td><strong>Demissional</strong></td><td>No desligamento do empregado</td><td>Até 10 dias antes do desligamento</td></tr>
</table>

<div class="rpt-section">9. AVALIAÇÃO DOS RISCOS E EXAMES RECOMENDADOS</div>
<table class="rpt-table">
  <tr><th class="teal">Risco Ocupacional</th><th class="teal">Exames Complementares</th><th class="teal">Periodicidade</th></tr>
  <tr><td><strong>Ruído (≥80 dB)</strong></td><td>Audiometria tonal e vocal</td><td>Semestral</td></tr>
  <tr><td><strong>Ergonômico</strong></td><td>Avaliação clínica osteomuscular</td><td>Anual</td></tr>
  <tr><td><strong>Químico</strong></td><td>Hemograma, função hepática e renal</td><td>Semestral</td></tr>
  <tr><td><strong>Biológico</strong></td><td>Hemograma completo, sorologia</td><td>Anual</td></tr>
  <tr><td><strong>Calor</strong></td><td>Avaliação clínica, função renal</td><td>Anual</td></tr>
  <tr><td><strong>Poeira/Partículas</strong></td><td>Espirometria, Rx de tórax</td><td>Anual</td></tr>
</table>

<div class="rpt-section">10. AÇÕES MÉDICAS PREVENTIVAS — VACINAÇÃO</div>
<table class="rpt-table">
  <tr><th>Vacina</th><th>Esquema</th><th>Indicação</th></tr>
  <tr><td><strong>Hepatite B</strong></td><td>3 doses (0, 1 e 6 meses)</td><td>Todos os trabalhadores</td></tr>
  <tr><td><strong>Tétano/Difteria (dT)</strong></td><td>3 doses + reforço a cada 10 anos</td><td>Todos</td></tr>
  <tr><td><strong>Influenza</strong></td><td>Dose anual</td><td>Todos</td></tr>
  <tr><td><strong>COVID-19</strong></td><td>Conforme orientação vigente</td><td>Todos</td></tr>
  <tr><td><strong>Febre Amarela</strong></td><td>Dose única</td><td>Áreas endêmicas</td></tr>
</table>

<div class="rpt-section">11. CRONOGRAMA ANUAL</div>
<table class="rpt-table">
  <tr><th>Ação</th><th>Jan-Mar</th><th>Abr-Jun</th><th>Jul-Set</th><th>Out-Dez</th></tr>
  <tr><td>Exames Periódicos</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td></tr>
  <tr><td>Campanha de Vacinação</td><td style="background:#C8E6C9;">✓</td><td></td><td></td><td style="background:#C8E6C9;">✓</td></tr>
  <tr><td>Avaliação Audiométrica</td><td style="background:#C8E6C9;">✓</td><td></td><td style="background:#C8E6C9;">✓</td><td></td></tr>
  <tr><td>Relatório Anual PCMSO</td><td></td><td></td><td></td><td style="background:#C8E6C9;">✓</td></tr>
</table>

<div class="rpt-section">12. CONCLUSÃO</div>
<p>O presente PCMSO foi elaborado com base nos riscos ocupacionais identificados no PGR da empresa <strong>${company.trade_name || company.name}</strong>.</p>
<div class="rpt-callout">O PCMSO deve ser revisado anualmente ou sempre que houver alteração nos riscos ocupacionais.</div>

${signatureBlock(medico, "Médico do Trabalho", "CRM: XXXXX")}
${footer()}`;
}

// ==================== LTCAT ====================
function generateLTCATReport(ctx: ReportContext): string {
  const { company, workstations, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS DO TRABALHO", "LTCAT", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. LISTA DE ABREVIATURAS</div>
<table class="rpt-table">
  <tr><th>Abreviatura</th><th>Significado</th></tr>
  <tr><td class="label">LTCAT</td><td>Laudo Técnico das Condições Ambientais do Trabalho</td></tr>
  <tr><td class="label">INSS</td><td>Instituto Nacional do Seguro Social</td></tr>
  <tr><td class="label">PPP</td><td>Perfil Profissiográfico Previdenciário</td></tr>
  <tr><td class="label">SAT</td><td>Seguro Acidente de Trabalho</td></tr>
  <tr><td class="label">RAT</td><td>Risco Ambiental do Trabalho</td></tr>
  <tr><td class="label">FAP</td><td>Fator Acidentário de Prevenção</td></tr>
  <tr><td class="label">GHE</td><td>Grupo Homogêneo de Exposição</td></tr>
</table>

<div class="rpt-section">2. IDENTIFICAÇÃO DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">3. TERMO DE RESPONSABILIDADE</div>
<p>A empresa compromete-se a informar imediatamente ao responsável técnico qualquer alteração nas condições de trabalho que possam modificar as exposições identificadas neste laudo.</p>

<div class="rpt-section">4. RESPONSÁVEL TÉCNICO</div>
<table class="rpt-table">
  <tr><td class="label">Nome</td><td>${consultant}</td></tr>
  <tr><td class="label">Registro</td><td>CREA/CONFEA: XXXXX</td></tr>
  <tr><td class="label">Período de Avaliação</td><td>${getToday()}</td></tr>
</table>

<div class="rpt-section">5. INTRODUÇÃO</div>
<p>O Laudo Técnico das Condições Ambientais do Trabalho (LTCAT) é um documento previsto na legislação previdenciária (Lei nº 8.213/91, Decreto nº 3.048/99 e IN INSS/PRES 77/2015), com a finalidade de documentar os agentes nocivos presentes no ambiente de trabalho e a exposição dos trabalhadores a estes agentes.</p>
<p>O LTCAT serve de base para o preenchimento do PPP (Perfil Profissiográfico Previdenciário) e para a determinação do enquadramento em aposentadoria especial (15, 20 ou 25 anos).</p>

<div class="rpt-section">6. OBJETIVOS</div>
<div class="rpt-section3">6.1 Objetivo Geral</div>
<p>Identificar, qualificar e quantificar os agentes nocivos presentes nos ambientes de trabalho e as condições de exposição dos trabalhadores, para fins previdenciários.</p>
<div class="rpt-section3">6.2 Objetivos Específicos</div>
<ul>
  <li>Subsidiar o preenchimento do PPP</li>
  <li>Determinar o enquadramento ou não em aposentadoria especial</li>
  <li>Atender à legislação previdenciária vigente (Decreto 3048/99)</li>
  <li>Documentar medidas de proteção existentes</li>
</ul>

<div class="rpt-section">7. FUNDAMENTAÇÃO LEGAL</div>
<ul>
  <li>Lei nº 8.213/91 — Planos de Benefícios da Previdência Social</li>
  <li>Decreto nº 3.048/99 — Regulamento da Previdência Social</li>
  <li>IN INSS/PRES 77/2015</li>
  <li>NR-15 — Atividades e Operações Insalubres</li>
  <li>NR-09 — Avaliação e Controle das Exposições Ocupacionais</li>
</ul>

<div class="rpt-section">8. METODOLOGIA</div>
<div class="rpt-section3">8.1 Análise Qualitativa</div>
<p>Inspeção visual e entrevistas com trabalhadores para identificação dos agentes nocivos e condições de exposição.</p>
<div class="rpt-section3">8.2 Análise Quantitativa</div>
${equipmentTable()}

<div class="rpt-section">9. AVALIAÇÕES DAS CONDIÇÕES AMBIENTAIS</div>
${Array.from(sectorMap.entries()).map(([_, { sectorName, workstations: sectorWs }], gheIndex) => {
  return `<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} — ${sectorName.toUpperCase()}</div>
<table class="rpt-table">
  <tr><th>Função/Posto</th><th>Agente Nocivo</th><th>Intensidade/Concentração</th><th>LT (NR-15)</th><th>Tempo Exposição</th><th>EPI Eficaz</th><th>Aposentadoria Especial</th></tr>
  ${sectorWs.map(ws => {
    const wsRisks = risks.filter(r => {
      const a = analyses.find(a2 => a2.id === r.analysis_id);
      return a && a.workstation_id === ws.id;
    });
    if (wsRisks.length === 0) {
      return `<tr><td>${ws.name}</td><td colspan="6" style="text-align:center;">Sem exposição a agentes nocivos acima dos limites de tolerância</td></tr>`;
    }
    return wsRisks.map(r => `<tr><td>${ws.name}</td><td>${r.description}</td><td>A avaliar</td><td>NR-15</td><td>Habitual e permanente</td><td>Sim</td><td>Não enquadrado</td></tr>`).join("");
  }).join("")}
</table>`;
}).join("")}

<div class="rpt-section">10. CONCLUSÃO</div>
<p>Com base nas avaliações realizadas, os trabalhadores da empresa <strong>${company.trade_name || company.name}</strong> estão expostos aos agentes descritos nas tabelas acima. As medidas de controle existentes são adequadas para neutralizar/reduzir a exposição aos agentes nocivos identificados.</p>
<div class="rpt-callout">O LTCAT deve ser atualizado sempre que houver mudança nas condições ambientais de trabalho ou nos processos produtivos.</div>

<div class="rpt-section">ANEXOS</div>
<ul>
  <li>Anexo I — Equipamentos de Medição e Certificados de Calibração</li>
  <li>Anexo II — Avaliações de Ruído/Químico</li>
  <li>Anexo III — Habilitação do Responsável Técnico e ART</li>
</ul>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== LAUDO DE INSALUBRIDADE ====================
function generateInsalubridadeReport(ctx: ReportContext): string {
  const { company, workstations, analyses } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("LAUDO TÉCNICO DE INSALUBRIDADE", "NR-15", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. DADOS DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">2. INTRODUÇÃO</div>
<p>O presente Laudo Técnico de Insalubridade tem por objetivo avaliar as condições de trabalho da empresa <strong>${company.trade_name || company.name}</strong>, verificando a existência ou não de agentes insalubres nos ambientes laborais, conforme preceitos da Norma Regulamentadora NR-15 (Portaria 3.214/78 do MTE) e legislação pertinente (CLT, artigos 189 a 197).</p>

<div class="rpt-section">3. FUNDAMENTAÇÃO LEGAL</div>
<ul>
  <li><strong>CLT — Art. 189:</strong> Consideram-se insalubres as atividades que expõem os trabalhadores a agentes nocivos à saúde, acima dos limites de tolerância.</li>
  <li><strong>CLT — Art. 192:</strong> Adicional de insalubridade de 40%, 20% ou 10% sobre o salário mínimo, conforme grau máximo, médio ou mínimo.</li>
  <li><strong>NR-15:</strong> Atividades e operações insalubres — Limites de tolerância para ruído, calor, agentes químicos, poeiras, etc.</li>
  <li><strong>NR-09:</strong> Avaliação e controle das exposições ocupacionais a agentes físicos, químicos e biológicos.</li>
</ul>

<div class="rpt-section">4. CONCEITOS E DEFINIÇÕES</div>
<table class="rpt-table">
  <tr><th>Conceito</th><th>Definição</th></tr>
  <tr><td class="label">Insalubridade</td><td>Condição de trabalho que expõe o trabalhador a agentes nocivos à saúde acima dos limites de tolerância (NR-15)</td></tr>
  <tr><td class="label">Limite de Tolerância</td><td>Concentração ou intensidade máxima de agente nocivo permitida sem causar dano à saúde do trabalhador</td></tr>
  <tr><td class="label">Adicional 40%</td><td>Grau Máximo — agentes com maior potencial de dano</td></tr>
  <tr><td class="label">Adicional 20%</td><td>Grau Médio — exposição moderada</td></tr>
  <tr><td class="label">Adicional 10%</td><td>Grau Mínimo — exposição controlada mas acima do LT</td></tr>
</table>

<div class="rpt-section">5. METODOLOGIA</div>
${equipmentTable()}
<p>As medições foram realizadas conforme metodologias da FUNDACENTRO (NHO 01, NHO 06, NHO 08, NHO 11) e critérios da NR-15 e ACGIH.</p>

<div class="rpt-section">6. AVALIAÇÃO DOS RISCOS OCUPACIONAIS</div>
${Array.from(sectorMap.entries()).map(([_, { sectorName, workstations: sectorWs }], gheIndex) => {
  return `<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} — ${sectorName.toUpperCase()}</div>
<table class="rpt-table">
  <tr><th>Função/Posto</th><th>Agente</th><th>Classificação NR-15</th><th>Intensidade Medida</th><th>Limite Tolerância</th><th>Insalubridade</th><th>Grau</th></tr>
  ${sectorWs.map(ws => {
    const wsRisks = risks.filter(r => {
      const a = analyses.find(a2 => a2.id === r.analysis_id);
      return a && a.workstation_id === ws.id;
    });
    if (wsRisks.length === 0) {
      return `<tr><td>${ws.name}</td><td colspan="6" style="text-align:center;">Sem exposição insalubre identificada</td></tr>`;
    }
    return wsRisks.map(r => `<tr><td>${ws.name}</td><td>${r.description}</td><td>Anexo NR-15</td><td>A avaliar</td><td>NR-15</td><td>${r.risk_level === 'high' || r.risk_level === 'critical' ? '<span class="rpt-badge red">SIM</span>' : '<span class="rpt-badge green">NÃO</span>'}</td><td>${r.risk_level === 'critical' ? '40% (Máximo)' : r.risk_level === 'high' ? '20% (Médio)' : '—'}</td></tr>`).join("");
  }).join("")}
</table>`;
}).join("")}

<div class="rpt-section">7. CONCLUSÃO</div>
<p>Com base nas avaliações quantitativas e qualitativas realizadas nos ambientes de trabalho da empresa <strong>${company.trade_name || company.name}</strong>, conclui-se:</p>
<div class="rpt-callout">As atividades e condições de exposição foram avaliadas conforme NR-15 e os resultados estão detalhados nas tabelas acima. A empresa deve adotar as medidas de controle necessárias para eliminação ou neutralização dos agentes insalubres identificados.</div>
<p>A eliminação ou neutralização da insalubridade poderá ocorrer com a adoção de medidas de proteção coletiva (EPC) ou individual (EPI) que reduzam a intensidade do agente a níveis abaixo dos limites de tolerância.</p>

<div class="rpt-section">ANEXOS</div>
<ul>
  <li>Anexo I — Certificados de Calibração dos Equipamentos</li>
  <li>Anexo II — Resultados das Medições Ambientais</li>
  <li>Anexo III — ART do Responsável Técnico</li>
</ul>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== LAUDO DE PERICULOSIDADE ====================
function generatePericulosidadeReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const { consultant, risks, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("LAUDO TÉCNICO DE PERICULOSIDADE", "NR-16", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. DADOS DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">2. INTRODUÇÃO</div>
<p>O presente Laudo Técnico de Periculosidade tem por objetivo avaliar as atividades e operações realizadas pelos trabalhadores da empresa <strong>${company.trade_name || company.name}</strong>, com a finalidade de verificar a caracterização ou não de condições de periculosidade, nos termos da CLT (artigos 193 a 197) e NR-16.</p>

<div class="rpt-section">3. FUNDAMENTAÇÃO LEGAL</div>
<ul>
  <li><strong>CLT — Art. 193:</strong> São consideradas atividades ou operações perigosas aquelas que, por sua natureza ou métodos de trabalho, impliquem risco acentuado em virtude de exposição permanente a: inflamáveis, explosivos, energia elétrica, roubos ou outras espécies de violência física.</li>
  <li><strong>NR-16:</strong> Atividades e Operações Perigosas — Estabelece os critérios para caracterização da periculosidade.</li>
  <li><strong>Adicional de 30%:</strong> sobre o salário-base, sem os acréscimos resultantes de gratificações, prêmios ou participações nos lucros.</li>
</ul>

<div class="rpt-section">4. ATIVIDADES PERIGOSAS — CLASSIFICAÇÃO NR-16</div>
<table class="rpt-table">
  <tr><th class="teal">Anexo NR-16</th><th class="teal">Descrição</th></tr>
  <tr><td class="label">Anexo 1</td><td>Atividades com explosivos</td></tr>
  <tr><td class="label">Anexo 2</td><td>Atividades com inflamáveis</td></tr>
  <tr><td class="label">Anexo 3</td><td>Atividades com radiações ionizantes ou substâncias radioativas</td></tr>
  <tr><td class="label">Anexo 4</td><td>Atividades com exposição a roubos ou violência física (segurança)</td></tr>
  <tr><td class="label">Anexo 5</td><td>Atividades com energia elétrica</td></tr>
  <tr><td class="label">Anexo 6</td><td>Atividades com motocicleta</td></tr>
</table>

<div class="rpt-section">5. DESCRIÇÃO DAS ATIVIDADES</div>
${workstations.map(ws => `<div class="rpt-section3">${ws.name}</div>
<p>${ws.activity_description || ws.description || ws.tasks_performed || "Atividades operacionais"}</p>`).join("")}

<div class="rpt-section">6. CONCEITOS DAS FORMAS DE EXPOSIÇÃO</div>
<table class="rpt-table">
  <tr><th>Forma de Exposição</th><th>Definição</th></tr>
  <tr><td class="label">Permanente</td><td>Exposição diária, contínua e habitual ao agente perigoso</td></tr>
  <tr><td class="label">Intermitente</td><td>Exposição em períodos alternados, com interrupções durante a jornada</td></tr>
  <tr><td class="label">Eventual</td><td>Exposição fortuita, sem regularidade ou previsibilidade</td></tr>
</table>

<div class="rpt-section">7. FICHA DE PERÍCIA TÉCNICA</div>
${Array.from(sectorMap.entries()).map(([_, { sectorName, workstations: sectorWs }], gheIndex) => {
  return `<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} — ${sectorName.toUpperCase()}</div>
<table class="rpt-table">
  <tr><th>Função/Posto</th><th>Agente Perigoso</th><th>Enquadramento NR-16</th><th>Forma de Exposição</th><th>Periculosidade</th></tr>
  ${sectorWs.map(ws => {
    const wsRisks = risks.filter(r => {
      const a = ctx.analyses.find(a2 => a2.id === r.analysis_id);
      return a && a.workstation_id === ws.id;
    });
    if (wsRisks.length === 0) {
      return `<tr><td>${ws.name}</td><td colspan="4" style="text-align:center;">Atividades não enquadradas como perigosas</td></tr>`;
    }
    return wsRisks.map(r => `<tr><td>${ws.name}</td><td>${r.description}</td><td>A avaliar</td><td>Habitual</td><td>${r.risk_level === 'critical' ? '<span class="rpt-badge red">CARACTERIZADA (30%)</span>' : '<span class="rpt-badge green">NÃO CARACTERIZADA</span>'}</td></tr>`).join("");
  }).join("")}
</table>`;
}).join("")}

<div class="rpt-section">8. CONCLUSÃO E TERMO DE RESPONSABILIDADE</div>
<p>Com base na análise técnica realizada, conclui-se que as atividades e operações desenvolvidas na empresa <strong>${company.trade_name || company.name}</strong> foram avaliadas conforme NR-16 e legislação pertinente.</p>
<div class="rpt-callout">O laudo deve ser atualizado sempre que houver alteração nas condições de trabalho, processos ou introdução de novos agentes perigosos.</div>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== PCA ====================
function generatePCAReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const { consultant, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("PROGRAMA DE CONSERVAÇÃO AUDITIVA", "PCA", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. DADOS DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">2. INTRODUÇÃO</div>
<p>O Programa de Conservação Auditiva (PCA) é um conjunto de medidas coordenadas que visam prevenir ou estabilizar as perdas auditivas ocupacionais. Constitui-se em uma das medidas de controle dos riscos à saúde mais importantes para trabalhadores expostos a Níveis de Pressão Sonora Elevados (NPSE), em conformidade com a NR-07, NR-09 e NR-15.</p>

<div class="rpt-section">3. OBJETIVOS ESPECÍFICOS DO PCA</div>
<ul>
  <li>Identificar trabalhadores expostos a NPSE acima do nível de ação (80 dB(A))</li>
  <li>Estabelecer critérios audiométricos para monitoramento da audição</li>
  <li>Selecionar e controlar o uso adequado de Equipamentos de Proteção Auditiva (EPA)</li>
  <li>Reduzir ou eliminar a exposição a NPSE por meio de medidas de engenharia e administrativas</li>
  <li>Conscientizar os trabalhadores sobre os riscos e prevenção da PAIR</li>
</ul>

<div class="rpt-section">4. MECANISMO DA AUDIÇÃO</div>
<p>O aparelho auditivo humano é composto por ouvido externo (pavilhão auricular e canal auditivo), ouvido médio (tímpano e ossículos) e ouvido interno (cóclea). A exposição prolongada a níveis sonoros elevados pode causar danos irreversíveis às células ciliadas da cóclea, resultando em Perda Auditiva Induzida por Ruído (PAIR).</p>

<div class="rpt-section">5. DANOS PROVOCADOS PELO RUÍDO</div>
<table class="rpt-table">
  <tr><th class="teal">Tipo de Dano</th><th class="teal">Descrição</th></tr>
  <tr><td class="label">PAIR</td><td>Perda auditiva sensorioneural, bilateral, irreversível e progressiva</td></tr>
  <tr><td class="label">Zumbido (Tinnitus)</td><td>Percepção de som sem estímulo externo</td></tr>
  <tr><td class="label">Efeitos Extra-auditivos</td><td>Estresse, irritabilidade, distúrbios do sono, hipertensão, dificuldade de concentração</td></tr>
  <tr><td class="label">Trauma Acústico</td><td>Perda auditiva súbita por exposição a ruído de impacto (≥130 dB)</td></tr>
</table>

<div class="rpt-section">6. AVALIAÇÕES DA ÁREA DE TRABALHO</div>
${Array.from(sectorMap.entries()).map(([_, { sectorName, workstations: sectorWs }], gheIndex) => {
  return `<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} — ${sectorName.toUpperCase()}</div>
<table class="rpt-table">
  <tr><th>Função/Posto</th><th>Nível Ruído (dB(A))</th><th>LT NR-15</th><th>Nível Ação</th><th>EPA Recomendado</th><th>NRRsf (dB)</th></tr>
  ${sectorWs.map(ws => `<tr><td>${ws.name}</td><td>A avaliar</td><td>85 dB(A) / 8h</td><td>80 dB(A)</td><td>Protetor tipo concha/plug</td><td>A calcular</td></tr>`).join("")}
</table>`;
}).join("")}

<div class="rpt-section">7. PROTEÇÃO AUDITIVA INDIVIDUAL</div>
<div class="rpt-section3">Cálculo de Atenuação — NRRsf</div>
<p>O Nível de Ruído com Proteção (NRP) é calculado pela fórmula: <strong>NRP = NPS — NRRsf</strong>, onde NPS é o Nível de Pressão Sonora e NRRsf é o Nível de Redução de Ruído (simplificado) do protetor.</p>

<div class="rpt-section">8. CRITÉRIOS AUDIOMÉTRICOS</div>
<p>Conforme Portaria nº 19/1998, os exames audiométricos devem seguir os seguintes critérios:</p>
<table class="rpt-table">
  <tr><th>Critério</th><th>Descrição</th></tr>
  <tr><td class="label">Audiometria de Referência</td><td>Realizada na admissão, após repouso auditivo mínimo de 14 horas</td></tr>
  <tr><td class="label">Audiometria Sequencial</td><td>Semestral para expostos a ruído ≥ nível de ação</td></tr>
  <tr><td class="label">Desencadeamento de PAIR</td><td>Piora ≥10 dB na média (3000, 4000 e 6000 Hz) em relação à referência</td></tr>
  <tr><td class="label">Agravamento</td><td>Piora adicional ≥10 dB após diagnóstico de PAIR</td></tr>
</table>

<div class="rpt-section">9. AÇÕES EDUCATIVAS</div>
<ul>
  <li>Palestras de conscientização sobre riscos do ruído e uso correto de EPA</li>
  <li>Treinamento para colocação e retirada dos protetores auriculares</li>
  <li>Material informativo sobre prevenção de PAIR</li>
  <li>DDS (Diálogo Diário de Segurança) periódico sobre conservação auditiva</li>
</ul>

<div class="rpt-section">10. CRONOGRAMA DE ATIVIDADES</div>
<table class="rpt-table">
  <tr><th>Atividade</th><th>Jan-Mar</th><th>Abr-Jun</th><th>Jul-Set</th><th>Out-Dez</th></tr>
  <tr><td>Monitoramento Ambiental</td><td style="background:#C8E6C9;">✓</td><td></td><td style="background:#C8E6C9;">✓</td><td></td></tr>
  <tr><td>Audiometria Ocupacional</td><td style="background:#C8E6C9;">✓</td><td></td><td style="background:#C8E6C9;">✓</td><td></td></tr>
  <tr><td>Treinamento EPA</td><td style="background:#C8E6C9;">✓</td><td></td><td></td><td style="background:#C8E6C9;">✓</td></tr>
  <tr><td>Inspeção de EPAs</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td><td style="background:#C8E6C9;">✓</td></tr>
</table>

<div class="rpt-section">11. CONCLUSÃO</div>
<p>O PCA da empresa <strong>${company.trade_name || company.name}</strong> visa garantir a preservação da saúde auditiva dos trabalhadores expostos a NPSE, através de ações integradas de monitoramento, proteção e conscientização.</p>

<div class="rpt-section">ANEXOS</div>
<ul>
  <li>Anexo I — Certificados de Calibração (Dosímetro/Decibelímetro)</li>
  <li>Anexo II — Laudos de Audiometria</li>
  <li>Anexo III — Fichas de Entrega de EPA</li>
</ul>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== PPR ====================
function generatePPRReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const { consultant, sectorMap } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage("PROGRAMA DE PROTEÇÃO RESPIRATÓRIA", "PPR", company, consultant)}

${revisionTable()}

<div class="rpt-section">1. DADOS DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">2. OBJETIVO</div>
<p>Estabelecer diretrizes e procedimentos para a seleção, utilização, manutenção e controle de Equipamentos de Proteção Respiratória (EPR) na empresa <strong>${company.trade_name || company.name}</strong>, em conformidade com a IN SSST/MTE nº 01/1994, Portaria nº 672/2021 e NR-09.</p>

<div class="rpt-section">3. APLICAÇÃO</div>
<p>Este programa é aplicável a todas as atividades que exponham os trabalhadores a contaminantes atmosféricos (poeiras, fumos, névoas, gases e vapores) ou a atmosferas com deficiência de oxigênio.</p>

<div class="rpt-section">4. RESPONSABILIDADES</div>
<table class="rpt-table">
  <tr><th>Responsável</th><th>Atribuições</th></tr>
  <tr><td class="label">Administrador do PPR</td><td>Coordenar as atividades do programa, selecionar EPR adequados, manter registros</td></tr>
  <tr><td class="label">Empregador</td><td>Garantir implementação, fornecer EPR aprovados, treinar trabalhadores</td></tr>
  <tr><td class="label">Trabalhador</td><td>Usar EPR conforme orientação, inspecionar antes do uso, comunicar defeitos</td></tr>
  <tr><td class="label">SESMT</td><td>Monitorar exposições, avaliar eficácia dos EPR, acompanhar saúde respiratória</td></tr>
</table>

<div class="rpt-section">5. DOCUMENTOS DE REFERÊNCIA</div>
<ul>
  <li>IN SSST/MTE nº 01/1994 — Programa de Proteção Respiratória</li>
  <li>Portaria nº 672/2021 — Normas sobre EPR</li>
  <li>NR-06 — Equipamento de Proteção Individual</li>
  <li>NR-09 — Avaliação e Controle das Exposições Ocupacionais</li>
  <li>NR-15 — Atividades e Operações Insalubres</li>
  <li>ABNT/NBR 12543 — Equipamentos de Proteção Respiratória</li>
</ul>

<div class="rpt-section">6. DEFINIÇÕES</div>
<table class="rpt-table">
  <tr><th>Termo</th><th>Definição</th></tr>
  <tr><td class="label">EPR</td><td>Equipamento de Proteção Respiratória</td></tr>
  <tr><td class="label">FPA</td><td>Fator de Proteção Atribuído</td></tr>
  <tr><td class="label">IPVS</td><td>Imediatamente Perigoso à Vida ou à Saúde</td></tr>
  <tr><td class="label">PFF</td><td>Peça Facial Filtrante</td></tr>
  <tr><td class="label">LT</td><td>Limite de Tolerância</td></tr>
</table>

<div class="rpt-section">7. SELEÇÃO DE RESPIRADORES</div>
<div class="rpt-section3">7.1 Critérios de Seleção</div>
<p>A seleção do tipo de EPR deve considerar: natureza do contaminante (partículas, gases/vapores), concentração do contaminante, Limite de Tolerância (NR-15 ou ACGIH), Fator de Proteção necessário e condições de uso.</p>

<table class="rpt-table">
  <tr><th class="teal">Tipo de Contaminante</th><th class="teal">Tipo de EPR Recomendado</th><th class="teal">FPA Mínimo</th></tr>
  <tr><td>Poeiras e Névoas</td><td>PFF2 ou Peça facial + filtro P2</td><td>10</td></tr>
  <tr><td>Fumos Metálicos</td><td>PFF2/PFF3 ou Peça facial + filtro P3</td><td>10-50</td></tr>
  <tr><td>Gases e Vapores Orgânicos</td><td>Peça facial + filtro químico VO</td><td>10-50</td></tr>
  <tr><td>Gases Ácidos</td><td>Peça facial + filtro químico GA</td><td>10-50</td></tr>
  <tr><td>Atmosfera IPVS</td><td>Máscara autônoma ou linha de ar</td><td>1000+</td></tr>
</table>

<div class="rpt-section">8. DESCRIÇÃO DAS ATIVIDADES E RISCOS RESPIRATÓRIOS</div>
${Array.from(sectorMap.entries()).map(([_, { sectorName, workstations: sectorWs }], gheIndex) => {
  return `<div class="rpt-section2">GHE ${String(gheIndex + 1).padStart(2, '0')} — ${sectorName.toUpperCase()}</div>
<table class="rpt-table">
  <tr><th>Função/Posto</th><th>Contaminante</th><th>Concentração</th><th>LT</th><th>EPR Recomendado</th><th>FPA</th></tr>
  ${sectorWs.map(ws => `<tr><td>${ws.name}</td><td>A avaliar</td><td>A avaliar</td><td>NR-15/ACGIH</td><td>A definir conforme exposição</td><td>—</td></tr>`).join("")}
</table>`;
}).join("")}

<div class="rpt-section">9. TREINAMENTOS</div>
<ul>
  <li>Natureza dos contaminantes e riscos à saúde respiratória</li>
  <li>Seleção, uso, colocação e retirada correta do EPR</li>
  <li>Ensaio de vedação (qualitativo e quantitativo)</li>
  <li>Inspeção, higienização, manutenção e guarda do EPR</li>
  <li>Situações de emergência e procedimentos de fuga</li>
</ul>

<div class="rpt-section">10. MANUTENÇÃO, INSPEÇÃO E GUARDA</div>
<table class="rpt-table">
  <tr><th>Ação</th><th>Frequência</th><th>Responsável</th></tr>
  <tr><td>Inspeção Visual</td><td>Antes de cada uso</td><td>Trabalhador</td></tr>
  <tr><td>Higienização</td><td>Após cada uso</td><td>Trabalhador/SESMT</td></tr>
  <tr><td>Troca de Filtros</td><td>Conforme saturação ou prazo</td><td>SESMT</td></tr>
  <tr><td>Ensaio de Vedação</td><td>Anual ou na troca de modelo</td><td>SESMT</td></tr>
</table>

<div class="rpt-section">11. PREVENÇÃO DE PNEUMOCONIOSE</div>
<p>Especial atenção deve ser dada à prevenção de pneumoconioses (silicose, asbestose, siderose), através do monitoramento contínuo da exposição, uso adequado de EPR e exames periódicos (espirometria e Rx de tórax).</p>

<div class="rpt-section">12. CRONOGRAMA DE AÇÃO</div>
<table class="rpt-table">
  <tr><th>Atividade</th><th>Jan-Mar</th><th>Abr-Jun</th><th>Jul-Set</th><th>Out-Dez</th></tr>
  <tr><td>Avaliação Ambiental</td><td style="background:#C8E6C9;">✓</td><td></td><td style="background:#C8E6C9;">✓</td><td></td></tr>
  <tr><td>Treinamento EPR</td><td style="background:#C8E6C9;">✓</td><td></td><td></td><td style="background:#C8E6C9;">✓</td></tr>
  <tr><td>Ensaio de Vedação</td><td style="background:#C8E6C9;">✓</td><td></td><td></td><td></td></tr>
  <tr><td>Exames Complementares</td><td style="background:#C8E6C9;">✓</td><td></td><td style="background:#C8E6C9;">✓</td><td></td></tr>
</table>

<div class="rpt-section">13. ENCERRAMENTO</div>
<p>O presente PPR da empresa <strong>${company.trade_name || company.name}</strong> estabelece as diretrizes para proteção respiratória dos trabalhadores, devendo ser revisado anualmente ou sempre que houver alteração nas condições de exposição.</p>

<div class="rpt-section">ANEXOS</div>
<ul>
  <li>Anexo 1 — Avaliação dos Riscos Respiratórios</li>
  <li>Anexo 2 — Tipos de Respiradores</li>
  <li>Anexo 3 — Fatores de Proteção Atribuídos</li>
  <li>Anexo 4 — Ensaio de Vedação da Máscara</li>
  <li>Anexo 5 — Certificados de Aprovação (CA) dos EPRs</li>
</ul>

${signatureBlock(consultant)}
${footer()}`;
}

// ==================== GENERIC FALLBACK ====================
function generateGenericReport(ctx: ReportContext): string {
  const { company, workstations, analyses, reportType } = ctx;
  const { consultant, risks, actions } = getCtxData(ctx);

  return `${sharedStyles()}
${coverPage(reportType, reportType, company, consultant)}

<div class="rpt-section">1. IDENTIFICAÇÃO DA EMPRESA</div>
${companyDataTable(company)}

<div class="rpt-section">2. ANÁLISES REALIZADAS</div>
${analyses.length > 0 ? `<table class="rpt-table">
  <tr><th>Posto</th><th>Método</th><th>Score</th><th>Observações</th></tr>
  ${analyses.map(a => {
    const ws = workstations.find(w => w.id === a.workstation_id);
    return `<tr><td>${ws?.name || "—"}</td><td>${a.method}</td><td>${a.score}</td><td>${a.notes}</td></tr>`;
  }).join("")}
</table>` : "<p>Nenhuma análise realizada.</p>"}

<div class="rpt-section">3. RISCOS IDENTIFICADOS</div>
${risks.length > 0 ? `<table class="rpt-table">
  <tr><th>Descrição</th><th>Score</th><th>Nível</th></tr>
  ${risks.map(r => `<tr><td>${r.description}</td><td>${r.risk_score}</td><td>${riskLevelLabel(r.risk_level)}</td></tr>`).join("")}
</table>` : "<p>Nenhum risco identificado.</p>"}

<div class="rpt-section">4. RECOMENDAÇÕES</div>
${actions.length > 0 ? actions.map(ap => `<p>• ${ap.description} (${ap.responsible} — ${ap.deadline})</p>`).join("") : "<p>Sem recomendações.</p>"}

${signatureBlock(consultant)}
${footer()}`;
}
