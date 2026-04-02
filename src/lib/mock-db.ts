import { v4 as uuidv4 } from "uuid";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, RiskAssessment, ActionPlan, PsychosocialAnalysis, PostureAnalysis } from "./types";

const INITIAL_DATA = {
  companies: [
    {
      id: "demo-company-1",
      name: "Empresa de Demonstração S.A.",
      trade_name: "Demo Logística",
      cnpj: "00.000.000/0001-91",
      cnae_principal: "4930-2/02",
      cnae_secundario: "5211-7/99",
      activity_risk: "Grau 3",
      address: "Av. das Américas, 1000",
      neighborhood: "Barra da Tijuca",
      city: "Rio de Janeiro",
      state: "RJ",
      cep: "22640-100",
      description: "Empresa fictícia para demonstração do sistema Spartan.",
      created_at: new Date().toISOString(),
    },
  ] as Company[],
  sectors: [
    {
      id: "demo-sector-1",
      company_id: "demo-company-1",
      name: "Operacional / Armazém",
      description: "Área de recebimento e expedição de mercadorias.",
      created_at: new Date().toISOString(),
    },
  ] as Sector[],
  workstations: [
    {
      id: "demo-ws-1",
      sector_id: "demo-sector-1",
      name: "Auxiliar de Carga e Descarga",
      description: "Posto responsável pela movimentação de caixas e paletes.",
      activity_description: "Levantamento manual de cargas, transporte e estocagem.",
      tasks_performed: "Carregar caminhões, Organizar estoque, Conferir notas.",
      created_at: new Date().toISOString(),
    },
  ] as Workstation[],
  analyses: [] as Analysis[],
  posture_photos: [] as PosturePhoto[],
  reports: [] as Report[],
  risk_assessments: [] as RiskAssessment[],
  action_plans: [] as ActionPlan[],
  psychosocial_analyses: [] as PsychosocialAnalysis[],
  posture_analyses: [] as PostureAnalysis[],
};

class MockDb {
  private data: typeof INITIAL_DATA;

  constructor() {
    const saved = localStorage.getItem("spartan_mock_db");
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = INITIAL_DATA;
      this.save();
    }
  }

  private save() {
    localStorage.setItem("spartan_mock_db", JSON.stringify(this.data));
  }

  from(table: keyof typeof INITIAL_DATA) {
    return {
      select: (query: string = "*") => {
        return {
          order: (column: string, { ascending = true } = {}) => {
            const result = [...(this.data[table] || [])];
            return Promise.resolve({ data: result, error: null });
          },
          eq: (column: string, value: any) => {
            const result = (this.data[table] as any[]).filter(item => item[column] === value);
            return Promise.resolve({ data: result, error: null });
          },
          then: (resolve: any) => {
            resolve({ data: this.data[table], error: null });
          }
        };
      },
      insert: (item: any) => {
        const newItem = { 
          id: uuidv4(), 
          created_at: new Date().toISOString(), 
          ...item 
        };
        (this.data[table] as any[]).push(newItem);
        this.save();
        return Promise.resolve({ data: [newItem], error: null });
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            const index = (this.data[table] as any[]).findIndex(item => item[column] === value);
            if (index !== -1) {
              this.data[table][index] = { ...this.data[table][index], ...updates };
              this.save();
            }
            return Promise.resolve({ data: null, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            this.data[table] = (this.data[table] as any[]).filter(item => item[column] !== value) as any;
            this.save();
            return Promise.resolve({ data: null, error: null });
          }
        };
      }
    };
  }
}

export const mockDb = new MockDb();

// Simple mock for the supabase client functions
export const mockSupabase = {
  from: (table: string) => mockDb.from(table as any),
  functions: {
    invoke: async (name: string, options?: any) => {
      console.log(`Mock calling function: ${name}`, options);
      if (name === "analyze-cnae-risk") {
        return { data: { risk_level: "3", description: "Risco moderado/alto baseado em CNAE de logística." }, error: null };
      }
      return { data: null, error: null };
    }
  },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  }
};
