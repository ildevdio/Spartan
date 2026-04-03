import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useLicense } from "@/lib/license-context";
import { useCompany } from "@/lib/company-context";
import { CompanyForm } from "./EmpresasPage";
import { obfuscate, deobfuscate } from "@/lib/crypto";
import { masterSupabase, supabase, isRealDb } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ShieldAlert, 
  Database, 
  Key, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Plus,
  Terminal,
  ExternalLink
} from "lucide-react";

export default function DevSettingsPage() {
  const { isDeveloper, isFullVersion, licenseKey, activateLicense, deactivateLicense } = useLicense();
  const { companies, addCompany, updateCompany, refreshCompanies } = useCompany();
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  
  // Key Issuer State
  const [plainKey, setPlainKey] = useState("");
  const [obfuscatedResult, setObfuscatedResult] = useState("");

  // Master Licenses (Multi-Tenant)
  const [masterLicenses, setMasterLicenses] = useState<any[]>([]);
  const [isAddingMasterLicense, setIsAddingMasterLicense] = useState(false);
  const [newMasterLicense, setNewMasterLicense] = useState({
    license_id: "",
    client_name: "",
    target_supabase_url: "",
    target_supabase_anon_key: ""
  });

  useEffect(() => {
    if (isDeveloper) {
      const init = async () => {
        if (!isFullVersion) {
          await activateLicense(licenseKey);
        }
        fetchMasterLicenses();
      };
      init();
    }
  }, [isDeveloper]);

  const fetchMasterLicenses = async () => {
    try {
      const { data, error } = await masterSupabase
        .from('master_licenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMasterLicenses(data || []);
    } catch (error: any) {
      console.error("Error fetching master licenses:", error);
      // Don't toast error here as the table might not exist yet
    }
  };

  const handleAddMasterLicense = async () => {
    try {
      if (!newMasterLicense.license_id || !newMasterLicense.target_supabase_url) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      const { error } = await masterSupabase
        .from('master_licenses')
        .insert([newMasterLicense]);

      if (error) throw error;

      toast.success("Nova instância registrada com sucesso!");
      setIsAddingMasterLicense(false);
      setNewMasterLicense({
        license_id: "",
        client_name: "",
        target_supabase_url: "",
        target_supabase_anon_key: ""
      });
      fetchMasterLicenses();
    } catch (error: any) {
      toast.error("Erro ao registrar instância: " + error.message);
    }
  };

  const handleDeleteMasterLicense = async (id: string) => {
    if (!confirm("Excluir esta instância? O cliente perderá acesso.")) return;
    try {
      const { error } = await masterSupabase
        .from('master_licenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Instância removida");
      fetchMasterLicenses();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "N/A";
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "N/A";

  if (!isDeveloper) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md border-destructive/20">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Esta página é exclusiva para desenvolvedores autorizados.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleGenerateKeyForCompany = (company: any) => {
    const slug = (company.trade_name || company.name)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    const plainKey = `SPARTAN-2024-${slug}`;
    const obfuscated = obfuscate(plainKey);
    
    // Persist to database so it can be recovered later
    updateCompany(company.id, { license_key: obfuscated });
    
    const envLine = `VITE_SPARTAN_LICENSE_${slug}="${obfuscated}"`;
    navigator.clipboard.writeText(envLine);
    toast.success(`Chave gerada, salva no banco e copiada: ${plainKey}`);
  };

  const handleSaveCompany = async (data: any, dbConfig?: { url: string; key: string }) => {
    await addCompany(data, dbConfig);
    setIsAddingCompany(false);
  };

  const handleGenerateKey = () => {
    if (!plainKey.trim()) {
      toast.error("Insira um texto para ofuscar");
      return;
    }
    const result = obfuscate(plainKey.trim());
    setObfuscatedResult(result);
    toast.success("Chave gerada com sucesso!");
  };

  const copyToClipboard = (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success("Copiado (via fallback)!");
        } else {
          throw new Error("Fallback failed");
        }
      }
    } catch (err) {
      console.error('Copy error:', err);
      toast.error("Erro ao copiar automaticamente. Tente selecionar o texto e usar Ctrl+C.");
    }
  };

  const handleLogoUpload = async (companyId: string, file: File) => {
    try {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato inválido! Use PNG ou JPEG.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${companyId}/${Math.random()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes("JWS") || uploadError.message.includes("Unauthorized")) {
          throw new Error("Erro de autenticação no banco. Verifique as políticas de Storage.");
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      await updateCompany(companyId, { logo_url: publicUrl });
      toast.success("Logo atualizada com sucesso!");
      refreshCompanies();
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
      console.error("Logo upload error:", error);
    }
  };

  const addCompanyInternal = async (c: any) => {
    try {
      const { logo_preview, ...cleanData } = c as any;
      const { error } = await supabase.from("companies").insert(cleanData);
      if (error) {
        console.error("Add company error:", error);
        toast.error("Erro ao criar empresa: " + (error.message || "Erro desconhecido"));
        return;
      }
      toast.success("Novo cliente registrado!");
      refreshCompanies();
    } catch (err: any) {
      console.error("Add company exception:", err);
      toast.error("Falha no cadastro: " + (err.message || "Tente novamente"));
    }
  };

  const handleTogglePro = async (companyId: string, currentStatus: boolean) => {
    await updateCompany(companyId, { is_pro: !currentStatus });
    toast.success(`Empresa ${!currentStatus ? 'ativada' : 'desativada'} como PRO`);
  };

  const handleFactoryReset = () => {
    if (confirm("Isso apagará todas as chaves e configurações locais. Continuar?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desenvolvimento</h1>
          <p className="text-sm text-muted-foreground">Gerencie credenciais oficiais e diagnostique o sistema</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingCompany} onOpenChange={setIsAddingCompany}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Novo Cliente Certificado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerar Credenciais para Novo Cliente</DialogTitle>
                <DialogDescription>Cadastre as informações básicas e gere a chave de licenciamento oficial.</DialogDescription>
              </DialogHeader>
              <CompanyForm 
                editing={null} 
                onSave={handleSaveCompany} 
                onCancel={() => setIsAddingCompany(false)} 
              />
            </DialogContent>
          </Dialog>
          <Badge variant={isRealDb ? "default" : "secondary"} className="h-8 px-3">
            {isRealDb ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            Modo {isRealDb ? "Produção" : "Acesso Limitado"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Diagnostics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Diagnóstico do Sistema</CardTitle>
            </div>
            <CardDescription>Informações do ambiente atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Supabase URL</span>
              <code className="text-xs bg-muted p-2 rounded block truncate">{supabaseUrl}</code>
            </div>
            <div className="grid gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Project ID</span>
              <code className="text-xs bg-muted p-2 rounded block">{projectId}</code>
            </div>
            <div className="grid gap-1 pt-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sua Chave Atual</span>
              <code className="text-xs bg-accent/10 border border-accent/20 p-2 rounded block truncate">
                {licenseKey || "Nenhuma"}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Key Issuer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Emissor de Chaves</CardTitle>
            </div>
            <CardDescription>Gerar código para o arquivo .env</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Ex: SPARTAN-CLIENTE-XYZ" 
                value={plainKey}
                onChange={(e) => setPlainKey(e.target.value)}
              />
              <Button onClick={handleGenerateKey}>Gerar</Button>
            </div>
            {obfuscatedResult && (
              <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Código Ofuscado:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all flex-1">{obfuscatedResult}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(obfuscatedResult)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Customer Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gestão Rápida de Clientes</CardTitle>
              <CardDescription>Editar informações básicas e status premium</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refreshCompanies()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar Lista
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-center">Chave Salva</TableHead>
                  <TableHead className="text-center">Status PRO</TableHead>
                  <TableHead className="text-center">Ações de Desenvolvedor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies && companies.length > 0 ? (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                    <TableCell>
                      <div className="relative group cursor-pointer h-10 w-10 bg-muted rounded flex items-center justify-center overflow-hidden border border-border">
                        {company.logo_url ? (
                          <img src={company.logo_url} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(company.id, file);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {company.name}
                      <div className="text-[10px] text-muted-foreground font-normal">{company.id}</div>
                    </TableCell>
                    <TableCell className="text-xs">{company.cnpj}</TableCell>
                    <TableCell className="text-center font-mono text-[10px]">
                      {company.license_key ? (
                        <div className="flex items-center justify-center gap-2">
                          <code className="bg-muted px-1 rounded truncate max-w-[80px]">...{company.license_key.slice(-6)}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`VITE_SPARTAN_LICENSE_${(company.trade_name || company.name).toUpperCase().replace(/[^A-Z0-9]/g, "_")}="${company.license_key}"`)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Nenhuma</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch 
                          checked={!!company.is_pro} 
                          onCheckedChange={() => handleTogglePro(company.id, !!company.is_pro)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant={company.license_key ? "outline" : "default"} size="sm" onClick={() => handleGenerateKeyForCompany(company)} className="h-8">
                        <Terminal className="h-3.5 w-3.5 mr-2" /> {company.license_key ? "Regerar Chave" : "Gerar Chave .env"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => window.open('/empresas', '_blank')}>
                        Ver Detalhes <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Nenhuma empresa encontrada ou erro de conexão com o banco de dados.
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Private Instances (Multi-Tenant Management) */}
      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              <div>
                <CardTitle className="text-lg">Gestão de Instâncias Privadas (Multi-Tenant)</CardTitle>
                <CardDescription>Configure bancos de dados independentes para cada credencial</CardDescription>
              </div>
            </div>
            <Dialog open={isAddingMasterLicense} onOpenChange={setIsAddingMasterLicense}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Víncular Novo Banco
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Instância de Cliente</DialogTitle>
                  <DialogDescription>As informações do banco de dados do cliente ficarão vinculadas à chave de licença.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Cliente</label>
                    <Input 
                      placeholder="Ex: MG Consult - Filial SP" 
                      value={newMasterLicense.client_name}
                      onChange={(e) => setNewMasterLicense({...newMasterLicense, client_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">ID da Chave (License ID)</label>
                    <Input 
                      placeholder="Ex: SPARTAN-2024-MGCONSULT" 
                      value={newMasterLicense.license_id}
                      onChange={(e) => setNewMasterLicense({...newMasterLicense, license_id: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Supabase Project URL</label>
                    <Input 
                      placeholder="https://xyz.supabase.co" 
                      value={newMasterLicense.target_supabase_url}
                      onChange={(e) => setNewMasterLicense({...newMasterLicense, target_supabase_url: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Anon Public Key (JWT)</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="eyJ..." 
                        type="password"
                        value={newMasterLicense.target_supabase_anon_key}
                        onChange={(e) => setNewMasterLicense({...newMasterLicense, target_supabase_anon_key: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMasterLicense} className="w-full bg-accent text-accent-foreground">Vincular Banco Agora</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente & Licença</TableHead>
                  <TableHead>Supabase URL</TableHead>
                  <TableHead>Anon API Key</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterLicenses.length > 0 ? (
                  masterLicenses.map((ml) => (
                    <TableRow key={ml.id}>
                      <TableCell>
                        <div className="font-bold text-sm">{ml.client_name}</div>
                        <code className="text-[10px] text-accent font-mono uppercase">{ml.license_id}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded max-w-[150px] truncate">{ml.target_supabase_url}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(ml.target_supabase_url)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded max-w-[150px] truncate">
                            {ml.target_supabase_anon_key.substring(0, 15)}...
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(ml.target_supabase_anon_key)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMasterLicense(ml.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                      Nenhum banco de dados remoto vinculado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Ações Críticas</CardTitle>
          <CardDescription>Use com cautela</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="destructive" onClick={handleFactoryReset}>
            <Trash2 className="h-4 w-4 mr-2" /> Reset de Fábrica (Limpar Tudo)
          </Button>
          <Button variant="outline" onClick={deactivateLicense}>
            <LogOut className="h-4 w-4 mr-2" /> Deslogar do Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
