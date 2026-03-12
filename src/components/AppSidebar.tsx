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
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src={guardianLogo} alt="Guardian" className="h-7 w-7 shrink-0 invert" />
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">Guardian</h1>
              <p className="text-[10px] text-sidebar-muted">Gestão Ergonômica e Segurança</p>
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
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
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
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[9px] text-sidebar-muted">desenvolvido por:</span>
            <img src={focusLogo} alt="Focus" className="h-3" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}