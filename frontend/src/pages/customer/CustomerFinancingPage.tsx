import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getCustomerFinancings,
  payDownPayment,
} from "../../services/financing.service";
import { payInstallment } from "../../services/installment.service";
import { useAuthStore } from "../../store/auth.store";
import type {
  Financing,
  FinancingStatus,
  Installment,
} from "../../types/finance.types";

const statusMap: Record<
  FinancingStatus,
  { label: string; description: string; className: string; step: number }
> = {
  PENDING: {
    label: "Pendiente de cooperativa",
    description: "Tu solicitud esta siendo evaluada.",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    step: 1,
  },
  APPROVED_BY_COOPERATIVE: {
    label: "Aprobada por cooperativa",
    description: "La cooperativa aprobo la solicitud.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 2,
  },
  WAITING_SELLER_APPROVAL: {
    label: "Pendiente del vendedor",
    description: "El vendedor debe confirmar disponibilidad.",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    step: 2,
  },
  WAITING_DOWN_PAYMENT: {
    label: "Pendiente de inicial",
    description: "Paga la inicial para activar el financiamiento.",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    step: 3,
  },
  ACTIVE: {
    label: "Activo",
    description: "Financiamiento activo.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 5,
  },
  COMPLETED: {
    label: "Completado",
    description: "Todas las cuotas fueron pagadas.",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    step: 6,
  },
  LATE: {
    label: "En mora",
    description: "Tienes pagos vencidos.",
    className: "bg-red-50 text-red-700 ring-red-200",
    step: 4,
  },
  APPROVED: {
    label: "Aprobado",
    description: "Solicitud aprobada.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 2,
  },
  REJECTED: {
    label: "Rechazado",
    description: "La solicitud fue rechazada.",
    className: "bg-red-50 text-red-700 ring-red-200",
    step: 0,
  },
};

const steps = [
  "Solicitud",
  "Cooperativa",
  "Vendedor",
  "Inicial",
  "Activo",
  "Completado",
];

export default function CustomerFinancingPage() {
  const user = useAuthStore.getState().user;
  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(
    null,
  );
  const [payingDownPaymentId, setPayingDownPaymentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadFinancings();
  }, []);

  const activeCount = useMemo(
    () =>
      financings.filter((financing) => financing.status === "ACTIVE").length,
    [financings],
  );

  const loadFinancings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCustomerFinancings(user.id);
      setFinancings(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: string) => {
    try {
      setPayingInstallmentId(installmentId);
      await payInstallment(installmentId);
      await loadFinancings();
      toast.success("Cuota pagada");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al pagar");
    } finally {
      setPayingInstallmentId(null);
    }
  };

  const handlePayDownPayment = async (financingId: string) => {
    try {
      setPayingDownPaymentId(financingId);
      await payDownPayment(financingId);
      await loadFinancings();
      toast.success("Inicial pagada correctamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error pagando inicial");
    } finally {
      setPayingDownPaymentId(null);
    }
  };

  return (
    <div className="px-5 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Pagos
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Mis Financiamientos
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {activeCount} activos · seguimiento de solicitudes y cuotas.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Landmark className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl bg-white"
            />
          ))
        ) : financings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <CreditCard className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-5 text-xl font-black text-slate-800">
              No tienes financiamientos
            </h2>
          </div>
        ) : (
          financings.map((financing) => (
            <FinancingCard
              key={financing.id}
              financing={financing}
              payingDownPaymentId={payingDownPaymentId}
              payingInstallmentId={payingInstallmentId}
              onPayDownPayment={handlePayDownPayment}
              onPayInstallment={handlePayInstallment}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FinancingCard({
  financing,
  payingDownPaymentId,
  payingInstallmentId,
  onPayDownPayment,
  onPayInstallment,
}: {
  financing: Financing;
  payingDownPaymentId: string | null;
  payingInstallmentId: string | null;
  onPayDownPayment: (id: string) => void;
  onPayInstallment: (id: string) => void;
}) {
  const status = statusMap[financing.status] || statusMap.PENDING;
  const canPayDownPayment = financing.status === "WAITING_DOWN_PAYMENT";
  const canShowInstallments = ["ACTIVE", "LATE", "COMPLETED"].includes(
    financing.status,
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <img
          src={financing.product.imageUrl}
          alt={financing.product.title}
          className="h-28 w-28 rounded-2xl object-cover"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-slate-950">
              {financing.product.title}
            </h2>
            <span
              className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {status.description}
          </p>
          <p className="mt-3 text-lg font-black text-emerald-700">
            Inicial: RD${financing.downPayment.toLocaleString()} · RD$
            {financing.monthlyPayment.toLocaleString()} / mes
          </p>
        </div>

        {canPayDownPayment && (
          <button
            onClick={() => onPayDownPayment(financing.id)}
            disabled={payingDownPaymentId === financing.id}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {payingDownPaymentId === financing.id
              ? "Pagando..."
              : `Pagar inicial RD${financing.downPayment.toLocaleString()}`}
          </button>
        )}
      </div>

      <Timeline
        currentStep={status.step}
        rejected={financing.status === "REJECTED"}
      />

      {financing.status === "REJECTED" && financing.rejectionReason && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
          Motivo: {financing.rejectionReason}
        </div>
      )}

      {canShowInstallments && (
        <div className="mt-6 grid gap-3">
          {financing.installments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
              La cooperativa todavia no ha sincronizado las cuotas.
            </div>
          ) : (
            financing.installments.map((installment) => (
              <InstallmentRow
                key={installment.id}
                installment={installment}
                isPaying={payingInstallmentId === installment.id}
                onPay={onPayInstallment}
              />
            ))
          )}
        </div>
      )}
    </article>
  );
}

function Timeline({
  currentStep,
  rejected,
}: {
  currentStep: number;
  rejected: boolean;
}) {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-5">
      {steps.map((step, index) => {
        const number = index + 1;
        const done = !rejected && currentStep >= number;

        return (
          <div
            key={step}
            className={`rounded-xl border p-3 text-xs font-black ${
              rejected
                ? "border-red-100 bg-red-50 text-red-600"
                : done
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <div className="mb-2">
              {rejected ? (
                <XCircle className="h-4 w-4" />
              ) : done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            {step}
          </div>
        );
      })}
    </div>
  );
}

function InstallmentRow({
  installment,
  isPaying,
  onPay,
}: {
  installment: Installment;
  isPaying: boolean;
  onPay: (id: string) => void;
}) {
  const isPaid = installment.paid || installment.status === "PAID";
  const isOverdue = installment.status === "OVERDUE";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-700 ring-1 ring-slate-200">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black text-slate-900">
            Cuota #{installment.number}
          </p>
          <p className="text-sm font-medium text-slate-500">
            {new Date(installment.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <p className="font-black text-emerald-700">
            RD${installment.amount.toLocaleString()}
          </p>
          <p
            className={`text-sm font-bold ${isPaid ? "text-emerald-700" : isOverdue ? "text-red-500" : "text-slate-500"}`}
          >
            {isPaid ? "Pagado" : isOverdue ? "Vencida" : "Pendiente"}
          </p>
        </div>

        {!isPaid && (
          <button
            onClick={() => onPay(installment.id)}
            disabled={isPaying}
            className={`rounded-xl px-4 py-2 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
              isOverdue
                ? "bg-red-500 hover:bg-red-400"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {isPaying ? "Pagando..." : isOverdue ? "Pagar mora" : "Pagar"}
          </button>
        )}
      </div>
    </div>
  );
}
