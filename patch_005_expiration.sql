-- =====================================================================
-- OLHAÍ — Patch 005: expiração automática de anúncios
-- Rode isso no SQL Editor do Supabase, depois dos patches anteriores.
--
-- Problema que resolve: hoje um anúncio publicado fica ativo pra
-- sempre — o vendedor vende/desiste e esquece de mudar o status, e o
-- anúncio segue aparecendo indefinidamente.
--
-- O que faz:
-- 1. Todo anúncio, ao ser publicado ou renovado, ganha automaticamente
--    uma data de expiração (published_at + 30 dias).
-- 2. Uma rotina diária (pg_cron):
--    a) avisa o vendedor 3 dias antes do anúncio expirar;
--    b) expira de verdade (status -> 'expired') o que passou da data,
--       e avisa o vendedor.
-- 3. Nada muda para quem já usa o botão "Renovar" (ProductActions) —
--    ele só atualiza published_at/status, e o trigger recalcula a
--    validade sozinho.
-- =====================================================================

alter table products
  add column if not exists expiring_soon_notified boolean not null default false;

-- ---------------------------------------------------------------------
-- 1. Trigger: define/renova a validade sempre que o anúncio fica ativo
-- ---------------------------------------------------------------------
create or replace function set_product_expiration()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and (
    tg_op = 'INSERT'
    or old.status is distinct from 'active'
    or new.published_at is distinct from old.published_at
  ) then
    new.expires_at := coalesce(new.published_at, now()) + interval '30 days';
    new.expiring_soon_notified := false;
  end if;
  return new;
end;
$$;

create trigger trg_set_product_expiration
  before insert or update on products
  for each row execute function set_product_expiration();

-- ---------------------------------------------------------------------
-- 2. Rotina de manutenção: avisa quem está expirando e expira quem já
--    passou do prazo.
-- ---------------------------------------------------------------------
create or replace function run_expiration_maintenance()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  -- Avisa 3 dias antes de expirar (uma única vez por ciclo de validade)
  for r in
    select id, seller_id, title
    from public.products
    where status = 'active'
      and expiring_soon_notified = false
      and expires_at is not null
      and expires_at <= now() + interval '3 days'
      and expires_at > now()
  loop
    insert into public.notifications (user_id, type, title, body, product_id)
    values (
      r.seller_id,
      'system',
      'Seu anúncio está quase expirando',
      '"' || r.title || '" expira em breve. Renove para continuar recebendo contatos.',
      r.id
    );
    update public.products set expiring_soon_notified = true where id = r.id;
  end loop;

  -- Expira de verdade quem já passou do prazo
  for r in
    select id, seller_id, title
    from public.products
    where status = 'active'
      and expires_at is not null
      and expires_at <= now()
  loop
    update public.products set status = 'expired' where id = r.id;
    insert into public.notifications (user_id, type, title, body, product_id)
    values (
      r.seller_id,
      'system',
      'Anúncio expirado',
      '"' || r.title || '" expirou e não aparece mais nas buscas. Você pode renová-lo a qualquer momento no seu painel.',
      r.id
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Agendamento diário via pg_cron.
--
-- Se o comando abaixo der erro de permissão/extensão não encontrada,
-- ative a extensão "pg_cron" primeiro pelo painel do Supabase em
-- Database → Extensions, depois rode só este bloco de novo.
-- ---------------------------------------------------------------------
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'olhai-expiration-maintenance',
  '0 6 * * *', -- todo dia às 06:00 UTC (03:00 no horário de MS)
  $$select run_expiration_maintenance();$$
);
