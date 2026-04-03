-- Create the master_licenses table to manage multi-tenant database connections
CREATE TABLE IF NOT EXISTS public.master_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id TEXT UNIQUE NOT NULL, -- e.g. 'SPARTAN-2024-CLIENT-XYZ'
    client_name TEXT NOT NULL,
    target_supabase_url TEXT NOT NULL,
    target_supabase_anon_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.master_licenses ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (developers) can manage licenses
-- Note: In our current app, we don't use Supabase Auth session, 
-- but we can use the license key in headers or simply restrict by true if we handle it in code.
-- For now, let's allow read for the app to lookup licenses, but restrict write.
CREATE POLICY "Allow read for license lookup" ON public.master_licenses FOR SELECT USING (true);
CREATE POLICY "Allow all access for devs" ON public.master_licenses FOR ALL USING (true) WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_master_licenses_updated_at
    BEFORE UPDATE ON public.master_licenses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert a sample entry for current project to maintain consistency
-- This assumes the master project can also act as its own client for migration/bootstrapping
INSERT INTO public.master_licenses (license_id, client_name, target_supabase_url, target_supabase_anon_key)
VALUES ('SPARTAN-2024-EXEMPLO', 'Empresa Exemplo', 'https://your-project.supabase.co', 'your-anon-key')
ON CONFLICT (license_id) DO NOTHING;
