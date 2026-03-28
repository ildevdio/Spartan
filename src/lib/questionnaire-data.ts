// Questionnaire definitions for all 4 instruments

export type QuestionnaireType = "nasa-tlx" | "hse-it" | "copsoq-ii" | "jss";

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  dimension: string;
}

export interface QuestionnaireScale {
  value: number;
  label: string;
}

export interface QuestionnaireDef {
  type: QuestionnaireType;
  label: string;
  description: string;
  instructions: string;
  scales: QuestionnaireScale[];
  dimensions: { label: string; questions: QuestionnaireQuestion[] }[];
}

// ─── NASA-TLX ──────────────────────────────────────────
const nasaTlxDimensions = [
  {
    label: "Demanda Mental",
    questions: [
      { id: "nasa_mental", text: "Quanta atividade mental e perceptiva foi exigida? (ex.: pensar, decidir, calcular, lembrar, pesquisar)", dimension: "Demanda Mental" },
    ],
  },
  {
    label: "Demanda Física",
    questions: [
      { id: "nasa_physical", text: "Quanta atividade física foi exigida? (ex.: empurrar, puxar, girar, controlar, ativar)", dimension: "Demanda Física" },
    ],
  },
  {
    label: "Demanda Temporal",
    questions: [
      { id: "nasa_temporal", text: "Quanta pressão de tempo você sentiu? O ritmo da tarefa foi acelerado ou lento?", dimension: "Demanda Temporal" },
    ],
  },
  {
    label: "Performance",
    questions: [
      { id: "nasa_performance", text: "Quão bem-sucedido você se sentiu na realização da tarefa?", dimension: "Performance" },
    ],
  },
  {
    label: "Esforço",
    questions: [
      { id: "nasa_effort", text: "Quanto esforço (mental + físico) foi necessário para atingir seu nível de desempenho?", dimension: "Esforço" },
    ],
  },
  {
    label: "Frustração",
    questions: [
      { id: "nasa_frustration", text: "Quão inseguro, desencorajado, irritado, estressado e incomodado você se sentiu?", dimension: "Frustração" },
    ],
  },
];

const nasaTlxScales: QuestionnaireScale[] = [
  { value: 0, label: "0 — Muito Baixo" },
  { value: 20, label: "20 — Baixo" },
  { value: 40, label: "40 — Moderado" },
  { value: 60, label: "60 — Alto" },
  { value: 80, label: "80 — Muito Alto" },
  { value: 100, label: "100 — Extremo" },
];

