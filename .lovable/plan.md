

# Atualização do Plano: Limiar de Página Vazia = 40%

## Mudança
No plano aprovado, o limiar para considerar uma página "com problema de espaço vazio" era **70%**. O novo limiar será **40%**.

## Impacto no `pdf-qa-analyzer.ts` (novo arquivo)
- `analyzePageCanvas()`: uma página com **≥40% de área branca** será marcada como problema
- `suggestFix()`: retornará `"merge_with_previous"` quando `emptyRatio >= 0.40` (antes era 0.70)
- O `overallScore` será mais rigoroso — páginas com 40-60% de vazio receberão penalização proporcional

## Impacto no overlay visual
- Páginas com ≥40% vazio mostrarão badge ⚠ (amarelo) e serão candidatas a consolidação automática
- O score final será naturalmente mais baixo até que as páginas estejam bem preenchidas

## Restante do plano
Todas as outras partes do plano aprovado permanecem iguais — apenas o limiar muda de 70% para 40%.

