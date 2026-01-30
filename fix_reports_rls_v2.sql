-- ==============================================================================
-- SCRIPT DE SEGURANÇA (RLS) V4 - ISOLAMENTO DE RELATÓRIOS
-- ==============================================================================

-- 1. Habilitar RLS na tabela de reports (se já não estiver)
alter table public.reports enable row level security;

-- 2. Limpar políticas antigas para evitar conflitos
drop policy if exists "Admins têm acesso total" on public.reports;
drop policy if exists "RLS_Reports_All" on public.reports;
drop policy if exists "RLS_Reports_Select" on public.reports;
drop policy if exists "RLS_Reports_Write" on public.reports;
drop policy if exists "Admin All" on public.reports;
drop policy if exists "Global Read" on public.reports;
drop policy if exists "Leader Access" on public.reports;

-- 3. Função auxiliar para pegar role e campus (para garantir consistência)
create or replace function public.get_my_role_data()
returns table (role text, campus_id text) as $$
  select role, campus_id from public.user_roles where id = auth.uid();
$$ language sql security definer;

-- ==============================================================================
-- POLÍTICAS
-- ==============================================================================

-- A. ADMIN: ACESSO TOTAL (Select, Insert, Update, Delete)
create policy "Admin All"
on public.reports
for all
using (
  (select role from public.get_my_role_data()) = 'admin'
);

-- B. GLOBAL VIEWER (Presidente): APENAS LEITURA (Select) de TUDO
create policy "Global Viewer Read All"
on public.reports
for select
using (
  (select role from public.get_my_role_data()) = 'global_viewer'
);

-- C. CAMPUS LEADER (Pastor Local): ACESSO APENAS AO SEU CAMPUS
--    Pode ver, criar e editar APENAS se o campus_id do relatório bater com o dele.

-- C.1 Select (Ver)
create policy "Leader Select Own"
on public.reports
for select
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

-- C.2 Insert (Criar)
create policy "Leader Insert Own"
on public.reports
for insert
with check (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

-- C.3 Update (Editar)
create policy "Leader Update Own"
on public.reports
for update
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

-- C.4 Delete (Deletar)
create policy "Leader Delete Own"
on public.reports
for delete
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);
