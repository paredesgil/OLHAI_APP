"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CategoryRow as CategoryRowType } from "@/lib/supabase/types";
import {
  Car,
  Bike,
  Anchor,
  Tractor,
  Home,
  Tv,
  Smartphone,
  Laptop,
  Sofa,
  Wrench,
  Cog,
  Shirt,
  Dumbbell,
  Grid3x3,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  car: Car,
  bike: Bike,
  anchor: Anchor,
  tractor: Tractor,
  home: Home,
  tv: Tv,
  phone: Smartphone,
  laptop: Laptop,
  sofa: Sofa,
  wrench: Wrench,
  cog: Cog,
  shirt: Shirt,
  dumbbell: Dumbbell,
  grid: Grid3x3,
};

const PALETTE = [
  { bg: "#FFF1E6", fg: "#FF6A00" },
  { bg: "#E8F4FF", fg: "#2E90FA" },
  { bg: "#EAFBF0", fg: "#12B76A" },
  { bg: "#FDF2FA", fg: "#DD2590" },
  { bg: "#F4F3FF", fg: "#7A5AF8" },
  { bg: "#FEF6EE", fg: "#F79009" },
  { bg: "#FEF3F2", fg: "#F04438" },
  { bg: "#F0F9FF", fg: "#0BA5EC" },
  { bg: "#F9F5FF", fg: "#9E77ED" },
  { bg: "#ECFDF5", fg: "#10B981" },
  { bg: "#FDF4FF", fg: "#D444F1" },
  { bg: "#EFF8FF", fg: "#155EEF" },
  { bg: "#FFFAEB", fg: "#DC6803" },
  { bg: "#F0FDF9", fg: "#0E9F6E" },
];

export function CategoryRow({ categories }: { categories: CategoryRowType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  function onMouseDown(e: React.MouseEvent) {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      down: true,
      startX: e.pageX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setDragging(true);
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = scrollRef.current;
    if (!el || !dragState.current.down) return;
    const delta = e.pageX - dragState.current.startX;
    if (Math.abs(delta) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScroll - delta;
  }

  function endDrag() {
    dragState.current.down = false;
    setDragging(false);
  }

  function onClickCapture(e: React.MouseEvent) {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative -mx-4">
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClickCapture={onClickCapture}
        onScroll={updateScrollState}
        className={`no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {categories.map((cat, i) => {
          const Icon = ICONS[cat.icon ?? "grid"] ?? Grid3x3;
          const color = PALETTE[i % PALETTE.length];
          return (
            <Link
              key={cat.id}
              href={`/busca?categoria=${cat.slug}`}
              draggable={false}
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: color.bg }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.9} style={{ color: color.fg }} />
              </span>
              <span className="text-center text-[11px] leading-tight text-ink/80">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          aria-label="Ver categorias anteriores"
          className="absolute left-0 top-0 flex h-14 w-10 items-center justify-start bg-gradient-to-r from-bg via-bg/80 to-transparent pl-1"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-muted shadow-sm ring-1 ring-line">
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(240)}
          aria-label="Ver mais categorias"
          className="absolute right-0 top-0 flex h-14 w-14 items-center justify-end bg-gradient-to-l from-bg via-bg/80 to-transparent pr-1"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-muted shadow-sm ring-1 ring-line">
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
