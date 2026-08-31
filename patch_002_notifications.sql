-- =====================================================================
-- OLHAÍ — Patch 002: notificações
-- Rode isso no SQL Editor do Supabase, depois dos patches 001.
--
-- O que faz:
-- 1. Cria a tabela `notifications` (uma por vendedor).
-- 2. RLS: cada vendedor só lê/atualiza as próprias notificações.
-- 3. Trigger automático: quando alguém clica em "Chamar no WhatsApp"
--    (insert em contact_events), o vendedor recebe uma notificação.
-- 4. Trigger automático: quando um perfil é criado, o vendedor recebe
--    uma notificação de boas-vindas.
-- =====================================================================

create type notification_type as enum ('contact', 'welcome', 'system');

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  product_id uuid references products(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_created on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "seller reads own notifications" on notifications
  for select using (user_id = auth.uid());

create policy "seller updates own notifications" on notifications
  for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Trigger: notifica o vendedor a cada clique no WhatsApp do produto dele
-- ---------------------------------------------------------------------
create or replace function notify_seller_on_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seller_id uuid;
  v_title text;
begin
  select p.seller_id, p.title into v_seller_id, v_title
  from public.products p
  where p.id = new.product_id;

  if v_seller_id is not null then
    insert into public.notifications (user_id, type, title, body, product_id)
    values (
      v_seller_id,
      'contact',
      'Novo contato recebido',
      'Alguém chamou você no WhatsApp sobre "' || coalesce(v_title, 'seu anúncio') || '".',
      new.product_id
    );
  end if;

  return new;
end;
$$;

create trigger trg_notify_seller_on_contact
  after insert on contact_events
  for each row execute function notify_seller_on_contact();

-- ---------------------------------------------------------------------
-- Trigger: notificação de boas-vindas ao criar o perfil
-- ---------------------------------------------------------------------
create or replace function notify_welcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, title, body)
  values (
    new.id,
    'welcome',
    'Bem-vindo ao OLHAÍ!',
    'Publique seu primeiro anúncio e comece a vender para quem está pertinho de você.'
  );
  return new;
end;
$$;

create trigger trg_notify_welcome
  after insert on profiles
  for each row execute function notify_welcome();
