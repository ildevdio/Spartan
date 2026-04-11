import * as React from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLicense } from "@/lib/license-context";
import { cn } from "@/lib/utils";
import { Dock } from "@/components/layout/Dock";
import { isRealDb } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-context";
import { Palette } from "lucide-react";

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
  const { isFullVersion, isDeveloper } = useLicense();
  const { toggleTheme, theme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden bg-background">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 min-h-[64px] flex items-center border-b border-white/[0.05] bg-background/60 backdrop-blur-2xl px-4 sm:px-8 shrink-0 safe-area-top overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-r from-primary/20 via-transparent to-primary/20 pointer-events-none" />
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-2 w-2 rounded-full animate-pulse transition-all duration-500",
                  "shadow-[0_0_15px_rgba(var(--primary),0.4)]",
                  isDeveloper ? "bg-amber-500 shadow-amber-500/50" : (isFullVersion ? "bg-primary shadow-primary/50" : "bg-blue-500 shadow-blue-500/50")
                )} />
                <span className="text-sm font-black text-foreground/90 uppercase tracking-[0.2em] truncate">Spartan Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                 {!isFullVersion && <Badge variant="outline" className="hidden sm:flex border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">Demo Mode</Badge>}
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={toggleTheme}
                   className="h-9 w-9 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-primary transition-all active:scale-95"
                 >
                   <Palette className="h-4 w-4" />
                 </Button>
              </div>
            </div>
          </header>
          <main className={cn(
            "flex-1 px-4 py-8 sm:p-10 overflow-x-hidden overflow-y-auto safe-area-bottom w-full transition-all duration-300",
            isMobile ? "pb-32" : ""
          )}>
            {children}
          </main>
        </div>
        <Dock />
      </div>
    </SidebarProvider>
  );
}
