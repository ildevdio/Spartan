

# Correção: Cada Seção em Sua Própria Página no PDF

## Problema
O algoritmo `sliceIntoPdf` corta o canvas em fatias iguais baseado na altura A4 em pixels, ignorando completamente os `<div class="page-break">` do HTML. Resultado: a capa mistura com o índice, seções começam no meio da página, conteúdo cortado.

## Solução
Modificar o fluxo de PDF para respeitar os page-breaks do HTML. Em vez de renderizar todo o HTML em um único canvas gigante e fatiar cegamente, vamos:

1. **Dividir o HTML em blocos por page-break** antes de renderizar
2. **Renderizar cada bloco separadamente** com html2canvas
3. **Cada bloco = uma página A4** no PDF

### Arquivo: `src/lib/docx-report-generator.ts`

#### Mudança 1: Nova função `splitHtmlByPageBreaks`
- Antes de injetar o HTML no container, dividir o HTML string nos pontos de `<div class="page-break"></div>`
- Cada fragmento vira um bloco separado

#### Mudança 2: Reescrever `createOnScreenContainer` 
- Em vez de colocar todo o HTML em um único `.pdf-root`, criar um container com múltiplos `.pdf-page` divs
- Cada `.pdf-page` tem largura fixa de 794px e é limitado em altura para caber em uma página A4

#### Mudança 3: Reescrever a função `generateAndDownloadPdf`
- Iterar sobre cada `.pdf-page` no container
- Capturar cada um com html2canvas individualmente
- Adicionar cada captura como uma página no jsPDF
- Isso garante: capa = página 1, índice = página 2, etc.

#### Mudança 4: Remover `sliceIntoPdf` (não mais necessária)
- A função de fatiamento cega é substituída pela captura por seção

### Resultado esperado
- Página 1: apenas a capa (com gradiente azul)
- Página 2: apenas o índice
- Página 3+: cada seção começa em sua própria página
- Zoom correto mantido (794px, scale 1)
- Gradiente da capa preservado

