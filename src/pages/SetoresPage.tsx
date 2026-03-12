import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSectors, mockWorkstations } from "@/lib/mock-data";
import type { Sector } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";

export default function SetoresPage() {
  const [sectors, setSectors] = useState<Sector[]>(mockSectors);
  const [open, setOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingSector) {
      setSectors(sectors.map((s) => (s.id === editingSector.id ? { ...s, name, description } : s)));
    } else {
      setSectors([...sectors, { id: `s${Date.now()}`, name, description, created_at: new Date().toISOString().split("T")[0] }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingSector(null);
    setOpen(false);
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setName(sector.name);
    setDescription(sector.description);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setSectors(sectors.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Setores</h1>
          <p className="text-sm text-muted-foreground">Gerencie os setores da empresa</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Setor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSector ? "Editar Setor" : "Novo Setor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nome do setor" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button onClick={handleSave} className="w-full">{editingSector ? "Salvar" : "Criar Setor"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => {
          const wsCount = mockWorkstations.filter((w) => w.sector_id === sector.id).length;
          return (
            <Card key={sector.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  <CardTitle className="text-base">{sector.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(sector)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sector.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{sector.description}</p>
                <p className="text-xs text-muted-foreground">{wsCount} posto(s) de trabalho</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
