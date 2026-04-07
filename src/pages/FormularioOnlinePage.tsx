import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONNAIRE_DEFS, calculateScores, type QuestionnaireType } from "@/lib/questionnaire-data";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function FormularioOnlinePage() {
  const { companyId, type } = useParams<{ companyId: string; type: string }>();
  const [companyName, setCompanyName] = useState("");
  const [workstations, setWorkstations] = useState<{ id: string; name: string }[]>([]);
  const [selectedWs, setSelectedWs] = useState("");

  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;
      setLoading(true);
      
      const { data: companyData } = await supabase
        .from("companies")
        .select("name, trade_name")
        .eq("id", companyId)
        .single();

      if (companyData) {
        setCompanyName((companyData as any).trade_name || (companyData as any).name);
      }

      const { data: sectors } = await supabase
        .from("sectors")
        .select("id")
        .eq("company_id", companyId) as any;

      if (sectors && sectors.length > 0) {
        const sectorIds = (sectors as any[]).map((s) => s.id);
        const { data: wsData } = await supabase
          .from("workstations")
          .select("id, name")
          .in("sector_id", sectorIds);
        
        if (wsData) {
          setWorkstations(wsData as any[]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [companyId]);

  const def = QUESTIONNAIRE_DEFS[type as QuestionnaireType];
  if (!def && !loading) return <div className="p-10 text-center">Questionário inválido</div>;

  const totalQuestions = def?.dimensions.reduce((acc, dim) => acc + dim.questions.length, 0) || 0;
  const answeredCount = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSubmit = async () => {
    if (!selectedWs) {
      toast.error("Selecione o posto de trabalho.");
      return;
    }
    if (answeredCount < totalQuestions) {
      toast.error("Por favor, responda todas as perguntas.");
      return;
    }

    setSubmitting(true);
    const { dimensionScores, totalScore } = calculateScores(type as QuestionnaireType, responses);

    const { error } = await supabase.from("questionnaire_responses").insert({
      company_id: companyId,
      workstation_id: selectedWs,
      questionnaire_type: type,
      respondent_name: "Anônimo",
      responses: responses as any,
      scores: dimensionScores as any,
      total_score: totalScore,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar respostas.");
      console.error(error);
    } else {
      setSubmitted(true);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-lg border-t-4 border-t-green-500">
          <div className="mx-auto bg-green-100 h-16 w-16 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Enviado com Sucesso!</h1>
          <p className="text-slate-600">Obrigado por sua participação. Suas respostas foram registradas de forma anônima e ajudarão a melhorar as condições de trabalho.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.close()}>Fechar Página</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-[#0A1F44] text-white p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold line-clamp-1">{def.label}</h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">{companyName}</p>
          
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-blue-900/50" indicatorClassName="bg-blue-400" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              Instruções
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {def.instructions}
              <br />
              <span className="mt-2 block font-medium text-blue-700">Esta pesquisa é totalmente anônima.</span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Identification */}
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#0A1F44]">Identificação</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Posto de trabalho *</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              value={selectedWs}
              onChange={(e) => setSelectedWs(e.target.value)}
            >
              <option value="">Selecione seu posto de trabalho</option>
              {workstations.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {def.dimensions.map((dim, dimIdx) => (
            <div key={dim.label} className="space-y-4">
              <div className="sticky top-[136px] bg-slate-50 py-2 z-[5]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md inline-block border border-blue-100">
                  {dimIdx + 1}. {dim.label}
                </h3>
              </div>
              
              <div className="space-y-4">
                {dim.questions.map((q, qIdx) => (
                  <Card key={q.id} className={`overflow-hidden transition-all duration-300 ${responses[q.id] !== undefined ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'}`}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex gap-3">
                        <span className="bg-slate-100 text-slate-500 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <p className="text-[15px] text-slate-800 leading-tight font-medium">{q.text}</p>
                      </div>

                      <RadioGroup
                        value={responses[q.id]?.toString()}
                        onValueChange={(val) => setResponses({ ...responses, [q.id]: parseInt(val) })}
                        className="grid grid-cols-1 gap-2 pt-1"
                      >
                        {def.scales.map((scale) => (
                          <div
                            key={scale.value}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 ${
                              responses[q.id] === scale.value ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-200'
                            }`}
                            onClick={() => setResponses({ ...responses, [q.id]: scale.value })}
                          >
                            <RadioGroupItem value={scale.value.toString()} id={`${q.id}-${scale.value}`} />
                            <Label 
                              htmlFor={`${q.id}-${scale.value}`} 
                              className="text-sm font-normal flex-1 cursor-pointer"
                            >
                              {scale.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-8 pb-12">
          <Button
            className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Finalizar e Enviar
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <div className="text-center mt-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Conexão Segura e Anônima
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
