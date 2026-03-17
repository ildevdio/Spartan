import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import type { ErgonomicMethod, AnalysisStatus, Analysis } from "@/lib/types";
import { analysisStatusLabel } from "@/lib/types";
import { Plus, Trash2, Pencil, Wand2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./DashboardPage";
import { toast } from "sonner";

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
  const {
    companyAnalyses, companyWorkstations, companySectors,
    addAnalysis, updateAnalysis, deleteAnalysis,
    riskAssessments, postureAnalyses, companyPhotos,
  } = useCompany();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [wsId, setWsId] = useState("");
  const [method, setMethod] = useState<ErgonomicMethod>("REBA");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>("in_progress");
  const [bodyParts, setBodyParts] = useState<Record<string, number>>({});
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleMethodChange = (m: ErgonomicMethod) => {
    setMethod(m);
    const parts: Record<string, number> = {};
    methodBodyParts[m].forEach((p) => (parts[p] = 1));
    setBodyParts(parts);
  };

  const resetForm = () => {
    setEditingId(null);
    setWsId("");
    setMethod("REBA");
    setScore("");
    setNotes("");
    setStatus("in_progress");
    setBodyParts({});
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (a: Analysis) => {
    setEditingId(a.id);
    setWsId(a.workstation_id);
    setMethod(a.method);
    setScore(String(a.score));
    setNotes(a.notes);
    setStatus(a.analysis_status);
    setBodyParts(a.body_parts || {});
    setOpen(true);
  };

  const handleSave = async () => {
    if (!wsId || !score) {
      toast.error("Preencha posto e score.");
      return;
    }
    const totalScore = Object.values(bodyParts).reduce((a, b) => a + b, 0);
    const payload = {
      workstation_id: wsId,
      method,
      score: totalScore || Number(score),
      notes,
      body_parts: bodyParts,
      analysis_status: status,
    };

    if (editingId) {
      await updateAnalysis(editingId, payload);
      toast.success("Análise atualizada!");
    } else {
      await addAnalysis(payload);
      toast.success("Análise criada!");
    }
    setOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta análise?")) {
      await deleteAnalysis(id);
      toast.success("Análise excluída!");
    }
  };

  // Auto-fill: create analyses for workstations that have posture captures
  const handleAutoFill = async () => {
    const wsWithPhotos = companyWorkstations.filter(
      (ws) => companyPhotos.filter((p) => p.workstation_id === ws.id).length > 0
    );

    if (wsWithPhotos.length === 0) {
      toast.error("Nenhum posto com fotos de postura capturadas.");
      return;
    }

    // Filter out workstations that already have analyses
    const existingWsIds = new Set(companyAnalyses.map((a) => a.workstation_id));
    const wsToAnalyze = wsWithPhotos.filter((ws) => !existingWsIds.has(ws.id));

    if (wsToAnalyze.length === 0) {
      toast.info("Todos os postos com fotos já possuem análises.");
      return;
    }

    setIsAutoFilling(true);
    try {
      for (const ws of wsToAnalyze) {
        // Check if there's posture analysis data from camera captures
        const pa = postureAnalyses.filter((p) => p.workstation_id === ws.id);
        const photos = companyPhotos.filter((p) => p.workstation_id === ws.id);

        let autoMethod: ErgonomicMethod = "REBA";
        let autoScore = 0;
        let autoBodyParts: Record<string, number> = {};
        let autoNotes = "";

        if (pa.length > 0) {
          // Use posture analysis data (from camera capture)
          const latest = pa[pa.length - 1];
          const ergoScores = latest.ergonomic_scores || {};

          // Pick method from ergonomic scores if available
          if (ergoScores.RULA) { autoMethod = "RULA"; autoScore = ergoScores.RULA; }
          else if (ergoScores.REBA) { autoMethod = "REBA"; autoScore = ergoScores.REBA; }
          else if (ergoScores.OWAS) { autoMethod = "OWAS"; autoScore = ergoScores.OWAS; }
          else { autoScore = Object.values(ergoScores)[0] || 3; }

          // Map joint angles to body parts
          const angles = latest.joint_angles || {};
          const bpKeys = methodBodyParts[autoMethod];
          bpKeys.forEach((key, i) => {
            const angleVal = Object.values(angles)[i];
            autoBodyParts[key] = angleVal ? Math.min(Math.ceil(angleVal / 30), 7) : 2;
          });

          autoNotes = `Preenchido automaticamente via análise por câmera. Nível de risco: ${latest.risk_level}. Ângulos: ${JSON.stringify(angles)}`;
        } else {
          // Use photo metadata to estimate
          const postureTypes = photos.map((p) => p.posture_type).join(", ");
          const bpKeys = methodBodyParts[autoMethod];
          bpKeys.forEach((key) => { autoBodyParts[key] = 2; });
          autoScore = bpKeys.length * 2;
          autoNotes = `Preenchido automaticamente com base em ${photos.length} foto(s) capturadas. Posturas: ${postureTypes}. Revise os scores manualmente.`;
        }

        await addAnalysis({
          workstation_id: ws.id,
          method: autoMethod,
          score: autoScore,
          notes: autoNotes,
          body_parts: autoBodyParts,
          analysis_status: pa.length > 0 ? "in_progress" : "pending",
        });
      }
      toast.success(`${wsToAnalyze.length} análise(s) preenchida(s) automaticamente!`);
    } catch (err) {
      toast.error("Erro ao preencher análises.");
      console.error(err);
    } finally {
      setIsAutoFilling(false);
    }
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
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Análise</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Análise" : "Nova Análise Ergonômica"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={wsId} onValueChange={setWsId}>
                  <SelectTrigger><SelectValue placeholder="Posto de trabalho" /></SelectTrigger>
                  <SelectContent>
                    {companyWorkstations.map((w) => {
                      const sector = companySectors.find((s) => s.id === w.sector_id);
                      return (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} {sector ? `(${sector.name})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={method} onValueChange={(v) => handleMethodChange(v as ErgonomicMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {editingId && (
                  <Select value={status} onValueChange={(v) => setStatus(v as AnalysisStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pontuação por segmento</p>
                  {methodBodyParts[method].map((part) => (
                    <div key={part} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex-1 capitalize">{part.replace("_", " ")}</span>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={bodyParts[part] || 1}
                        onChange={(e) => setBodyParts({ ...bodyParts, [part]: Number(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>
                <Input placeholder="Score total (ou calculado)" value={score} onChange={(e) => setScore(e.target.value)} type="number" />
                <Textarea placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Salvar Alterações" : "Salvar Análise"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(["pending", "in_progress", "completed"] as AnalysisStatus[]).map((s) => {
          const count = companyAnalyses.filter((a) => a.analysis_status === s).length;
          return (
            <Card key={s}>
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{count}</p>
                <Badge variant="outline" className={`${statusStyles[s]} text-[10px] sm:text-xs`}>
                  {analysisStatusLabel(s)}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Desktop table */}
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
                  <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {companyAnalyses.map((a) => {
                  const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
                  const risk = riskAssessments.find((r) => r.analysis_id === a.id);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
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
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {companyAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma análise para esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border">
            {companyAnalyses.map((a) => {
              const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
              const risk = riskAssessments.find((r) => r.analysis_id === a.id);
              return (
                <div key={a.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{ws?.name || "—"}</p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">{a.method}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(a)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
                  {a.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.notes}</p>
                  )}
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
