import { useEffect, useState } from "react";
import { getAdminFinancings } from "../../services/financing.service";
import { getCooperativeHealth } from "../../services/cooperative.service";
import { statusLabel } from "../../utils/statusLabels";

export default function AdminFinancingsPage() {
  const [financings, setFinancings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coopHealth, setCoopHealth] = useState<any>(null);

  const loadFinancings = async () => {
    setLoading(true);

    try {
      const data = await getAdminFinancings(page, 6);
      setFinancings(data.financings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancings();
    getCooperativeHealth()
      .then(setCoopHealth)
      .catch(() => setCoopHealth(null));
  }, [page]);

  return (
    <div className="p-8">
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
        Cooperativa
      </p>

      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
        Solicitudes de financiamiento
      </h1>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-emerald-800">
              CoopMarket no aprueba ni cobra prestamos.
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              CoopHispanica valida el socio, aprueba, envia contrato y cobra.
              Este panel muestra el seguimiento operativo de cada solicitud.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700">
            {coopHealth?.enabled ? "Integracion activa" : "Integracion no activa"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          {loading
            ? "Cargando solicitudes..."
            : `${total} solicitudes registradas`}
        </p>

        <p className="text-sm font-black text-slate-700">
          Pagina {page} de {totalPages}
        </p>
      </div>

      <div className="mt-10 grid gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm"
            />
          ))
        ) : financings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-800">
              No hay solicitudes de financiamiento
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Cuando un cliente solicite financiamiento, aparecera aqui.
            </p>
          </div>
        ) : (
          financings.map((financing) => (
            <div
              key={financing.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-6 lg:flex-row">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {financing.customer?.fullName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {financing.customer?.email}
                  </p>

                  <div className="mt-5 grid gap-2 text-sm text-slate-600">
                    <p>
                      <b>Producto:</b> {financing.product?.title}
                    </p>
                    <p>
                      <b>Cedula:</b> {financing.cedula || "No registrada"}
                    </p>
                    <p>
                      <b>Solicitud Coop:</b>{" "}
                      {financing.externalLoanId || "Pendiente"}
                    </p>
                    <p>
                      <b>Estado Coop:</b>{" "}
                      {financing.externalStatus || "Pendiente"}
                    </p>
                    <p>
                      <b>Ingresos:</b> RD$
                      {(Number(financing.income) || 0).toLocaleString()}
                    </p>
                    <p>
                      <b>Empresa:</b> {financing.company || "No registrada"}
                    </p>
                    <p>
                      <b>Telefono:</b> {financing.phone || "No registrado"}
                    </p>
                    <p>
                      <b>Direccion:</b> {financing.address || "No registrada"}
                    </p>
                    <p>
                      <b>Monto solicitado:</b> RD$
                      {(Number(financing.totalAmount) || 0).toLocaleString()}
                    </p>
                    <p>
                      <b>Meses:</b> {financing.months}
                    </p>
                    <p>
                      <b>Cuota estimada:</b> RD$
                      {(Number(financing.monthlyPayment) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span className="h-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
                  {statusLabel(financing.status)}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="mb-3 text-xs font-black uppercase text-slate-400">
                  Seguimiento de cooperativa
                </p>
                <div className="grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Solicitud externa
                    </p>
                    <p className="mt-2 text-slate-900">
                      {financing.externalLoanId || "Pendiente de envio"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Estado externo
                    </p>
                    <p className="mt-2 text-slate-900">
                      {financing.externalStatus || "En espera"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Proximo paso
                    </p>
                    <p className="mt-2 text-slate-900">
                      {financing.externalLoanId
                        ? "Esperar respuesta de CoopHispanica"
                        : "Enviar solicitud a CoopHispanica"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages || loading}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
