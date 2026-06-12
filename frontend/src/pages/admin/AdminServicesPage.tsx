import { Activity, CheckCircle2, Clock, DollarSign, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ServiceStatusBadge from "../../components/services/ServiceStatusBadge";
import {
  getAdminServiceRequests,
  updateServiceRequestStatus,
} from "../../services/serviceRequest.service";
import type { ServiceRequest, ServiceRequestStatus } from "../../types/service.types";

export default function AdminServicesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminServiceRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: requests.length,
      active: requests.filter((item) =>
        ["ASSIGNED", "IN_PROGRESS"].includes(item.status),
      ).length,
      completed: requests.filter((item) => item.status === "COMPLETED").length,
      income: requests.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }),
    [requests],
  );

  const changeStatus = async (
    request: ServiceRequest,
    status: ServiceRequestStatus,
  ) => {
    try {
      await updateServiceRequestStatus(request.id, {
        status,
        providerExternalId: request.providerExternalId || "admin-assigned",
        providerName: request.providerName || "Proveedor asignado",
        amount: Number(request.amount || 0),
      });
      toast.success("Servicio actualizado");
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude actualizar");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div>
        <p className="text-sm font-black uppercase text-emerald-600">
          Operaciones
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Servicios
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Supervisa solicitudes, proveedores, estados e ingresos operativos.
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total solicitudes" value={stats.total} icon={Truck} />
        <Metric title="Servicios activos" value={stats.active} icon={Activity} />
        <Metric
          title="Completados"
          value={stats.completed}
          icon={CheckCircle2}
        />
        <Metric
          title="Ingresos"
          value={`RD$${stats.income.toLocaleString()}`}
          icon={DollarSign}
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">
            Solicitudes de servicios
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Proveedor</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Monto</th>
                <th className="px-5 py-4">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-bold text-slate-500" colSpan={7}>
                    Cargando servicios...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-bold text-slate-500" colSpan={7}>
                    No hay solicitudes registradas.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="text-sm">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {request.customer?.fullName || "Cliente"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-500">
                      {request.providerName || "Sin asignar"}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-700">
                      {request.category}
                    </td>
                    <td className="px-5 py-4">
                      <ServiceStatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-950">
                      RD${Number(request.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={request.status}
                        onChange={(event) =>
                          changeStatus(
                            request,
                            event.target.value as ServiceRequestStatus,
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="ASSIGNED">Asignado</option>
                        <option value="IN_PROGRESS">En camino</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <Clock className="h-4 w-4 text-slate-300" />
      </div>
      <p className="mt-6 text-sm font-bold text-slate-500">{title}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{value}</h2>
    </div>
  );
}