// ─── HSE-IT ──────────────────────────────────────────
const hseItDimensions = [
  {
    label: "Demandas",
    questions: [
      { id: "hse_d1", text: "Pessoas diferentes no trabalho me pedem coisas difíceis de combinar", dimension: "Demandas" },
      { id: "hse_d2", text: "Tenho prazos impossíveis de cumprir", dimension: "Demandas" },
      { id: "hse_d3", text: "Preciso trabalhar muito intensamente", dimension: "Demandas" },
      { id: "hse_d4", text: "Preciso negligenciar algumas tarefas porque tenho muito a fazer", dimension: "Demandas" },
      { id: "hse_d5", text: "Não consigo fazer pausas suficientes", dimension: "Demandas" },
      { id: "hse_d6", text: "Sou pressionado a trabalhar longas horas", dimension: "Demandas" },
      { id: "hse_d7", text: "Sinto que preciso trabalhar muito rápido", dimension: "Demandas" },
      { id: "hse_d8", text: "Tenho pressões de tempo irrealistas", dimension: "Demandas" },
    ],
  },
  {
    label: "Controle",
    questions: [
      { id: "hse_c1", text: "Posso decidir quando fazer uma pausa", dimension: "Controle" },
      { id: "hse_c2", text: "Tenho voz ativa sobre a velocidade do meu trabalho", dimension: "Controle" },
      { id: "hse_c3", text: "Tenho liberdade para decidir como fazer meu trabalho", dimension: "Controle" },
      { id: "hse_c4", text: "Tenho voz ativa sobre o que faço no trabalho", dimension: "Controle" },
      { id: "hse_c5", text: "Meus horários de trabalho podem ser flexíveis", dimension: "Controle" },
      { id: "hse_c6", text: "Posso decidir a hora de iniciar uma tarefa", dimension: "Controle" },
    ],
  },
  {
    label: "Suporte de Gestão",
    questions: [
      { id: "hse_sg1", text: "Recebo apoio suficiente do meu gestor", dimension: "Suporte de Gestão" },
      { id: "hse_sg2", text: "Posso contar com meu gestor quando tenho problemas", dimension: "Suporte de Gestão" },
      { id: "hse_sg3", text: "Recebo feedback sobre o meu trabalho", dimension: "Suporte de Gestão" },
      { id: "hse_sg4", text: "Meu gestor me encoraja no trabalho", dimension: "Suporte de Gestão" },
      { id: "hse_sg5", text: "Tenho oportunidade de discutir problemas com meu gestor", dimension: "Suporte de Gestão" },
    ],
  },
  {
    label: "Relacionamentos",
    questions: [
      { id: "hse_r1", text: "Sofro assédio na forma de palavras ou comportamentos indelicados", dimension: "Relacionamentos" },
      { id: "hse_r2", text: "Há atritos e raiva entre colegas", dimension: "Relacionamentos" },
      { id: "hse_r3", text: "Sou alvo de bullying no trabalho", dimension: "Relacionamentos" },
      { id: "hse_r4", text: "As relações no trabalho são tensas", dimension: "Relacionamentos" },
    ],
  },
  {
    label: "Papel",
    questions: [
      { id: "hse_p1", text: "Tenho clareza sobre o que se espera de mim no trabalho", dimension: "Papel" },
      { id: "hse_p2", text: "Sei como fazer meu trabalho", dimension: "Papel" },
      { id: "hse_p3", text: "Tenho clareza sobre meus deveres e responsabilidades", dimension: "Papel" },
      { id: "hse_p4", text: "Entendo como meu trabalho se encaixa no objetivo geral da organização", dimension: "Papel" },
      { id: "hse_p5", text: "Tenho clareza sobre os objetivos do meu departamento", dimension: "Papel" },
    ],
  },
  {
    label: "Mudança",
    questions: [
      { id: "hse_m1", text: "Tenho oportunidade suficiente de questionar gestores sobre mudanças", dimension: "Mudança" },
      { id: "hse_m2", text: "O pessoal é sempre consultado sobre mudanças no trabalho", dimension: "Mudança" },
      { id: "hse_m3", text: "Quando ocorrem mudanças, tenho clareza de como funcionarão na prática", dimension: "Mudança" },
    ],
  },
];

const hseItScales: QuestionnaireScale[] = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

