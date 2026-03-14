import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import type { Company } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";

export default function EmpresasPage() {
  const { companies, setCompanies, sectors } = useCompany();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      setCompanies(companies.map((c) => c.id === editing.id ? { ...c, name, cnpj, address, city, state, description } : c));
    } else {
      setCompanies([...companies, { id: `comp${Date.now()}`, name, cnpj, address, city, state, description, created_at: new Date().toISOString().split("T")[0] }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setName(""); setCnpj(""); setAddress(""); setCity(""); setState(""); setDescription(""); setEditing(null); setOpen(false);
  };

  const handleEdit = (c: Company) => {
    setEditing(c); setName(c.name); setCnpj(c.cnpj); setAddress(c.address); setCity(c.city); setState(c.state); setDescription(c.description); setOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Cadastre e gerencie as empresas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nome da empresa" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              <Input placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input placeholder="UF" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar Empresa"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {companies.map((company) => {
          const sectorCount = sectors.filter((s) => s.company_id === company.id).length;
          return (
            <Card key={company.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{company.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(company)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(company.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {company.cnpj && <p className="text-xs text-muted-foreground mb-1">CNPJ: {company.cnpj}</p>}
                {company.address && <p className="text-xs text-muted-foreground mb-1 truncate">{company.address} — {company.city}/{company.state}</p>}
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{company.description}</p>
                <p className="text-xs text-muted-foreground">{sectorCount} setor(es)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
