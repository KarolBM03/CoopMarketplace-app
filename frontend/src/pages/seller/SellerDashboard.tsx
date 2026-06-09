import {
  BarChart3,
  Bell,
  ExternalLink,
  Heart,
  Package,
  ShoppingBag,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotificationsByUser } from "../../services/notification.service";
import { getSellerSales } from "../../services/order.service";
import { getSellerProducts } from "../../services/product.services";
import { getWalletByUser } from "../../services/wallet.services";
import { useAuthStore } from "../../store/auth.store";

export default function SellerDashboard() {
  const user = useAuthStore.getState().user;

  const [wallet, setWallet] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    if (!user) return;

    const [walletData, productData, salesData, notificationData] =
      await Promise.all([
        getWalletByUser(user.id),
        getSellerProducts(),
        getSellerSales(),
        getNotificationsByUser(user.id),
      ]);

    setWallet(walletData);
    setProducts(Array.isArray(productData) ? productData : []);
    setSales(Array.isArray(salesData) ? salesData : []);
    setNotifications(Array.isArray(notificationData) ? notificationData : []);
  };

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.price * sale.quantity,
    0,
  );

  const totalFavorites = products.reduce(
    (sum, product) => sum + (product.favorites?.length || 0),
    0,
  );

  const ratedProducts = products.filter(
    (product) => product.ratingCount && product.ratingCount > 0,
  );

  const averageRating =
    ratedProducts.length > 0
      ? ratedProducts.reduce(
          (sum, product) => sum + (product.ratingAverage || 0),
          0,
        ) / ratedProducts.length
      : 0;

  const topProduct = [...products].sort(
    (a, b) => (b.salesCount || 0) - (a.salesCount || 0),
  )[0];

  const bestRatedProduct = [...products]
    .filter((product) => product.ratingCount && product.ratingCount > 0)
    .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0))[0];

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              BIENVENIDO
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Hola, {user?.fullName || "vendedor"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Revisa tus productos, ventas y notificaciones desde un solo lugar.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
          <SummaryCard
            title="Saldo disponible"
            value={`RD$${wallet?.balance?.toLocaleString() || "0"}`}
            detail="Fondos en tu billetera"
            icon={Wallet}
            highlight
          />

          <SummaryCard
            title="Productos activos"
            value={String(products.length)}
            detail="Publicados en marketplace"
            icon={Package}
          />

          <SummaryCard
            title="Ventas totales"
            value={`RD$${totalSales.toLocaleString()}`}
            detail={`${sales.length} ventas registradas`}
            icon={ShoppingBag}
            highlight
          />

          <SummaryCard
            title="Notificaciones"
            value={String(notifications.length)}
            detail="Alertas recientes de tu cuenta"
            icon={Bell}
            to="/seller/notifications"
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
          <SummaryCard
            title="Calificación promedio"
            value={averageRating ? averageRating.toFixed(1) : "0.0"}
            detail={`${ratedProducts.length} productos con opiniones`}
            icon={Star}
            highlight
          />

          <SummaryCard
            title="Favoritos recibidos"
            value={String(totalFavorites)}
            detail="Productos guardados por clientes"
            icon={Heart}
          />

          <SummaryCard
            title="Más vendido"
            value={String(topProduct?.salesCount || 0)}
            detail={topProduct?.title || "Sin ventas"}
            icon={Trophy}
          />

          <SummaryCard
            title="Mejor valorado"
            value={bestRatedProduct?.ratingAverage?.toFixed(1) || "0.0"}
            detail={bestRatedProduct?.title || "Sin opiniones"}
            icon={Star}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Ultimas ventas"
          description="Ventas recientes de tus productos."
          icon={ShoppingBag}
        >
          {sales.length === 0 ? (
            <EmptyState text="Todavia no tienes ventas registradas." />
          ) : (
            sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {sale.product?.title || "Producto"}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    Cantidad: {sale.quantity}
                  </p>
                </div>

                <p className="shrink-0 font-black text-emerald-600">
                  RD${(sale.price * sale.quantity).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </Panel>

        <Panel
          title="Notificaciones"
          description="Alertas recientes de tu cuenta."
          icon={Bell}
        >
          {notifications.length === 0 ? (
            <EmptyState text="No tienes notificaciones nuevas." />
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-black text-slate-950">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {notification.message}
                </p>
              </div>
            ))
          )}
        </Panel>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-black">
              <BarChart3 className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-2xl font-black">Resumen de actividad</h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Accesos rapidos para gestionar tu tienda y revisar los movimientos
              recientes.
            </p>
          </div>

          <Link
            to="/seller/wallet"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-400"
          >
            Ver billetera
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-slate-300">
            Productos activos: {products.length}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-slate-300">
            Ventas completadas: {sales.length}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-slate-300">
            Saldo disponible: RD${wallet?.balance?.toLocaleString() || "0"}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
  highlight = false,
  warning = false,
  to,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  highlight?: boolean;
  warning?: boolean;
  to?: string;
}) {
  const valueClass = warning
    ? "text-yellow-500"
    : highlight
      ? "text-emerald-600"
      : "text-slate-950";

  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
          Actual
        </span>
      </div>

      <p className="mt-8 text-sm font-bold text-slate-500">{title}</p>
      <h2
        className={`mt-3 line-clamp-2 text-2xl font-black leading-tight ${valueClass}`}
        title={value}
      >
        {value}
      </h2>
      <p className="mt-4 text-sm font-medium leading-6 text-slate-400">
        {detail}
      </p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="min-h-[190px] rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="min-h-[190px] rounded-2xl border border-slate-200 bg-slate-50 p-6">
      {content}
    </div>
  );
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </p>
        </div>

        <Icon className="h-6 w-6 text-emerald-600" />
      </div>

      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}
