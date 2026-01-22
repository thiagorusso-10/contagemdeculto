-- ==============================================================================
-- SCRIPT DE CORREÇÃO V5 (ESPECÍFICO PARA inavoluntariado@gmail.com)
-- ==============================================================================

-- 1. LIMPEZA DA FUNÇÃO
drop function if exists public.get_users_management() cascade;

-- 2. RECRIAR FUNÇÃO
create or replace function public.get_users_management()
returns table (
  id uuid,
  email varchar,
  role text,
  campus_id text,
  last_sign_in_at timestamptz
) 
security definer
as $$
begin
  -- Verifica ADMIN
  if not exists (
    select 1 from public.user_roles 
    where id = auth.uid() 
    and role = 'admin'
  ) then
    raise exception 'Acesso negado: Apenas administradores.';
  end if;

  return query
  select 
    au.id,
    au.email::varchar,
    ur.role,
    ur.campus_id,
    au.last_sign_in_at
  from auth.users au
  left join public.user_roles ur on ur.id = au.id
  order by au.created_at desc;
end;
$$ language plpgsql;

-- 3. PERMISSÕES
grant execute on function public.get_users_management() to authenticated;
grant execute on function public.get_users_management() to service_role;

-- 4. DISPARO CERTEIRO: DAR ADMIN PARA inavoluntariado@gmail.com
insert into public.user_roles (id, role)
select id, 'admin' 
from auth.users
where email = 'inavoluntariado@gmail.com'
on conflict (id) do update
set role = 'admin';

-- ==============================================================================
-- Se aparecer "Success", seu usuário inavoluntariado@gmail.com AGORA É ADMIN.
-- ==============================================================================
