import React, { useState } from "react";
import { useLicense } from "@/lib/license-context";
import { Lock, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface LockedFeatureWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function LockedFeatureWrapper({ children, title, description }: LockedFeatureWrapperProps) {
  const { isFullVersion, activateLicense } = useLicense();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");

  const handleActivate = () => {
    if (activateLicense(licenseKey)) {
      setShowUpgradeDialog(false);
    }
  };

  if (isFullVersion) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Blurred background preview */}
      <div className="absolute inset-0 blur-[8px] pointer-events-none opacity-40 select-none overflow-hidden">
        {children}
      </div>

      {/* Locked Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-background/20 backdrop-blur-[2px] z-20">
        <div className="max-w-md w-full bg-card/90 border border-border/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
          <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 relative">
            <Lock className="h-8 w-8 text-accent animate-pulse" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold border-2 border-background">
              PRO
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            {description} Esta funcionalidade avançada está disponível exclusivamente na versão **Spartan Pro**.
          </p>

          <Button 
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Zap className="mr-2 h-4 w-4 fill-current group-hover:animate-bounce" />
            Ativar Versão Completa
          </Button>

          <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Desenvolvido por Focus Tecnologia
          </p>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Ativar Licença Spartan
            </DialogTitle>
            <DialogDescription>
              Insira sua chave de licença para desbloquear todas as funcionalidades profissionais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Ex: SPARTAN-XXXX-XXXX"
              className="col-span-3 h-12 text-center font-mono tracking-widest"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleActivate}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Validar Chave
            </Button>
          </DialogFooter>
          <p className="text-[10px] text-center text-muted-foreground">
            A chave padrão para testes é: <code className="bg-muted px-1 rounded">SPARTAN-2024-MGCONSULT</code>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
