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

// Formata progressivamente enquanto a pessoa digita:
// (67) 99646-3234 (celular) ou (67) 3241-1234 (fixo).
export function formatBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
