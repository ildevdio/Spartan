

# Plano: Reformulação Completa da Geração de PDF

## Diagnóstico do Problema

A causa raiz do PDF em branco é confirmada: o container de renderização é posicionado em `left: -10000px` (fora da tela). A biblioteca `html2canvas` **não consegue capturar elementos off-screen** — isso é um bug/limitação documentado (github issue #117). Todas as tentativas anteriores falharam porque nunca corrigiram esse posicionamento.

## Solução: Duas camadas de garantia

### Camada 1 —