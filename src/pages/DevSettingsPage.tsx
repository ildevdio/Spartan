import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLicense } from "@/lib/license-context";
import { useCompany } from "@/lib/company-context";
import { obfuscate, deobfuscate } from "@/lib/crypto";
import { supabase, isRealDb } from "@/integrations/supabase/client";
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
  AlertCircle
} from "lucide-react";

export default function DevSettingsPage() {
  const { isDeveloper, licenseKey, deactivateLicense } = useLicense();
  const { companies, updateCompany, refreshCompanies } = useCompany();
  
  // Key Issuer State
  const [plainKey, setPlainKey] = useState("");
  const [obfuscatedResult, setObfuscatedResult] = useState("");

  // System Info
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
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const handleLogoUpload = async (companyId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${companyId}/${Math.random()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      await updateCompany(companyId, { logo_url: publicUrl });
      toast.success("Logo atualizada com sucesso!");
      refreshCompanies();
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
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
        <h1 className="text-3xl font-bold tracking-tight">Desenvolvimento</h1>
        <Badge variant={isRealDb ? "default" : "secondary"} className="h-6">
          {isRealDb ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
          Modo {isRealDb ? "Produção (Supabase)" : "Acesso Limitado (Mock)"}
        </Badge>
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
                  <TableHead className="text-center">Status PRO</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
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
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch 
                          checked={!!company.is_pro} 
                          onCheckedChange={() => handleTogglePro(company.id, !!company.is_pro)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info("Edição completa disponível no menu Empresas")}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Actions */}
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
