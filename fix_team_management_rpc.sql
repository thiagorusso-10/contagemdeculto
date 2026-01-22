-- ==============================================================================
-- SCRIPT DE CORREÇÃO V6 (CORREÇÃO DE AMBIGUIDADE)
-- ==============================================================================

-- 1. LIMPEZA
drop function if exists public.get_users_management() cascade;

-- 2. RECRIAR FUNÇÃO (COM ALIAS PARA EVITAR AMBIGUIDADE)
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
  -- Verifica ADMIN (Usando alias 'chk' para não confundir 'id' da tabela com 'id' do retorno)
  if not exists (
    select 1 from public.user_roles chk
    where chk.id = auth.uid() 
    and chk.role = 'admin'
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

-- 4. GRANT ADMIN (REFORÇO)
insert into public.user_roles (id, role)
select id, 'admin' 
from auth.users
where email = 'inavoluntariado@gmail.com'
on conflict (id) do update
set role = 'admin';
