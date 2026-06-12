import { ArrowRight, BriefcaseBusiness, Clock, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import type { ServiceCatalogItem } from "../../types/service.types";

export default function ServiceCard({ service }: { service: ServiceCatalogItem }) {
  const user = useAuthStore.getState().user;
  const requestPath =
    user?.role === "SELLER" ? "/seller/services/request" : "/services/request";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-emerald-100">
            <BriefcaseBusiness className="h-14 w-14" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
          {service.category}
        </div>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-black text-slate-950">{service.name}</h2>
        <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-500">
          {service.description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <Clock className="h-4 w-4 text-emerald-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">Tiempo</p>
            <p className="text-sm font-black text-slate-900">
              {service.estimatedTime}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <WalletCards className="h-4 w-4 text-emerald-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">Precio</p>
            <p className="text-sm font-black text-slate-900">
              {service.estimatedPrice}
            </p>
          </div>
        </div>

        <Link
          to={requestPath}
          state={{
            category: service.category,
            title: service.name,
            serviceOfferingId: service.id,
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
        >
          Solicitar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
