import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  IdCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  approveSeller,
  getSellers,
  rejectSeller,
} from "../../services/admin.services";
import toast from "react-hot-toast";
import { statusLabel } from "../../utils/statusLabels";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await getSellers();
      setSellers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error cargando vendedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const counts = useMemo(
    () => ({
      total: sellers.length,
      pending: sellers.filter((seller) => seller.sellerStatus === "PENDING")
        .length,
      approved: sellers.filter((seller) => seller.sellerStatus === "APPROVED")
        .length,
      rejected: sellers.filter((seller) => seller.sellerStatus === "REJECTED")
        .length,
    }),
    [sellers],
  );

  const handleApprove = async (userId: string) => {
    try {
      await approveSeller(userId);
      toast.success("Cuenta aprobada");
      loadSellers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error aprobando cuenta");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectSeller(userId);
      toast.success("Cuenta rechazada");
      loadSellers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error rechazando cuenta");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Vendedores y proveedores
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Solicitudes de negocios
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Pendientes" value={counts.pending} tone="yellow" />
        <StatCard label="Aprobados" value={counts.approved} tone="emerald" />
        <StatCard label="Rechazados" value={counts.rejected} tone="red" />
      </div>

      <div className="mt-8 grid gap-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Cargando vendedores
            </p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
            No hay negocios registrados.
          </div>
        ) : (
          sellers.map((seller) => (
            <article
              key={seller.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg font-black text-emerald-700">
                      {seller.fullName?.slice(0, 2).toUpperCase() || "VE"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-2xl font-black text-slate-950">
                          {seller.fullName}
                        </h2>
                        <StatusBadge status={seller.sellerStatus} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {seller.role === "SERVICE_PROVIDER"
                            ? "Proveedor de servicios"
                            : "Vendedor"}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-500">
                        Email: {seller.email}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-400">
                        Tel: {seller.phone || "Sin telefono"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoItem
                      icon={Store}
                      label="Tienda"
                      value={seller.storeName || "No definida"}
                    />
                    <InfoItem
                      icon={Building2}
                      label="Categoria"
                      value={seller.mainCategory || "No definida"}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Ciudad"
                      value={seller.city || "No definida"}
                    />
                    <InfoItem
                      icon={IdCard}
                      label="Cedula/RNC"
                      value={seller.documentId || "No definido"}
                    />
                    <InfoItem
                      icon={CreditCard}
                      label="Cuenta bancaria"
                      value={seller.bankAccount || "No definida"}
                    />
                    <InfoItem
                      icon={BadgeCheck}
                      label="Terminos"
                      value={seller.acceptedTerms ? "Aceptados" : "Pendientes"}
                    />
                  </div>

                  {seller.identityImageUrl && (
                    <a
                      href={seller.identityImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      Ver documento
                    </a>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-48 lg:grid-cols-1">
                  <button
                    onClick={() => handleApprove(seller.id)}
                    disabled={seller.sellerStatus === "APPROVED"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Aprobar
                  </button>

                  <button
                    onClick={() => handleReject(seller.id)}
                    disabled={seller.sellerStatus === "REJECTED"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-black text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <XCircle className="h-5 w-5" />
                    Rechazar
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "yellow" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "yellow"
        ? "text-yellow-500"
        : tone === "red"
          ? "text-red-500"
          : "text-slate-950";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-black ${toneClass}`}>{value}</h2>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-emerald-700">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const classes =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>
      {statusLabel(status)}
    </span>
  );
}





