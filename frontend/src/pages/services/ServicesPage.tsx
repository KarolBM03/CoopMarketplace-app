import { BriefcaseBusiness, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ServiceCard from "../../components/services/ServiceCard";
import { getServiceOfferings } from "../../services/serviceRequest.service";
import { useAuthStore } from "../../store/auth.store";
import type { ServiceCatalogItem } from "../../types/service.types";

export default function ServicesPage() {
  const user = useAuthStore.getState().user;
  const myRequestsPath =
    user?.role === "SELLER"
      ? "/seller/services/my-requests"
      : "/services/my-requests";
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealServices();
  }, []);

  const loadRealServices = async () => {
    try {
      setLoading(true);
      const offerings = await getServiceOfferings();

      setServices(
        (Array.isArray(offerings) ? offerings : []).map((offering) => ({
          id: offering.id,
          category: offering.category,
          name: offering.name,
          description: offering.description,
          estimatedTime: offering.estimatedTime || "A coordinar",
          estimatedPrice: offering.estimatedPrice
            ? `Desde RD$${Number(offering.estimatedPrice).toLocaleString()}`
            : "Cotizable",
          imageUrl: offering.imageUrl || "",
        })),
      );
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/20">
              <Sparkles className="h-4 w-4" />
              Servicios CoopMarket
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              Pide delivery, grua, instalacion o asistencia desde un solo lugar.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-base">
              Solicita servicios conectados al flujo operativo de CoopMarket y
              da seguimiento desde tu cuenta.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={myRequestsPath}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
            >
              <ClipboardList className="h-4 w-4" />
              Mis servicios
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-black text-slate-500">
            Cargando servicios reales...
          </p>
        </section>
      ) : services.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">
            Todavia no hay servicios publicados
          </h2>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id || `${service.name}-${service.category}`}
              service={service}
            />
          ))}
        </section>
      )}
    </div>
  );
}
