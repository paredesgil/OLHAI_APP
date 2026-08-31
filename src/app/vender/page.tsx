"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, X, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { useLookups } from "@/lib/data/client-lookup";
import { buildProductSlug, generatePublicCode, isValidBrazilianPhone, formatBrazilianPhone } from "@/lib/utils";

type Etapa = 1 | 2 | 3;

interface FotoItem {
  file: File;
  preview: string;
}

export default function VenderPage() {
  const router = useRouter();
  const { categories, cities } = useLookups();
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [condicao, setCondicao] = useState<"new" | "used">("used");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidadeId, setCidadeId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [publicando, setPublicando] = useState(false);

  // Checa login já ao abrir a tela — antes o usuário só descobria que
  // precisava de conta ao tentar publicar, depois de preencher tudo.
  const [checandoLogin, setChecandoLogin] = useState(true);
  const [precisaLogin, setPrecisaLogin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) {
      setChecandoLogin(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setPrecisaLogin(!data.user);
      setChecandoLogin(false);
    });
  }, []);

  // Assim que categorias/cidades reais carregam, seleciona a primeira
  // por padrão (os selects abaixo são controlados).
  if (!categoriaId && categories.length > 0) setCategoriaId(categories[0].id);
  if (!cidadeId && cities.length > 0) setCidadeId(cities[0].id);
  const [erro, setErro] = useState<string | null>(null);

  function handleAddFotos(files: FileList | null) {
    if (!files) return;
    const novas = Array.from(files)
      .slice(0, 8 - fotos.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFotos((prev) => [...prev, ...novas].slice(0, 8));
  }

  function removerFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function publicarAnuncio() {
    setErro(null);

    if (!isValidBrazilianPhone(whatsapp)) {
      setErro("Digite um WhatsApp válido, com DDD (ex: 67999990000).");
      return;
    }

    setPublicando(true);

    if (!isSupabaseConfiguredClient()) {
      // Modo demonstração: sem Supabase, simula publicação e segue direto.
      await new Promise((r) => setTimeout(r, 500));
      setPublicando(false);
      router.push(`/anuncio-publicado?titulo=${encodeURIComponent(titulo)}`);
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setPublicando(false);
      setErro("Você precisa entrar na sua conta para publicar.");
      return;
    }

    const slug = buildProductSlug(titulo);
    const publicCode = generatePublicCode();

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        seller_id: userData.user.id,
        category_id: categoriaId,
        city_id: cidadeId,
        title: titulo,
        description: descricao,
        price: Number(preco.replace(",", ".")),
        condition: condicao,
        status: "active",
        slug,
        public_code: publicCode,
        published_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (productError || !product) {
      setPublicando(false);
      setErro(
        productError?.message ?? "Não foi possível publicar o anúncio. Tente novamente."
      );
      return;
    }

    // Upload das fotos para o bucket product-images (seção 26.9)
    for (let i = 0; i < fotos.length; i++) {
      const extensao = fotos[i].file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userData.user.id}/${product.id}/${i}.${extensao}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, fotos[i].file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        await supabase.from("product_images").insert({
          product_id: product.id,
          url: publicUrl.publicUrl,
          sort_order: i + 1,
        });
      }
    }

    setPublicando(false);
    router.push(
      `/anuncio-publicado?titulo=${encodeURIComponent(titulo)}&slug=${product.slug}&id=${product.id}`
    );
  }

  if (checandoLogin) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-[13px] text-muted">Carregando...</p>
      </main>
    );
  }

  if (precisaLogin) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10 text-orange">
          <LogIn className="h-6 w-6" />
        </span>
        <div>
          <p className="text-[16px] font-bold text-ink">
            Entre na sua conta para publicar
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Só vendedores com cadastro podem anunciar no OLHAÍ.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Link
            href="/entrar"
            className="rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-2xl border border-line py-3.5 text-[15px] font-semibold text-ink"
          >
            Criar conta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-4 pt-5 pb-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => (etapa === 1 ? router.back() : setEtapa((e) => (e - 1) as Etapa))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5 text-navy" />
        </button>
        <div className="flex-1">
          <p className="text-[13px] font-medium text-muted">
            Publicar anúncio · Etapa {etapa} de 3
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1.5 flex-1 rounded-full ${
                  etapa >= n ? "bg-orange" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {etapa === 1 && (
        <div className="flex flex-1 flex-col">
          <h1 className="mb-1 text-[18px] font-extrabold text-ink">Fotos</h1>
          <p className="mb-4 text-[13px] text-muted">
            Adicione até 8 fotos. A primeira será a capa do anúncio.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {fotos.map((f, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl bg-line"
              >
                <Image src={f.preview} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-navy/85 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    Capa
                  </span>
                )}
                <button
                  onClick={() => removerFoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {fotos.length < 8 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-white text-muted">
                <Camera className="h-6 w-6" />
                <span className="text-[11px]">Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddFotos(e.target.files)}
                />
              </label>
            )}
          </div>

          <button
            disabled={fotos.length === 0}
            onClick={() => setEtapa(2)}
            className="mt-auto rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {etapa === 2 && (
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="mb-1 text-[18px] font-extrabold text-ink">Produto</h1>

          <input
            required
            placeholder="Título do anúncio"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />

          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {(["new", "used"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondicao(c)}
                className={`flex-1 rounded-2xl border py-3 text-[14px] font-semibold ${
                  condicao === c
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-line bg-white text-ink"
                }`}
              >
                {c === "new" ? "Novo" : "Usado"}
              </button>
            ))}
          </div>

          <input
            required
            inputMode="decimal"
            placeholder="Preço (R$)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />

          <textarea
            placeholder="Descrição"
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="resize-none rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />

          <button
            disabled={!titulo || !preco}
            onClick={() => setEtapa(3)}
            className="mt-auto rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {etapa === 3 && (
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="mb-1 text-[18px] font-extrabold text-ink">
            Localização
          </h1>

          <select
            value={cidadeId}
            onChange={(e) => setCidadeId(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            required
            inputMode="numeric"
            placeholder="WhatsApp para contato"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatBrazilianPhone(e.target.value))}
            maxLength={15}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />

          {erro && <p className="text-[13px] text-red-600">{erro}</p>}

          <button
            disabled={!whatsapp || publicando}
            onClick={publicarAnuncio}
            className="mt-auto rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-40"
          >
            {publicando ? "Publicando..." : "Publicar anúncio"}
          </button>
        </div>
      )}
    </main>
  );
}
