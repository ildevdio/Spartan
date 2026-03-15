
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sectors
CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to sectors" ON public.sectors FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workstations
CREATE TABLE public.workstations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  activity_description TEXT NOT NULL DEFAULT '',
  tasks_performed TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to workstations" ON public.workstations FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_workstations_updated_at BEFORE UPDATE ON public.workstations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- Posture Photos
CREATE TABLE public.posture_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  posture_type TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.posture_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to posture_photos" ON public.posture_photos FOR ALL USING (true) WITH CHECK (true);

-- Analyses
CREATE TYPE public.ergonomic_method AS ENUM ('RULA', 'REBA', 'ROSA', 'OWAS', 'OCRA', 'ANSI-365');
CREATE TYPE public.analysis_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE public.analyses (
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
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to analyses" ON public.analyses FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Posture Analyses
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE public.posture_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  joint_angles JSONB NOT NULL DEFAULT '{}',
  ergonomic_scores JSONB NOT NULL DEFAULT '{}',
  risk_level public.risk_level NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.posture_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to posture_analyses" ON public.posture_analyses FOR ALL USING (true) WITH CHECK (true);

-- Risk Assessments
CREATE TABLE public.risk_assessments (
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
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to risk_assessments" ON public.risk_assessments FOR ALL USING (true) WITH CHECK (true);

-- Action Plans
CREATE TYPE public.action_status AS ENUM ('pending', 'approved', 'in_progress', 'completed');

CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_assessment_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  responsible TEXT NOT NULL DEFAULT '',
  deadline DATE,
  status public.action_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to action_plans" ON public.action_plans FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Psychosocial Analyses
CREATE TABLE public.psychosocial_analyses (
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
ALTER TABLE public.psychosocial_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to psychosocial_analyses" ON public.psychosocial_analyses FOR ALL USING (true) WITH CHECK (true);

-- Reports
CREATE TABLE public.reports (
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
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('posture-photos', 'posture-photos', true);
CREATE POLICY "Public read access for posture photos" ON storage.objects FOR SELECT USING (bucket_id = 'posture-photos');
CREATE POLICY "Anyone can upload posture photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posture-photos');
CREATE POLICY "Anyone can update posture photos" ON storage.objects FOR UPDATE USING (bucket_id = 'posture-photos');
CREATE POLICY "Anyone can delete posture photos" ON storage.objects FOR DELETE USING (bucket_id = 'posture-photos');
