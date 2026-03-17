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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import spartanLogo from "@/assets/spartan-logo.png";
import focusLogo from "@/assets/focus-logo.png";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Setores", url: "/setores", icon: Layers },
  { title: "Postos", url: "/postos", icon: Monitor },
];

const analysisItems = [
  { title: "Captura", url: "/captura-posturas", icon: Camera },
  { title: "Análises", url: "/analises", icon: ClipboardCheck },
  { title: "Câmera", url: "/analise-camera", icon: Camera },
  { title: "Psicossocial", url: "/psicossocial", icon: Brain },
];

const reportItems = [
  { title: "Riscos", url: "/riscos", icon: AlertTriangle },
  { title: "Ações", url: "/acoes", icon: ListTodo },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full"
        >
          <img src={spartanLogo} alt="Spartan" className="h-10 shrink-0 object-contain" />
          {!collapsed && (
            <div className="text-left">
              <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-none">
                Spartan
              </h1>
              <p className="text-[9px] text-sidebar-muted mt-0.5 tracking-wide uppercase">Ergonomia & Segurança</p>
            </div>
          )}
        </button>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] py-1">Cadastro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-8">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] py-1">Análise</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-8">
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] py-1">Resultados</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-8">
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-3 py-2">
        {!collapsed && (
          <div className="flex items-center justify-center gap-1.5 overflow-hidden">
            <span className="text-[9px] text-sidebar-muted/70 tracking-wider uppercase whitespace-nowrap">Desenvolvido por:</span>
            <img src={focusLogo} alt="Focus" className="h-4" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
