import { notFound, redirect } from "next/navigation";
import { getMyProductById, getCurrentUser } from "@/lib/data/seller";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { EditarAnuncioForm } from "@/components/EditarAnuncioForm";

export default async function EditarAnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Em modo demonstração (sem Supabase configurado) não há usuário real
  // — mantém o comportamento de exemplo já existente.
  if (!isSupabaseConfigured()) {
    const product = await getMyProductById(id, "demo");
    if (!product) notFound();
    return <EditarAnuncioForm product={product} />;
  }

  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  // getMyProductById já filtra por seller_id = user.id no banco — um
  // anúncio de outro vendedor nunca é retornado aqui, mesmo que a
  // pessoa tente acessar a URL diretamente com o ID de outro anúncio.
  const product = await getMyProductById(id, user.id);
  if (!product) notFound();

  return <EditarAnuncioForm product={product} />;
}
