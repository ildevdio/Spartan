import { v4 as uuidv4 } from "uuid";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, RiskAssessment, ActionPlan, PsychosocialAnalysis, PostureAnalysis } from "./types";

import { 
  mockCompanies, 
  mockSectors, 
  mockWorkstations, 
  mockAnalyses, 
  mockPosturePhotos, 
  mockReports, 
  mockRiskAssessments, 
  mockActionPlans, 
  mockPsychosocialAnalyses, 
  mockPostureAnalyses 
} from "./mock-data";

const INITIAL_DATA = {
  companies: mockCompanies,
  sectors: mockSectors,
  workstations: mockWorkstations,
  analyses: mockAnalyses,
  posture_photos: mockPosturePhotos,
  reports: mockReports,
  risk_assessments: mockRiskAssessments,
  action_plans: mockActionPlans,
  psychosocial_analyses: mockPsychosocialAnalyses,
  posture_analyses: mockPostureAnalyses,
};


class MockQueryBuilder {
  private table: string;
  private data: any[];
  private filters: Array<(item: any) => boolean> = [];
  private sortColumn: string | null = null;
  private sortAscending: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;

  constructor(table: string, data: any[]) {
    this.table = table;
    this.data = [...data];
  }

  select(columns: string = "*") {
    // Basic select doesn't change data in this mock
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.sortColumn = column;
    this.sortAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // To make it "thenable" (acts like a Promise)
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    let result = [...this.data];

    // Apply filters
    this.filters.forEach((filter) => {
      result = result.filter(filter);
    });

    // Apply sorting
    if (this.sortColumn) {
      result.sort((a, b) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];
        if (valA < valB) return this.sortAscending ? -1 : 1;
        if (valA > valB) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    const output = this.isSingle 
      ? { data: result[0] || null, error: null }
      : { data: result, error: null };

    return Promise.resolve(output).then(onfulfilled, onrejected);
  }
}

class MockDb {
  private data: typeof INITIAL_DATA;

  constructor() {
    const saved = localStorage.getItem("spartan_mock_db_v2");
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        this.data = INITIAL_DATA;
      }
    } else {
      this.data = INITIAL_DATA;
      this.save();
    }
  }

  private save() {
    localStorage.setItem("spartan_mock_db_v2", JSON.stringify(this.data));
  }


  from(table: keyof typeof INITIAL_DATA | string) {
    const tableData = (this.data as any)[table] || [];
    
    return {
      select: (query: string = "*") => {
        return new MockQueryBuilder(table as string, tableData);
      },
      insert: (item: any) => {
        const newItem = { 
          id: uuidv4(), 
          created_at: new Date().toISOString(), 
          ...item 
        };
        if (!(this.data as any)[table]) {
          (this.data as any)[table] = [];
        }
        (this.data as any)[table].push(newItem);
        this.save();
        return Promise.resolve({ data: [newItem], error: null });
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            const tableItems = (this.data as any)[table] || [];
            const index = tableItems.findIndex((item: any) => item[column] === value);
            if (index !== -1) {
              tableItems[index] = { ...tableItems[index], ...updates };
              this.save();
            }
            return Promise.resolve({ data: null, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            if ((this.data as any)[table]) {
              (this.data as any)[table] = (this.data as any)[table].filter((item: any) => item[column] !== value);
              this.save();
            }
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
  },
  channel: (name: string) => ({
    on: () => ({
      subscribe: () => ({})
    }),
    subscribe: () => ({})
  }),
  removeChannel: (channel: any) => ({})
};
