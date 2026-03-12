import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockActionPlans, mockRiskAssessments, mockAnalyses, mockWorkstations } from "@/lib/mock-data";
import { statusLabel, type ActionPlan, type ActionStatus } from "@/lib/types";
import { Plus, CheckCircle2, Clock, CircleDot, Hourglass } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./DashboardPage";

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
  const [actions, setActions] = useState<ActionPlan[]>(mockActionPlans);
  const [open, setOpen] = useState(false);
  const [riskId, setRiskId] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSave = () => {
    if (!riskId || !description.trim()) return;
    setActions([...actions, {
      id: `ap${Date.now()}`,
      risk_assessment_id: riskId,
      description,
      responsible,
      deadline,
      status: "pending",
      created_at: new Date().toISOString().split("T")[0],
    }]);
    setOpen(false); setDescription(""); setResponsible(""); setDeadline(""); setRiskId("");
  };

  const updateStatus = (id: string, status: ActionStatus) => {
    setActions(actions.map((a) => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plano de Ação</h1>
          <p className="text-sm text-muted-foreground">Ações corretivas vinculadas aos riscos identificados</p>
        </div>
        <div className="flex items-center gap-3">
          <CompanySelector />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Ação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Ação</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={riskId} onValueChange={setRiskId}>
                <SelectTrigger><SelectValue placeholder="Avaliação de risco" /></SelectTrigger>
                <SelectContent>
                  {mockRiskAssessments.map((r) => {
                    const a = mockAnalyses.find((x) => x.id === r.analysis_id);
                    const ws = a ? mockWorkstations.find((w) => w.id === a.workstation_id) : null;
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

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map((s) => {
          const Icon = statusIcons[s];
          const count = actions.filter((a) => a.status === s).length;
          return (
            <Card key={s}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{statusLabel(s)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="max-w-xs">
                    <p className="text-sm font-medium truncate">{action.description}</p>
                  </TableCell>
                  <TableCell className="text-sm">{action.responsible}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{action.deadline}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[action.status]}>
                      {statusLabel(action.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={action.status} onValueChange={(v) => updateStatus(action.id, v as ActionStatus)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
