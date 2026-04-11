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
import { Plus, Monitor, Pencil, Trash2, Camera, ClipboardCheck, AlertTriangle, CheckCircle2, FileText, Settings, Thermometer, Sun, ShieldAlert, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskBadge } from "./DashboardPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [machines, setMachines] = useState("");
  const [tools, setTools] = useState("");
  const [lighting, setLighting] = useState("");
  const [thermal, setThermal] = useState("");
  const [situations, setSituations] = useState("");
  const [insalubridade, setInsalubridade] = useState<"Não" | "10%" | "20%" | "40%">("Não");
  const [periculosidade, setPericulosidade] = useState(false);
  const [workSchedule, setWorkSchedule] = useState("");
  const [breakTimes, setBreakTimes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const descriptionError = description.trim().length > 0 && description.trim().length < 25
    ? `Mínimo de 25 caracteres (${description.trim().length}/25)`
    : "";

  const handleSave = async () => {
    if (!name.trim() || !sectorId || description.trim().length < 25) return;
    const workstationData = {
      name,
      sector_id: sectorId,
      description,
      activity_description: description,
      tasks_performed: tasks,
      machines_equipment: machines,
      tools_accessories: tools,
      lighting_nho11: lighting,
      thermal_comfort_nr17: thermal,
      situations_found: situations,
      insalubridade,
      periculosidade,
      work_schedule: workSchedule,
      break_times: breakTimes,
    };

    if (editingId) {
      await updateWorkstation(editingId, workstationData);
    } else {
      await addWorkstation(workstationData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setSectorId("");
    setDescription("");
    setTasks("");
    setMachines("");
    setTools("");
    setLighting("");
    setThermal("");
    setSituations("");
    setInsalubridade("Não");
    setPericulosidade(false);
    setWorkSchedule("");
    setBreakTimes("");
    setEditingId(null);
    setOpen(false);
  };

  const handleEdit = (w: Workstation) => {
    setEditingId(w.id);
    setName(w.name);
    setSectorId(w.sector_id);
    setDescription(w.description);
    setTasks(w.tasks_performed);
    setMachines(w.machines_equipment || "");
    setTools(w.tools_accessories || "");
    setLighting(w.lighting_nho11 || "");
    setThermal(w.thermal_comfort_nr17 || "");
    setSituations(w.situations_found || "");
    setInsalubridade(w.insalubridade || "Não");
    setPericulosidade(w.periculosidade || false);
    setWorkSchedule(w.work_schedule || "");
    setBreakTimes(w.break_times || "");
    setOpen(true);
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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Editar Posto" : "Novo Posto"}</DialogTitle></DialogHeader>
              <div className="pt-2">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="equipment">Equip.</TabsTrigger>
                    <TabsTrigger value="measurements">Ambiente</TabsTrigger>
                    <TabsTrigger value="admin">Adm</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Posto</Label>
                        <Input placeholder="Ex: Operador de Máquina" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Setor</Label>
                        <Select value={sectorId} onValueChange={setSectorId}>
                          <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                          <SelectContent>
                            {companySectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição das Atividades/Posto</Label>
                      <Textarea 
                        placeholder="Descrição detalhada (mínimo 25 caracteres)" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className={descriptionError ? "border-destructive h-24" : "h-24"} 
                      />
                      {descriptionError && <p className="text-xs text-destructive">{descriptionError}</p>}
                      {description.trim().length >= 25 && <p className="text-xs text-success">✓ {description.trim().length} caracteres</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Tarefas Realizadas</Label>
                      <Textarea placeholder="Liste as tarefas principais..." value={tasks} onChange={(e) => setTasks(e.target.value)} className="h-20" />
                    </div>
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Máquinas e Equipamentos</Label>
                      <Textarea placeholder="Liste as máquinas utilizadas..." value={machines} onChange={(e) => setMachines(e.target.value)} className="h-24" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ferramentas e Acessórios</Label>
                      <Textarea placeholder="Liste as ferramentas e acessórios..." value={tools} onChange={(e) => setTools(e.target.value)} className="h-24" />
                    </div>
                    <div className="space-y-2">
                      <Label>Situações Encontradas (Ergonomia)</Label>
                      <Textarea placeholder="Observações de campo sobre a ergonomia..." value={situations} onChange={(e) => setSituations(e.target.value)} className="h-24" />
                    </div>
                  </TabsContent>

                  <TabsContent value="measurements" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Sun className="h-4 w-4" /> Iluminamento (NHO-11)</Label>
                        <Input placeholder="Ex: 500 lux" value={lighting} onChange={(e) => setLighting(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Conforto Térmico (NR-17)</Label>
                        <Input placeholder="Ex: 23°C" value={thermal} onChange={(e) => setThermal(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Insalubridade</Label>
                        <Select value={insalubridade} onValueChange={(v: any) => setInsalubridade(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Não">Não</SelectItem>
                            <SelectItem value="10%">10% (Mínimo)</SelectItem>
                            <SelectItem value="20%">20% (Médio)</SelectItem>
                            <SelectItem value="40%">40% (Máximo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <Checkbox id="periculosidade" checked={periculosidade} onCheckedChange={(v) => setPericulosidade(!!v)} />
                        <label htmlFor="periculosidade" className="text-sm font-medium leading-none cursor-pointer">
                          Adicional de Periculosidade
                        </label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Jornada de Trabalho</Label>
                      <Input placeholder="Ex: 08:00 às 17:00" value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Pausas e Intervalos</Label>
                      <Textarea placeholder="Descreva as pausas..." value={breakTimes} onChange={(e) => setBreakTimes(e.target.value)} className="h-20" />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-6">
                  <Button onClick={handleSave} className="w-full" disabled={!name.trim() || !sectorId || description.trim().length < 25}>
                    {editingId ? "Salvar Alterações" : "Criar Posto de Trabalho"}
                  </Button>
                </div>
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
