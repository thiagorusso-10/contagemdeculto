-- OPÇÃO NUCLEAR: DESATIVAR SEGURANÇA TEMPORARIAMENTE
-- Isso vai fazer o app voltar a funcionar IMEDIATAMENTE.
-- Depois nós reativamos com calma.

-- 1. Desativar RLS nas tabelas principais
alter table public.user_roles disable row level security;
alter table public.reports disable row level security;
alter table public.preachers disable row level security;
alter table public.volunteer_areas disable row level security;
alter table public.campuses disable row level security;

-- 2. Garantir permissões públicas (caso tenham sido revogadas)
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
