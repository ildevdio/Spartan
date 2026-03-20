import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { ReportSignatureDialog, type SignatureResult } from "./ReportSignatureDialog";
import { generatePdfBlob } from "@/lib/docx-report-generator";
import { saveAs } from "file-saver";

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  title: string;
  onDownloadDocx?: () => void;
  onDownloadPdf?: () => void;
  onSigned?: (result: SignatureResult) => void;
}

type PdfState = "idle" | "generating" | "ready" | "error";

export function ReportPreviewDialog({ open, onOpenChange, html, title, onDownloadDocx, onDownloadPdf, onSigned }: ReportPreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null);

  // Background PDF pre-baking
  const [pdfState, setPdfState] = useState<PdfState>("idle");
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfProgressLabel, setPdfProgressLabel] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const blobCacheKeyRef = useRef<string>("");
  const abortRef = useRef(false);

  // Start background PDF generation when dialog opens
  useEffect(() => {
    if (!open || !html || html.length < 50) return;

    const cacheKey = html.substring(0, 200) + html.length;
    if (cacheKey === blobCacheKeyRef.current && pdfBlob) return; // Already cached

    abortRef.current = false;
    setPdfState("generating");
    setPdfProgress(0);
    setPdfProgressLabel("Iniciando...");
    setPdfBlob(null);

    const run = async () => {
      try {
        const blob = await generatePdfBlob(html, (pct, label) => {
          if (abortRef.current) return;
          setPdfProgress(pct);
          setPdfProgressLabel(label);
        });
        if (!abortRef.current) {
          setPdfBlob(blob);
          setPdfState("ready");
          blobCacheKeyRef.current = cacheKey;
        }
      } catch (err) {
        console.error("[PDF Background]", err);
        if (!abortRef.current) {
          setPdfState("error");
        }
      }
    };

    // Small delay so dialog renders first
    const timer = setTimeout(run, 500);
    return () => {
      clearTimeout(timer);
      abortRef.current = true;
    };
  }, [open, html]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        td, th { border: 1px solid #D1D5DB; padding: 8px; font-size: 13px; }
        th { background: #f1f5f9; font-weight: bold; }
        h1 { font-size: 22px; color: #1e293b; } h2 { font-size: 18px; color: #1e293b; margin-top: 24px; }
        h3 { font-size: 15px; color: #475569; } p { font-size: 13px; margin: 8px 0; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
        img { max-width: 100%; height: auto; }
        @media print { body { padding: 20px; } }
      </style></head><body>${html}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePdfDownload = useCallback(async () => {
    const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    if (pdfState === "ready" && pdfBlob) {
      // Instant download from pre-baked blob
      saveAs(pdfBlob, fileName);
      return;
    }

    // PDF not ready yet — fall back to overlay-based generation
    if (onDownloadPdf) {
      await onDownloadPdf();
    }
  }, [pdfState, pdfBlob, onDownloadPdf, title]);

  const handleSigned = (result: SignatureResult) => {
    setSignatureResult(result);
    onSigned?.(result);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSignatureResult(null);
      abortRef.current = true;
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b border-border shrink-0">
            <DialogTitle className="text-sm sm:text-base truncate pr-2">{title}</DialogTitle>
            <div className="flex items-center gap-2 shrink-0">
              {/* PDF background status */}
              {pdfState === "generating" && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="hidden sm:inline">Preparando PDF... {Math.round(pdfProgress)}%</span>
                </span>
              )}
              {pdfState === "ready" && (
                <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">PDF pronto</span>
                </span>
              )}

              {/* Signature status */}
              {signatureResult && (
                <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Assinado
                </span>
              )}

              {/* Sign button */}
              <Button
                size="sm"
                variant={signatureResult ? "outline" : "default"}
                className="h-7 text-xs gap-1"
                onClick={() => setSignDialogOpen(true)}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{signatureResult ? "Reassinar" : "Assinar (A3)"}</span>
                <span className="sm:hidden">A3</span>
              </Button>

              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button
                size="sm"
                variant={pdfState === "ready" ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={handlePdfDownload}
                disabled={pdfState === "generating"}
              >
                {pdfState === "generating" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : pdfState === "ready" ? (
                  <Download className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <FileText className="h-3.5 w-3.5 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {pdfState === "ready" ? "Baixar PDF" : "PDF"}
                </span>
              </Button>
            </div>
          </DialogHeader>

          {/* Progress bar for background generation */}
          {pdfState === "generating" && (
            <div className="h-1 w-full bg-muted shrink-0">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${pdfProgress}%` }}
              />
            </div>
          )}

          <div className="flex-1 overflow-auto bg-white">
            <div
              ref={contentRef}
              className="report-preview-content p-6 sm:p-10 max-w-[210mm] mx-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {/* Signature block at the bottom */}
            {signatureResult && (
              <div className="max-w-[210mm] mx-auto px-6 sm:px-10 pb-10">
                <div className="border-t-2 border-success/30 pt-4 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-sm font-bold text-success">DOCUMENTO ASSINADO DIGITALMENTE</span>
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20 text-xs space-y-1">
                    <p><strong>Assinante:</strong> {signatureResult.certificateSubject}</p>
                    <p><strong>Emissor:</strong> {signatureResult.certificateIssuer}</p>
                    {signatureResult.pkiBrazil?.cpf && (
                      <p><strong>CPF:</strong> {signatureResult.pkiBrazil.cpf}</p>
                    )}
                    {signatureResult.pkiBrazil?.cnpj && (
                      <p><strong>CNPJ:</strong> {signatureResult.pkiBrazil.cnpj}</p>
                    )}
                    <p><strong>Data/Hora:</strong> {new Date(signatureResult.signedAt).toLocaleString("pt-BR")}</p>
                    <p className="font-mono text-[9px] text-muted-foreground break-all mt-2">
                      <strong>Hash da assinatura:</strong> {signatureResult.signature.substring(0, 64)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReportSignatureDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        reportTitle={title}
        reportHtml={html}
        onSigned={handleSigned}
      />
    </>
  );
}
