import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Landmark,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  acceptCounterOffer,
  getCustomerFinancings,
} from "../../services/financing.service";
import { useAuthStore } from "../../store/auth.store";
import type { Financing, Installment } from "../../types/finance.types";

const statusMap: Record<
  string,
  { label: string; description: string; className: string; step: number }
> = {
  PENDING: {
    label: "Pendiente",
    description: "Tu solicitud fue creada en CoopMarket.",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    step: 1,
  },
  SENT_TO_COOPERATIVE: {
    label: "Enviada",
    description: "Tu solicitud fue enviada a CoopHispanica.",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    step: 2,
  },
  UNDER_REVIEW: {
    label: "En evaluacion",
    description: "CoopHispanica esta evaluando tu solicitud.",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    step: 2,
  },
  APPROVED_BY_COOPERATIVE: {
    label: "Aprobada",
    description: "CoopHispanica aprobo la solicitud y gestiona el contrato.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 3,
  },
  COUNTER_OFFER: {
    label: "Contraoferta",
    description: "CoopHispanica envio una oferta diferente.",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    step: 3,
  },
  CUSTOMER_ACCEPTED: {
    label: "Oferta aceptada",
    description: "Aceptaste la oferta. CoopHispanica continua el proceso.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 3,
  },
  WAITING_COOPERATIVE_PAYMENT: {
    label: "Contrato firmado",
    description: "CoopHispanica espera o procesa el pago inicial.",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    step: 4,
  },
  ACTIVE: {
    label: "Activo",
    description: "CoopHispanica confirmo el inicial. CoopMarket prepara la orden.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 5,
  },
  COMPLETED: {
    label: "Completado",
    description: "CoopHispanica marco el prestamo como completado.",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    step: 6,
  },
  LATE: {
    label: "En mora",
    description: "CoopHispanica reporto pagos pendientes.",
    className: "bg-red-50 text-red-700 ring-red-200",
    step: 5,
  },
  REJECTED: {
    label: "Rechazado",
    description: "CoopHispanica rechazo la solicitud.",
    className: "bg-red-50 text-red-700 ring-red-200",
    step: 0,
  },
};

const steps = [
  "Solicitud",
  "CoopHispanica",
  "Contrato",
  "Inicial",
  "Activo",
  "Completado",
];

const externalStatusMessages: Record<string, string> = {
  SENT_TO_COOPERATIVE:
    "Tu solicitud fue enviada a CoopHispanica para evaluacion.",
  APPROVED_BY_COOPERATIVE:
    "CoopHispanica aprobo la solicitud. Ellos enviaran el contrato del prestamo.",
  CONTRACT_SENT:
    "CoopHispanica envio el contrato del prestamo. Revisa sus canales oficiales.",
  CONTRACT_SIGNED:
    "CoopHispanica confirmo la firma del contrato. Falta el pago inicial.",
  DOWN_PAYMENT_PAID:
    "CoopHispanica confirmo el pago inicial. Tu compra queda activa en CoopMarket.",
  INSTALLMENT_PAID: "CoopHispanica confirmo un pago de cuota.",
  LOAN_OVERDUE: "CoopHispanica reporto atraso en el prestamo.",
  LOAN_COMPLETED: "CoopHispanica marco el prestamo como completado.",
  REJECTED_BY_COOPERATIVE: "CoopHispanica rechazo la solicitud.",
};

export default function CustomerFinancingPage() {
  const user = useAuthStore.getState().user;
  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleAcceptCounterOffer = async (financingId: string) => {
    try {
      setProcessingId(financingId);
      await acceptCounterOffer(financingId);
      toast.success("Contraoferta aceptada");
      await loadFinancings();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error aceptando contraoferta",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-5 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            CoopHispanica
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Mis Financiamientos
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {activeCount} activos. CoopMarket solo muestra el seguimiento.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Landmark className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-white" />
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
              processingId={processingId}
              onAcceptCounterOffer={handleAcceptCounterOffer}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FinancingCard({
  financing,
  processingId,
  onAcceptCounterOffer,
}: {
  financing: Financing;
  processingId: string | null;
  onAcceptCounterOffer: (id: string) => void;
}) {
  const status = statusMap[financing.status] || statusMap.PENDING;
  const canAcceptCounterOffer = financing.status === "COUNTER_OFFER";
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
            Monto solicitado: RD$
            {Number(financing.totalAmount || 0).toLocaleString()} · Cuota
            estimada: RD$
            {Number(financing.monthlyPayment || 0).toLocaleString()} / mes
          </p>
          {financing.externalLoanId && (
            <p className="mt-2 text-xs font-bold text-slate-400">
              Solicitud Coop: {financing.externalLoanId}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {canAcceptCounterOffer && (
            <button
              onClick={() => onAcceptCounterOffer(financing.id)}
              disabled={processingId === financing.id}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {processingId === financing.id
                ? "Procesando..."
                : "Aceptar contraoferta"}
            </button>
          )}

          {financing.externalStatus === "CONTRACT_SENT" && (
            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600">
              <ExternalLink className="h-5 w-5" />
              Revisa el contrato en CoopHispanica
            </div>
          )}
        </div>
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

      {financing.status === "COUNTER_OFFER" && financing.counterOffer && (
        <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
          CoopHispanica envio una contraoferta. Revisa los terminos antes de
          aceptar.
        </div>
      )}

      {financing.externalStatus &&
        externalStatusMessages[financing.externalStatus] && (
          <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {externalStatusMessages[financing.externalStatus]}
          </div>
        )}

      {canShowInstallments && (
        <div className="mt-6 grid gap-3">
          {financing.installments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
              CoopHispanica todavia no ha sincronizado las cuotas.
            </div>
          ) : (
            financing.installments.map((installment) => (
              <InstallmentRow key={installment.id} installment={installment} />
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
    <div className="mt-6 grid gap-2 sm:grid-cols-6">
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

function InstallmentRow({ installment }: { installment: Installment }) {
  const isPaid = installment.paid || installment.status === "PAID";
  const isOverdue = installment.status === "OVERDUE";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-700 ring-1 ring-slate-200">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black text-slate-900">Cuota #{installment.number}</p>
          <p className="text-sm font-medium text-slate-500">
            {new Date(installment.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-black text-emerald-700">
          RD${Number(installment.amount || 0).toLocaleString()}
        </p>
        <p
          className={`text-sm font-bold ${
            isPaid
              ? "text-emerald-700"
              : isOverdue
                ? "text-red-500"
                : "text-slate-500"
          }`}
        >
          {isPaid ? "Pagado" : isOverdue ? "Vencida" : "Pendiente"}
        </p>
      </div>
    </div>
  );
}
