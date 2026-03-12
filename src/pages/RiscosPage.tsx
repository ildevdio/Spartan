import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockRiskAssessments, mockAnalyses, mockWorkstations } from "@/lib/mock-data";
import { calculateRiskScore, classifyRisk, riskLevelLabel, type RiskAssessment, type RiskLevel } from "@/lib/types";
import { Plus, AlertTriangle } from "lucide-react";
import { RiskBadge } from "./DashboardPage";

export default function RiscosPage() {
  const [risks, setRisks] = useState<RiskAssessment[]>(mockRiskAssessments);
  const [open, setOpen] = useState(false);
  const [analysisId, setAnalysisId] = useState("");
  const [probability, setProbability] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [consequence, setConsequence] = useState(1);
  const [description, setDescription] = useState("");

  const score = calculateRiskScore(probability, exposure, consequence);
  const level = classifyRisk(score);

  const handleSave = () => {
    if (!analysisId) return;
    setRisks([...risks, {
      id: `r${Date.now()}`,
      analysis_id: analysisId,
      probability,
      exposure,
      consequence,
      risk_score: score,
      risk_level: level,
      description,
      created_at: new Date().toISOString().split("T")[0],
    }]);
    setOpen(false);
  };

  const matrixColors: Record<RiskLevel, string> = {
    low: "bg-success/20 text-success",
    medium: "bg-warning/20 text-warning",
    high: "bg-orange-100 text-orange-600",
    critical: "bg-critical/20 text-critical",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matriz de Risco</h1>
          <p className="text-sm text-muted-foreground">Avaliação PGR — Probabilidade × Exposição × Consequência</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Avaliação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Avaliação de Risco</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={analysisId} onValueChange={setAnalysisId}>
                <SelectTrigger><SelectValue placeholder="Selecionar análise" /></SelectTrigger>
                <SelectContent>
                  {mockAnalyses.map((a) => {
                    const ws = mockWorkstations.find((w) => w.id === a.workstation_id);
                    return <SelectItem key={a.id} value={a.id}>{ws?.name} — {a.method}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Probabilidade</label>
                  <Input type="number" min={1} max={10} value={probability} onChange={(e) => setProbability(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Exposição</label>
                  <Input type="number" min={1} max={10} value={exposure} onChange={(e) => setExposure(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Consequência</label>
                  <Input type="number" min={1} max={10} value={consequence} onChange={(e) => setConsequence(Number(e.target.value))} />
                </div>
              </div>
              <div className={`p-3 rounded-lg text-center ${matrixColors[level]}`}>
                <p className="text-lg font-bold">Score: {score}</p>
                <p className="text-sm font-medium">Nível: {riskLevelLabel(level)}</p>
              </div>
              <Textarea placeholder="Descrição do risco" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button onClick={handleSave} className="w-full">Salvar Avaliação</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Matrix Visual */}
      <Card>
        <CardHeader><CardTitle className="text-base">Referência da Matriz</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded bg-success/20 text-success font-medium">Baixo ≤ 20</div>
            <div className="p-3 rounded bg-warning/20 text-warning font-medium">Médio 21–70</div>
            <div className="p-3 rounded bg-orange-100 text-orange-600 font-medium">Alto 71–200</div>
            <div className="p-3 rounded bg-critical/20 text-critical font-medium">Crítico &gt; 200</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Análise</TableHead>
                <TableHead>P</TableHead>
                <TableHead>E</TableHead>
                <TableHead>C</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((r) => {
                const analysis = mockAnalyses.find((a) => a.id === r.analysis_id);
                const ws = analysis ? mockWorkstations.find((w) => w.id === analysis.workstation_id) : null;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{ws?.name} — {analysis?.method}</TableCell>
                    <TableCell>{r.probability}</TableCell>
                    <TableCell>{r.exposure}</TableCell>
                    <TableCell>{r.consequence}</TableCell>
                    <TableCell className="font-bold">{r.risk_score}</TableCell>
                    <TableCell><RiskBadge level={r.risk_level} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.created_at}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
