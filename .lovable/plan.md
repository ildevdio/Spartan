

# Pré-geração de PDF com QA em Background e Fidelidade aos Modelos de Referência

## Problema atual
1. O PDF é gerado sob demanda quando o usuário clica "PDF" — o processo bloqueia a interface e dados são cortados
2. O layout atual (gradientes CSS, seções coloridas) difere significativamente dos PDFs de referência que seguem formato técnico institucional (cabeçalho com logo+título+SMS, conteúdo texto justificado, tabelas com bordas pretas, rodapé com logo MG Consult)
3. O QA roda durante o download, sem tempo para correções profundas

## Solução

### Conceito: "PDF pré-cozido"
O sistema gera o PDF automaticamente em background assim que o usuário abre a pré-visualização. Quando clica "Baixar PDF", o arquivo já está pronto — download instantâneo. O overlay de QA roda silenciosamente, e o usuário vê apenas uma barra de progresso discreta no header do dialog.

### Mudanças por arquivo

#### 1. `src/components/ReportPreviewDialog.tsx`
- Ao abrir o dialog (`open=true`), disparar `generatePdfInBackground(html, title)` automaticamente
- Guardar o Blob resultante em state (`pdfBlob`)
- Mostrar indicador discreto no header: spinner pequeno + "Preparando PDF..." que vira "PDF pronto ✓"
- Botão "PDF" baixa instantaneamente do blob (sem overlay, sem espera)
- Se o PDF ainda não terminou quando o usuário clica, mostrar o overlay normalmente

#### 2. `src/lib/docx-report-generator.ts`
- Nova função `generatePdfBlob(ctx): Promise<Blob>` — mesma lógica de `generateAndDownloadPdf` mas retorna Blob em vez de salvar
- Mover a lógica compartilhada para uma função interna `buildPdf(ctx, overlay?)`
- O overlay de QA se torna opcional (em background, usa overlay silencioso ou nenhum)
- `generateAndDownloadPdf` passa a ser wrapper fino: chama `generatePdfBlob` + `saveAs`

#### 3. `src/lib/report-templates.ts` — Fidelidade ao modelo de referência
Ajustes visuais baseados nos PDFs enviados (AET_FINALIZADA, PGR_FORTALEZA):

- **Cabeçalho por página**: Adicionar div de header em cada seção com logo da empresa (esquerda), título do documento (centro), e tabela SMS com Emissão/Revisão/Folha (direita) — exatamente como nos modelos
- **Rodapé por página**: Logo MG Consult centralizada no rodapé
- **Tipografia**: Texto corpo justificado, parágrafos com espaçamento adequado, títulos em negrito sem gradiente
- **Tabelas**: Bordas pretas sólidas, cabeçalhos com fundo verde claro (#c6efce) para tabelas de riscos, sem gradientes
- **Inventário de Riscos Ocupacionais**: Reproduzir fielmente a tabela dos modelos com colunas Agente, Identificação de Perigos, Possíveis Danos, Fonte Geradora, Trajetória/Meio de Propagação, Tempo de Exposição, P, S, NR, EPC, ADM, EPI
- **Ficha REBA**: Manter o layout com áreas anatômicas e tabelas de pontuação como na Referência_1

#### 4. `src/lib/pdf-qa-analyzer.ts`
- Sem mudanças no limiar (40% já aprovado)
- Otimizar leitura de pixels: usar `getImageData` em bloco único em vez de pixel-a-pixel (performance para background)

## Fluxo do usuário (novo)

```text
1. Usuário clica "Visualizar AET"
2. Dialog abre com preview HTML
3. Background: PDF começa a ser gerado automaticamente
   - QA analisa cada página silenciosamente
   - Correções aplicadas se necessário
4. Header mostra: "⏳ Preparando PDF..." → "✅ PDF pronto"
5. Usuário clica "PDF" → download instantâneo do blob
```

## Detalhes técnicos
- O blob é gerado via `jsPDF` + `html2canvas` no mesmo fluxo existente, mas sem overlay bloqueante
- O container de renderização (`data-pdf-render`) é criado off-screen com `opacity: 0` + `pointerEvents: none` para não afetar a UI
- Se o usuário fechar e reabrir o dialog com o mesmo HTML, reutiliza o blob cacheado
- Escala de captura: manter 1x para velocidade, subir para 1.5x apenas em páginas com problemas detectados