// ─── COPSOQ II ──────────────────────────────────────────
const copsoqDimensions = [
  {
    label: "Demandas Quantitativas",
    questions: [
      { id: "cop_dq1", text: "A sua carga de trabalho se acumula por ser mal distribuída?", dimension: "Demandas Quantitativas" },
      { id: "cop_dq2", text: "Com que frequência você não tem tempo para completar todas as tarefas?", dimension: "Demandas Quantitativas" },
      { id: "cop_dq3", text: "Você consegue fazer o seu trabalho com calma e terminá-lo?", dimension: "Demandas Quantitativas" },
    ],
  },
  {
    label: "Ritmo de Trabalho",
    questions: [
      { id: "cop_rt1", text: "Você precisa trabalhar muito rapidamente?", dimension: "Ritmo de Trabalho" },
      { id: "cop_rt2", text: "O seu trabalho exige que você trabalhe num ritmo acelerado?", dimension: "Ritmo de Trabalho" },
    ],
  },
  {
    label: "Demandas Cognitivas",
    questions: [
      { id: "cop_dc1", text: "O seu trabalho exige muita concentração?", dimension: "Demandas Cognitivas" },
      { id: "cop_dc2", text: "O seu trabalho exige que você se lembre de muitas coisas?", dimension: "Demandas Cognitivas" },
      { id: "cop_dc3", text: "O seu trabalho exige que você tome decisões difíceis?", dimension: "Demandas Cognitivas" },
      { id: "cop_dc4", text: "O seu trabalho exige que você proponha novas ideias?", dimension: "Demandas Cognitivas" },
    ],
  },
  {
    label: "Demandas Emocionais",
    questions: [
      { id: "cop_de1", text: "O seu trabalho o coloca em situações emocionalmente perturbadoras?", dimension: "Demandas Emocionais" },
      { id: "cop_de2", text: "Você tem que se relacionar com os problemas pessoais de outras pessoas como parte do seu trabalho?", dimension: "Demandas Emocionais" },
      { id: "cop_de3", text: "O seu trabalho é emocionalmente exigente?", dimension: "Demandas Emocionais" },
    ],
  },
  {
    label: "Influência no Trabalho",
    questions: [
      { id: "cop_it1", text: "Você tem grande grau de influência sobre o seu trabalho?", dimension: "Influência no Trabalho" },
      { id: "cop_it2", text: "Você pode influenciar a quantidade de trabalho que lhe é atribuída?", dimension: "Influência no Trabalho" },
      { id: "cop_it3", text: "Você tem voz ativa sobre o que faz no trabalho?", dimension: "Influência no Trabalho" },
    ],
  },
  {
    label: "Possibilidades de Desenvolvimento",
    questions: [
      { id: "cop_pd1", text: "O seu trabalho lhe dá oportunidade de desenvolver suas competências?", dimension: "Possibilidades de Desenvolvimento" },
      { id: "cop_pd2", text: "Você pode usar suas habilidades ou experiências no seu trabalho?", dimension: "Possibilidades de Desenvolvimento" },
      { id: "cop_pd3", text: "O seu trabalho lhe dá a oportunidade de aprender coisas novas?", dimension: "Possibilidades de Desenvolvimento" },
    ],
  },
  {
    label: "Significado do Trabalho",
    questions: [
      { id: "cop_st1", text: "O seu trabalho tem significado para você?", dimension: "Significado do Trabalho" },
      { id: "cop_st2", text: "Você sente que o trabalho que faz é importante?", dimension: "Significado do Trabalho" },
      { id: "cop_st3", text: "Você se sente motivado e envolvido com o seu trabalho?", dimension: "Significado do Trabalho" },
    ],
  },
  {
    label: "Compromisso com o Local",
    questions: [
      { id: "cop_cl1", text: "Você gosta de contar a outras pessoas sobre o seu local de trabalho?", dimension: "Compromisso com o Local" },
      { id: "cop_cl2", text: "Você sente que os problemas do seu local de trabalho são seus também?", dimension: "Compromisso com o Local" },
      { id: "cop_cl3", text: "Você gostaria de continuar trabalhando no seu local atual?", dimension: "Compromisso com o Local" },
    ],
  },
  {
    label: "Previsibilidade",
    questions: [
      { id: "cop_pr1", text: "No seu trabalho, você é informado com antecedência sobre decisões importantes?", dimension: "Previsibilidade" },
      { id: "cop_pr2", text: "Você recebe toda a informação de que necessita para fazer bem o seu trabalho?", dimension: "Previsibilidade" },
    ],
  },
  {
    label: "Suporte Social de Colegas",
    questions: [
      { id: "cop_ss1", text: "Com que frequência você recebe ajuda e apoio dos seus colegas?", dimension: "Suporte Social de Colegas" },
      { id: "cop_ss2", text: "Com que frequência os seus colegas estão dispostos a ouvi-lo sobre seus problemas de trabalho?", dimension: "Suporte Social de Colegas" },
      { id: "cop_ss3", text: "Com que frequência os seus colegas falam consigo sobre o quão bem você executa o trabalho?", dimension: "Suporte Social de Colegas" },
    ],
  },
];

const copsoqScales: QuestionnaireScale[] = [
  { value: 5, label: "Sempre / Muito" },
  { value: 4, label: "Frequentemente" },
  { value: 3, label: "Às vezes" },
  { value: 2, label: "Raramente" },
  { value: 1, label: "Nunca / Quase nunca" },
];

// ─── JSS ──────────────────────────────────────────
const jssDimensions = [
  {
    label: "Demanda Psicológica",
    questions: [
      { id: "jss_d1", text: "Seu trabalho exige que você trabalhe muito rapidamente?", dimension: "Demanda Psicológica" },
      { id: "jss_d2", text: "Seu trabalho exige que você trabalhe muito?", dimension: "Demanda Psicológica" },
      { id: "jss_d3", text: "Seu trabalho exige muito esforço?", dimension: "Demanda Psicológica" },
      { id: "jss_d4", text: "Você tem tempo suficiente para fazer tudo?", dimension: "Demanda Psicológica" },
      { id: "jss_d5", text: "Seu trabalho envolve muitas exigências contraditórias?", dimension: "Demanda Psicológica" },
    ],
  },
  {
    label: "Controle sobre o Trabalho",
    questions: [
      { id: "jss_c1", text: "Você tem a possibilidade de aprender coisas novas no trabalho?", dimension: "Controle sobre o Trabalho" },
      { id: "jss_c2", text: "Seu trabalho exige muita habilidade ou conhecimentos especializados?", dimension: "Controle sobre o Trabalho" },
      { id: "jss_c3", text: "Seu trabalho exige que você tome iniciativas?", dimension: "Controle sobre o Trabalho" },
      { id: "jss_c4", text: "No seu trabalho, você tem que repetir muitas vezes as mesmas tarefas?", dimension: "Controle sobre o Trabalho" },
      { id: "jss_c5", text: "Você pode escolher como fazer o seu trabalho?", dimension: "Controle sobre o Trabalho" },
      { id: "jss_c6", text: "Você pode escolher o que fazer no seu trabalho?", dimension: "Controle sobre o Trabalho" },
    ],
  },
  {
    label: "Suporte Social",
    questions: [
      { id: "jss_s1", text: "Existe um bom espírito de equipe no seu ambiente de trabalho?", dimension: "Suporte Social" },
      { id: "jss_s2", text: "No trabalho, eu me relaciono bem com meus chefes?", dimension: "Suporte Social" },
      { id: "jss_s3", text: "Eu gosto de trabalhar com meus colegas?", dimension: "Suporte Social" },
      { id: "jss_s4", text: "No trabalho, eu me sinto parte de um grupo?", dimension: "Suporte Social" },
      { id: "jss_s5", text: "As pessoas com quem eu trabalho são amigáveis?", dimension: "Suporte Social" },
      { id: "jss_s6", text: "Meu(s) chefe(s) se preocupa(m) com o bem-estar dos funcionários?", dimension: "Suporte Social" },
    ],
  },
];

