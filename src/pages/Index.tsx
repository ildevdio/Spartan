import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { 
  Users, 
  MapPin, 
  ClipboardCheck, 
  TrendingUp, 
  Search, 
  Bell, 
  Calendar,
  ArrowRight,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/company-context";

const data = [
  { name: "Seg", value: 40 },
  { name: "Ter", value: 65 },
  { name: "Qua", value: 45 },
  { name: "Qui", value: 90 },
  { name: "Sex", value: 55 },
];

const StatCard = ({ title, value, icon: Icon, trend, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="premium-card p-6 flex flex-col gap-4 relative overflow-hidden group"
  >
    <div className="flex items-center justify-between relative z-10">
      <div className={cn("p-2.5 rounded-2xl\", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-secondary-foreground/60 text-xs font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
    <div className={cn("absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150\", color)} />
  </motion.div>
);

const Index = () => {
  const { companies, companyWorkstations } = useCompany();

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em]">Painel de Controle</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Olá, <span className="text-primary">Ergonomista</span> 
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Aqui está o resumo da sua gestão de saúde ocupacional para hoje.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <input 
              type="text" 
              placeholder="Buscar postos ou relatórios..." 
              className="pl-10 pr-4 py-2.5 bg-secondary/50 border-none rounded-2xl w-full md:w-64 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <Button size="icon" variant="secondary" className="rounded-2xl h-[42px] w-[42px]">
            <Bell className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Empresas Ativas" 
          value={companies.length} 
          icon={Users} 
          trend="+2" 
          color="bg-blue-600 shadow-blue-200"
          delay={0.1}
        />
        <StatCard 
          title="Postos Mapeados" 
          value={companyWorkstations.length} 
          icon={MapPin} 
          trend="+12%" 
          color="bg-indigo-600 shadow-indigo-200"
          delay={0.2}
        />
        <StatCard 
          title="Análises Concluídas" 
          value="156" 
          icon={ClipboardCheck} 
          trend="85%" 
          color="bg-violet-600 shadow-violet-200"
          delay={0.3}
        />
        <StatCard 
          title="Dias de Auditoria" 
          value="24" 
          icon={Calendar} 
          color="bg-slate-800 shadow-slate-200"
          delay={0.4}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 premium-card p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Atividade Semanal</h3>
              <p className="text-sm text-muted-foreground font-medium">Fluxo de análises e coletas de dados</p>
            </div>
            <select className="bg-secondary/50 border-none text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--secondary))', radius: 8 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 80 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.15)'}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions / Featured Posto */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="premium-card p-6 bg-primary text-primary-foreground relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
              <div className="h-32 w-32 rounded-full border-[12px] border-white" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Início Rápido</h3>
                <p className="text-white/70 text-sm">Crie um novo mapeamento de posto em segundos.</p>
              </div>
              <Button variant="secondary" className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold border-none transition-transform active:scale-95">
                Novo Posto Trabalho
              </Button>
            </div>
          </div>

          <div className="premium-card p-6 flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold tracking-tight">Postos Recentes</h3>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary group">
                Ver todos <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">Posto Preparo A-{i}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cozinha Geral</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.3)]" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
