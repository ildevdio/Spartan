
CREATE TABLE public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  workstation_id uuid REFERENCES public.workstations(id) ON DELETE SET NULL,
  questionnaire_type text NOT NULL DEFAULT 'nasa-tlx',
  respondent_name text NOT NULL DEFAULT '',
  responses jsonb NOT NULL DEFAULT '{}',
  scores jsonb NOT NULL DEFAULT '{}',
  total_score numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to questionnaire_responses"
  ON public.questionnaire_responses
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
