-- =====================================================================
-- OLHAÍ — Banco de dados v1
-- Baseado no Documento Mestre do Projeto OLHAÍ (Etapas 04A/04B/04C).
-- Rode este script inteiro UMA VEZ no SQL Editor do seu projeto
-- Supabase (Project > SQL Editor > New query > colar > Run).
-- Seguro rodar em um projeto novo/vazio. Não roda em produção sem
-- revisão prévia.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensões
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Enums (seção 26.4)
-- ---------------------------------------------------------------------
create type account_status as enum ('active', 'blocked');
create type product_status as enum ('draft', 'active', 'paused', 'sold', 'expired', 'removed');
create type product_condition as enum ('new', 'used');
create type report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
create type app_role as enum ('seller', 'moderator', 'admin', 'super_admin');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'expired');
create type seller_type as enum ('particular', 'empresa');
create type contact_channel as enum ('whatsapp');

-- ---------------------------------------------------------------------
-- 2. Tabelas de referência (seção 25.3 / 26.2 — Marketplace)
-- ---------------------------------------------------------------------
create table states (
  id serial primary key,
  name text not null,
  uf char(2) not null unique
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  state_id int not null references states(id),
  name text not null,
  active boolean not null default true
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int,
  active boolean not null default true
);

-- ---------------------------------------------------------------------
-- 3. Identidade — profiles (seção 25.2: auth.users é a única fonte de
--    autenticação; profiles guarda os dados públicos/comerciais)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  whatsapp text not null,
  city_id uuid not null references cities(id),
  seller_type seller_type not null default 'particular',
  avatar_url text,
  account_status account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  primary key (user_id, role)
);

-- ---------------------------------------------------------------------
-- 4. Produtos (seção 26.3 — regras de dados críticas)
-- ---------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  slug text not null unique,
  seller_id uuid not null references profiles(id),
  category_id uuid not null references categories(id),
  city_id uuid not null references cities(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) <= 5000),
  price numeric(12,2) not null check (price > 0),
  condition product_condition not null,
  status product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  expires_at timestamptz
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null check (sort_order between 1 and 8),
  unique (product_id, sort_order)
);

