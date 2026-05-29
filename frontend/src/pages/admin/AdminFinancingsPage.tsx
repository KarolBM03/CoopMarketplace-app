import { useEffect, useState } from "react";
import {
  getAdminFinancings,
  adminApproveFinancing,
  adminRejectFinancing,
} from "../../services/financing.service";
import toast from "react-hot-toast";
import { statusLabel } from "../../utils/statusLabels";

export default function AdminFinancingsPage() {
  const [financings, setFinancings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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
  }, [page]);

  const canAdminReview = (status: string) => status === "PENDING";

  return (
    <div className="p-8">
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
        COOPERATIVA
      </p>

      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
        Solicitudes de financiamiento
      </h1>

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
              <div className="flex justify-between gap-6">
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
                      <b>Cédula:</b> {financing.cedula}
                    </p>
                    <p>
                      <b>Ingresos:</b> RD${financing.income?.toLocaleString()}
                    </p>
                    <p>
                      <b>Empresa:</b> {financing.company}
                    </p>
                    <p>
                      <b>Teléfono:</b> {financing.phone}
                    </p>
                    <p>
                      <b>Dirección:</b> {financing.address}
                    </p>
                    <p>
                      <b>Inicial:</b> RD$
                      {financing.downPayment?.toLocaleString()}
                    </p>
                    <p>
                      <b>Cuotas:</b> {financing.months}
                    </p>
                    <p>
                      <b>Pago mensual:</b> RD$
                      {financing.monthlyPayment?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <span className="h-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
                  {statusLabel(financing.status)}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                {canAdminReview(financing.status) ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          await adminApproveFinancing(financing.id);
                          toast.success(
                            "Financiamiento aprobado por cooperativa",
                          );
                          await loadFinancings();
                        } catch (error: any) {
                          toast.error(
                            error.response?.data?.message ||
                              "Error aprobando financiamiento",
                          );
                        }
                      }}
                      className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500"
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await adminRejectFinancing(financing.id);
                          toast.success("Financiamiento rechazado");
                          await loadFinancings();
                        } catch (error: any) {
                          toast.error(
                            error.response?.data?.message ||
                              "Error rechazando financiamiento",
                          );
                        }
                      }}
                      className="rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500"
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  <p className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-500">
                    Solicitud procesada
                  </p>
                )}
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
