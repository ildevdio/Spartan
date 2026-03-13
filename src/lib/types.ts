export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  description: string;
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
  tasks_performed: string;
  created_at: string;
  sector?: Sector;
}

export interface PosturePhoto {
  id: string;
  workstation_id: string;
  image_url: string;
  posture_type: string;
  notes: string;
  created_at: string;
}

export type AnalysisStatus = "pending" | "in_progress" | "completed";

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
  type: ReportType;
  title: string;
  content: string;
  sector_id?: string;
  workstation_id?: string;
  generated_pdf?: string;
  created_at: string;
}

export type ReportType = "AEP" | "AET" | "PGR" | "PCMSO" | "LTCAT" | "Insalubridade" | "Periculosidade" | "PCA" | "PPR";

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
