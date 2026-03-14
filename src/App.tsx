import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { CompanyProvider } from "@/lib/company-context";
import DashboardPage from "./pages/DashboardPage";
import EmpresasPage from "./pages/EmpresasPage";
import SetoresPage from "./pages/SetoresPage";
import PostosPage from "./pages/PostosPage";
import AnalisesPage from "./pages/AnalisesPage";
import RiscosPage from "./pages/RiscosPage";
import AcoesPage from "./pages/AcoesPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import AnaliseCameraPage from "./pages/AnaliseCameraPage";
import PostureCapturePage from "./pages/PostureCapturePage";
import PsicossocialPage from "./pages/PsicossocialPage";
import NotFound from "./pages/NotFound";
import { useNativeApp } from "@/hooks/use-native-app";
const queryClient = new QueryClient();

const App = () => {
  useNativeApp();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CompanyProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/setores" element={<SetoresPage />} />
              <Route path="/postos" element={<PostosPage />} />
              <Route path="/analises" element={<AnalisesPage />} />
              <Route path="/riscos" element={<RiscosPage />} />
              <Route path="/acoes" element={<AcoesPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/analise-camera" element={<AnaliseCameraPage />} />
              <Route path="/captura-posturas" element={<PostureCapturePage />} />
              <Route path="/psicossocial" element={<PsicossocialPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </CompanyProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
