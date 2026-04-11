import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardCheck, 
  FileText, 
  Monitor, 
  Layers, 
  Camera, 
  Printer, 
  AlertTriangle, 
  ListTodo, 
  UserCheck,
  ChevronUp,
  Zap,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLicense } from "@/lib/license-context";

const sections = [
  { 
    id: 'dashboard',
    icon: LayoutDashboard, 
    label: "Início", 
    path: "/" 
  },
  { 
    id: 'cadastro',
    icon: Building2, 
    label: "Cadastro", 
    items: [
      { title: "Empresas", url: "/empresas", icon: Building2 },
      { title: "Setores", url: "/setores", icon: Layers },
      { title: "Postos", url: "/postos", icon: Monitor },
      { title: "Resp. Técnico", url: "/responsavel-tecnico", icon: UserCheck },
    ]
  },
  { 
    id: 'analise',
    icon: ClipboardCheck, 
    label: "Análise", 
    items: [
      { title: "Captura", url: "/captura-posturas", icon: Camera },
      { title: "Análises", url: "/analises", icon: ClipboardCheck },
      { title: "Câmera", url: "/analise-camera", icon: Camera },
      { title: "Questionários", url: "/questionarios-psicossociais", icon: Printer },
    ]
  },
  { 
    id: 'resultados',
    icon: FileText, 
    label: "Resultados", 
    items: [
      { title: "Riscos", url: "/riscos", icon: AlertTriangle },
      { title: "Ações", url: "/acoes", icon: ListTodo },
      { title: "Relatórios", url: "/relatorios", icon: FileText },
    ]
  },
];

export function Dock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isFullVersion, isDeveloper, setShowUpgradeDialog } = useLicense();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleItemClick = (path: string) => {
    navigate(path);
    setActiveSection(null);
  };

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-fit transition-all duration-300">
      {/* Vertical Submenu */}
      <AnimatePresence>
        {activeSection && sections.find(s => s.id === activeSection)?.items && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col gap-2 p-2 rounded-[28px] bg-background/80 backdrop-blur-2xl border border-foreground/[0.08] shadow-2xl safe-area-bottom w-48 mb-2"
          >
            <div className="px-3 py-2 border-b border-foreground/5 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                 {sections.find(s => s.id === activeSection)?.label}
               </span>
            </div>
            {sections.find(s => s.id === activeSection)?.items?.map((item) => (
              <button
                key={item.url}
                onClick={() => handleItemClick(item.url)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all active:scale-95 text-left",
                  location.pathname === item.url 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-foreground/60 hover:bg-foreground/5"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="text-xs truncate">{item.title}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dock Bar */}
      <div className="flex items-center gap-2 p-2 rounded-[32px] bg-background/60 backdrop-blur-3xl border border-foreground/[0.05] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        
        {sections.map((section) => {
          const isCategoryActive = activeSection === section.id;
          const isPathActive = section.path && location.pathname === section.path;
          const isCurrentActive = isCategoryActive || isPathActive;
          
          return (
            <button
              key={section.id}
              onClick={() => {
                if (section.path) {
                  navigate(section.path);
                  setActiveSection(null);
                } else {
                  setActiveSection(prev => prev === section.id ? null : section.id);
                }
              }}
              className={cn(
                "relative flex items-center justify-center h-12 w-12 rounded-[24px] transition-all duration-300 group active:scale-90",
                isCurrentActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <section.icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCurrentActive ? "scale-110" : "group-hover:scale-110"
              )} />
              
              {!section.path && (
                <div className={cn(
                  "absolute -top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary border-2 border-background transition-opacity duration-300",
                  isCategoryActive ? "opacity-100" : "opacity-0"
                )} />
              )}
            </button>
          );
        })}

        {/* Demo Mode Action - Credencial */}
        {!isFullVersion && (
          <button
            onClick={() => {
              setActiveSection(null);
              setShowUpgradeDialog(true);
            }}
            className="relative flex items-center justify-center h-12 w-12 rounded-[24px] transition-all duration-300 group active:scale-90 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20"
          >
            <Zap className="h-5 w-5 fill-current animate-pulse" />
          </button>
        )}

        {/* Developer Direct Action */}
        {isDeveloper && (
          <button
            onClick={() => {
              setActiveSection(null);
              navigate("/dev-settings");
            }}
            className={cn(
              "relative flex items-center justify-center h-12 w-12 rounded-[24px] transition-all duration-300 group active:scale-90",
              location.pathname === "/dev-settings"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <Code2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
