-- ==============================================================================
-- SCRIPT DE SEGURANÇA (RLS) - BLOQUEAR GLOBAL VIEWER
-- ==============================================================================

-- 1. Habilitar RLS nas tabelas (garantia)
alter table public.reports enable row level security;
alter table public.preachers enable row level security;
alter table public.volunteer_areas enable row level security;

-- 2. FUNÇÃO AUXILIAR PARA VERIFICAR PERMISSÃO
-- Retorna 'admin', 'global_viewer', 'campus_leader' ou null
create or replace function public.get_user_role(user_id uuid)
returns text as $$
  select role from public.user_roles where id = user_id;
$$ language sql security definer;

create or replace function public.get_user_campus(user_id uuid)
returns text as $$
  select campus_id from public.user_roles where id = user_id;
$$ language sql security definer;

-- 3. POLÍTICAS PARA TABELA 'REPORTS' (RELATÓRIOS)

-- DROP policies antigas para recriar limpo (se houver)
drop policy if exists "Leitura permitida para todos logados" on public.reports;
drop policy if exists "Escrita permitida para todos logados" on public.reports;
drop policy if exists "Permissões de Leitura" on public.reports;
drop policy if exists "Permissões de Escrita" on public.reports;
drop policy if exists "Permissões de Atualização" on public.reports;
drop policy if exists "Permissões de Exclusão" on public.reports;


-- LEITURA:
-- Admin: Tudo
-- Global Viewer: Tudo
-- Líder de Campus: Apenas seu campus
create policy "RLS_Reports_Select" on public.reports
for select
using (
  public.get_user_role(auth.uid()) in ('admin', 'global_viewer')
  OR
  (public.get_user_role(auth.uid()) = 'campus_leader' AND campus_id = public.get_user_campus(auth.uid()))
);

-- INSERÇÃO (INSERT):
-- Admin: Tudo
-- Global Viewer: NADA
-- Líder de Campus: Apenas para seu campus
create policy "RLS_Reports_Insert" on public.reports
for insert
with check (
  public.get_user_role(auth.uid()) = 'admin'
  OR
  (public.get_user_role(auth.uid()) = 'campus_leader' AND campus_id = public.get_user_campus(auth.uid()))
);

-- ATUALIZAÇÃO (UPDATE):
-- Admin: Tudo
-- Global Viewer: NADA
-- Líder de Campus: Apenas seu campus
create policy "RLS_Reports_Update" on public.reports
for update
using (
  public.get_user_role(auth.uid()) = 'admin'
  OR
  (public.get_user_role(auth.uid()) = 'campus_leader' AND campus_id = public.get_user_campus(auth.uid()))
);

-- EXCLUSÃO (DELETE):
-- Admin: Tudo
-- Global Viewer: NADA
-- Líder de Campus: Apenas seu campus
create policy "RLS_Reports_Delete" on public.reports
for delete
using (
  public.get_user_role(auth.uid()) = 'admin'
  OR
  (public.get_user_role(auth.uid()) = 'campus_leader' AND campus_id = public.get_user_campus(auth.uid()))
);
