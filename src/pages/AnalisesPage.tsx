import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAnalyses, mockWorkstations } from "@/lib/mock-data";
import type { Analysis, ErgonomicMethod } from "@/lib/types";
import { Plus, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./DashboardPage";
import { mockRiskAssessments } from "@/lib/mock-data";

const METHODS: ErgonomicMethod[] = ["RULA", "REBA", "ROSA", "OWAS", "OCRA", "ANSI-365"];

const methodBodyParts: Record<ErgonomicMethod, string[]> = {
  RULA: ["upper_arm", "lower_arm", "wrist", "neck", "trunk", "legs"],
  REBA: ["trunk", "neck", "legs", "upper_arm", "lower_arm", "wrist"],
  ROSA: ["chair", "monitor", "keyboard", "mouse", "telephone"],
  OWAS: ["back", "arms", "legs", "load"],
  OCRA: ["frequency", "force", "posture", "additional", "recovery"],
  "ANSI-365": ["repetition", "force", "posture", "vibration", "contact_stress"],
};

export default function AnalisesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [open, setOpen] = useState(false);
  const [wsId, setWsId] = useState("");
  const [method, setMethod] = useState<ErgonomicMethod>("REBA");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [bodyParts, setBodyParts] = useState<Record<string, number>>({});

  const handleMethodChange = (m: ErgonomicMethod) => {
    setMethod(m);
    const parts: Record<string, number> = {};
    methodBodyParts[m].forEach((p) => (parts[p] = 1));
    setBodyParts(parts);
  };

  const handleSave = () => {
    if (!wsId || !score) return;
    const totalScore = Object.values(bodyParts).reduce((a, b) => a + b, 0);
    setAnalyses([...analyses, {
      id: `a${Date.now()}`,
      workstation_id: wsId,
      method,
      score: totalScore || Number(score),
      notes,
      body_parts: bodyParts,
      created_at: new Date().toISOString().split("T")[0],
    }]);
    setOpen(false);
    setWsId(""); setScore(""); setNotes(""); setBodyParts({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análises Ergonômicas</h1>
          <p className="text-sm text-muted-foreground">Avaliações por método ergonômico</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Análise</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Análise Ergonômica</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={wsId} onValueChange={setWsId}>
                <SelectTrigger><SelectValue placeholder="Posto de trabalho" /></SelectTrigger>
                <SelectContent>
                  {mockWorkstations.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={method} onValueChange={(v) => handleMethodChange(v as ErgonomicMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <p className="text-sm font-medium">Pontuação por segmento</p>
                {methodBodyParts[method].map((part) => (
                  <div key={part} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-28 capitalize">{part.replace("_", " ")}</span>
                    <Input type="number" min={1} max={10} value={bodyParts[part] || 1} onChange={(e) => setBodyParts({ ...bodyParts, [part]: Number(e.target.value) })} className="w-20" />
                  </div>
                ))}
              </div>

              <Input placeholder="Score total (ou calculado)" value={score} onChange={(e) => setScore(e.target.value)} type="number" />
              <Textarea placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button onClick={handleSave} className="w-full">Salvar Análise</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((a) => {
                const ws = mockWorkstations.find((w) => w.id === a.workstation_id);
                const risk = mockRiskAssessments.find((r) => r.analysis_id === a.id);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{ws?.name || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.method}</Badge></TableCell>
                    <TableCell>{a.score}</TableCell>
                    <TableCell>{risk ? <RiskBadge level={risk.risk_level} /> : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.created_at}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
