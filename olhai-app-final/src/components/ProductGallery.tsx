"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return <div className="aspect-square w-full bg-line" />;
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-auto bg-line"
      >
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square w-full shrink-0 snap-center bg-line">
            <Image
              src={url}
              alt={`${alt} — foto ${i + 1}`}
              fill
              sizes="448px"
              priority={i === 0}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <span className="absolute bottom-3 right-3 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-medium text-white">
            {activeIndex + 1}/{images.length}
          </span>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === activeIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
