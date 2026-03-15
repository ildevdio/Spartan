export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          created_at: string
          deadline: string | null
          description: string
          id: string
          responsible: string
          risk_assessment_id: string
          status: Database["public"]["Enums"]["action_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          responsible?: string
          risk_assessment_id: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          responsible?: string
          risk_assessment_id?: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          analysis_status: Database["public"]["Enums"]["analysis_status"]
          body_parts: Json
          created_at: string
          id: string
          method: Database["public"]["Enums"]["ergonomic_method"]
          notes: string
          score: number
          updated_at: string
          workstation_id: string
        }
        Insert: {
          analysis_status?: Database["public"]["Enums"]["analysis_status"]
          body_parts?: Json
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["ergonomic_method"]
          notes?: string
          score?: number
          updated_at?: string
          workstation_id: string
        }
        Update: {
          analysis_status?: Database["public"]["Enums"]["analysis_status"]
          body_parts?: Json
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["ergonomic_method"]
          notes?: string
          score?: number
          updated_at?: string
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string
          city: string
          cnpj: string
          created_at: string
          description: string
          id: string
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          cnpj?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          state?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          cnpj?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      posture_analyses: {
        Row: {
          created_at: string
          ergonomic_scores: Json
          id: string
          joint_angles: Json
          risk_level: Database["public"]["Enums"]["risk_level"]
          workstation_id: string
        }
        Insert: {
          created_at?: string
          ergonomic_scores?: Json
          id?: string
          joint_angles?: Json
          risk_level?: Database["public"]["Enums"]["risk_level"]
          workstation_id: string
        }
        Update: {
          created_at?: string
          ergonomic_scores?: Json
          id?: string
          joint_angles?: Json
          risk_level?: Database["public"]["Enums"]["risk_level"]
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posture_analyses_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      posture_photos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          notes: string
          posture_type: string
          timestamp: string
          workstation_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string
          notes?: string
          posture_type?: string
          timestamp?: string
          workstation_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          notes?: string
          posture_type?: string
          timestamp?: string
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posture_photos_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      psychosocial_analyses: {
        Row: {
          company_id: string
          copenhagen_details: Json | null
          copenhagen_score: number | null
          created_at: string
          evaluator_name: string
          hse_it_details: Json | null
          hse_it_score: number | null
          id: string
          nasa_tlx_details: Json | null
          nasa_tlx_score: number | null
          observations: string
          workstation_id: string | null
        }
        Insert: {
          company_id: string
          copenhagen_details?: Json | null
          copenhagen_score?: number | null
          created_at?: string
          evaluator_name?: string
          hse_it_details?: Json | null
          hse_it_score?: number | null
          id?: string
          nasa_tlx_details?: Json | null
          nasa_tlx_score?: number | null
          observations?: string
          workstation_id?: string | null
        }
        Update: {
          company_id?: string
          copenhagen_details?: Json | null
          copenhagen_score?: number | null
          created_at?: string
          evaluator_name?: string
          hse_it_details?: Json | null
          hse_it_score?: number | null
          id?: string
          nasa_tlx_details?: Json | null
          nasa_tlx_score?: number | null
          observations?: string
          workstation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychosocial_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychosocial_analyses_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string | null
          content: string
          created_at: string
          generated_pdf: string | null
          id: string
          sector_id: string | null
          title: string
          type: string
          updated_at: string
          workstation_id: string | null
        }
        Insert: {
          company_id?: string | null
          content?: string
          created_at?: string
          generated_pdf?: string | null
          id?: string
          sector_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          workstation_id?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string
          generated_pdf?: string | null
          id?: string
          sector_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          workstation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          analysis_id: string
          consequence: number
          created_at: string
          description: string
          exposure: number
          id: string
          probability: number
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
        }
        Insert: {
          analysis_id: string
          consequence?: number
          created_at?: string
          description?: string
          exposure?: number
          id?: string
          probability?: number
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
        }
        Update: {
          analysis_id?: string
          consequence?: number
          created_at?: string
          description?: string
          exposure?: number
          id?: string
          probability?: number
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string
          id: string
          workstation_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          workstation_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      workstations: {
        Row: {
          activity_description: string
          created_at: string
          description: string
          id: string
          name: string
          sector_id: string
          tasks_performed: string
          updated_at: string
        }
        Insert: {
          activity_description?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          sector_id: string
          tasks_performed?: string
          updated_at?: string
        }
        Update: {
          activity_description?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          sector_id?: string
          tasks_performed?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstations_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_status: "pending" | "approved" | "in_progress" | "completed"
      analysis_status: "pending" | "in_progress" | "completed"
      ergonomic_method: "RULA" | "REBA" | "ROSA" | "OWAS" | "OCRA" | "ANSI-365"
      risk_level: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_status: ["pending", "approved", "in_progress", "completed"],
      analysis_status: ["pending", "in_progress", "completed"],
      ergonomic_method: ["RULA", "REBA", "ROSA", "OWAS", "OCRA", "ANSI-365"],
      risk_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
