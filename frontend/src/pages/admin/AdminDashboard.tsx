import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
  Heart,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDashboardMetrics,
  getAdminFinancialReport,
  getFraudAlerts,
} from "../../services/admin.services";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const metricsData = await getDashboardMetrics();
      const reportData = await getAdminFinancialReport();
      const fraudData = await getFraudAlerts();

      setFraudAlerts(Array.isArray(fraudData) ? fraudData : []);
      setMetrics(metricsData);
      setReport(reportData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error cargando dashboard");
    }
  };

  if (!metrics || !report) {
    return (
      <div className="px-5 py-8 text-sm font-semibold text-slate-500 sm:px-8 lg:px-10">
        Cargando dashboard...
      </div>
    );
  }

  const cards = [
    { title: "Usuarios", value: metrics.users, icon: Users },
    { title: "Productos", value: metrics.products, icon: Package },
    { title: "Ordenes", value: metrics.orders, icon: ReceiptText },
    { title: "Ordenes pagadas", value: metrics.paidOrders, icon: CheckCircle2 },
    { title: "Financiamientos", value: metrics.financings, icon: CreditCard },
    {
      title: "Financiamientos activos",
      value: metrics.activeFinancings,
      icon: ShieldCheck,
    },
    { title: "Mora", value: metrics.lateFinancings, icon: AlertTriangle },
    {
      title: "Fraude activo",
      value: metrics.unresolvedFraudAlerts,
      icon: AlertTriangle,
    },
    { title: "Vendedores", value: metrics.sellers || 0, icon: Store },
    {
      title: "Envíos entregados",
      value: metrics.deliveredShipments || 0,
      icon: Truck,
    },
    { title: "Opiniones", value: metrics.reviews || 0, icon: Star },
    { title: "Favoritos", value: metrics.favorites || 0, icon: Heart },
  ];

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              Panel admin
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Control general
            </h1>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ title, value, icon: Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {value}
              </h2>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Reporte financiero
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Totales de pagos, ledger y riesgos.
            </p>
          </div>
          <Wallet className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <FinanceCard
            title="Pagos totales"
            value={`RD$${(report.totalPayments || 0).toLocaleString()}`}
            positive
          />
          <FinanceCard
            title="Creditos ledger"
            value={`RD$${(report.totalCredits || 0).toLocaleString()}`}
            positive
          />
          <FinanceCard
            title="Debitos ledger"
            value={`RD$${(report.totalDebits || 0).toLocaleString()}`}
            negative
          />
          <FinanceCard
            title="Ordenes completadas"
            value={String(report.completedOrders || 0)}
          />
          <FinanceCard
            title="Financiamientos en mora"
            value={String(report.lateFinancings || 0)}
          />
          <FinanceCard
            title="Alertas fraude"
            value={String(report.unresolvedFraudAlerts || 0)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Alertas de fraude
            </h2>
          </div>
          <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600">
            {fraudAlerts.length}
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          {fraudAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
              No hay alertas de fraude.
            </div>
          ) : (
            fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-slate-950">{alert.reason}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Usuario: {alert.user?.fullName || alert.userId}
                  </p>
                  {alert.user?.email && (
                    <p className="mt-1 text-sm text-slate-400">
                      {alert.user.email}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p
                    className={`font-black ${
                      alert.riskLevel === "HIGH"
                        ? "text-red-600"
                        : alert.riskLevel === "MEDIUM"
                          ? "text-yellow-500"
                          : "text-emerald-600"
                    }`}
                  >
                    {alert.riskLevel}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function FinanceCard({
  title,
  value,
  positive = false,
  negative = false,
}: {
  title: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3
        className={`mt-2 text-2xl font-black ${
          positive
            ? "text-emerald-600"
            : negative
              ? "text-red-500"
              : "text-slate-950"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}
