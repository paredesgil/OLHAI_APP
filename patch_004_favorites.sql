-- =====================================================================
-- OLHAÍ — Patch 004: favoritos
-- Rode isso no SQL Editor do Supabase, depois dos patches anteriores.
--
-- Favoritar exige conta (mesma regra do resto do OLHAÍ: comprador
-- pode navegar sem cadastro, mas para salvar algo precisa entrar).
-- =====================================================================

create table favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index idx_favorites_user on favorites (user_id, created_at desc);

alter table favorites enable row level security;

create policy "user reads own favorites" on favorites
  for select using (user_id = auth.uid());

create policy "user inserts own favorites" on favorites
  for insert with check (user_id = auth.uid());

create policy "user deletes own favorites" on favorites
  for delete using (user_id = auth.uid());
