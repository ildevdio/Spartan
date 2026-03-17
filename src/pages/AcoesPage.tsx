import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { statusLabel, type ActionStatus } from "@/lib/types";
import { Plus, CheckCircle2, Clock, CircleDot, Hourglass, Wand2, Loader2 } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { calculateRiskScore, classifyRisk } from "@/lib/types";
import { toast } from "sonner";

const STATUS_OPTIONS: ActionStatus[] = ["pending", "approved", "in_progress", "completed"];

const statusStyles: Record<ActionStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-info/15 text-info",
  in_progress: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
};

const statusIcons: Record<ActionStatus, any> = {
  pending: Clock,
  approved: CircleDot,
  in_progress: Hourglass,
  completed: CheckCircle2,
};

export default function AcoesPage() {
  const { companyAnalyses, companyWorkstations, riskAssessments, actionPlans, addActionPlan, updateActionPlan } = useCompany();
  const [open, setOpen] = useState(false);
  const [riskId, setRiskId] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const companyRisks = riskAssessments.filter((r) => companyAnalyses.some((a) => a.id === r.analysis_id));
  const companyActions = actionPlans.filter((ap) => companyRisks.some((r) => r.id === ap.risk_assessment_id));

  const handleSave = async () => {
    if (!riskId || !description.trim()) return;
    await addActionPlan({
      risk_assessment_id: riskId,
      description,
      responsible,
      deadline,
      status: "pending",
    });
    setOpen(false); setDescription(""); setResponsible(""); setDeadline(""); setRiskId("");
  };

  const handleUpdateStatus = async (id: string, status: ActionStatus) => {
    await updateActionPlan(id, { status });
  };

  const handleAutoFill = async () => {
    const existingRiskIds = new Set(actionPlans.map((ap) => ap.risk_assessment_id));
    const risksWithoutActions = companyRisks.filter((r) => !existingRiskIds.has(r.id));

    if (risksWithoutActions.length === 0) {
      toast.info("Todos os riscos já possuem plano de ação.");
      return;
    }

    setIsAutoFilling(true);
    try {
      for (const risk of risksWithoutActions) {
        const analysis = companyAnalyses.find((a) => a.id === risk.analysis_id);
        const ws = analysis ? companyWorkstations.find((w) => w.id === analysis.workstation_id) : null;

        const actionDescriptions: Record<string, string> = {
          low: `Monitorar condições ergonômicas do posto ${ws?.name || ""}. Manter registros periódicos.`,
          medium: `Implementar melhorias ergonômicas no posto ${ws?.name || ""}. Ajustar mobiliário e orientar colaboradores sobre postura.`,
          high: `Ação corretiva urgente no posto ${ws?.name || ""}. Redesenhar layout, substituir equipamentos inadequados e treinar equipe.`,
          critical: `Intervenção imediata no posto ${ws?.name || ""}. Interromper atividade até correção. Avaliar substituição completa do posto.`,
        };

        // Set deadline based on risk level
        const deadlineDays: Record<string, number> = { low: 90, medium: 60, high: 30, critical: 7 };
        const dl = new Date();
        dl.setDate(dl.getDate() + (deadlineDays[risk.risk_level] || 30));

        await addActionPlan({
          risk_assessment_id: risk.id,
          description: actionDescriptions[risk.risk_level] || `Ação corretiva para risco score ${risk.risk_score}.`,
          responsible: "",
          deadline: dl.toISOString().split("T")[0],
          status: risk.risk_level === "critical" ? "approved" : "pending",
        });
      }
      toast.success(`${risksWithoutActions.length} ação(ões) preenchida(s) automaticamente!`);
    } catch (err) {
      toast.error("Erro ao preencher ações.");
      console.error(err);
    } finally {
      setIsAutoFilling(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Plano de Ação</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Ações corretivas vinculadas aos riscos</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={isAutoFilling}
          >
            {isAutoFilling ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Preenchendo...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-1" />Preencher com Dados</>
            )}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Ação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>Nova Ação</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={riskId} onValueChange={setRiskId}>
                  <SelectTrigger><SelectValue placeholder="Avaliação de risco" /></SelectTrigger>
                  <SelectContent>
                    {companyRisks.map((r) => {
                      const a = companyAnalyses.find((x) => x.id === r.analysis_id);
                      const ws = a ? companyWorkstations.find((w) => w.id === a.workstation_id) : null;
                      return <SelectItem key={r.id} value={r.id}>{ws?.name} — Score {r.risk_score}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Descrição da ação" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Responsável" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                <Button onClick={handleSave} className="w-full">Criar Ação</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {STATUS_OPTIONS.map((s) => {
          const Icon = statusIcons[s];
          const count = companyActions.filter((a) => a.status === s).length;
          return (
            <Card key={s}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold">{count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{statusLabel(s)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Prazo</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {companyActions.map((action) => (
                  <tr key={action.id} className="border-b border-border last:border-0">
                    <td className="p-3 max-w-xs">
                      <p className="text-sm font-medium truncate">{action.description}</p>
                    </td>
                    <td className="p-3 text-sm">{action.responsible}</td>
                    <td className="p-3 text-sm text-muted-foreground">{action.deadline}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={statusStyles[action.status]}>
                        {statusLabel(action.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Select value={action.status} onValueChange={(v) => handleUpdateStatus(action.id, v as ActionStatus)}>
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden divide-y divide-border">
            {companyActions.map((action) => (
              <div key={action.id} className="p-3 space-y-2">
                <p className="text-sm font-medium">{action.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{action.responsible}</span>
                  <span className="text-xs text-muted-foreground">{action.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${statusStyles[action.status]} text-[10px]`}>
                    {statusLabel(action.status)}
                  </Badge>
                  <Select value={action.status} onValueChange={(v) => handleUpdateStatus(action.id, v as ActionStatus)}>
                    <SelectTrigger className="w-28 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
