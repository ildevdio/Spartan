

# Correção do Zoom e Páginas Excessivas no PDF

## Problema
O PDF está com zoom exagerado e muitas páginas porque:
1. **Container muito estreito**: largura de 794px com 100px de padding horizontal → apenas 694px para conteúdo, espremendo tabelas e gerando altura enorme
2. **Scale muito alto**: `html2canvas` com `scale: 2` dobra as dimensões do canvas, ampliando tudo
3. **Font-size e espaçamentos** do container de renderização são grandes demais para o formato A4

## Correções

### Arquivo: `src/lib/docx-report-generator.ts`

1. **Aumentar largura de renderização** de 794px para ~1100px — simula uma página mais larga antes de comprimir no A4, resultando em conteúdo menor e mais proporcional
2. **Reduzir padding** de `40px 50px` para `20px 28px`
3. **Reduzir scale** do html2canvas de `2` para `1.5` (primeira tentativa) e de `3` para `2` (segunda tentativa)
4. **Reduzir font-sizes** no CSS do container: h1 de 22→18px, h2 de 18→15px, p/td de 13→11px, line-height de 1.6→1.4
5. **Reduzir espaçamentos** das tabelas: margin de 8→4px, padding das células de `6px 8px` → `4px 6px`

Estas mudanças fazem o conteúdo caber em menos páginas com proporções visuais corretas para A4, sem alterar a aparência do preview em tela.

