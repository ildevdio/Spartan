import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  KeyRound, RefreshCw, ShieldCheck, Loader2, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  initWebPKI, listCertificates, signData, readCertificate,
  isInitialized, type CertificateInfo,
} from "@/lib/web-pki";

interface ReportSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  reportHtml: string;
  onSigned?: (signature: SignatureResult) => void;
}

export interface SignatureResult {
  signature: string;
  certificateEncoding: string;
  certificateSubject: string;
  certificateIssuer: string;
  certificateThumbprint: string;
  signedAt: string;
  pkiBrazil?: {
    cpf?: string;
    cnpj?: string;
    companyName?: string;
  };
}

export function ReportSignatureDialog({
  open, onOpenChange, reportTitle, reportHtml, onSigned,
}: ReportSignatureDialogProps) {
  const [pkiReady, setPkiReady] = useState(isInitialized());
  const [pkiLoading, setPkiLoading] = useState(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedCert(null);
      setSigned(false);
      return;
    }
    if (!isInitialized()) {
      setPkiLoading(true);
      initWebPKI().then((ready) => {
        setPkiReady(ready);
        setPkiLoading(false);
        if (ready) loadCerts();
        else toast.error("Web PKI não está instalado. Instale a extensão para assinar.");
      });
    } else {
      setPkiReady(true);
      loadCerts();
    }
  }, [open]);

  const loadCerts = async () => {
    try {
      const certs = await listCertificates();
      setCertificates(certs);
      if (certs.length === 0) {
        toast.warning("Nenhum certificado encontrado. Verifique se o token USB está conectado.");
      }
    } catch {
      toast.error("Erro ao listar certificados.");
    }
  };

  const handleSign = async () => {
    if (!selectedCert) return;
    setSigning(true);
    try {
      // Build payload from report content
      const payload = JSON.stringify({
        title: reportTitle,
        contentHash: await hashContent(reportHtml),
        timestamp: new Date().toISOString(),
      });
      const payloadBase64 = btoa(unescape(encodeURIComponent(payload)));

      const signature = await signData(selectedCert, payloadBase64);
      const certEncoding = await readCertificate(selectedCert);
      const certInfo = certificates.find((c) => c.thumbprint === selectedCert);

      const result: SignatureResult = {
        signature,
        certificateEncoding: certEncoding,
        certificateSubject: certInfo?.subjectName || "",
        certificateIssuer: certInfo?.issuerName || "",
        certificateThumbprint: selectedCert,
        signedAt: new Date().toISOString(),
        pkiBrazil: certInfo?.pkiBrazil ? {
          cpf: certInfo.pkiBrazil.cpf,
          cnpj: certInfo.pkiBrazil.cnpj,
          companyName: certInfo.pkiBrazil.companyName,
        } : undefined,
      };

      setSigned(true);
      toast.success("Relatório assinado digitalmente com sucesso!");
      onSigned?.(result);
    } catch (err) {
      console.error("Signing error:", err);
      toast.error("Erro ao assinar. Verifique se o token está conectado e o PIN foi informado.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-accent" />
            Assinar Relatório Digitalmente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Report info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">Relatório</p>
            <p className="text-sm font-medium truncate">{reportTitle}</p>
          </div>

          {/* PKI status */}
          {pkiLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Inicializando Web PKI...
            </div>
          ) : !pkiReady ? (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Web PKI não instalado</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Instale a extensão Lacuna Web PKI para assinar documentos com certificado A3.
              </p>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open("https://get.webpkiplugin.com/", "_blank")}>
                Instalar Web PKI
              </Button>
            </div>
          ) : signed ? (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
              <ShieldCheck className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-success">Assinado Digitalmente</p>
              <p className="text-xs text-muted-foreground mt-1">ICP-Brasil — Certificado A3</p>
            </div>
          ) : (
            <>
              {/* Certificate list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Certificados Disponíveis</p>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={loadCerts}>
                    <RefreshCw className="h-3 w-3" /> Atualizar
                  </Button>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                    <KeyRound className="h-6 w-6 mx-auto mb-2 opacity-30" />
                    Nenhum certificado encontrado. Conecte o token USB.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {certificates.map((cert) => {
                      const isExpired = new Date(cert.validityEnd) < new Date();
                      const isSelected = selectedCert === cert.thumbprint;
                      return (
                        <button
                          key={cert.thumbprint}
                          onClick={() => !isExpired && setSelectedCert(cert.thumbprint)}
                          disabled={isExpired}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? "border-accent bg-accent/10"
                              : isExpired
                              ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                              : "border-border hover:border-accent/50 hover:bg-accent/5 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{cert.subjectName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{cert.issuerName}</p>
                              {cert.pkiBrazil?.cpf && (
                                <p className="text-[10px] text-muted-foreground">CPF: {cert.pkiBrazil.cpf}</p>
                              )}
                              {cert.pkiBrazil?.cnpj && (
                                <p className="text-[10px] text-muted-foreground">CNPJ: {cert.pkiBrazil.cnpj}</p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-accent" />
                              )}
                              <Badge variant="outline" className={`text-[9px] ${
                                isExpired ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                              }`}>
                                {isExpired ? "Expirado" : `Válido até ${new Date(cert.validityEnd).toLocaleDateString("pt-BR")}`}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sign button */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!selectedCert || signing}
                  className="gap-1.5"
                >
                  {signing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {signing ? "Assinando..." : "Assinar Relatório"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
