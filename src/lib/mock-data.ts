import type { Sector, Workstation, Analysis, RiskAssessment, ActionPlan, Report, RiskLevel, Company, PosturePhoto, Task, PsychosocialAnalysis, PostureAnalysis } from "./types";
import { calculateRiskScore, classifyRisk } from "./types";

export const mockCompanies: Company[] = [
  { id: "comp1", name: "Yello Sucos & Lanches", cnpj: "31.643.918/0001-82", address: "Rua das Flores, 150", city: "Fortaleza", state: "CE", description: "Empresa do ramo alimentício especializada em sucos naturais e lanches", created_at: "2025-01-01" },
  { id: "comp2", name: "MedTraum Saúde Ocupacional", cnpj: "98.765.432/0001-10", address: "Av. Santos Dumont, 500", city: "Fortaleza", state: "CE", description: "Clínica de saúde ocupacional e medicina do trabalho", created_at: "2025-01-10" },
];

export const mockSectors: Sector[] = [
  { id: "s1", company_id: "comp1", name: "Cozinha", description: "Área de preparo de alimentos e sucos", created_at: "2025-01-15" },
  { id: "s2", company_id: "comp1", name: "Atendimento", description: "Balcão de atendimento ao público", created_at: "2025-01-15" },
  { id: "s3", company_id: "comp1", name: "Limpeza", description: "Higienização e conservação do ambiente", created_at: "2025-02-01" },
  { id: "s4", company_id: "comp2", name: "Administração", description: "Escritório administrativo", created_at: "2025-02-10" },
  { id: "s5", company_id: "comp2", name: "Área Técnica", description: "Atendimentos clínicos e exames", created_at: "2025-02-10" },
];

export const mockWorkstations: Workstation[] = [
  { id: "w1", sector_id: "s1", name: "Operador de Chapa", description: "Chapa industrial para preparo de lanches", activity_description: "Preparo de lanches quentes na chapa industrial", tasks_performed: "Montar lanches, operar chapa, higienizar equipamentos", created_at: "2025-01-20" },
  { id: "w2", sector_id: "s1", name: "Preparador de Sucos", description: "Bancada de sucos e vitaminas", activity_description: "Preparo de sucos naturais e vitaminas", tasks_performed: "Cortar frutas, operar liquidificador, servir bebidas", created_at: "2025-01-20" },
  { id: "w3", sector_id: "s2", name: "Atendente de Caixa", description: "Caixa registradora e atendimento", activity_description: "Atendimento ao cliente e operação do caixa", tasks_performed: "Registrar pedidos, receber pagamentos, atender clientes", created_at: "2025-02-01" },
  { id: "w4", sector_id: "s3", name: "Auxiliar de Limpeza", description: "Limpeza geral do estabelecimento", activity_description: "Higienização e conservação do ambiente", tasks_performed: "Varrer, lavar, higienizar equipamentos e banheiros", created_at: "2025-02-05" },
  { id: "w5", sector_id: "s4", name: "Assistente Administrativo", description: "Escritório com estação de trabalho informatizada", activity_description: "Atividades administrativas em escritório", tasks_performed: "Digitação, atendimento telefônico, arquivo de documentos", created_at: "2025-02-10" },
];

export const mockTasks: Task[] = [
  { id: "t1", workstation_id: "w1", description: "Montar lanches na chapa quente", created_at: "2025-01-20" },
  { id: "t2", workstation_id: "w1", description: "Higienizar a chapa e utensílios", created_at: "2025-01-20" },
  { id: "t3", workstation_id: "w2", description: "Cortar frutas e preparar ingredientes", created_at: "2025-01-20" },
  { id: "t4", workstation_id: "w2", description: "Operar liquidificador industrial", created_at: "2025-01-20" },
  { id: "t5", workstation_id: "w3", description: "Registrar pedidos no sistema PDV", created_at: "2025-02-01" },
  { id: "t6", workstation_id: "w3", description: "Receber pagamentos em dinheiro e cartão", created_at: "2025-02-01" },
  { id: "t7", workstation_id: "w4", description: "Varrer e lavar pisos", created_at: "2025-02-05" },
  { id: "t8", workstation_id: "w4", description: "Higienizar banheiros e áreas comuns", created_at: "2025-02-05" },
  { id: "t9", workstation_id: "w5", description: "Digitação e elaboração de relatórios", created_at: "2025-02-10" },
  { id: "t10", workstation_id: "w5", description: "Atendimento telefônico e presencial", created_at: "2025-02-10" },
];