-- ---------------------------------------------------------------------
-- 5. Analytics (seção 26.2 — eventos anônimos controlados)
-- ---------------------------------------------------------------------
create table product_views (
  id bigserial primary key,
  product_id uuid not null references products(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now()
);

create table contact_events (
  id bigserial primary key,
  product_id uuid not null references products(id) on delete cascade,
  channel contact_channel not null default 'whatsapp',
  session_id text not null,
  created_at timestamptz not null default now()
);

create table share_events (
  id bigserial primary key,
  product_id uuid not null references products(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now()
);

create table search_events (
  id bigserial primary key,
  term text not null,
  normalized_term text not null,
  has_results boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. Segurança e operação
-- ---------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  reporter_session_id text,
  reason text not null,
  status report_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table admin_actions (
  id bigserial primary key,
  admin_id uuid not null references auth.users(id),
  action text not null,
  target_table text not null,
  target_id text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. Monetização futura (estrutura, fora do MVP de uso)
-- ---------------------------------------------------------------------
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id),
  plan_id uuid not null references plans(id),
  status subscription_status not null default 'trialing',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. Índices prioritários (seção 26.6)
-- ---------------------------------------------------------------------
create index idx_products_city_status_published on products (city_id, status, published_at desc);
create index idx_products_category_status_published on products (category_id, status, published_at desc);
create index idx_products_seller_status_created on products (seller_id, status, created_at desc);
create index idx_products_status_expires on products (status, expires_at);
create index idx_events_product_created on product_views (product_id, created_at);
create index idx_contact_events_product_created on contact_events (product_id, created_at);
create index idx_share_events_product_created on share_events (product_id, created_at);
create index idx_search_events_term_created on search_events (normalized_term, created_at);
create index idx_reports_status_created on reports (status, created_at);

-- ---------------------------------------------------------------------
-- 9. Triggers: updated_at automático + imutabilidade de seller_id
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create or replace function prevent_seller_id_change()
returns trigger
language plpgsql
as $$
begin
  if new.seller_id <> old.seller_id then
    raise exception 'seller_id não pode ser alterado após a criação do anúncio';
  end if;
  return new;
end;
$$;

create trigger trg_products_seller_immutable
  before update on products
  for each row execute function prevent_seller_id_change();

-- ---------------------------------------------------------------------
-- 10. Funções auxiliares de autorização
-- ---------------------------------------------------------------------
create or replace function has_role(_role app_role)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = _role
  );
$$;

create or replace function is_moderator_or_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select public.has_role('moderator') or public.has_role('admin') or public.has_role('super_admin');
$$;

-- ---------------------------------------------------------------------
-- 11. RPCs de eventos (seção 26.8 — INSERT controlado, não irrestrito)
-- ---------------------------------------------------------------------

-- Visualização de produto: deduplica mesma sessão/produto em 30 min.
create or replace function register_product_view(p_product_id uuid, p_session_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.product_views
    where product_id = p_product_id
      and session_id = p_session_id
      and created_at > now() - interval '30 minutes'
  ) then
    insert into public.product_views (product_id, session_id)
    values (p_product_id, p_session_id);
  end if;
end;
$$;

-- Clique de contato (WhatsApp): deduplica mesma sessão/canal em 15 min.
create or replace function register_contact_event(
  p_product_id uuid,
  p_channel contact_channel,
  p_session_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.contact_events
    where product_id = p_product_id
      and channel = p_channel
      and session_id = p_session_id
      and created_at > now() - interval '15 minutes'
  ) then
    insert into public.contact_events (product_id, channel, session_id)
    values (p_product_id, p_channel, p_session_id);
  end if;
end;
$$;

create or replace function register_share_event(p_product_id uuid, p_session_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.share_events (product_id, session_id)
  values (p_product_id, p_session_id);
end;
$$;

-- Busca (inclusive sem resultado) — seção 23.11: identificar demanda reprimida.
create or replace function register_search_event(p_term text, p_has_results boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.search_events (term, normalized_term, has_results)
  values (p_term, lower(trim(p_term)), p_has_results);
end;
$$;

-- Contato do vendedor: só retorna WhatsApp de produto/vendedor ativos
-- (evita expor a coluna profiles.whatsapp direto pela API pública).
create or replace function get_product_contact(p_product_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select pr.whatsapp
  from public.products p
  join public.profiles pr on pr.id = p.seller_id
  where p.id = p_product_id
    and p.status = 'active'
    and pr.account_status = 'active';
$$;

-- Denúncia de anúncio.
create or replace function report_product(p_product_id uuid, p_reason text, p_session_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.reports (product_id, reason, reporter_session_id)
  values (p_product_id, p_reason, p_session_id);
end;
$$;

-- ---------------------------------------------------------------------
-- 12. Row Level Security
-- ---------------------------------------------------------------------
alter table states enable row level security;
alter table cities enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_views enable row level security;
alter table contact_events enable row level security;
alter table share_events enable row level security;
alter table search_events enable row level security;
alter table reports enable row level security;
alter table admin_actions enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;

-- Leitura pública de dados de referência
create policy "public read states" on states for select using (true);
create policy "public read cities" on cities for select using (active);
create policy "public read categories" on categories for select using (active);
create policy "public read plans" on plans for select using (active);

-- Perfis: leitura pública de dados básicos; edição restrita ao próprio dono
create policy "public read profiles" on profiles for select using (true);
create policy "seller inserts own profile" on profiles for insert with check (auth.uid() = id);
create policy "seller updates own profile" on profiles for update using (auth.uid() = id);

-- user_roles: só admins enxergam; ninguém insere via API pública
create policy "admins read user_roles" on user_roles for select using (is_moderator_or_admin());

-- Produtos: leitura pública somente de anúncios ativos e não expirados;
-- vendedor gerencia (select/insert/update) somente os próprios.
create policy "public read active products" on products
  for select using (
    (status = 'active' and (expires_at is null or expires_at > now()))
    or seller_id = auth.uid()
    or is_moderator_or_admin()
  );

create policy "seller inserts own product" on products
  for insert with check (seller_id = auth.uid());

create policy "seller updates own product" on products
  for update using (seller_id = auth.uid() or is_moderator_or_admin());

-- Imagens: seguem a visibilidade do produto; só o dono insere/apaga.
create policy "public read images of visible products" on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
        and (
          (p.status = 'active' and (p.expires_at is null or p.expires_at > now()))
          or p.seller_id = auth.uid()
          or is_moderator_or_admin()
        )
    )
  );

create policy "seller manages own product images" on product_images
  for all using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id and p.seller_id = auth.uid()
    )
  );

-- Eventos: sem SELECT/INSERT direto pela API pública — tudo passa pelas
-- RPCs (security definer) acima. O vendedor pode LER eventos dos
-- próprios produtos (para as métricas do painel).
create policy "seller reads own product views" on product_views
  for select using (
    exists (select 1 from products p where p.id = product_views.product_id and p.seller_id = auth.uid())
  );

create policy "seller reads own contact events" on contact_events
  for select using (
    exists (select 1 from products p where p.id = contact_events.product_id and p.seller_id = auth.uid())
  );

create policy "seller reads own share events" on share_events
  for select using (
    exists (select 1 from products p where p.id = share_events.product_id and p.seller_id = auth.uid())
  );

create policy "admins read search events" on search_events
  for select using (is_moderator_or_admin());

-- Denúncias: qualquer um pode criar (via RPC); só moderação lê/atualiza.
create policy "moderation reads reports" on reports
  for select using (is_moderator_or_admin());

create policy "moderation updates reports" on reports
  for update using (is_moderator_or_admin());

-- Auditoria administrativa: só admins.
create policy "admins read admin_actions" on admin_actions
  for select using (is_moderator_or_admin());

-- Assinaturas: vendedor vê as próprias.
create policy "seller reads own subscriptions" on subscriptions
  for select using (seller_id = auth.uid());

-- ---------------------------------------------------------------------
-- 13. Storage — bucket product-images (seção 26.9)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images bucket"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "owner uploads to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner updates own files"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner deletes own files"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- 14. Dados iniciais (seção 27.1 — MS, Corumbá, Ladário, categorias, plano)
-- ---------------------------------------------------------------------
insert into states (name, uf) values ('Mato Grosso do Sul', 'MS');

insert into cities (state_id, name)
select id, 'Corumbá - MS' from states where uf = 'MS'
union all
select id, 'Ladário - MS' from states where uf = 'MS'
union all
select id, 'Campo Grande - MS' from states where uf = 'MS';

insert into categories (name, slug, icon, sort_order) values
  ('Veículos', 'veiculos', 'car', 1),
  ('Motos', 'motos', 'bike', 2),
  ('Náutica', 'nautica', 'anchor', 3),
  ('Agro', 'agro', 'tractor', 4),
  ('Imóveis', 'imoveis', 'home', 5),
  ('Eletrônicos', 'eletronicos', 'tv', 6),
  ('Celulares', 'celulares', 'phone', 7),
  ('Casa', 'casa-e-moveis', 'sofa', 8),
  ('Ferramentas', 'ferramentas', 'wrench', 9),
  ('Máquinas', 'maquinas', 'cog', 10),
  ('Moda', 'moda', 'shirt', 11),
  ('Esportes', 'esportes', 'dumbbell', 12),
  ('Outros', 'outros', 'grid', 13);

insert into plans (name, description) values
  ('Fundador', 'Plano de lançamento para os primeiros vendedores do OLHAÍ.');

-- =====================================================================
-- Fim do script. Depois de rodar:
-- 1. Crie um vendedor de teste em Authentication > Users.
-- 2. Insira o profile correspondente (id = id do usuário criado).
-- 3. Confirme em Table Editor que as tabelas e policies aparecem.
-- =====================================================================
