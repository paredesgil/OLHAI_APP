-- =====================================================================
-- OLHAÍ — Patch 001: restringe leitura direta da coluna whatsapp
-- Rode isso DEPOIS do olhai_database_v1.sql (uma vez só).
--
-- Por quê: a policy "public read profiles" libera SELECT na linha
-- inteira, o que inclui profiles.whatsapp — ou seja, hoje dá pra ler o
-- WhatsApp de qualquer vendedor direto pela tabela, sem passar pela
-- RPC get_product_contact (que só libera para produto/vendedor ativos).
-- Este patch remove esse acesso coluna a coluna: anon/authenticated
-- deixam de enxergar profiles.whatsapp; as RPCs (security definer)
-- continuam funcionando normalmente, pois rodam com privilégio do
-- dono da função, não do usuário que chamou.
-- =====================================================================

revoke select on profiles from anon, authenticated;

grant select (
  id, display_name, city_id, seller_type, avatar_url,
  account_status, created_at
) on profiles to anon, authenticated;

-- O próprio vendedor consegue ver/editar o próprio WhatsApp através da
-- RPC abaixo (roda como security definer e confere auth.uid() = id).
-- Não concedemos SELECT na coluna whatsapp para "authenticated" de forma
-- ampla, porque a RLS aqui é por linha (todas as linhas passam na policy
-- pública) e não por "linha própria" — um grant de coluna amplo
-- reabriria o mesmo vazamento para qualquer vendedor logado, não só o
-- dono do dado.
create or replace function get_my_whatsapp()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select whatsapp from public.profiles where id = auth.uid();
$$;

drop policy if exists "public read profiles" on profiles;

create policy "public read profiles (sem whatsapp)" on profiles
  for select using (true);
