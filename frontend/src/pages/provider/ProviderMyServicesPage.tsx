import { BriefcaseBusiness } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProviderServiceCard from "../../components/services/ProviderServiceCard";
import {
  acceptProviderServiceRequest,
  getProviderServiceRequests,
  updateProviderServiceRequestStatus,
} from "../../services/serviceRequest.service";
import type { ServiceRequest, ServiceRequestStatus } from "../../types/service.types";

export default function ProviderMyServicesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getProviderServiceRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(
    () => ({
      completed: requests.filter((request) => request.status === "COMPLETED").length,
      active: requests.filter((request) =>
        ["ASSIGNED", "IN_PROGRESS"].includes(request.status),
      ).length,
      earnings: requests
        .filter((request) => request.status === "COMPLETED")
        .reduce((sum, request) => sum + Number(request.amount || 0), 0),
      rating: "4.8",
    }),
    [requests],
  );
  const availableRequests = useMemo(
    () => requests.filter((request) => request.status === "PENDING"),
    [requests],
  );
  const assignedRequests = useMemo(
    () => requests.filter((request) => request.status !== "PENDING"),
    [requests],
  );

  const handleStatus = async (
    request: ServiceRequest,
    status: ServiceRequestStatus,
    amount?: number,
  ) => {
    try {
      if (status === "ASSIGNED") {
        await acceptProviderServiceRequest(request.id);
        if (amount !== undefined) {
          await updateProviderServiceRequestStatus(request.id, status, amount);
        }
      } else {
        await updateProviderServiceRequestStatus(request.id, status, amount);
      }

      toast.success("Estado actualizado");
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude actualizar");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div>
        <p className="text-sm font-black uppercase text-emerald-600">
          Proveedor
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Solicitudes de servicios
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Aqui ves solicitudes disponibles de clientes y vendedores. Cuando aceptas una, queda asignada a ti.
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat title="Servicios completados" value={String(stats.completed)} />
        <Stat title="Servicios activos" value={String(stats.active)} />
        <Stat title="Ganancias" value={`RD$${stats.earnings.toLocaleString()}`} />
        <Stat title="Calificacion" value={stats.rating} />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-black text-slate-950">
          Solicitudes disponibles
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Estas solicitudes todavia no han sido tomadas por ningun proveedor.
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {loading ? (
            <Empty text="Cargando solicitudes..." />
          ) : availableRequests.length === 0 ? (
            <Empty text="No hay solicitudes disponibles ahora." />
          ) : (
            availableRequests.map((request) => (
              <ProviderServiceCard
                key={request.id}
                request={request}
                onChangeStatus={(status, amount) =>
                  handleStatus(request, status, amount)
                }
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black text-slate-950">
          Mis servicios tomados
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Aqui siguen apareciendo las solicitudes que ya aceptaste para poder marcarlas en camino o completarlas.
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {loading ? (
          <Empty text="Cargando solicitudes..." />
        ) : assignedRequests.length === 0 ? (
          <Empty text="Todavia no has tomado solicitudes." />
        ) : (
          assignedRequests.map((request) => (
            <ProviderServiceCard
              key={request.id}
              request={request}
              onChangeStatus={(status, amount) =>
                handleStatus(request, status, amount)
              }
            />
          ))
        )}
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{value}</h2>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center xl:col-span-2">
      <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-black text-slate-500">{text}</p>
    </div>
  );
}
