import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCheck, Plus, Trash2, Edit2, Save, X, ShieldCheck, Loader2, FileSignature } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TechnicalResponsible {
  id: string;
  company_id: string;
  name: string;
  title: string;
  specialization: string;
  professional_registration: string;
  cpf: string;
  email: string;
  govbr_certificate_id: string | null;
  signature_image_url: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  title: "",
  specialization: "",
  professional_registration: "",
  cpf: "",
  email: "",
};

export default function ResponsavelTecnicoPage() {
  const { selectedCompanyId, selectedCompany } = useCompany();
  const [responsibles, setResponsibles] = useState<TechnicalResponsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);

  const fetchResponsibles = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("technical_responsibles")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar responsáveis técnicos.");
      console.error(error);
    } else {
      setResponsibles(data as TechnicalResponsible[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponsibles();
  }, [selectedCompanyId]);

  const handleSave = async () => {
    if (!selectedCompanyId) return;
    if (!form.name.trim() || !form.professional_registration.trim()) {
      toast.error("Nome e Registro Profissional são obrigatórios.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("technical_responsibles")
        .update({ ...form })
        .eq("id", editingId);
      if (error) {
        toast.error("Erro ao atualizar.");
        console.error(error);
      } else {
        toast.success("Responsável técnico atualizado.");
      }
    } else {
      const { error } = await supabase
        .from("technical_responsibles")
        .insert({ ...form, company_id: selectedCompanyId });
      if (error) {
        toast.error("Erro ao cadastrar.");
        console.error(error);
      } else {
        toast.success("Responsável técnico cadastrado.");
      }
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setDialogOpen(false);
    fetchResponsibles();
  };

  const handleEdit = (r: TechnicalResponsible) => {
    setForm({
      name: r.name,
      title: r.title,
      specialization: r.specialization,
      professional_registration: r.professional_registration,
      cpf: r.cpf,
      email: r.email,
    });
    setEditingId(r.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("technical_responsibles").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
    } else {
      toast.success("Responsável excluído.");
      fetchResponsibles();
    }
  };

  const handleGovBrSign = async (responsible: TechnicalResponsible) => {
    setSigning(responsible.id);
    try {
      const { data, error } = await supabase.functions.invoke("govbr-signature", {
        body: {
          action: "init_auth",
          responsible_id: responsible.id,
          redirect_uri: window.location.origin + "/responsavel-tecnico",
        },
      });

      if (error) throw error;

      if (data?.auth_url) {
        window.open(data.auth_url, "_blank", "width=600,height=700");
        toast.info("Complete a autenticação na janela do gov.br.");
      } else if (data?.message) {
        toast.info(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar assinatura gov.br. Verifique se as credenciais estão configuradas.");
    } finally {
      setSigning(null);
    }
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Responsável Técnico</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Cadastre os responsáveis técnicos e assine digitalmente via gov.br
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompanySelector />
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(EMPTY_FORM); setEditingId(null); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" disabled={!selectedCompanyId}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-accent" />
                  {editingId ? "Editar" : "Cadastrar"} Responsável Técnico
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="rt-name">Nome Completo *</Label>
                  <Input
                    id="rt-name"
                    placeholder="Ex: Gisele Dantas"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rt-title">Titulação</Label>
                    <Input
                      id="rt-title"
                      placeholder="Ex: M.Sc Eng. De Produção (Ergonomia)"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt-specialization">Especialização</Label>
                    <Input
                      id="rt-specialization"
                      placeholder="Ex: Especialista em Ergonomia"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rt-registration">Registro Profissional *</Label>
                  <Input
                    id="rt-registration"
                    placeholder="Ex: CREA/CE 061294159-0"
                    value={form.professional_registration}
                    onChange={(e) => setForm({ ...form, professional_registration: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rt-cpf">CPF</Label>
                    <Input
                      id="rt-cpf"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: formatCpf(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt-email">E-mail</Label>
                    <Input
                      id="rt-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(EMPTY_FORM); setEditingId(null); }}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> {editingId ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedCompanyId && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Selecione uma empresa para gerenciar os responsáveis técnicos.
          </CardContent>
        </Card>
      )}

      {selectedCompanyId && loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedCompanyId && !loading && responsibles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum responsável técnico cadastrado.</p>
            <p className="text-xs mt-1">Clique em "Novo" para adicionar.</p>
          </CardContent>
        </Card>
      )}

      {responsibles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {responsibles.map((r) => (
            <Card key={r.id} className="relative group">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserCheck className="h-4 w-4 text-accent shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.govbr_certificate_id && (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success gap-1">
                        <ShieldCheck className="h-3 w-3" /> Assinado
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {r.title && (
                  <p className="text-xs text-accent font-medium">{r.title}</p>
                )}
                {r.specialization && (
                  <p className="text-xs text-muted-foreground">{r.specialization}</p>
                )}
                <p className="text-xs font-mono text-foreground">{r.professional_registration}</p>
                <div className="flex gap-4 text-[11px] text-muted-foreground">
                  {r.cpf && <span>CPF: {r.cpf}</span>}
                  {r.email && <span>{r.email}</span>}
                </div>

                {/* Signature block preview */}
                <div className="mt-3 p-3 border border-dashed border-border rounded-lg bg-muted/30">
                  <p className="text-[9px] text-muted-foreground text-center mb-1">
                    {r.govbr_certificate_id ? "Documento assinado digitalmente" : "Prévia do bloco de assinatura"}
                  </p>
                  {r.govbr_certificate_id && (
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <img src="https://www.gov.br/++theme++flavour/assets/portal/images/govbr-logo-large.png" alt="gov.br" className="h-4" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-bold">{r.name}</p>
                    {r.title && <p className="text-[11px] text-accent">{r.title}</p>}
                    {r.specialization && <p className="text-[11px] text-muted-foreground">{r.specialization}</p>}
                    <p className="text-[11px] font-mono">{r.professional_registration}</p>
                  </div>
                </div>

                <div className="flex gap-1 pt-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => handleEdit(r)}>
                    <Edit2 className="h-3 w-3" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 gap-1"
                    onClick={() => handleGovBrSign(r)}
                    disabled={!!signing}
                  >
                    {signing === r.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileSignature className="h-3 w-3" />
                    )}
                    Assinar gov.br
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3 w-3" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info about gov.br integration */}
      <Card className="border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Assinatura Digital gov.br</p>
              <p className="text-xs text-muted-foreground">
                A integração com a API de Assinatura Eletrônica do gov.br permite assinar documentos 
                digitalmente utilizando certificados avançados emitidos pela plataforma gov.br. 
                O processo requer autenticação OAuth 2.0 via Login Único e utiliza a API REST do ITI 
                para gerar assinaturas em formato PKCS#7.
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                Ambiente de homologação: assinatura-api.staging.iti.br — Produção: assinatura-api.iti.gov.br
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
