import { CalendarDays, MapPin, UserRound } from "lucide-react";
import ServiceStatusBadge from "./ServiceStatusBadge";
import type { ServiceRequest } from "../../types/service.types";

export default function ServiceRequestCard({
  request,
  showCustomer = false,
  showProvider = true,
}: {
  request: ServiceRequest;
  showCustomer?: boolean;
  showProvider?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <ServiceStatusBadge status={request.status} />
          <h2 className="mt-3 truncate text-xl font-black text-slate-950">
            {request.title}
          </h2>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {request.category}
          </p>
        </div>

        <p className="text-lg font-black text-slate-950">
          {request.amount
            ? `RD$${Number(request.amount).toLocaleString()}`
            : "Por cotizar"}
        </p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
        {request.description}
      </p>

      <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-2">
        <Info icon={MapPin} text={request.pickupAddress || "Origen pendiente"} />
        <Info
          icon={MapPin}
          text={request.deliveryAddress || "Destino pendiente"}
        />
        <Info
          icon={CalendarDays}
          text={new Date(request.createdAt).toLocaleDateString()}
        />
        {showCustomer && (
          <Info icon={UserRound} text={request.customer?.fullName || "Cliente"} />
        )}
        {showProvider && (
          <Info
            icon={UserRound}
            text={request.providerName || "Proveedor pendiente"}
          />
        )}
      </div>
    </article>
  );
}

function Info({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="truncate">{text}</span>
    </div>
  );
}
