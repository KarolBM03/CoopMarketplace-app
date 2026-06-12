import { Bell, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getNotificationsPage,
  markNotificationAsRead,
} from "../../services/notification.service";
import { useAuthStore } from "../../store/auth.store";
import type { AppNotification } from "../../types/finance.types";

export default function SellerNotificationsPage() {
  const user = useAuthStore.getState().user;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getNotificationsPage(user.id, page, 6);
    setNotifications(data.notifications);
    setTotalPages(data.pagination.totalPages);
    setTotal(data.pagination.total);
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Notificaciones
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Notificaciones
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <div className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -right-3 -top-3 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white">
              {total}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-white"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-800">
              Todo esta al dia
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Cuando llegue una alerta importante, aparecera aqui.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {notification.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {notification.message}
                  </p>
                  <p className="mt-4 text-sm text-slate-400">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      notification.read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {notification.read ? "Leida" : "Nueva"}
                  </span>

                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      Marcar leida
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm font-black text-slate-600">
            Pagina {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
