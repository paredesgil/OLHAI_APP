// Utilitários usados no fluxo de publicação de anúncio.

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generatePublicCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `OLH-${digits}`;
}

export function buildProductSlug(title: string) {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slugify(title)}-${suffix}`;
}

// Validação simples de WhatsApp brasileiro: DDD (2 dígitos) + número
// (8 ou 9 dígitos) = 10 ou 11 dígitos no total, ignorando formatação.
export function isValidBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}
