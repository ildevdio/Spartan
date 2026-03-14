import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, ReportType, Task, PsychosocialAnalysis } from "./types";
import { mockRiskAssessments, mockActionPlans, mockTasks, mockPsychosocialAnalyses } from "./mock-data";
import { riskLevelLabel, statusLabel } from "./types";

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

export function generateReportHTML(ctx: ReportContext): string {
  const { reportType } = ctx;
  if (reportType === "AET") return generateAETReport(ctx);
  if (reportType === "PGR") return generatePGRReport(ctx);
  return generateGenericReport(ctx);
}

function generateAETReport(ctx: ReportContext): string {
  const { company, sector, workstation, workstations, analyses, photos } = ctx;
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

  return `
<div style="text-align:center; padding: 60px 40px; border: 2px solid #1e293b;">
  <h1 style="font-size: 28px; margin-bottom: 8px; color: #1e293b;">ANÁLISE ERGONÔMICA DO TRABALHO</h1>
  <h2 style="font-size: 20px; color: #475569; margin-bottom: 40px;">AET</h2>
  <p style="font-size: 24px; font-weight: bold; color: #1e293b;">${company.name}</p>
  <p style="font-size: 14px; color: #64748b;">CNPJ: ${company.cnpj}</p>
  <p style="font-size: 14px; color: #64748b; margin-bottom: 40px;">${company.address} — ${company.city}/${company.state}</p>
  <p style="font-size: 14px; color: #64748b;">Emissão: ${getToday()}</p>
  <p style="font-size: 14px; color: #64748b;">Revisão: 00</p>
  <p style="font-size: 14px; color: #475569; margin-top: 40px;"><strong>Responsável Técnico:</strong> ${consultant}</p>
  <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div>
<div style="page-break-after: always;"></div>

<h2>ÍNDICE</h2>
<ol style="font-size: 14px; line-height: 2;">
  <li>Introdução</li>
  <li>Identificação e Caracterização da Empresa</li>
  <li>Objetivos</li>
  <li>Referências Normativas</li>
  <li>Análise da Demanda e do Funcionamento da Organização</li>
  <li>Referencial Teórico</li>
  <li>Estudo Ergonômico do Trabalho</li>
  <li>Definição de Métodos, Técnicas e Ferramentas</li>
  <li>Agrupamento por GHE e Matriz de Avaliação Ergonômica</li>
  <li>Análise dos Riscos Psicossociais</li>
  <li>Responsabilidade Técnica</li>
</ol>
<div style="page-break-after: always;"></div>

<h2>1. INTRODUÇÃO</h2>
<p>Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana.</p>
<p>A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa. Em qualquer ambiente, pode-se compreender a atividade como um sistema que integra pessoas, máquinas e o meio ao redor. Quando esse sistema opera em condições inadequadas, surgem desconfortos imediatos, fadiga e até lesões ao longo do tempo.</p>
<p>Locais de trabalho planejados de forma incorreta tendem a reduzir o desempenho, comprometer a qualidade, elevar o absenteísmo e aumentar custos operacionais. A ergonomia busca tornar a interação entre trabalhador, equipamentos e ambiente o mais segura, eficiente e confortável possível.</p>
<p>Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho.</p>
<hr>

<h2>2. IDENTIFICAÇÃO E CARACTERIZAÇÃO DA EMPRESA</h2>
<table style="width:100%; border-collapse: collapse;">
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 200px;">Razão Social</td><td style="border: 1px solid #ddd; padding: 8px;">${company.name}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">CNPJ</td><td style="border: 1px solid #ddd; padding: 8px;">${company.cnpj}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Endereço</td><td style="border: 1px solid #ddd; padding: 8px;">${company.address}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Cidade/UF</td><td style="border: 1px solid #ddd; padding: 8px;">${company.city}/${company.state}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Descrição</td><td style="border: 1px solid #ddd; padding: 8px;">${company.description}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Setor Avaliado</td><td style="border: 1px solid #ddd; padding: 8px;">${sectorName}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Posto(s) de Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">${wsName}</td></tr>
</table>
<hr>

<h2>3. OBJETIVOS</h2>
<p>O presente documento tem por objetivo:</p>
<ul>
  <li>Realizar a Análise Ergonômica do Trabalho (AET) conforme as diretrizes da NR-17;</li>
  <li>Identificar e avaliar os riscos ergonômicos nos postos de trabalho analisados;</li>
  <li>Classificar os riscos utilizando métodos ergonômicos validados internacionalmente;</li>
  <li>Propor recomendações de melhoria baseadas em evidências científicas;</li>
  <li>Atender às exigências legais e normativas de segurança e saúde do trabalho;</li>
  <li>Contribuir para a melhoria contínua das condições de trabalho na organização.</li>
</ul>
<hr>

<h2>4. REFERÊNCIAS NORMATIVAS</h2>
<p>Este trabalho foi elaborado com base nas seguintes normas e legislações:</p>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Norma</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descrição</th></tr></thead>
  <tbody>
    <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>NR-17</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Ergonomia — Estabelece parâmetros que permitem a adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores</td></tr>
    <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>NR-01</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Disposições Gerais e Gerenciamento de Riscos Ocupacionais — Programa de Gerenciamento de Riscos (PGR)</td></tr>
    <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>ISO 11228</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Ergonomia — Movimentação manual de cargas</td></tr>
    <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>ISO 11226</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Ergonomia — Avaliação de posturas de trabalho estáticas</td></tr>
    <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>CLT Art. 157-158</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Obrigações do empregador e empregados quanto à segurança do trabalho</td></tr>
  </tbody>
</table>
<hr>

<h2>5. ANÁLISE DA DEMANDA E DO FUNCIONAMENTO DA ORGANIZAÇÃO</h2>
<p>A empresa <strong>${company.name}</strong> opera no segmento de ${company.description.toLowerCase()}. A organização do trabalho foi avaliada considerando a estrutura setorial, distribuição de tarefas, jornada de trabalho e ritmo de produção.</p>
${workstations.map(ws => {
  const wsTasks = tasks.filter(t => t.workstation_id === ws.id);
  return `
<h3>Posto: ${ws.name}</h3>
<p><strong>Descrição da atividade:</strong> ${ws.activity_description || ws.description}</p>
<p><strong>Tarefas executadas:</strong></p>
<ul>${wsTasks.map(t => `<li>${t.description}</li>`).join("") || `<li>${ws.tasks_performed}</li>`}</ul>`;
}).join("")}
<hr>

<h2>6. REFERENCIAL TEÓRICO</h2>
<p>A Ergonomia, segundo a International Ergonomics Association (IEA), é a disciplina científica que trata da compreensão das interações entre seres humanos e outros elementos de um sistema, aplicando teorias, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema.</p>
<p>A análise ergonômica do trabalho (AET) é uma metodologia que permite compreender o trabalho real, indo além da tarefa prescrita. Através da observação sistemática, registro fotográfico e utilização de ferramentas validadas, busca-se identificar as exigências biomecânicas, cognitivas e organizacionais impostas aos trabalhadores.</p>
<h3>Principais conceitos aplicados:</h3>
<ul>
  <li><strong>Ergonomia Física:</strong> Características anatômicas, antropométricas, fisiológicas e biomecânicas relacionadas à atividade física</li>
  <li><strong>Ergonomia Cognitiva:</strong> Processos mentais como percepção, memória, raciocínio e resposta motora</li>
  <li><strong>Ergonomia Organizacional:</strong> Otimização de sistemas sociotécnicos, estruturas organizacionais, políticas e processos</li>
</ul>
<hr>

<h2>7. ESTUDO ERGONÔMICO DO TRABALHO</h2>
<h3>7.1 Registro Postural</h3>
${photos.length > 0 ? `<p>Foram registradas <strong>${photos.length}</strong> posturas de trabalho para documentação e análise biomecânica:</p>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Postura</th><th style="border: 1px solid #ddd; padding: 8px;">Descrição</th><th style="border: 1px solid #ddd; padding: 8px;">Data</th></tr></thead>
<tbody>
${photos.map(p => `<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>${p.posture_type}</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${p.notes}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.created_at}</td></tr>`).join("")}
</tbody></table>` : "<p>Nenhuma postura registrada.</p>"}

<h3>7.2 Análises Ergonômicas</h3>
${analyses.length > 0 ? `<p>As análises foram realizadas utilizando os métodos: <strong>${methods}</strong>.</p>
${analyses.map(a => {
  const ws = workstations.find(w => w.id === a.workstation_id);
  const risk = risks.find(r => r.analysis_id === a.id);
  return `
<table style="width:100%; border-collapse: collapse; margin-bottom: 16px;">
  <tr style="background: #f1f5f9;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${ws?.name || "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; width: 200px;"><strong>Método</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${a.method}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Score</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${a.score}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Nível de Risco</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${risk ? riskLevelLabel(risk.risk_level) : "N/A"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Observações</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${a.notes}</td></tr>
</table>`;
}).join("")}` : "<p>Nenhuma análise realizada.</p>"}
<hr>

<h2>8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS</h2>
<p>Para a avaliação ergonômica dos postos de trabalho, foram utilizados os seguintes métodos:</p>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Método</th><th style="border: 1px solid #ddd; padding: 8px;">Aplicação</th><th style="border: 1px solid #ddd; padding: 8px;">Classificação</th></tr></thead>
<tbody>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>REBA</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Avaliação rápida do corpo inteiro</td><td style="border: 1px solid #ddd; padding: 8px;">1-3: Baixo | 4-7: Médio | 8-10: Alto | 11+: Muito Alto</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>RULA</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Avaliação rápida de membros superiores</td><td style="border: 1px solid #ddd; padding: 8px;">1-2: Aceitável | 3-4: Investigar | 5-6: Mudar breve | 7: Mudar já</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>ROSA</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Avaliação de postos informatizados</td><td style="border: 1px solid #ddd; padding: 8px;">1-2: Desprezível | 3-4: Baixo | 5-6: Médio | 7+: Alto</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>OWAS</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Sistema de análise de posturas</td><td style="border: 1px solid #ddd; padding: 8px;">1: Normal | 2: Leve | 3: Severo | 4: Muito severo</td></tr>
</tbody>
</table>
<p>A detecção de posturas foi realizada com auxílio de inteligência artificial (BlazePose/MediaPipe) para cálculo preciso dos ângulos articulares, com filtragem de confiança mínima de 0.35 e suavização temporal de 5 frames.</p>
<hr>

<h2>9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA</h2>
<p>Os trabalhadores foram agrupados por Grupos Homogêneos de Exposição (GHE), considerando as atividades realizadas, posturas adotadas e riscos identificados.</p>
${risks.length > 0 ? `
<h3>Matriz de Risco Ergonômico</h3>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;">
  <th style="border: 1px solid #ddd; padding: 8px;">GHE/Posto</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Risco Identificado</th>
  <th style="border: 1px solid #ddd; padding: 8px;">P × E × C</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Score</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Nível</th>
</tr></thead>
<tbody>
${risks.map((r, i) => {
  const analysis = analyses.find(a => a.id === r.analysis_id);
  const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
  return `<tr>
    <td style="border: 1px solid #ddd; padding: 8px;">${ws?.name || `GHE ${i + 1}`}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">${r.description}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">${r.probability} × ${r.exposure} × ${r.consequence}</td>
    <td style="border: 1px solid #ddd; padding: 8px;"><strong>${r.risk_score}</strong></td>
    <td style="border: 1px solid #ddd; padding: 8px;"><strong>${riskLevelLabel(r.risk_level)}</strong></td>
  </tr>`;
}).join("")}
</tbody></table>

<h3>Plano de Ação</h3>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;">
  <th style="border: 1px solid #ddd; padding: 8px;">Ação Corretiva</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Responsável</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Prazo</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
</tr></thead>
<tbody>
${actions.map(ap => `<tr>
  <td style="border: 1px solid #ddd; padding: 8px;">${ap.description}</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${ap.responsible}</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${ap.deadline}</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${statusLabel(ap.status)}</td>
</tr>`).join("")}
</tbody></table>` : "<p>Nenhum risco avaliado.</p>"}
<hr>

<h2>10. ANÁLISE DOS RISCOS PSICOSSOCIAIS</h2>
${psychosocial.length > 0 ? psychosocial.map(psa => `
<h3>Avaliação Psicossocial${psa.workstation_id ? ` — ${workstations.find(w => w.id === psa.workstation_id)?.name || ""}` : ""}</h3>
<p><strong>Avaliador:</strong> ${psa.evaluator_name}</p>

${psa.nasa_tlx_details ? `
<h4>NASA-TLX (Índice de Carga de Trabalho)</h4>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Dimensão</th><th style="border: 1px solid #ddd; padding: 8px;">Score (0-100)</th></tr></thead>
<tbody>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Mental</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.mental_demand}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Física</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.physical_demand}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Temporal</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.temporal_demand}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Performance</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.performance}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Esforço</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.effort}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Frustração</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.nasa_tlx_details.frustration}</td></tr>
  <tr style="background: #f1f5f9;"><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Score Geral</td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${psa.nasa_tlx_score}</td></tr>
</tbody></table>` : ""}

${psa.hse_it_details ? `
<h4>HSE-IT (Indicadores de Estresse Ocupacional)</h4>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Dimensão</th><th style="border: 1px solid #ddd; padding: 8px;">Score (1-5)</th></tr></thead>
<tbody>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demandas</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.demands}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Controle</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.control}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Suporte</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.support}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Relacionamentos</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.relationships}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Papel</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.role}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Mudança</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.hse_it_details.change}</td></tr>
  <tr style="background: #f1f5f9;"><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Score Geral</td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${psa.hse_it_score}</td></tr>
</tbody></table>` : ""}

${psa.copenhagen_details ? `
<h4>Copenhagen Psychosocial Questionnaire (COPSOQ)</h4>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Dimensão</th><th style="border: 1px solid #ddd; padding: 8px;">Score (0-100)</th></tr></thead>
<tbody>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demandas Quantitativas</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.quantitative_demands}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Ritmo de Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.work_pace}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demandas Cognitivas</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.cognitive_demands}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Demandas Emocionais</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.emotional_demands}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Influência no Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.influence}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Possibilidades de Desenvolvimento</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.possibilities_development}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Significado do Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.meaning_work}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Compromisso</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.commitment}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Previsibilidade</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.predictability}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;">Suporte Social</td><td style="border: 1px solid #ddd; padding: 8px;">${psa.copenhagen_details.social_support}</td></tr>
  <tr style="background: #f1f5f9;"><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Score Geral</td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${psa.copenhagen_score}</td></tr>
</tbody></table>` : ""}

<p><strong>Observações:</strong> ${psa.observations}</p>
`).join("<hr>") : `<p>Nenhuma avaliação psicossocial realizada para esta empresa. Recomenda-se a aplicação dos questionários NASA-TLX, HSE-IT e Copenhagen Psychosocial Questionnaire para uma avaliação completa dos fatores psicossociais do trabalho.</p>`}
<hr>

<h2>11. RESPONSABILIDADE TÉCNICA</h2>
<table style="width:100%; border-collapse: collapse;">
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Responsável Técnico</td><td style="border: 1px solid #ddd; padding: 8px;">${consultant}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Empresa</td><td style="border: 1px solid #ddd; padding: 8px;">MG Consultoria — Ergonomia & Segurança do Trabalho</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Data de Emissão</td><td style="border: 1px solid #ddd; padding: 8px;">${getToday()}</td></tr>
</table>
<br>
<div style="text-align: center; margin-top: 60px;">
  <p>_____________________________________________</p>
  <p><strong>${consultant}</strong></p>
  <p>Engenheiro de Segurança do Trabalho</p>
  <p>CREA/CONFEA: XXXXX</p>
</div>
<br>
<p style="text-align:center; font-size: 11px; color: #94a3b8;"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
<p style="text-align:center; font-size: 11px; color: #94a3b8;"><em>Este relatório deve ser revisado e assinado pelo profissional responsável antes da validação.</em></p>
`;
}

