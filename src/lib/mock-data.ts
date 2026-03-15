import type { Sector, Workstation, Analysis, RiskAssessment, ActionPlan, Report, RiskLevel, Company, PosturePhoto, Task, PsychosocialAnalysis, PostureAnalysis } from "./types";
import { calculateRiskScore, classifyRisk } from "./types";

export const mockCompanies: Company[] = [
  { id: "comp1", name: "Yello Sucos & Lanches", cnpj: "31.643.918/0001-82", address: "Rua das Flores, 150", city: "Fortaleza", state: "CE", description: "Empresa do ramo alimentício especializada em sucos naturais e lanches", created_at: "2025-01-01" },
  { id: "comp2", name: "MedTraum Saúde Ocupacional", cnpj: "98.765.432/0001-10", address: "Av. Santos Dumont, 500", city: "Fortaleza", state: "CE", description: "Clínica de saúde ocupacional e medicina do trabalho", created_at: "2025-01-10" },
  { id: "comp3", name: "Empresa Teste Ltda", cnpj: "12.345.678/0001-90", address: "Rua Principal, 100", city: "São Paulo", state: "SP", description: "Empresa de teste para validação de relatórios AET completos com múltiplos setores e postos de trabalho", created_at: "2025-02-01" },
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
