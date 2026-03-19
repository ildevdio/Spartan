import type { Sector, Workstation, Analysis, RiskAssessment, ActionPlan, Report, RiskLevel, Company, PosturePhoto, Task, PsychosocialAnalysis, PostureAnalysis } from "./types";
import { calculateRiskScore, classifyRisk } from "./types";

export const mockCompanies: Company[] = [
  { id: "comp1", name: "Yello Sucos & Lanches", trade_name: "YELLO SUCOS & LANCHES", cnpj: "31.643.918/0001-82", cnae_principal: "56.11-2-03", cnae_secundario: "56.11-2-01", activity_risk: "02", address: "Rua das Flores, 150", neighborhood: "Meireles", city: "Fortaleza", state: "CE", cep: "60165-120", description: "Empresa do ramo alimentício especializada em sucos naturais e lanches", created_at: "2025-01-01" },
  { id: "comp2", name: "MedTraum Saúde Ocupacional", trade_name: "MEDTRAUM", cnpj: "98.765.432/0001-10", cnae_principal: "86.30-5-03", cnae_secundario: "", activity_risk: "03", address: "Av. Santos Dumont, 500", neighborhood: "Centro", city: "Fortaleza", state: "CE", cep: "60150-160", description: "Clínica de saúde ocupacional e medicina do trabalho", created_at: "2025-01-10" },
  { id: "comp3", name: "Empresa Teste Ltda", trade_name: "EMPRESA TESTE", cnpj: "12.345.678/0001-90", cnae_principal: "10.91-1-02", cnae_secundario: "", activity_risk: "03", address: "Rua Principal, 100", neighborhood: "Jardins", city: "São Paulo", state: "SP", cep: "01310-100", description: "Empresa de teste para validação de relatórios AET completos com múltiplos setores e postos de trabalho", created_at: "2025-02-01" },
  { id: "comp4", name: "Grupo Industrial Nordeste S.A.", trade_name: "GIN INDUSTRIAL", cnpj: "45.678.901/0001-23", cnae_principal: "25.99-3-99", cnae_secundario: "28.13-5-00", activity_risk: "03", address: "Rod. CE-040, Km 22, Distrito Industrial", neighborhood: "Precabura", city: "Eusébio", state: "CE", cep: "61760-000", description: "Grupo industrial diversificado com operações de metalurgia, química, TI, manutenção, transporte e serviços administrativos", created_at: "2025-01-05" },
  { id: "comp5", name: "Distribuidora Constrular Materiais de Construção Ltda.", trade_name: "CONSTRULAR DISTRIBUIÇÃO", cnpj: "67.890.123/0001-45", cnae_principal: "47.44-0-99", cnae_secundario: "46.79-6-02", activity_risk: "02", address: "Av. Augusto dos Anjos, 1500, Galpão A", neighborhood: "Parangaba", city: "Fortaleza", state: "CE", cep: "60740-000", description: "Distribuidora de materiais de construção com operações de venda, estoque, entrega e administração. Atende varejo e atacado.", created_at: "2025-01-08" },
];

export const mockSectors: Sector[] = [
  { id: "s1", company_id: "comp1", name: "Cozinha", description: "Área de preparo de alimentos e sucos", created_at: "2025-01-15" },
  { id: "s2", company_id: "comp1", name: "Atendimento", description: "Balcão de atendimento ao público", created_at: "2025-01-15" },
  { id: "s3", company_id: "comp1", name: "Limpeza", description: "Higienização e conservação do ambiente", created_at: "2025-02-01" },
  { id: "s4", company_id: "comp2", name: "Administração", description: "Escritório administrativo", created_at: "2025-02-10" },
  { id: "s5", company_id: "comp2", name: "Área Técnica", description: "Atendimentos clínicos e exames", created_at: "2025-02-10" },
  // Empresa Teste Ltda - 3 setores
  { id: "s6", company_id: "comp3", name: "Administrativo", description: "Setor administrativo com atividades de escritório, gestão financeira e atendimento telefônico", created_at: "2025-02-05" },
  { id: "s7", company_id: "comp3", name: "Produção", description: "Setor de produção industrial com manuseio de máquinas, montagem e embalagem de produtos", created_at: "2025-02-05" },
  { id: "s8", company_id: "comp3", name: "Logística", description: "Setor de logística responsável por recebimento, armazenagem, separação e expedição de materiais", created_at: "2025-02-05" },
  // GIN Industrial - 8 setores diversificados
  { id: "s10", company_id: "comp4", name: "Usinagem e Metalurgia", description: "Fabricação de peças metálicas por usinagem CNC, torneamento, fresamento e retífica. Ambiente com ruído elevado, partículas metálicas e fluidos de corte.", created_at: "2025-01-10" },
  { id: "s11", company_id: "comp4", name: "Soldagem e Caldeiraria", description: "Soldagem MIG/TIG/Eletrodo, corte plasma, conformação e montagem de estruturas metálicas. Exposição a fumos metálicos e radiação UV.", created_at: "2025-01-10" },
  { id: "s12", company_id: "comp4", name: "Laboratório Químico", description: "Análises de controle de qualidade de matérias-primas e produtos acabados. Manipulação de reagentes ácidos, básicos e solventes orgânicos.", created_at: "2025-01-12" },
  { id: "s13", company_id: "comp4", name: "Tecnologia da Informação", description: "Desenvolvimento de software, suporte técnico, infraestrutura de rede e segurança da informação. Trabalho predominantemente sentado com uso intensivo de computador.", created_at: "2025-01-12" },
  { id: "s14", company_id: "comp4", name: "Manutenção Industrial", description: "Manutenção preventiva e corretiva de máquinas, sistemas elétricos, pneumáticos e hidráulicos. Trabalho em altura e espaços confinados.", created_at: "2025-01-15" },
  { id: "s15", company_id: "comp4", name: "Transporte e Frota", description: "Operação de veículos pesados, empilhadeiras e plataformas elevatórias. Carga e descarga de materiais. Gestão de frota.", created_at: "2025-01-15" },
  { id: "s16", company_id: "comp4", name: "Recursos Humanos e Jurídico", description: "Gestão de pessoas, folha de pagamento, recrutamento, contencioso trabalhista e compliance regulatório.", created_at: "2025-01-18" },
  { id: "s17", company_id: "comp4", name: "Saúde e Segurança do Trabalho", description: "SESMT com ambulatório, controle de EPIs, investigação de acidentes, programas de prevenção e treinamentos normativos.", created_at: "2025-01-18" },
  // Constrular Distribuição - 4 setores
  { id: "s20", company_id: "comp5", name: "Administrativo", description: "Escritório administrativo com contabilidade, faturamento, compras e atendimento ao cliente corporativo", created_at: "2025-01-10" },
  { id: "s21", company_id: "comp5", name: "Comercial", description: "Loja de materiais de construção com showroom, balcão de vendas e área de autoatendimento", created_at: "2025-01-10" },
  { id: "s22", company_id: "comp5", name: "Engenharia", description: "Setor de projetos, orçamentos técnicos e assistência técnica para clientes construtoras", created_at: "2025-01-12" },
  { id: "s23", company_id: "comp5", name: "Expedição", description: "Galpão de estocagem com 2.500m², recebimento de mercadorias, separação de pedidos e despacho para entrega", created_at: "2025-01-12" },
];

