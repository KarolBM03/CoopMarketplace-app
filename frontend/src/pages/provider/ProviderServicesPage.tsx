import { BriefcaseBusiness, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createServiceOffering,
  getProviderServiceOfferings,
  updateServiceOffering,
} from "../../services/serviceRequest.service";
import { uploadImage } from "../../services/upload.service";
import type { ServiceCategory, ServiceOffering } from "../../types/service.types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100";

export default function ProviderServicesPage() {
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [form, setForm] = useState({
    category: "DELIVERY" as ServiceCategory,
    name: "",
    description: "",
    estimatedTime: "",
    estimatedPrice: "",
    city: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const data = await getProviderServiceOfferings();
      setOfferings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Completa nombre y descripcion");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = form.imageUrl;

      if (imageFile) {
        toast.loading("Subiendo imagen del servicio...", { id: "service-save" });
        imageUrl = await uploadImage(imageFile);
      }

      await createServiceOffering({
        category: form.category,
        name: form.name,
        description: form.description,
        estimatedTime: form.estimatedTime,
        estimatedPrice: form.estimatedPrice
          ? Number(form.estimatedPrice)
          : undefined,
        city: form.city,
        imageUrl,
      });
      toast.success("Servicio publicado", { id: "service-save" });
      setForm({
        category: "DELIVERY",
        name: "",
        description: "",
        estimatedTime: "",
        estimatedPrice: "",
        city: "",
        imageUrl: "",
      });
      setImageFile(null);
      loadOfferings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude publicar", {
        id: "service-save",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOffering = async (offering: ServiceOffering) => {
    try {
      await updateServiceOffering(offering.id, {
        isActive: !offering.isActive,
      });
      toast.success(offering.isActive ? "Servicio pausado" : "Servicio activo");
      loadOfferings();
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
          Publicar servicios
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Crea servicios reales para que los clientes puedan solicitarlos.
        </p>
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black text-slate-950">
              Nuevo servicio
            </h2>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Categoria">
              <select
                className={inputClass}
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ServiceCategory,
                  }))
                }
              >
                <option value="DELIVERY">Delivery</option>
                <option value="TOWING">Grua</option>
                <option value="TECHNICAL">Instalacion / Reparacion</option>
                <option value="MOVING">Mudanza</option>
                <option value="OTHER">Otro</option>
              </select>
            </Field>

            <Field label="Nombre del servicio">
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ej. Nombre de tu servicio"
              />
            </Field>

            <Field label="Descripcion">
              <textarea
                className={`${inputClass} min-h-28`}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Explica que incluye el servicio"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tiempo estimado">
                <input
                  className={inputClass}
                  value={form.estimatedTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estimatedTime: event.target.value,
                    }))
                  }
                  placeholder="25-45 min"
                />
              </Field>
              <Field label="Precio estimado">
                <input
                  type="number"
                  className={inputClass}
                  value={form.estimatedPrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estimatedPrice: event.target.value,
                    }))
                  }
                  placeholder="500"
                />
              </Field>
            </div>

            <Field label="Ciudad">
              <input
                className={inputClass}
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Santo Domingo"
              />
            </Field>

            <Field label="Imagen del servicio">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600"
              />
            </Field>

            <Field label="Imagen URL opcional">
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                placeholder="Opcional"
              />
            </Field>
          </div>

          <button
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? "Publicando..." : "Publicar servicio"}
          </button>
        </form>

        <div className="grid gap-4 self-start">
          {loading ? (
            <Empty text="Cargando tus servicios..." />
          ) : offerings.length === 0 ? (
            <Empty text="Todavia no has publicado servicios." />
          ) : (
            offerings.map((offering) => (
              <article
                key={offering.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                      {offering.category}
                    </span>
                    <h2 className="mt-3 text-xl font-black text-slate-950">
                      {offering.name}
                    </h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                      {offering.description}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                      offering.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-500 ring-slate-200"
                    }`}
                  >
                    {offering.isActive ? "Activo" : "Pausado"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="Tiempo" value={offering.estimatedTime || "-"} />
                  <Info
                    label="Precio"
                    value={
                      offering.estimatedPrice
                        ? `RD$${Number(offering.estimatedPrice).toLocaleString()}`
                        : "Cotizable"
                    }
                  />
                  <Info label="Ciudad" value={offering.city || "-"} />
                </div>

                <button
                  onClick={() => toggleOffering(offering)}
                  className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {offering.isActive ? "Pausar" : "Activar"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-black text-slate-500">{text}</p>
    </div>
  );
}
