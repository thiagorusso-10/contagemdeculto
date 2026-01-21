-- 1. PRELETORES (Habilitar RLS e Permissões)
alter table public.preachers enable row level security;

create policy "Admins gerenciam preletores"
on public.preachers
for all
using ( auth.uid() in ( select id from public.user_roles where role = 'admin' ) );

create policy "Todos leem preletores"
on public.preachers
for select
using ( true );


-- 2. ÁREAS DE VOLUNTÁRIOS (Nova Tabela)
create table if not exists public.volunteer_areas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default now()
);

alter table public.volunteer_areas enable row level security;

create policy "Admins gerenciam areas"
on public.volunteer_areas
for all
using ( auth.uid() in ( select id from public.user_roles where role = 'admin' ) );

create policy "Todos leem areas"
on public.volunteer_areas
for select
using ( true );

-- 3. INSERIR DADOS INICIAIS (Se vazio)
insert into public.volunteer_areas (name)
select name from (values 
  ('Recepção'), ('Kids'), ('Louvor'), ('Mídia'), ('Estacionamento')
) as t(name)
where not exists (select 1 from public.volunteer_areas);
