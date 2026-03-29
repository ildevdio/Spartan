export const PRINT_STYLES = `
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
    .rpt-cover { page-break-after: always !important; break-after: page !important; }
    .rpt-section { page-break-before: always !important; break-before: page !important; }
    .page-break { page-break-after: always !important; break-after: page !important; height: 0; overflow: hidden; }
    .rpt-table { page-break-inside: avoid !important; }
    .rpt-callout { page-break-inside: avoid !important; }
    .rpt-sig { page-break-inside: avoid !important; }
    .no-print { display: none !important; }
  }
  @page { size: A4; margin: 15mm 12mm; }
`;

export function generateAndDownloadPdf(html: string, title: string) {
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
      ${PRINT_STYLES}
    </style></head><body>${html}</body></html>
  `);
  
  printWindow.document.close();
  
  // Give it a tiny bit of time to render styles and images, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}
