import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONNAIRE_DEFS, calculateScores, type QuestionnaireType } from "@/lib/questionnaire-data";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function FormularioOnlinePage() {
  const { companyId, type } = useParams<{ companyId: string; type: string }>();
  const [companyName, setCompanyName] = useState("");
  const [workstations, setWorkstations] = useState<{ id: string; name: string }[]>([]);
  const [selectedWs, setSelectedWs] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questionnaire = type ? QUESTIONNAIRE_DEFS[type as QuestionnaireType] : undefined;

  useEffect(() => {
    if (!companyId) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: company } = await supabase
        .from("companies")
        .select("name, trade_name")
        .eq("id", companyId)
        .single();

      if (company) {
        setCompanyName(company.trade_name || company.name);
      }

      // Get workstations via sectors
      const { data: sectors } = await supabase
        .from("sectors")
        .select("id")
        .eq("company_id", companyId);

      if (sectors && sectors.length > 0) {
        const sectorIds = sectors.map((s) => s.id);
        const { data: ws } = await supabase
          .from("workstations")
          .select("id, name")
          .in("sector_id", sectorIds)
          .order("name");
        setWorkstations(ws || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [companyId]);

  if (!questionnaire || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Formulário inválido</h1>
          <p className="text-slate-500">O link do formulário está incorreto ou expirado.</p>
        </div>
      </div>
    );
  }

  const totalQuestions = questionnaire.dimensions.reduce((s, d) => s + d.questions.length, 0);
  const answeredCount = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSubmit = async () => {
    if (!respondentName.trim()) {
      toast.error("Preencha seu nome.");
      return;
    }
    if (!selectedWs) {
      toast.error("Selecione o posto de trabalho.");
      return;
    }
    if (answeredCount < totalQuestions) {
      toast.error(`Responda todas as ${totalQuestions} perguntas. Faltam ${totalQuestions - answeredCount}.`);
      return;
    }

    setSubmitting(true);
    const { dimensionScores, totalScore } = calculateScores(type as QuestionnaireType, responses);

    const { error } = await supabase.from("questionnaire_responses").insert({
      company_id: companyId,
      workstation_id: selectedWs,
      questionnaire_type: type,
      respondent_name: respondentName.trim(),
      responses,
      scores: dimensionScores,
      total_score: totalScore,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar respostas. Tente novamente.");
      console.error(error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Obrigado!</h1>
          <p className="text-slate-500">Suas respostas foram registradas com sucesso.</p>
          <p className="text-xs text-slate-400 mt-4">Você pode fechar esta janela.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1F44] to-[#1565C0] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/mg-consult-logo.png" alt="MG Consult" className="h-8 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="text-xs opacity-80">MG Consultoria — Ergonomia & Segurança</span>
          </div>
          <h1 className="text-xl font-bold">{questionnaire.label}</h1>
          <p className="text-sm opacity-80">{questionnaire.description}</p>
          <p className="text-xs opacity-60 mt-1">Empresa: {companyName}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1565C0] to-[#00BCD4] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">{answeredCount}/{totalQuestions}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Identification */}
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#0A1F44]">Identificação</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Seu nome completo *</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Posto de trabalho *</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              value={selectedWs}
              onChange={(e) => setSelectedWs(e.target.value)}
            >
              <option value="">Selecione seu posto...</option>
              {workstations.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-[#1565C0] rounded-r-xl p-4">
          <p className="text-sm text-[#0A1F44]">
            <strong>Instruções: </strong>{questionnaire.instructions}
          </p>
        </div>

        {/* Questions by dimension */}
        {questionnaire.dimensions.map((dim, dimIdx) => (
          <div key={dim.label} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-[#0A1F44] to-[#1565C0] px-5 py-3">
              <h3 className="text-white font-semibold text-sm">{dim.label}</h3>
            </div>
            <div className="divide-y">
              {dim.questions.map((q, qIdx) => (
                <div key={q.id} className="p-5">
                  <p className="text-sm text-slate-700 mb-3">
                    <span className="text-xs font-bold text-[#1565C0] mr-1">
                      {dimIdx + 1}.{qIdx + 1}
                    </span>
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {questionnaire.scales.map((scale) => (
                      <label
                        key={scale.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all ${
                          responses[q.id] === scale.value
                            ? "bg-[#1565C0] text-white border-[#1565C0] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#1565C0]/50 hover:bg-blue-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={scale.value}
                          checked={responses[q.id] === scale.value}
                          onChange={() => setResponses((prev) => ({ ...prev, [q.id]: scale.value }))}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            responses[q.id] === scale.value ? "border-white" : "border-slate-300"
                          }`}
                        >
                          {responses[q.id] === scale.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs">{scale.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#0A1F44] to-[#1565C0] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {submitting ? "Enviando..." : "Enviar Respostas"}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Suas respostas são confidenciais e utilizadas apenas para fins de análise ergonômica.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400 border-t bg-white mt-6">
        Focus Spartan — MG Consultoria | Ergonomia & Segurança do Trabalho
      </div>
    </div>
  );
}
