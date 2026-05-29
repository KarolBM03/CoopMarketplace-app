import {
  CalendarDays,
  Loader2,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSellerSales } from "../../services/order.service";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

export default function SellerSalesPage() {
  const user = useAuthStore.getState().user;
  const [sales, setSales] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 4;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      const data = await getSellerSales(user.id);
      setSales(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (error: any) {
      setError(error.response?.data?.message || "No se pudieron cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const totalSold = sales.reduce(
    (sum, sale) => sum + Number(sale.price || 0) * Number(sale.quantity || 0),
    0,
  );
  const totalPages = Math.max(1, Math.ceil(sales.length / itemsPerPage));
  const paginatedSales = sales.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Ventas
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Historial de ventas
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Todas las ventas realizadas en tu tienda.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShoppingBag className="h-6 w-6" />
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Ventas"
          value={String(sales.length)}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <SummaryCard
          label="Ingresos"
          value={`RD$${totalSold.toLocaleString()}`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <SummaryCard
          label="Estado"
          value={sales.length > 0 ? "Activo" : "Sin ventas"}
          icon={<PackageCheck className="h-5 w-5" />}
        />
      </section>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <EmptyState
            icon={<Loader2 className="h-8 w-8 animate-spin" />}
            title="Cargando ventas"
            text="Estamos buscando tus ventas recientes."
          />
        ) : error ? (
          <EmptyState
            icon={<ReceiptText className="h-8 w-8" />}
            title={error}
            text="Intenta recargar la informacion."
            action={loadOrders}
          />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Todavia no tienes ventas"
            text="Cuando un cliente compre uno de tus productos, aparecera aqui."
          />
        ) : (
          <>
            {paginatedSales.map((sale) => {
            const order = sale.order || {};
            const product = sale.product || {};
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "Sin fecha";
            const subtotal = Number(sale.price || 0) * Number(sale.quantity || 0);
            const orderCode = order.id
              ? `#${String(order.id).slice(0, 8).toUpperCase()}`
              : "Orden sin codigo";

            return (
              <article
                key={sale.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[96px_1fr_auto] lg:items-center">
                  <img
                    src={
                      product.imageUrl ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                    }
                    alt={product.title || "Producto vendido"}
                    className="h-24 w-24 rounded-xl object-cover ring-1 ring-slate-200"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        {statusLabel(order.status)}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {orderCode}
                      </span>
                    </div>

                    <h2 className="mt-3 truncate text-xl font-black text-slate-950">
                      {product.title || "Producto vendido"}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-emerald-600" />
                        {order.customer?.fullName || "Cliente"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                        {date}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <PackageCheck className="h-4 w-4 text-emerald-600" />
                        Cantidad: {sale.quantity || 1}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-left lg:min-w-40 lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-600">
                      RD${subtotal.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      RD${Number(sale.price || 0).toLocaleString()} c/u
                    </p>
                  </div>
                </div>
              </article>
            );
            })}

            {sales.length > itemsPerPage && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{value}</h2>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-black text-slate-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
        {text}
      </p>
      {action && (
        <button
          onClick={action}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page === 1}
        onClick={onPrevious}
        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        disabled={page === totalPages}
        onClick={onNext}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Siguiente
      </button>
    </div>
  );
}
