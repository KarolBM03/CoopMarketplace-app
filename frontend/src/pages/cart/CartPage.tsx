import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";

export default function CartPage() {
  const [items, setItems] = useState(useCartStore.getState().items);
  const removeFromCart = useCartStore.getState().removeFromCart;
  const updateQuantity = useCartStore.getState().updateQuantity;
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const panelPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "SELLER"
        ? "/seller"
        : "/customer";

  useEffect(() => {
    return useCartStore.subscribe((state) => {
      setItems(state.items);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-6xl rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShoppingCart className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                Compra
              </p>
              <h1 className="text-3xl font-black text-slate-950">Carrito</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Atras
            </button>
          </div>
        </header>

        <main className="grid gap-6 px-5 py-8 lg:grid-cols-[1fr_360px] lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Productos seleccionados
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {items.length} producto{items.length === 1 ? "" : "s"} en tu
                  carrito.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-800">
                    Tu carrito esta vacio
                  </h3>
                  <button
                    onClick={() => navigate("/customer/marketplace")}
                    className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
                  >
                    Ir al marketplace
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <img
                        src={
                          item.product.imageUrl ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                        }
                        alt={item.product.title}
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-slate-950">
                          {item.product.title}
                        </h2>
                        <p className="mt-1 font-black text-emerald-600">
                          RD${item.product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                        className="h-11 w-20 rounded-xl border border-slate-200 bg-white text-center font-black text-slate-800 outline-none focus:border-emerald-500"
                      />

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-black text-white transition hover:bg-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total</p>
            <h2 className="mt-2 text-4xl font-black text-emerald-600">
              RD${total.toLocaleString()}
            </h2>

            <button
              onClick={() => navigate("/checkout")}
              disabled={items.length === 0}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-4 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continuar Verificacion
            </button>

            <button
              onClick={() => navigate(panelPath)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-4 font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Volver al panel
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}
