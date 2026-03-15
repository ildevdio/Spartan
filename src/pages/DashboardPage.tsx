import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/lib/company-context";
import { mockRiskAssessments, mockActionPlans, mockPostureAnalyses, mockPsychosocialAnalyses } from "@/lib/mock-data";
import { riskLevelLabel, MIN_PHOTOS_REQUIRED, type RiskLevel, statusLabel } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Building2, ClipboardCheck, AlertTriangle, Monitor, Layers, FileText, Camera, TrendingUp, ShieldAlert, Activity, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanySelector } from "@/components/CompanySelector";
import { Progress } from "@/components/ui/progress";

const RISK_COLORS: Record<string, string> = {
  low: "hsl(152, 56%, 39%)",
  medium: "hsl(38, 92%, 50%)",
  high: "hsl(25, 95%, 53%)",
  critical: "hsl(0, 72%, 51%)",
};

export default function DashboardPage() {
  const {
    companies, companySectors, companyWorkstations,
    companyAnalyses, companyPhotos, companyReports,
    posturePhotos, selectedCompany, selectedCompanyId,
  } = useCompany();

  const companyAnalysisIds = companyAnalyses.map((a) => a.id);
  const companyRisks = mockRiskAssessments.filter((r) => companyAnalysisIds.includes(r.analysis_id));
  const companyActions = mockActionPlans.filter((ap) => companyRisks.some((r) => r.id === ap.risk_assessment_id));
  const companyPostureAnalyses = mockPostureAnalyses.filter((pa) => companyWorkstations.some((w) => w.id === pa.workstation_id));
  const companyPsychosocial = mockPsychosocialAnalyses.filter((p) => p.company_id === selectedCompanyId);

  const dist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  companyRisks.forEach((r) => dist[r.risk_level]++);

  const pieData = Object.entries(dist)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: riskLevelLabel(key as RiskLevel),
      value,
      color: RISK_COLORS[key],
    }));

  const sectorData = companySectors.map((s) => {
    const ws = companyWorkstations.filter((w) => w.sector_id === s.id);
    const wsIds = ws.map((w) => w.id);
    const analyses = companyAnalyses.filter((a) => wsIds.includes(a.workstation_id));
    const photos = posturePhotos.filter((p) => wsIds.includes(p.workstation_id));
    return { name: s.name, postos: ws.length, analises: analyses.length, fotos: photos.length };
  });

  const analysesCompleted = companyAnalyses.filter((a) => a.analysis_status === "completed").length;
  const analysesInProgress = companyAnalyses.filter((a) => a.analysis_status === "in_progress").length;
  const analysesPending = companyAnalyses.filter((a) => a.analysis_status === "pending").length;
  const totalPhotos = posturePhotos.filter((p) => companyWorkstations.some((w) => w.id === p.workstation_id)).length;

  const actionsCompleted = companyActions.filter((a) => a.status === "completed").length;
  const actionsPending = companyActions.filter((a) => a.status !== "completed").length;
  const actionCompletionRate = companyActions.length > 0 ? Math.round((actionsCompleted / companyActions.length) * 100) : 0;

  const wsMissingPhotos = companyWorkstations.filter((ws) => {
    const count = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return count < MIN_PHOTOS_REQUIRED;
  });

  const wsReadyForReport = companyWorkstations.filter((ws) => {
    const count = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return count >= MIN_PHOTOS_REQUIRED;
  });

  // Average ergonomic scores
  const avgREBA = companyPostureAnalyses.filter((p) => p.ergonomic_scores.REBA).length > 0
    ? (companyPostureAnalyses.reduce((sum, p) => sum + (p.ergonomic_scores.REBA || 0), 0) / companyPostureAnalyses.filter((p) => p.ergonomic_scores.REBA).length).toFixed(1)
    : "—";
  const avgROSA = companyPostureAnalyses.filter((p) => p.ergonomic_scores.ROSA).length > 0
    ? (companyPostureAnalyses.reduce((sum, p) => sum + (p.ergonomic_scores.ROSA || 0), 0) / companyPostureAnalyses.filter((p) => p.ergonomic_scores.ROSA).length).toFixed(1)
    : "—";

  // Method distribution
  const methodCounts: Record<string, number> = {};
  companyAnalyses.forEach((a) => { methodCounts[a.method] = (methodCounts[a.method] || 0) + 1; });
  const methodData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));

  // Radar data for psychosocial
  const radarData = companyPsychosocial.length > 0 ? (() => {
    const first = companyPsychosocial[0];
    if (!first.copenhagen_details) return [];
    return [
      { subject: "Demandas", value: first.copenhagen_details.quantitative_demands },
      { subject: "Ritmo", value: first.copenhagen_details.work_pace },
      { subject: "Cognitivo", value: first.copenhagen_details.cognitive_demands },
      { subject: "Emocional", value: first.copenhagen_details.emotional_demands },
      { subject: "Influência", value: first.copenhagen_details.influence },
      { subject: "Suporte", value: first.copenhagen_details.social_support },
    ];
  })() : [];

  // Top risk workstations
  const topRiskWs = companyRisks
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5)
    .map((r) => {
      const analysis = companyAnalyses.find((a) => a.id === r.analysis_id);
      const ws = companyWorkstations.find((w) => w.id === analysis?.workstation_id);
      return { ...r, workstationName: ws?.name || "—", method: analysis?.method || "—" };
    });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {selectedCompany?.name} — Visão geral dos indicadores ergonômicos
          </p>
        </div>
        <CompanySelector />
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        <StatCard icon={Building2} label="Empresas" value={companies.length} />
        <StatCard icon={Layers} label="Setores" value={companySectors.length} />
        <StatCard icon={Monitor} label="Postos" value={companyWorkstations.length} />
        <StatCard icon={Camera} label="Fotos" value={totalPhotos} />
        <StatCard icon={ClipboardCheck} label="Análises" value={companyAnalyses.length} />
        <StatCard icon={AlertTriangle} label="Riscos" value={companyRisks.length} variant={dist.critical > 0 ? "critical" : undefined} />
        <StatCard icon={Target} label="Ações" value={companyActions.length} />
        <StatCard icon={FileText} label="Relatórios" value={wsReadyForReport.length} subtitle="prontos" />
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Conclusão de Análises</span>
              <span className="text-sm font-bold">{companyAnalyses.length > 0 ? Math.round((analysesCompleted / companyAnalyses.length) * 100) : 0}%</span>
            </div>
            <Progress value={companyAnalyses.length > 0 ? (analysesCompleted / companyAnalyses.length) * 100 : 0} className="h-2" />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{analysesCompleted} concluídas</span>
              <span>{analysesInProgress} em andamento</span>
              <span>{analysesPending} pendentes</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Plano de Ação</span>
              <span className="text-sm font-bold">{actionCompletionRate}%</span>
            </div>
            <Progress value={actionCompletionRate} className="h-2" />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{actionsCompleted} concluídas</span>
              <span>{actionsPending} pendentes</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Cobertura Fotográfica</span>
              <span className="text-sm font-bold">{companyWorkstations.length > 0 ? Math.round((wsReadyForReport.length / companyWorkstations.length) * 100) : 0}%</span>
            </div>
            <Progress value={companyWorkstations.length > 0 ? (wsReadyForReport.length / companyWorkstations.length) * 100 : 0} className="h-2" />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{wsReadyForReport.length} prontos</span>
              <span>{wsMissingPhotos.length} pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-accent" />
              Distribuição de Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Nenhum risco avaliado</div>
              )}
            </div>
            {/* Risk summary below chart */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              {(["low", "medium", "high", "critical"] as RiskLevel[]).map((level) => (
                <div key={level} className="text-center p-1.5 rounded" style={{ backgroundColor: `${RISK_COLORS[level]}15` }}>
                  <p className="text-sm font-bold" style={{ color: RISK_COLORS[level] }}>{dist[level]}</p>
                  <p className="text-[9px] text-muted-foreground">{riskLevelLabel(level)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Análises por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="postos" name="Postos" fill="hsl(174, 58%, 32%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="analises" name="Análises" fill="hsl(215, 28%, 17%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fotos" name="Fotos" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Nenhum setor cadastrado</div>
              )}
            </div>
            {/* Sector summary */}
            <div className="space-y-1.5 mt-2">
              {sectorData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/50">
                  <span className="font-medium truncate">{s.name}</span>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>{s.postos} postos</span>
                    <span>{s.analises} análises</span>
                    <span>{s.fotos} fotos</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores and methods row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Average Scores */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Scores Médios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-xs text-muted-foreground">REBA (Postural)</p>
                <p className="text-2xl font-bold">{avgREBA}</p>
              </div>
              <Badge variant="outline" className={Number(avgREBA) > 7 ? "bg-high/15 text-high" : Number(avgREBA) > 4 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}>
                {Number(avgREBA) > 7 ? "Alto" : Number(avgREBA) > 4 ? "Médio" : "Baixo"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-xs text-muted-foreground">ROSA (Escritório)</p>
                <p className="text-2xl font-bold">{avgROSA}</p>
              </div>
              <Badge variant="outline" className={Number(avgROSA) > 5 ? "bg-high/15 text-high" : Number(avgROSA) > 3 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}>
                {Number(avgROSA) > 5 ? "Alto" : Number(avgROSA) > 3 ? "Médio" : "Baixo"}
              </Badge>
            </div>
            {companyPsychosocial.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-xs text-muted-foreground">NASA-TLX (Carga)</p>
                  <p className="text-2xl font-bold">{Math.round(companyPsychosocial.reduce((s, p) => s + (p.nasa_tlx_score || 0), 0) / companyPsychosocial.length)}</p>
                </div>
                <Badge variant="outline" className="bg-warning/15 text-warning">Moderada</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Methods used */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-accent" />
              Métodos Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              {methodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={10} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={50} />
                    <Tooltip />
                    <Bar dataKey="value" name="Qtd" fill="hsl(174, 58%, 32%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Nenhum método aplicado</div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {methodData.map((m) => (
                <Badge key={m.name} variant="outline" className="text-[10px]">
                  {m.name}: {m.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Psychosocial radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Perfil Psicossocial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                    <Radar name="Score" dataKey="value" stroke="hsl(174, 58%, 32%)" fill="hsl(174, 58%, 32%)" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma avaliação psicossocial
              </div>
            )}
            {companyPsychosocial.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                {companyPsychosocial.length} avaliação(ões) — COPSOQ II
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top risks table */}
      {topRiskWs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-high" />
              Postos com Maior Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRiskWs.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-lg bg-secondary/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.workstationName}</p>
                    <p className="text-xs text-muted-foreground">{r.method} — Score P×E×C: {r.risk_score}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <span>P:{r.probability} E:{r.exposure} C:{r.consequence}</span>
                    </div>
                    <RiskBadge level={r.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing photos */}
      {wsMissingPhotos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-warning" />
              Postos com Fotos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsMissingPhotos.map((ws) => {
              const count = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              const progress = (count / MIN_PHOTOS_REQUIRED) * 100;
              const sector = companySectors.find((s) => s.id === ws.sector_id);
              return (
                <div key={ws.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    <p className="text-[10px] text-muted-foreground">{sector?.name} — {count}/{MIN_PHOTOS_REQUIRED} fotos</p>
                  </div>
                  <div className="w-full sm:w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Badge variant="outline" className="bg-warning/15 text-warning border-warning/20 shrink-0 self-start sm:self-auto text-[10px]">
                    Faltam {MIN_PHOTOS_REQUIRED - count}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent analyses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Análises Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {companyAnalyses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma análise realizada</p>
            )}
            {companyAnalyses.slice(0, 8).map((a) => {
              const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
              const risk = companyRisks.find((r) => r.analysis_id === a.id);
              const sector = companySectors.find((s) => s.id === ws?.sector_id);
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-lg bg-secondary/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ws?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{sector?.name} — {a.method} — Score: {a.score}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{a.created_at}</span>
                    {risk && <RiskBadge level={risk.risk_level} />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent actions */}
      {companyActions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Ações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companyActions.slice(0, 5).map((action) => (
                <div key={action.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-lg bg-secondary/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{action.description}</p>
                    <p className="text-[10px] text-muted-foreground">{action.responsible} — Prazo: {action.deadline}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${action.status === "completed" ? "bg-success/15 text-success" : action.status === "in_progress" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
                    {statusLabel(action.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, variant, subtitle }: { icon: any; label: string; value: number; variant?: "critical" | "warning"; subtitle?: string }) {
  const bg = variant === "critical" ? "bg-critical/10 text-critical" : variant === "warning" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent";
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">{value}</p>
          <p className="text-[9px] text-muted-foreground leading-tight truncate">{label}</p>
          {subtitle && <p className="text-[8px] text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: "bg-success/15 text-success border-success/20",
    medium: "bg-warning/15 text-warning border-warning/20",
    high: "bg-high/15 text-high border-high/20",
    critical: "bg-critical/15 text-critical border-critical/20",
  };
  return (
    <Badge variant="outline" className={styles[level] || ""}>
      {riskLevelLabel(level as any)}
    </Badge>
  );
}