export const mockWorkstations: Workstation[] = [
  { id: "w1", sector_id: "s1", name: "Operador de Chapa", description: "Chapa industrial para preparo de lanches", activity_description: "Preparo de lanches quentes na chapa industrial", tasks_performed: "Montar lanches, operar chapa, higienizar equipamentos", created_at: "2025-01-20" },
  { id: "w2", sector_id: "s1", name: "Preparador de Sucos", description: "Bancada de sucos e vitaminas", activity_description: "Preparo de sucos naturais e vitaminas", tasks_performed: "Cortar frutas, operar liquidificador, servir bebidas", created_at: "2025-01-20" },
  { id: "w3", sector_id: "s2", name: "Atendente de Caixa", description: "Caixa registradora e atendimento", activity_description: "Atendimento ao cliente e operação do caixa", tasks_performed: "Registrar pedidos, receber pagamentos, atender clientes", created_at: "2025-02-01" },
  { id: "w4", sector_id: "s3", name: "Auxiliar de Limpeza", description: "Limpeza geral do estabelecimento", activity_description: "Higienização e conservação do ambiente", tasks_performed: "Varrer, lavar, higienizar equipamentos e banheiros", created_at: "2025-02-05" },
  { id: "w5", sector_id: "s4", name: "Assistente Administrativo", description: "Escritório com estação de trabalho informatizada", activity_description: "Atividades administrativas em escritório", tasks_performed: "Digitação, atendimento telefônico, arquivo de documentos", created_at: "2025-02-10" },
  // Empresa Teste - Administrativo (s6)
  { id: "w6", sector_id: "s6", name: "Recepção", description: "Balcão de recepção com terminal de atendimento", activity_description: "Atendimento ao público, controle de acesso e triagem de visitantes", tasks_performed: "Atender telefone, receber visitantes, registrar entrada e saída, encaminhar correspondências", created_at: "2025-02-10" },
  { id: "w7", sector_id: "s6", name: "Escritório Financeiro", description: "Sala com 3 estações de trabalho informatizadas", activity_description: "Gestão financeira com uso intensivo de computador e documentos físicos", tasks_performed: "Lançamentos contábeis, emissão de notas fiscais, controle de fluxo de caixa, conciliação bancária", created_at: "2025-02-10" },
  // Empresa Teste - Produção (s7)
  { id: "w8", sector_id: "s7", name: "Operador de Máquina CNC", description: "Célula de usinagem com torno CNC e fresadora", activity_description: "Operação de máquinas CNC para usinagem de peças metálicas de precisão", tasks_performed: "Programar CNC, fixar peças no mandril, monitorar usinagem, medir peças com paquímetro, trocar ferramentas", created_at: "2025-02-12" },
  { id: "w9", sector_id: "s7", name: "Montagem e Embalagem", description: "Linha de montagem manual com bancada ergonômica", activity_description: "Montagem de subconjuntos e embalagem de produtos acabados", tasks_performed: "Montar componentes com ferramentas manuais, inspecionar visualmente, embalar em caixas, etiquetar produtos", created_at: "2025-02-12" },
  // Empresa Teste - Logística (s8)
  { id: "w10", sector_id: "s8", name: "Operador de Empilhadeira", description: "Galpão de armazenagem com estantes de 6 metros", activity_description: "Movimentação de cargas com empilhadeira elétrica em galpão de estocagem", tasks_performed: "Operar empilhadeira, carregar e descarregar caminhões, organizar paletes nas estantes, conferir cargas", created_at: "2025-02-15" },
  { id: "w11", sector_id: "s8", name: "Separador de Pedidos", description: "Área de picking com esteiras e prateleiras", activity_description: "Separação e conferência de pedidos para expedição", tasks_performed: "Coletar itens nas prateleiras, conferir com romaneio, montar kits, despachar pedidos na esteira", created_at: "2025-02-15" },
  // GIN Industrial - Usinagem e Metalurgia (s10)
  { id: "w12", sector_id: "s10", name: "Torneiro Mecânico CNC", description: "Centro de torneamento CNC Romi GL-240 com alimentador de barras", activity_description: "Usinagem de peças cilíndricas em aço e alumínio com tolerância de ±0,02mm", tasks_performed: "Programar G-code, fixar material, monitorar ciclo, medir com micrômetro, trocar pastilhas de metal duro", created_at: "2025-01-20" },
  { id: "w13", sector_id: "s10", name: "Fresador CNC", description: "Centro de usinagem vertical Haas VF-2 com 4º eixo", activity_description: "Fresamento de peças prismáticas e moldes de injeção", tasks_performed: "Carregar programas CAM, fixar peças no morsa, calibrar ferramentas, operar centro de usinagem, rebarbação manual", created_at: "2025-01-20" },
  { id: "w14", sector_id: "s10", name: "Retificador", description: "Retífica plana e cilíndrica com refrigeração por fluido sintético", activity_description: "Acabamento superficial de peças usinadas com alta precisão dimensional", tasks_performed: "Dreçar rebolo, fixar peça no plano magnético, ajustar avanços, medir rugosidade, controlar temperatura", created_at: "2025-01-22" },
  // Soldagem e Caldeiraria (s11)
  { id: "w15", sector_id: "s11", name: "Soldador MIG/MAG", description: "Box de soldagem com sistema de exaustão localizada e cortina de proteção", activity_description: "Soldagem de juntas em aço carbono e inox usando processo MIG/MAG com gás de proteção", tasks_performed: "Preparar juntas, posicionar peças no gabarito, regular parâmetros da máquina, soldar em diversas posições, esmerilhar cordão", created_at: "2025-01-20" },
  { id: "w16", sector_id: "s11", name: "Caldeireiro", description: "Bancada de traçagem e dobradeira hidráulica CNC", activity_description: "Conformação de chapas, montagem de estruturas metálicas e vasos de pressão", tasks_performed: "Interpretar desenho técnico, traçar chapas, operar guilhotina e dobradeira, montar estruturas com maçarico, lixar e preparar superfícies", created_at: "2025-01-22" },
  // Laboratório Químico (s12)
  { id: "w17", sector_id: "s12", name: "Analista Químico", description: "Bancada de análises com capela de exaustão e equipamentos analíticos (espectrofotômetro, pHmetro, titulador automático)", activity_description: "Análises físico-químicas de matérias-primas e produtos acabados conforme normas ABNT", tasks_performed: "Coletar amostras, preparar soluções, realizar titulações, operar espectrofotômetro UV-Vis, registrar resultados no LIMS", created_at: "2025-01-25" },
  { id: "w18", sector_id: "s12", name: "Técnico em Cromatografia", description: "Sala climatizada com HPLC e cromatógrafo gasoso", activity_description: "Análises cromatográficas de pureza e composição de produtos químicos", tasks_performed: "Preparar amostras e padrões, injetar no HPLC/GC, interpretar cromatogramas, manutenção de colunas, calibrar equipamentos", created_at: "2025-01-25" },
  // Tecnologia da Informação (s13)
  { id: "w19", sector_id: "s13", name: "Desenvolvedor de Software", description: "Estação de trabalho com 2 monitores 27\", mesa com regulagem de altura e cadeira ergonômica", activity_description: "Desenvolvimento de sistemas ERP interno e aplicações industriais em React/Node.js", tasks_performed: "Codificar, revisar pull requests, participar de daily meetings, debugar sistemas, documentar APIs", created_at: "2025-01-20" },
  { id: "w20", sector_id: "s13", name: "Analista de Infraestrutura", description: "Data center com racks de servidores, nobreaks e sistema de refrigeração", activity_description: "Administração de servidores, redes e segurança da informação da planta industrial", tasks_performed: "Monitorar servidores, instalar patches, gerenciar firewalls, cabear racks, atender chamados de suporte N2/N3", created_at: "2025-01-22" },
  // Manutenção Industrial (s14)
  { id: "w21", sector_id: "s14", name: "Eletricista Industrial", description: "Painéis elétricos de média e baixa tensão, CCMs e subestação 13.8kV", activity_description: "Manutenção preventiva e corretiva de sistemas elétricos industriais até 13.8kV", tasks_performed: "Inspecionar painéis, termografar conexões, trocar contatores, programar CLPs, testar disjuntores, trabalho em altura em leitos de cabos", created_at: "2025-01-25" },
  { id: "w22", sector_id: "s14", name: "Mecânico de Manutenção", description: "Oficina mecânica com torno convencional, furadeira de bancada e ferramental completo", activity_description: "Manutenção mecânica de equipamentos de produção, sistemas hidráulicos e pneumáticos", tasks_performed: "Desmontar e remontar componentes, substituir rolamentos, alinhar acoplamentos, lubrificar máquinas, fabricar peças de reposição", created_at: "2025-01-25" },
  // Transporte e Frota (s15)
  { id: "w23", sector_id: "s15", name: "Motorista de Carreta", description: "Carreta baú e plataforma, percurso rodoviário CE-SP-RJ", activity_description: "Transporte rodoviário de produtos acabados e matérias-primas em rotas de longa distância", tasks_performed: "Conduzir veículo articulado, amarrar carga, preencher CT-e, inspecionar veículo (checklist diário), pernoitar em pontos de apoio", created_at: "2025-01-28" },
  { id: "w24", sector_id: "s15", name: "Operador de Ponte Rolante", description: "Ponte rolante de 10 toneladas no galpão de estocagem de chapas", activity_description: "Movimentação de chapas e perfis metálicos pesados com ponte rolante e acessórios de içamento", tasks_performed: "Operar ponte rolante via controle remoto, inspecionar cabos e ganchos, sinalizar movimentação, posicionar cargas em cavaletes", created_at: "2025-01-28" },
  // Recursos Humanos e Jurídico (s16)
  { id: "w25", sector_id: "s16", name: "Analista de RH", description: "Escritório compartilhado com 4 estações, impressora multifuncional e arquivo físico", activity_description: "Gestão de pessoas, recrutamento, folha de pagamento e benefícios para 350 colaboradores", tasks_performed: "Processar folha no eSocial, conduzir entrevistas, administrar benefícios, elaborar relatórios gerenciais, atender colaboradores", created_at: "2025-01-20" },
  { id: "w26", sector_id: "s16", name: "Advogado Trabalhista", description: "Sala individual com estação de trabalho e estante de livros jurídicos", activity_description: "Assessoria jurídica trabalhista, defesa em reclamações e compliance com NRs", tasks_performed: "Elaborar defesas trabalhistas, acompanhar audiências, revisar contratos, orientar gestores sobre legislação, emitir pareceres", created_at: "2025-01-22" },
  // Saúde e Segurança do Trabalho (s17)
  { id: "w27", sector_id: "s17", name: "Técnico de Segurança do Trabalho", description: "Sala do SESMT com equipamentos de medição (dosímetro, decibelímetro, bomba de amostragem)", activity_description: "Implementação e fiscalização de programas de SST conforme NRs", tasks_performed: "Inspecionar áreas, investigar incidentes, ministrar DDS, controlar entrega de EPIs, elaborar PGR/PCMSO, medir ruído e calor", created_at: "2025-01-25" },
  { id: "w28", sector_id: "s17", name: "Enfermeiro do Trabalho", description: "Ambulatório médico com maca, desfibrilador, oxímetro e medicamentos de emergência", activity_description: "Atendimento de primeiros socorros, acompanhamento de saúde ocupacional e campanhas preventivas", tasks_performed: "Atender emergências, realizar curativos, acompanhar exames periódicos, vacinar colaboradores, controlar prontuários no SOC", created_at: "2025-01-25" },
  // Constrular Distribuição - 7 postos
  { id: "w30", sector_id: "s20", name: "Auxiliar Contábil", description: "Estação de trabalho com monitor 24\", impressora e arquivo de documentos fiscais", activity_description: "Lançamentos contábeis, conciliação bancária e emissão de notas fiscais de entrada/saída", tasks_performed: "Lançar NFs no ERP, conciliar extratos bancários, classificar despesas, arquivar documentos, atender auditorias", created_at: "2025-01-15" },
  { id: "w31", sector_id: "s21", name: "Assistente Comercial", description: "Balcão de vendas com terminal PDV, catálogos e amostras de produtos", activity_description: "Atendimento ao cliente no balcão, elaboração de orçamentos e processamento de pedidos", tasks_performed: "Atender clientes presencialmente, elaborar orçamentos, consultar estoque no sistema, processar vendas no PDV, organizar showroom", created_at: "2025-01-15" },
  { id: "w32", sector_id: "s21", name: "Vendedor Externo", description: "Veículo utilitário com tablet e catálogo digital para visitas a construtoras", activity_description: "Visitas técnicas a construtoras e lojas de varejo para prospecção e fechamento de vendas", tasks_performed: "Visitar clientes, apresentar portfólio, negociar preços e prazos, inserir pedidos no tablet, acompanhar entregas", created_at: "2025-01-18" },
  { id: "w33", sector_id: "s22", name: "Engenheiro de Projetos", description: "Sala técnica com estação de trabalho CAD, plotter e mesa de desenho", activity_description: "Elaboração de projetos técnicos e orçamentos para obras de construção civil", tasks_performed: "Projetar em AutoCAD/Revit, quantificar materiais, elaborar orçamentos técnicos, visitar obras, emitir laudos", created_at: "2025-01-18" },
  { id: "w34", sector_id: "s22", name: "Técnico em Edificações", description: "Escritório compartilhado com equipamentos de medição (trena laser, nível)", activity_description: "Suporte técnico em medições, acompanhamento de obras e assistência pós-venda", tasks_performed: "Realizar medições em obra, conferir especificações, orientar aplicação de materiais, elaborar relatórios técnicos, fotografar etapas", created_at: "2025-01-20" },
  { id: "w35", sector_id: "s23", name: "Estoquista", description: "Galpão com estantes de 5m, empilhadeira manual e sistema WMS", activity_description: "Recebimento, conferência, armazenagem e controle de estoque de materiais de construção", tasks_performed: "Receber mercadorias, conferir NFs, armazenar em prateleiras com empilhadeira manual, inventariar estoque, separar devoluções", created_at: "2025-01-20" },
  { id: "w36", sector_id: "s23", name: "Motorista de Entrega", description: "Caminhão 3/4 com plataforma elevatória e carreta de mão", activity_description: "Entrega de materiais de construção em obras e residências na região metropolitana", tasks_performed: "Carregar veículo, roteirizar entregas, conduzir caminhão, descarregar materiais com carreta de mão, coletar assinatura de recebimento", created_at: "2025-01-22" },
];

export const mockTasks: Task[] = [
  { id: "t1", workstation_id: "w1", description: "Montar lanches na chapa quente", created_at: "2025-01-20" },
  { id: "t2", workstation_id: "w1", description: "Higienizar a chapa e utensílios", created_at: "2025-01-20" },
  { id: "t3", workstation_id: "w2", description: "Cortar frutas e preparar ingredientes", created_at: "2025-01-20" },
  { id: "t4", workstation_id: "w2", description: "Operar liquidificador industrial", created_at: "2025-01-20" },
  { id: "t5", workstation_id: "w3", description: "Registrar pedidos no sistema PDV", created_at: "2025-02-01" },
  { id: "t6", workstation_id: "w3", description: "Receber pagamentos em dinheiro e cartão", created_at: "2025-02-01" },
  { id: "t7", workstation_id: "w4", description: "Varrer e lavar pisos", created_at: "2025-02-05" },
  { id: "t8", workstation_id: "w4", description: "Higienizar banheiros e áreas comuns", created_at: "2025-02-05" },
  { id: "t9", workstation_id: "w5", description: "Digitação e elaboração de relatórios", created_at: "2025-02-10" },
  { id: "t10", workstation_id: "w5", description: "Atendimento telefônico e presencial", created_at: "2025-02-10" },
  // Empresa Teste
  { id: "t11", workstation_id: "w6", description: "Atender e direcionar chamadas telefônicas", created_at: "2025-02-10" },
  { id: "t12", workstation_id: "w6", description: "Registrar entrada e saída de visitantes", created_at: "2025-02-10" },
  { id: "t13", workstation_id: "w7", description: "Lançamentos contábeis no ERP", created_at: "2025-02-10" },
  { id: "t14", workstation_id: "w7", description: "Conciliação bancária e emissão de NFs", created_at: "2025-02-10" },
  { id: "t15", workstation_id: "w8", description: "Programar e operar torno CNC", created_at: "2025-02-12" },
  { id: "t16", workstation_id: "w8", description: "Medir peças com instrumentos de precisão", created_at: "2025-02-12" },
  { id: "t17", workstation_id: "w9", description: "Montar subconjuntos com ferramentas manuais", created_at: "2025-02-12" },
  { id: "t18", workstation_id: "w9", description: "Embalar e etiquetar produtos acabados", created_at: "2025-02-12" },
  { id: "t19", workstation_id: "w10", description: "Operar empilhadeira para carga e descarga", created_at: "2025-02-15" },
  { id: "t20", workstation_id: "w10", description: "Organizar paletes nas estantes do galpão", created_at: "2025-02-15" },
  { id: "t21", workstation_id: "w11", description: "Coletar itens nas prateleiras conforme pedido", created_at: "2025-02-15" },
  { id: "t22", workstation_id: "w11", description: "Conferir e despachar pedidos na esteira", created_at: "2025-02-15" },
  // GIN Industrial
  { id: "t23", workstation_id: "w12", description: "Programar torno CNC via G-code", created_at: "2025-01-20" },
  { id: "t24", workstation_id: "w12", description: "Medir peças com micrômetro digital", created_at: "2025-01-20" },
  { id: "t25", workstation_id: "w13", description: "Carregar programas CAM e calibrar ferramentas", created_at: "2025-01-20" },
  { id: "t26", workstation_id: "w13", description: "Operar centro de usinagem e rebarbação", created_at: "2025-01-20" },
  { id: "t27", workstation_id: "w14", description: "Dreçar rebolo e fixar peça no plano magnético", created_at: "2025-01-22" },
  { id: "t28", workstation_id: "w14", description: "Controlar rugosidade superficial", created_at: "2025-01-22" },
  { id: "t29", workstation_id: "w15", description: "Preparar juntas e regular parâmetros MIG", created_at: "2025-01-20" },
  { id: "t30", workstation_id: "w15", description: "Soldar em posições variadas e esmerilhar cordão", created_at: "2025-01-20" },
  { id: "t31", workstation_id: "w16", description: "Operar guilhotina e dobradeira CNC", created_at: "2025-01-22" },
  { id: "t32", workstation_id: "w16", description: "Montar estruturas metálicas com maçarico", created_at: "2025-01-22" },
  { id: "t33", workstation_id: "w17", description: "Preparar soluções e realizar titulações", created_at: "2025-01-25" },
  { id: "t34", workstation_id: "w17", description: "Operar espectrofotômetro UV-Vis", created_at: "2025-01-25" },
  { id: "t35", workstation_id: "w18", description: "Preparar amostras para HPLC/GC", created_at: "2025-01-25" },
  { id: "t36", workstation_id: "w18", description: "Interpretar cromatogramas e calibrar equipamentos", created_at: "2025-01-25" },
  { id: "t37", workstation_id: "w19", description: "Codificar em React/Node.js e revisar PRs", created_at: "2025-01-20" },
  { id: "t38", workstation_id: "w19", description: "Debugar sistemas e documentar APIs", created_at: "2025-01-20" },
  { id: "t39", workstation_id: "w20", description: "Monitorar servidores e gerenciar firewalls", created_at: "2025-01-22" },
  { id: "t40", workstation_id: "w20", description: "Cabear racks e atender chamados N2/N3", created_at: "2025-01-22" },
  { id: "t41", workstation_id: "w21", description: "Inspecionar painéis e termografar conexões", created_at: "2025-01-25" },
  { id: "t42", workstation_id: "w21", description: "Programar CLPs e testar disjuntores", created_at: "2025-01-25" },
  { id: "t43", workstation_id: "w22", description: "Desmontar componentes e substituir rolamentos", created_at: "2025-01-25" },
  { id: "t44", workstation_id: "w22", description: "Alinhar acoplamentos e lubrificar máquinas", created_at: "2025-01-25" },
  { id: "t45", workstation_id: "w23", description: "Conduzir carreta e amarrar carga", created_at: "2025-01-28" },
  { id: "t46", workstation_id: "w23", description: "Preencher CT-e e inspecionar veículo", created_at: "2025-01-28" },
  { id: "t47", workstation_id: "w24", description: "Operar ponte rolante via controle remoto", created_at: "2025-01-28" },
  { id: "t48", workstation_id: "w24", description: "Sinalizar movimentação e posicionar cargas", created_at: "2025-01-28" },
  { id: "t49", workstation_id: "w25", description: "Processar folha no eSocial", created_at: "2025-01-20" },
  { id: "t50", workstation_id: "w25", description: "Conduzir entrevistas e administrar benefícios", created_at: "2025-01-20" },
  { id: "t51", workstation_id: "w26", description: "Elaborar defesas trabalhistas", created_at: "2025-01-22" },
  { id: "t52", workstation_id: "w26", description: "Revisar contratos e emitir pareceres", created_at: "2025-01-22" },
  { id: "t53", workstation_id: "w27", description: "Inspecionar áreas e investigar incidentes", created_at: "2025-01-25" },
  { id: "t54", workstation_id: "w27", description: "Ministrar DDS e controlar EPIs", created_at: "2025-01-25" },
  { id: "t55", workstation_id: "w28", description: "Atender emergências e realizar curativos", created_at: "2025-01-25" },
  { id: "t56", workstation_id: "w28", description: "Acompanhar exames periódicos e vacinar", created_at: "2025-01-25" },
  // Constrular
  { id: "t57", workstation_id: "w30", description: "Lançar NFs e conciliar extratos bancários", created_at: "2025-01-15" },
  { id: "t58", workstation_id: "w30", description: "Classificar despesas e arquivar documentos", created_at: "2025-01-15" },
  { id: "t59", workstation_id: "w31", description: "Atender clientes e elaborar orçamentos", created_at: "2025-01-15" },
  { id: "t60", workstation_id: "w31", description: "Processar vendas no PDV e organizar showroom", created_at: "2025-01-15" },
  { id: "t61", workstation_id: "w32", description: "Visitar construtoras e negociar vendas", created_at: "2025-01-18" },
  { id: "t62", workstation_id: "w32", description: "Inserir pedidos no tablet e acompanhar entregas", created_at: "2025-01-18" },
  { id: "t63", workstation_id: "w33", description: "Projetar em AutoCAD e quantificar materiais", created_at: "2025-01-18" },
  { id: "t64", workstation_id: "w33", description: "Visitar obras e emitir laudos técnicos", created_at: "2025-01-18" },
  { id: "t65", workstation_id: "w34", description: "Realizar medições em obra com trena laser", created_at: "2025-01-20" },
  { id: "t66", workstation_id: "w34", description: "Elaborar relatórios técnicos e fotografar etapas", created_at: "2025-01-20" },
  { id: "t67", workstation_id: "w35", description: "Receber mercadorias e conferir NFs", created_at: "2025-01-20" },
  { id: "t68", workstation_id: "w35", description: "Armazenar com empilhadeira e inventariar estoque", created_at: "2025-01-20" },
  { id: "t69", workstation_id: "w36", description: "Carregar veículo e roteirizar entregas", created_at: "2025-01-22" },
  { id: "t70", workstation_id: "w36", description: "Descarregar materiais e coletar assinatura", created_at: "2025-01-22" },
];

