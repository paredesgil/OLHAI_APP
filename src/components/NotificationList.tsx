"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Sparkles, Bell } from "lucide-react";
import { markNotificationRead } from "@/lib/data/events";
import type { NotificationItem } from "@/lib/data/notifications";

const ICONS = {
  contact: MessageCircle,
  welcome: Sparkles,
  system: Bell,
};

function tempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

export function NotificationList({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  async function handleClick(n: NotificationItem) {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
      markNotificationRead(n.id);
    }
    if (n.productSlug) {
      router.push(`/produto/${n.productSlug}`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        return (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
              n.read ? "border-line bg-white" : "border-orange/30 bg-orange/5"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                n.read ? "bg-line text-muted" : "bg-orange text-white"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                {!n.read && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange" />
                )}
              </div>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink/75">
                {n.body}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {tempoRelativo(n.createdAt)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
