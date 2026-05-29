import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  approvePayout,
  getPendingPayouts,
  rejectPayout,
} from "../../services/payout.service";
import toast from "react-hot-toast";
import { statusLabel } from "../../utils/statusLabels";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    const data = await getPendingPayouts();
    setPayouts(data);
  };

  const handleApprove = async (payoutId: string) => {
    try {
      setProcessingId(payoutId);
      await approvePayout(payoutId);
      toast.success("Retiro aprobado");
      loadPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error aprobando retiro");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    try {
      setProcessingId(payoutId);
      await rejectPayout(payoutId, "Retiro rechazado por administrador");
      toast.success("Retiro rechazado");
      loadPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error rechazando retiro");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Retiros
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Retiros pendientes
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Aprueba solicitudes de retiro de los vendedores.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {payouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
            No hay retiros pendientes.
          </div>
        ) : (
          payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="text-lg font-black text-slate-950">
                  {payout.seller?.fullName || payout.sellerId}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {payout.seller?.email}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {new Date(payout.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-2xl font-black text-emerald-600">
                  RD${payout.amount.toLocaleString()}
                </p>
                <p className="mt-1 font-bold text-yellow-500">
                  {statusLabel(payout.status)}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleApprove(payout.id)}
                  disabled={processingId === payout.id}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {processingId === payout.id ? "Procesando..." : "Aprobar"}
                </button>

                <button
                  onClick={() => handleReject(payout.id)}
                  disabled={processingId === payout.id}
                  className="rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-black text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {processingId === payout.id ? "Procesando..." : "Rechazar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}





