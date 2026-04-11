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
  const [hazard, setHazard] = useState("");
  const [possibleDamage, setPossibleDamage] = useState("");
  const [generatingSource, setGeneratingSource] = useState("");
  const [exposureTime, setExposureTime] = useState("");
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
      hazard,
      possible_damage: possibleDamage,
      generating_source: generatingSource,
      exposure_time: exposureTime,
    });
    setOpen(false); 
    setDescription(""); 
    setAnalysisId("");
    setHazard("");
    setPossibleDamage("");
    setGeneratingSource("");
    setExposureTime("");
    setProbability(1); 
    setExposure(1); 
    setConsequence(1);
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
        let desc = "", haz = "", dam = "", src = "", time = "Habitual";
        
        const ws = companyWorkstations.find(w => w.id === analysis.workstation_id);
        const pa = postureAnalyses.find((p) => p.workstation_id === analysis.workstation_id);

        // ANALYTICAL LOGIC: 
        // 1. Identify Hazard based on analysis method and notes
        if (analysis.method === "RULA" || analysis.method === "REBA") {
          haz = "Postura inadequada e sobrecarga biomêcanica de membros superiores e tronco.";
          dam = "Lombalgias, cervicalgias e possíveis distúrbios osteomusculares (DORT).";
        } else if (analysis.method === "ROSA") {
          haz = "Arranjo físico inadequado do posto informatizado.";
          dam = "Fadiga visual, tensões musculares em região cervical e ombros.";
        } else {
          haz = "Exposição a fatores de risco ergonômicos durante a execução das tarefas.";
          dam = "Fadiga muscular e desconfortos localizados.";
        }

        // 2. Generating Source from Workstation description/tasks
        src = ws?.machines_equipment 
          ? `Operação de ${ws.machines_equipment} e mobiliário do posto.`
          : ws?.tasks_performed 
            ? `Execução da tarefa de: ${ws.tasks_performed}.`
            : "Mobiliário e ferramentas de trabalho.";

        // 3. Risk Scoring based on findings
        const riskMap: Record<string, number> = { low: 2, medium: 4, high: 7, critical: 10 };
        const base = pa ? riskMap[pa.risk_level] : (analysis.score > 7 ? 7 : analysis.score > 3 ? 4 : 2);
        
        prob = base;
        exp = base > 6 ? 6 : 4;
        cons = base;
        
        desc = `ANÁLISE IA: Identificado risco ${classifyRisk(calculateRiskScore(prob, exp, cons))} baseado na análise ${analysis.method} e nas fotos de postura enviadas para o posto ${ws?.name}. A fonte geradora principal é ${src}.`;

        await addRiskAssessment({
          analysis_id: analysis.id,
          probability: prob,
          exposure: exp,
          consequence: cons,
          risk_score: calculateRiskScore(prob, exp, cons),
          risk_level: classifyRisk(calculateRiskScore(prob, exp, cons)),
          description: desc,
          hazard: haz,
          possible_damage: dam,
          generating_source: src,
          exposure_time: time,
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Perigo / Fator de Risco</label>
                    <Input placeholder="Ex: Postura inadequada" value={hazard} onChange={(e) => setHazard(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Tempo de Exposição</label>
                    <Input placeholder="Ex: Habitual / Intermitente" value={exposureTime} onChange={(e) => setExposureTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Danos Possíveis / Lesões</label>
                  <Input placeholder="Ex: Lombalgia, DORT" value={possibleDamage} onChange={(e) => setPossibleDamage(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Fonte Geradora</label>
                  <Input placeholder="Ex: Mobiliário, Máquina X" value={generatingSource} onChange={(e) => setGeneratingSource(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Justificativa / Observações</label>
                  <Textarea placeholder="Descreva os detalhes da avaliação..." value={description} onChange={(e) => setDescription(e.target.value)} className="h-20" />
                </div>

                <Button onClick={handleSave} className="w-full" disabled={!analysisId}>Salvar Avaliação de Risco</Button>
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
