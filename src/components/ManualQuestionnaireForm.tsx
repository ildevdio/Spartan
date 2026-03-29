import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUESTIONNAIRE_DEFS, calculateScores, type QuestionnaireType } from "@/lib/questionnaire-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/lib/company-context";

interface ManualQuestionnaireFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: QuestionnaireType | null;
  onSuccess: () => void;
}

export function ManualQuestionnaireForm({ open, onOpenChange, type, onSuccess }: ManualQuestionnaireFormProps) {
  const { selectedCompanyId, companyWorkstations } = useCompany();
  const [respondentName, setRespondentName] = useState("");
  const [wsId, setWsId] = useState("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const def = type ? QUESTIONNAIRE_DEFS[type] : null;

  const handleSubmit = async () => {
    if (!selectedCompanyId || !type || !def) return;
    
    if (!respondentName.trim()) {
      toast.error("Nome do respondente é obrigatório");
      return;
    }

    const totalQuestions = def.dimensions.reduce((acc, dim) => acc + dim.questions.length, 0);
    const answeredCount = Object.keys(responses).length;

    if (answeredCount < totalQuestions) {
      toast.error(`Faltam ${totalQuestions - answeredCount} respostas.`);
      return;
    }

    setSubmitting(true);
    
    // Calculate scores
    const { dimensionScores, totalScore } = calculateScores(type, responses);

    // Save with is_manual flag in the JSON
    const finalResponses = { ...responses, is_manual: true };

    const { error } = await supabase.from("questionnaire_responses").insert({
      company_id: selectedCompanyId,
      workstation_id: wsId || null,
      questionnaire_type: type,
      respondent_name: respondentName.trim(),
      responses: finalResponses as any,
      scores: dimensionScores as any,
      total_score: totalScore,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Erro ao salvar resposta manual");
      console.error(error);
      return;
    }

    toast.success("Resposta manual salva com sucesso!");
    // Reset form
    setRespondentName("");
    setWsId("");
    setResponses({});
    onSuccess();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRespondentName("");
      setWsId("");
      setResponses({});
    }
    onOpenChange(isOpen);
  };

  if (!def) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
          <DialogTitle>Inserir Resposta Manual: {def.label}</DialogTitle>
          <DialogDescription>Transcreva as respostas do formulário impresso.</DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Nome do Respondente *</label>
              <Input 
                value={respondentName} 
                onChange={(e) => setRespondentName(e.target.value)} 
                placeholder="Nome completo"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Posto de Trabalho (Opcional)</label>
              <Select value={wsId} onValueChange={setWsId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione um posto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum / Geral</SelectItem>
                  {companyWorkstations.map(ws => (
                    <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {def.dimensions.map((dim, dimIdx) => (
              <div key={dim.label} className="space-y-3">
                <h3 className="text-sm font-bold bg-muted p-2 rounded">{dim.label}</h3>
                <div className="divide-y border rounded">
                  {dim.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-3">
                      <p className="text-sm mb-3 font-medium">
                        {dimIdx + 1}.{qIdx + 1} - {q.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {def.scales.map(scale => (
                          <label
                            key={scale.value}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs cursor-pointer ${
                              responses[q.id] === scale.value 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background hover:bg-muted'
                            }`}
                          >
                            <input 
                              type="radio"
                              name={q.id}
                              value={scale.value}
                              checked={responses[q.id] === scale.value}
                              onChange={() => setResponses(prev => ({ ...prev, [q.id]: scale.value }))}
                              className="sr-only"
                            />
                            {scale.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-2 border-t sticky bottom-0 bg-background z-10 flex justify-end gap-2 mt-auto">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar Resposta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
