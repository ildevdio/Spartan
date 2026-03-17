import { useState } from "react";
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
import { cn } from "@/lib/utils";
import spartanLogo from "@/assets/spartan-logo.png";
import focusLogo from "@/assets/focus-logo.png";

const sections = [
  {
    label: "Cadastro",
    icon: Building2,
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Empresas", url: "/empresas", icon: Building2 },
      { title: "Setores", url: "/setores", icon: Layers },
      { title: "Postos", url: "/postos", icon: Monitor },
    ],
  },
  {
    label: "Análise",
    icon: ClipboardCheck,
    items: [
      { title: "Captura", url: "/captura-posturas", icon: Camera },
      { title: "Análises", url: "/analises", icon: ClipboardCheck },
      { title: "Câmera", url: "/analise-camera", icon: Camera },
      { title: "Psicossocial", url: "/psicossocial", icon: Brain },
      { title: "Questionários", url: "/questionarios-psicossociais", icon: Printer },
    ],
  },
  {
    label: "Resultados",
    icon: FileText,
    items: [
      { title: "Riscos", url: "/riscos", icon: AlertTriangle },
      { title: "Ações", url: "/acoes", icon: ListTodo },
      { title: "Relatórios", url: "/relatorios", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 border-b border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full"
        >
          <img src={spartanLogo} alt="Spartan" className="h-8 shrink-0 object-contain" />
          {!collapsed && (
            <div className="text-left">
              <h1 className="text-xs font-bold tracking-tight text-sidebar-foreground leading-none">
                Spartan
              </h1>
              <p className="text-[8px] text-sidebar-muted mt-0.5 tracking-wide uppercase">Ergonomia & Segurança</p>
            </div>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
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
                  "flex items-center w-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider",
                  "hover:bg-sidebar-accent/30 transition-colors cursor-pointer rounded-sm mx-1",
                  hasActiveItem ? "text-sidebar-primary" : "text-sidebar-muted",
                  collapsed && "justify-center px-0"
                )}>
                  <section.icon className={cn("h-3.5 w-3.5 shrink-0", collapsed ? "" : "mr-1.5")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{section.label}</span>
                      <ChevronDown className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} />
                    </>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenu className="px-1">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title} className="my-0">
                        <SidebarMenuButton asChild className="h-7">
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className={cn(
                              "hover:bg-sidebar-accent/50 transition-colors duration-150",
                              !collapsed && "pl-5"
                            )}
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                          >
                            <item.icon className="mr-1.5 h-3 w-3 shrink-0" />
                            {!collapsed && <span className="text-xs">{item.title}</span>}
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

      <SidebarFooter className="border-t border-sidebar-border px-2 py-1.5">
        {!collapsed && (
          <div className="flex items-center justify-center gap-1.5 overflow-hidden">
            <span className="text-[8px] text-sidebar-muted/70 tracking-wider uppercase whitespace-nowrap">Desenvolvido por:</span>
            <img src={focusLogo} alt="Focus" className="h-3.5" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
