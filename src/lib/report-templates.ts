import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, ReportType } from "./types";
import { mockRiskAssessments, mockActionPlans } from "./mock-data";
import { riskLevelLabel, statusLabel } from "./types";

interface ReportContext {
  company: Company;
  sector?: Sector;
  workstation?: Workstation;
  workstations: Workstation[];
  analyses: Analysis[];
  photos: PosturePhoto[];
  reportType: ReportType;
}

export function generateReportHTML(ctx: ReportContext): string {
  const { company, sector, workstation, workstations, analyses, photos, reportType } = ctx;
  const wsIds = workstations.map((w) => w.id);
  const analysisIds = analyses.map((a) => a.id);
  const risks = mockRiskAssessments.filter((r) => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter((ap) => risks.some((r) => r.id === ap.risk_assessment_id));
  const methods = [...new Set(analyses.map((a) => a.method))].join(", ") || "N/A";
  const title = reportType === "PGR"
    ? `Programa de Gerenciamento de Riscos - ${company.name}`
    : reportType === "AET"
      ? `Análise Ergonômica do Trabalho - ${workstation?.name || sector?.name || company.name}`
      : `Avaliação Ergonômica Preliminar - ${workstation?.name || sector?.name || company.name}`;

  return `
<h1 style="text-align:center">${title}</h1>
<p style="text-align:center"><strong>${reportType}</strong> — Emitido em ${new Date().toLocaleDateString("pt-BR")}</p>
<hr>

<h2>1. Capa</h2>
<p><strong>Empresa:</strong> ${company.name}</p>
<p><strong>CNPJ:</strong> ${company.cnpj}</p>
<p><strong>Endereço:</strong> ${company.address}</p>
${sector ? `<p><strong>Setor:</strong> ${sector.name}</p>` : ""}
${workstation ? `<p><strong>Posto de Trabalho:</strong> ${workstation.name}</p>` : ""}
<p><strong>Documento:</strong> ${reportType}</p>
<hr>

<h2>2. Introdução</h2>
<p>Este documento apresenta ${reportType === "PGR" ? "o Programa de Gerenciamento de Riscos" : reportType === "AET" ? "a Análise Ergonômica do Trabalho" : "a Avaliação Ergonômica Preliminar"} realizada na empresa ${company.name}, conforme as normas regulamentadoras vigentes (NR-17, NR-01). A análise contempla a avaliação das condições ergonômicas dos postos de trabalho, identificação de riscos e proposição de medidas corretivas.</p>
<hr>

<h2>3. Objetivos</h2>
<ul>
  <li>Identificar e avaliar os riscos ergonômicos nos postos de trabalho</li>
  <li>Classificar os riscos utilizando métodos ergonômicos validados</li>
  <li>Propor recomendações de melhoria baseadas em evidências</li>
  <li>Atender às exigências legais e normativas de segurança do trabalho</li>
</ul>
<hr>

<h2>4. Metodologia</h2>
<p>As avaliações ergonômicas foram realizadas utilizando os seguintes métodos: <strong>${methods}</strong>. Foram coletadas <strong>${photos.length}</strong> fotografias de posturas para documentação e análise biomecânica. A detecção de posturas foi realizada com auxílio de inteligência artificial (MoveNet) para cálculo preciso dos ângulos articulares.</p>
<hr>

<h2>5. Caracterização da Empresa</h2>
<p><strong>Razão Social:</strong> ${company.name}</p>
<p><strong>CNPJ:</strong> ${company.cnpj}</p>
<p><strong>Endereço:</strong> ${company.address}</p>
<p><strong>Descrição:</strong> ${company.description}</p>
<hr>

<h2>6. Descrição dos Postos de Trabalho</h2>
${workstations.map((ws) => `
<h3>${ws.name}</h3>
<p><strong>Descrição:</strong> ${ws.description}</p>
<p><strong>Tarefas realizadas:</strong> ${ws.tasks_performed}</p>
`).join("")}
<hr>

<h2>7. Análise Postural</h2>
${photos.length > 0 ? `<p><strong>Posturas registradas (${photos.length} imagens):</strong></p>
<ul>${photos.map((p) => `<li><strong>${p.posture_type}</strong> — ${p.notes} (${p.created_at})</li>`).join("")}</ul>` : "<p>Nenhuma postura registrada.</p>"}

${analyses.length > 0 ? `<p><strong>Resultados das análises:</strong></p>
${analyses.map((a) => {
    const ws = workstations.find((w) => w.id === a.workstation_id);
    return `<p><strong>${ws?.name || "—"}</strong> — Método: ${a.method}, Score: ${a.score}. ${a.notes}</p>`;
  }).join("")}` : "<p>Nenhuma análise realizada.</p>"}
<hr>

<h2>8. Avaliação de Riscos</h2>
${risks.length > 0 ? `<table>
<thead><tr><th>Descrição</th><th>P × E × C</th><th>Score</th><th>Nível</th></tr></thead>
<tbody>
${risks.map((r) => `<tr><td>${r.description}</td><td>${r.probability} × ${r.exposure} × ${r.consequence}</td><td>${r.risk_score}</td><td>${riskLevelLabel(r.risk_level)}</td></tr>`).join("")}
</tbody></table>` : "<p>Nenhum risco avaliado.</p>"}
<hr>

<h2>9. Recomendações</h2>
${actions.length > 0 ? `<table>
<thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead>
<tbody>
${actions.map((ap) => `<tr><td>${ap.description}</td><td>${ap.responsible}</td><td>${ap.deadline}</td><td>${statusLabel(ap.status)}</td></tr>`).join("")}
</tbody></table>` : "<p>Nenhuma recomendação registrada.</p>"}
<hr>

<h2>10. Conclusão</h2>
<p>Este relatório apresenta a avaliação ergonômica dos postos de trabalho analisados na empresa ${company.name}. Foram identificados ${risks.length} risco(s) e propostas ${actions.length} ação(ões) corretiva(s). As recomendações devem ser implementadas conforme os prazos estabelecidos para garantir a conformidade com as normas regulamentadoras e a saúde dos trabalhadores.</p>
<hr>
<p style="text-align:center"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
<p style="text-align:center"><em>Este relatório deve ser revisado pelo profissional responsável antes da validação.</em></p>
`;
}
