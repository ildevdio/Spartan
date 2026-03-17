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
  if (reportType === "APR") return generateAPRReport(ctx);
  if (reportType === "PCMSO") return generatePCMSOReport(ctx);
  return generateGenericReport(ctx);
}

function vividStyles() {
  return `
    <style>
      .rpt-cover { text-align:center; padding:60px 40px; background: linear-gradient(135deg, #0A1F44 0%, #1565C0 50%, #00838F 100%); color:white; border-radius:8px; margin-bottom:30px; }
      .rpt-cover h1 { font-size:32px; margin-bottom:8px; color:white; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
      .rpt-cover h2 { font-size:22px; color:#B2EBF2; margin-bottom:30px; }
      .rpt-cover .company { font-size:26px; font-weight:bold; color:white; }
      .rpt-cover .meta { font-size:14px; color:#B2EBF2; }
      .rpt-section { background: linear-gradient(90deg, #0A1F44, #1565C0); color:white; padding:12px 20px; margin:30px 0 15px 0; border-radius:6px; font-size:18px; font-weight:bold; }
      .rpt-section2 { background: linear-gradient(90deg, #1565C0, #00838F); color:white; padding:10px 18px; margin:24px 0 12px 0; border-radius:5px; font-size:16px; font-weight:bold; }
      .rpt-section3 { border-left:5px solid #00BCD4; padding:8px 14px; margin:20px 0 10px 0; font-size:15px; font-weight:bold; color:#0A1F44; background:#E1F5FE; border-radius:0 5px 5px 0; }
      .rpt-callout { border-left:5px solid #1565C0; background:#E3F2FD; padding:12px 16px; margin:12px 0; border-radius:0 6px 6px 0; font-style:italic; color:#0A1F44; }
      .rpt-callout.warning { border-left-color:#FF6F00; background:#FFF3E0; }
      .rpt-callout.success { border-left-color:#43A047; background:#C8E6C9; }
      .rpt-callout.danger { border-left-color:#D32F2F; background:#FFCDD2; }
      .rpt-table { width:100%; border-collapse:collapse; margin:12px 0; border-radius:6px; overflow:hidden; }
      .rpt-table th { background:#0A1F44; color:white; padding:10px 12px; font-size:13px; text-align:left; border:1px solid #0A1F44; }
      .rpt-table th.alt { background:#1565C0; border-color:#1565C0; }
      .rpt-table th.teal { background:#00838F; border-color:#00838F; }
      .rpt-table td { padding:9px 12px; font-size:13px; border:1px solid #B0BEC5; }
      .rpt-table tr:nth-child(even) td { background:#E3F2FD; }
      .rpt-table td.label { background:#E1F5FE; font-weight:bold; color:#1565C0; }
      .rpt-badge { display:inline-block; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:bold; }
      .rpt-badge.green { background:#C8E6C9; color:#1B5E20; }
      .rpt-badge.yellow { background:#FFF9C4; color:#F57F17; }
      .rpt-badge.orange { background:#FFE0B2; color:#E65100; }
      .rpt-badge.red { background:#FFCDD2; color:#B71C1C; }
      .rpt-divider { height:4px; background: linear-gradient(90deg, #00BCD4, #1565C0, #0A1F44); margin:20px 0; border-radius:2px; }
      .rpt-sig { text-align:center; margin-top:50px; padding-top:20px; border-top:2px solid #B0BEC5; }
    </style>
  `;
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
  <img src="/mg-consult-logo.png" alt="MG Consult" style="height: 60px; margin-bottom: 20px;" onerror="this.style.display='none'" />
  <h1 style="font-size: 28px; margin-bottom: 8px; color: #1e293b;">ANÁLISE ERGONÔMICA DO TRABALHO</h1>
  <h2 style="font-size: 20px; color: #475569; margin-bottom: 40px;">AET</h2>
  <p style="font-size: 24px; font-weight: bold; color: #1e293b;">${company.trade_name || company.name}</p>
  <p style="font-size: 14px; color: #64748b;">CNPJ: ${company.cnpj}</p>
  <p style="font-size: 16px; color: #64748b; margin-top: 30px;">${new Date().getFullYear()}</p>
  <p style="font-size: 11px; color: #94a3b8; margin-top: 40px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div>
<div style="page-break-after: always;"></div>

<h2>ÍNDICE</h2>
<table style="width:100%; border-collapse: collapse; font-size: 14px;">
  <tr><td style="padding: 6px 0;">1. Introdução</td><td style="text-align:right; padding: 6px 0;">2</td></tr>
  <tr><td style="padding: 6px 0;">2. Dados da Empresa</td><td style="text-align:right; padding: 6px 0;">4</td></tr>
  <tr><td style="padding: 6px 0;">3. Objetivos</td><td style="text-align:right; padding: 6px 0;">5</td></tr>
  <tr><td style="padding: 6px 0;">4. Referências Normativas</td><td style="text-align:right; padding: 6px 0;">5</td></tr>
  <tr><td style="padding: 6px 0;">5. Análise da Demanda e do Funcionamento da Organização</td><td style="text-align:right; padding: 6px 0;">6</td></tr>
  <tr><td style="padding: 6px 0;">6. Referencial Teórico</td><td style="text-align:right; padding: 6px 0;">7</td></tr>
  <tr><td style="padding: 6px 0;">7. Estudo Ergonômico do Trabalho</td><td style="text-align:right; padding: 6px 0;">9</td></tr>
  <tr><td style="padding: 6px 0;">8. Definição de Métodos, Técnicas e Ferramentas</td><td style="text-align:right; padding: 6px 0;">10</td></tr>
  <tr><td style="padding: 6px 0;">9. Agrupamento por GHE e Matriz de Avaliação Ergonômica</td><td style="text-align:right; padding: 6px 0;">12</td></tr>
  <tr><td style="padding: 6px 0;">10. Análise dos Riscos Psicossociais</td><td style="text-align:right; padding: 6px 0;">14</td></tr>
  <tr><td style="padding: 6px 0;">11. Responsabilidade Técnica</td><td style="text-align:right; padding: 6px 0;">15</td></tr>
  <tr><td style="padding: 6px 0;">12. Anexos</td><td style="text-align:right; padding: 6px 0;">16</td></tr>
</table>
<div style="page-break-after: always;"></div>

<h2>1. INTRODUÇÃO</h2>
<p>Na busca por elevar a produtividade, a qualidade, a segurança e o conforto durante a execução das atividades — sejam elas rotineiras ou mais complexas — a ergonomia tem ganhado cada vez mais espaço dentro das organizações. Seu uso tornou-se essencial para reduzir falhas e otimizar processos nos setores produtivos, administrativos e, sobretudo, nos aspectos que envolvem comportamento e interação humana.</p>
<p>A ergonomia é uma área do conhecimento dedicada a adaptar as condições de trabalho às características das pessoas. Seu propósito é aplicar informações sobre o funcionamento humano para promover bem-estar, eficiência e melhores resultados tanto para o trabalhador quanto para a empresa. Em qualquer ambiente industrial, pode-se compreender a atividade como um sistema que integra pessoas, máquinas e o meio ao redor. Quando esse sistema opera em condições inadequadas, surgem desconfortos imediatos, fadiga e até lesões ao longo do tempo.</p>
<p>Locais de trabalho planejados de forma incorreta tendem a reduzir o desempenho, comprometer a qualidade, elevar o absenteísmo e aumentar custos operacionais. A ergonomia busca tornar a interação entre trabalhador, equipamentos e ambiente o mais segura, eficiente e confortável possível, priorizando inicialmente a preservação da saúde e o bem-estar do colaborador e, como consequência, contribuindo para melhores resultados empresariais.</p>
<p>Atendendo à demanda da empresa, foi realizado um levantamento detalhado das condições ergonômicas, seguindo os critérios da Norma Regulamentadora nº 17, com o objetivo de subsidiar a elaboração da Análise Ergonômica do Trabalho.</p>
<hr>

<h2>2. DADOS DA EMPRESA</h2>
<table style="width:100%; border-collapse: collapse;">
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 200px; background: #f1f5f9;">Razão Social</td><td style="border: 1px solid #ddd; padding: 8px;">${company.name}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">Nome Fantasia</td><td style="border: 1px solid #ddd; padding: 8px;">${company.trade_name || company.name}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">CNPJ</td><td style="border: 1px solid #ddd; padding: 8px;">${company.cnpj}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">CNAE Principal</td><td style="border: 1px solid #ddd; padding: 8px;">${company.cnae_principal || "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">CNAE Secundário</td><td style="border: 1px solid #ddd; padding: 8px;">${company.cnae_secundario || "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">Risco da Atividade</td><td style="border: 1px solid #ddd; padding: 8px;">${company.activity_risk ? `${company.activity_risk} (NR-04)` : "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;" rowspan="4">Endereço Completo</td><td style="border: 1px solid #ddd; padding: 8px;"><strong>Logradouro:</strong> ${company.address}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Bairro:</strong> ${company.neighborhood || "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Cidade/Estado:</strong> ${company.city} — ${company.state}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>CEP:</strong> ${company.cep || "—"}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">Setor(es) Avaliado(s)</td><td style="border: 1px solid #ddd; padding: 8px;">${sectorName}</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f1f5f9;">Posto(s) de Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">${wsName}</td></tr>
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
<p>A realização do Estudo Ergonômico do Trabalho é indispensável não apenas pelo cumprimento da NR17, mas também por atuar como instrumento complementar ao PGR e ao PCMSO. Sua aplicação fortalece a empresa na prevenção de doenças ocupacionais, na manutenção da produtividade e na correção de inadequações ergonômicas do ambiente laboral. Há diversas metodologias para conduzir esse estudo, e o presente trabalho foi elaborado com base nas análises e resultados desenvolvidos pela MG CONSULT.</p>

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
  return '<table style="width:100%; border-collapse: collapse; margin-bottom: 16px;">' +
    '<tr style="background: #f1f5f9;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">' + (ws?.name || "—") + '</td></tr>' +
    '<tr><td style="border: 1px solid #ddd; padding: 8px; width: 200px;"><strong>Método</strong></td><td style="border: 1px solid #ddd; padding: 8px;">' + a.method + '</td></tr>' +
    '<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Score</strong></td><td style="border: 1px solid #ddd; padding: 8px;">' + a.score + '</td></tr>' +
    '<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Nível de Risco</strong></td><td style="border: 1px solid #ddd; padding: 8px;">' + (risk ? riskLevelLabel(risk.risk_level) : "N/A") + '</td></tr>' +
    '<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Observações</strong></td><td style="border: 1px solid #ddd; padding: 8px;">' + a.notes + '</td></tr>' +
    '</table>';
}).join("")}` : "<p>Nenhuma análise realizada.</p>"}
<hr>

<h2>8. DEFINIÇÃO DE MÉTODOS, TÉCNICAS E FERRAMENTAS</h2>
<p>No âmbito do Programa de Análise Ergonômica do Trabalho da empresa, adotou-se a seguinte abordagem metodológica:</p>
<ul>
  <li><strong>Consultoria Inicial:</strong> Etapa destinada à coleta de informações sobre a empresa, seus colaboradores e as prioridades de avaliação, realizada em conjunto com os setores de Segurança e Medicina do Trabalho.</li>
  <li><strong>Observação dos Postos e Postura de Trabalho Descritiva:</strong> Inspeção presencial minuciosa de cada posto, aliada a entrevistas e troca de informações com os trabalhadores.</li>
  <li><strong>Aplicação de questionários:</strong> Utilizados para identificar a percepção dos colaboradores quanto às condições ergonômicas.</li>
</ul>

<h3>Ferramentas Ergonômicas:</h3>
<p><strong>REBA (Rapid Entire Body Assessment):</strong> Criado por Hignett e McAtamney (2000), o método tem como finalidade estimar o risco de desenvolvimento de distúrbios musculoesqueléticos decorrentes das posturas adotadas no trabalho. Trata-se de uma ferramenta indicada para analisar tarefas que envolvem manipulação de pessoas ou cargas em movimento. O REBA considera fatores posturais estáticos e dinâmicos na interação trabalhador–carga e incorpora o conceito de "assistência gravitacional". Classificação: 1-3: Baixo | 4-7: Médio | 8-10: Alto | 11+: Muito Alto.</p>
<p><strong>RULA (Rapid Upper Limb Assessment):</strong> Desenvolvido por McAtamney e Corlett (1993), avalia a exposição dos membros superiores a fatores de risco que contribuem para o desenvolvimento de distúrbios relacionados ao trabalho. Classificação: 1-2: Aceitável | 3-4: Investigar | 5-6: Mudar breve | 7: Mudar imediatamente.</p>
<p><strong>OCRA (Occupational Repetitive Actions):</strong> Metodologia internacionalmente reconhecida para avaliação do risco de lesões musculoesqueléticas associadas a movimentos repetitivos dos membros superiores. Desenvolvido por Colombini, Occhipinti e colaboradores, é amplamente utilizado em ergonomia ocupacional, especialmente em setores que exigem repetição contínua de tarefas.</p>
<p><strong>ROSA (Rapid Office Strain Assessment):</strong> Ferramenta ergonômica usada para identificar riscos musculoesqueléticos em postos administrativos, especialmente aqueles com uso contínuo de computador. O método avalia cadeira, mesa, monitor, teclado, mouse e telefone, considerando ajustes, postura e tempo de exposição. Classificação: 1-2: Desprezível | 3-4: Baixo | 5-6: Médio | 7+: Alto.</p>
<p><strong>OWAS (Ovako Working Posture Analysing System):</strong> Sistema de análise postural que classifica posturas de trabalho quanto ao risco musculoesquelético. Classificação: 1: Normal | 2: Leve | 3: Severo | 4: Muito severo.</p>
<p>A detecção de posturas foi realizada com auxílio de inteligência artificial (BlazePose/MediaPipe) para cálculo preciso dos ângulos articulares, com filtragem de confiança mínima de 0.35 e suavização temporal de 5 frames.</p>

<h3>Norma Regulamentadora nº 17 – Ergonomia</h3>
<p>Foram também considerados todos os requisitos da NR-17, incluindo: levantamento, transporte e descarga individual de materiais; mobiliário dos postos de trabalho; equipamentos dos postos de trabalho; condições ambientais de trabalho; pausas para descanso.</p>

<h3>8.1 Equipamentos Utilizados para Medição no Ambiente de Trabalho</h3>
<table style="width:100%; border-collapse: collapse; margin-bottom: 12px;">
  <tr style="background: #0A1F44; color: white;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">CALOR</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Instrumento</td><td style="border: 1px solid #ddd; padding: 8px;">Medidor de stress térmico</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Método</td><td style="border: 1px solid #ddd; padding: 8px;">NR-15, Portaria 3214/78, do MTE</td></tr>
</table>
<table style="width:100%; border-collapse: collapse; margin-bottom: 12px;">
  <tr style="background: #0A1F44; color: white;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">RUÍDO</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Instrumento</td><td style="border: 1px solid #ddd; padding: 8px;">Decibelímetro</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Método</td><td style="border: 1px solid #ddd; padding: 8px;">NHT-06, FUNDACENTRO / NR-15</td></tr>
</table>
<table style="width:100%; border-collapse: collapse; margin-bottom: 12px;">
  <tr style="background: #0A1F44; color: white;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">ILUMINAÇÃO</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Instrumento</td><td style="border: 1px solid #ddd; padding: 8px;">Luxímetro</td></tr>
  <tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Método</td><td style="border: 1px solid #ddd; padding: 8px;">NHO 11</td></tr>
</table>
<hr>

<h2>9. AGRUPAMENTO POR GHE E MATRIZ DE AVALIAÇÃO ERGONÔMICA</h2>
<p>A empresa <strong>${company.trade_name || company.name}</strong> atua no segmento de ${company.description.toLowerCase()}. Os trabalhadores são classificados em Grupos Homogêneos de Exposição (GHE), conforme metodologia adotada pelo Programa de Gerenciamento de Riscos (PGR). Essa classificação visa agrupar funções com condições de exposição semelhantes, possibilitando uma avaliação mais precisa dos riscos ergonômicos, biomecânicos e psicossociais presentes nas diferentes áreas da empresa.</p>
<p>O enquadramento por GHE permite a integração entre os programas de gestão de riscos (GRO/PGR) e a Análise Ergonômica do Trabalho (AET), promovendo uma visão unificada da exposição ocupacional e das ações preventivas aplicáveis.</p>

<h3>9.1 Grupo Homogêneo de Exposição – GHE</h3>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #0A1F44; color: white;">
  <th style="border: 1px solid #ddd; padding: 8px;">GHE</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Setor / Atividade</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Descrição das Atividades</th>
</tr></thead>
<tbody>
${workstations.map((ws, i) => {
  const sector = ctx.workstations.length > 0 ? (ctx.sector || { name: "Geral" }) : { name: "Geral" };
  return '<tr>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">GHE ' + String(i + 1).padStart(2, '0') + ' - ' + ws.name + '</td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">' + (sector?.name || "—") + '</td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">' + (ws.activity_description || ws.description || ws.tasks_performed) + '</td>' +
    '</tr>';
}).join("")}
</tbody></table>

<h3>9.2 Matriz de Avaliação de Riscos</h3>
<p>A análise dos riscos ergonômicos foi realizada com base na Matriz de Probabilidade × Severidade, metodologia utilizada no PGR da empresa e alinhada aos princípios da AIHA (1998) e da norma BS 8800 (1996):</p>
<table style="width:100%; border-collapse: collapse;">
<thead><tr style="background: #0A1F44; color: white;">
  <th style="border: 1px solid #ddd; padding: 8px;">Severidade (S)</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Probabilidade (P)</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Resultado (Nível de Risco)</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Classificação / Ação Recomendada</th>
</tr></thead>
<tbody>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Leve / Reversível</strong> — desconfortos temporários, sem impacto funcional</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Baixa probabilidade — exposição eventual ou sob controle</td>
    <td style="border: 1px solid #ddd; padding: 8px; background: #C8E6C9; font-weight: bold;">Baixo (Aceitável)</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Manter as condições atuais, reforçando boas práticas e pausas.</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Moderada / Desconforto persistente</strong> — sintomas repetitivos ou leves</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Média probabilidade — exposição frequente, posturas mantidas</td>
    <td style="border: 1px solid #ddd; padding: 8px; background: #FFF9C4; font-weight: bold;">Médio (Tolerável)</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Promover ajustes ergonômicos, pausas regulares e orientação postural.</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Grave / Potencial de LER/DORT</strong> — dor crônica, limitação de movimento ou necessidade de afastamento</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Alta probabilidade — exposição contínua, sem pausas ou ajustes</td>
    <td style="border: 1px solid #ddd; padding: 8px; background: #FFCDD2; font-weight: bold;">Alto (Crítico)</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Implementar medidas corretivas imediatas no posto de trabalho.</td>
  </tr>
</tbody></table>
<p><em>Critério de interpretação: quanto maior a severidade e a probabilidade combinadas, mais urgente é a necessidade de intervenção.</em></p>

${risks.length > 0 ? `
<h3>Riscos Identificados</h3>
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
  return '<tr>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">' + (ws?.name || 'GHE ' + (i + 1)) + '</td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">' + r.description + '</td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;">' + r.probability + ' × ' + r.exposure + ' × ' + r.consequence + '</td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;"><strong>' + r.risk_score + '</strong></td>' +
    '<td style="border: 1px solid #ddd; padding: 8px;"><strong>' + riskLevelLabel(r.risk_level) + '</strong></td>' +
    '</tr>';
}).join("")}
</tbody></table>` : ""}
<hr>

<h2>10. ANÁLISE DOS RISCOS PSICOSSOCIAIS</h2>
<h3>10.1 Análise Complementar dos Riscos Psicossociais</h3>
${psychosocial.length > 0 ? '<p>A validação dos resultados psicossociais foi realizada por meio da aplicação dos seguintes instrumentos: ' + (psychosocial.some(p => p.copenhagen_details) ? '<strong>COPSOQ II (Copenhagen Psychosocial Questionnaire)</strong>, ' : '') + (psychosocial.some(p => p.nasa_tlx_details) ? '<strong>NASA-TLX</strong>, ' : '') + (psychosocial.some(p => p.hse_it_details) ? '<strong>HSE-IT</strong>' : '') + ' aplicados junto aos colaboradores da <strong>' + (company.trade_name || company.name) + '</strong>.</p>' + psychosocial.map(psa => {
  let html = '<h4>Avaliação Psicossocial' + (psa.workstation_id ? ' — ' + (workstations.find(w => w.id === psa.workstation_id)?.name || "") : "") + '</h4>';
  html += '<p><strong>Avaliador:</strong> ' + psa.evaluator_name + '</p>';
  if (psa.nasa_tlx_details) {
    html += '<h4>NASA-TLX (Índice de Carga de Trabalho)</h4><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Dimensão</th><th style="border: 1px solid #ddd; padding: 8px;">Score (0-100)</th></tr></thead><tbody>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Mental</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.mental_demand + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Física</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.physical_demand + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Demanda Temporal</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.temporal_demand + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Performance</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.performance + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Esforço</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.effort + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Frustração</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.nasa_tlx_details.frustration + '</td></tr>';
    html += '<tr style="background: #f1f5f9;"><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Score Geral</td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">' + psa.nasa_tlx_score + '</td></tr>';
    html += '</tbody></table>';
  }
  if (psa.copenhagen_details) {
    html += '<h4>COPSOQ II</h4><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #ddd; padding: 8px;">Dimensão</th><th style="border: 1px solid #ddd; padding: 8px;">Score (0-100)</th></tr></thead><tbody>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Demandas Quantitativas</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.copenhagen_details.quantitative_demands + '</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 8px;">Ritmo de Trabalho</td><td style="border: 1px solid #ddd; padding: 8px;">' + psa.copenhagen_details.work_pace + '</td></tr>';
    html += '<tr style="background: #f1f5f9;"><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Score Geral</td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">' + psa.copenhagen_score + '</td></tr>';
    html += '</tbody></table>';
  }
  html += '<p><strong>Observações:</strong> ' + psa.observations + '</p>';
  return html;
}).join("<hr>") : '<p>Nenhuma avaliação psicossocial realizada. Recomenda-se a aplicação dos questionários NASA-TLX, HSE-IT e Copenhagen Psychosocial Questionnaire (COPSOQ II) para uma avaliação completa dos fatores psicossociais do trabalho.</p>'}
<hr>

<h2>11. RESPONSABILIDADE TÉCNICA</h2>
<p>O presente documento foi elaborado sob a responsabilidade técnica da MG CONSULT.</p>
<p>Sendo de responsabilidade da empresa, programar, monitorar e assegurar o cumprimento desta Análise Ergonômica.</p>
<p>${company.city}, ${getToday()}.</p>
<div style="text-align: center; margin-top: 60px;">
  <p>_____________________________________________</p>
  <p><strong>${consultant}</strong></p>
  <p>M.Sc Eng. de Produção (Ergonomia)</p>
  <p>Eng. de Segurança do Trabalho</p>
  <p>Especialista em Ergonomia</p>
</div>
<div style="page-break-after: always;"></div>

<h2>12. ANEXOS</h2>
<ul style="font-size: 14px; line-height: 2;">
  <li>Análise Ergonômica dos Postos (AEP)</li>
  <li>Ferramentas Aplicadas</li>
  <li>Relatório Técnico Fatores Psicossociais</li>
  <li>Plano de Ação</li>
</ul>

${actions.length > 0 ? '<h3>Plano de Ação</h3><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #0A1F44; color: white;"><th style="border: 1px solid #ddd; padding: 8px;">Ação Corretiva</th><th style="border: 1px solid #ddd; padding: 8px;">Responsável</th><th style="border: 1px solid #ddd; padding: 8px;">Prazo</th><th style="border: 1px solid #ddd; padding: 8px;">Status</th></tr></thead><tbody>' + actions.map(ap => '<tr><td style="border: 1px solid #ddd; padding: 8px;">' + ap.description + '</td><td style="border: 1px solid #ddd; padding: 8px;">' + ap.responsible + '</td><td style="border: 1px solid #ddd; padding: 8px;">' + ap.deadline + '</td><td style="border: 1px solid #ddd; padding: 8px;">' + statusLabel(ap.status) + '</td></tr>').join("") + '</tbody></table>' : ''}

<br>
<p style="text-align:center; font-size: 11px; color: #94a3b8;"><em>Documento gerado pelo sistema Focus Spartan — MG Consultoria</em></p>
`;
}