export const mockPosturePhotos: PosturePhoto[] = [
  // w1 - Operador de Chapa (5 fotos)
  { id: "pp1", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Postura ao operar chapa", timestamp: "2025-03-01T10:00:00", created_at: "2025-03-01" },
  { id: "pp2", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Extensão cervical", notes: "Olhando para prateleira alta", timestamp: "2025-03-01T10:15:00", created_at: "2025-03-01" },
  { id: "pp3", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Girando para bancada lateral", timestamp: "2025-03-02T09:00:00", created_at: "2025-03-02" },
  { id: "pp4", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Elevação de braços", notes: "Alcançando ingredientes em prateleira alta", timestamp: "2025-03-02T09:30:00", created_at: "2025-03-02" },
  { id: "pp5", workstation_id: "w1", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Permanência em pé durante turno", timestamp: "2025-03-02T11:00:00", created_at: "2025-03-02" },
  // w2 - Preparador de Sucos (5 fotos)
  { id: "pp6", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Pegando frutas em caixa baixa", timestamp: "2025-03-03T08:00:00", created_at: "2025-03-03" },
  { id: "pp7", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Elevação de braços", notes: "Operando liquidificador", timestamp: "2025-03-03T08:30:00", created_at: "2025-03-03" },
  { id: "pp8", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Flexão de punho", notes: "Cortando frutas com faca", timestamp: "2025-03-03T09:00:00", created_at: "2025-03-03" },
  { id: "pp9", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Alcançando copos no balcão", timestamp: "2025-03-04T10:00:00", created_at: "2025-03-04" },
  { id: "pp10", workstation_id: "w2", image_url: "/placeholder.svg", posture_type: "Postura em pé", notes: "Em pé durante preparo", timestamp: "2025-03-04T10:30:00", created_at: "2025-03-04" },
  // w3 - Atendente de Caixa (5 fotos)
  { id: "pp11", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Postura em pé", notes: "Atendimento no caixa", timestamp: "2025-03-05T08:00:00", created_at: "2025-03-05" },
  { id: "pp12", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Olhando para tela do PDV", timestamp: "2025-03-05T09:00:00", created_at: "2025-03-05" },
  { id: "pp13", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Operando teclado numérico", timestamp: "2025-03-06T10:00:00", created_at: "2025-03-06" },
  { id: "pp14", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Olhando para cliente e tela", timestamp: "2025-03-06T11:00:00", created_at: "2025-03-06" },
  { id: "pp15", workstation_id: "w3", image_url: "/placeholder.svg", posture_type: "Inclinação de tronco", notes: "Pegando troco na gaveta", timestamp: "2025-03-07T08:00:00", created_at: "2025-03-07" },
  // w5 - Assistente Administrativo (5 fotos)
  { id: "pp16", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Postura sentada", notes: "Trabalho em computador", timestamp: "2025-03-08T08:00:00", created_at: "2025-03-08" },
  { id: "pp17", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo documentos na mesa", timestamp: "2025-03-08T09:00:00", created_at: "2025-03-08" },
  { id: "pp18", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Digitação prolongada", timestamp: "2025-03-08T10:00:00", created_at: "2025-03-08" },
  { id: "pp19", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Pegando arquivo no gaveteiro", timestamp: "2025-03-09T08:00:00", created_at: "2025-03-09" },
  { id: "pp20", workstation_id: "w5", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Atendendo telefone", timestamp: "2025-03-09T09:00:00", created_at: "2025-03-09" },
  // w6 - Recepção (5 fotos)
  { id: "pp21", workstation_id: "w6", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Atendimento contínuo na recepção em cadeira giratória", timestamp: "2025-03-10T08:00:00", created_at: "2025-03-10" },
  { id: "pp22", workstation_id: "w6", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Alternando olhar entre monitor e visitante", timestamp: "2025-03-10T09:30:00", created_at: "2025-03-10" },
  { id: "pp23", workstation_id: "w6", image_url: "/placeholder.svg", posture_type: "Extensão de braço", notes: "Entregando crachás no balcão elevado", timestamp: "2025-03-10T10:15:00", created_at: "2025-03-10" },
  { id: "pp24", workstation_id: "w6", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo agenda e anotações na mesa", timestamp: "2025-03-11T08:30:00", created_at: "2025-03-11" },
  { id: "pp25", workstation_id: "w6", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Atendendo telefone preso entre ombro e orelha", timestamp: "2025-03-11T11:00:00", created_at: "2025-03-11" },
  // w7 - Escritório Financeiro (5 fotos)
  { id: "pp26", workstation_id: "w7", image_url: "/placeholder.svg", posture_type: "Postura sentada com flexão de tronco", notes: "Debruçado sobre documentos fiscais na mesa", timestamp: "2025-03-10T08:00:00", created_at: "2025-03-10" },
  { id: "pp27", workstation_id: "w7", image_url: "/placeholder.svg", posture_type: "Flexão cervical acentuada", notes: "Olhando para teclado durante digitação", timestamp: "2025-03-10T09:00:00", created_at: "2025-03-10" },
  { id: "pp28", workstation_id: "w7", image_url: "/placeholder.svg", posture_type: "Extensão de punho bilateral", notes: "Digitação contínua no teclado sem apoio", timestamp: "2025-03-10T10:30:00", created_at: "2025-03-10" },
  { id: "pp29", workstation_id: "w7", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Acessando gaveta do arquivo ao lado da mesa", timestamp: "2025-03-11T08:00:00", created_at: "2025-03-11" },
  { id: "pp30", workstation_id: "w7", image_url: "/placeholder.svg", posture_type: "Elevação de ombros", notes: "Mesa alta sem regulagem — ombros tensos", timestamp: "2025-03-11T14:00:00", created_at: "2025-03-11" },
  // w8 - Operador de Máquina CNC (5 fotos)
  { id: "pp31", workstation_id: "w8", image_url: "/placeholder.svg", posture_type: "Postura em pé com flexão de tronco", notes: "Fixando peça no mandril do torno CNC", timestamp: "2025-03-12T07:30:00", created_at: "2025-03-12" },
  { id: "pp32", workstation_id: "w8", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo painel de controle do CNC", timestamp: "2025-03-12T08:15:00", created_at: "2025-03-12" },
  { id: "pp33", workstation_id: "w8", image_url: "/placeholder.svg", posture_type: "Elevação de braços acima do ombro", notes: "Trocando ferramenta no magazine superior", timestamp: "2025-03-12T10:00:00", created_at: "2025-03-12" },
  { id: "pp34", workstation_id: "w8", image_url: "/placeholder.svg", posture_type: "Agachamento profundo", notes: "Pegando peça na caixa no nível do chão", timestamp: "2025-03-13T07:45:00", created_at: "2025-03-13" },
  { id: "pp35", workstation_id: "w8", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Monitorando ciclo de usinagem por 40 min", timestamp: "2025-03-13T09:00:00", created_at: "2025-03-13" },
  // w9 - Montagem e Embalagem (5 fotos)
  { id: "pp36", workstation_id: "w9", image_url: "/placeholder.svg", posture_type: "Flexão de tronco sobre bancada", notes: "Montando subconjunto na bancada de trabalho", timestamp: "2025-03-12T08:00:00", created_at: "2025-03-12" },
  { id: "pp37", workstation_id: "w9", image_url: "/placeholder.svg", posture_type: "Movimentos repetitivos de punho", notes: "Aparafusando componentes com parafusadeira", timestamp: "2025-03-12T09:30:00", created_at: "2025-03-12" },
  { id: "pp38", workstation_id: "w9", image_url: "/placeholder.svg", posture_type: "Pinça fina com dedos", notes: "Encaixando peças pequenas no conjunto", timestamp: "2025-03-12T11:00:00", created_at: "2025-03-12" },
  { id: "pp39", workstation_id: "w9", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Inspecionando visualmente peça montada", timestamp: "2025-03-13T08:00:00", created_at: "2025-03-13" },
  { id: "pp40", workstation_id: "w9", image_url: "/placeholder.svg", posture_type: "Elevação de carga", notes: "Colocando produto embalado na caixa de transporte (8 kg)", timestamp: "2025-03-13T10:00:00", created_at: "2025-03-13" },
  // w10 - Operador de Empilhadeira (5 fotos)
  { id: "pp41", workstation_id: "w10", image_url: "/placeholder.svg", posture_type: "Postura sentada com vibração", notes: "Operando empilhadeira em piso irregular do galpão", timestamp: "2025-03-14T07:00:00", created_at: "2025-03-14" },
  { id: "pp42", workstation_id: "w10", image_url: "/placeholder.svg", posture_type: "Rotação cervical extrema", notes: "Olhando para trás durante manobra de ré", timestamp: "2025-03-14T08:00:00", created_at: "2025-03-14" },
  { id: "pp43", workstation_id: "w10", image_url: "/placeholder.svg", posture_type: "Extensão cervical", notes: "Olhando para cima ao posicionar palete na estante alta (5m)", timestamp: "2025-03-14T09:30:00", created_at: "2025-03-14" },
  { id: "pp44", workstation_id: "w10", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Descendo da empilhadeira para conferir carga", timestamp: "2025-03-15T07:30:00", created_at: "2025-03-15" },
  { id: "pp45", workstation_id: "w10", image_url: "/placeholder.svg", posture_type: "Elevação de braço", notes: "Operando alavancas de controle da empilhadeira", timestamp: "2025-03-15T10:00:00", created_at: "2025-03-15" },
  // w11 - Separador de Pedidos (5 fotos)
  { id: "pp46", workstation_id: "w11", image_url: "/placeholder.svg", posture_type: "Agachamento repetitivo", notes: "Coletando itens nas prateleiras inferiores", timestamp: "2025-03-14T07:30:00", created_at: "2025-03-14" },
  { id: "pp47", workstation_id: "w11", image_url: "/placeholder.svg", posture_type: "Elevação de braço acima do ombro", notes: "Alcançando produtos nas prateleiras superiores (2m)", timestamp: "2025-03-14T08:30:00", created_at: "2025-03-14" },
  { id: "pp48", workstation_id: "w11", image_url: "/placeholder.svg", posture_type: "Carregamento manual de carga", notes: "Transportando caixa de 12 kg até a esteira", timestamp: "2025-03-14T10:00:00", created_at: "2025-03-14" },
  { id: "pp49", workstation_id: "w11", image_url: "/placeholder.svg", posture_type: "Caminhada contínua", notes: "Deslocamento entre corredores durante picking (~8 km/dia)", timestamp: "2025-03-15T08:00:00", created_at: "2025-03-15" },
  { id: "pp50", workstation_id: "w11", image_url: "/placeholder.svg", posture_type: "Flexão de tronco lateral", notes: "Lendo etiqueta na lateral da caixa", timestamp: "2025-03-15T09:30:00", created_at: "2025-03-15" },
  // GIN Industrial - w12 Torneiro CNC (5 fotos)
  { id: "pp51", workstation_id: "w12", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Monitorando ciclo do torno CNC por 45 min contínuos", timestamp: "2025-02-10T07:30:00", created_at: "2025-02-10" },
  { id: "pp52", workstation_id: "w12", image_url: "/placeholder.svg", posture_type: "Flexão de tronco anterior", notes: "Fixando peça no mandril com chave allen", timestamp: "2025-02-10T08:15:00", created_at: "2025-02-10" },
  { id: "pp53", workstation_id: "w12", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo painel digital do CNC a 30cm de distância", timestamp: "2025-02-10T09:00:00", created_at: "2025-02-10" },
  { id: "pp54", workstation_id: "w12", image_url: "/placeholder.svg", posture_type: "Elevação de braço", notes: "Trocando pastilha no porta-ferramenta superior", timestamp: "2025-02-11T07:45:00", created_at: "2025-02-11" },
  { id: "pp55", workstation_id: "w12", image_url: "/placeholder.svg", posture_type: "Agachamento", notes: "Coletando peça acabada no coletor ao nível do chão", timestamp: "2025-02-11T10:00:00", created_at: "2025-02-11" },
  // w13 Fresador CNC (5 fotos)
  { id: "pp56", workstation_id: "w13", image_url: "/placeholder.svg", posture_type: "Postura em pé com inclinação", notes: "Calibrando ferramenta no spindle do centro de usinagem", timestamp: "2025-02-10T08:00:00", created_at: "2025-02-10" },
  { id: "pp57", workstation_id: "w13", image_url: "/placeholder.svg", posture_type: "Flexão de tronco acentuada", notes: "Fixando peça no morsa hidráulico ao nível da mesa", timestamp: "2025-02-10T09:30:00", created_at: "2025-02-10" },
  { id: "pp58", workstation_id: "w13", image_url: "/placeholder.svg", posture_type: "Movimentos repetitivos de punho", notes: "Rebarbando peça fresada com lima manual", timestamp: "2025-02-10T11:00:00", created_at: "2025-02-10" },
  { id: "pp59", workstation_id: "w13", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Alternando olhar entre tela CAM e máquina", timestamp: "2025-02-11T08:00:00", created_at: "2025-02-11" },
  { id: "pp60", workstation_id: "w13", image_url: "/placeholder.svg", posture_type: "Elevação de carga", notes: "Removendo peça de 15kg da mesa da fresadora", timestamp: "2025-02-11T10:30:00", created_at: "2025-02-11" },
  // w14 Retificador (5 fotos)
  { id: "pp61", workstation_id: "w14", image_url: "/placeholder.svg", posture_type: "Postura em pé estática", notes: "Monitorando ciclo de retífica com lupa", timestamp: "2025-02-12T07:30:00", created_at: "2025-02-12" },
  { id: "pp62", workstation_id: "w14", image_url: "/placeholder.svg", posture_type: "Flexão cervical acentuada", notes: "Medindo rugosidade com rugosímetro digital", timestamp: "2025-02-12T08:30:00", created_at: "2025-02-12" },
  { id: "pp63", workstation_id: "w14", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Dreçando rebolo na retífica plana", timestamp: "2025-02-12T10:00:00", created_at: "2025-02-12" },
  { id: "pp64", workstation_id: "w14", image_url: "/placeholder.svg", posture_type: "Extensão de braço", notes: "Ajustando avanço no volante lateral da retífica", timestamp: "2025-02-13T08:00:00", created_at: "2025-02-13" },
  { id: "pp65", workstation_id: "w14", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Alcançando peças na bancada atrás da máquina", timestamp: "2025-02-13T09:30:00", created_at: "2025-02-13" },
  // w15 Soldador MIG/MAG (5 fotos)
  { id: "pp66", workstation_id: "w15", image_url: "/placeholder.svg", posture_type: "Flexão de tronco sustentada", notes: "Soldando junta em posição plana com flexão >45°", timestamp: "2025-02-10T07:30:00", created_at: "2025-02-10" },
  { id: "pp67", workstation_id: "w15", image_url: "/placeholder.svg", posture_type: "Elevação de braços acima do ombro", notes: "Soldando em posição sobre-cabeça (4G)", timestamp: "2025-02-10T09:00:00", created_at: "2025-02-10" },
  { id: "pp68", workstation_id: "w15", image_url: "/placeholder.svg", posture_type: "Agachamento prolongado", notes: "Soldando junta na base da estrutura ao nível do chão", timestamp: "2025-02-10T10:30:00", created_at: "2025-02-10" },
  { id: "pp69", workstation_id: "w15", image_url: "/placeholder.svg", posture_type: "Rotação cervical com máscara", notes: "Posicionando máscara de solda e verificando cordão", timestamp: "2025-02-11T08:00:00", created_at: "2025-02-11" },
  { id: "pp70", workstation_id: "w15", image_url: "/placeholder.svg", posture_type: "Vibração mão-braço", notes: "Esmerilhando cordão de solda com esmerilhadeira angular", timestamp: "2025-02-11T10:00:00", created_at: "2025-02-11" },
  // w16 Caldeireiro (5 fotos)
  { id: "pp71", workstation_id: "w16", image_url: "/placeholder.svg", posture_type: "Flexão de tronco sobre bancada", notes: "Traçando chapa com riscador e compasso", timestamp: "2025-02-12T07:30:00", created_at: "2025-02-12" },
  { id: "pp72", workstation_id: "w16", image_url: "/placeholder.svg", posture_type: "Postura em pé com carga estática", notes: "Posicionando chapa de 2m na guilhotina", timestamp: "2025-02-12T09:00:00", created_at: "2025-02-12" },
  { id: "pp73", workstation_id: "w16", image_url: "/placeholder.svg", posture_type: "Elevação de carga pesada", notes: "Carregando perfil metálico de 25kg manualmente", timestamp: "2025-02-12T10:30:00", created_at: "2025-02-12" },
  { id: "pp74", workstation_id: "w16", image_url: "/placeholder.svg", posture_type: "Agachamento com torção", notes: "Montando estrutura no gabarito ao nível do solo", timestamp: "2025-02-13T08:00:00", created_at: "2025-02-13" },
  { id: "pp75", workstation_id: "w16", image_url: "/placeholder.svg", posture_type: "Vibração mão-braço", notes: "Lixando superfície com lixadeira orbital", timestamp: "2025-02-13T10:00:00", created_at: "2025-02-13" },
  // w17 Analista Químico (5 fotos)
  { id: "pp76", workstation_id: "w17", image_url: "/placeholder.svg", posture_type: "Postura em pé com flexão cervical", notes: "Realizando titulação na capela de exaustão", timestamp: "2025-02-14T08:00:00", created_at: "2025-02-14" },
  { id: "pp77", workstation_id: "w17", image_url: "/placeholder.svg", posture_type: "Flexão de tronco anterior", notes: "Pipetando solução na bancada baixa", timestamp: "2025-02-14T09:00:00", created_at: "2025-02-14" },
  { id: "pp78", workstation_id: "w17", image_url: "/placeholder.svg", posture_type: "Movimentos finos de mão", notes: "Ajustando bureta para titulação manual gota a gota", timestamp: "2025-02-14T10:30:00", created_at: "2025-02-14" },
  { id: "pp79", workstation_id: "w17", image_url: "/placeholder.svg", posture_type: "Extensão cervical", notes: "Lendo menisco na bureta posicionada acima da linha dos olhos", timestamp: "2025-02-15T08:00:00", created_at: "2025-02-15" },
  { id: "pp80", workstation_id: "w17", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Alternando entre capela e bancada de pesagem", timestamp: "2025-02-15T09:30:00", created_at: "2025-02-15" },
  // w18 Técnico Cromatografia (5 fotos)
  { id: "pp81", workstation_id: "w18", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Monitorando corrida cromatográfica no computador por 2h", timestamp: "2025-02-14T08:00:00", created_at: "2025-02-14" },
  { id: "pp82", workstation_id: "w18", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Injetando amostra no amostrador automático do HPLC", timestamp: "2025-02-14T10:00:00", created_at: "2025-02-14" },
  { id: "pp83", workstation_id: "w18", image_url: "/placeholder.svg", posture_type: "Movimentos finos de precisão", notes: "Conectando coluna cromatográfica com ferrule", timestamp: "2025-02-14T11:30:00", created_at: "2025-02-14" },
  { id: "pp84", workstation_id: "w18", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Acessando cilindro de gás hélio embaixo da bancada", timestamp: "2025-02-15T08:30:00", created_at: "2025-02-15" },
  { id: "pp85", workstation_id: "w18", image_url: "/placeholder.svg", posture_type: "Extensão de braço", notes: "Ajustando detector UV na parte superior do HPLC", timestamp: "2025-02-15T10:00:00", created_at: "2025-02-15" },
  // w19 Desenvolvedor Software (5 fotos)
  { id: "pp86", workstation_id: "w19", image_url: "/placeholder.svg", posture_type: "Postura sentada contínua", notes: "Codificando por 3h sem pausa em cadeira ergonômica", timestamp: "2025-02-10T08:00:00", created_at: "2025-02-10" },
  { id: "pp87", workstation_id: "w19", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Olhando para monitor inferior durante debug", timestamp: "2025-02-10T10:00:00", created_at: "2025-02-10" },
  { id: "pp88", workstation_id: "w19", image_url: "/placeholder.svg", posture_type: "Extensão de punho bilateral", notes: "Digitação intensa no teclado mecânico", timestamp: "2025-02-10T14:00:00", created_at: "2025-02-10" },
  { id: "pp89", workstation_id: "w19", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Alternando entre 2 monitores (27\" lado a lado)", timestamp: "2025-02-11T09:00:00", created_at: "2025-02-11" },
  { id: "pp90", workstation_id: "w19", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Conferindo anotações em caderno ao lado do teclado", timestamp: "2025-02-11T11:00:00", created_at: "2025-02-11" },
  // w20 Analista Infraestrutura (5 fotos)
  { id: "pp91", workstation_id: "w20", image_url: "/placeholder.svg", posture_type: "Agachamento em rack", notes: "Cabeando switch no rack inferior do data center", timestamp: "2025-02-12T08:00:00", created_at: "2025-02-12" },
  { id: "pp92", workstation_id: "w20", image_url: "/placeholder.svg", posture_type: "Elevação de braço acima do ombro", notes: "Instalando patch panel no topo do rack de 42U", timestamp: "2025-02-12T09:30:00", created_at: "2025-02-12" },
  { id: "pp93", workstation_id: "w20", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Monitorando console de alertas Zabbix/Grafana", timestamp: "2025-02-12T11:00:00", created_at: "2025-02-12" },
  { id: "pp94", workstation_id: "w20", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Passando cabos sob piso elevado do data center", timestamp: "2025-02-13T08:00:00", created_at: "2025-02-13" },
  { id: "pp95", workstation_id: "w20", image_url: "/placeholder.svg", posture_type: "Rotação cervical extrema", notes: "Verificando etiquetas de cabos atrás do rack", timestamp: "2025-02-13T10:00:00", created_at: "2025-02-13" },
  // w21 Eletricista Industrial (5 fotos)
  { id: "pp96", workstation_id: "w21", image_url: "/placeholder.svg", posture_type: "Elevação de braços sustentada", notes: "Conectando cabos no painel elétrico acima da cabeça", timestamp: "2025-02-14T07:30:00", created_at: "2025-02-14" },
  { id: "pp97", workstation_id: "w21", image_url: "/placeholder.svg", posture_type: "Flexão cervical acentuada", notes: "Lendo diagrama unifilar dentro do painel", timestamp: "2025-02-14T09:00:00", created_at: "2025-02-14" },
  { id: "pp98", workstation_id: "w21", image_url: "/placeholder.svg", posture_type: "Agachamento no CCM", notes: "Testando contator na gaveta inferior do CCM", timestamp: "2025-02-14T10:30:00", created_at: "2025-02-14" },
  { id: "pp99", workstation_id: "w21", image_url: "/placeholder.svg", posture_type: "Postura em escada", notes: "Inspecionando leito de cabos a 4m de altura", timestamp: "2025-02-15T08:00:00", created_at: "2025-02-15" },
  { id: "pp100", workstation_id: "w21", image_url: "/placeholder.svg", posture_type: "Rotação de tronco com ferramenta", notes: "Termografando barramento com câmera IR", timestamp: "2025-02-15T10:00:00", created_at: "2025-02-15" },
  // w22 Mecânico de Manutenção (5 fotos)
  { id: "pp101", workstation_id: "w22", image_url: "/placeholder.svg", posture_type: "Flexão de tronco acentuada", notes: "Desmontando redutor de velocidade no chão da fábrica", timestamp: "2025-02-14T07:30:00", created_at: "2025-02-14" },
  { id: "pp102", workstation_id: "w22", image_url: "/placeholder.svg", posture_type: "Elevação de carga pesada", notes: "Carregando motor elétrico de 30kg para bancada", timestamp: "2025-02-14T09:00:00", created_at: "2025-02-14" },
  { id: "pp103", workstation_id: "w22", image_url: "/placeholder.svg", posture_type: "Agachamento prolongado", notes: "Alinhando acoplamento na base da bomba hidráulica", timestamp: "2025-02-14T11:00:00", created_at: "2025-02-14" },
  { id: "pp104", workstation_id: "w22", image_url: "/placeholder.svg", posture_type: "Postura em decúbito dorsal", notes: "Lubrificando mancal embaixo da esteira transportadora", timestamp: "2025-02-15T08:00:00", created_at: "2025-02-15" },
  { id: "pp105", workstation_id: "w22", image_url: "/placeholder.svg", posture_type: "Vibração mão-braço", notes: "Usando chave de impacto pneumática para desapertar parafusos", timestamp: "2025-02-15T10:00:00", created_at: "2025-02-15" },
  // w23 Motorista Carreta (5 fotos)
  { id: "pp106", workstation_id: "w23", image_url: "/placeholder.svg", posture_type: "Postura sentada com vibração", notes: "Conduzindo carreta na rodovia por 4h contínuas", timestamp: "2025-02-16T06:00:00", created_at: "2025-02-16" },
  { id: "pp107", workstation_id: "w23", image_url: "/placeholder.svg", posture_type: "Rotação cervical repetitiva", notes: "Checando retrovisores durante manobra em pátio", timestamp: "2025-02-16T10:00:00", created_at: "2025-02-16" },
  { id: "pp108", workstation_id: "w23", image_url: "/placeholder.svg", posture_type: "Flexão de tronco e joelhos", notes: "Amarrando carga com catraca na carroceria", timestamp: "2025-02-16T11:30:00", created_at: "2025-02-16" },
  { id: "pp109", workstation_id: "w23", image_url: "/placeholder.svg", posture_type: "Subida/descida da cabine", notes: "Subindo 3 degraus para acessar cabine (repetido ~20x/dia)", timestamp: "2025-02-17T07:00:00", created_at: "2025-02-17" },
  { id: "pp110", workstation_id: "w23", image_url: "/placeholder.svg", posture_type: "Extensão lombar", notes: "Alongamento após 4h sentado — dor lombar relatada", timestamp: "2025-02-17T11:00:00", created_at: "2025-02-17" },
  // w24 Operador Ponte Rolante (5 fotos)
  { id: "pp111", workstation_id: "w24", image_url: "/placeholder.svg", posture_type: "Extensão cervical sustentada", notes: "Olhando para cima monitorando carga suspensa (8 ton)", timestamp: "2025-02-16T08:00:00", created_at: "2025-02-16" },
  { id: "pp112", workstation_id: "w24", image_url: "/placeholder.svg", posture_type: "Postura em pé com braço elevado", notes: "Operando controle remoto da ponte rolante", timestamp: "2025-02-16T09:30:00", created_at: "2025-02-16" },
  { id: "pp113", workstation_id: "w24", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Sinalizando para auxiliar de solo durante movimentação", timestamp: "2025-02-16T11:00:00", created_at: "2025-02-16" },
  { id: "pp114", workstation_id: "w24", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Engatando estropos de nylon nas chapas", timestamp: "2025-02-17T08:00:00", created_at: "2025-02-17" },
  { id: "pp115", workstation_id: "w24", image_url: "/placeholder.svg", posture_type: "Caminhada com carga visual", notes: "Acompanhando carga suspensa pelo galpão (~200m)", timestamp: "2025-02-17T10:00:00", created_at: "2025-02-17" },
  // w25 Analista RH (5 fotos)
  { id: "pp116", workstation_id: "w25", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Processando folha de pagamento no eSocial por 4h", timestamp: "2025-02-10T08:00:00", created_at: "2025-02-10" },
  { id: "pp117", workstation_id: "w25", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Lendo documentos físicos de admissão na mesa", timestamp: "2025-02-10T10:00:00", created_at: "2025-02-10" },
  { id: "pp118", workstation_id: "w25", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Digitação prolongada com mouse sem apoio", timestamp: "2025-02-10T14:00:00", created_at: "2025-02-10" },
  { id: "pp119", workstation_id: "w25", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Acessando arquivo físico atrás da cadeira", timestamp: "2025-02-11T09:00:00", created_at: "2025-02-11" },
  { id: "pp120", workstation_id: "w25", image_url: "/placeholder.svg", posture_type: "Postura sentada com apoio inadequado", notes: "Cadeira sem apoio lombar — queixa de desconforto", timestamp: "2025-02-11T11:00:00", created_at: "2025-02-11" },
  // w26 Advogado Trabalhista (5 fotos)
  { id: "pp121", workstation_id: "w26", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Elaborando peça jurídica no computador por 5h", timestamp: "2025-02-12T08:00:00", created_at: "2025-02-12" },
  { id: "pp122", workstation_id: "w26", image_url: "/placeholder.svg", posture_type: "Flexão cervical acentuada", notes: "Consultando legislação em livro na mesa", timestamp: "2025-02-12T10:00:00", created_at: "2025-02-12" },
  { id: "pp123", workstation_id: "w26", image_url: "/placeholder.svg", posture_type: "Extensão de braço", notes: "Alcançando livros na estante superior", timestamp: "2025-02-12T14:00:00", created_at: "2025-02-12" },
  { id: "pp124", workstation_id: "w26", image_url: "/placeholder.svg", posture_type: "Postura sentada com pernas cruzadas", notes: "Reunião prolongada em cadeira sem regulagem", timestamp: "2025-02-13T09:00:00", created_at: "2025-02-13" },
  { id: "pp125", workstation_id: "w26", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Uso intenso de mouse durante pesquisa jurisprudencial", timestamp: "2025-02-13T11:00:00", created_at: "2025-02-13" },
  // w27 TST (5 fotos)
  { id: "pp126", workstation_id: "w27", image_url: "/placeholder.svg", posture_type: "Postura em pé com caminhada", notes: "Inspecionando área industrial — percurso de 3km", timestamp: "2025-02-14T07:30:00", created_at: "2025-02-14" },
  { id: "pp127", workstation_id: "w27", image_url: "/placeholder.svg", posture_type: "Agachamento", notes: "Verificando proteção de máquina ao nível do piso", timestamp: "2025-02-14T09:00:00", created_at: "2025-02-14" },
  { id: "pp128", workstation_id: "w27", image_url: "/placeholder.svg", posture_type: "Elevação de braço com equipamento", notes: "Posicionando dosímetro de ruído no ombro do trabalhador", timestamp: "2025-02-14T10:30:00", created_at: "2025-02-14" },
  { id: "pp129", workstation_id: "w27", image_url: "/placeholder.svg", posture_type: "Postura sentada", notes: "Elaborando relatório de investigação de acidente no escritório", timestamp: "2025-02-15T08:00:00", created_at: "2025-02-15" },
  { id: "pp130", workstation_id: "w27", image_url: "/placeholder.svg", posture_type: "Postura em pé com demonstração", notes: "Ministrando treinamento de uso de extintor para turma", timestamp: "2025-02-15T14:00:00", created_at: "2025-02-15" },
  // w28 Enfermeiro do Trabalho (5 fotos)
  { id: "pp131", workstation_id: "w28", image_url: "/placeholder.svg", posture_type: "Postura em pé com flexão", notes: "Realizando curativo em mão de colaborador no ambulatório", timestamp: "2025-02-14T08:00:00", created_at: "2025-02-14" },
  { id: "pp132", workstation_id: "w28", image_url: "/placeholder.svg", posture_type: "Postura sentada", notes: "Registrando atendimento no prontuário eletrônico SOC", timestamp: "2025-02-14T09:30:00", created_at: "2025-02-14" },
  { id: "pp133", workstation_id: "w28", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Aferindo pressão arterial de paciente sentado", timestamp: "2025-02-14T11:00:00", created_at: "2025-02-14" },
  { id: "pp134", workstation_id: "w28", image_url: "/placeholder.svg", posture_type: "Elevação de braço", notes: "Alcançando materiais no armário de medicamentos", timestamp: "2025-02-15T08:00:00", created_at: "2025-02-15" },
  { id: "pp135", workstation_id: "w28", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Aplicando vacinas em campanha de imunização (~60 colaboradores)", timestamp: "2025-02-15T10:00:00", created_at: "2025-02-15" },
  // Constrular - w30 Auxiliar Contábil (5 fotos)
  { id: "pp136", workstation_id: "w30", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Lançando NFs no ERP por 4h consecutivas", timestamp: "2025-02-10T08:00:00", created_at: "2025-02-10" },
  { id: "pp137", workstation_id: "w30", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Conferindo documentos físicos na mesa", timestamp: "2025-02-10T10:00:00", created_at: "2025-02-10" },
  { id: "pp138", workstation_id: "w30", image_url: "/placeholder.svg", posture_type: "Extensão de punho bilateral", notes: "Digitação contínua sem apoio de punho", timestamp: "2025-02-10T14:00:00", created_at: "2025-02-10" },
  { id: "pp139", workstation_id: "w30", image_url: "/placeholder.svg", posture_type: "Rotação de tronco", notes: "Acessando gaveta do arquivo lateral", timestamp: "2025-02-11T09:00:00", created_at: "2025-02-11" },
  { id: "pp140", workstation_id: "w30", image_url: "/placeholder.svg", posture_type: "Inclinação lateral", notes: "Pegando papéis na impressora ao lado da mesa", timestamp: "2025-02-11T11:00:00", created_at: "2025-02-11" },
  // w31 Assistente Comercial (5 fotos)
  { id: "pp141", workstation_id: "w31", image_url: "/placeholder.svg", posture_type: "Postura em pé prolongada", notes: "Atendendo clientes no balcão por 3h contínuas", timestamp: "2025-02-10T08:00:00", created_at: "2025-02-10" },
  { id: "pp142", workstation_id: "w31", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Consultando catálogo de produtos no balcão", timestamp: "2025-02-10T09:30:00", created_at: "2025-02-10" },
  { id: "pp143", workstation_id: "w31", image_url: "/placeholder.svg", posture_type: "Extensão de braço", notes: "Mostrando produtos na prateleira alta do showroom", timestamp: "2025-02-10T11:00:00", created_at: "2025-02-10" },
  { id: "pp144", workstation_id: "w31", image_url: "/placeholder.svg", posture_type: "Agachamento", notes: "Pegando amostra de piso cerâmico na prateleira inferior", timestamp: "2025-02-11T08:30:00", created_at: "2025-02-11" },
  { id: "pp145", workstation_id: "w31", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Alternando entre cliente e tela do PDV", timestamp: "2025-02-11T10:00:00", created_at: "2025-02-11" },
  // w32 Vendedor Externo (5 fotos)
  { id: "pp146", workstation_id: "w32", image_url: "/placeholder.svg", posture_type: "Postura sentada com vibração", notes: "Conduzindo utilitário em vias urbanas por 2h", timestamp: "2025-02-12T08:00:00", created_at: "2025-02-12" },
  { id: "pp147", workstation_id: "w32", image_url: "/placeholder.svg", posture_type: "Postura em pé com inclinação", notes: "Apresentando catálogo no canteiro de obras", timestamp: "2025-02-12T10:00:00", created_at: "2025-02-12" },
  { id: "pp148", workstation_id: "w32", image_url: "/placeholder.svg", posture_type: "Flexão cervical", notes: "Preenchendo pedido no tablet apoiado sobre capô", timestamp: "2025-02-12T11:30:00", created_at: "2025-02-12" },
  { id: "pp149", workstation_id: "w32", image_url: "/placeholder.svg", posture_type: "Subida/descida do veículo", notes: "Entrando e saindo do utilitário (~15x/dia)", timestamp: "2025-02-13T09:00:00", created_at: "2025-02-13" },
  { id: "pp150", workstation_id: "w32", image_url: "/placeholder.svg", posture_type: "Carregamento de amostras", notes: "Transportando caixa de amostras de 8kg do porta-malas", timestamp: "2025-02-13T14:00:00", created_at: "2025-02-13" },
  // w33 Engenheiro de Projetos (5 fotos)
  { id: "pp151", workstation_id: "w33", image_url: "/placeholder.svg", posture_type: "Postura sentada prolongada", notes: "Projetando em AutoCAD por 5h com poucas pausas", timestamp: "2025-02-14T08:00:00", created_at: "2025-02-14" },
  { id: "pp152", workstation_id: "w33", image_url: "/placeholder.svg", posture_type: "Flexão cervical acentuada", notes: "Analisando planta impressa na mesa de desenho", timestamp: "2025-02-14T10:00:00", created_at: "2025-02-14" },
  { id: "pp153", workstation_id: "w33", image_url: "/placeholder.svg", posture_type: "Extensão de punho", notes: "Uso prolongado de mouse durante modelagem 3D", timestamp: "2025-02-14T14:00:00", created_at: "2025-02-14" },
  { id: "pp154", workstation_id: "w33", image_url: "/placeholder.svg", posture_type: "Postura em pé em obra", notes: "Visitando obra para levantamento de medidas", timestamp: "2025-02-15T09:00:00", created_at: "2025-02-15" },
  { id: "pp155", workstation_id: "w33", image_url: "/placeholder.svg", posture_type: "Rotação cervical", notes: "Alternando entre monitor e plotter durante impressão", timestamp: "2025-02-15T11:00:00", created_at: "2025-02-15" },
  // w34 Técnico em Edificações (5 fotos)
  { id: "pp156", workstation_id: "w34", image_url: "/placeholder.svg", posture_type: "Agachamento em obra", notes: "Medindo nível do piso com nível laser ao chão", timestamp: "2025-02-14T08:00:00", created_at: "2025-02-14" },
  { id: "pp157", workstation_id: "w34", image_url: "/placeholder.svg", posture_type: "Extensão cervical", notes: "Verificando prumo de parede com trena laser apontada para cima", timestamp: "2025-02-14T09:30:00", created_at: "2025-02-14" },
  { id: "pp158", workstation_id: "w34", image_url: "/placeholder.svg", posture_type: "Postura em pé com caminhada", notes: "Percorrendo obra de 3 pavimentos para inspeção", timestamp: "2025-02-14T11:00:00", created_at: "2025-02-14" },
  { id: "pp159", workstation_id: "w34", image_url: "/placeholder.svg", posture_type: "Flexão de tronco", notes: "Fotografando detalhes de instalação hidráulica", timestamp: "2025-02-15T08:30:00", created_at: "2025-02-15" },
  { id: "pp160", workstation_id: "w34", image_url: "/placeholder.svg", posture_type: "Postura sentada", notes: "Elaborando relatório técnico no escritório", timestamp: "2025-02-15T14:00:00", created_at: "2025-02-15" },
  // w35 Estoquista (5 fotos)
  { id: "pp161", workstation_id: "w35", image_url: "/placeholder.svg", posture_type: "Elevação de carga pesada", notes: "Empilhando sacos de cimento de 50kg com auxílio de carrinho", timestamp: "2025-02-10T07:30:00", created_at: "2025-02-10" },
  { id: "pp162", workstation_id: "w35", image_url: "/placeholder.svg", posture_type: "Agachamento repetitivo", notes: "Separando materiais nas prateleiras inferiores", timestamp: "2025-02-10T09:00:00", created_at: "2025-02-10" },
  { id: "pp163", workstation_id: "w35", image_url: "/placeholder.svg", posture_type: "Elevação de braço acima do ombro", notes: "Armazenando caixas de conexões na prateleira de 2,5m", timestamp: "2025-02-10T10:30:00", created_at: "2025-02-10" },
  { id: "pp164", workstation_id: "w35", image_url: "/placeholder.svg", posture_type: "Postura em pé com caminhada", notes: "Caminhando entre corredores durante inventário (~5km/dia)", timestamp: "2025-02-11T08:00:00", created_at: "2025-02-11" },
  { id: "pp165", workstation_id: "w35", image_url: "/placeholder.svg", posture_type: "Flexão de tronco com carga", notes: "Carregando tubo PVC de 6m com colega", timestamp: "2025-02-11T10:00:00", created_at: "2025-02-11" },
  // w36 Motorista de Entrega (5 fotos)
  { id: "pp166", workstation_id: "w36", image_url: "/placeholder.svg", posture_type: "Postura sentada com vibração", notes: "Conduzindo caminhão 3/4 em ruas esburacadas por 3h", timestamp: "2025-02-12T07:00:00", created_at: "2025-02-12" },
  { id: "pp167", workstation_id: "w36", image_url: "/placeholder.svg", posture_type: "Elevação de carga pesada", notes: "Descarregando caixas de argamassa de 20kg com carreta de mão", timestamp: "2025-02-12T10:00:00", created_at: "2025-02-12" },
  { id: "pp168", workstation_id: "w36", image_url: "/placeholder.svg", posture_type: "Flexão de tronco acentuada", notes: "Amarrando carga na plataforma do caminhão", timestamp: "2025-02-12T11:30:00", created_at: "2025-02-12" },
  { id: "pp169", workstation_id: "w36", image_url: "/placeholder.svg", posture_type: "Subida/descida da cabine", notes: "Subindo e descendo da cabine (~25x/dia em entregas múltiplas)", timestamp: "2025-02-13T08:00:00", created_at: "2025-02-13" },
  { id: "pp170", workstation_id: "w36", image_url: "/placeholder.svg", posture_type: "Carregamento manual escada", notes: "Subindo escada com sacos de 25kg em entrega residencial sem elevador", timestamp: "2025-02-13T14:00:00", created_at: "2025-02-13" },
];

export const mockPostureAnalyses: PostureAnalysis[] = [
  { id: "pa1", workstation_id: "w1", joint_angles: { neck: 25, shoulder: 35, elbow: 90, trunk: 30, hip: 85, knee: 170 }, ergonomic_scores: { REBA: 8, RULA: 6 }, risk_level: "high", created_at: "2025-03-02" },
  { id: "pa2", workstation_id: "w2", joint_angles: { neck: 15, shoulder: 40, elbow: 100, trunk: 20, hip: 90, knee: 175 }, ergonomic_scores: { REBA: 6, RULA: 5 }, risk_level: "medium", created_at: "2025-03-04" },
  { id: "pa3", workstation_id: "w3", joint_angles: { neck: 20, shoulder: 15, elbow: 85, trunk: 10, hip: 95, knee: 90 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-03-07" },
  { id: "pa4", workstation_id: "w5", joint_angles: { neck: 30, shoulder: 10, elbow: 90, trunk: 15, hip: 90, knee: 90 }, ergonomic_scores: { ROSA: 4 }, risk_level: "medium", created_at: "2025-03-09" },
  // Empresa Teste
  { id: "pa5", workstation_id: "w6", joint_angles: { neck: 22, shoulder: 12, elbow: 88, trunk: 12, hip: 92, knee: 88 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-03-11" },
  { id: "pa6", workstation_id: "w7", joint_angles: { neck: 28, shoulder: 15, elbow: 92, trunk: 18, hip: 88, knee: 85 }, ergonomic_scores: { ROSA: 6 }, risk_level: "high", created_at: "2025-03-11" },
  { id: "pa7", workstation_id: "w8", joint_angles: { neck: 20, shoulder: 55, elbow: 75, trunk: 35, hip: 80, knee: 165 }, ergonomic_scores: { REBA: 9, RULA: 7 }, risk_level: "high", created_at: "2025-03-13" },
  { id: "pa8", workstation_id: "w9", joint_angles: { neck: 25, shoulder: 30, elbow: 95, trunk: 22, hip: 88, knee: 170 }, ergonomic_scores: { REBA: 7, RULA: 6, OCRA: 3.8 }, risk_level: "high", created_at: "2025-03-13" },
  { id: "pa9", workstation_id: "w10", joint_angles: { neck: 35, shoulder: 20, elbow: 100, trunk: 15, hip: 95, knee: 80 }, ergonomic_scores: { REBA: 6 }, risk_level: "medium", created_at: "2025-03-15" },
  { id: "pa10", workstation_id: "w11", joint_angles: { neck: 18, shoulder: 65, elbow: 70, trunk: 40, hip: 75, knee: 120 }, ergonomic_scores: { REBA: 10, RULA: 7 }, risk_level: "critical", created_at: "2025-03-15" },
  // GIN Industrial
  { id: "pa11", workstation_id: "w12", joint_angles: { neck: 22, shoulder: 30, elbow: 85, trunk: 28, hip: 82, knee: 168 }, ergonomic_scores: { REBA: 7, RULA: 6 }, risk_level: "high", created_at: "2025-02-11" },
  { id: "pa12", workstation_id: "w13", joint_angles: { neck: 25, shoulder: 35, elbow: 80, trunk: 32, hip: 78, knee: 165 }, ergonomic_scores: { REBA: 8, RULA: 7 }, risk_level: "high", created_at: "2025-02-11" },
  { id: "pa13", workstation_id: "w14", joint_angles: { neck: 30, shoulder: 20, elbow: 90, trunk: 22, hip: 85, knee: 172 }, ergonomic_scores: { REBA: 6, RULA: 5 }, risk_level: "medium", created_at: "2025-02-13" },
  { id: "pa14", workstation_id: "w15", joint_angles: { neck: 28, shoulder: 70, elbow: 65, trunk: 45, hip: 70, knee: 130 }, ergonomic_scores: { REBA: 11, RULA: 7 }, risk_level: "critical", created_at: "2025-02-11" },
  { id: "pa15", workstation_id: "w16", joint_angles: { neck: 20, shoulder: 55, elbow: 75, trunk: 40, hip: 72, knee: 140 }, ergonomic_scores: { REBA: 10, RULA: 7 }, risk_level: "critical", created_at: "2025-02-13" },
  { id: "pa16", workstation_id: "w17", joint_angles: { neck: 25, shoulder: 18, elbow: 95, trunk: 20, hip: 88, knee: 175 }, ergonomic_scores: { REBA: 5, RULA: 4 }, risk_level: "medium", created_at: "2025-02-15" },
  { id: "pa17", workstation_id: "w18", joint_angles: { neck: 28, shoulder: 12, elbow: 92, trunk: 15, hip: 90, knee: 88 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-02-15" },
  { id: "pa18", workstation_id: "w19", joint_angles: { neck: 22, shoulder: 10, elbow: 90, trunk: 12, hip: 92, knee: 90 }, ergonomic_scores: { ROSA: 4 }, risk_level: "medium", created_at: "2025-02-11" },
  { id: "pa19", workstation_id: "w20", joint_angles: { neck: 30, shoulder: 55, elbow: 70, trunk: 35, hip: 75, knee: 150 }, ergonomic_scores: { REBA: 8, ROSA: 5 }, risk_level: "high", created_at: "2025-02-13" },
  { id: "pa20", workstation_id: "w21", joint_angles: { neck: 25, shoulder: 65, elbow: 60, trunk: 30, hip: 80, knee: 165 }, ergonomic_scores: { REBA: 9, RULA: 7 }, risk_level: "high", created_at: "2025-02-15" },
  { id: "pa21", workstation_id: "w22", joint_angles: { neck: 20, shoulder: 50, elbow: 75, trunk: 42, hip: 68, knee: 135 }, ergonomic_scores: { REBA: 10, RULA: 7 }, risk_level: "critical", created_at: "2025-02-15" },
  { id: "pa22", workstation_id: "w23", joint_angles: { neck: 32, shoulder: 15, elbow: 100, trunk: 18, hip: 92, knee: 85 }, ergonomic_scores: { REBA: 6 }, risk_level: "medium", created_at: "2025-02-17" },
  { id: "pa23", workstation_id: "w24", joint_angles: { neck: 40, shoulder: 45, elbow: 80, trunk: 25, hip: 85, knee: 170 }, ergonomic_scores: { REBA: 8, RULA: 6 }, risk_level: "high", created_at: "2025-02-17" },
  { id: "pa24", workstation_id: "w25", joint_angles: { neck: 25, shoulder: 10, elbow: 90, trunk: 15, hip: 90, knee: 88 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-02-11" },
  { id: "pa25", workstation_id: "w26", joint_angles: { neck: 28, shoulder: 12, elbow: 88, trunk: 18, hip: 88, knee: 85 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-02-13" },
  { id: "pa26", workstation_id: "w27", joint_angles: { neck: 20, shoulder: 40, elbow: 85, trunk: 25, hip: 82, knee: 160 }, ergonomic_scores: { REBA: 6, RULA: 5 }, risk_level: "medium", created_at: "2025-02-15" },
  { id: "pa27", workstation_id: "w28", joint_angles: { neck: 22, shoulder: 30, elbow: 90, trunk: 22, hip: 85, knee: 170 }, ergonomic_scores: { REBA: 5, RULA: 4 }, risk_level: "medium", created_at: "2025-02-15" },
  // Constrular
  { id: "pa28", workstation_id: "w30", joint_angles: { neck: 25, shoulder: 10, elbow: 90, trunk: 15, hip: 90, knee: 88 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-02-11" },
  { id: "pa29", workstation_id: "w31", joint_angles: { neck: 18, shoulder: 25, elbow: 85, trunk: 15, hip: 88, knee: 170 }, ergonomic_scores: { REBA: 5, RULA: 4 }, risk_level: "medium", created_at: "2025-02-11" },
  { id: "pa30", workstation_id: "w32", joint_angles: { neck: 20, shoulder: 15, elbow: 95, trunk: 12, hip: 92, knee: 85 }, ergonomic_scores: { REBA: 4 }, risk_level: "low", created_at: "2025-02-13" },
  { id: "pa31", workstation_id: "w33", joint_angles: { neck: 28, shoulder: 12, elbow: 88, trunk: 18, hip: 88, knee: 85 }, ergonomic_scores: { ROSA: 5 }, risk_level: "medium", created_at: "2025-02-15" },
  { id: "pa32", workstation_id: "w34", joint_angles: { neck: 22, shoulder: 35, elbow: 80, trunk: 28, hip: 80, knee: 140 }, ergonomic_scores: { REBA: 6, RULA: 5 }, risk_level: "medium", created_at: "2025-02-15" },
  { id: "pa33", workstation_id: "w35", joint_angles: { neck: 18, shoulder: 60, elbow: 70, trunk: 42, hip: 72, knee: 125 }, ergonomic_scores: { REBA: 10, RULA: 7 }, risk_level: "critical", created_at: "2025-02-11" },
  { id: "pa34", workstation_id: "w36", joint_angles: { neck: 30, shoulder: 50, elbow: 75, trunk: 38, hip: 78, knee: 150 }, ergonomic_scores: { REBA: 9, RULA: 7 }, risk_level: "high", created_at: "2025-02-13" },
];

export const mockAnalyses: Analysis[] = [
  { id: "a1", workstation_id: "w1", method: "REBA", score: 8, notes: "Flexão excessiva de tronco ao operar a chapa. Postura em pé prolongada com rotações frequentes.", body_parts: { trunk: 4, neck: 2, legs: 2, upper_arm: 3, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-03-01" },
  { id: "a2", workstation_id: "w2", method: "RULA", score: 6, notes: "Movimentos repetitivos nos braços ao cortar frutas. Elevação frequente dos braços acima do nível do ombro.", body_parts: { upper_arm: 3, lower_arm: 2, wrist: 3, neck: 2, trunk: 2, legs: 1 }, analysis_status: "completed", created_at: "2025-03-05" },
  { id: "a3", workstation_id: "w3", method: "ROSA", score: 5, notes: "Postura em pé prolongada sem apoio. Bancada do caixa com altura inadequada.", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-03-08" },
  { id: "a4", workstation_id: "w4", method: "REBA", score: 9, notes: "Flexão de tronco acentuada ao limpar pisos. Movimentos repetitivos com membros superiores.", body_parts: { trunk: 5, neck: 2, legs: 2, upper_arm: 3, lower_arm: 3, wrist: 2 }, analysis_status: "in_progress", created_at: "2025-03-10" },
  { id: "a5", workstation_id: "w5", method: "ROSA", score: 4, notes: "Monitor abaixo da linha dos olhos. Cadeira sem apoio lombar adequado.", body_parts: { chair: 3, monitor: 3, keyboard: 2, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-03-12" },
  // Empresa Teste
  { id: "a6", workstation_id: "w6", method: "ROSA", score: 5, notes: "Cadeira sem apoio para braços. Monitor posicionado lateralmente, gerando rotação cervical constante. Telefone sem headset.", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 2, telephone: 3 }, analysis_status: "completed", created_at: "2025-03-11" },
  { id: "a7", workstation_id: "w7", method: "ROSA", score: 6, notes: "Mesa sem regulagem de altura. Monitor abaixo da linha dos olhos. Teclado e mouse sem apoio de punho. Ausência de suporte para documentos.", body_parts: { chair: 4, monitor: 4, keyboard: 3, mouse: 3, telephone: 2 }, analysis_status: "completed", created_at: "2025-03-11" },
  { id: "a8", workstation_id: "w8", method: "REBA", score: 9, notes: "Flexão de tronco acentuada ao fixar peças. Elevação frequente de braços acima do ombro para troca de ferramentas. Postura em pé prolongada (>6h). Agachamento para coletar peças no nível do chão.", body_parts: { trunk: 4, neck: 3, legs: 3, upper_arm: 4, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-03-13" },
  { id: "a9", workstation_id: "w9", method: "REBA", score: 7, notes: "Movimentos repetitivos de punho com parafusadeira. Flexão cervical para inspeção visual. Manuseio de carga de 8 kg. Pinça fina prolongada.", body_parts: { trunk: 3, neck: 3, legs: 1, upper_arm: 2, lower_arm: 3, wrist: 4 }, analysis_status: "completed", created_at: "2025-03-13" },
  { id: "a10", workstation_id: "w10", method: "REBA", score: 6, notes: "Vibração de corpo inteiro na empilhadeira. Rotação cervical extrema em manobras de ré. Extensão cervical ao posicionar carga em altura. Piso irregular gera impacto na coluna.", body_parts: { trunk: 3, neck: 4, legs: 2, upper_arm: 2, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-03-15" },
  { id: "a11", workstation_id: "w11", method: "REBA", score: 10, notes: "Agachamento repetitivo para prateleiras baixas. Elevação de braço acima do ombro para prateleiras altas. Transporte manual de carga de 12 kg. Caminhada contínua (~8 km/dia). Flexão lateral para leitura de etiquetas.", body_parts: { trunk: 5, neck: 2, legs: 4, upper_arm: 4, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-03-15" },
  // GIN Industrial
  { id: "a12", workstation_id: "w12", method: "REBA", score: 7, notes: "Postura em pé prolongada (>7h). Flexão de tronco ao fixar peças no mandril. Agachamento para coletar peças no nível do chão. Exposição a ruído de 85 dB(A) e névoa de fluido de corte.", body_parts: { trunk: 3, neck: 3, legs: 3, upper_arm: 2, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a13", workstation_id: "w13", method: "REBA", score: 8, notes: "Flexão de tronco acentuada ao fixar peças na morsa. Movimentos repetitivos de punho na rebarbação. Elevação de carga de 15kg. Ruído de 88 dB(A).", body_parts: { trunk: 4, neck: 3, legs: 2, upper_arm: 3, lower_arm: 3, wrist: 3 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a14", workstation_id: "w14", method: "REBA", score: 6, notes: "Postura em pé estática por períodos prolongados. Flexão cervical para leitura de instrumentos. Exposição a névoa de fluido sintético.", body_parts: { trunk: 3, neck: 3, legs: 2, upper_arm: 2, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-13" },
  { id: "a15", workstation_id: "w15", method: "REBA", score: 11, notes: "Soldagem em posição sobre-cabeça (4G) com elevação sustentada de braços. Agachamento prolongado para juntas na base. Exposição a fumos metálicos, radiação UV e calor radiante. Vibração mão-braço ao esmerilhar.", body_parts: { trunk: 5, neck: 3, legs: 3, upper_arm: 5, lower_arm: 2, wrist: 3 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a16", workstation_id: "w16", method: "REBA", score: 10, notes: "Manuseio de chapas e perfis pesados (>25kg). Agachamento com torção ao montar estruturas no solo. Vibração mão-braço com lixadeira. Exposição a ruído de 92 dB(A).", body_parts: { trunk: 5, neck: 2, legs: 4, upper_arm: 3, lower_arm: 3, wrist: 3 }, analysis_status: "completed", created_at: "2025-02-13" },
  { id: "a17", workstation_id: "w17", method: "REBA", score: 5, notes: "Postura em pé com flexão cervical na capela. Movimentos finos de precisão em titulação. Exposição a vapores ácidos e solventes. Bancada de pesagem abaixo do nível ergonômico.", body_parts: { trunk: 2, neck: 3, legs: 2, upper_arm: 2, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a18", workstation_id: "w18", method: "ROSA", score: 5, notes: "Postura sentada prolongada monitorando corridas cromatográficas. Flexão cervical ao injetar amostras. Movimentos de precisão na manutenção de colunas. Exposição a solventes orgânicos.", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a19", workstation_id: "w19", method: "ROSA", score: 4, notes: "Postura sentada contínua (>6h). Boa estação ergonômica com mesa regulável. Extensão de punho bilateral durante digitação intensa. Rotação cervical entre dois monitores.", body_parts: { chair: 2, monitor: 3, keyboard: 3, mouse: 2, telephone: 1 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a20", workstation_id: "w20", method: "REBA", score: 8, notes: "Alternância entre postura sentada e trabalho físico em racks. Agachamento em rack inferior. Elevação acima do ombro em racks altos. Passagem de cabos sob piso elevado. Ambiente climatizado a 20°C.", body_parts: { trunk: 4, neck: 3, legs: 3, upper_arm: 4, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-13" },
  { id: "a21", workstation_id: "w21", method: "REBA", score: 9, notes: "Trabalho em altura (leito de cabos a 4m). Elevação sustentada de braços em painéis. Agachamento no CCM. Risco elétrico NR-10. Exposição a campos eletromagnéticos.", body_parts: { trunk: 3, neck: 3, legs: 3, upper_arm: 5, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a22", workstation_id: "w22", method: "REBA", score: 10, notes: "Manuseio de componentes pesados (motor 30kg). Postura em decúbito dorsal sob esteiras. Vibração mão-braço com chave de impacto. Agachamento prolongado em bases de bombas. Exposição a graxa e solventes.", body_parts: { trunk: 5, neck: 2, legs: 3, upper_arm: 3, lower_arm: 3, wrist: 3 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a23", workstation_id: "w23", method: "REBA", score: 6, notes: "Postura sentada prolongada com vibração de corpo inteiro. Rotação cervical repetitiva. Subida/descida da cabine (~20x/dia). Exposição a calor e gases de exaustão. Trabalho noturno em viagens.", body_parts: { trunk: 3, neck: 4, legs: 2, upper_arm: 1, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-02-17" },
  { id: "a24", workstation_id: "w24", method: "REBA", score: 8, notes: "Extensão cervical sustentada monitorando carga suspensa. Postura em pé com braço elevado operando controle remoto. Risco de queda de carga. Exposição a ruído do galpão 87 dB(A).", body_parts: { trunk: 3, neck: 5, legs: 2, upper_arm: 4, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-02-17" },
  { id: "a25", workstation_id: "w25", method: "ROSA", score: 5, notes: "Postura sentada prolongada em cadeira sem apoio lombar adequado. Mouse sem apoio de punho. Rotação de tronco para acessar arquivo. Demanda cognitiva alta em períodos de fechamento de folha.", body_parts: { chair: 4, monitor: 3, keyboard: 2, mouse: 3, telephone: 2 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a26", workstation_id: "w26", method: "ROSA", score: 5, notes: "Postura sentada prolongada (>8h com poucas pausas). Flexão cervical para leitura de livros. Extensão de braço para estante. Demanda cognitiva e emocional elevadas.", body_parts: { chair: 3, monitor: 3, keyboard: 2, mouse: 3, telephone: 2 }, analysis_status: "completed", created_at: "2025-02-13" },
  { id: "a27", workstation_id: "w27", method: "REBA", score: 6, notes: "Alternância entre escritório e área industrial. Caminhada extensa (3km/dia). Agachamento para inspeções. Exposição a diversos agentes ocupacionais durante inspeções.", body_parts: { trunk: 3, neck: 2, legs: 3, upper_arm: 3, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a28", workstation_id: "w28", method: "REBA", score: 5, notes: "Alternância postura em pé e sentada. Flexão de tronco em atendimentos. Risco biológico em curativos. Postura em pé prolongada durante campanhas de vacinação.", body_parts: { trunk: 3, neck: 2, legs: 2, upper_arm: 2, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-15" },
  // Constrular
  { id: "a29", workstation_id: "w30", method: "ROSA", score: 5, notes: "Postura sentada prolongada com digitação intensa. Cadeira sem apoio lombar. Mouse sem apoio de punho. Rotação de tronco frequente para acessar arquivo.", body_parts: { chair: 4, monitor: 3, keyboard: 3, mouse: 3, telephone: 2 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a30", workstation_id: "w31", method: "REBA", score: 5, notes: "Postura em pé prolongada no balcão (>4h). Agachamento para pegar amostras. Elevação de braços para prateleiras altas do showroom. Alternância constante entre posição de pé e terminal PDV.", body_parts: { trunk: 2, neck: 2, legs: 3, upper_arm: 3, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a31", workstation_id: "w32", method: "REBA", score: 4, notes: "Exposição a vibração durante condução. Postura variada entre veículo e visitas. Carregamento de amostras de 8kg. Preenchimento de pedidos em tablet sem apoio.", body_parts: { trunk: 2, neck: 2, legs: 2, upper_arm: 2, lower_arm: 2, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-13" },
  { id: "a32", workstation_id: "w33", method: "ROSA", score: 5, notes: "Postura sentada prolongada com uso intensivo de CAD (>5h). Flexão cervical para plantas impressas. Extensão de punho com mouse durante modelagem. Visitas a obras com terrenos irregulares.", body_parts: { chair: 3, monitor: 4, keyboard: 2, mouse: 4, telephone: 1 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a33", workstation_id: "w34", method: "REBA", score: 6, notes: "Alternância escritório e campo. Agachamento para medições no nível do piso. Extensão cervical para verificar prumos. Exposição a poeira e sol em canteiros de obras.", body_parts: { trunk: 3, neck: 3, legs: 3, upper_arm: 2, lower_arm: 2, wrist: 1 }, analysis_status: "completed", created_at: "2025-02-15" },
  { id: "a34", workstation_id: "w35", method: "REBA", score: 10, notes: "Manuseio de cargas pesadas (cimento 50kg, tubos 6m). Agachamento repetitivo. Elevação acima do ombro. Caminhada contínua (~5km/dia). Exposição a poeira de cimento e materiais granulados.", body_parts: { trunk: 5, neck: 2, legs: 4, upper_arm: 4, lower_arm: 3, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-11" },
  { id: "a35", workstation_id: "w36", method: "REBA", score: 9, notes: "Vibração de corpo inteiro no caminhão. Manuseio de cargas pesadas (argamassa 20kg, cimento 50kg). Subida de escadas com carga em entregas residenciais. Exposição a calor e trânsito.", body_parts: { trunk: 4, neck: 3, legs: 3, upper_arm: 4, lower_arm: 3, wrist: 2 }, analysis_status: "completed", created_at: "2025-02-13" },
];

const riskData: Array<{ probability: number; exposure: number; consequence: number }> = [
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 3, exposure: 6, consequence: 3 },
  { probability: 3, exposure: 6, consequence: 1 },
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 1, exposure: 10, consequence: 1 },
  // Empresa Teste
  { probability: 3, exposure: 10, consequence: 3 },
  { probability: 6, exposure: 10, consequence: 3 },
  { probability: 6, exposure: 6, consequence: 6 },
  { probability: 6, exposure: 6, consequence: 3 },
  { probability: 3, exposure: 6, consequence: 6 },
  { probability: 10, exposure: 6, consequence: 6 },
  // GIN Industrial
  { probability: 6, exposure: 10, consequence: 3 },  // w12 Torneiro
  { probability: 6, exposure: 10, consequence: 6 },  // w13 Fresador
  { probability: 3, exposure: 10, consequence: 3 },  // w14 Retificador
  { probability: 10, exposure: 6, consequence: 15 }, // w15 Soldador - crítico
  { probability: 10, exposure: 6, consequence: 6 },  // w16 Caldeireiro
  { probability: 3, exposure: 10, consequence: 1 },  // w17 Analista Químico
  { probability: 3, exposure: 10, consequence: 1 },  // w18 Cromatografia
  { probability: 1, exposure: 10, consequence: 1 },  // w19 Dev Software
  { probability: 6, exposure: 6, consequence: 3 },   // w20 Infra TI
  { probability: 6, exposure: 6, consequence: 15 },  // w21 Eletricista - risco elétrico
  { probability: 10, exposure: 6, consequence: 6 },  // w22 Mecânico
  { probability: 6, exposure: 10, consequence: 3 },  // w23 Motorista
  { probability: 6, exposure: 6, consequence: 15 },  // w24 Ponte Rolante - risco queda carga
  { probability: 3, exposure: 10, consequence: 1 },  // w25 RH
  { probability: 1, exposure: 10, consequence: 1 },  // w26 Advogado
  { probability: 3, exposure: 6, consequence: 3 },   // w27 TST
  { probability: 3, exposure: 6, consequence: 1 },   // w28 Enfermeiro
  // Constrular
  { probability: 3, exposure: 10, consequence: 1 },  // w30 Aux Contábil
  { probability: 3, exposure: 6, consequence: 1 },   // w31 Assist Comercial
  { probability: 1, exposure: 6, consequence: 1 },   // w32 Vendedor Externo
  { probability: 3, exposure: 10, consequence: 1 },  // w33 Engenheiro
  { probability: 3, exposure: 6, consequence: 3 },   // w34 Técnico Edificações
  { probability: 10, exposure: 6, consequence: 6 },  // w35 Estoquista - crítico
  { probability: 6, exposure: 10, consequence: 6 },  // w36 Motorista Entrega
];

export const mockRiskAssessments: RiskAssessment[] = mockAnalyses.map((a, i) => {
  const d = riskData[i];
  const score = calculateRiskScore(d.probability, d.exposure, d.consequence);
  return {
    id: `r${i + 1}`,
    analysis_id: a.id,
    probability: d.probability,
    exposure: d.exposure,
    consequence: d.consequence,
    risk_score: score,
    risk_level: classifyRisk(score),
    description: a.notes,
    created_at: a.created_at,
  };
});

export const mockActionPlans: ActionPlan[] = [
  { id: "ap1", risk_assessment_id: "r1", description: "Instalar bancada regulável em altura na área da chapa", responsible: "João Silva", deadline: "2025-04-15", status: "in_progress", created_at: "2025-03-02" },
  { id: "ap2", risk_assessment_id: "r2", description: "Reorganizar layout da bancada de sucos para reduzir elevação de braços", responsible: "Maria Santos", deadline: "2025-04-01", status: "approved", created_at: "2025-03-06" },
  { id: "ap3", risk_assessment_id: "r3", description: "Adquirir tapete anti-fadiga para o caixa e ajustar altura da bancada", responsible: "Carlos Lima", deadline: "2025-03-30", status: "completed", created_at: "2025-03-09" },
  { id: "ap4", risk_assessment_id: "r4", description: "Fornecer utensílios de limpeza com cabos longos para reduzir flexão", responsible: "Ana Costa", deadline: "2025-04-20", status: "pending", created_at: "2025-03-13" },
  { id: "ap5", risk_assessment_id: "r5", description: "Adquirir suporte para monitor e cadeira ergonômica com apoio lombar", responsible: "Pedro Souza", deadline: "2025-04-10", status: "approved", created_at: "2025-03-15" },
  // Empresa Teste
  { id: "ap6", risk_assessment_id: "r6", description: "Adquirir headset telefônico e reposicionar monitor frontalmente na recepção", responsible: "Fernanda Oliveira", deadline: "2025-04-15", status: "approved", created_at: "2025-03-12" },
  { id: "ap7", risk_assessment_id: "r7", description: "Substituir mesas por modelos com regulagem de altura. Instalar suporte de monitor e apoio de punho para teclado/mouse", responsible: "Ricardo Mendes", deadline: "2025-04-20", status: "in_progress", created_at: "2025-03-12" },
  { id: "ap8", risk_assessment_id: "r8", description: "Instalar mesa elevatória para peças ao lado do torno. Adquirir plataforma anti-fadiga. Reorganizar magazine de ferramentas para altura acessível", responsible: "Marcos Pereira", deadline: "2025-05-01", status: "pending", created_at: "2025-03-14" },
  { id: "ap9", risk_assessment_id: "r9", description: "Implantar rodízio de tarefas a cada 2h. Adquirir parafusadeira com contratorque. Instalar apoio de braço na bancada", responsible: "Juliana Ramos", deadline: "2025-04-25", status: "approved", created_at: "2025-03-14" },
  { id: "ap10", risk_assessment_id: "r10", description: "Instalar câmera de ré na empilhadeira. Programar manutenção do piso do galpão. Adquirir assento com amortecimento pneumático", responsible: "Carlos Eduardo", deadline: "2025-05-10", status: "pending", created_at: "2025-03-16" },
  { id: "ap11", risk_assessment_id: "r11", description: "Reorganizar estantes: itens pesados entre 0,7m e 1,3m. Adquirir carrinho plataforma para transporte. Implementar pausas programadas a cada 90 min. Instalar tapete anti-fadiga nos corredores", responsible: "Tatiana Souza", deadline: "2025-05-15", status: "in_progress", created_at: "2025-03-16" },
  // GIN Industrial
  { id: "ap12", risk_assessment_id: "r12", description: "Instalar mesa elevatória para peças ao lado do torno. Adquirir tapete anti-fadiga. Fornecer protetor auricular moldado", responsible: "Eng. Paulo Costa", deadline: "2025-04-30", status: "approved", created_at: "2025-02-12" },
  { id: "ap13", risk_assessment_id: "r13", description: "Adquirir talha pneumática para movimentação de peças >10kg. Instalar exaustão localizada para névoa de fluido. Rodízio de atividades entre usinagem e rebarbação", responsible: "Eng. Paulo Costa", deadline: "2025-05-15", status: "pending", created_at: "2025-02-12" },
  { id: "ap14", risk_assessment_id: "r14", description: "Elevar bancada de medição para altura ergonômica. Adquirir lupa com iluminação LED para inspeção", responsible: "Eng. Paulo Costa", deadline: "2025-04-15", status: "completed", created_at: "2025-02-14" },
  { id: "ap15", risk_assessment_id: "r15", description: "URGENTE: Instalar mesa posicionadora giratória para eliminar soldagem sobre-cabeça. Adquirir exaustão com braço articulado. Fornecer máscara de solda com ventilação forçada. Implementar pausas obrigatórias de 10min/hora", responsible: "Coord. André Moreira", deadline: "2025-03-30", status: "in_progress", created_at: "2025-02-12" },
  { id: "ap16", risk_assessment_id: "r16", description: "Adquirir ponte rolante de 3 ton para galpão de caldeiraria. Instalar ventilação geral diluidora. Fornecer protetor auricular duplo. Treinar técnica de levantamento NR-17", responsible: "Coord. André Moreira", deadline: "2025-05-30", status: "pending", created_at: "2025-02-14" },
  { id: "ap17", risk_assessment_id: "r17", description: "Substituir bancada de pesagem por modelo com regulagem. Calibrar exaustão da capela. Adquirir pipetadores automáticos para eliminar pipetagem bucal", responsible: "Dra. Lúcia Andrade", deadline: "2025-04-20", status: "approved", created_at: "2025-02-16" },
  { id: "ap18", risk_assessment_id: "r18", description: "Adquirir cadeira ergonômica com apoio lombar e braços. Instalar suporte para documentos", responsible: "Dra. Lúcia Andrade", deadline: "2025-04-10", status: "completed", created_at: "2025-02-16" },
  { id: "ap19", risk_assessment_id: "r19", description: "Boa estação ergonômica existente. Recomendar micropausas a cada 50min via software de alerta. Orientar alongamentos", responsible: "TST Roberto Lima", deadline: "2025-03-30", status: "completed", created_at: "2025-02-12" },
  { id: "ap20", risk_assessment_id: "r20", description: "Adquirir carrinho com ajuste de altura para manutenção de racks. Instalar escada dobrável com plataforma. Fornecer joelheira ergonômica", responsible: "TST Roberto Lima", deadline: "2025-04-30", status: "approved", created_at: "2025-02-14" },
  { id: "ap21", risk_assessment_id: "r21", description: "URGENTE: Revisar procedimento NR-10 de bloqueio e etiquetagem. Adquirir plataforma isolada para trabalho em painéis. Instalar iluminação de emergência nos CCMs. Fornecer luvas classe 2", responsible: "Eng. Roberto Lima", deadline: "2025-03-30", status: "in_progress", created_at: "2025-02-16" },
  { id: "ap22", risk_assessment_id: "r22", description: "Adquirir guindaste de oficina 1 ton. Instalar pit para manutenção sob esteiras. Fornecer EPI anti-vibração. Implementar ginástica laboral diária", responsible: "Coord. André Moreira", deadline: "2025-05-30", status: "pending", created_at: "2025-02-16" },
  { id: "ap23", risk_assessment_id: "r23", description: "Instalar assento com suspensão pneumática na carreta. Implementar pausa de 30min a cada 4h de condução. Fornecer prancha de lombar para alongamento", responsible: "TST Roberto Lima", deadline: "2025-04-30", status: "approved", created_at: "2025-02-18" },
  { id: "ap24", risk_assessment_id: "r24", description: "Inspecionar cabos e ganchos semanalmente. Instalar sensor de sobrecarga na ponte rolante. Demarcar zona de exclusão durante movimentação. Treinamento NR-11 semestral", responsible: "Eng. Roberto Lima", deadline: "2025-04-15", status: "in_progress", created_at: "2025-02-18" },
  { id: "ap25", risk_assessment_id: "r25", description: "Substituir cadeira por modelo com apoio lombar e braços reguláveis. Adquirir apoio de punho para mouse", responsible: "TST Roberto Lima", deadline: "2025-04-10", status: "completed", created_at: "2025-02-12" },
  { id: "ap26", risk_assessment_id: "r26", description: "Recomendar pausas regulares. Adquirir suporte para livros. Orientar ergonomia de escritório", responsible: "TST Roberto Lima", deadline: "2025-04-10", status: "completed", created_at: "2025-02-14" },
  { id: "ap27", risk_assessment_id: "r27", description: "Fornecer calçado de segurança com palmilha anatômica. Organizar kit de campo ergonômico. Implementar rodízio entre inspeção de campo e escritório", responsible: "Coord. André Moreira", deadline: "2025-04-20", status: "approved", created_at: "2025-02-16" },
  { id: "ap28", risk_assessment_id: "r28", description: "Adquirir maca com regulagem de altura. Instalar dispenser de álcool gel em altura ergonômica. Fornecer banqueta alta para atendimentos prolongados", responsible: "Dra. Lúcia Andrade", deadline: "2025-04-15", status: "approved", created_at: "2025-02-16" },
];

export const mockPsychosocialAnalyses: PsychosocialAnalysis[] = [
  {
    id: "psa1",
    company_id: "comp1",
    workstation_id: "w1",
    evaluator_name: "Dr. Marco Gomes",
    nasa_tlx_score: 62,
    nasa_tlx_details: { mental_demand: 55, physical_demand: 80, temporal_demand: 70, performance: 40, effort: 65, frustration: 60 },
    hse_it_score: 3.2,
    hse_it_details: { demands: 3.5, control: 2.8, support: 3.0, relationships: 3.5, role: 3.0, change: 3.4 },
    copenhagen_score: 58,
    copenhagen_details: { quantitative_demands: 65, work_pace: 70, cognitive_demands: 50, emotional_demands: 45, influence: 40, possibilities_development: 55, meaning_work: 70, commitment: 65, predictability: 50, social_support: 60 },
    observations: "Trabalhadores relatam alta demanda física e pressão temporal durante horários de pico.",
    created_at: "2025-03-10",
  },
  {
    id: "psa2",
    company_id: "comp1",
    workstation_id: "w3",
    evaluator_name: "Dr. Marco Gomes",
    nasa_tlx_score: 48,
    nasa_tlx_details: { mental_demand: 60, physical_demand: 30, temporal_demand: 55, performance: 50, effort: 45, frustration: 50 },
    hse_it_score: 3.8,
    hse_it_details: { demands: 3.2, control: 4.0, support: 4.0, relationships: 4.0, role: 3.8, change: 3.8 },
    copenhagen_score: 42,
    copenhagen_details: { quantitative_demands: 50, work_pace: 55, cognitive_demands: 45, emotional_demands: 35, influence: 50, possibilities_development: 40, meaning_work: 60, commitment: 55, predictability: 55, social_support: 65 },
    observations: "Demanda mental moderada. Bom suporte organizacional.",
    created_at: "2025-03-12",
  },
  // Empresa Teste
  {
    id: "psa3",
    company_id: "comp3",
    workstation_id: "w8",
    evaluator_name: "Dra. Carla Ferreira",
    nasa_tlx_score: 72,
    nasa_tlx_details: { mental_demand: 70, physical_demand: 85, temporal_demand: 75, performance: 55, effort: 78, frustration: 68 },
    hse_it_score: 2.8,
    hse_it_details: { demands: 4.2, control: 2.5, support: 2.6, relationships: 3.0, role: 2.5, change: 2.0 },
    copenhagen_score: 68,
    copenhagen_details: { quantitative_demands: 75, work_pace: 80, cognitive_demands: 65, emotional_demands: 50, influence: 30, possibilities_development: 45, meaning_work: 60, commitment: 55, predictability: 40, social_support: 50 },
    observations: "Alta demanda física e mental. Operadores relatam pressão por produtividade e falta de autonomia para pausas. Ruído elevado dificulta comunicação.",
    created_at: "2025-03-14",
  },
  {
    id: "psa4",
    company_id: "comp3",
    workstation_id: "w11",
    evaluator_name: "Dra. Carla Ferreira",
    nasa_tlx_score: 78,
    nasa_tlx_details: { mental_demand: 45, physical_demand: 90, temporal_demand: 85, performance: 60, effort: 88, frustration: 75 },
    hse_it_score: 2.5,
    hse_it_details: { demands: 4.5, control: 2.0, support: 2.5, relationships: 2.8, role: 2.2, change: 1.8 },
    copenhagen_score: 74,
    copenhagen_details: { quantitative_demands: 85, work_pace: 90, cognitive_demands: 40, emotional_demands: 55, influence: 20, possibilities_development: 30, meaning_work: 50, commitment: 45, predictability: 35, social_support: 40 },
    observations: "Demanda física extrema com metas de separação agressivas. Trabalhadores relatam fadiga crônica, dores musculares e insatisfação com ritmo imposto. Rotatividade alta no setor.",
    created_at: "2025-03-15",
  },
  // GIN Industrial
  {
    id: "psa5", company_id: "comp4", workstation_id: "w15",
    evaluator_name: "Dr. Henrique Nogueira",
    nasa_tlx_score: 82,
    nasa_tlx_details: { mental_demand: 60, physical_demand: 95, temporal_demand: 80, performance: 65, effort: 90, frustration: 78 },
    hse_it_score: 2.2,
    hse_it_details: { demands: 4.8, control: 2.0, support: 2.2, relationships: 2.5, role: 2.0, change: 1.5 },
    copenhagen_score: 78,
    copenhagen_details: { quantitative_demands: 85, work_pace: 90, cognitive_demands: 55, emotional_demands: 60, influence: 15, possibilities_development: 25, meaning_work: 55, commitment: 40, predictability: 30, social_support: 35 },
    observations: "Soldadores relatam dor lombar crônica, irritação ocular frequente e fadiga extrema. Pressão por produtividade com metas diárias de metros lineares de solda. Turnos de 10h com hora extra obrigatória.",
    created_at: "2025-02-12",
  },
  {
    id: "psa6", company_id: "comp4", workstation_id: "w22",
    evaluator_name: "Dr. Henrique Nogueira",
    nasa_tlx_score: 75,
    nasa_tlx_details: { mental_demand: 65, physical_demand: 88, temporal_demand: 78, performance: 58, effort: 82, frustration: 72 },
    hse_it_score: 2.6,
    hse_it_details: { demands: 4.3, control: 2.5, support: 2.8, relationships: 3.0, role: 2.3, change: 2.0 },
    copenhagen_score: 70,
    copenhagen_details: { quantitative_demands: 80, work_pace: 75, cognitive_demands: 60, emotional_demands: 55, influence: 25, possibilities_development: 35, meaning_work: 60, commitment: 50, predictability: 40, social_support: 45 },
    observations: "Mecânicos relatam dores articulares e problemas respiratórios por exposição a graxas e solventes. Chamados de emergência geram estresse e insegurança. Falta de reconhecimento profissional.",
    created_at: "2025-02-16",
  },
  {
    id: "psa7", company_id: "comp4", workstation_id: "w19",
    evaluator_name: "Dr. Henrique Nogueira",
    nasa_tlx_score: 55,
    nasa_tlx_details: { mental_demand: 80, physical_demand: 15, temporal_demand: 65, performance: 45, effort: 55, frustration: 45 },
    hse_it_score: 3.5,
    hse_it_details: { demands: 3.8, control: 3.5, support: 3.5, relationships: 3.8, role: 3.2, change: 3.0 },
    copenhagen_score: 48,
    copenhagen_details: { quantitative_demands: 55, work_pace: 50, cognitive_demands: 85, emotional_demands: 30, influence: 60, possibilities_development: 70, meaning_work: 75, commitment: 70, predictability: 55, social_support: 65 },
    observations: "Alta demanda cognitiva mas boa autonomia. Desenvolvedores valorizam home office parcial. Queixa de sedentarismo e dor cervical. Boa satisfação geral.",
    created_at: "2025-02-12",
  },
  {
    id: "psa8", company_id: "comp4", workstation_id: "w21",
    evaluator_name: "Dr. Henrique Nogueira",
    nasa_tlx_score: 70,
    nasa_tlx_details: { mental_demand: 72, physical_demand: 78, temporal_demand: 70, performance: 50, effort: 75, frustration: 65 },
    hse_it_score: 2.8,
    hse_it_details: { demands: 4.0, control: 2.8, support: 2.5, relationships: 3.2, role: 2.5, change: 2.2 },
    copenhagen_score: 65,
    copenhagen_details: { quantitative_demands: 70, work_pace: 65, cognitive_demands: 75, emotional_demands: 60, influence: 30, possibilities_development: 40, meaning_work: 65, commitment: 55, predictability: 35, social_support: 50 },
    observations: "Eletricistas relatam ansiedade com risco elétrico. Trabalho em altura gera medo mesmo com EPIs. Chamados de emergência interrompem planejamento. Reconhecimento insuficiente do risco da função.",
    created_at: "2025-02-16",
  },
];

export const mockReports: Report[] = [
  { id: "rp1", company_id: "comp1", type: "AEP", title: "Avaliação Ergonômica Preliminar - Cozinha", content: "Avaliação preliminar dos postos de trabalho do setor de cozinha...", sector_id: "s1", workstation_id: "w1", created_at: "2025-03-01" },
  { id: "rp2", company_id: "comp1", type: "AET", title: "Análise Ergonômica do Trabalho - Atendimento", content: "Análise detalhada das condições ergonômicas do setor de atendimento...", sector_id: "s2", workstation_id: "w3", created_at: "2025-03-05" },
];

export function getRiskDistribution() {
  const dist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  mockRiskAssessments.forEach((r) => dist[r.risk_level]++);
  return dist;
}

export function getPhotoCountForWorkstation(workstationId: string): number {
  return mockPosturePhotos.filter((p) => p.workstation_id === workstationId).length;
}
