-- ============================================================================
-- eximIA Integration Contract — Integration Tables
-- ============================================================================

-- integration_keys: API keys given to OTHER apps (inbound auth)
create table if not exists public.integration_keys (
  id uuid default gen_random_uuid() primary key,
  app_name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default '{read}',
  status text not null default 'active' check (status in ('active', 'revoked')),
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now() not null
);

-- integration_outbound: Apps YOU call (outbound connections)
create table if not exists public.integration_outbound (
  id uuid default gen_random_uuid() primary key,
  remote_app text not null,
  remote_url text not null,
  api_key_encrypted text not null,
  status text not null default 'active' check (status in ('active', 'error', 'pending', 'disabled')),
  entities text[] default '{}',
  catalog_cache jsonb,
  last_sync timestamptz,
  last_error text,
  created_at timestamptz default now() not null
);

-- integration_logs: All integration calls
create table if not exists public.integration_logs (
  id uuid default gen_random_uuid() primary key,
  direction text not null check (direction in ('inbound', 'outbound')),
  method text not null,
  endpoint text not null,
  entity text,
  status_code integer not null,
  duration_ms integer not null,
  remote_app text,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists idx_integration_logs_created_at on public.integration_logs(created_at);
create index if not exists idx_integration_keys_key_hash on public.integration_keys(key_hash);
create index if not exists idx_integration_outbound_remote_app on public.integration_outbound(remote_app);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.integration_keys enable row level security;
alter table public.integration_outbound enable row level security;
alter table public.integration_logs enable row level security;

-- Service role bypass policies (service_role bypasses RLS by default in Supabase,
-- but explicit policies ensure access for authenticated admin operations)
create policy "Service role full access on integration_keys" on public.integration_keys
  for all using (true) with check (true);

create policy "Service role full access on integration_outbound" on public.integration_outbound
  for all using (true) with check (true);

create policy "Service role full access on integration_logs" on public.integration_logs
  for all using (true) with check (true);
