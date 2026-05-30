import { ArrowDownUp, Plus, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getTransactionsByUser } from "../../services/transaction.service";
import { getMyWallet, rechargeWallet } from "../../services/wallet.services";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import { walletRechargeSchema } from "../../utils/validation";
import { statusLabel } from "../../utils/statusLabels";

export default function CustomerWalletPage() {
  const user = useAuthStore.getState().user;

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [amount, setAmount] = useState("");
  const transactionsPerPage = 4;

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    if (!user) return;

    const walletData = await getMyWallet();
    const transactionData = await getTransactionsByUser(user.id);

    setWallet(walletData);
    setTransactions(transactionData);
    setTransactionPage(1);
  };

  const formatTransactionText = (text?: string) => {
    return (text || "")
      .replaceAll("Recarga de Wallet", "Recarga de billetera")
      .replaceAll("Recarga de wallet", "Recarga de billetera")
      .replaceAll("Wallet", "billetera")
      .replaceAll("wallet", "billetera");
  };

  if (!wallet) {
    return (
      <div className="px-5 py-8 text-slate-500 sm:px-8 lg:px-10">
        Cargando billetera...
      </div>
    );
  }

  const totalTransactionPages = Math.max(
    1,
    Math.ceil(transactions.length / transactionsPerPage),
  );
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage,
  );

  return (
    <div className="px-5 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Saldo
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Mi Billetera
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl bg-slate-950 p-7 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-300">Saldo disponible</p>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
              Activo
            </span>
          </div>

          <h2 className="mt-5 text-5xl font-black text-emerald-400">
            RD${wallet.balance.toLocaleString()}
          </h2>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-slate-300">
              Recargar Billetera
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
              />

              <button
                onClick={async () => {
                  if (!user) return;

                  try {
                    const parsed = walletRechargeSchema.safeParse({ amount });

                    if (!parsed.success) {
                      toast.error(
                        parsed.error.issues[0]?.message || "Monto invalido",
                      );
                      return;
                    }

                    await rechargeWallet(user.id, parsed.data.amount);

                    toast.success("Billetera recargada");

                    setAmount("");
                    loadWallet();
                  } catch (error: any) {
                    toast.error(
                      error.response?.data?.message ||
                        "Error recargando billetera",
                    );
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-black transition hover:bg-emerald-400"
              >
                <Plus className="h-5 w-5" />
                Recargar
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Tus Transacciones
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Movimientos recientes de tu cuenta.
              </p>
            </div>
            <ArrowDownUp className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="mt-6 grid gap-3">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                No hay transacciones todavia.
              </div>
            ) : (
              paginatedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {transaction.type === "DEPOSIT" && "Deposito"}
                      {transaction.type === "PAYMENT" && "Pago"}
                      {transaction.type === "REFUND" && "Reembolso"}
                    </p>

                    <p className="font-black text-emerald-700">
                      {formatTransactionText(transaction.description)}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black ${
                        transaction.type === "DEPOSIT" ||
                        transaction.type === "REFUND"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "DEPOSIT" ||
                      transaction.type === "REFUND"
                        ? "+"
                        : "-"}
                      RD${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      {statusLabel(transaction.status)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {transactions.length > transactionsPerPage && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={transactionPage === 1}
                onClick={() =>
                  setTransactionPage((current) => Math.max(1, current - 1))
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                {transactionPage} / {totalTransactionPages}
              </span>

              <button
                type="button"
                disabled={transactionPage === totalTransactionPages}
                onClick={() =>
                  setTransactionPage((current) =>
                    Math.min(totalTransactionPages, current + 1),
                  )
                }
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
