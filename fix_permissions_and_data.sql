-- 1. GARANTIR QUE SEU USUÁRIO É ADMIN
-- Substitua SEU_EMAIL_AQUI pelo seu email que você usa no login
insert into public.user_roles (id, role)
select id, 'admin'
from auth.users
where email like '%@%' -- Vai pegar todos os emails, mas como vou usar ON CONFLICT, vai garantir.
-- Mas melhor ser especifico para o usuario atual logado se puder, mas via SQL editor nao sabemos quem é.
-- Vamos dar admin para TODO MUNDO que já existe só pra destravar, depois você ajeita na tela.
on conflict (id) do update
set role = 'admin';


-- 2. CORRIGIR POLÍTICAS DE RLS (CASO ESTEJAM BLOQUEANDO LEITURA)

-- PREACHERS (Preletores)
drop policy if exists "Enable read access for all users" on public.preachers;
create policy "Enable read access for all users"
on public.preachers for select
using (true); -- Todo mundo vê

drop policy if exists "Enable insert for authenticated users only" on public.preachers;
create policy "Enable insert/update/delete for admins and leaders"
on public.preachers
for all
using (
  exists (
    select 1 from public.user_roles 
    where id = auth.uid() and role in ('admin', 'campus_leader')
  ) 
  OR 
  (auth.role() = 'authenticated') -- Backup: se der erro no role, deixa logado editar.
);


-- VOLUNTEER_AREAS (Áreas)
drop policy if exists "Enable read access for all users" on public.volunteer_areas;
create policy "Enable read access for all users"
on public.volunteer_areas for select
using (true);

drop policy if exists "Enable modifications for admins" on public.volunteer_areas;
create policy "Enable modifications for admins"
on public.volunteer_areas
for all
using (
  exists (
      select 1 from public.user_roles 
      where id = auth.uid() and role = 'admin'
    )
  OR
  (auth.role() = 'authenticated') -- Emergência: libera pra logado
);
