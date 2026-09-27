"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNotifications } from "@/hooks/use-notifications";

function formatNotificationTime(date: string) {
  return new Date(date).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PortalHeader() {
  const { data: session } = useSession();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((item) => item.read_at === null) ?? [];
  const userName = session?.user.name ?? "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex min-h-16 w-full items-center gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur-sm sm:gap-5 sm:px-6 lg:px-9">
      <search className="group relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
        <Input
          type="search"
          className="h-11 w-full rounded-xl border-slate-200 bg-white pl-10 pr-3 text-sm shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 sm:text-base"
          placeholder="Busca el titulo o el id de tu solicitud"
        />
      </search>
      <div className="relative shrink-0">
        <Button
          type="button"
          aria-expanded={notificationsOpen}
          aria-haspopup="true"
          aria-label="Ver notificaciones"
          className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500/25 active:scale-95"
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <Bell className="size-5" />
          {unread.length > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-slate-50">
              {unread.length}
            </span>
          )}
        </Button>
        {notificationsOpen && (
          <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Notificaciones
                </p>
                <p className="text-xs text-slate-400">
                  {unread.length === 1
                    ? "1 pendiente"
                    : `${unread.length} pendientes`}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-900 focus-visible:outline-none focus-visible:underline"
                onClick={() => setNotificationsOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  No tienes notificaciones.
                </p>
              ) : (
                notifications.map((notification) => {
                  const isUnread = notification.read_at === null;
                  return (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 ${isUnread ? "bg-emerald-50/60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            isUnread ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {isUnread ? "Nueva notificación" : "Notificación"}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-slate-400">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 sm:size-9">
          {userInitial}
        </span>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-36 truncate text-xs font-semibold text-slate-800">
            {userName}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Sesión activa</p>
        </div>
      </div>
    </header>
  );
}
