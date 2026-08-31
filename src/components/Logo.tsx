import Image from "next/image";

// Marca OLHAÍ — usa a arte final oficial (public/brand/logo-wordmark.png),
// recortada com fundo transparente a partir do material de marca aprovado.
// "iconOnly" mostra só os dois olhos (ícone do app), sem o texto —
// útil em espaços pequenos/quadrados.
export function Logo({
  className = "",
  iconOnly = false,
  compact = false,
}: {
  className?: string;
  iconOnly?: boolean;
  compact?: boolean;
}) {
  if (iconOnly) {
    return (
      <Image
        src="/brand/icon-source.png"
        alt="OLHAÍ"
        width={840}
        height={520}
        className={className}
        priority
      />
    );
  }

  // Versão sem o slogan embutido na imagem — para espaços pequenos
  // (header, barras compactas), onde o texto do slogan encolheria a
  // ponto de ficar ilegível.
  if (compact) {
    return (
      <Image
        src="/brand/logo-wordmark-compact.png"
        alt="OLHAÍ"
        width={1220}
        height={313}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/brand/logo-wordmark.png"
      alt="OLHAÍ — Negócio bom tá por perto."
      width={1220}
      height={390}
      className={className}
      priority
    />
  );
}
