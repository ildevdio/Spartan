import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 mr-3 shrink-0" onClick={toggleSidebar}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card px-3 sm:px-5 shrink-0">
            <MobileMenuButton />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground tracking-wide truncate">Spartan - Gestão Ergonômica</span>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
