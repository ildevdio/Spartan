
Objetivo: eliminar cortes nos módulos/seções 4, 5, 6, 7+ e garantir que nenhuma informação seja perdida nas páginas seguintes.

Diagnóstico (com base no código atual):
1) O motor já separa por `<div class="page-break">`, mas o HTML do AET ainda tem blocos muito longos sem quebra explícita (ex.: seções 1–7 no mesmo bloco e blocos extensos de tabelas/REBA).
2) Quando um bloco fica alto, `capturePageElement` fatia por pixel (`pageHeightPx`), o que pode cortar conteúdo no meio de tabela/linha/título.
3) Em alguns trechos, o template junta múltiplos itens sem break (ex.: listas de seções/sheets), gerando canvases gigantes e aumentando chance de corte.

Plano de correção:
1) Paginação semântica antes da captura (no `docx-report-generator.ts`)
- Trocar a divisão “só por page-break” por uma divisão híbrida:
  - respeitar `page-break` existente
  - iniciar nova página também em `.rpt-section` (seções principais)
  - permitir `.rpt-section2/.rpt-section3` permanecerem com seu bloco, exceto quando exceder limite
- Resultado: módulos 4, 5, 6, 7 passam a iniciar em páginas dedicadas e não “colados” em um bloco longo.

2) Anti-corte por conteúdo (substituir slicing cego em blocos altos)
- Em vez de apenas fatiar canvas por altura fixa:
  - paginar o DOM por altura útil A4 (medindo elementos filhos)
  - mover elementos inteiros para a próxima página quando não couberem
  - tratar tabela como unidade “não quebrável” por padrão
  - para tabela muito alta: quebrar por linhas (`tr`) mantendo cabeçalho repetido na nova página
- Fallback somente se necessário: slicing por canvas como última opção.

3) Ajustes no template AET para reforçar quebras
- Inserir break explícito entre itens que hoje ficam contínuos e geram páginas enormes (principalmente blocos repetidos como fichas/sheets/tabelas extensas).
- Garantir que capa e índice continuem páginas isoladas (já está quase certo), e que as seções seguintes tenham início limpo.

4) CSS de render para evitar clipping
- Remover/reduzir pontos de clipping no container de PDF (ex.: `overflow: hidden` em páginas comuns quando prejudicar medição/render).
- Manter cover/index full-page e gradiente azul da capa preservado.

5) Validação forte (na `/test-pdf`)
- Testar AET completo com foco em módulos 4–7+.
- Verificar:
  - nenhum texto/linha de tabela cortado
  - início de seção em página correta
  - continuidade correta quando uma seção precisa de 2+ páginas
  - capa = página 1, índice = página 2, gradiente íntegro
- Adicionar logs de diagnóstico por página (altura medida, elementos movidos, quebras aplicadas) para fechar o problema definitivamente.
