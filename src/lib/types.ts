export interface Company {
  id: string;
  name: string;
  trade_name: string;
  cnpj: string;
  cnae_principal: string;
  cnae_secundario: string;
  activity_risk: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  description: string;
  is_pro: boolean;
  logo_url?: string;
  license_key?: string;
  created_at: string;
}

export interface Sector {
  id: string;
  company_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Workstation {
  id: string;
  sector_id: string;
  name: string;
  description: string;
  activity_description: string;
  tasks_performed: string;
  created_at: string;
  sector?: Sector;
}

export interface Task {
  id: string;
  workstation_id: string;
  description: string;
  created_at: string;
}

export interface PosturePhoto {
  id: string;
  workstation_id: string;
  image_url: string;
  posture_type: string;
  notes: string;
  timestamp: string;
  created_at: string;
}

export type AnalysisStatus = "pending" | "in_progress" | "completed";

export interface PostureAnalysis {
  id: string;
  workstation_id: string;
  joint_angles: Record<string, number>;
  ergonomic_scores: Record<string, number>;
  risk_level: RiskLevel;
  created_at: string;
}

export interface Analysis {
  id: string;
  workstation_id: string;
  method: ErgonomicMethod;
  score: number;
  notes: string;
  body_parts: Record<string, number>;
  analysis_status: AnalysisStatus;
  created_at: string;
  workstation?: Workstation;
}

export type ErgonomicMethod = "RULA" | "REBA" | "ROSA" | "OWAS" | "OCRA" | "ANSI-365";

export interface PsychosocialAnalysis {
  id: string;
  company_id: string;
  workstation_id?: string;
  evaluator_name: string;
  nasa_tlx_score: number | null;
  nasa_tlx_details: {
    mental_demand: number;
    physical_demand: number;
    temporal_demand: number;
    performance: number;
    effort: number;
    frustration: number;
  } | null;
  hse_it_score: number | null;
  hse_it_details: {
    demands: number;
    control: number;
    support: number;
    relationships: number;
    role: number;
    change: number;
  } | null;
  copenhagen_score: number | null;
  copenhagen_details: {
    quantitative_demands: number;
    work_pace: number;
    cognitive_demands: number;
    emotional_demands: number;
    influence: number;
    possibilities_development: number;
    meaning_work: number;
    commitment: number;
    predictability: number;
    social_support: number;
  } | null;
  observations: string;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  analysis_id: string;
  probability: number;
  exposure: number;
  consequence: number;
  risk_score: number;
  risk_level: RiskLevel;
  description: string;
  created_at: string;
  analysis?: Analysis;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ActionPlan {
  id: string;
  risk_assessment_id: string;
  description: string;
  responsible: string;
  deadline: string;
  status: ActionStatus;
  created_at: string;
  risk_assessment?: RiskAssessment;
}

export type ActionStatus = "pending" | "approved" | "in_progress" | "completed";

export interface Report {
  id: string;
  company_id?: string;
  type: ReportType;
  title: string;
  content: string;
  sector_id?: string;
  workstation_id?: string;
  generated_pdf?: string;
  created_at: string;
}

export type ReportType = "AEP" | "AET" | "PGR" | "PCMSO" | "LTCAT" | "Insalubridade" | "Periculosidade" | "PCA" | "PPR" | "APR";

export const MIN_PHOTOS_REQUIRED = 5;

export function calculateRiskScore(probability: number, exposure: number, consequence: number): number {
  return probability * exposure * consequence;
}

export function classifyRisk(score: number): RiskLevel {
  if (score <= 20) return "low";
  if (score <= 70) return "medium";
  if (score <= 200) return "high";
  return "critical";
}

export function riskLevelLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    critical: "Crítico",
  };
  return labels[level];
}

export function statusLabel(status: ActionStatus): string {
  const labels: Record<ActionStatus, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    in_progress: "Em Andamento",
    completed: "Concluído",
  };
  return labels[status];
}

export function analysisStatusLabel(status: AnalysisStatus): string {
  const labels: Record<AnalysisStatus, string> = {
    pending: "Pendente",
    in_progress: "Em Andamento",
    completed: "Concluída",
  };
  return labels[status];
}

export function classifyAngleRisk(joint: string, angle: number): RiskLevel {
  switch (joint) {
    case "knee":
      if (angle >= 160) return "low";
      if (angle >= 140) return "medium";
      if (angle >= 110) return "high";
      return "critical";
    case "trunk":
      if (angle <= 10) return "low";
      if (angle <= 20) return "medium";
      if (angle <= 40) return "high";
      return "critical";
    case "arm":
    case "shoulder":
      if (angle <= 20) return "low";
      if (angle <= 45) return "medium";
      if (angle <= 90) return "high";
      return "critical";
    default:
      return "low";
  }
}

export function nasaTlxOverallScore(details: PsychosocialAnalysis["nasa_tlx_details"]): number {
  if (!details) return 0;
  const { mental_demand, physical_demand, temporal_demand, performance, effort, frustration } = details;
  return Math.round((mental_demand + physical_demand + temporal_demand + performance + effort + frustration) / 6);
}
