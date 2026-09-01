// Sessão anônima local (seção 25.4: "Compradores anônimos poderão ser
// medidos por session_id não identificável"). Não é login — é só um
// UUID salvo no navegador para as RPCs de deduplicação de eventos
// (register_product_view / register_contact_event).
const STORAGE_KEY = "olhai_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
