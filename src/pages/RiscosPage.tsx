import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { calculateRiskScore, classifyRisk, riskLevelLabel, type RiskLevel } from "@/lib/types";
import { Plus, AlertTriangle } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { RiskBadge } from "./DashboardPage";

export default function RiscosPage() {
  const { companyAnalyses, companyWorkstations, riskAssessments, addRiskAssessment } = useCompany();
  const [open, setOpen] = useState(false);
  const [analysisId, setAnalysisId] = useState("");
  const [probability, setProbability] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [consequence, setConsequence] = useState(1);
  const [description, setDescription] = useState("");

  const score = calculateRiskScore(probability, exposure, consequence);
  const level = classifyRisk(score);

  const companyRisks = riskAssessments.filter((r) => companyAnalyses.some((a) => a.id === r.analysis_id));

  const handleSave = async () => {
    if (!analysisId) return;
    await addRiskAssessment({
      analysis_id: analysisId,
      probability,
      exposure,
      consequence,
      risk_score: score,
      risk_level: level,
      description,
    });
    setOpen(false); setDescription(""); setAnalysisId("");
    setProbability(1); setExposure(1); setConsequence(1);
  };

  const matrixColors: Record<RiskLevel, string> = {
    low: "bg-success/20 text-success",
    medium: "bg-warning/20 text-warning",
    high: "bg-high/20 text-high",
    critical: "bg-critical/20 text-critical",
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Matriz de Risco</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">P × E × C</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Avaliação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>Nova Avaliação de Risco</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={analysisId} onValueChange={setAnalysisId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar análise" /></SelectTrigger>
                  <SelectContent>
                    {companyAnalyses.map((a) => {
                      const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
                      return <SelectItem key={a.id} value={a.id}>{ws?.name} — {a.method}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Prob.</label>
                    <Input type="number" min={1} max={10} value={probability} onChange={(e) => setProbability(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Expos.</label>
                    <Input type="number" min={1} max={10} value={exposure} onChange={(e) => setExposure(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Conseq.</label>
                    <Input type="number" min={1} max={10} value={consequence} onChange={(e) => setConsequence(Number(e.target.value))} />
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${matrixColors[level]}`}>
                  <p className="text-lg font-bold">Score: {score}</p>
                  <p className="text-sm font-medium">Nível: {riskLevelLabel(level)}</p>
                </div>
                <Textarea placeholder="Descrição do risco" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Button onClick={handleSave} className="w-full">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm sm:text-base">Referência</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
            <div className="p-2 sm:p-3 rounded bg-success/20 text-success font-medium">Baixo ≤ 20</div>
            <div className="p-2 sm:p-3 rounded bg-warning/20 text-warning font-medium">Médio 21–70</div>
            <div className="p-2 sm:p-3 rounded bg-high/20 text-high font-medium">Alto 71–200</div>
            <div className="p-2 sm:p-3 rounded bg-critical/20 text-critical font-medium">Crítico &gt; 200</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Análise</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">P</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">E</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">C</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Nível</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {companyRisks.map((r) => {
                  const analysis = companyAnalyses.find((a) => a.id === r.analysis_id);
                  const ws = analysis ? companyWorkstations.find((w) => w.id === analysis.workstation_id) : null;
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{ws?.name} — {analysis?.method}</td>
                      <td className="p-3">{r.probability}</td>
                      <td className="p-3">{r.exposure}</td>
                      <td className="p-3">{r.consequence}</td>
                      <td className="p-3 font-bold">{r.risk_score}</td>
                      <td className="p-3"><RiskBadge level={r.risk_level} /></td>
                      <td className="p-3 text-muted-foreground">{r.created_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden divide-y divide-border">
            {companyRisks.map((r) => {
              const analysis = companyAnalyses.find((a) => a.id === r.analysis_id);
              const ws = analysis ? companyWorkstations.find((w) => w.id === analysis.workstation_id) : null;
              return (
                <div key={r.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{ws?.name}</p>
                    <RiskBadge level={r.risk_level} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>P:{r.probability}</span>
                    <span>E:{r.exposure}</span>
                    <span>C:{r.consequence}</span>
                    <span className="font-bold text-foreground">= {r.risk_score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.created_at}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
