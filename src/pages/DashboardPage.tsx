import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCompany } from "@/lib/company-context";
import { riskLevelLabel, type RiskLevel } from "@/lib/types";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Building2, 
  MapPin, 
  ClipboardCheck, 
  AlertTriangle, 
  Camera, 
  TrendingUp, 
  Target,
  ArrowRight,
  Plus,
  Bell,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanySelector } from "@/components/CompanySelector";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RISK_COLORS: Record<string, string> = {
  low: "#10b981",    /* Emerald */
  medium: "#f59e0b", /* Amber */
  high: "#f97316",   /* Orange */
  critical: "#ef4444", /* Red */
};

const StatCard = ({ icon: Icon, label, value, trend, colorClass, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="premium-card p-6 flex flex-col gap-4 relative overflow-hidden group min-w-[160px]"
  >
    <div className="flex items-center justify-between relative z-10">
      <div className={cn("p-2.5 rounded-2xl", colorClass)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
      <h3 className="text-3xl font-black tracking-tight text-foreground">{value}</h3>
    </div>
    <div className={cn("absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 scale-0 group-hover:scale-150", colorClass)} />
  </motion.div>
);

export default function DashboardPage() {
  const {
    companies, companySectors, companyWorkstations,
    companyAnalyses, posturePhotos, selectedCompany,
    riskAssessments, actionPlans, selectedCompanyId
  } = useCompany();

  const analysesCompleted = companyAnalyses.filter((a) => a.analysis_status === "completed").length;
  const actionCompletionRate = actionPlans.length > 0 ? Math.round((actionPlans.filter(a => a.status === 'completed').length / actionPlans.length) * 100) : 0;
  
  const chartData = [
    { name: "Seg", value: 12 },
    { name: "Ter", value: 18 },
    { name: "Qua", value: 15 },
    { name: "Qui", value: 25 },
    { name: "Sex", value: 20 },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Original Header Structure */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-foreground/90">Dashboard</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {selectedCompany ? `Gestão: ${selectedCompany.trade_name || selectedCompany.name}` : "Selecione uma empresa"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CompanySelector />
          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-2xl bg-foreground/5 border border-foreground/10 group transition-all hover:bg-foreground/10">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          </Button>
        </div>
      </section>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 tracking-tight">
        <StatCard 
          label="Empresas" 
          value={companies.length} 
          icon={Building2} 
          colorClass="bg-primary"
          delay={0.1}
        />
        <StatCard 
          label="Postos" 
          value={companyWorkstations.length} 
          icon={MapPin} 
          trend="+5%"
          colorClass="bg-blue-600"
          delay={0.2}
        />
        <StatCard 
          label="Análises" 
          value={companyAnalyses.length} 
          icon={ClipboardCheck} 
          trend="92%"
          colorClass="bg-sky-600"
          delay={0.3}
        />
        <StatCard 
          label="Riscos" 
          value={riskAssessments.length} 
          icon={AlertTriangle} 
          colorClass="bg-rose-500"
          delay={0.4}
        />
      </div>

      {/* Main Analysis and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Weekly Activity View (Glass Design) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 premium-card p-6 sm:p-8 flex flex-col gap-8"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">Atividade da Semana</h3>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Volume de coletas em campo</p>
            </div>
            <div className="flex gap-2">
               <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary cursor-pointer hover:bg-white/10 transition-colors">
                  <TrendingUp className="h-4 w-4" />
               </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={12}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 'bold' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 16 }}
                  contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontWeight: 'bold', outline: 'none' }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 20 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)'}
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Global Progress Indicators */}
        <div className="flex flex-col gap-6">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="premium-card p-6 bg-primary text-primary-foreground relative overflow-hidden group min-h-[140px] flex flex-col justify-center"
           >
              <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150">
                <Target className="h-20 w-20" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-white/70">Plano de Ação</h4>
                   <span className="text-2xl font-black">{actionCompletionRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${actionCompletionRate}%` }}
                    className="h-full bg-white transition-all duration-1000" 
                   />
                </div>
                <p className="text-[10px] font-medium text-white/50">Meta mensal: 85% de conformidade</p>
              </div>
           </motion.div>

           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="premium-card p-6 flex-1 space-y-5"
           >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider">Postos Críticos</h3>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary group uppercase tracking-widest px-2 hover:bg-primary/5">
                  Ver Tudo <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {companyWorkstations.slice(0, 3).map((ws, i) => (
                  <div key={ws.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-border/40 group">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                      <AlertTriangle className={cn("h-4 w-4 text-orange-500", i === 0 ? "animate-pulse" : "")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{ws.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Risco Médio • Nível 3</p>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <Button className="h-14 px-8 rounded-full shadow-xl shadow-primary/20 gap-3 group transition-transform active:scale-95">
           <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
           <span className="font-bold text-base">Novo Relatório Técnico</span>
        </Button>
      </motion.div>
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: "bg-success/15 text-success border-success/20",
    medium: "bg-warning/15 text-warning border-warning/20",
    high: "bg-high/15 text-high border-high/20",
    critical: "bg-critical/15 text-critical border-critical/20",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase py-0.5", styles[level] || "")}>
      {riskLevelLabel(level as any)}
    </Badge>
  );
}