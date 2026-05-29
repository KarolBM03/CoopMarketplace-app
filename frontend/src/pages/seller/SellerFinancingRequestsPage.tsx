import { CheckCircle2, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import {
  approveFinancing,
  getSellerPendingFinancings,
} from "../../services/financing.service";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import { statusLabel } from "../../utils/statusLabels";

export default function SellerFinancingRequestsPage() {
  const user = useAuthStore.getState().user;
  const [financings, setFinancings] = useState<any[]>([]);

  useEffect(() => {
    loadFinancings();
  }, []);

  const loadFinancings = async () => {
    if (!user) return;

    const data = await getSellerPendingFinancings(user.id);
    setFinancings(data);
  };

  const handleApprove = async (financingId: string) => {
    try {
      if (!user) return;

      await approveFinancing(financingId, user.id);

      toast.success("Financiamiento aprobado. Falta que el cliente pague la inicial.");
      await loadFinancings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error aprobando financiamiento");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Solicitudes
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Financiamientos pendientes
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500"></p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <CreditCard className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {financings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-800">
            No hay solicitudes pendientes
          </h2>
            <p className="mt-2 text-sm text-slate-500">
              Aqui apareceran las solicitudes aprobadas por la cooperativa.
            </p>
          </div>
        ) : (
          financings.map((financing) => (
            <div
              key={financing.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    financing.product.imageUrl ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                  }
                  alt={financing.product.title}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {financing.product.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Cliente: {financing.customer.fullName}
                  </p>
                  <p className="text-sm text-slate-400">
                    {financing.customer.email}
                  </p>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-xl font-black text-emerald-600">
                  RD${financing.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  Inicial: RD${financing.downPayment.toLocaleString()} ·{" "}
                  {financing.months} meses
                </p>
                <span className="mt-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                  {statusLabel(financing.status)}
                </span>
              </div>

              <button
                onClick={() => handleApprove(financing.id)}
                className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-500"
              >
                Aprobar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}





