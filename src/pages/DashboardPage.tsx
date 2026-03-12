import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAnalyses, mockWorkstations, mockSectors, mockRiskAssessments, mockActionPlans, getRiskDistribution } from "@/lib/mock-data";
import { riskLevelLabel, statusLabel } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ClipboardCheck, AlertTriangle, Monitor, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RISK_COLORS: Record<string, string> = {
  low: "hsl(152, 56%, 39%)",
  medium: "hsl(38, 92%, 50%)",
  high: "hsl(25, 95%, 53%)",
  critical: "hsl(0, 72%, 51%)",
};

export default function DashboardPage() {
  const dist = getRiskDistribution();
  const pieData = Object.entries(dist).map(([key, value]) => ({
    name: riskLevelLabel(key as any),
    value,
    color: RISK_COLORS[key],
  }));

  const sectorData = mockSectors.map((s) => {
    const ws = mockWorkstations.filter((w) => w.sector_id === s.id);
    const wsIds = ws.map((w) => w.id);
    const analyses = mockAnalyses.filter((a) => wsIds.includes(a.workstation_id));
    return { name: s.name, postos: ws.length, analises: analyses.length };
  });

  const recentAnalyses = [...mockAnalyses].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const pendingActions = mockActionPlans.filter((a) => a.status !== "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos indicadores ergonômicos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Monitor} label="Postos de Trabalho" value={mockWorkstations.length} />
        <StatCard icon={ClipboardCheck} label="Análises Realizadas" value={mockAnalyses.length} />
        <StatCard icon={AlertTriangle} label="Riscos Críticos" value={dist.critical + dist.high} variant="critical" />
        <StatCard icon={ListTodo} label="Ações Pendentes" value={pendingActions} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análises por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="postos" name="Postos" fill="hsl(174, 58%, 32%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="analises" name="Análises" fill="hsl(215, 28%, 17%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnalyses.map((a) => {
              const ws = mockWorkstations.find((w) => w.id === a.workstation_id);
              const risk = mockRiskAssessments.find((r) => r.analysis_id === a.id);
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{ws?.name}</p>
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
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
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
