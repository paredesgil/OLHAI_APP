-- =====================================================================
-- OLHAÍ — Patch 006: selo de verificação do vendedor (SEM cobrança ativa)
-- Rode isso no SQL Editor do Supabase, depois dos patches anteriores.
--
-- Mesmo princípio do patch 003 (monetização): separar "recurso
-- tecnicamente preparado" de "recurso comercialmente ativado". Esta
-- estrutura permite, no futuro, cobrar por um selo de verificação que
-- prova que o vendedor é confiável — mas hoje ninguém é cobrado, e
-- ninguém fica verificado automaticamente. A aprovação é manual
-- (por um admin/moderador), pensando num fluxo tipo: vendedor solicita
-- → paga (quando isso for ativado de verdade) → time do OLHAÍ revisa
-- → aprova ou recusa.
-- =====================================================================

create type verification_status as enum ('pending', 'approved', 'rejected', 'revoked');

create table seller_verifications (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  status verification_status not null default 'pending',

  -- Preço do selo: mesma lógica do patch 003 — hipótese até aprovação
  -- comercial específica, nunca cobrado automaticamente por este patch.
  price numeric(10,2),
  price_is_hypothesis boolean not null default true,
  commercial_status commercial_status not null default 'pending_definition',

  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_seller_verifications_seller on seller_verifications (seller_id, status);

create trigger trg_seller_verifications_updated_at
  before update on seller_verifications
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Flag rápida em `profiles` (evita ter que consultar a tabela de
-- verificações toda vez só para saber se mostra o selo no perfil).
-- ---------------------------------------------------------------------
alter table profiles
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz;

-- Mantém profiles.is_verified sincronizado sempre que o status de uma
-- verificação mudar (aprovado -> true; revogado/recusado -> false).
create or replace function sync_seller_verified_flag()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved' then
    update public.profiles
    set is_verified = true, verified_at = now()
    where id = new.seller_id;
  elsif new.status in ('rejected', 'revoked') then
    update public.profiles
    set is_verified = false
    where id = new.seller_id;
  end if;
  return new;
end;
$$;

create trigger trg_sync_seller_verified_flag
  after insert or update on seller_verifications
  for each row execute function sync_seller_verified_flag();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table seller_verifications enable row level security;

-- O vendedor pode solicitar (criar) sua própria verificação e acompanhar
-- o status — mas não pode se auto-aprovar (isso exige update, que só
-- admins/moderadores podem fazer).
create policy "seller requests own verification" on seller_verifications
  for insert with check (seller_id = auth.uid());

create policy "seller reads own verification" on seller_verifications
  for select using (seller_id = auth.uid() or is_moderator_or_admin());

create policy "admins review verifications" on seller_verifications
  for update using (is_moderator_or_admin());
