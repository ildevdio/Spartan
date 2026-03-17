import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { Printer, FileText, Building2 } from "lucide-react";
import { toast } from "sonner";

type QuestionnaireType = "nasa-tlx" | "hse-it" | "copsoq-ii" | "jss";

const QUESTIONNAIRES: { type: QuestionnaireType; label: string; description: string }[] = [
  { type: "nasa-tlx", label: "NASA-TLX", description: "Índice de Carga de Trabalho — 6 dimensões" },
  { type: "hse-it", label: "HSE-IT", description: "Indicadores de Estresse Ocupacional — 6 dimensões" },
  { type: "copsoq-ii", label: "COPSOQ II", description: "Questionário Psicossocial de Copenhagen — 10 dimensões" },
  { type: "jss", label: "JSS (Karasek)", description: "Job Stress Scale — Demanda-Controle-Suporte" },
];

function generatePrintHTML(
  type: QuestionnaireType,
  companyName: string,
  evaluator: string,
  workstationName: string,
  date: string
): string {
  const headerStyle = `
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.5; margin: 30px; }
    .header { text-align: center; border-bottom: 3px solid #0A1F44; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; color: #0A1F44; margin: 0; }
    .header h2 { font-size: 14px; color: #1565C0; margin: 4px 0 0; }
    .header .logo { height: 40px; margin-bottom: 8px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; border: 1px solid #ccc; padding: 10px; border-radius: 6px; }
    .meta div { flex: 1; }
    .meta label { font-weight: bold; color: #0A1F44; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
    .section { background: #0A1F44; color: white; padding: 8px 14px; margin: 20px 0 10px; border-radius: 4px; font-size: 13px; font-weight: bold; }
    .instructions { background: #E3F2FD; border-left: 4px solid #1565C0; padding: 10px 14px; margin: 10px 0 15px; font-size: 11px; color: #0A1F44; border-radius: 0 4px 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #0A1F44; color: white; padding: 8px 10px; font-size: 11px; text-align: center; border: 1px solid #0A1F44; }
    td { padding: 8px 10px; font-size: 12px; border: 1px solid #B0BEC5; }
    tr:nth-child(even) td { background: #f8fafc; }
    .scale-header { background: #1565C0; color: white; font-size: 10px; text-align: center; padding: 6px; }
    .radio-col { text-align: center; width: 50px; }
    .radio-col input { width: 16px; height: 16px; }
    .score-box { border: 2px solid #0A1F44; padding: 15px; margin: 20px 0; border-radius: 6px; }
    .score-box h3 { margin: 0 0 10px; color: #0A1F44; }
    .score-line { display: flex; align-items: center; gap: 10px; margin: 5px 0; }
    .score-line label { flex: 1; font-size: 12px; }
    .score-line .blank { border-bottom: 1px solid #333; width: 80px; height: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .sig { text-align: center; margin-top: 40px; }
    .sig-line { border-top: 1px solid #333; width: 250px; margin: 0 auto 5px; }
    @media print { body { margin: 15mm; } .no-print { display: none !important; } }
    @page { margin: 15mm; }
  `;

  const metaBlock = `
    <div class="header">
      <img src="/mg-consult-logo.png" alt="MG Consult" class="logo" onerror="this.style.display='none'" />
      <h1>${getTitle(type)}</h1>
      <h2>MG Consultoria — Ergonomia & Segurança do Trabalho</h2>
    </div>
    <div class="meta">
      <div><label>Empresa</label>${companyName}</div>
      <div><label>Posto/Setor</label>${workstationName || "Geral"}</div>
      <div><label>Avaliador</label>${evaluator || "_______________"}</div>
      <div><label>Data</label>${date}</div>
    </div>
  `;

  let body = "";

  switch (type) {
    case "nasa-tlx":
      body = generateNasaTlxForm();
      break;
    case "hse-it":
      body = generateHseItForm();
      break;
    case "copsoq-ii":
      body = generateCopsoqForm();
      break;
    case "jss":
      body = generateJssForm();
      break;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${getTitle(type)}</title><style>${headerStyle}</style></head><body>${metaBlock}${body}
    <div class="sig">
      <div class="sig-line"></div>
      <p style="font-size: 12px;">Assinatura do Avaliado</p>
    </div>
    <div class="footer">Documento gerado pelo sistema Focus Spartan — MG Consultoria | ${date}</div>
  </body></html>`;
}

function getTitle(type: QuestionnaireType): string {
  switch (type) {
    case "nasa-tlx": return "NASA-TLX — Índice de Carga de Trabalho";
    case "hse-it": return "HSE-IT — Indicadores de Estresse Ocupacional";
    case "copsoq-ii": return "COPSOQ II — Questionário Psicossocial de Copenhagen";
    case "jss": return "JSS — Job Stress Scale (Karasek)";
  }
}

function scaleRow(question: string, scaleLabels: string[], name: string) {
  return `<tr>
    <td style="width: 45%;">${question}</td>
    ${scaleLabels.map((_, i) => `<td class="radio-col"><input type="radio" name="${name}" /></td>`).join("")}
  </tr>`;
}

function generateNasaTlxForm(): string {
  const dimensions = [
    { id: "mental", label: "Demanda Mental", desc: "Quanta atividade mental e perceptiva foi exigida? (ex.: pensar, decidir, calcular, lembrar, pesquisar)" },
    { id: "physical", label: "Demanda Física", desc: "Quanta atividade física foi exigida? (ex.: empurrar, puxar, girar, controlar, ativar)" },
    { id: "temporal", label: "Demanda Temporal", desc: "Quanta pressão de tempo você sentiu? O ritmo da tarefa foi acelerado ou lento?" },
    { id: "performance", label: "Performance", desc: "Quão bem-sucedido você se sentiu na realização da tarefa?" },
    { id: "effort", label: "Esforço", desc: "Quanto esforço (mental + físico) foi necessário para atingir seu nível de desempenho?" },
    { id: "frustration", label: "Frustração", desc: "Quão inseguro, desencorajado, irritado, estressado e incomodado você se sentiu?" },
  ];

  return `
    <div class="instructions">
      <strong>Instruções:</strong> Para cada dimensão abaixo, marque um X na escala de 0 a 100 que melhor 
      represente sua percepção sobre a tarefa avaliada. 0 = Muito Baixo, 100 = Muito Alto.
      Para "Performance", 0 = Perfeito (bom) e 100 = Fracasso (ruim).
    </div>
    ${dimensions.map(d => `
      <div class="section">${d.label}</div>
      <p style="font-size: 11px; color: #555; margin: 5px 0 10px;">${d.desc}</p>
      <table>
        <tr>
          ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => `<th style="font-size: 10px; padding: 4px;">${v}</th>`).join("")}
        </tr>
        <tr>
          ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((_, i) => `<td class="radio-col"><input type="radio" name="${d.id}" /></td>`).join("")}
        </tr>
      </table>
    `).join("")}
    <div class="score-box">
      <h3>Ponderação de Pesos (Comparação por Pares)</h3>
      <p style="font-size: 11px;">Para cada par abaixo, circule a dimensão que mais contribuiu para a carga de trabalho:</p>
      <table>
        <tr><th>Par</th><th>Opção A</th><th>Opção B</th><th>Escolha (A ou B)</th></tr>
        ${[
          ["Demanda Mental", "Demanda Física"],
          ["Demanda Mental", "Demanda Temporal"],
          ["Demanda Mental", "Performance"],
          ["Demanda Mental", "Esforço"],
          ["Demanda Mental", "Frustração"],
          ["Demanda Física", "Demanda Temporal"],
          ["Demanda Física", "Performance"],
          ["Demanda Física", "Esforço"],
          ["Demanda Física", "Frustração"],
          ["Demanda Temporal", "Performance"],
          ["Demanda Temporal", "Esforço"],
          ["Demanda Temporal", "Frustração"],
          ["Performance", "Esforço"],
          ["Performance", "Frustração"],
          ["Esforço", "Frustração"],
        ].map(([a, b], i) => `<tr><td>${i + 1}</td><td>${a}</td><td>${b}</td><td style="text-align: center;">____</td></tr>`).join("")}
      </table>
    </div>`;
}

function generateHseItForm(): string {
  const dimensions = [
    { label: "Demandas", questions: [
      "Pessoas diferentes no trabalho me pedem coisas difíceis de combinar",
      "Tenho prazos impossíveis de cumprir",
      "Preciso trabalhar muito intensamente",
      "Preciso negligenciar algumas tarefas porque tenho muito a fazer",
      "Não consigo fazer pausas suficientes",
      "Sou pressionado a trabalhar longas horas",
      "Sinto que preciso trabalhar muito rápido",
      "Tenho pressões de tempo irrealistas",
    ]},
    { label: "Controle", questions: [
      "Posso decidir quando fazer uma pausa",
      "Tenho voz ativa sobre a velocidade do meu trabalho",
      "Tenho liberdade para decidir como fazer meu trabalho",
      "Tenho voz ativa sobre o que faço no trabalho",
      "Meus horários de trabalho podem ser flexíveis",
      "Posso decidir a hora de iniciar uma tarefa",
    ]},
    { label: "Suporte de Gestão", questions: [
      "Recebo apoio suficiente do meu gestor",
      "Posso contar com meu gestor quando tenho problemas",
      "Recebo feedback sobre o meu trabalho",
      "Meu gestor me encoraja no trabalho",
      "Tenho oportunidade de discutir problemas com meu gestor",
    ]},
    { label: "Relacionamentos", questions: [
      "Sofro assédio na forma de palavras ou comportamentos indelicados",
      "Há atritos e raiva entre colegas",
      "Sou alvo de bullying no trabalho",
      "As relações no trabalho são tensas",
    ]},
    { label: "Papel", questions: [
      "Tenho clareza sobre o que se espera de mim no trabalho",
      "Sei como fazer meu trabalho",
      "Tenho clareza sobre meus deveres e responsabilidades",
      "Entendo como meu trabalho se encaixa no objetivo geral da organização",
      "Tenho clareza sobre os objetivos do meu departamento",
    ]},
    { label: "Mudança", questions: [
      "Tenho oportunidade suficiente de questionar gestores sobre mudanças",
      "O pessoal é sempre consultado sobre mudanças no trabalho",
      "Quando ocorrem mudanças, tenho clareza de como funcionarão na prática",
    ]},
  ];

  const scale = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];

  return `
    <div class="instructions">
      <strong>Instruções:</strong> Para cada afirmação, marque a opção que melhor descreve sua situação de trabalho.
      Escala: 1 = Discordo totalmente | 2 = Discordo | 3 = Neutro | 4 = Concordo | 5 = Concordo totalmente
    </div>
    ${dimensions.map(dim => `
      <div class="section">${dim.label}</div>
      <table>
        <tr><th style="text-align: left;">Afirmação</th>${scale.map((s, i) => `<th class="scale-header" style="width: 70px;">${i + 1}</th>`).join("")}</tr>
        ${dim.questions.map((q, qi) => scaleRow(q, scale, `${dim.label}_${qi}`)).join("")}
      </table>
    `).join("")}
    <div class="score-box">
      <h3>Resumo dos Scores</h3>
      ${dimensions.map(d => `<div class="score-line"><label>${d.label}:</label><div class="blank"></div><span style="font-size: 11px;">/ ${d.questions.length * 5}</span></div>`).join("")}
      <div class="score-line" style="margin-top: 10px; font-weight: bold;"><label>Score Geral:</label><div class="blank"></div></div>
    </div>`;
}

function generateCopsoqForm(): string {
  const dimensions = [
    { label: "Demandas Quantitativas", questions: [
      "A sua carga de trabalho se acumula por ser mal distribuída?",
      "Com que frequência você não tem tempo para completar todas as tarefas?",
      "Você consegue fazer o seu trabalho com calma e terminá-lo?",
    ]},
    { label: "Ritmo de Trabalho", questions: [
      "Você precisa trabalhar muito rapidamente?",
      "O seu trabalho exige que você trabalhe num ritmo acelerado?",
    ]},
    { label: "Demandas Cognitivas", questions: [
      "O seu trabalho exige muita concentração?",
      "O seu trabalho exige que você se lembre de muitas coisas?",
      "O seu trabalho exige que você tome decisões difíceis?",
      "O seu trabalho exige que você proponha novas ideias?",
    ]},
    { label: "Demandas Emocionais", questions: [
      "O seu trabalho o coloca em situações emocionalmente perturbadoras?",
      "Você tem que se relacionar com os problemas pessoais de outras pessoas como parte do seu trabalho?",
      "O seu trabalho é emocionalmente exigente?",
    ]},
    { label: "Influência no Trabalho", questions: [
      "Você tem grande grau de influência sobre o seu trabalho?",
      "Você pode influenciar a quantidade de trabalho que lhe é atribuída?",
      "Você tem voz ativa sobre o que faz no trabalho?",
    ]},
    { label: "Possibilidades de Desenvolvimento", questions: [
      "O seu trabalho lhe dá oportunidade de desenvolver suas competências?",
      "Você pode usar suas habilidades ou experiências no seu trabalho?",
      "O seu trabalho lhe dá a oportunidade de aprender coisas novas?",
    ]},
    { label: "Significado do Trabalho", questions: [
      "O seu trabalho tem significado para você?",
      "Você sente que o trabalho que faz é importante?",
      "Você se sente motivado e envolvido com o seu trabalho?",
    ]},
    { label: "Compromisso com o Local", questions: [
      "Você gosta de contar a outras pessoas sobre o seu local de trabalho?",
      "Você sente que os problemas do seu local de trabalho são seus também?",
      "Você gostaria de continuar trabalhando no seu local atual?",
    ]},
    { label: "Previsibilidade", questions: [
      "No seu trabalho, você é informado com antecedência sobre decisões importantes?",
      "Você recebe toda a informação de que necessita para fazer bem o seu trabalho?",
    ]},
    { label: "Suporte Social de Colegas", questions: [
      "Com que frequência você recebe ajuda e apoio dos seus colegas?",
      "Com que frequência os seus colegas estão dispostos a ouvi-lo sobre seus problemas de trabalho?",
      "Com que frequência os seus colegas falam consigo sobre o quão bem você executa o trabalho?",
    ]},
  ];

  const scale = ["Sempre/Muito", "Frequentemente", "Às vezes", "Raramente", "Nunca/Quase nunca"];

  return `
    <div class="instructions">
      <strong>Instruções:</strong> Indique com um X a frequência com que cada afirmação se aplica à sua situação de trabalho.
      Escala: 5 = Sempre/Muito | 4 = Frequentemente | 3 = Às vezes | 2 = Raramente | 1 = Nunca/Quase nunca
    </div>
    ${dimensions.map(dim => `
      <div class="section">${dim.label}</div>
      <table>
        <tr><th style="text-align: left;">Pergunta</th>${scale.map((s, i) => `<th class="scale-header" style="width: 75px; font-size: 9px;">${5 - i}</th>`).join("")}</tr>
        ${dim.questions.map((q, qi) => scaleRow(q, scale, `copsoq_${dim.label}_${qi}`)).join("")}
      </table>
    `).join("")}
    <div class="score-box">
      <h3>Resumo por Dimensão</h3>
      ${dimensions.map(d => `<div class="score-line"><label>${d.label}:</label><div class="blank"></div><span style="font-size: 11px;">/ 100</span></div>`).join("")}
      <div class="score-line" style="margin-top: 10px; font-weight: bold;"><label>Score Geral:</label><div class="blank"></div><span style="font-size: 11px;">/ 100</span></div>
    </div>`;
}

function generateJssForm(): string {
  const demandQuestions = [
    "Seu trabalho exige que você trabalhe muito rapidamente?",
    "Seu trabalho exige que você trabalhe muito?",
    "Seu trabalho exige muito esforço?",
    "Você tem tempo suficiente para fazer tudo?",
    "Seu trabalho envolve muitas exigências contraditórias?",
  ];

  const controlQuestions = [
    "Você tem a possibilidade de aprender coisas novas no trabalho?",
    "Seu trabalho exige muita habilidade ou conhecimentos especializados?",
    "Seu trabalho exige que você tome iniciativas?",
    "No seu trabalho, você tem que repetir muitas vezes as mesmas tarefas?",
    "Você pode escolher como fazer o seu trabalho?",
    "Você pode escolher o que fazer no seu trabalho?",
  ];

  const supportQuestions = [
    "Existe um bom espírito de equipe no seu ambiente de trabalho?",
    "No trabalho, eu me relaciono bem com meus chefes?",
    "Eu gosto de trabalhar com meus colegas?",
    "No trabalho, eu me sinto parte de um grupo?",
    "As pessoas com quem eu trabalho são amigáveis?",
    "Meu(s) chefe(s) se preocupa(m) com o bem-estar dos funcionários?",
  ];

  const scale = ["Discordo muito", "Discordo", "Concordo", "Concordo muito"];

  return `
    <div class="instructions">
      <strong>Instruções (Modelo Demanda-Controle-Suporte de Karasek):</strong> Para cada afirmação, marque 
      a opção que melhor representa sua situação. Escala: 1 = Discordo muito | 2 = Discordo | 3 = Concordo | 4 = Concordo muito
    </div>
    <div class="section">Demanda Psicológica</div>
    <table>
      <tr><th style="text-align: left;">Afirmação</th>${scale.map((_, i) => `<th class="scale-header" style="width: 75px;">${i + 1}</th>`).join("")}</tr>
      ${demandQuestions.map((q, i) => scaleRow(q, scale, `jss_demand_${i}`)).join("")}
    </table>
    
    <div class="section">Controle sobre o Trabalho</div>
    <table>
      <tr><th style="text-align: left;">Afirmação</th>${scale.map((_, i) => `<th class="scale-header" style="width: 75px;">${i + 1}</th>`).join("")}</tr>
      ${controlQuestions.map((q, i) => scaleRow(q, scale, `jss_control_${i}`)).join("")}
    </table>
    
    <div class="section">Suporte Social</div>
    <table>
      <tr><th style="text-align: left;">Afirmação</th>${scale.map((_, i) => `<th class="scale-header" style="width: 75px;">${i + 1}</th>`).join("")}</tr>
      ${supportQuestions.map((q, i) => scaleRow(q, scale, `jss_support_${i}`)).join("")}
    </table>
    
    <div class="score-box">
      <h3>Classificação (Modelo de Karasek)</h3>
      <table>
        <tr><th>Quadrante</th><th>Demanda</th><th>Controle</th><th>Descrição</th></tr>
        <tr><td style="background: #C8E6C9;"><strong>Baixa exigência</strong></td><td>Baixa</td><td>Alto</td><td>Situação ideal — menor risco</td></tr>
        <tr><td style="background: #FFF9C4;"><strong>Trabalho ativo</strong></td><td>Alta</td><td>Alto</td><td>Desafiador mas com autonomia</td></tr>
        <tr><td style="background: #FFE0B2;"><strong>Trabalho passivo</strong></td><td>Baixa</td><td>Baixo</td><td>Desmotivante — perda de habilidades</td></tr>
        <tr><td style="background: #FFCDD2;"><strong>Alta exigência</strong></td><td>Alta</td><td>Baixo</td><td>Maior risco — estresse elevado</td></tr>
      </table>
      <div class="score-line" style="margin-top: 15px;"><label>Demanda Total:</label><div class="blank"></div><span style="font-size: 11px;">/ ${demandQuestions.length * 4}</span></div>
      <div class="score-line"><label>Controle Total:</label><div class="blank"></div><span style="font-size: 11px;">/ ${controlQuestions.length * 4}</span></div>
      <div class="score-line"><label>Suporte Total:</label><div class="blank"></div><span style="font-size: 11px;">/ ${supportQuestions.length * 4}</span></div>
      <div class="score-line" style="font-weight: bold;"><label>Quadrante:</label><div class="blank"></div></div>
    </div>`;
}

export default function QuestionariosPsicossociaisPage() {
  const { selectedCompany, companyWorkstations } = useCompany();
  const [selectedType, setSelectedType] = useState<QuestionnaireType | "">("");
  const [evaluator, setEvaluator] = useState("");
  const [wsId, setWsId] = useState("");

  const handlePrint = (type: QuestionnaireType) => {
    if (!selectedCompany) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }

    const ws = companyWorkstations.find(w => w.id === wsId);
    const html = generatePrintHTML(
      type,
      selectedCompany.trade_name || selectedCompany.name,
      evaluator,
      ws?.name || "Geral",
      new Date().toLocaleDateString("pt-BR")
    );

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Questionários Psicossociais</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gere provas impressas para aplicação em campo
          </p>
        </div>
        <CompanySelector />
      </div>

      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" />
            Configuração para Impressão
          </CardTitle>
          <CardDescription className="text-xs">
            Preencha os campos abaixo antes de gerar o questionário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nome do avaliador"
              value={evaluator}
              onChange={(e) => setEvaluator(e.target.value)}
            />
            <Select value={wsId} onValueChange={setWsId}>
              <SelectTrigger>
                <SelectValue placeholder="Posto de trabalho (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {companyWorkstations.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUESTIONNAIRES.map((q) => (
          <Card key={q.type} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                {q.label}
              </CardTitle>
              <CardDescription className="text-xs">{q.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handlePrint(q.type)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Gerar para Impressão
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