function generatePGRReport(ctx: ReportContext): string {
  const { company, workstations, analyses, photos } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const analysisIds = analyses.map(a => a.id);
  const risks = mockRiskAssessments.filter(r => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter(ap => risks.some(r => r.id === ap.risk_assessment_id));
  const tasks = mockTasks.filter(t => workstations.some(w => w.id === t.workstation_id));

  // Group workstations by sector
  const sectorMap = new Map<string, { sectorName: string; workstations: typeof workstations }>();
  workstations.forEach(ws => {
    const sectorId = ws.sector?.id || ws.sector_id || "unknown";
    const sectorName = ws.sector?.name || "Geral";
    if (!sectorMap.has(sectorId)) sectorMap.set(sectorId, { sectorName, workstations: [] });
    sectorMap.get(sectorId)!.workstations.push(ws);
  });

  const today = getToday();
  const td = `style="border: 1px solid #D1D5DB; padding: 8px; font-size: 13px;"`;
  const th = `style="border: 1px solid #D1D5DB; padding: 8px; font-size: 13px; background: #f1f5f9; font-weight: bold;"`;

  return `
<!-- CAPA -->
<div style="text-align:center; padding: 80px 40px; border: 2px solid #1e293b;">
  <h1 style="font-size: 28px; margin-bottom: 8px; color: #1e293b;">PROGRAMA DE GERENCIAMENTO DE RISCOS</h1>
  <h2 style="font-size: 20px; color: #475569; margin-bottom: 40px;">PGR</h2>
  <p style="font-size: 24px; font-weight: bold; color: #1e293b;">${company.name}</p>
  <p style="font-size: 14px; color: #64748b;">CNPJ: ${company.cnpj}</p>
  <p style="font-size: 14px; color: #64748b;">${company.address} — ${company.city}/${company.state}</p>
  <p style="font-size: 14px; color: #64748b; margin-top: 40px;">Emissão: ${today}</p>
  <p style="font-size: 14px; color: #64748b;">Revisão: 00</p>
  <p style="font-size: 14px; color: #475569; margin-top: 40px;"><strong>Responsável Técnico:</strong> ${consultant}</p>
  <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div>
<div style="page-break-after: always;"></div>

<!-- SUMÁRIO -->
<h2>SUMÁRIO</h2>
<ol style="font-size: 14px; line-height: 2.2;">
  <li>Definições e Abreviaturas</li>
  <li>Referências</li>
  <li>Identificação da Empresa</li>
  <li>Responsabilidade Técnica</li>
  <li>Aprovação, Distribuição e Implementação</li>
  <li>Introdução</li>
  <li>Objetivos</li>
  <li>Campo de Aplicação</li>
  <li>Metodologia Utilizada</li>
  <li>Inventário de Risco</li>
  <li>Implementação das Medidas de Prevenção</li>
  <li>EPC — Equipamento de Proteção Coletiva</li>
  <li>EPI — Equipamento de Proteção Individual</li>
  <li>Responsabilidades</li>
  <li>Meta e Objetivos</li>
  <li>Referências Bibliográficas</li>
</ol>
<div style="page-break-after: always;"></div>

<!-- CONTROLE DE REVISÕES -->
<h2>CONTROLE DE REVISÕES</h2>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Revisão</th><th ${th}>Data</th><th ${th}>Página</th><th ${th}>Descrição das Alterações</th></tr></thead>
  <tbody>
    <tr><td ${td}>00</td><td ${td}>${today}</td><td ${td}>TODAS</td><td ${td}>PRIMEIRA APLICAÇÃO</td></tr>
  </tbody>
</table>
<div style="page-break-after: always;"></div>

<!-- 1. DEFINIÇÕES E ABREVIATURAS -->
<h2>1. DEFINIÇÕES E ABREVIATURAS</h2>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Termo</th><th ${th}>Definição</th></tr></thead>
  <tbody>
    <tr><td ${td}><strong>ART</strong></td><td ${td}>Anotação de Responsabilidade Técnica</td></tr>
    <tr><td ${td}><strong>CIPA</strong></td><td ${td}>Comissão Interna de Prevenção de Acidentes</td></tr>
    <tr><td ${td}><strong>CLT</strong></td><td ${td}>Consolidação das Leis do Trabalho</td></tr>
    <tr><td ${td}><strong>CNAE</strong></td><td ${td}>Classificação Nacional de Atividade Econômica</td></tr>
    <tr><td ${td}><strong>EPC</strong></td><td ${td}>Equipamento de Proteção Coletiva</td></tr>
    <tr><td ${td}><strong>EPI</strong></td><td ${td}>Equipamento de Proteção Individual</td></tr>
    <tr><td ${td}><strong>GHE</strong></td><td ${td}>Grupos Homogêneos de Exposição — Perfis de exposição similares para agrupamento de colaboradores</td></tr>
    <tr><td ${td}><strong>NHO</strong></td><td ${td}>Norma de Higiene Ocupacional</td></tr>
    <tr><td ${td}><strong>NR</strong></td><td ${td}>Norma Regulamentadora</td></tr>
    <tr><td ${td}><strong>PCMSO</strong></td><td ${td}>Programa de Controle Médico de Saúde Ocupacional</td></tr>
    <tr><td ${td}><strong>PGR</strong></td><td ${td}>Programa de Gerenciamento de Riscos</td></tr>
    <tr><td ${td}><strong>SESMT</strong></td><td ${td}>Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho</td></tr>
    <tr><td ${td}><strong>Risco Ocupacional</strong></td><td ${td}>Combinação da probabilidade de ocorrer lesão ou agravo à saúde causada por um evento perigoso e da severidade dessa lesão</td></tr>
    <tr><td ${td}><strong>Perigo</strong></td><td ${td}>Fonte com o potencial de causar lesões ou agravos à saúde</td></tr>
    <tr><td ${td}><strong>Limite de Tolerância</strong></td><td ${td}>Concentração ou intensidade máxima ou mínima que poderá causar dano à saúde do trabalhador durante sua vida laboral</td></tr>
  </tbody>
</table>
<hr>

<!-- 2. REFERÊNCIAS -->
<h2>2. REFERÊNCIAS</h2>
<ul style="font-size: 13px; line-height: 1.8;">
  <li>NR 1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais</li>
  <li>NR 4 — Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho</li>
  <li>NR 5 — Comissão Interna de Prevenção de Acidentes — CIPA</li>
  <li>NR 6 — Equipamentos de Proteção Individual — EPI</li>
  <li>NR 7 — Programa de Controle Médico de Saúde Ocupacional — PCMSO</li>
  <li>NR 9 — Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos</li>
  <li>NR 10 — Segurança em Instalações e Serviços em Eletricidade</li>
  <li>NR 11 — Transporte, Movimentação, Armazenagem e Manuseio de Materiais</li>
  <li>NR 12 — Segurança no Trabalho em Máquinas e Equipamentos</li>
  <li>NR 15 — Atividades e Operações Insalubres</li>
  <li>NR 16 — Atividades e Operações Perigosas</li>
  <li>NR 17 — Ergonomia</li>
  <li>NR 23 — Proteção contra Incêndios</li>
  <li>NR 24 — Condições Sanitárias e de Conforto nos Locais de Trabalho</li>
  <li>NR 26 — Sinalização de Segurança</li>
  <li>NR 35 — Trabalho em Altura</li>
</ul>
<hr>

<!-- 3. IDENTIFICAÇÃO DA EMPRESA -->
<h2>3. IDENTIFICAÇÃO DA EMPRESA</h2>
<table style="width:100%; border-collapse: collapse;">
  <tr><td ${th} style="width:200px;">Razão Social</td><td ${td}>${company.name}</td></tr>
  <tr><td ${th}>CNPJ</td><td ${td}>${company.cnpj}</td></tr>
  <tr><td ${th}>Endereço</td><td ${td}>${company.address}</td></tr>
  <tr><td ${th}>Município / UF</td><td ${td}>${company.city} / ${company.state}</td></tr>
  <tr><td ${th}>Descrição da Atividade</td><td ${td}>${company.description}</td></tr>
</table>
<hr>

<!-- 4. RESPONSABILIDADE TÉCNICA -->
<h2>4. RESPONSABILIDADE TÉCNICA</h2>
<p>Profissional legalmente habilitado e responsável pela elaboração deste programa.</p>
<table style="width:100%; border-collapse: collapse;">
  <tr><td ${th} style="width:200px;">Responsável Técnico</td><td ${td}>${consultant}</td></tr>
  <tr><td ${th}>Título Profissional</td><td ${td}>Engenheiro de Segurança do Trabalho</td></tr>
  <tr><td ${th}>Registro</td><td ${td}>CREA/CONFEA: XXXXX</td></tr>
  <tr><td ${th}>Período de Avaliação</td><td ${td}>${today}</td></tr>
</table>
<hr>

<!-- 5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO -->
<h2>5. APROVAÇÃO, DISTRIBUIÇÃO E IMPLEMENTAÇÃO</h2>
<p>Ao aprovar o Programa de Gerenciamento de Riscos, no qual todas as informações estão dentro dos parâmetros legais das normas vigentes, a empresa, através de seu representante legal, compromete-se a cumprir rigorosamente o que nele consta, sua efetiva implementação, bem como zelar pela sua eficácia.</p>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Função</th><th ${th}>Nome</th><th ${th}>Assinatura</th></tr></thead>
  <tbody>
    <tr><td ${td}>Responsável Técnico</td><td ${td}>${consultant}</td><td ${td}></td></tr>
    <tr><td ${td}>Representante Legal</td><td ${td}></td><td ${td}></td></tr>
  </tbody>
</table>
<hr>

<!-- 6. INTRODUÇÃO -->
<h2>6. INTRODUÇÃO</h2>
<p>A elaboração deste Programa de Gerenciamento de Riscos tem como propósito um estudo das condições ambientais atuais existentes nesta empresa, a fim de identificar os agentes de riscos e caracterizar as atividades e operações desenvolvidas pela empresa. Tal programa está direcionado no reconhecimento e avaliação dos fatores ambientais ou de locais de trabalho que possam causar prejuízos à saúde e ao bem-estar dos colaboradores.</p>
<p>Sempre que houver modificação nas condições de trabalho, o levantamento deverá ser refeito, pois as medidas propostas para melhorar as condições de trabalho podem ser alteradas.</p>
<hr>

<!-- 7. OBJETIVOS -->
<h2>7. OBJETIVOS</h2>
<h3>7.1 Objetivo Geral</h3>
<p>Preservar a saúde e a integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e consequente controle da ocorrência de riscos ambientais existentes ou que venham a existir nos locais de trabalho.</p>
<p>O PGR é parte integrante do conjunto mais amplo de iniciativas da empresa no campo da prevenção de acidentes e doenças do trabalho, devendo estar articulado com o disposto nas demais NR, membros da CIPA, PCMSO e demais programas de segurança.</p>

<h3>7.2 Objetivos Específicos</h3>
<ul>
  <li>Seguir a política da empresa relacionada à saúde e segurança dos colaboradores;</li>
  <li>Proteção do meio ambiente e dos recursos naturais;</li>
  <li>Tratar os riscos ambientais existentes ou que venham a existir;</li>
  <li>Planejar ações para preservar a saúde e a segurança dos trabalhadores.</li>
</ul>

<h3>7.3 Antecipação</h3>
<p>Consiste na análise dos setores de trabalho, funções e horários de trabalho, formação dos grupos homogêneos de exposição, análise das descrições das atividades por função, verificação do ambiente de trabalho, visando identificar os riscos potenciais e introduzir medidas de proteção para sua redução ou eliminação.</p>

<h3>7.4 Reconhecimento</h3>
<p>É o início do trabalho de campo para identificar as atividades, tarefas, fontes e tipos de riscos ambientais. Constituído por:</p>
<ol>
  <li>Identificação dos riscos ambientais;</li>
  <li>Determinação e localização das possíveis fontes geradoras;</li>
  <li>Identificação das possíveis trajetórias e dos meios de propagação dos agentes;</li>
  <li>Identificação das funções e determinação do número de trabalhadores expostos;</li>
  <li>Caracterização das atividades e do tipo de exposição;</li>
  <li>Obtenção de dados indicativos de possíveis comprometimentos da saúde;</li>
  <li>Possíveis danos à saúde relacionados aos riscos identificados.</li>
</ol>

<h3>7.5 Controle</h3>
<p>Consiste em adotar medidas de controle administrativas, de engenharia, equipamentos de proteção coletiva (EPC's), equipamentos de proteção individual (EPI's) e intervenções sobre operações, reorientando-as para procedimentos que possam eliminar, neutralizar ou reduzir a exposição a um determinado risco.</p>

<h3>7.6 Monitoramento</h3>
<p>Tem o objetivo de mensurar a exposição ou a inexistência dos riscos identificados na etapa de reconhecimento, além de acompanhar se as medidas de controle estão sendo eficazes.</p>

<h3>7.7 Divulgação dos Dados</h3>
<p>Os registros, manutenção e divulgação dos dados serão arquivados em meio eletrônico e físico, estando sempre à disposição dos empregados, sindicatos e autoridades de fiscalização.</p>
<hr>

<!-- 8. CAMPO DE APLICAÇÃO -->
<h2>8. CAMPO DE APLICAÇÃO</h2>
<p>Este programa é aplicado a toda organização, estabelecimentos, canteiros de obras e/ou frentes de serviços. A avaliação de riscos deve constituir um processo contínuo e ser revista a cada dois anos ou quando da ocorrência das seguintes situações:</p>
<ul>
  <li>Após implementação das medidas de prevenção, para avaliação de riscos residuais;</li>
  <li>Após inovações e modificações nas tecnologias, ambientes, processos, condições e organização do trabalho;</li>
  <li>Quando identificadas inadequações, insuficiências ou ineficácias das medidas de prevenção;</li>
  <li>Na ocorrência de acidentes ou doenças relacionadas ao trabalho;</li>
  <li>Quando houver mudança nos requisitos legais aplicáveis.</li>
</ul>
<hr>

<!-- 9. METODOLOGIA UTILIZADA -->
<h2>9. METODOLOGIA UTILIZADA</h2>

<h3>9.1 Análise Qualitativa — Análise Preliminar dos Riscos</h3>
<p>A análise preliminar e reconhecimento dos riscos ambientais envolve a análise de instalações, métodos ou processos de trabalho, visando identificar os riscos potenciais e introduzir medidas de proteção para sua redução ou eliminação:</p>
<ul>
  <li>Identificação dos riscos ambientais existentes nas atividades da empresa;</li>
  <li>Identificação dos perigos causados pelos riscos ambientais;</li>
  <li>Indicação dos níveis de risco, quando aplicáveis;</li>
  <li>Determinação e localização das possíveis fontes geradoras;</li>
  <li>Identificação das funções e número de trabalhadores expostos;</li>
  <li>Caracterização das atividades e do tipo da exposição;</li>
  <li>Identificação de possíveis lesões, agravos ou comprometimento da saúde;</li>
  <li>Descrição das medidas de controle já existentes.</li>
</ul>

<h3>9.2 Análise Quantitativa</h3>
<p>Após a análise preliminar dos riscos, o monitoramento ambiental mensura a exposição dos trabalhadores aos riscos ocupacionais, comprovando o controle da exposição ou a inexistência dos riscos identificados. Para o monitoramento quantitativo são utilizadas as seguintes metodologias:</p>
<ul>
  <li><strong>Exposição ao Ruído:</strong> Avaliação conforme NHO 01, com medidores calibrados na zona auditiva do colaborador. Parâmetros de acordo com NR-15 Anexo I.</li>
  <li><strong>Exposição à Luminosidade:</strong> Medições de iluminamento no campo de trabalho com luxímetro, conforme NHO 11.</li>
  <li><strong>Exposição ao Calor:</strong> Mensuração pelo Índice de Bulbo Úmido – Termômetro de Globo (IBUTG), conforme NHO-06.</li>
</ul>

<h3>9.3 Análise e Avaliação do Risco</h3>
<p>A análise e avaliação de risco consistem em verificar até que ponto os riscos potenciais podem impactar na realização dos objetivos. A primeira etapa é a análise preliminar e reconhecimento dos riscos. A segunda etapa é a análise dos setores, funções e atividades, utilizando a metodologia de Grupo Homogêneo de Exposição (GHE).</p>

<h3>9.4 Definição dos Critérios de Risco</h3>
<p>Conforme ABNT NBR ISO 31000:2009, os critérios utilizados refletem os valores, objetivos e recursos da organização, sendo compatíveis com a política de gestão de riscos.</p>

<h3>9.5 Probabilidade (P)</h3>
<p>A gradação da probabilidade da ocorrência de danos é feita atribuindo-se um índice (P) variando de 1 a 4:</p>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Índice (P)</th><th ${th}>Exposição</th><th ${th}>Fator de Proteção</th></tr></thead>
  <tbody>
    <tr><td ${td}><strong>1 — Baixo</strong></td><td ${td}>Exposição/contato baixo ou eventual, em tempo muito curto</td><td ${td}>Medidas adequadas, eficientes, com garantia de manutenção a longo prazo</td></tr>
    <tr><td ${td}><strong>2 — Moderado</strong></td><td ${td}>Exposição/contato moderado ou intermitente</td><td ${td}>Medidas adequadas e eficientes, sem garantia de manutenção a longo prazo</td></tr>
    <tr><td ${td}><strong>3 — Alto</strong></td><td ${td}>Exposição/contato alto ou permanente</td><td ${td}>Medidas existentes com desvios significativos; eficiência duvidosa</td></tr>
    <tr><td ${td}><strong>4 — Excessivo</strong></td><td ${td}>Exposição excessiva ou permanente a intensidade elevada</td><td ${td}>Medidas inexistentes ou reconhecidamente inadequadas</td></tr>
  </tbody>
</table>

<h3>9.6 Gravidade (G)</h3>
<p>A gradação da gravidade (G) das possíveis lesões é atribuída com índice de 1 a 4:</p>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Índice (G)</th><th ${th}>Critério</th><th ${th}>Exemplos</th><th ${th}>Pessoas Expostas</th></tr></thead>
  <tbody>
    <tr><td ${td}><strong>1 — Baixo</strong></td><td ${td}>Lesão ou doença leve, efeitos reversíveis</td><td ${td}>Ferimentos leves, afastamento ≤15 dias</td><td ${td}>Até 10%</td></tr>
    <tr><td ${td}><strong>2 — Moderado</strong></td><td ${td}>Lesão ou doença séria, efeitos reversíveis severos</td><td ${td}>Irritações sérias, afastamento >15 dias</td><td ${td}>10% a 30%</td></tr>
    <tr><td ${td}><strong>3 — Alto</strong></td><td ${td}>Lesão crítica, efeitos irreversíveis</td><td ${td}>PAIR, danos ao SNC, afastamento longo</td><td ${td}>30% a 60%</td></tr>
    <tr><td ${td}><strong>4 — Excessivo</strong></td><td ${td}>Lesão incapacitante ou fatal</td><td ${td}>Perda de membros, doenças fatais</td><td ${td}>Acima de 60%</td></tr>
  </tbody>
</table>

<h3>9.7 Determinação do Nível de Risco (N)</h3>
<p>A determinação do nível de risco (N) é realizada pela combinação da Probabilidade (P) e Gravidade (G):</p>
<table style="width:100%; border-collapse: collapse; text-align:center;">
  <thead><tr><th ${th}>P \\ G</th><th ${th}>1 — Baixo</th><th ${th}>2 — Moderado</th><th ${th}>3 — Alto</th><th ${th}>4 — Excessivo</th></tr></thead>
  <tbody>
    <tr><td ${th}>1 — Baixo</td><td ${td}>Irrelevante</td><td ${td}>Baixo</td><td ${td}>Baixo</td><td ${td}>Médio</td></tr>
    <tr><td ${th}>2 — Moderado</td><td ${td}>Baixo</td><td ${td}>Baixo</td><td ${td}>Médio</td><td ${td}>Alto</td></tr>
    <tr><td ${th}>3 — Alto</td><td ${td}>Baixo</td><td ${td}>Médio</td><td ${td}>Alto</td><td ${td}>Alto</td></tr>
    <tr><td ${th}>4 — Excessivo</td><td ${td}>Médio</td><td ${td}>Alto</td><td ${td}>Alto</td><td ${td}>Crítico</td></tr>
  </tbody>
</table>
<p style="font-size:11px; color:#64748b;">Fonte: Matriz elaborada a partir de MULHAUSEN & DAMIANO (1998) e BS 8800 (BSI, 1996).</p>

<h3>9.8 Critérios de Controle para Priorização das Ações</h3>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Nível de Risco</th><th ${th}>Ação Requerida</th><th ${th}>Prazo de Implementação</th></tr></thead>
  <tbody>
    <tr><td ${td} style="color:#dc2626;"><strong>Crítico</strong></td><td ${td}>Ações corretivas devem ser adotadas imediatamente</td><td ${td}>Implementação imediata</td></tr>
    <tr><td ${td} style="color:#ea580c;"><strong>Alto</strong></td><td ${td}>Planejamento a curto prazo; rotinas e controles devem ser reavaliados</td><td ${td}>Prazo máximo de 3 meses</td></tr>
    <tr><td ${td} style="color:#d97706;"><strong>Médio</strong></td><td ${td}>Planejamento a médio/longo prazo; controles existentes monitorados</td><td ${td}>Prazo máximo de 6 meses</td></tr>
    <tr><td ${td} style="color:#16a34a;"><strong>Baixo</strong></td><td ${td}>Manter controle existente e avaliar necessidade de medidas adicionais</td><td ${td}>Prazo máximo de 1 ano</td></tr>
    <tr><td ${td}><strong>Irrelevante</strong></td><td ${td}>Não há necessidade de nova ação. Manter controles existentes</td><td ${td}>N/A</td></tr>
  </tbody>
</table>
<div style="page-break-after: always;"></div>

<!-- 10. INVENTÁRIO DE RISCO -->
<h2>10. INVENTÁRIO DE RISCO</h2>
${Array.from(sectorMap.entries()).map(([sectorId, { sectorName, workstations: sectorWs }], gheIndex) => {
  const wsRisks = risks.filter(r => {
    const analysis = analyses.find(a => a.id === r.analysis_id);
    return analysis && sectorWs.some(w => w.id === analysis.workstation_id);
  });
  const wsTasks = tasks.filter(t => sectorWs.some(w => w.id === t.workstation_id));

  return `
<h3>GHE ${String(gheIndex + 1).padStart(2, '0')} / SETOR — ${sectorName.toUpperCase()}</h3>
<p><strong>Caracterização dos processos:</strong> ${sectorWs.map(w => w.activity_description || w.description).join(". ")}.</p>
<p><strong>Postos de trabalho:</strong> ${sectorWs.map(w => w.name).join(", ")}.</p>

<h4>Descrição das Atividades Exercidas</h4>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Posto/Função</th><th ${th}>Descrição das Atividades</th></tr></thead>
  <tbody>
    ${sectorWs.map(ws => {
      const wt = tasks.filter(t => t.workstation_id === ws.id);
      return `<tr><td ${td}><strong>${ws.name}</strong></td><td ${td}>${wt.map(t => t.description).join("; ") || ws.tasks_performed}</td></tr>`;
    }).join("")}
  </tbody>
</table>

<h4>Inventário de Riscos Ocupacionais</h4>
<table style="width:100%; border-collapse: collapse;">
  <thead><tr>
    <th ${th}>Agente/Perigo</th>
    <th ${th}>Possíveis Danos</th>
    <th ${th}>Fonte Geradora</th>
    <th ${th}>P</th>
    <th ${th}>G</th>
    <th ${th}>NR</th>
    <th ${th}>Medidas de Controle</th>
  </tr></thead>
  <tbody>
    ${wsRisks.length > 0 ? wsRisks.map(r => {
      const analysis = analyses.find(a => a.id === r.analysis_id);
      const ws = analysis ? sectorWs.find(w => w.id === analysis.workstation_id) : null;
      const pLabel = r.probability <= 1 ? "B" : r.probability <= 2 ? "M" : r.probability <= 3 ? "A" : "E";
      const gLabel = r.consequence <= 1 ? "B" : r.consequence <= 2 ? "M" : r.consequence <= 3 ? "A" : "E";
      return `<tr>
        <td ${td}>${r.description}</td>
        <td ${td}>${ws?.name || "—"}</td>
        <td ${td}>${ws?.activity_description || "—"}</td>
        <td ${td} style="text-align:center;">${pLabel}</td>
        <td ${td} style="text-align:center;">${gLabel}</td>
        <td ${td} style="text-align:center;">${riskLevelLabel(r.risk_level).charAt(0)}</td>
        <td ${td}>${mockActionPlans.filter(ap => ap.risk_assessment_id === r.id).map(ap => ap.description).join("; ") || "N.I."}</td>
      </tr>`;
    }).join("") : `<tr><td ${td} colspan="7" style="text-align:center;">Nenhum risco identificado para este setor</td></tr>`}
  </tbody>
</table>
<p style="font-size:11px; color:#64748b;">Legenda: P: Probabilidade / G: Gravidade / B: Baixa / M: Moderada / A: Alta / E: Excessivo / NR: Nível de Risco / N.I: Não Identificado</p>
<p><strong>Recomendação:</strong> Realizar Análise Ergonômica do Trabalho (AET).</p>
<hr>`;
}).join("")}

<div style="page-break-after: always;"></div>

<!-- 11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO -->
<h2>11. IMPLEMENTAÇÃO DAS MEDIDAS DE PREVENÇÃO</h2>
<p>A implementação das medidas de prevenção e respectivos ajustes são registrados no PLANO DE AÇÃO, com a indicação clara do que deve ser realizado, as responsabilidades e prazo para atingir os objetivos planejados, de modo a reduzir, eliminar ou controlar os riscos ocupacionais.</p>

<h3>11.1 Plano de Ação</h3>
<p>O Ciclo PDCA (Plan, Do, Check, Act) é o modelo de gestão utilizado para acompanhamento das ações:</p>
<ol>
  <li><strong>Plan (Planejamento):</strong> Estabelecer objetivos, metas, atividades e prazos;</li>
  <li><strong>Do (Execução):</strong> Executar as atividades conforme planejamento;</li>
  <li><strong>Check (Verificação):</strong> Verificar resultados e identificar desvios;</li>
  <li><strong>Act (Ação):</strong> Tomar ações corretivas para eliminar ou minimizar causas dos desvios.</li>
</ol>

${actions.length > 0 ? `
<table style="width:100%; border-collapse: collapse;">
  <thead><tr><th ${th}>Meta / Ação</th><th ${th}>Estratégia</th><th ${th}>Responsável</th><th ${th}>Prioridade</th><th ${th}>Prazo</th><th ${th}>Status</th></tr></thead>
  <tbody>
    ${actions.map(ap => `<tr>
      <td ${td}>${ap.description}</td>
      <td ${td}>Implementar medidas de controle conforme PGR</td>
      <td ${td}>${ap.responsible}</td>
      <td ${td}>Média</td>
      <td ${td}>${ap.deadline}</td>
      <td ${td}>${statusLabel(ap.status)}</td>
    </tr>`).join("")}
  </tbody>
</table>` : "<p>Nenhuma ação registrada.</p>"}

<h3>11.2 Acompanhamento das Medidas de Prevenção</h3>
<ul>
  <li>Verificação da execução das ações planejadas;</li>
  <li>Inspeções dos locais e equipamentos de trabalho;</li>
  <li>Monitoramento das condições ambientais e exposições a agentes nocivos.</li>
</ul>
<hr>

<!-- 12. EPC -->
<h2>12. EPC — EQUIPAMENTO DE PROTEÇÃO COLETIVA</h2>
<p>O estudo, desenvolvimento e implantação de medidas de proteção coletiva deverá obedecer à seguinte hierarquia:</p>
<ol>
  <li>Medidas que eliminam ou reduzam a utilização ou a formação de agentes prejudiciais à saúde;</li>
  <li>Medidas que previnam a liberação ou disseminação desses agentes no ambiente de trabalho;</li>
  <li>Medidas que reduzam os níveis ou a concentração desses agentes no ambiente de trabalho.</li>
</ol>
<hr>

<!-- 13. EPI -->
<h2>13. EPI — EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL</h2>
<p>O Equipamento de Proteção Individual (EPI) é todo dispositivo de uso individual utilizado pelo trabalhador, destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho.</p>
<p><strong>Cabe ao empregador:</strong></p>
<ul>
  <li>Adquirir o EPI adequado ao risco de cada atividade;</li>
  <li>Exigir seu uso;</li>
  <li>Fornecer ao trabalhador somente o aprovado pelo órgão competente;</li>
  <li>Orientar e treinar o trabalhador sobre o uso adequado, guarda e conservação;</li>
  <li>Substituir imediatamente quando danificado ou extraviado;</li>
  <li>Responsabilizar-se pela higienização e manutenção periódica;</li>
  <li>Registrar o fornecimento ao trabalhador.</li>
</ul>
<p><strong>Cabe ao trabalhador:</strong></p>
<ul>
  <li>Usar o EPI apenas para a finalidade a que se destina;</li>
  <li>Responsabilizar-se pela guarda e conservação;</li>
  <li>Comunicar ao empregador qualquer alteração que o torne impróprio para uso;</li>
  <li>Cumprir as determinações do empregador sobre o uso adequado.</li>
</ul>
<hr>

<!-- 14. RESPONSABILIDADES -->
<h2>14. RESPONSABILIDADES</h2>
<h3>Responsabilidades do Empregador</h3>
<ul>
  <li>Estabelecer, implantar e assegurar o cumprimento do PGR como atividade permanente;</li>
  <li>Informar aos trabalhadores sobre os Riscos Ambientais em seus locais de trabalho;</li>
  <li>Garantir a interrupção de atividades em caso de risco grave e iminente;</li>
  <li>Executar ações integradas com outros empregados para proteção coletiva;</li>
  <li>Incentivar a participação dos trabalhadores na elaboração do PGR.</li>
</ul>
<h3>Responsabilidades do SESMT</h3>
<ul>
  <li>Executar, coordenar e monitorar as etapas do programa;</li>
  <li>Programar e aplicar treinamentos com o objetivo de instruir os trabalhadores expostos;</li>
  <li>Propor soluções para eliminar/reduzir a exposição;</li>
  <li>Manter arquivado por 20 anos os relatórios das avaliações ambientais.</li>
</ul>
<hr>

<!-- 15. META E OBJETIVOS -->
<h2>15. META E OBJETIVOS</h2>
<p>A empresa se compromete com as seguintes metas para o período vigente:</p>
<ul>
  <li>Reduzir em pelo menos 20% os riscos classificados como "Alto" ou "Crítico";</li>
  <li>Garantir treinamento adequado a 100% dos trabalhadores expostos a riscos;</li>
  <li>Realizar monitoramento ambiental contínuo conforme cronograma;</li>
  <li>Implementar todas as ações do Plano de Ação dentro dos prazos estabelecidos.</li>
</ul>
<hr>

<!-- 16. REFERÊNCIAS BIBLIOGRÁFICAS -->
<h2>16. REFERÊNCIAS BIBLIOGRÁFICAS</h2>
<ul style="font-size:13px;">
  <li>BRASIL. Normas Regulamentadoras (NR) — Ministério do Trabalho e Emprego.</li>
  <li>ABNT NBR ISO 31000:2009 — Gestão de Riscos — Princípios e Diretrizes.</li>
  <li>BS 8800:1996 — Guide to Occupational Health and Safety Management Systems.</li>
  <li>MULHAUSEN, J.R.; DAMIANO, J. A Strategy for Assessing and Managing Occupational Exposures. AIHA, 1998.</li>
  <li>FUNDACENTRO — Normas de Higiene Ocupacional (NHO 01, NHO 06, NHO 11).</li>
</ul>
<hr>

<!-- ENCERRAMENTO -->
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

function generateAPRReport(ctx: ReportContext): string {
  const { company, workstations, analyses } = ctx;
  const consultant = ctx.consultantName || "Engenheiro de Segurança do Trabalho";
  const psychosocial = mockPsychosocialAnalyses.filter(p => p.company_id === company.id);
  const sectors = [...new Set(workstations.map(w => w.sector?.name || "Geral"))];

  const classifyRisk = (v: number) => v >= 75 ? `<span class="rpt-badge green">Baixo risco</span>` : v >= 50 ? `<span class="rpt-badge yellow">Moderado</span>` : `<span class="rpt-badge red">Alto risco</span>`;

  return `${vividStyles()}
<div class="rpt-cover">
  <h1>AVALIAÇÃO PRELIMINAR DE RISCOS PSICOSSOCIAIS</h1>
  <h2>APR — FRPRT</h2>
  <p class="company">${company.name}</p>
  <p class="meta">CNPJ: ${company.cnpj}</p>
  <p class="meta">${company.address} — ${company.city}/${company.state}</p>
  <p class="meta" style="margin-top:30px;">Emissão: ${getToday()} | Responsável: ${consultant}</p>
  <p class="meta" style="font-size:12px; margin-top:15px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div>

<div class="rpt-section">1. OBJETIVO</div>
<div class="rpt-callout">A avaliação dos fatores de risco psicossociais é fundamental para a promoção da saúde mental no trabalho e cumprimento da NR-01.</div>
<p>O presente relatório apresenta os resultados da Avaliação Preliminar de Fatores de Risco Psicossociais Relacionados ao Trabalho (FRPRT), conforme NR-01.</p>

<div class="rpt-section">2. METODOLOGIA</div>
<p>Metodologia baseada no <strong>COPSOQ II</strong> (Copenhagen Psychosocial Questionnaire).</p>
<table class="rpt-table">
  <tr><th>Faixa</th><th>Classificação</th><th>Ação</th></tr>
  <tr><td><span class="rpt-badge red">0 a 49</span></td><td>Alto Risco</td><td>Intervenção imediata</td></tr>
  <tr><td><span class="rpt-badge yellow">50 a 74</span></td><td>Moderado</td><td>Monitoramento e ações preventivas</td></tr>
  <tr><td><span class="rpt-badge green">75 a 100</span></td><td>Baixo Risco</td><td>Manter práticas existentes</td></tr>
</table>

<div class="rpt-section">3. AMOSTRA</div>
<table class="rpt-table">
  <tr><td class="label">Setores</td><td>${sectors.join(", ")}</td></tr>
  <tr><td class="label">Postos de trabalho</td><td>${workstations.length}</td></tr>
  <tr><td class="label">Avaliações psicossociais</td><td>${psychosocial.length}</td></tr>
  <tr><td class="label">Período</td><td>${getToday()}</td></tr>
</table>

<div class="rpt-section">5. RESULTADO DA AVALIAÇÃO</div>
${psychosocial.length > 0 ? psychosocial.map(psa => {
  if (!psa.copenhagen_details) return "";
  const cd = psa.copenhagen_details;
  return `
<div class="rpt-section2">COPSOQ II — Resultados por Domínio</div>
<table class="rpt-table">
  <tr><th class="teal">Domínio</th><th class="teal">Score</th><th class="teal">Classificação</th></tr>
  ${([
    ["Demandas Quantitativas", cd.quantitative_demands], ["Ritmo de Trabalho", cd.work_pace],
    ["Demandas Cognitivas", cd.cognitive_demands], ["Demandas Emocionais", cd.emotional_demands],
    ["Influência no Trabalho", cd.influence], ["Desenvolvimento", cd.possibilities_development],
    ["Significado do Trabalho", cd.meaning_work], ["Compromisso", cd.commitment],
    ["Previsibilidade", cd.predictability], ["Suporte Social", cd.social_support],
  ] as [string, number][]).map(([dim, val]) => `<tr><td>${dim}</td><td><strong>${val}</strong></td><td>${classifyRisk(val)}</td></tr>`).join("")}
</table>
${psa.nasa_tlx_details ? `
<div class="rpt-section2">NASA-TLX — Carga de Trabalho</div>
<table class="rpt-table">
  <tr><th class="alt">Dimensão</th><th class="alt">Score (0-100)</th></tr>
  <tr><td>Demanda Mental</td><td>${psa.nasa_tlx_details.mental_demand}</td></tr>
  <tr><td>Demanda Física</td><td>${psa.nasa_tlx_details.physical_demand}</td></tr>
  <tr><td>Demanda Temporal</td><td>${psa.nasa_tlx_details.temporal_demand}</td></tr>
  <tr><td>Performance</td><td>${psa.nasa_tlx_details.performance}</td></tr>
  <tr><td>Esforço</td><td>${psa.nasa_tlx_details.effort}</td></tr>
  <tr><td>Frustração</td><td>${psa.nasa_tlx_details.frustration}</td></tr>
  <tr><td class="label"><strong>Score Geral</strong></td><td><strong>${psa.nasa_tlx_score}</strong></td></tr>
</table>` : ""}
<p><strong>Observações:</strong> ${psa.observations}</p>`;
}).join("") : `<div class="rpt-callout danger">Nenhuma avaliação psicossocial encontrada. Recomenda-se aplicação urgente dos questionários.</div>`}

<div class="rpt-section">6. RECOMENDAÇÕES</div>
<table class="rpt-table">
  <tr><th class="teal">Ação</th><th class="teal">Detalhamento</th><th class="teal">Prazo</th><th class="teal">Prioridade</th></tr>
  <tr><td><strong>Gestão de Estresse</strong></td><td>Capacitação sobre técnicas de manejo do estresse</td><td>60 dias</td><td><span class="rpt-badge yellow">Média</span></td></tr>
  <tr><td><strong>Adequação da Carga</strong></td><td>Reorganizar tarefas nos setores com alto risco</td><td>45 dias</td><td><span class="rpt-badge orange">Alta</span></td></tr>
  <tr><td><strong>Canal de Feedback</strong></td><td>Canais contínuos de relato de condições</td><td>30 dias</td><td><span class="rpt-badge orange">Alta</span></td></tr>
  <tr><td><strong>Avaliações Periódicas</strong></td><td>Novas avaliações semestrais</td><td>6 meses</td><td><span class="rpt-badge yellow">Média</span></td></tr>
</table>

<div class="rpt-section">7. CONSIDERAÇÕES FINAIS</div>
<p>A implementação das ações recomendadas pode contribuir significativamente para a redução dos riscos psicossociais.</p>
<div class="rpt-callout">A avaliação deve ser revisada periodicamente conforme NR-01.</div>
<div class="rpt-divider"></div>
<div class="rpt-sig">
  <p>_____________________________________________</p>
  <p><strong>${consultant}</strong></p>
  <p>Engenheiro de Segurança do Trabalho — CREA/CONFEA: XXXXX</p>
  <p style="font-size:11px; color:#90A4AE; margin-top:15px;"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
</div>`;
}

function generatePCMSOReport(ctx: ReportContext): string {
  const { company, workstations } = ctx;
  const consultant = ctx.consultantName || "Médico do Trabalho";
  const sectors = [...new Set(workstations.map(w => w.sector?.name || "Geral"))];

  return `${vividStyles()}
<div class="rpt-cover">
  <h1>PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL</h1>
  <h2>PCMSO</h2>
  <p class="company">${company.name}</p>
  <p class="meta">CNPJ: ${company.cnpj}</p>
  <p class="meta">${company.address} — ${company.city}/${company.state}</p>
  <p class="meta" style="margin-top:30px;">Emissão: ${getToday()} | Médico Responsável: ${consultant}</p>
  <p class="meta" style="font-size:12px; margin-top:15px;">MG Consultoria — Ergonomia & Segurança do Trabalho</p>
</div>

<div class="rpt-section">1. DEFINIÇÕES E ABREVIATURAS</div>
<table class="rpt-table">
  <tr><th>Termo</th><th>Definição</th></tr>
  <tr><td class="label">ASO</td><td>Atestado de Saúde Ocupacional</td></tr>
  <tr><td class="label">PCMSO</td><td>Programa de Controle Médico de Saúde Ocupacional</td></tr>
  <tr><td class="label">PGR</td><td>Programa de Gerenciamento de Riscos</td></tr>
  <tr><td class="label">GHE</td><td>Grupos Homogêneos de Exposição</td></tr>
  <tr><td class="label">NR</td><td>Norma Regulamentadora</td></tr>
</table>

<div class="rpt-section">3. IDENTIFICAÇÃO DA EMPRESA</div>
<table class="rpt-table">
  <tr><td class="label">Razão Social</td><td>${company.name}</td></tr>
  <tr><td class="label">CNPJ</td><td>${company.cnpj}</td></tr>
  <tr><td class="label">Endereço</td><td>${company.address}</td></tr>
  <tr><td class="label">Cidade/UF</td><td>${company.city}/${company.state}</td></tr>
  <tr><td class="label">Setores</td><td>${sectors.join(", ")}</td></tr>
</table>

<div class="rpt-section">4. INTRODUÇÃO</div>
<div class="rpt-callout">O PCMSO é um programa de caráter preventivo, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.</div>
<p>O Programa tem como finalidade a promoção e preservação da saúde do conjunto dos trabalhadores da empresa, planejado com base nos riscos identificados no PGR.</p>

<div class="rpt-section">5. OBJETIVOS</div>
<div class="rpt-section3">5.1 Objetivo Geral</div>
<p>Promoção e preservação da saúde dos trabalhadores, através da prevenção, rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho.</p>
<div class="rpt-section3">5.2 Objetivos Específicos</div>
<ul>
  <li>Definir exames médicos ocupacionais obrigatórios</li>
  <li>Estabelecer critérios para exames complementares conforme riscos</li>
  <li>Monitorar a saúde dos trabalhadores expostos</li>
  <li>Subsidiar ações de prevenção e promoção da saúde</li>
</ul>

<div class="rpt-section">8. MÉDICO RESPONSÁVEL</div>
<table class="rpt-table">
  <tr><td class="label">Médico Coordenador</td><td>${consultant}</td></tr>
  <tr><td class="label">Especialidade</td><td>Medicina do Trabalho</td></tr>
  <tr><td class="label">CRM</td><td>XXXXX</td></tr>
  <tr><td class="label">Vigência</td><td>${getToday()} a ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("pt-BR")}</td></tr>
</table>

<div class="rpt-section">10. EXAMES MÉDICOS OCUPACIONAIS</div>
<table class="rpt-table">
  <tr><th class="alt">Tipo de Exame</th><th class="alt">Momento</th><th class="alt">Prazo</th></tr>
  <tr><td><strong>Admissional</strong></td><td>Antes do início das atividades</td><td>Antes da admissão</td></tr>
  <tr><td><strong>Periódico</strong></td><td>Durante a vigência do contrato</td><td>Anual ou semestral</td></tr>
  <tr><td><strong>Retorno ao Trabalho</strong></td><td>Após afastamento ≥30 dias</td><td>No 1º dia de retorno</td></tr>
  <tr><td><strong>Mudança de Risco</strong></td><td>Ao mudar de função/setor</td><td>Antes da mudança</td></tr>
  <tr><td><strong>Demissional</strong></td><td>No desligamento</td><td>Até 10 dias antes</td></tr>
</table>

<div class="rpt-section">14. AVALIAÇÃO DOS RISCOS E EXAMES RECOMENDADOS</div>
<table class="rpt-table">
  <tr><th class="teal">Risco</th><th class="teal">Exames Complementares</th><th class="teal">Periodicidade</th></tr>
  <tr><td><strong>Ruído</strong></td><td>Audiometria tonal e vocal</td><td>Semestral</td></tr>
  <tr><td><strong>Ergonômico</strong></td><td>Avaliação clínica osteomuscular</td><td>Anual</td></tr>
  <tr><td><strong>Químico</strong></td><td>Hemograma, função hepática e renal</td><td>Semestral</td></tr>
  <tr><td><strong>Biológico</strong></td><td>Hemograma completo, sorologia</td><td>Anual</td></tr>
</table>

<div class="rpt-section">17. AÇÕES MÉDICAS PREVENTIVAS — VACINAÇÃO</div>
<table class="rpt-table">
  <tr><th>Vacina</th><th>Esquema</th><th>Indicação</th></tr>
  <tr><td><strong>Hepatite B</strong></td><td>3 doses (0, 1 e 6 meses)</td><td>Todos</td></tr>
  <tr><td><strong>Tétano/Difteria</strong></td><td>3 doses + reforço 10 anos</td><td>Todos</td></tr>
  <tr><td><strong>Influenza</strong></td><td>Dose anual</td><td>Todos</td></tr>
  <tr><td><strong>COVID-19</strong></td><td>Conforme orientação</td><td>Todos</td></tr>
</table>

<div class="rpt-section">21. CONCLUSÃO</div>
<p>O presente PCMSO foi elaborado com base nos riscos ocupacionais identificados no PGR. Sua implementação contribuirá para a promoção e preservação da saúde dos colaboradores.</p>
<div class="rpt-callout">O PCMSO deve ser revisado anualmente ou sempre que houver alteração nos riscos ocupacionais.</div>
<div class="rpt-divider"></div>
<div class="rpt-sig">
  <p>_____________________________________________</p>
  <p><strong>${consultant}</strong></p>
  <p>Médico do Trabalho — CRM: XXXXX</p>
  <p style="font-size:11px; color:#90A4AE; margin-top:15px;"><em>Documento gerado pelo sistema Spartan — MG Consultoria</em></p>
</div>`;
}
