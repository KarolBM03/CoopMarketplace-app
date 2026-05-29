import { DollarSign, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getSellerPayouts, requestPayout } from "../../services/payout.service";
import { getWalletByUser } from "../../services/wallet.services";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import { payoutSchema } from "../../utils/validation";
import { statusLabel } from "../../utils/statusLabels";

export default function SellerPayoutsPage() {
  const user = useAuthStore.getState().user;

  const [wallet, setWallet] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutPage, setPayoutPage] = useState(1);
  const [amount, setAmount] = useState("");
  const itemsPerPage = 4;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const walletData = await getWalletByUser(user.id);
    const payoutsData = await getSellerPayouts(user.id);

    setWallet(walletData);
    setPayouts(payoutsData);
    setPayoutPage(1);
  };

  const handlePayout = async () => {
    try {
      if (!user) return;

      const parsed = payoutSchema.safeParse({ amount });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || "Monto invalido");
        return;
      }

      await requestPayout(user.id, parsed.data.amount);

      toast.success("Retiro solicitado");

      setAmount("");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error solicitando retiro");
    }
  };

  const totalPayoutPages = Math.max(1, Math.ceil(payouts.length / itemsPerPage));
  const paginatedPayouts = payouts.slice(
    (payoutPage - 1) * itemsPerPage,
    payoutPage * itemsPerPage,
  );

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Retiros
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Pagos
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Solicita retiros y revisa el historial.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-slate-300">Saldo disponible</p>
        <h2 className="mt-4 text-5xl font-black text-emerald-400">
          RD${wallet?.balance?.toLocaleString() || "0"}
        </h2>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            type="number"
            placeholder="Monto a retirar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-white/10 bg-white px-4 text-black outline-none"
          />

          <button
            onClick={handlePayout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 font-black text-black hover:bg-emerald-400"
          >
            <DollarSign className="h-5 w-5" />
            Solicitar retiro
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">
          Historial de retiros
        </h2>

        <div className="mt-6 grid gap-3">
          {payouts.length === 0 ? (
            <EmptyState text="No tienes retiros solicitados." />
          ) : (
            paginatedPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-black text-slate-950">Retiro solicitado</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-emerald-600">
                    RD${payout.amount.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      payout.status === "APPROVED"
                        ? "text-emerald-600"
                        : payout.status === "REJECTED"
                          ? "text-red-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {statusLabel(payout.status)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {payouts.length > itemsPerPage && (
          <Pagination
            page={payoutPage}
            totalPages={totalPayoutPages}
            onPrevious={() =>
              setPayoutPage((current) => Math.max(1, current - 1))
            }
            onNext={() =>
              setPayoutPage((current) =>
                Math.min(totalPayoutPages, current + 1),
              )
            }
          />
        )}
      </div>
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
    <div className="mt-5 flex items-center justify-center gap-3">
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





