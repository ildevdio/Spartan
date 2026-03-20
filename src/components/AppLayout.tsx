import * as React from "react";
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
        <div className="min-h-screen flex w-full overflow-x-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 min-h-[56px] flex items-center border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-5 shrink-0 safe-area-top relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] gradient-hero-animated pointer-events-none" />
            <MobileMenuButton />
            <div className="flex items-center gap-2 min-w-0 relative z-10">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="text-sm font-medium text-foreground tracking-wide truncate">Dashboard</span>
            </div>
          </header>
          <main className="flex-1 px-4 py-5 sm:p-6 overflow-x-hidden overflow-y-auto safe-area-bottom w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
