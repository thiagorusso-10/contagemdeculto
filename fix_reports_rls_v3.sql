-- ==============================================================================
-- SCRIPT DE SEGURANÇA (RLS) V3 - CORREÇÃO DE TIPO (UUID vs TEXT)
-- ==============================================================================

-- 1. Habilitar RLS na tabela de reports (se já não estiver)
alter table public.reports enable row level security;

-- 2. Limpar políticas antigas
drop policy if exists "Admin All" on public.reports;
drop policy if exists "Global Viewer Read All" on public.reports;
drop policy if exists "Leader Select Own" on public.reports;
drop policy if exists "Leader Insert Own" on public.reports;
drop policy if exists "Leader Update Own" on public.reports;
drop policy if exists "Leader Delete Own" on public.reports;

-- 3. Função auxiliar MELHORADA (Retorna campus_id já tratado)
-- AVISO: Se o banco reclamar que a função já existe com outro retorno, vamos dropar antes.
drop function if exists public.get_my_role_data();

create or replace function public.get_my_role_data()
returns table (role text, campus_id uuid) as $$
begin
    return query
    select 
        r.role, 
        (case when r.campus_id = '' then null else r.campus_id::uuid end) 
    from public.user_roles r
    where r.id = auth.uid();
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- POLÍTICAS CORRIGIDAS (Agora comparando UUID com UUID)
-- ==============================================================================

-- A. ADMIN: ACESSO TOTAL
create policy "Admin All"
on public.reports
for all
using (
  (select role from public.get_my_role_data()) = 'admin'
);

-- B. GLOBAL VIEWER (Presidente): LEITURA TOTAL
create policy "Global Viewer Read All"
on public.reports
for select
using (
  (select role from public.get_my_role_data()) = 'global_viewer'
);

-- C. CAMPUS LEADER: ACESSO RESTRITO AO CAMPUS (UUID = UUID)
create policy "Leader Select Own"
on public.reports
for select
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

create policy "Leader Insert Own"
on public.reports
for insert
with check (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

create policy "Leader Update Own"
on public.reports
for update
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);

create policy "Leader Delete Own"
on public.reports
for delete
using (
  (select role from public.get_my_role_data()) = 'campus_leader'
  and
  campus_id = (select campus_id from public.get_my_role_data())
);
