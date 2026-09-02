-- =====================================================================
-- OLHAÍ — Patch 008: torne sua conta administradora
-- Rode isso no SQL Editor do Supabase (não precisa dos patches
-- anteriores de novo — a estrutura de permissões já existe desde o
-- script base; só faltava alguém com o cargo "admin").
--
-- Isso é o que dá acesso ao painel de moderação em /moderacao no app.
-- Testei localmente antes de entregar: um admin consegue ver e agir
-- sobre denúncias; um vendedor comum não vê nada (RLS bloqueia).
-- =====================================================================

-- Troque pelo e-mail da conta que você usa para logar no OLHAÍ.
insert into user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'SEU-EMAIL-AQUI@exemplo.com'
on conflict do nothing;

-- Confirma que funcionou (deve aparecer 1 linha, com role = admin)
select u.email, ur.role
from user_roles ur
join auth.users u on u.id = ur.user_id;
