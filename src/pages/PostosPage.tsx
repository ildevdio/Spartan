import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import type { Workstation } from "@/lib/types";
import { MIN_PHOTOS_REQUIRED } from "@/lib/types";
import { Plus, Monitor, Pencil, Trash2, Camera, ClipboardCheck, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskBadge } from "./DashboardPage";

export default function PostosPage() {
  const {
    companySectors, companyWorkstations, companyAnalyses,
    addWorkstation, updateWorkstation, deleteWorkstation, posturePhotos,
    riskAssessments, postureAnalyses,
  } = useCompany();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const descriptionError = description.trim().length > 0 && description.trim().length < 25
    ? `Mínimo de 25 caracteres (${description.trim().length}/25)`
    : "";

  const handleSave = async () => {
    if (!name.trim() || !sectorId || description.trim().length < 25) return;
    if (editingId) {
      await updateWorkstation(editingId, { name, sector_id: sectorId, description, activity_description: description, tasks_performed: tasks });
    } else {
      await addWorkstation({ sector_id: sectorId, name, description, activity_description: description, tasks_performed: tasks });
    }
    resetForm();
  };

  const resetForm = () => { setName(""); setSectorId(""); setDescription(""); setTasks(""); setEditingId(null); setOpen(false); };

  const handleEdit = (w: Workstation) => {
    setEditingId(w.id); setName(w.name); setSectorId(w.sector_id); setDescription(w.description); setTasks(w.tasks_performed); setOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Postos de Trabalho</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {companyWorkstations.length} posto(s) — {companyWorkstations.filter((w) => posturePhotos.filter((p) => p.workstation_id === w.id).length >= MIN_PHOTOS_REQUIRED).length} pronto(s) para relatório
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo Posto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>{editingId ? "Editar Posto" : "Novo Posto"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome do posto" value={name} onChange={(e) => setName(e.target.value)} />
                <Select value={sectorId} onValueChange={setSectorId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                  <SelectContent>
                    {companySectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Descrição do posto" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Textarea placeholder="Tarefas realizadas" value={tasks} onChange={(e) => setTasks(e.target.value)} />
                <Button onClick={handleSave} className="w-full">{editingId ? "Salvar" : "Criar Posto"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {companyWorkstations.map((w) => {
          const sector = companySectors.find((s) => s.id === w.sector_id);
          const wsAnalyses = companyAnalyses.filter((a) => a.workstation_id === w.id);
          const photoCount = posturePhotos.filter((p) => p.workstation_id === w.id).length;
          const photoProgress = Math.min((photoCount / MIN_PHOTOS_REQUIRED) * 100, 100);
          const isReady = photoCount >= MIN_PHOTOS_REQUIRED;
          const wsRisks = riskAssessments.filter((r) => wsAnalyses.some((a) => a.id === r.analysis_id));
          const worstRisk = wsRisks.sort((a, b) => b.risk_score - a.risk_score)[0];
          const postureAnalysis = postureAnalyses.find((pa) => pa.workstation_id === w.id);

          return (
            <Card key={w.id} className={isReady ? "border-success/20" : ""}>
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Monitor className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{w.name}</CardTitle>
                  {isReady && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(w)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteWorkstation(w.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className="text-[10px]">{sector?.name}</Badge>
                <p className="text-xs text-muted-foreground line-clamp-2">{w.description}</p>
                {w.activity_description && (
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Atividade:</p>
                    <p className="text-xs text-foreground line-clamp-2">{w.activity_description}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground"><strong>Tarefas:</strong> {w.tasks_performed}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Camera className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{photoCount}</p>
                    <p className="text-[8px] text-muted-foreground">Fotos</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <ClipboardCheck className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{wsAnalyses.length}</p>
                    <p className="text-[8px] text-muted-foreground">Análises</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <AlertTriangle className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{wsRisks.length}</p>
                    <p className="text-[8px] text-muted-foreground">Riscos</p>
                  </div>
                </div>
                {postureAnalysis && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(postureAnalysis.ergonomic_scores).map(([method, score]) => (
                      <Badge key={method} variant="outline" className="text-[10px]">
                        {method}: {score}
                      </Badge>
                    ))}
                    {worstRisk && <RiskBadge level={worstRisk.risk_level} />}
                  </div>
                )}
                {wsAnalyses.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border">
                    {wsAnalyses.map((a) => {
                      const risk = wsRisks.find((r) => r.analysis_id === a.id);
                      return (
                        <div key={a.id} className="flex items-center justify-between text-[10px] py-0.5">
                          <span className="text-muted-foreground">{a.method} — Score {a.score}</span>
                          {risk && <RiskBadge level={risk.risk_level} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Fotos: {photoCount}/{MIN_PHOTOS_REQUIRED}</span>
                    {isReady ? (
                      <span className="text-success flex items-center gap-0.5"><FileText className="h-2.5 w-2.5" /> Pronto</span>
                    ) : (
                      <span className="text-warning">Faltam {MIN_PHOTOS_REQUIRED - photoCount}</span>
                    )}
                  </div>
                  <Progress value={photoProgress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {companyWorkstations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Nenhum posto encontrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
