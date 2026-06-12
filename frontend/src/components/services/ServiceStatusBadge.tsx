import type { ServiceRequestStatus } from "../../types/service.types";

const statusStyles: Record<ServiceRequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  ASSIGNED: "bg-sky-50 text-sky-700 ring-sky-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-slate-900 text-white ring-slate-900",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

const statusLabels: Record<ServiceRequestStatus, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignado",
  IN_PROGRESS: "En camino",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export default function ServiceStatusBadge({
  status,
}: {
  status: ServiceRequestStatus;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export { statusLabels };
