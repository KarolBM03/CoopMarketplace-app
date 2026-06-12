import {
  CheckCircle2,
  MapPin,
  Navigation,
  PackageCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import type { ServiceRequest, ServiceRequestStatus } from "../../types/service.types";
import ServiceStatusBadge from "./ServiceStatusBadge";

export default function ProviderServiceCard({
  request,
  onChangeStatus,
}: {
  request: ServiceRequest;
  onChangeStatus?: (status: ServiceRequestStatus, amount?: number) => void;
}) {
  const isPending = request.status === "PENDING";
  const isAssigned = request.status === "ASSIGNED";
  const isInProgress = request.status === "IN_PROGRESS";
  const isCompleted = request.status === "COMPLETED";
  const [amount, setAmount] = useState(
    request.amount ? String(request.amount) : "",
  );
  const parsedAmount = amount ? Number(amount) : undefined;
  const requesterLabel =
    request.customer?.role === "SELLER" ? "Vendedor" : "Cliente";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <ServiceStatusBadge status={request.status} />
          <h2 className="mt-3 truncate text-xl font-black text-slate-950">
            {request.title}
          </h2>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {request.category}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
            <PackageCheck className="h-3.5 w-3.5" />
            Servicio solicitado
          </p>
        </div>
        <p className="shrink-0 text-right text-lg font-black text-slate-950">
          {request.amount
            ? `RD$${Number(request.amount).toLocaleString()}`
            : "Por cotizar"}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <UserRound className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">
            {requesterLabel}: {request.customer?.fullName || "Solicitante"}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">
            {request.pickupAddress || "Direccion pendiente"}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <Navigation className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">
            {request.deliveryAddress || "Destino pendiente"}
          </span>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-black uppercase text-slate-500">
          Precio del proveedor
        </span>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-900 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          placeholder="Ej. 850"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        {isPending && (
          <button
            onClick={() => onChangeStatus?.("ASSIGNED", parsedAmount)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
          >
            <CheckCircle2 className="h-4 w-4" />
            Aceptar solicitud
          </button>
        )}

        {isAssigned && (
          <ActionButton
            label="Marcar en camino"
            icon={Navigation}
            onClick={() => onChangeStatus?.("IN_PROGRESS", parsedAmount)}
          />
        )}

        {isInProgress && (
          <ActionButton
            label="Completar servicio"
            icon={CheckCircle2}
            onClick={() => onChangeStatus?.("COMPLETED", parsedAmount)}
          />
        )}

        {isCompleted && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
            <CheckCircle2 className="h-4 w-4" />
            Servicio completado
          </span>
        )}
      </div>
    </article>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