function generatePGRReport(ctx: ReportContext): string {
  const { company, workstations, analyses, photos } = ctx;
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));

  return `
<div style="text-align:center; padding: 60px 40px; border: 2px solid #1e293b;">
  <h1 style="font-size: 28px; color: #1e293b;">PROGRAMA DE GERENCIAMENTO DE RISCOS</h1>
  <h2 style="font-size: 20px; color: #475569;">PGR</h2>
  <p style="font-size: 24px; font-weight: bold; color: #1e293b;">${company.name}</p>
  <p style="font-size: 14px; color: #64748b;">CNPJ: ${company.cnpj}</p>
  <p style="font-size: 14px; color: #64748b;">${company.city}/${company.state}</p>
  <p style="font-size: 14px; color: #64748b; margin-top: 20px;">Emissão: ${getToday()}</p>
</div>
<hr>
<h2>1. Identificação da Empresa</h2>
<p><strong>Razão Social:</strong> ${company.name}</p>
<p><strong>CNPJ:</strong> ${company.cnpj}</p>
<p><strong>Endereço:</strong> ${company.address} — ${company.city}/${company.state}</p>
<hr>
<h2>2. Inventário de Riscos</h2>
${risks.map((r, i) => {
  const analysis = analyses.find(a => a.id === r.analysis_id);
  const ws = analysis ? workstations.find(w => w.id === analysis.workstation_id) : null;
  return `<p><strong>GHE ${i + 1} — ${ws?.name || "—"}:</strong> ${r.description} (Score: ${r.risk_score} — ${riskLevelLabel(r.risk_level)})</p>`;
}).join("")}
<hr>
<h2>3. Plano de Ação</h2>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Ação</th><th style="border: 1px solid #ddd; padding: 8px;">Responsável</th><th style="border: 1px solid #ddd; padding: 8px;">Prazo</th><th style="border: 1px solid #ddd; padding: 8px;">Status</th></tr></thead>
<tbody>${actions.map(ap => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${ap.description}</td><td style="border: 1px solid #ddd; padding: 8px;">${ap.responsible}</td><td style="border: 1px solid #ddd; padding: 8px;">${ap.deadline}</td><td style="border: 1px solid #ddd; padding: 8px;">${statusLabel(ap.status)}</td></tr>`).join("")}</tbody>
</table>
<hr>
<p style="text-align:center"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
`;
}

function generateGenericReport(ctx: ReportContext): string {
  const { company, sector, workstation, workstations, analyses, photos, reportType } = ctx;
  const wsIds = workstations.map(w => w.id);
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const title = `${reportType} — ${company.name}`;

  return `
