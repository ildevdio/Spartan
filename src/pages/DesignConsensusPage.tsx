import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from "recharts";
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
  Search,
  Users,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const data = [
  { name: "Seg", value: 45 },
  { name: "Ter", value: 52 },
  { name: "Qua", value: 48 },
  { name: "Qui", value: 70 },
  { name: "Sex", value: 61 },
  { name: "Sáb", value: 38 },
  { name: "Dom", value: 42 },
];

const StatCard = ({ icon: Icon, label, value, trend, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative group overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/60"
  >
    <div className="flex items-start justify-between">
      <div className={cn("rounded-2xl p-3", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    <div className="mt-5 space-y-1">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">{label}</p>
      <h3 className="text-3xl font-black tracking-tight text-white">{value}</h3>
    </div>
    {/* Subtle glow background */}
    <div className={cn("absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl opacity-10 transition-transform duration-500 group-hover:scale-150", color)} />
  </motion.div>
);

const DesignConsensusPage = () => {
  return (
    <div className="min-h-screen bg-[#07080b] p-6 text-white sm:p-10 font-outfit">
      {/* Test Page Header */}
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 font-black text-indigo-400">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.3em]">Design Preview v2</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">
            Olá, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Ergonomista</span>! 👋
          </h1>
          <p className="text-sm font-medium text-white/40">Consenso entre Ref 1 (Vidro) e Ref 2 (Dark Premium).</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 transition-colors group-hover:text-indigo-400" />
            <input 
              type="text" 
              placeholder="Buscar no Spartan..." 
              className="w-full rounded-2xl border-none bg-white/5 py-3 pl-12 pr-6 text-sm outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-indigo-500/50 sm:w-64"
            />
          </div>
          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10">
            <Bell className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Empresas Ativas" 
          value="12" 
          icon={Building2} 
          trend="+2" 
          color="bg-indigo-600"
          delay={0.1}
        />
        <StatCard 
          label="Postos Mapeados" 
          value="156" 
          icon={MapPin} 
          trend="+12%" 
          color="bg-cyan-600"
          delay={0.2}
        />
        <StatCard 
          label="Análises Concluídas" 
          value="240" 
          icon={ClipboardCheck} 
          trend="85%" 
          color="bg-violet-600"
          delay={0.3}
        />
        <StatCard 
          label="Riscos Críticos" 
          value="08" 
          icon={AlertTriangle} 
          color="bg-rose-500"
          delay={0.4}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Main Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-[32px] border border-white/10 bg-black/40 p-8 backdrop-blur-xl lg:col-span-2"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">Fluxo de Atividade</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Análises realizadas nos últimos 7 dias</p>
            </div>
            <select className="rounded-xl border-none bg-white/5 py-2 px-4 text-xs font-bold outline-none cursor-pointer">
              <option>Esta Semana</option>
              <option>Mês Atual</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Data List Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
               <Target className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black tracking-tight">Nova Análise</h3>
              <p className="text-sm font-medium text-white/70">Inicie um novo mapeamento de posto agora mesmo.</p>
              <Button className="w-full rounded-2xl bg-white text-indigo-900 hover:bg-white/90 font-black py-6">
                <Plus className="mr-2 h-5 w-5" /> Começar Agora
              </Button>
            </div>
          </div>

          <div className="flex-1 rounded-[32px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-3xl">
            <h3 className="mb-6 text-lg font-black tracking-tight">Equipe Recente</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    JS
                  </div>
                  <div>
                    <p className="text-sm font-bold">John Smith {i}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Ergonomista Senior</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-white/10 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button (FAB) or Logic Preview */}
      <div className="mt-12 text-center text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">
        Spartan Design System Consensus 2024
      </div>
    </div>
  );
};

export default DesignConsensusPage;
