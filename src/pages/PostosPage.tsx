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
import { Plus, Monitor, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function PostosPage() {
  const {
    companySectors, companyWorkstations, companyAnalyses,
    workstations, setWorkstations, posturePhotos,
  } = useCompany();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim() || !sectorId) return;
    if (editingId) {
      setWorkstations(workstations.map((w) => w.id === editingId ? { ...w, name, sector_id: sectorId, description, tasks_performed: tasks } : w));
    } else {
      setWorkstations([...workstations, { id: `w${Date.now()}`, sector_id: sectorId, name, description, tasks_performed: tasks, created_at: new Date().toISOString().split("T")[0] }]);
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
          <p className="text-xs sm:text-sm text-muted-foreground">Postos da empresa selecionada</p>
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
          const analysisCount = companyAnalyses.filter((a) => a.workstation_id === w.id).length;
          const photoCount = posturePhotos.filter((p) => p.workstation_id === w.id).length;
          const photoProgress = Math.min((photoCount / MIN_PHOTOS_REQUIRED) * 100, 100);

          return (
            <Card key={w.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Monitor className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{w.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(w)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWorkstations(workstations.filter((x) => x.id !== w.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="text-[10px]">{sector?.name}</Badge>
                <p className="text-xs text-muted-foreground line-clamp-2">{w.description}</p>
                <p className="text-xs text-muted-foreground"><strong>Tarefas:</strong> {w.tasks_performed}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{analysisCount} análise(s)</span>
                  <span>Fotos: {photoCount}/{MIN_PHOTOS_REQUIRED}</span>
                </div>
                <Progress value={photoProgress} className="h-1.5" />
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
