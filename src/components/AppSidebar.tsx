import {
  LayoutDashboard,
  Building2,
  Monitor,
  ClipboardCheck,
  AlertTriangle,
  ListTodo,
  FileText,
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
import guardianLogo from "@/assets/guardian-logo.png";
import focusLogo from "@/assets/focus-logo.png";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Setores", url: "/setores", icon: Building2 },
  { title: "Postos de Trabalho", url: "/postos", icon: Monitor },
  { title: "Análises", url: "/analises", icon: ClipboardCheck },
  { title: "Matriz de Risco", url: "/riscos", icon: AlertTriangle },
  { title: "Plano de Ação", url: "/acoes", icon: ListTodo },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={guardianLogo} alt="Guardian" className="h-12 w-12 shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                Guardian
              </h1>
              <p className="text-[10px] text-sidebar-muted mt-0.5 tracking-wide uppercase">Ergonomia & Segurança</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-3 py-4">
        {!collapsed && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-sidebar-muted/70 tracking-wider uppercase">desenvolvido por</span>
            <img src={focusLogo} alt="Focus" className="h-4 opacity-60" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}