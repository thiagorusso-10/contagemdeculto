-- 1. Criar tabela de Roles (se não existir)
create table if not exists public.user_roles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'global_viewer', 'campus_leader')),
  campus_id text, -- Opcional, para líderes de campus
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS (Segurança a Nível de Linha) na tabela de reports
alter table public.reports enable row level security;

-- 3. Criar Políticas de Acesso
-- POLÍTICA 1: Admin pode fazer TUDO (Select, Insert, Update, Delete)
create policy "Admins têm acesso total"
on public.reports
for all
using (
  auth.uid() in (
    select id from public.user_roles where role = 'admin'
  )
);

-- POLÍTICA 2: Por enquanto, para garantir que você não perca acesso antes de se dar o cargo
-- Vamos permitir que você veja seus próprios inserts (fallback) ou temporariamente liberar leitura
-- Mas o ideal é rodar o comando abaixo IMEDIATAMENTE após criar as tabelas.

-- 4. COMANDO PARA SE TORNAR ADMIN (Substitua SEU_EMAIL_AQUI pelo seu email de login)
-- insert into public.user_roles (id, role)
-- select id, 'admin' from auth.users where email = 'SEU_EMAIL_AQUI';

-- 5. Função auxiliar para pegar o role do usuário atual (para uso no frontend/backend)
create or replace function public.get_my_role()
returns json as $$
declare
  user_role text;
  user_campus text;
begin
  select role, campus_id into user_role, user_campus
  from public.user_roles
  where id = auth.uid();
  
  return json_build_object('role', user_role, 'campus_id', user_campus);
end;
$$ language plpgsql security definer;
