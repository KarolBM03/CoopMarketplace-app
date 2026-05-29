import { useEffect, useState } from "react";
import {
  getFinancialReport,
  downloadFinancialReportPDF,
  downloadFinancialExcel,
} from "../../services/admin.services";

export default function AdminReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadReport = async () => {
    try {
      const data = await getFinancialReport(startDate, endDate);
      setReport(data);
    } catch (error) {
      console.log(error);
      setReport({
        totals: {},
        counts: {},
      });
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const totals = report?.totals || {};
  const counts = report?.counts || {};

  if (!report) {
    return (
      <div className="p-8">
        <p className="text-lg font-black">Cargando reportes...</p>
      </div>
    );
  }
  const handleDownloadPDF = async () => {
    const blob = await downloadFinancialReportPDF(startDate, endDate);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reporte-financiero.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
        REPORTES
      </p>

      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
        Reportes Financieros
      </h1>

      <div className="mt-8 flex flex-wrap gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4"
        />

        <button
          onClick={loadReport}
          className="rounded-xl bg-emerald-600 px-6 font-black text-white hover:bg-emerald-500"
        >
          Filtrar
        </button>

        <button
          onClick={handleDownloadPDF}
          className="rounded-xl border border-emerald-600 bg-white px-6 font-black text-emerald-700 hover:bg-emerald-50"
        >
          Descargar PDF
        </button>
        <button
          onClick={() => downloadFinancialExcel(startDate, endDate)}
          className="rounded-xl bg-slate-950 px-6 font-black text-white hover:bg-slate-800"
        >
          Descargar Excel
        </button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card
          title="Pagos"
          value={`RD$${(totals.payments || 0).toLocaleString()}`}
        />
        <Card
          title="Depósitos"
          value={`RD$${(totals.deposits || 0).toLocaleString()}`}
        />
        <Card
          title="Retiros"
          value={`RD$${(totals.withdrawals || 0).toLocaleString()}`}
        />
        <Card
          title="Pagos aprobados"
          value={`RD$${(totals.approvedPayouts || 0).toLocaleString()}`}
        />
        <Card
          title="Financiamientos"
          value={`RD$${(totals.financingTotal || 0).toLocaleString()}`}
        />
        <Card title="Alertas fraude" value={counts.fraudAlerts || 0} />
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Estadísticas</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Stat label="Transacciones" value={counts.transactions || 0} />
          <Stat label="Retiros" value={counts.payouts || 0} />
          <Stat label="Financiamientos" value={counts.financings || 0} />
          <Stat label="Fraudes detectados" value={counts.fraudAlerts || 0} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h2 className="mt-4 text-2xl font-black text-emerald-600 sm:text-3xl">
        {value}
      </h2>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">{value}</h3>
    </div>
  );
}
