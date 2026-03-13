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
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      setCompanies(companies.map((c) => c.id === editing.id ? { ...c, name, cnpj, address, description } : c));
    } else {
      setCompanies([...companies, { id: `comp${Date.now()}`, name, cnpj, address, description, created_at: new Date().toISOString().split("T")[0] }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setName(""); setCnpj(""); setAddress(""); setDescription(""); setEditing(null); setOpen(false);
  };

  const handleEdit = (c: Company) => {
    setEditing(c); setName(c.name); setCnpj(c.cnpj); setAddress(c.address); setDescription(c.description); setOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">Cadastre e gerencie as empresas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nome da empresa" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              <Input placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar Empresa"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => {
          const sectorCount = sectors.filter((s) => s.company_id === company.id).length;
          return (
            <Card key={company.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  <CardTitle className="text-base">{company.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {company.cnpj && <p className="text-xs text-muted-foreground mb-1">CNPJ: {company.cnpj}</p>}
                {company.address && <p className="text-xs text-muted-foreground mb-1">{company.address}</p>}
                <p className="text-sm text-muted-foreground mb-2">{company.description}</p>
                <p className="text-xs text-muted-foreground">{sectorCount} setor(es)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
