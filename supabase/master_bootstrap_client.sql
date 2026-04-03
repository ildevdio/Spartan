-- ==========================================
-- SPARTAN MASTER BOOTSTRAP SCRIPT (CLIENT SIDE)
-- Run this in the SQL Editor of your new Supabase project
-- ==========================================

-- 1. UTILITIES & FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE public.ergonomic_method AS ENUM ('RULA', 'REBA', 'ROSA', 'OWAS', 'OCRA', 'ANSI-365');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.analysis_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.action_status AS ENUM ('pending', 'approved', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES

-- Companies (Extended with Logo & License for Multi-tenant)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT DEFAULT '',
  cnpj TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  neighborhood TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  cep TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  license_key TEXT,
  is_pro BOOLEAN DEFAULT false,
  cnae_principal TEXT DEFAULT '',
  cnae_secundario TEXT DEFAULT '',
  activity_risk TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sectors
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workstations
CREATE TABLE IF NOT EXISTS public.workstations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  activity_description TEXT NOT NULL DEFAULT '',
  tasks_performed TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Posture Photos
CREATE TABLE IF NOT EXISTS public.posture_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  posture_type TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analyses
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  method public.ergonomic_method NOT NULL DEFAULT 'REBA',
  score NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  body_parts JSONB NOT NULL DEFAULT '{}',
  analysis_status public.analysis_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk Assessments
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  probability NUMERIC NOT NULL DEFAULT 0,
  exposure NUMERIC NOT NULL DEFAULT 0,
  consequence NUMERIC NOT NULL DEFAULT 0,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  risk_level public.risk_level NOT NULL DEFAULT 'low',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Action Plans
CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_assessment_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  responsible TEXT NOT NULL DEFAULT '',
  deadline DATE,
  status public.action_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Psychosocial Analyses
CREATE TABLE IF NOT EXISTS public.psychosocial_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  workstation_id UUID REFERENCES public.workstations(id) ON DELETE SET NULL,
  evaluator_name TEXT NOT NULL DEFAULT '',
  nasa_tlx_score NUMERIC,
  nasa_tlx_details JSONB,
  hse_it_score NUMERIC,
  hse_it_details JSONB,
  copenhagen_score NUMERIC,
  copenhagen_details JSONB,
  observations TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'AEP',
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  workstation_id UUID REFERENCES public.workstations(id) ON DELETE SET NULL,
  generated_pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TRIGGERS (Auto-update timestamps)
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workstations_updated_at BEFORE UPDATE ON public.workstations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS & SECURITY
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posture_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychosocial_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Creating policies (simplified ALL for now)
DROP POLICY IF EXISTS "Allow all" ON public.companies;
CREATE POLICY "Allow all" ON public.companies FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.sectors;
CREATE POLICY "Allow all" ON public.sectors FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.workstations;
CREATE POLICY "Allow all" ON public.workstations FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.analyses;
CREATE POLICY "Allow all" ON public.analyses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.posture_photos;
CREATE POLICY "Allow all" ON public.posture_photos FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.risk_assessments;
CREATE POLICY "Allow all" ON public.risk_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.action_plans;
CREATE POLICY "Allow all" ON public.action_plans FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.psychosocial_analyses;
CREATE POLICY "Allow all" ON public.psychosocial_analyses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all" ON public.reports;
CREATE POLICY "Allow all" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- 6. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('posture-photos', 'posture-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true) ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Read posture-photos" ON storage.objects FOR SELECT USING (bucket_id = 'posture-photos');
CREATE POLICY "Public Insert posture-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posture-photos');
CREATE POLICY "Public Delete posture-photos" ON storage.objects FOR DELETE USING (bucket_id = 'posture-photos');

CREATE POLICY "Public Read company-logos" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Public Insert company-logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos');
CREATE POLICY "Public Delete company-logos" ON storage.objects FOR DELETE USING (bucket_id = 'company-logos');
