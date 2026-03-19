

# Correção do Zoom e Gradiente da Capa do PDF

## Problemas identificados

1. **Zoom excessivo**: O `PDF_RENDER_WIDTH_PX = 900` combinado com `scale: 1.5` do html2canvas cria um canvas de 1350px de largura que é comprimido em 210mm (A4), resultando em conteúdo "ampliado". A solução é usar uma largura de renderização mais próxima da relação real A4 e ajustar o scale para 1.
2. **Gradiente da capa quebrado**: O `html2canvas` frequentemente falha ao renderizar `linear-gradient` em CSS. A capa `.rpt-cover` usa `background: linear-gradient(135deg, #0A1F44 0%, #1565C0 50%, #00838F 100%)` que o html2canvas pode não capturar. A solução é adicionar um fallback de `background-color` sólido e forçar o gradiente com `!important` no container de PDF.

## Correções no arquivo `src/lib/docx-report-generator.ts`

### 1. Ajustar dimensões de renderização
- Mudar `PDF_RENDER_WIDTH_PX` de `900` para **`794`** (que é exatamente a largura em pixels de uma página A4 a 96 DPI — padrão web)
- Reduzir `scale` do html2canvas de `1.5` para **`1`** na primeira tentativa e de `2` para `1.5` na segunda
- Isso faz com que o conteúdo seja renderizado em tamanho 1:1 com o A4, eliminando o zoom

### 2. Corrigir o gradiente da capa
- No CSS injetado no container de PDF, adicionar override explícito para `.rpt-cover` forçando o `background` com `!important` e adicionando `background-color: #0A1F44` como fallback sólido
- Isso garante que o html2canvas renderize pelo menos a cor base, e idealmente o gradiente completo

### 3. Ajustar padding do container
- Reduzir padding de `30px 40px` para `20px 30px` para aproveitar melhor a largura de 794px

## Resultado esperado
- PDF com zoom proporcional ao preview em tela (sem ampliação nem redução excessiva)
- Capa com gradiente azul visível (navy → azul → teal)
- Número de páginas proporcional ao conteúdo real

