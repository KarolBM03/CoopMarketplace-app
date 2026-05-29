import {
  AlertCircle,
  Loader2,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../../services/order.service";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

export default function CustomerOrdersPage() {
  const user = useAuthStore.getState().user;
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ordersPerPage = 4;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getCustomerOrders(user.id);
      setOrders(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "No se pudieron cargar tus ordenes",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));
  const paginatedOrders = orders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage,
  );

  return (
    <div className="px-5 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Compras
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Mis Pedidos
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <ReceiptText className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <h2 className="mt-5 text-xl font-black text-slate-800">
              Cargando tus pedidos
            </h2>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-red-50 text-red-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-800">{error}</h2>
            <button
              onClick={loadOrders}
              className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-50 text-slate-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-800">
              No tienes pedidos todavia
            </h2>
            <Link
              to="/customer/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
            >
              <Store className="h-5 w-5" />
              Ir al mercado
            </Link>
          </div>
        ) : (
          <>
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                      {order.financing ? "Compra financiada" : "Compra directa"}
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      {order.financing
                        ? "Orden con financiamiento"
                        : "Orden de compra"}
                    </h2>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-700 ring-1 ring-slate-200">
                          <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900">
                            {item.product?.title || "Producto no disponible"}
                          </h3>
                          <p className="text-sm font-medium text-slate-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="font-black text-emerald-700">
                        RD${item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                  <p className="text-sm font-medium text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "Sin fecha"}
                  </p>

                  <h2 className="text-2xl font-black text-emerald-700">
                    RD${Number(order.totalAmount || 0).toLocaleString()}
                  </h2>
                </div>
              </div>
            ))}

            {orders.length > ordersPerPage && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
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
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
