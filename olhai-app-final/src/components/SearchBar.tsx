export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/busca" className="w-full">
      <label className="relative block">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="O que você está procurando?"
          className="w-full rounded-2xl border border-line bg-white py-3.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-muted shadow-sm outline-none ring-orange/30 focus:ring-2"
        />
      </label>
    </form>
  );
}
