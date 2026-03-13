import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import type { Sector } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";

export default function SetoresPage() {
  const { companySectors, sectors, setSectors, selectedCompanyId, workstations } = useCompany();
  const [open, setOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingSector) {
      setSectors(sectors.map((s) => (s.id === editingSector.id ? { ...s, name, description } : s)));
    } else {
      setSectors([...sectors, {
        id: `s${Date.now()}`,
        company_id: selectedCompanyId,
        name,
        description,
        created_at: new Date().toISOString().split("T")[0],
      }]);
    }
    resetForm();
  };

  const resetForm = () => { setName(""); setDescription(""); setEditingSector(null); setOpen(false); };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector); setName(sector.name); setDescription(sector.description); setOpen(true);
  };

  const handleDelete = (id: string) => { setSectors(sectors.filter((s) => s.id !== id)); };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Setores</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Setores da empresa selecionada</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo Setor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>{editingSector ? "Editar Setor" : "Novo Setor"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome do setor" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Button onClick={handleSave} className="w-full">{editingSector ? "Salvar" : "Criar Setor"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {companySectors.map((sector) => {
          const wsCount = workstations.filter((w) => w.sector_id === sector.id).length;
          return (
            <Card key={sector.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{sector.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(sector)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(sector.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{sector.description}</p>
                <p className="text-xs text-muted-foreground">{wsCount} posto(s)</p>
              </CardContent>
            </Card>
          );
        })}
        {companySectors.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Nenhum setor cadastrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
