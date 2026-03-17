import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { calculateRiskScore, classifyRisk, riskLevelLabel, type RiskLevel } from "@/lib/types";
import { Plus, AlertTriangle, Wand2, Loader2 } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { RiskBadge } from "./DashboardPage";
import { toast } from "sonner";

export default function RiscosPage() {
  const { companyAnalyses, companyWorkstations, riskAssessments, addRiskAssessment, postureAnalyses } = useCompany();
  const [open, setOpen] = useState(false);
  const [analysisId, setAnalysisId] = useState("");
  const [probability, setProbability] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [consequence, setConsequence] = useState(1);
  const [description, setDescription] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);

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

  const handleAutoFill = async () => {
    const existingAnalysisIds = new Set(riskAssessments.map((r) => r.analysis_id));
    const analysesToAssess = companyAnalyses.filter((a) => !existingAnalysisIds.has(a.id));

    if (analysesToAssess.length === 0) {
      toast.info("Todas as análises já possuem avaliação de risco.");
      return;
    }

    setIsAutoFilling(true);
    try {
      for (const analysis of analysesToAssess) {
        let prob = 3, exp = 3, cons = 3;
        let desc = "";

        // Use posture analysis data if available
        const pa = postureAnalyses.filter((p) => p.workstation_id === analysis.workstation_id);
        if (pa.length > 0) {
          const latest = pa[pa.length - 1];
          const riskMap: Record<string, number> = { low: 1, medium: 3, high: 6, critical: 10 };
          const base = riskMap[latest.risk_level] || 3;
          prob = Math.min(base, 10);
          exp = Math.min(Math.ceil(base * 0.8), 10);
          cons = Math.min(Math.ceil(base * 1.2), 10);
          desc = `Preenchido automaticamente via análise postural. Risco: ${latest.risk_level}.`;
        } else {
          // Estimate from analysis score
          const s = analysis.score;
          if (s <= 3) { prob = 2; exp = 2; cons = 2; }
          else if (s <= 7) { prob = 4; exp = 3; cons = 4; }
          else { prob = 6; exp = 5; cons = 6; }
          desc = `Preenchido automaticamente com base na análise ${analysis.method} (score: ${analysis.score}). Revise os valores.`;
        }

        const autoScore = calculateRiskScore(prob, exp, cons);
        const autoLevel = classifyRisk(autoScore);

        await addRiskAssessment({
          analysis_id: analysis.id,
          probability: prob,
          exposure: exp,
          consequence: cons,
          risk_score: autoScore,
          risk_level: autoLevel,
          description: desc,
        });
      }
      toast.success(`${analysesToAssess.length} avaliação(ões) de risco preenchida(s)!`);
    } catch (err) {
      toast.error("Erro ao preencher avaliações.");
      console.error(err);
    } finally {
      setIsAutoFilling(false);
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={isAutoFilling}
          >
            {isAutoFilling ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Preenchendo...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-1" />Preencher com Dados</>
            )}
          </Button>
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
