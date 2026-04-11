import { useState } from "react";
import { useLicense } from "@/lib/license-context";
import { useCompany } from "@/lib/company-context";
import { toast } from "sonner";
import { deobfuscate } from "@/lib/crypto";
import {
  LayoutDashboard,
  Building2,
  Monitor,
  ClipboardCheck,
  AlertTriangle,
  ListTodo,
  FileText,
  Camera,
  Layers,
  Brain,
  Printer,
  ChevronDown,
  UserCheck,
  Lock,
  Zap,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import spartanLogo from "@/assets/spartan-logo.png";
import focusLogo from "@/assets/focus-logo.png";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [focusDialogOpen, setFocusDialogOpen] = useState(false);
  const { isFullVersion: isSystemAccess, isDeveloper, activateLicense, licenseKey, deactivateLicense, showUpgradeDialog, setShowUpgradeDialog } = useLicense();
  const { selectedCompany } = useCompany();
  const isCompanyPro = selectedCompany?.is_pro || isDeveloper || isSystemAccess;
  
  const [licenseKeyInput, setLicenseKeyInput] = useState("");

  const premiumFeatures = ["/analise-camera", "/psicossocial", "/relatorios"];

  const sections = [
    {
      label: "Cadastro",
      icon: Building2,
      items: [
        { title: "Empresas", url: "/empresas", icon: Building2 },
        { title: "Setores", url: "/setores", icon: Layers },
        { title: "Postos", url: "/postos", icon: Monitor },
        { title: "Resp. Técnico", url: "/responsavel-tecnico", icon: UserCheck },
      ],
    },
    {
      label: "Análise",
      icon: ClipboardCheck,
      items: [
        { title: "Captura", url: "/captura-posturas", icon: Camera },
        { title: "Análises", url: "/analises", icon: ClipboardCheck },
        { title: "Câmera", url: "/analise-camera", icon: Camera, isPremium: true },
        { title: "Questionários", url: "/questionarios-psicossociais", icon: Printer },
      ],
    },
    {
      label: "Resultados",
      icon: FileText,
      items: [
        { title: "Riscos", url: "/riscos", icon: AlertTriangle },
        { title: "Ações", url: "/acoes", icon: ListTodo },
        { title: "Relatórios", url: "/relatorios", icon: FileText, isPremium: true },
      ],
    },
    ...(isDeveloper ? [{
      label: "Desenvolvedor",
      icon: ShieldCheck,
      items: [
        { title: "Configurações Dev", icon: Settings2, url: "/dev-settings" },
      ]
    }] : [])
  ];

  const { selectedCompanyId, updateCompany } = useCompany();

  const handleActivate = async () => {
    const MGCONSULT_KEY = deobfuscate(import.meta.env.VITE_SPARTAN_MGCONSULT_LICENSE_KEY || "");
    const DEV_KEYS = [
      import.meta.env.VITE_SPARTAN_DEV_DIOGO || "",
      import.meta.env.VITE_SPARTAN_DEV_SAMUEL || "",
      import.meta.env.VITE_SPARTAN_DEV_NICOLAS || "",
    ].filter(Boolean);

    if (!licenseKeyInput.trim()) return;
    const success = await activateLicense(licenseKeyInput);
    if (success) {
      setLicenseKeyInput("");
      setShowUpgradeDialog(false);
    }
  };

  // Determine which section is active based on current route
  const activeSectionIndex = sections.findIndex((s) =>
    s.items.some((item) => item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url))
  );

  const [openSections, setOpenSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    sections.forEach((_, i) => { initial[i] = i === activeSectionIndex || i === 0; });
    return initial;
  });

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-2 border-b border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full"
        >
          <img src={spartanLogo} alt="Spartan" className="h-12 shrink-0 object-contain" />
          {!collapsed && (
            <div className="text-left">
              <h1 className="text-sm font-black tracking-tighter text-sidebar-foreground leading-none">
                Spartan
              </h1>
              <p className="text-[10px] text-sidebar-muted mt-1 tracking-widest uppercase font-bold">Ergonomia & Segurança</p>
            </div>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <div className="py-2 px-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9 relative px-3">
                <NavLink
                  to="/"
                  end
                  className={cn(
                    "flex items-center gap-2 hover:bg-sidebar-accent/50 transition-all duration-200 rounded-md",
                    location.pathname === "/" && "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                  )}
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-sm">Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <div className="py-1">
          {sections.map((section, sectionIdx) => {
            const isOpen = openSections[sectionIdx] ?? false;
            const hasActiveItem = section.items.some((item) =>
              item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
            );

            return (
              <Collapsible
                key={section.label}
                open={isOpen}
                onOpenChange={() => toggleSection(sectionIdx)}
              >
                <CollapsibleTrigger className={cn(
                  "flex items-center w-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em]",
                  "hover:bg-sidebar-accent transition-all duration-300 cursor-pointer rounded-2xl mx-1 my-0.5",
                  hasActiveItem
                    ? "text-sidebar-primary bg-sidebar-accent border-sidebar-border"
                    : "text-sidebar-muted border-transparent",
                  collapsed && "justify-center px-1.5"
                )}>
                  <section.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{section.label}</span>
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300 opacity-40",
                        isOpen && "rotate-180 opacity-100"
                      )} />
                    </>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <SidebarMenu className="px-1">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title} className="my-0">
                        <SidebarMenuButton asChild className="h-7 relative">
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className={cn(
                              "hover:bg-sidebar-accent transition-all duration-200",
                              !collapsed && "pl-5"
                            )}
                            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-bold border-l-[3px] border-sidebar-primary"
                          >
                            <item.icon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-70" />
                            {!collapsed && (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-medium tracking-tight">{item.title}</span>
                                {item.isPremium && !isCompanyPro && (
                                  <Lock className="h-3 w-3 text-white/20 ml-1" />
                                )}
                              </div>
                            )}
                            {collapsed && item.isPremium && !isCompanyPro && (
                              <div className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full border-2 border-background shadow-lg" />
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4 flex flex-col gap-4 bg-sidebar-accent/30">
        {!isCompanyPro && !collapsed && (
          <Button 
            onClick={() => setShowUpgradeDialog(true)}
            size="sm" 
            className="w-full bg-primary hover:bg-primary/90 text-white text-[10px] font-black h-10 rounded-2xl shadow-xl shadow-primary/20 tracking-widest uppercase transition-transform active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 mr-2 fill-current" />
            SPARTAN PRO
          </Button>
        )}
        
        {!collapsed && (
          <button
            onClick={() => setFocusDialogOpen(true)}
            className="flex items-center justify-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity py-1 group"
          >
            <span className="text-[9px] text-sidebar-muted/40 tracking-[0.2em] uppercase font-black group-hover:text-sidebar-muted transition-colors">By:</span>
            <img src={focusLogo} alt="Focus" className="h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </button>
        )}
      </SidebarFooter>


      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ativar Spartan Pro</DialogTitle>
            <DialogDescription>
              Insira sua chave de licença para desbloquear todas as funcionalidades e conectar ao banco de dados oficial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="SPARTAN-XXXX-XXXX"
              className="font-mono text-center tracking-widest"
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleActivate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">Ativar Agora</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={focusDialogOpen} onOpenChange={setFocusDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none overflow-visible [&>button]:hidden">
          <div className="relative flex items-center justify-center p-10">
            {/* Glow rings */}
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-accent/10 blur-2xl animate-pulse [animation-delay:0.5s]" />
            <div className="absolute inset-8 rounded-full bg-info/10 blur-xl animate-pulse [animation-delay:1s]" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <img
                src={focusLogo}
                alt="Focus"
                className="h-20 drop-shadow-[0_0_30px_hsl(174,58%,42%,0.6)]"
              />
              <p className="text-xs text-muted-foreground/80 tracking-widest uppercase">
                Tecnologia & Inovação
              </p>
            </div>
            
            {/* Hidden Demo Mode Trigger - Only for Producton (non-dev) */}
            {isSystemAccess && !isDeveloper && (
              <button 
                onClick={() => {
                  deactivateLicense();
                  setFocusDialogOpen(false);
                }}
                className="absolute bottom-2 left-2 text-[6px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors uppercase tracking-[0.2em] cursor-default"
              >
                demonstração
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