export const mockPosturePhotos: PosturePhoto[] = [
  { id: "pp1", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Postura ao operar chapa", timestamp: "2025-03-01T10:00:00", created_at: "2025-03-01" },
  { id: "pp2", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Extensão cervical", notes: "Olhando para prateleira alta", timestamp: "2025-03-01T10:15:00", created_at: "2025-03-01" },
  { id: "pp3", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Girando para bancada lateral", timestamp: "2025-03-02T09:00:00", created_at: "2025-03-02" },
  { id: "pp4", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Elevação de braços", notes: "Alcançando ingredientes em prateleira alta", timestamp: "2025-03-02T09:30:00", created_at: "2025-03-02" },
  { id: "pp5", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Permanência em pé durante turno", timestamp: "2025-03-02T11:00:00", created_at: "2025-03-02" },
  { id: "pp6", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Pegando frutas em caixa baixa", timestamp: "2025-03-03T08:00:00", created_at: "2025-03-03" },
  { id: "pp7", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Elevação de braços", notes: "Operando liquidificador", timestamp: "2025-03-03T08:30:00", created_at: "2025-03-03" },
  { id: "pp8", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Flexão de punho", notes: "Cortando frutas com faca", timestamp: "2025-03-03T09:00:00", created_at: "2025-03-03" },
  { id: "pp9", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Alcançando copos no balcão", timestamp: "2025-03-04T10:00:00", created_at: "2025-03-04" },
  { id: "pp10", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Postura em pé", notes: "Em pé durante preparo", timestamp: "2025-03-04T10:30:00", created_at: "2025-03-04" },
  { id: "pp11", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Postura em pé", notes: "Atendimento no caixa", timestamp: "2025-03-05T08:00:00", created_at: "2025-03-05" },
  { id: "pp12", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Olhando para tela do PDV", timestamp: "2025-03-05T09:00:00", created_at: "2025-03-05" },
  { id: "pp13", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Operando teclado numérico", timestamp: "2025-03-06T10:00:00", created_at: "2025-03-06" },
  { id: "pp14", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Olhando para cliente e tela", timestamp: "2025-03-06T11:00:00", created_at: "2025-03-06" },
  { id: "pp15", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Inclinação de tronco", notes: "Pegando troco na gaveta", timestamp: "2025-03-07T08:00:00", created_at: "2025-03-07" },
  { id: "pp16", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Postura sentada", notes: "Trabalho em computador", timestamp: "2025-03-08T08:00:00", created_at: "2025-03-08" },
  { id: "pp17", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo documentos na mesa", timestamp: "2025-03-08T09:00:00", created_at: "2025-03-08" },
  { id: "pp18", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Digitação prolongada", timestamp: "2025-03-08T10:00:00", created_at: "2025-03-08" },
  { id: "pp19", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Pegando arquivo no gaveteiro", timestamp: "2025-03-09T08:00:00", created_at: "2025-03-09" },
  { id: "pp20", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Atendendo telefone", timestamp: "2025-03-09T09:00:00", created_at: "2025-03-09" },
];

export const mockPostureAnalyses: PostureAnalysis[] = [
  { id: "pa1", workstation_id: "w1", joint_angles: { neck: 25, shoulder: 35, elbow: 90, trunk: 30, hip: 85, knee: 170 }, ergonomic_scores: { REBA: 8, RULA: 6 }, risk_level: "high", created_at: "2025-03-02" },
  { id: "pa2", workstation_id: "w2", joint_angles: { neck: 15, shoulder: 40, elbow: 100, trunk: 20, hip: 90, knee: 175 }, ergonomic_scores: { REBA: 6, RULA: 5 }, risk_level: "medium", created_at: "2025-03-04" },
  { id: "pa3", workstation_id: "w3", joint_angles: { neck: 20, shoulder: 15, elbow: 85, trunk: 10, hip: 95, knee: 90 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-03-07" },
  { id: "pa4", workstation_id: "w5", joint_angles: { neck: 30, shoulder: 10, elbow: 90, trunk: 15, hip: 90, knee: 90 }, ergonomic_scores: { ROSA: 4 }, risk_level: "medium", created_at: "2025-03-09" },
];

export const mockAnalyses: Analysis[] = [
  { id: "a1", workstation_id: "w1", method: "REBA", score: 8, notes: "Flexão excessiva de tronco ao operar a chapa. Postura em pé prolongada com rotações frequentes.", body_parts: { trunk: 4, neck: 2, legs: 2, upper_arm: 3, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-03-01" },
  { id: "a2", workstation_id: "w2", method: "RULA", score: 6, notes: "Movimentos repetitivos nos braços ao cortar frutas. Elevação frequente dos braços acima do nível do ombro.", body_parts: { upper_arm: 3, lower_arm: 2, wrist: 3, neck: 2, trunk: 2, legs: 1 }, analysis_status: "completed", created_at: "2025-03-05" },
  { id: "a3", workstation_id: "w3", method: "ROSA", score: 5, notes: "Postura em pé prolongada sem apoio. Bancada do caixa com altura inadequada.", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-03-08" },
  { id: "a4", workstation_id: "w4", method: "REBA", score: 9, notes: "Flexão de tronco acentuada ao limpar pisos. Movimentos repetitivos com membros superiores.", body_parts: { trunk: 5, neck: 2, legs: 2, upper_arm: 3, lower_arm: 3, wrist: 2 }, analysis_status: "in_progress", created_at: "2025-03-10" },
  { id: "a5", workstation_id: "w5", method: "ROSA", score: 4, notes: "Monitor abaixo da linha dos olhos. Cadeira sem apoio lombar adequado.", body_parts: { chair: 3, monitor: 3, keyboard: 2, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-03-12" },
];

const riskData: Array<{ probability: number; exposure: number; consequence: number }> = [
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 3, exposure: 6, consequence: 3 },
  { probability: 3, exposure: 6, consequence: 1 },
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 1, exposure: 10, consequence: 1 },
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
  { id: "ap1", risk_assessment_id: "r1", description: "Instalar bancada regulável em altura na área da chapa", responsible: "João Silva", deadline: "2025-04-15", status: "in_progress", created_at: "2025-03-02" },
  { id: "ap2", risk_assessment_id: "r2", description: "Reorganizar layout da bancada de sucos para reduzir elevação de braços", responsible: "Maria Santos", deadline: "2025-04-01", status: "approved", created_at: "2025-03-06" },
  { id: "ap3", risk_assessment_id: "r3", description: "Adquirir tapete anti-fadiga para o caixa e ajustar altura da bancada", responsible: "Carlos Lima", deadline: "2025-03-30", status: "completed", created_at: "2025-03-09" },
  { id: "ap4", risk_assessment_id: "r4", description: "Fornecer utensílios de limpeza com cabos longos para reduzir flexão", responsible: "Ana Costa", deadline: "2025-04-20", status: "pending", created_at: "2025-03-13" },
  { id: "ap5", risk_assessment_id: "r5", description: "Adquirir suporte para monitor e cadeira ergonômica com apoio lombar", responsible: "Pedro Souza", deadline: "2025-04-10", status: "approved", created_at: "2025-03-15" },
];

export const mockPsychosocialAnalyses: PsychosocialAnalysis[] = [
  {
    id: "psa1",
    company_id: "comp1",
    workstation_id: "w1",
    evaluator_name: "Dr. Marco Gomes",
    nasa_tlx_score: 62,
    nasa_tlx_details: { mental_demand: 55, physical_demand: 80, temporal_demand: 70, performance: 40, effort: 65, frustration: 60 },
    hse_it_score: 3.2,
    hse_it_details: { demands: 3.5, control: 2.8, support: 3.0, relationships: 3.5, role: 3.0, change: 3.4 },
    copenhagen_score: 58,
    copenhagen_details: { quantitative_demands: 65, work_pace: 70, cognitive_demands: 50, emotional_demands: 45, influence: 40, possibilities_development: 55, meaning_work: 70, commitment: 65, predictability: 50, social_support: 60 },
    observations: "Trabalhadores relatam alta demanda física e pressão temporal durante horários de pico.",
    created_at: "2025-03-10",
  },
  {
    id: "psa2",
    company_id: "comp1",
    workstation_id: "w3",
    evaluator_name: "Dr. Marco Gomes",
    nasa_tlx_score: 48,
    nasa_tlx_details: { mental_demand: 60, physical_demand: 30, temporal_demand: 55, performance: 50, effort: 45, frustration: 50 },
    hse_it_score: 3.8,
    hse_it_details: { demands: 3.2, control: 4.0, support: 4.0, relationships: 4.0, role: 3.8, change: 3.8 },
    copenhagen_score: 42,
    copenhagen_details: { quantitative_demands: 50, work_pace: 55, cognitive_demands: 45, emotional_demands: 35, influence: 50, possibilities_development: 40, meaning_work: 60, commitment: 55, predictability: 55, social_support: 65 },
    observations: "Demanda mental moderada. Bom suporte organizacional.",
    created_at: "2025-03-12",
  },
];

export const mockReports: Report[] = [
  { id: "rp1", company_id: "comp1", type: "AEP", title: "Avaliação Ergonômica Preliminar - Cozinha", content: "Avaliação preliminar dos postos de trabalho do setor de cozinha...", sector_id: "s1", workstation_id: "w1", created_at: "2025-03-01" },
  { id: "rp2", company_id: "comp1", type: "AET", title: "Análise Ergonômica do Trabalho - Atendimento", content: "Análise detalhada das condições ergonômicas do setor de atendimento...", sector_id: "s2", workstation_id: "w3", created_at: "2025-03-05" },
];

export function getRiskDistribution() {
  const dist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  mockRiskAssessments.forEach((r) => dist[r.risk_level]++);
  return dist;
}

export function getPhotoCountForWorkstation(workstationId: string): number {
  return mockPosturePhotos.filter((p) => p.workstation_id === workstationId).length;
}
