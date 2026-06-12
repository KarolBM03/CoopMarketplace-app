import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createServiceRequest } from "../../services/serviceRequest.service";
import { useAuthStore } from "../../store/auth.store";
import type { ServiceCategory } from "../../types/service.types";

const cityOptions = ["Santo Domingo", "Santiago", "Higuey", "La Romana", "Otro"];
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100";

export default function ServiceRequestPage() {
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();
  const location = useLocation();
  const servicesPath = user?.role === "SELLER" ? "/seller/services" : "/services";
  const myRequestsPath =
    user?.role === "SELLER"
      ? "/seller/services/my-requests"
      : "/services/my-requests";
  const selected = location.state as
    | { category?: ServiceCategory; title?: string; serviceOfferingId?: string }
    | undefined;

  const [form, setForm] = useState({
    title: selected?.title || "",
    category: selected?.category || "DELIVERY",
    description: "",
    pickupAddress: "",
    deliveryAddress: "",
    phone: user?.phone || "",
    city: "Santo Domingo",
    province: "",
    notes: "",
    serviceOfferingId: selected?.serviceOfferingId || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error("Inicia sesion para solicitar un servicio");
      return;
    }

    if (!form.description.trim() || !form.pickupAddress.trim()) {
      toast.error("Completa la descripcion y la direccion de origen");
      return;
    }

    try {
      setSubmitting(true);
      const description = [
        form.description.trim(),
        form.phone.trim() ? `Telefono: ${form.phone.trim()}` : "",
        form.notes.trim() ? `Observaciones: ${form.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await createServiceRequest({
        customerId: user.id,
        category: form.category as ServiceCategory,
        title: form.title.trim(),
        description,
        pickupAddress: form.pickupAddress.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        serviceOfferingId: form.serviceOfferingId || undefined,
      });

      toast.success("Servicio solicitado");
      navigate(myRequestsPath);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude crear la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <Link
        to={servicesPath}
        className="inline-flex items-center gap-2 text-sm font-black text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a servicios
      </Link>

      <section className="mt-5 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-slate-950">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-black">Solicitar servicio</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
            Describe lo que necesitas. CoopMarket registra la solicitud y el
            equipo operativo puede asignar proveedor y precio.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Servicio">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className={inputClass}
                placeholder="Nombre del servicio"
                disabled={Boolean(form.serviceOfferingId)}
              />
            </Field>

            <Field label="Categoria">
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ServiceCategory,
                  }))
                }
                className={inputClass}
              >
                <option value="DELIVERY">Delivery</option>
                <option value="TOWING">Grua</option>
                <option value="TECHNICAL">Instalacion / Reparacion</option>
                <option value="MOVING">Mudanza</option>
                <option value="OTHER">Otros</option>
              </select>
            </Field>

            <Field label="Direccion origen">
              <input
                value={form.pickupAddress}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pickupAddress: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Ej. Av. principal #12"
              />
            </Field>

            <Field label="Direccion destino">
              <input
                value={form.deliveryAddress}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deliveryAddress: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Ej. Plaza, casa o local"
              />
            </Field>

            <Field label="Telefono">
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className={inputClass}
                placeholder="8090000000"
              />
            </Field>

            <Field label="Ciudad">
              <select
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                className={inputClass}
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Provincia">
              <input
                value={form.province}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    province: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Provincia"
              />
            </Field>

          </div>

          <Field label="Descripcion">
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className={`${inputClass} min-h-28`}
              placeholder="Explica que necesitas..."
            />
          </Field>

          <Field label="Observaciones">
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              className={`${inputClass} min-h-24`}
              placeholder="Referencia, horario, instrucciones especiales..."
            />
          </Field>

          <button
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Solicitar Servicio"}
          </button>
        </form>
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
    <label className="mt-4 block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
