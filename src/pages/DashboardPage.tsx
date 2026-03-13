import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/lib/company-context";
import { mockRiskAssessments, mockActionPlans } from "@/lib/mock-data";
import { riskLevelLabel, MIN_PHOTOS_REQUIRED, type RiskLevel } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Building2, ClipboardCheck, AlertTriangle, Monitor, Layers, FileText, Camera, ListTodo } from "lucide-react";
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
    posturePhotos,
  } = useCompany();

  const companyAnalysisIds = companyAnalyses.map((a) => a.id);
  const companyRisks = mockRiskAssessments.filter((r) => companyAnalysisIds.includes(r.analysis_id));
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
    return { name: s.name, postos: ws.length, analises: analyses.length };
  });

  const analysesInProgress = companyAnalyses.filter((a) => a.analysis_status === "in_progress").length;

  const wsMissingPhotos = companyWorkstations.filter((ws) => {
    const count = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return count < MIN_PHOTOS_REQUIRED;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visão geral dos indicadores ergonômicos</p>
        </div>
        <CompanySelector />
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Building2} label="Empresas" value={companies.length} />
        <StatCard icon={Layers} label="Setores" value={companySectors.length} />
        <StatCard icon={Monitor} label="Postos" value={companyWorkstations.length} />
        <StatCard icon={ClipboardCheck} label="Em Análise" value={analysesInProgress} variant="warning" />
        <StatCard icon={FileText} label="Relatórios" value={companyReports.length} />
        <StatCard icon={AlertTriangle} label="Riscos Críticos" value={dist.critical + dist.high} variant="critical" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Distribuição de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 sm:h-64">
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
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum risco avaliado
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Análises por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 sm:h-64">
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} tick={{ fontSize: 10 }} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="postos" name="Postos" fill="hsl(174, 58%, 32%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="analises" name="Análises" fill="hsl(215, 28%, 17%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum setor cadastrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {wsMissingPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-warning" />
              Postos com Fotos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wsMissingPhotos.map((ws) => {
              const count = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              const progress = (count / MIN_PHOTOS_REQUIRED) * 100;
              return (
                <div key={ws.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    <p className="text-xs text-muted-foreground">{count} / {MIN_PHOTOS_REQUIRED} fotos</p>
                  </div>
                  <div className="w-full sm:w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Badge variant="outline" className="bg-warning/15 text-warning border-warning/20 shrink-0 self-start sm:self-auto">
                    Faltam {MIN_PHOTOS_REQUIRED - count}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Análises Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companyAnalyses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma análise realizada</p>
            )}
            {companyAnalyses.slice(0, 5).map((a) => {
              const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
              const risk = companyRisks.find((r) => r.analysis_id === a.id);
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 rounded-lg bg-secondary/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ws?.name}</p>
                    <p className="text-xs text-muted-foreground">{a.method} — Score: {a.score}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{a.created_at}</span>
                    {risk && <RiskBadge level={risk.risk_level} />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, variant }: { icon: any; label: string; value: number; variant?: "critical" | "warning" }) {
  const bg = variant === "critical" ? "bg-critical/10 text-critical" : variant === "warning" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent";
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold">{value}</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate">{label}</p>
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
