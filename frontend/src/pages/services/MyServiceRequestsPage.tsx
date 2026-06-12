import { ClipboardList, MapPinned, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ServiceRequestCard from "../../components/services/ServiceRequestCard";
import ServiceTrackingMap from "../../components/services/ServiceTrackingMap";
import { getCustomerServiceRequests } from "../../services/serviceRequest.service";
import { useAuthStore } from "../../store/auth.store";
import type { ServiceRequest, ServiceRequestStatus } from "../../types/service.types";

const filters: Array<{ label: string; value: ServiceRequestStatus | "ALL" }> = [
  { label: "Todos", value: "ALL" },
  { label: "Pendiente", value: "PENDING" },
  { label: "Asignado", value: "ASSIGNED" },
  { label: "En camino", value: "IN_PROGRESS" },
  { label: "Completado", value: "COMPLETED" },
  { label: "Cancelado", value: "CANCELLED" },
];

export default function MyServiceRequestsPage() {
  const user = useAuthStore.getState().user;
  const newRequestPath =
    user?.role === "SELLER" ? "/seller/services" : "/services";
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<ServiceRequestStatus | "ALL">(
    "ALL",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCustomerServiceRequests(user.id);
      setRequests(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      activeFilter === "ALL"
        ? requests
        : requests.filter((request) => request.status === activeFilter),
    [activeFilter, requests],
  );

  const liveRequest = requests.find(
    (request) => request.status === "IN_PROGRESS" || request.status === "ASSIGNED",
  );

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-emerald-600">
            Servicios
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Mis servicios
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Revisa solicitudes, estados y seguimiento operativo.
          </p>
        </div>

        <Link
          to={newRequestPath}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Link>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ring-1 transition ${
              activeFilter === filter.value
                ? "bg-slate-950 text-white ring-slate-950"
                : "bg-white text-slate-600 ring-slate-200 hover:text-emerald-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="mt-5 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-4">
          {loading ? (
            <Empty text="Cargando servicios..." />
          ) : filtered.length === 0 ? (
            <Empty text="No tienes servicios en este estado." />
          ) : (
            filtered.map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                showProvider={false}
              />
            ))
          )}
        </div>

        <div className="grid gap-4 self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-950">Ruta del servicio</h2>
                <p className="text-sm font-medium text-slate-500">
                  {liveRequest
                    ? liveRequest.title
                    : "Disponible cuando haya proveedor asignado"}
                </p>
              </div>
            </div>
          </div>
          <ServiceTrackingMap />
        </div>
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-black text-slate-500">{text}</p>
    </div>
  );
}
