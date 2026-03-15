import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import type { ErgonomicMethod, AnalysisStatus } from "@/lib/types";
import { analysisStatusLabel } from "@/lib/types";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./DashboardPage";

const METHODS: ErgonomicMethod[] = ["RULA", "REBA", "ROSA", "OWAS", "OCRA", "ANSI-365"];

const methodBodyParts: Record<ErgonomicMethod, string[]> = {
  RULA: ["upper_arm", "lower_arm", "wrist", "neck", "trunk", "legs"],
  REBA: ["trunk", "neck", "legs", "upper_arm", "lower_arm", "wrist"],
  ROSA: ["chair", "monitor", "keyboard", "mouse", "telephone"],
  OWAS: ["back", "arms", "legs", "load"],
  OCRA: ["frequency", "force", "posture", "additional", "recovery"],
  "ANSI-365": ["repetition", "force", "posture", "vibration", "contact_stress"],
};

const statusStyles: Record<AnalysisStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
};

export default function AnalisesPage() {
  const { companyAnalyses, companyWorkstations, addAnalysis, riskAssessments } = useCompany();
  const [open, setOpen] = useState(false);
  const [wsId, setWsId] = useState("");
  const [method, setMethod] = useState<ErgonomicMethod>("REBA");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [bodyParts, setBodyParts] = useState<Record<string, number>>({});

  const handleMethodChange = (m: ErgonomicMethod) => {
    setMethod(m);
    const parts: Record<string, number> = {};
    methodBodyParts[m].forEach((p) => (parts[p] = 1));
    setBodyParts(parts);
  };

  const handleSave = async () => {
    if (!wsId || !score) return;
    const totalScore = Object.values(bodyParts).reduce((a, b) => a + b, 0);
    await addAnalysis({
      workstation_id: wsId,
      method,
      score: totalScore || Number(score),
      notes,
      body_parts: bodyParts,
      analysis_status: "in_progress",
    });
    setOpen(false);
    setWsId(""); setScore(""); setNotes(""); setBodyParts({});
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Análises Ergonômicas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Avaliações por método ergonômico</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Análise</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nova Análise Ergonômica</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={wsId} onValueChange={setWsId}>
                  <SelectTrigger><SelectValue placeholder="Posto de trabalho" /></SelectTrigger>
                  <SelectContent>
                    {companyWorkstations.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={method} onValueChange={(v) => handleMethodChange(v as ErgonomicMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pontuação por segmento</p>
                  {methodBodyParts[method].map((part) => (
                    <div key={part} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex-1 capitalize">{part.replace("_", " ")}</span>
                      <Input type="number" min={1} max={10} value={bodyParts[part] || 1} onChange={(e) => setBodyParts({ ...bodyParts, [part]: Number(e.target.value) })} className="w-20" />
                    </div>
                  ))}
                </div>
                <Input placeholder="Score total (ou calculado)" value={score} onChange={(e) => setScore(e.target.value)} type="number" />
                <Textarea placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button onClick={handleSave} className="w-full">Salvar Análise</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(["pending", "in_progress", "completed"] as AnalysisStatus[]).map((status) => {
          const count = companyAnalyses.filter((a) => a.analysis_status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{count}</p>
                <Badge variant="outline" className={`${statusStyles[status]} text-[10px] sm:text-xs`}>
                  {analysisStatusLabel(status)}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Posto</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Método</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Risco</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {companyAnalyses.map((a) => {
                  const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
                  const risk = riskAssessments.find((r) => r.analysis_id === a.id);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{ws?.name || "—"}</td>
                      <td className="p-3"><Badge variant="outline">{a.method}</Badge></td>
                      <td className="p-3">{a.score}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={statusStyles[a.analysis_status]}>
                          {analysisStatusLabel(a.analysis_status)}
                        </Badge>
                      </td>
                      <td className="p-3">{risk ? <RiskBadge level={risk.risk_level} /> : "—"}</td>
                      <td className="p-3 text-muted-foreground">{a.created_at}</td>
                    </tr>
                  );
                })}
                {companyAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma análise para esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden divide-y divide-border">
            {companyAnalyses.map((a) => {
              const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
              const risk = riskAssessments.find((r) => r.analysis_id === a.id);
              return (
                <div key={a.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{ws?.name || "—"}</p>
                    <Badge variant="outline" className="text-[10px]">{a.method}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Score: {a.score}</span>
                    <Badge variant="outline" className={`${statusStyles[a.analysis_status]} text-[10px]`}>
                      {analysisStatusLabel(a.analysis_status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{a.created_at}</span>
                    {risk ? <RiskBadge level={risk.risk_level} /> : null}
                  </div>
                </div>
              );
            })}
            {companyAnalyses.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma análise para esta empresa.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
