import {
  Bell,
  CreditCard,
  Loader2,
  ReceiptText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerFinancings } from "../../services/financing.service";
import { getNotificationsByUser } from "../../services/notification.service";
import { getCustomerOrders } from "../../services/order.service";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

export default function CustomerDashboard() {
  const user = useAuthStore.getState().user;
  const [orders, setOrders] = useState<any[]>([]);
  const [financings, setFinancings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ordersData, financingsData, notificationsData] = await Promise.all(
        [
          getCustomerOrders(user.id),
          getCustomerFinancings(user.id),
          getNotificationsByUser(user.id),
        ],
      );

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFinancings(Array.isArray(financingsData) ? financingsData : []);
      setNotifications(
        Array.isArray(notificationsData) ? notificationsData : [],
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const activeFinancings = financings.filter(
    (financing) => financing.status === "ACTIVE" || financing.status === "LATE",
  );
  const nextInstallment = activeFinancings
    .flatMap((financing) => financing.installments || [])
    .filter((installment) => !installment.paid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];

  const activities = useMemo(() => {
    const orderActivities = orders.slice(0, 3).map((order) => ({
      id: `order-${order.id}`,
      title: `Orden ${String(order.id || "")
        .slice(0, 8)
        .toUpperCase()}`,
      detail: `${statusLabel(order.status)} · RD$${Number(
        order.totalAmount || 0,
      ).toLocaleString()}`,
      date: order.createdAt,
      icon: ShoppingBag,
      to: "/customer/orders",
    }));

    const financingActivities = financings.slice(0, 3).map((financing) => ({
      id: `financing-${financing.id}`,
      title: financing.product?.title || "Financiamiento solicitado",
      detail: `${statusLabel(financing.status)} · RD$${Number(
        financing.totalAmount || 0,
      ).toLocaleString()}`,
      date: financing.createdAt,
      icon: CreditCard,
      to: "/customer/financing",
    }));

    const notificationActivities = notifications.slice(0, 3).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title || "Notificacion",
      detail: item.message || "Nueva actividad en tu cuenta",
      date: item.createdAt,
      icon: Bell,
      to: "/customer/notifications",
    }));

    return [
      ...orderActivities,
      ...financingActivities,
      ...notificationActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      )
      .slice(0, 5);
  }, [orders, financings, notifications]);

  const summaryCards = [
    {
      title: "Mis ordenes",
      value: String(orders.length),
      detail: "Compras realizadas",
      icon: ShoppingBag,
      to: "/customer/orders",
    },
    {
      title: "Financiamientos activos",
      value: String(activeFinancings.length),
      detail: "Pagos en curso",
      icon: CreditCard,
      to: "/customer/financing",
    },
    {
      title: "Proximo pago",
      value: nextInstallment
        ? `RD$${Number(nextInstallment.amount || 0).toLocaleString()}`
        : "Pendiente",
      detail: nextInstallment
        ? new Date(nextInstallment.dueDate).toLocaleDateString()
        : "Sin cuotas vencidas",
      icon: Wallet,
      to: "/customer/financing",
    },
  ];

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              BIENVENIDO
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Hola, {user?.fullName || "cliente"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Administra tus compras, financiamientos y pagos desde un solo
              lugar.
            </p>
          </div>

          <Link
            to="/customer/notifications"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500"
          >
            <Bell className="h-5 w-5" />
            Notificaciones
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {summaryCards.map(({ title, value, detail, icon: Icon, to }) => (
            <Link
              key={title}
              to={to}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  Actual
                </span>
              </div>

              <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {loading ? "..." : value}
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-400">
                {detail}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">Resumen</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Actividad reciente de tus compras y solicitudes.
              </p>
            </div>
            <ReceiptText className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="mt-6 grid gap-3">
            {loading ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-600" />
                <p className="mt-4 text-sm font-bold text-slate-500">
                  Cargando actividad reciente
                </p>
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_6px,#eef2f7_6px,#eef2f7_8px)] p-8">
                <div className="max-w-md">
                  <h3 className="text-lg font-black text-slate-800">
                    Todavia no hay actividad reciente
                  </h3>
                </div>
              </div>
            ) : (
              activities.map(({ id, title, detail, date, icon: Icon, to }) => (
                <Link
                  key={id}
                  to={to}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black text-slate-950">
                      {title}
                    </h3>
                    <p className="truncate text-sm font-medium text-slate-500">
                      {detail}
                    </p>
                  </div>

                  <p className="hidden text-sm font-semibold text-slate-400 sm:block">
                    {date ? new Date(date).toLocaleDateString() : "Sin fecha"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-black">
            <CreditCard className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-black">Financiamiento flexible</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Revisa tus cuotas, proximos pagos y estados pendientes desde el
            panel.
          </p>
          <Link
            to="/customer/financing"
            className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-400"
          >
            Ver financiamientos
          </Link>
        </div>
      </section>
    </div>
  );
}
