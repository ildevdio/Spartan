import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  UserCheck, Plus, Trash2, Edit2, Save, X, ShieldCheck,
  Loader2, KeyRound, RefreshCw, CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  initWebPKI, listCertificates, signData, readCertificate,
  type CertificateInfo,
} from "@/lib/web-pki";

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
  const { selectedCompanyId } = useCompany();
  const [responsibles, setResponsibles] = useState<TechnicalResponsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Web PKI state
  const [pkiReady, setPkiReady] = useState(false);
  const [pkiLoading, setPkiLoading] = useState(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  // Initialize Web PKI on mount
  useEffect(() => {
    setPkiLoading(true);
    initWebPKI().then((ready) => {
      setPkiReady(ready);
      if (!ready) {
        console.warn("Lacuna Web PKI não está instalado.");
      }
      setPkiLoading(false);
    });
  }, []);

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
      } else {
        toast.success("Responsável técnico atualizado.");
      }
    } else {
      const { error } = await supabase
        .from("technical_responsibles")
        .insert({ ...form, company_id: selectedCompanyId });
      if (error) {
        toast.error("Erro ao cadastrar.");
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

  const handleOpenSignDialog = async (responsible: TechnicalResponsible) => {
    if (!pkiReady) {
      toast.error(
        "Lacuna Web PKI não está instalado. Instale a extensão do navegador para usar assinatura digital.",
      );
      window.open("https://get.webpkiplugin.com/", "_blank");
      return;
    }

    setSigningId(responsible.id);
    setCertDialogOpen(true);
    setSelectedCert(null);

    try {
      const certs = await listCertificates();
      setCertificates(certs);
      if (certs.length === 0) {
        toast.warning("Nenhum certificado digital encontrado. Verifique se o token USB está conectado.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao listar certificados. Verifique se o token USB está conectado.");
    }
  };

  const handleRefreshCerts = async () => {
    try {
      const certs = await listCertificates();
      setCertificates(certs);
      toast.success(`${certs.length} certificado(s) encontrado(s).`);
    } catch {
      toast.error("Erro ao atualizar lista de certificados.");
    }
  };

  const handleSign = async () => {
    if (!selectedCert || !signingId) return;

    try {
      // Read the certificate encoding
      const certEncoding = await readCertificate(selectedCert);

      // Create a simple signature payload with the responsible's data
      const responsible = responsibles.find((r) => r.id === signingId);
      if (!responsible) return;

      const signaturePayload = JSON.stringify({
        name: responsible.name,
        cpf: responsible.cpf,
        registration: responsible.professional_registration,
        timestamp: new Date().toISOString(),
      });

      const payloadBase64 = btoa(unescape(encodeURIComponent(signaturePayload)));

      // Sign the data with the selected certificate
      const signature = await signData(selectedCert, payloadBase64);

      // Store the certificate info and signature in the database
      const certInfo = certificates.find((c) => c.thumbprint === selectedCert);
      const certificateId = `ICP-Brasil: ${certInfo?.subjectName || selectedCert}`;

      const { error } = await supabase
        .from("technical_responsibles")
        .update({
          govbr_certificate_id: certificateId,
          signature_image_url: signature.substring(0, 500), // store signature fragment
        })
        .eq("id", signingId);

      if (error) {
        toast.error("Erro ao salvar assinatura.");
      } else {
        toast.success("Documento assinado digitalmente com sucesso!");
        fetchResponsibles();
      }

      setCertDialogOpen(false);
      setSigningId(null);
      setSelectedCert(null);
    } catch (err) {
      console.error("Signing error:", err);
      toast.error("Erro ao assinar. Verifique se o token está conectado e o PIN foi informado.");
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
            Cadastre os responsáveis técnicos e assine digitalmente via certificado A3 (token USB)
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
                  <Input id="rt-name" placeholder="Ex: Gisele Dantas" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rt-title">Titulação</Label>
                    <Input id="rt-title" placeholder="Ex: M.Sc Eng. De Produção (Ergonomia)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt-specialization">Especialização</Label>
                    <Input id="rt-specialization" placeholder="Ex: Especialista em Ergonomia" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rt-registration">Registro Profissional *</Label>
                  <Input id="rt-registration" placeholder="Ex: CREA/CE 061294159-0" value={form.professional_registration} onChange={(e) => setForm({ ...form, professional_registration: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rt-cpf">CPF</Label>
                    <Input id="rt-cpf" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: formatCpf(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt-email">E-mail</Label>
                    <Input id="rt-email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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

      {/* Web PKI Status */}
      <div className="flex items-center gap-2 text-xs">
        {pkiLoading ? (
          <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Verificando Web PKI...</Badge>
        ) : pkiReady ? (
          <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30"><CheckCircle2 className="h-3 w-3" /> Web PKI ativo</Badge>
        ) : (
          <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
            <KeyRound className="h-3 w-3" />
            <a href="https://get.webpkiplugin.com/" target="_blank" rel="noopener" className="underline">Instalar Web PKI</a>
          </Badge>
        )}
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
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                        <ShieldCheck className="h-3 w-3" /> Assinado
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {r.title && <p className="text-xs text-accent font-medium">{r.title}</p>}
                {r.specialization && <p className="text-xs text-muted-foreground">{r.specialization}</p>}
                <p className="text-xs font-mono text-foreground">{r.professional_registration}</p>
                <div className="flex gap-4 text-[11px] text-muted-foreground">
                  {r.cpf && <span>CPF: {r.cpf}</span>}
                  {r.email && <span>{r.email}</span>}
                </div>

                {/* Signature block */}
                <div className="mt-3 p-3 border border-dashed border-border rounded-lg bg-muted/30">
                  <p className="text-[9px] text-muted-foreground text-center mb-1">
                    {r.govbr_certificate_id ? "Documento assinado digitalmente (ICP-Brasil)" : "Prévia do bloco de assinatura"}
                  </p>
                  {r.govbr_certificate_id && (
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-[10px] font-medium text-emerald-600">ICP-Brasil</span>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-bold">{r.name}</p>
                    {r.title && <p className="text-[11px] text-accent">{r.title}</p>}
                    {r.specialization && <p className="text-[11px] text-muted-foreground">{r.specialization}</p>}
                    <p className="text-[11px] font-mono">{r.professional_registration}</p>
                  </div>
                  {r.govbr_certificate_id && (
                    <p className="text-[9px] text-muted-foreground text-center mt-1 break-all">
                      {r.govbr_certificate_id}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 pt-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => handleEdit(r)}>
                    <Edit2 className="h-3 w-3" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 gap-1"
                    onClick={() => handleOpenSignDialog(r)}
                  >
                    <KeyRound className="h-3 w-3" />
                    Assinar (Token A3)
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

      {/* Certificate Selection Dialog */}
      <Dialog open={certDialogOpen} onOpenChange={(open) => { if (!open) { setCertDialogOpen(false); setSigningId(null); setSelectedCert(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent" />
              Selecionar Certificado Digital
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecione o certificado do token USB conectado:
              </p>
              <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={handleRefreshCerts}>
                <RefreshCw className="h-3 w-3" /> Atualizar
              </Button>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum certificado encontrado.</p>
                <p className="text-xs mt-1">Conecte o token USB e clique em "Atualizar".</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {certificates.map((cert) => (
                  <div
                    key={cert.thumbprint}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCert === cert.thumbprint
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedCert(cert.thumbprint)}
                  >
                    <p className="text-sm font-medium">{cert.subjectName}</p>
                    <p className="text-[11px] text-muted-foreground">Emitido por: {cert.issuerName}</p>
                    <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>Validade: {new Date(cert.validityEnd).toLocaleDateString("pt-BR")}</span>
                      {cert.pkiBrazil?.cpf && <span>CPF: {cert.pkiBrazil.cpf}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setCertDialogOpen(false); setSigningId(null); }}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button onClick={handleSign} disabled={!selectedCert}>
                <ShieldCheck className="h-4 w-4 mr-1" /> Assinar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info card */}
      <Card className="border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <KeyRound className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Assinatura Digital com Certificado A3 (Token USB)</p>
              <p className="text-xs text-muted-foreground">
                A assinatura digital utiliza o componente Lacuna Web PKI para acessar certificados 
                ICP-Brasil armazenados em tokens USB (A3). O processo de assinatura ocorre 
                inteiramente no navegador, garantindo que a chave privada nunca saia do dispositivo.
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                Requisitos: Token USB com certificado A3 válido + extensão Lacuna Web PKI instalada no navegador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
