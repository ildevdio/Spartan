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
  ExternalLink,
  Globe
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DevSettingsPage() {
  const { isDeveloper, isFullVersion, licenseKey, activateLicense, deactivateLicense } = useLicense();
  const [masterCompanies, setMasterCompanies] = useState<any[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  
  // Key Issuer State
  const [plainKey, setPlainKey] = useState("");
  const [obfuscatedResult, setObfuscatedResult] = useState("");

  // Master Licenses (Multi-Tenant)
  const [masterLicenses, setMasterLicenses] = useState<any[]>([]);
  const [isAddingMasterLicense, setIsAddingMasterLicense] = useState(false);
  const [newMasterLicense, setNewMasterLicense] = useState({
    license_id: "",
    company_id: "",
    client_name: "",
    target_supabase_url: "",
    target_supabase_anon_key: ""
  });
  const [detailCompany, setDetailCompany] = useState<any>(null);

  useEffect(() => {
    if (isDeveloper) {
      const init = async () => {
        if (!isFullVersion) {
          await activateLicense(licenseKey);
        }
        fetchMasterLicenses();
        fetchMasterCompanies();
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
    }
  };

  const fetchMasterCompanies = async () => {
    try {
      const { data, error } = await masterSupabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setMasterCompanies(data || []);
    } catch (error: any) {
      console.error("Error fetching master companies:", error);
    }
  };

  const handleAddMasterLicense = async () => {
    try {
      if (!newMasterLicense.company_id || !newMasterLicense.target_supabase_url) {
        toast.error("Selecione uma empresa e preencha a URL");
        return;
      }

      const company = masterCompanies.find(c => c.id === newMasterLicense.company_id);
      if (!company) return;

      const slug = (company.trade_name || company.name)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      const licenseId = `SPARTAN-2024-${slug}`;

      const { error } = await masterSupabase
        .from('master_licenses')
        .insert([{
          license_id: licenseId,
          client_name: company.name,
          target_supabase_url: newMasterLicense.target_supabase_url,
          target_supabase_anon_key: newMasterLicense.target_supabase_anon_key,
          is_active: true
        }]);

      if (error) throw error;

      // Update company with the generated license key
      await updateCompany(company.id, { license_key: obfuscate(licenseId) });

      toast.success("Nova instância vinculada com sucesso!");
      setIsAddingMasterLicense(false);
      setNewMasterLicense({
        license_id: "",
        company_id: "",
        client_name: "",
        target_supabase_url: "",
        target_supabase_anon_key: ""
      });
      fetchMasterLicenses();
    } catch (error: any) {
      toast.error("Erro ao registrar instância: " + error.message);
    }
  };

  const handleDeleteMasterLicense = async (ml: any) => {
    if (!confirm(`EXCLUSÃO CRÍTICA: Deseja apagar a instância "${ml.client_name}" e TODOS os dados locais vinculados? Esta ação é irreversível.`)) return;
    
    setGenerating("deleting");
    try {
      // 1. Remove from global master_licenses
      const { error: masterError } = await masterSupabase
        .from('master_licenses')
        .delete()
        .eq('id', ml.id);
      if (masterError) throw masterError;

      // 2. Locate and remove global company record in Master DB
      const { error: companyError } = await masterSupabase
        .from('companies')
        .delete()
        .eq('name', ml.client_name);
      
      if (companyError) console.error("Master company deletion error:", companyError);

      toast.success("Instância e registro de consultoria removidos do mestre.");
      fetchMasterLicenses();
      fetchMasterCompanies();
    } catch (error: any) {
      toast.error("Erro na exclusão em cascata: " + error.message);
    } finally {
      setGenerating(null);
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

  const handleGenerateKeyForCompany = async (company: any) => {
    const slug = (company.trade_name || company.name)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    const plainKey = `SPARTAN-2024-${slug}`;
    const obfuscated = obfuscate(plainKey);
    
    // Persist to Master database
    await masterSupabase
      .from('companies')
      .update({ license_key: obfuscated })
      .eq('id', company.id);
    
    fetchMasterCompanies();
    
    const envLine = `VITE_SPARTAN_LICENSE_${slug}="${obfuscated}"`;
    navigator.clipboard.writeText(envLine);
    toast.success(`Chave gerada, salva no banco e copiada: ${plainKey}`);
  };

  const handleSaveCompany = async (data: any, dbConfig?: { url: string; key: string }) => {
    try {
      if (detailCompany) {
        const { error } = await masterSupabase
          .from('companies')
          .update(data)
          .eq('id', detailCompany.id);
        if (error) throw error;
        toast.success("Perfil de consultoria atualizado.");
      } else {
        const { error } = await masterSupabase
          .from('companies')
          .insert([data]);
        if (error) throw error;
        toast.success("Nova consultoria registrada.");
      }
      setDetailCompany(null);
      setIsAddingCompany(false);
      fetchMasterCompanies();
    } catch (error: any) {
      toast.error("Erro ao salvar consultoria: " + error.message);
    }
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
    <div className="space-y-6 pb-20 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase text-slate-100">Service Console</h1>
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3">MASTER_OPS</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">Gestão de Infraestrutura Distribuída & Licenciamento</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isAddingCompany} onOpenChange={setIsAddingCompany}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Cliente</DialogTitle>
                <DialogDescription>As credenciais oficiais serão geradas após o cadastro básico.</DialogDescription>
              </DialogHeader>
              <CompanyForm 
                editing={null} 
                onSave={handleSaveCompany} 
                onCancel={() => setIsAddingCompany(false)} 
                showCloudConfig={true}
              />
            </DialogContent>
          </Dialog>
          <Badge variant={isRealDb ? "default" : "secondary"} className="h-8 px-3 w-fit">
            {isRealDb ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            Modo {isRealDb ? "Produção" : "Acesso Limitado"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Diagnostics */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="h-24 w-24" />
          </div>
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-lg text-slate-100 font-bold">Main Stack</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">Ambiente de Operação</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Supabase URL</span>
              <code className="text-[11px] bg-slate-950/50 border border-slate-800 p-2 rounded block truncate text-blue-300 font-mono">
                {supabaseUrl}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isRealDb ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`} />
                <span className="text-xs text-slate-300 font-medium">Status do Link</span>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-400 uppercase">
                {isRealDb ? "Produção" : "Limitado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Global Stats */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="p-5 pb-2">
             <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="text-lg text-slate-100 font-bold">Alcance Global</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">Distribuição de Licenças</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Total Instâncias</span>
                <span className="text-2xl font-bold text-slate-100">{masterLicenses.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Consultorias</span>
                <span className="text-2xl font-bold text-slate-100">{masterCompanies.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Generator Tool */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Key className="h-5 w-5 text-orange-400" />
              </div>
              <CardTitle className="text-lg text-slate-100 font-bold">Code Ofuscator</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
             <div className="flex gap-2">
              <Input 
                placeholder="String original..." 
                className="bg-slate-950 border-slate-800 text-slate-200"
                value={plainKey}
                onChange={(e) => setPlainKey(e.target.value)}
              />
              <Button onClick={handleGenerateKey} className="bg-orange-600 hover:bg-orange-700 text-white">Encripal</Button>
            </div>
            {obfuscatedResult && (
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg group">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[9px] uppercase font-bold text-slate-500 block">Hash de Licença:</span>
                   <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-800" onClick={() => copyToClipboard(obfuscatedResult)}>
                    <Copy className="h-3 w-3 text-slate-400" />
                  </Button>
                </div>
                <code className="text-[10px] break-all text-slate-400 font-mono">{obfuscatedResult}</code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unified Client & Infrastructure Management */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden mt-8">
        <CardHeader className="p-6 border-b border-slate-800/50 bg-slate-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-blue-500" />
                Fleet Management
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Controle operacional de instâncias e autorizações</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800" onClick={() => { fetchMasterCompanies(); fetchMasterLicenses(); }}>
                <RefreshCw className="h-4 w-4 mr-2" /> Sync
              </Button>
              <Dialog open={isAddingMasterLicense} onOpenChange={setIsAddingMasterLicense}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40">
                    <Plus className="h-4 w-4 mr-2" /> Provision New Instance
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle>Instance Provisioning</DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs text-balance">Vincular licença a um novo endpoint de infraestrutura gerenciado.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Client Profile</label>
                      <Select value={newMasterLicense.company_id} onValueChange={(v) => setNewMasterLicense({...newMasterLicense, company_id: v})}>
                        <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                          {masterCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Supabase Host URL</label>
                      <Input 
                        placeholder="https://xxx.supabase.co" 
                        className="bg-slate-950 border-slate-800 text-slate-200"
                        value={newMasterLicense.target_supabase_url}
                        onChange={(e) => setNewMasterLicense({...newMasterLicense, target_supabase_url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Access Token (Anon)</label>
                      <Input 
                        placeholder="eyJ..." 
                        type="password"
                        className="bg-slate-950 border-slate-800 text-slate-200"
                        value={newMasterLicense.target_supabase_anon_key}
                        onChange={(e) => setNewMasterLicense({...newMasterLicense, target_supabase_anon_key: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddMasterLicense} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Execute Provisioning</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[80px] text-[10px] font-black uppercase text-slate-500 px-6 py-4">Entity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4">Profile_Details</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 min-w-[200px]">Node_Endpoint</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase text-slate-500 py-4">Health</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 px-6 py-4">Op_Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterCompanies && masterCompanies.length > 0 ? (
                  masterCompanies.map((company) => {
                    const ml = masterLicenses.find(l => l.client_name === company.name || (company.license_key && deobfuscate(company.license_key) === l.license_id));
                    
                    return (
                      <TableRow key={company.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <TableCell className="px-6">
                          <div className="h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner group">
                            {company.logo_url ? (
                              <img src={company.logo_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-slate-700" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-200 text-sm tracking-tight">{company.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{company.id}</div>
                          <div className="flex gap-1.5 mt-1.5">
                            {company.is_pro && <Badge variant="outline" className="text-[8px] h-4 bg-blue-500/10 text-blue-400 border-blue-500/20 px-1">PRO_ACTIVE</Badge>}
                            {ml && <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-1">DEPLOYED</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          {ml ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 group/url">
                                <code className="text-[10px] bg-slate-950 text-blue-400/80 px-2 py-0.5 rounded border border-slate-800 truncate flex-1">{ml.target_supabase_url}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => copyToClipboard(ml.target_supabase_url)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-600 font-mono">HASH:</span>
                                <code className="text-[9px] text-slate-500 truncate">{ml.license_id}</code>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 italic font-mono uppercase tracking-widest opacity-50">#_local_node_only</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${ml ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${ml ? 'text-green-500/80' : 'text-slate-600'}`}>
                              {ml ? "Online" : "Ghost"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={detailCompany?.id === company.id} onOpenChange={(open) => setDetailCompany(open ? company : null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
                                <DialogHeader>
                                  <DialogTitle>Console_Inspect: {company.name}</DialogTitle>
                                  <DialogDescription className="text-slate-400">Dados cadastrais e configuração de infraestrutura.</DialogDescription>
                                </DialogHeader>
                                <CompanyForm 
                                  editing={company} 
                                  onSave={handleSaveCompany} 
                                  onCancel={() => setDetailCompany(null)} 
                                  showCloudConfig={true}
                                  isInitialReadonly={true}
                                />
                                {ml && (
                                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Infra Connection Strings</h4>
                                    <div className="space-y-4">
                                       <div className="space-y-1">
                                          <span className="text-[9px] text-slate-600">Endpoint Cluster</span>
                                          <div className="flex gap-2">
                                            <Input readOnly value={ml.target_supabase_url} className="h-8 bg-slate-900 border-slate-800 text-xs text-blue-400 font-mono" />
                                          </div>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[9px] text-slate-600">Secret Auth Token</span>
                                          <div className="flex gap-2">
                                            <Input readOnly type="password" value={ml.target_supabase_anon_key} className="h-8 bg-slate-900 border-slate-800 text-xs text-blue-400 font-mono" />
                                          </div>
                                       </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500/50 hover:text-red-500 hover:bg-red-500/10" 
                              disabled={generating === "deleting"}
                              onClick={() => ml ? handleDeleteMasterLicense(ml) : toast.error("Somente instâncias master podem ser removidas pelo console.")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24 text-slate-700 italic font-mono uppercase tracking-widest text-[10px]">
                      Zero Entities Detected in Operation Space
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="border-destructive/20 mt-6 bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-red-500 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Operações Destrutivas
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs text-balance">Procedimentos irreversíveis de limpeza de sistema.</CardDescription>
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