<h1 style="text-align:center">${title}</h1>
<p style="text-align:center"><strong>${reportType}</strong> — Emitido em ${getToday()}</p>
<hr>
<h2>Identificação da Empresa</h2>
<p><strong>Razão Social:</strong> ${company.name}</p>
<p><strong>CNPJ:</strong> ${company.cnpj}</p>
<p><strong>Endereço:</strong> ${company.address} — ${company.city}/${company.state}</p>
${sector ? `<p><strong>Setor:</strong> ${sector.name}</p>` : ""}
${workstation ? `<p><strong>Posto de Trabalho:</strong> ${workstation.name}</p>` : ""}
<hr>
<h2>Análises Realizadas</h2>
${analyses.map(a => {
  const ws = workstations.find(w => w.id === a.workstation_id);
  return `<p><strong>${ws?.name || "—"}</strong> — ${a.method}, Score: ${a.score}. ${a.notes}</p>`;
}).join("") || "<p>Nenhuma análise.</p>"}
<hr>
<h2>Riscos Identificados</h2>
${risks.length > 0 ? `<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Descrição</th><th style="border: 1px solid #ddd; padding: 8px;">Score</th><th style="border: 1px solid #ddd; padding: 8px;">Nível</th></tr></thead>
<tbody>${risks.map(r => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${r.description}</td><td style="border: 1px solid #ddd; padding: 8px;">${r.risk_score}</td><td style="border: 1px solid #ddd; padding: 8px;">${riskLevelLabel(r.risk_level)}</td></tr>`).join("")}</tbody></table>` : "<p>Nenhum risco.</p>"}
<hr>
<h2>Recomendações</h2>
${actions.length > 0 ? actions.map(ap => `<p>• ${ap.description} (${ap.responsible} — ${ap.deadline})</p>`).join("") : "<p>Sem recomendações.</p>"}
<hr>
<p style="text-align:center"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
`;
}
