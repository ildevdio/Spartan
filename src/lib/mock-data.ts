import type { Sector, Workstation, Analysis, RiskAssessment, ActionPlan, Report, RiskLevel, Company } from "./types";
import { calculateRiskScore, classifyRisk } from "./types";

export const mockCompanies: Company[] = [
  { id: "comp1", name: "Indústria ABC Ltda", cnpj: "12.345.678/0001-90", address: "Rua Industrial, 100 - São Paulo/SP", description: "Indústria metalúrgica de médio porte", created_at: "2025-01-01" },
  { id: "comp2", name: "Logística XYZ S.A.", cnpj: "98.765.432/0001-10", address: "Av. Transportes, 500 - Campinas/SP", description: "Empresa de logística e distribuição", created_at: "2025-01-10" },
];

export const mockSectors: Sector[] = [
  { id: "s1", company_id: "comp1", name: "Produção", description: "Linha de produção industrial", created_at: "2025-01-15" },
  { id: "s2", company_id: "comp1", name: "Administrativo", description: "Escritórios administrativos", created_at: "2025-01-15" },
  { id: "s3", company_id: "comp1", name: "Logística", description: "Armazém e expedição", created_at: "2025-02-01" },
  { id: "s4", company_id: "comp2", name: "Manutenção", description: "Oficina e manutenção", created_at: "2025-02-10" },
];

export const mockWorkstations: Workstation[] = [
  { id: "w1", sector_id: "s1", name: "Operador de Prensa", description: "Prensa hidráulica 200t", tasks_performed: "Estampar peças metálicas, alimentar máquina, retirar peças", created_at: "2025-01-20" },
  { id: "w2", sector_id: "s1", name: "Montador", description: "Linha de montagem manual", tasks_performed: "Montagem de subconjuntos, inspeção visual, embalagem", created_at: "2025-01-20" },
  { id: "w3", sector_id: "s2", name: "Analista Financeiro", description: "Escritório setor financeiro", tasks_performed: "Digitação, análise de documentos, uso de computador", created_at: "2025-02-01" },
  { id: "w4", sector_id: "s3", name: "Operador de Empilhadeira", description: "Armazém principal", tasks_performed: "Movimentação de cargas, empilhamento, organização", created_at: "2025-02-05" },
  { id: "w5", sector_id: "s4", name: "Mecânico Industrial", description: "Oficina de manutenção", tasks_performed: "Reparo de equipamentos, soldagem, ajustes mecânicos", created_at: "2025-02-10" },
];

export const mockAnalyses: Analysis[] = [
  { id: "a1", workstation_id: "w1", method: "REBA", score: 9, notes: "Postura inadequada no tronco ao alimentar a prensa", body_parts: { trunk: 4, neck: 2, legs: 2, upper_arm: 3, lower_arm: 2, wrist: 2 }, created_at: "2025-03-01" },
  { id: "a2", workstation_id: "w2", method: "RULA", score: 6, notes: "Repetitividade alta nos movimentos de montagem", body_parts: { upper_arm: 3, lower_arm: 2, wrist: 3, neck: 2, trunk: 2, legs: 1 }, created_at: "2025-03-05" },
  { id: "a3", workstation_id: "w3", method: "ROSA", score: 5, notes: "Monitor abaixo da altura dos olhos, cadeira sem apoio lombar", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 2, telephone: 1 }, created_at: "2025-03-08" },
  { id: "a4", workstation_id: "w4", method: "OWAS", score: 3, notes: "Postura de rotação do tronco durante manobras", body_parts: { back: 3, arms: 2, legs: 2, load: 2 }, created_at: "2025-03-10" },
  { id: "a5", workstation_id: "w5", method: "REBA", score: 11, notes: "Postura forçada ao trabalhar em espaços confinados", body_parts: { trunk: 5, neck: 3, legs: 3, upper_arm: 4, lower_arm: 3, wrist: 3 }, created_at: "2025-03-12" },
];

const riskData: Array<{ probability: number; exposure: number; consequence: number }> = [
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 3, exposure: 6, consequence: 3 },
  { probability: 1, exposure: 10, consequence: 1 },
  { probability: 3, exposure: 3, consequence: 6 },
  { probability: 6, exposure: 6, consequence: 10 },
];

export const mockRiskAssessments: RiskAssessment[] = mockAnalyses.map((a, i) => {
  const d = riskData[i];
  const score = calculateRiskScore(d.probability, d.exposure, d.consequence);
  return {
    id: `r${i + 1}`,
    analysis_id: a.id,
    probability: d.probability,
    exposure: d.exposure,
    consequence: d.consequence,
    risk_score: score,
    risk_level: classifyRisk(score),
    description: a.notes,
    created_at: a.created_at,
  };
});

export const mockActionPlans: ActionPlan[] = [
  { id: "ap1", risk_assessment_id: "r1", description: "Instalar dispositivo de alimentação automática na prensa", responsible: "João Silva", deadline: "2025-04-15", status: "in_progress", created_at: "2025-03-02" },
  { id: "ap2", risk_assessment_id: "r2", description: "Implementar rodízio de tarefas na linha de montagem", responsible: "Maria Santos", deadline: "2025-04-01", status: "approved", created_at: "2025-03-06" },
  { id: "ap3", risk_assessment_id: "r3", description: "Adquirir suporte para monitor e cadeira ergonômica", responsible: "Carlos Lima", deadline: "2025-03-30", status: "completed", created_at: "2025-03-09" },
  { id: "ap4", risk_assessment_id: "r5", description: "Revisar procedimentos de manutenção em espaços confinados", responsible: "Ana Costa", deadline: "2025-04-20", status: "pending", created_at: "2025-03-13" },
];

export const mockReports: Report[] = [
  { id: "rp1", type: "AEP", title: "Avaliação Ergonômica Preliminar - Produção", content: "Avaliação preliminar dos postos de trabalho do setor de produção...", sector_id: "s1", created_at: "2025-03-01" },
  { id: "rp2", type: "AET", title: "Análise Ergonômica do Trabalho - Administrativo", content: "Análise detalhada das condições ergonômicas do setor administrativo...", sector_id: "s2", created_at: "2025-03-05" },
  { id: "rp3", type: "PCMSO", title: "PCMSO 2025", content: "Programa de Controle Médico de Saúde Ocupacional...", created_at: "2025-01-10" },
  { id: "rp4", type: "LTCAT", title: "LTCAT - Laudo Técnico", content: "Laudo Técnico das Condições Ambientais de Trabalho...", created_at: "2025-02-15" },
];

export function getRiskDistribution() {
  const dist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  mockRiskAssessments.forEach((r) => dist[r.risk_level]++);
  return dist;
}
