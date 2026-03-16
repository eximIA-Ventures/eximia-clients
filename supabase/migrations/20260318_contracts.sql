-- ============================================================================
-- eximIA Client Portal — Contract Generation System
-- ============================================================================

-- Contract templates metadata
create table if not exists public.contract_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  type text not null check (type in ('consultoria', 'desenvolvimento', 'saas', 'suporte', 'nda', 'dpa')),
  template_url text,
  variables jsonb default '[]'::jsonb,
  clauses jsonb default '[]'::jsonb,
  status text default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Clause library
create table if not exists public.contract_clauses (
  id uuid default gen_random_uuid() primary key,
  clause_id text not null unique,
  title text not null,
  category text not null,
  body text not null,
  risk_level text default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  applicable_to text[] default '{}',
  is_required boolean default false,
  version text default '1.0.0',
  status text default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Generated contracts
create table if not exists public.contracts (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade not null,
  template_id uuid references public.contract_templates(id),
  title text not null,
  status text default 'draft' check (status in ('draft', 'review', 'approved', 'sent', 'signed', 'cancelled')),
  variables jsonb default '{}'::jsonb,
  included_clauses text[] default '{}',
  generated_pdf_url text,
  generated_docx_url text,
  signature_provider text,
  signature_id text,
  signature_status text,
  signed_pdf_url text,
  signed_at timestamptz,
  notes text,
  created_by text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Contract audit trail
create table if not exists public.contract_audit (
  id uuid default gen_random_uuid() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  action text not null,
  actor text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_contracts_client on public.contracts(client_id);
create index if not exists idx_contracts_project on public.contracts(project_id);
create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_clauses_category on public.contract_clauses(category);
create index if not exists idx_audit_contract on public.contract_audit(contract_id);

-- RLS
alter table public.contract_templates enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_audit enable row level security;

-- Admin full access policies
create policy "Admins full access on contract_templates" on public.contract_templates
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins full access on contract_clauses" on public.contract_clauses
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins full access on contracts" on public.contracts
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own contracts" on public.contracts
  for select using (
    client_id in (select client_id from public.profiles where user_id = auth.uid())
  );

create policy "Admins full access on contract_audit" on public.contract_audit
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own contract audit" on public.contract_audit
  for select using (
    contract_id in (
      select id from public.contracts where client_id in (
        select client_id from public.profiles where user_id = auth.uid()
      )
    )
  );
