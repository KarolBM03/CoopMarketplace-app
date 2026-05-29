import { ArrowDownUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getTransactionsByUser } from "../../services/transaction.service";
import { getWalletByUser } from "../../services/wallet.services";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

export default function SellerWalletPage() {
  const user = useAuthStore.getState().user;

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    if (!user) return;

    const walletData = await getWalletByUser(user.id);
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
      <div className="px-5 py-8 text-sm font-semibold text-slate-500 sm:px-8 lg:px-10">
        Cargando...
      </div>
    );
  }

  const totalTransactionPages = Math.max(
    1,
    Math.ceil(transactions.length / itemsPerPage),
  );
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * itemsPerPage,
    transactionPage * itemsPerPage,
  );

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Billetera
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Finanzas
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-slate-300">Saldo disponible</p>
        <h2 className="mt-4 text-5xl font-black text-emerald-400">
          RD${wallet.balance.toLocaleString()}
        </h2>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Historial financiero
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Movimientos recientes de tu cuenta.
            </p>
          </div>
          <ArrowDownUp className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="mt-6 grid gap-3">
          {transactions.length === 0 ? (
            <EmptyState text="No hay transacciones todavia." />
          ) : (
            paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-black text-slate-950">
                    {formatTransactionText(transaction.description) ||
                      (transaction.type === "DEPOSIT"
                        ? "Deposito"
                        : transaction.type === "PAYMENT"
                          ? "Pago"
                          : transaction.type === "WITHDRAW"
                            ? "Retiro"
                            : "Reembolso")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xl font-black ${
                      transaction.type === "DEPOSIT" ||
                      transaction.type === "REFUND"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === "DEPOSIT" ||
                    transaction.type === "REFUND"
                      ? "+"
                      : "-"}
                    RD${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    {statusLabel(transaction.status)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {transactions.length > itemsPerPage && (
          <Pagination
            page={transactionPage}
            totalPages={totalTransactionPages}
            onPrevious={() =>
              setTransactionPage((current) => Math.max(1, current - 1))
            }
            onNext={() =>
              setTransactionPage((current) =>
                Math.min(totalTransactionPages, current + 1),
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
