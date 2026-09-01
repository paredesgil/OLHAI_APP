-- =====================================================================
-- OLHAÍ — Patch 007: correção urgente (404 em todos os anúncios)
-- Rode isso AGORA no SQL Editor do Supabase.
--
-- O que aconteceu: o patch_001 restringiu a leitura pública da tabela
-- `profiles` a uma lista específica de colunas (por segurança, pra
-- esconder o whatsapp). Quando o patch_006 adicionou as colunas
-- is_verified/verified_at depois, elas nunca entraram nessa lista —
-- então toda consulta à página de um anúncio (que lê se o vendedor é
-- verificado) passava a ser bloqueada pelo banco, e a página caía em
-- 404. Reproduzi o erro localmente ("permission denied for table
-- profiles") antes de escrever esta correção.
--
-- O que este patch faz: libera a leitura pública SOMENTE dessas duas
-- colunas novas — o whatsapp continua protegido exatamente como antes
-- (testei os dois cenários).
-- =====================================================================

grant select (is_verified, verified_at) on profiles to anon, authenticated;
