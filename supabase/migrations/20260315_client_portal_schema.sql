-- ============================================================================
-- eximIA Client Portal — Initial Schema
-- ============================================================================

-- Profiles (links auth.users to roles and clients)
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('admin', 'client')) default 'client',
  client_id uuid,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Clients
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text not null,
  email text not null unique,
  phone text,
  logo_url text,
  brand_color text default '#C4A882',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add FK after clients table exists
alter table public.profiles
  add constraint profiles_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

-- Projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  description text default '',
  status text not null check (status in ('planning', 'in_progress', 'review', 'completed', 'on_hold')) default 'planning',
  start_date date,
  end_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Milestones
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  status text not null check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  sort_order integer not null default 0,
  created_at timestamptz default now() not null
);

-- Deliverables
create table if not exists public.deliverables (
  id uuid default gen_random_uuid() primary key,
  milestone_id uuid references public.milestones(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null check (status in ('pending', 'in_progress', 'delivered', 'approved')) default 'pending',
  file_url text,
  created_at timestamptz default now() not null
);

-- Updates (project activity feed)
create table if not exists public.updates (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  content text not null,
  type text not null check (type in ('info', 'milestone', 'deliverable', 'alert')) default 'info',
  created_at timestamptz default now() not null
);

-- Documents
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_at timestamptz default now() not null
);

-- Welcome Documents
create table if not exists public.welcome_docs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null unique,
  hero_title text not null default 'Bem-vindo ao seu projeto',
  hero_subtitle text default '',
  overview text default '',
  what_happens_next jsonb default '[]'::jsonb,
  communication jsonb default '[]'::jsonb,
  team_members jsonb default '[]'::jsonb,
  custom_sections jsonb default '[]'::jsonb,
  pdf_url text,
  generated_at timestamptz default now() not null
);

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_client_id on public.profiles(client_id);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_milestones_project_id on public.milestones(project_id);
create index if not exists idx_deliverables_milestone_id on public.deliverables(milestone_id);
create index if not exists idx_updates_project_id on public.updates(project_id);
create index if not exists idx_documents_project_id on public.documents(project_id);
create index if not exists idx_welcome_docs_project_id on public.welcome_docs(project_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.deliverables enable row level security;
alter table public.updates enable row level security;
alter table public.documents enable row level security;
alter table public.welcome_docs enable row level security;

-- Admins can do everything
create policy "Admins full access on profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

create policy "Users can read own profile" on public.profiles
  for select using (user_id = auth.uid());

create policy "Admins full access on clients" on public.clients
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own record" on public.clients
  for select using (
    id in (select client_id from public.profiles where user_id = auth.uid())
  );

create policy "Admins full access on projects" on public.projects
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own projects" on public.projects
  for select using (
    client_id in (select client_id from public.profiles where user_id = auth.uid())
  );

create policy "Admins full access on milestones" on public.milestones
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own milestones" on public.milestones
  for select using (
    project_id in (
      select id from public.projects where client_id in (
        select client_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Admins full access on deliverables" on public.deliverables
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own deliverables" on public.deliverables
  for select using (
    milestone_id in (
      select id from public.milestones where project_id in (
        select id from public.projects where client_id in (
          select client_id from public.profiles where user_id = auth.uid()
        )
      )
    )
  );

create policy "Admins full access on updates" on public.updates
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own updates" on public.updates
  for select using (
    project_id in (
      select id from public.projects where client_id in (
        select client_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Admins full access on documents" on public.documents
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own documents" on public.documents
  for select using (
    project_id in (
      select id from public.projects where client_id in (
        select client_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Admins full access on welcome_docs" on public.welcome_docs
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

create policy "Clients can read own welcome docs" on public.welcome_docs
  for select using (
    project_id in (
      select id from public.projects where client_id in (
        select client_id from public.profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- Service role bypass (for API routes using admin client)
-- ============================================================================
-- Note: The service_role key bypasses RLS automatically in Supabase.
-- API routes use createAdminClient() which uses the service_role key.
