-- ==============================================================================
-- SCRIPT DE SEGURANÇA (RLS) V3 - BLOQUEIO TOTAL DE CONFIGURAÇÕES
-- ==============================================================================

-- 1. FUNÇÃO AUXILIAR (Re-declarando só pra garantir)
create or replace function public.get_user_role(user_id uuid)
returns text as $$
  select role from public.user_roles where id = user_id;
$$ language sql security definer;

-- 2. TABELA PREACHERS (Preletores) -----------------------
alter table public.preachers enable row level security;

drop policy if exists "RLS_Preachers_Select" on public.preachers;
drop policy if exists "RLS_Preachers_All" on public.preachers;

-- Leitura: Todos podem ver
create policy "RLS_Preachers_Select" on public.preachers
for select using (true);

-- Escrita (Insert/Update/Delete): SÓ ADMIN
create policy "RLS_Preachers_Write" on public.preachers
for all
using (public.get_user_role(auth.uid()) = 'admin')
with check (public.get_user_role(auth.uid()) = 'admin');


-- 3. TABELA VOLUNTEER_AREAS (Áreas) ----------------------
alter table public.volunteer_areas enable row level security;

drop policy if exists "RLS_Areas_Select" on public.volunteer_areas;
drop policy if exists "RLS_Areas_All" on public.volunteer_areas;

-- Leitura: Todos podem ver
create policy "RLS_Areas_Select" on public.volunteer_areas
for select using (true);

-- Escrita: SÓ ADMIN
create policy "RLS_Areas_Write" on public.volunteer_areas
for all
using (public.get_user_role(auth.uid()) = 'admin')
with check (public.get_user_role(auth.uid()) = 'admin');


-- 4. TABELA CAMPUSES (Campus) ----------------------------
-- (Geralmente ja é estático, mas bom proteger)
alter table public.campuses enable row level security;

create policy "RLS_Campuses_Select" on public.campuses
for select using (true);

create policy "RLS_Campuses_Write" on public.campuses
for all
using (public.get_user_role(auth.uid()) = 'admin')
with check (public.get_user_role(auth.uid()) = 'admin');

-- ==========================================================
-- FIM. Agora Visualizador Global SÓ OLHA.
-- ==========================================================
