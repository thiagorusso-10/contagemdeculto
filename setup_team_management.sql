-- 1. PROTEGER A TABELA USER_ROLES
alter table public.user_roles enable row level security;

-- Política: Apenas Admin pode ver/editar roles
create policy "Admins gerenciam roles"
on public.user_roles
for all
using ( 
  auth.uid() in ( select id from public.user_roles where role = 'admin' ) 
);

-- Política: Usuário pode ver seu próprio role (necessário para get_my_role funcionar se não for security definer? 
-- get_my_role JÁ É security definer, então essa política é opcional, mas boa prática)
create policy "Usuário vê seu próprio role"
on public.user_roles
for select
using ( auth.uid() = id );


-- 2. FUNÇÃO SEGURA PARA LISTAR USUÁRIOS (Backend-for-Frontend)
-- O Supabase não deixa o frontend listar auth.users diretamente.
-- Criamos uma função que só o ADMIN pode chamar.

create or replace function public.get_users_management()
returns table (
  id uuid,
  email text,
  role text,
  campus_id text,
  last_sign_in_at timestamptz
)
security definer -- Roda com privilegios de superusuario do banco (acessa auth.users)
as $$
begin
  -- Verificação de Segurança Manual: Quem chamou é admin?
  if not exists (
    select 1 from public.user_roles 
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Acesso negado: Apenas administradores.';
  end if;

  -- Retorna lista unificada
  return query
  select 
    au.id, 
    au.email::text, 
    ur.role, 
    ur.campus_id,
    au.last_sign_in_at
  from auth.users au
  left join public.user_roles ur on au.id = ur.id
  order by au.email;
end;
$$ language plpgsql;
