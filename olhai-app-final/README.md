# OLHAÍ — MVP Web/PWA

App do comprador (Home → Busca → Produto → WhatsApp), construído com Next.js
+ Tailwind + Supabase, seguindo o Documento Mestre do projeto OLHAÍ.

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha com suas chaves do Supabase
npm run dev
```

Sem preencher o `.env.local`, o app roda normalmente com dados de
demonstração (src/lib/data/mock.ts), então dá pra ver tudo funcionando
antes de conectar o banco real.

## Conectar seu Supabase

1. No painel do Supabase: Project Settings → API.
2. Copie a **Project URL** e a **anon/public key** (nunca a `service_role`).
3. Cole em `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   ```
4. O app passa a consultar as tabelas reais automaticamente
   (`src/lib/data/products.ts`). Confira se os nomes de colunas/relações
   batem com o seu `olhai_database_v1.sql` — ajuste o `.select(...)` se
   houver diferença.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em vercel.com → New Project → importe o repositório.
3. Em Environment Variables, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. A Vercel detecta Next.js automaticamente.

## O que já está pronto

- Home: busca, categorias, destaques, chegou agora
- Busca/listagem com filtro por termo (falta ligar filtros de cidade/preço à query real)
- Página de produto com CTA "Chamar no WhatsApp" (mensagem pré-preenchida)
- PWA instalável (manifest + ícones com o ícone de olho da marca)
- Identidade visual OLHAÍ (laranja/azul-marinho/Inter) aplicada em todo o app

## Próximos passos sugeridos

- Autenticação do vendedor (Supabase Auth) + cadastro em 2 etapas
- Fluxo "Publicar anúncio" em 3 etapas (fotos, produto, local)
- Painel do vendedor (anúncios, visualizações, contatos)
- Registrar eventos reais (product_view, whatsapp_click, share_click,
  search_events) via RPC, como definido na seção 23.4 / 26.8 do Documento Mestre
- Upload de imagens no bucket `product-images`

## Banco de dados

O schema completo está em `olhai_database_v1.sql` (rode no SQL Editor
do Supabase) e o patch de segurança em `patch_001_column_privileges.sql`
(rode logo em seguida, uma vez só). Ambos foram testados localmente
antes da entrega — veja o resumo do que cada um faz no topo dos
próprios arquivos.

O app já está com o código atualizado para usar as RPCs
(`register_product_view`, `register_contact_event`, `register_share_event`,
`register_search_event`, `report_product`, `get_product_contact`) em vez
de INSERT/SELECT direto nas tabelas de evento — é assim que o patch de
segurança espera que o front-end se comunique com o banco.
