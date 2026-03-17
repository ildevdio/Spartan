CREATE TABLE public.technical_responsibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  specialization text NOT NULL DEFAULT '',
  professional_registration text NOT NULL DEFAULT '',
  cpf text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  govbr_certificate_id text DEFAULT NULL,
  signature_image_url text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.technical_responsibles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to technical_responsibles"
  ON public.technical_responsibles
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_technical_responsibles_updated_at
  BEFORE UPDATE ON public.technical_responsibles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();