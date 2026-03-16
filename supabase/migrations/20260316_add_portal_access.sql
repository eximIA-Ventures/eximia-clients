ALTER TABLE public.welcome_docs ADD COLUMN IF NOT EXISTS portal_access jsonb DEFAULT '{}'::jsonb;
