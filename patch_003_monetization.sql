-- =====================================================================
-- OLHAÍ — Patch 003: arquitetura de monetização (SEM cobrança ativa)
-- Rode isso no SQL Editor do Supabase, depois dos patches 001 e 002.
--
-- Princípio central deste patch (conforme o prompt de arquitetura do
-- projeto): separar "recurso tecnicamente preparado" de "recurso
-- comercialmente ativado". Nada aqui cobra ninguém. O único plano
-- comercialmente ativo é o FREE/FUNDADOR (preço R$ 0). Os demais
-- (BASIC, PLUS, PRO, STORE) existem apenas como estrutura, com
-- commercial_status = 'pending_definition' e preços marcados
-- explicitamente como hipótese (price_is_hypothesis = true).
--
-- O que faz:
-- 1. Amplia `plans` com os campos necessários para configuração futura
--    (preço, periodicidade, limites, features, prioridade) sem travar
--    nada agora — limites ficam NULL (= sem limite) até serem aprovados.
-- 2. Amplia `subscriptions` com ciclo de vida (trial, renovação,
--    cancelamento, condição de fundador).
-- 3. Trigger: todo novo vendedor é automaticamente assinante do plano
--    FREE/FUNDADOR, sem nenhuma ação manual ou cobrança.
-- 4. Semeia os 5 planos previstos (1 ativo, 4 "pendentes").
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Ampliação de `plans`
-- ---------------------------------------------------------------------
create type commercial_status as enum ('active', 'pending_definition');
create type billing_interval as enum ('monthly', 'yearly');

alter table plans
  add column if not exists code text,
  add column if not exists price numeric(10,2),
  add column if not exists price_is_hypothesis boolean not null default true,
  add column if not exists billing_interval billing_interval,
  add column if not exists commercial_status commercial_status not null default 'pending_definition',
  add column if not exists is_default boolean not null default false,
  add column if not exists priority int not null default 0,
  add column if not exists ad_limit int,          -- NULL = sem limite definido
  add column if not exists photo_limit int,        -- NULL = sem limite definido
  add column if not exists founder_trial_days int, -- período estendido do fundador, se houver
  add column if not exists features jsonb not null default '{}'::jsonb,
  add column if not exists limits jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_plans_code on plans (code) where code is not null;

create trigger trg_plans_updated_at
  before update on plans
  for each row execute function set_updated_at();

-- Limpa o plano-seed antigo (inserido pelo script base) para recriar
-- todos os 5 planos de forma consistente, sem duplicar.
delete from plans where name = 'Fundador' and code is null;

insert into plans (name, code, description, active, commercial_status, is_default, price, price_is_hypothesis, priority)
values
  ('Free / Fundador', 'free_founder',
   'Plano de lançamento. Uso completo das funcionalidades essenciais do marketplace, sem custo, enquanto o OLHAÍ está em fase de validação.',
   true, 'active', true, 0, false, 0),

  ('Basic', 'basic',
   'PENDENTE DE DEFINIÇÃO COMERCIAL — estrutura preparada, sem cobrança até aprovação de produto.',
   false, 'pending_definition', false, 19.90, true, 1),

  ('Plus', 'plus',
   'PENDENTE DE DEFINIÇÃO COMERCIAL — estrutura preparada, sem cobrança até aprovação de produto.',
   false, 'pending_definition', false, 34.90, true, 2),

  ('Pro', 'pro',
   'PENDENTE DE DEFINIÇÃO COMERCIAL — estrutura preparada, sem cobrança até aprovação de produto.',
   false, 'pending_definition', false, 59.90, true, 3),

  ('Store / Loja', 'store',
   'PENDENTE DE DEFINIÇÃO COMERCIAL — estrutura preparada, sem cobrança até aprovação de produto.',
   false, 'pending_definition', false, 99.90, true, 4);

-- ---------------------------------------------------------------------
-- 2. Ampliação de `subscriptions`
-- ---------------------------------------------------------------------
alter table subscriptions
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists renewed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists is_founder boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create trigger trg_subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

create index if not exists idx_subscriptions_seller_status on subscriptions (seller_id, status);

-- ---------------------------------------------------------------------
-- 3. Trigger: todo novo vendedor entra automaticamente no Free/Fundador
-- ---------------------------------------------------------------------
create or replace function assign_default_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan_id uuid;
begin
  select id into v_plan_id from public.plans where is_default = true limit 1;

  if v_plan_id is not null then
    insert into public.subscriptions (seller_id, plan_id, status, is_founder)
    values (new.id, v_plan_id, 'active', true);
  end if;

  return new;
end;
$$;

create trigger trg_assign_default_plan
  after insert on profiles
  for each row execute function assign_default_plan();

-- ---------------------------------------------------------------------
-- 4. RLS: pública apenas para planos comercialmente ativos (hoje, só o
--    Free/Fundador aparece numa eventual tela de preços); vendedor
--    continua vendo a própria assinatura via policy já existente.
-- ---------------------------------------------------------------------
drop policy if exists "public read plans" on plans;

create policy "public read active commercial plans" on plans
  for select using (commercial_status = 'active' and active = true);

-- Moderação/admin pode ver todos os planos (inclusive os pendentes),
-- útil para telas internas de configuração comercial futura.
create policy "admins read all plans" on plans
  for select using (is_moderator_or_admin());