const jssScales: QuestionnaireScale[] = [
  { value: 1, label: "Discordo muito" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Concordo" },
  { value: 4, label: "Concordo muito" },
];

// ─── Export all questionnaires ──────────────────────────
export const QUESTIONNAIRE_DEFS: Record<QuestionnaireType, QuestionnaireDef> = {
  "nasa-tlx": {
    type: "nasa-tlx",
    label: "NASA-TLX",
    description: "Índice de Carga de Trabalho — 6 dimensões",
    instructions: "Para cada dimensão abaixo, selecione o valor que melhor represente sua percepção sobre a tarefa avaliada. 0 = Muito Baixo, 100 = Muito Alto. Para 'Performance', 0 = Perfeito (bom) e 100 = Fracasso (ruim).",
    scales: nasaTlxScales,
    dimensions: nasaTlxDimensions,
  },
  "hse-it": {
    type: "hse-it",
    label: "HSE-IT",
    description: "Indicadores de Estresse Ocupacional — 6 dimensões",
    instructions: "Para cada afirmação, selecione a opção que melhor descreve sua situação de trabalho.",
    scales: hseItScales,
    dimensions: hseItDimensions,
  },
  "copsoq-ii": {
    type: "copsoq-ii",
    label: "COPSOQ II",
    description: "Questionário Psicossocial de Copenhagen — 10 dimensões",
    instructions: "Indique a frequência com que cada afirmação se aplica à sua situação de trabalho.",
    scales: copsoqScales,
    dimensions: copsoqDimensions,
  },
  jss: {
    type: "jss",
    label: "JSS (Karasek)",
    description: "Job Stress Scale — Demanda-Controle-Suporte",
    instructions: "Para cada afirmação, selecione a opção que melhor representa sua situação no trabalho.",
    scales: jssScales,
    dimensions: jssDimensions,
  },
};

export function calculateScores(
  type: QuestionnaireType,
  responses: Record<string, number>
): { dimensionScores: Record<string, number>; totalScore: number } {
  const def = QUESTIONNAIRE_DEFS[type];
  const dimensionScores: Record<string, number> = {};
  let totalSum = 0;
  let totalCount = 0;

  for (const dim of def.dimensions) {
    let dimSum = 0;
    let dimCount = 0;
    for (const q of dim.questions) {
      if (responses[q.id] !== undefined) {
        dimSum += responses[q.id];
        dimCount++;
      }
    }
    if (dimCount > 0) {
      if (type === "nasa-tlx") {
        dimensionScores[dim.label] = Math.round(dimSum / dimCount);
      } else if (type === "copsoq-ii") {
        // Normalize to 0-100
        const maxPerQ = 5;
        dimensionScores[dim.label] = Math.round((dimSum / (dimCount * maxPerQ)) * 100);
      } else {
        dimensionScores[dim.label] = Math.round((dimSum / dimCount) * 10) / 10;
      }
      totalSum += dimSum;
      totalCount += dimCount;
    }
  }

  let totalScore = 0;
  if (type === "nasa-tlx") {
    totalScore = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;
  } else if (type === "copsoq-ii") {
    const maxPerQ = 5;
    totalScore = totalCount > 0 ? Math.round((totalSum / (totalCount * maxPerQ)) * 100) : 0;
  } else {
    totalScore = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 0;
  }

  return { dimensionScores, totalScore };
}
