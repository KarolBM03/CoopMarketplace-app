import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, ShoppingBag, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "../../services/checkout.service";
import { getOrderCooperativePaymentLink } from "../../services/order.service";
import { applyForLoan } from "../../services/financing.service";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { calculateInstallments } from "../../utils/finance";
import { financingSchema } from "../../utils/validation";
import { z } from "zod";

type FinancingFormInput = z.input<typeof financingSchema>;
type FinancingForm = z.output<typeof financingSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const clearCart = useCartStore.getState().clearCart;
  const user = useAuthStore.getState().user;
  const [items, setItems] = useState(useCartStore.getState().items);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FinancingFormInput, unknown, FinancingForm>({
    resolver: zodResolver(financingSchema),
  });

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
        0,
      ),
    [items],
  );

  const canFinance = items.length === 1 && Boolean(items[0]?.product?.isFinanced);
  const product = items[0]?.product;
  const productPrice = Number(product?.price || 0);
  const downPayment = canFinance ? productPrice * 0.2 : 0;
  const loanAmount = canFinance ? productPrice - downPayment : 0;
  const calculation = calculateInstallments({
    amount: loanAmount,
    months: 12,
    annualInterestRate: 18,
  });

  const panelPath =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/customer";

  useEffect(() => {
    return useCartStore.subscribe((state) => {
      setItems(state.items);
    });
  }, []);

  const guardCheckout = () => {
    if (!user) {
      toast("Debes iniciar sesion");
      navigate("/login");
      return false;
    }

    if (items.length === 0) {
      toast("Tu carrito esta vacio");
      navigate("/cart");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!guardCheckout() || !user) return;

    try {
      setSubmitting(true);
      const order = await createCheckoutSession({
        customerId: user.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      const result = await getOrderCooperativePaymentLink(order.id);

      clearCart();
      toast.success("Orden creada. Continua el pago en CoopHispanica");
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
      }
      navigate(panelPath);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creando pago en CoopHispanica");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinancing = async (data: FinancingForm) => {
    if (!guardCheckout() || !user || !product) return;

    if (!canFinance) {
      toast("Este producto no permite financiamiento");
      return;
    }

    try {
      setSubmitting(true);
      await applyForLoan({
        productId: product.id,
        months: 12,
        cedula: data.cedula,
        income: data.income,
        company: data.company,
        phone: data.phone,
        address: data.address,
      });

      clearCart();
      toast.success("Solicitud enviada a CoopHispanica");
      navigate("/customer/financing");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error solicitando financiamiento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-6xl rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                Checkout
              </p>
              <h1 className="text-3xl font-black text-slate-950">Pago seguro</h1>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Atras
          </button>
        </header>

        <main className="grid gap-6 px-5 py-8 lg:grid-cols-[1fr_390px] lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Productos a pagar</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Revisa tu orden antes de confirmar.
            </p>

            <div className="mt-6 grid gap-4">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-emerald-700" />
                  <h3 className="mt-4 text-xl font-black text-slate-800">
                    No hay productos para pagar
                  </h3>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <img
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                        alt={item.product.title}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-slate-950">
                          {item.product.title}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-emerald-600">
                      RD${(Number(item.product.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="grid h-fit gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Total</p>
              <h2 className="mt-2 text-4xl font-black text-emerald-600">
                RD${total.toLocaleString()}
              </h2>

              <button
                onClick={handlePayment}
                disabled={items.length === 0 || submitting}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-4 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Creando enlace..." : "Pagar en CoopHispanica"}
              </button>
            </section>

            {canFinance && (
              <form
                onSubmit={handleSubmit(handleFinancing)}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <WalletCards className="h-6 w-6 text-emerald-700" />
                  <h2 className="text-lg font-black text-slate-950">
                    Solicitud cooperativa
                  </h2>
                </div>

                <div className="mt-5 grid gap-3">
                  <FormInput placeholder="Cedula" error={errors.cedula?.message} {...register("cedula")} />
                  <FormInput type="number" placeholder="Ingresos mensuales" error={errors.income?.message} {...register("income")} />
                  <FormInput placeholder="Empresa donde trabaja" error={errors.company?.message} {...register("company")} />
                  <FormInput placeholder="Telefono" error={errors.phone?.message} {...register("phone")} />
                  <FormInput placeholder="Direccion" error={errors.address?.message} {...register("address")} />
                </div>

                <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-bold uppercase text-slate-300">
                    Simulacion financiera
                  </p>
                  <p className="mt-2 text-2xl font-black text-emerald-400">
                    RD${calculation.monthlyPayment.toLocaleString()} / mes
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Inicial RD${downPayment.toLocaleString()} · Interes RD$
                    {calculation.totalInterest.toLocaleString()} · Total RD$
                    {calculation.totalAmount.toLocaleString()}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full rounded-xl border border-emerald-600 bg-white py-4 font-black text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Solicitar financiamiento"}
                </button>
              </form>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

function FormInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <label className="block">
      <input
        {...props}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500"
      />
      {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
    </label>
  );
}
