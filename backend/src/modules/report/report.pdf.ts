import PDFDocument from "pdfkit";

const formatMoney = (value = 0) => {
  return `RD$${Number(value).toLocaleString()}`;
};

export const generateFinancialPDF = (report: any) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const buffers: Uint8Array[] = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.rect(0, 0, doc.page.width, 110).fill("#059669");
  doc.fillColor("#ffffff").fontSize(26).text("CoopMarket", 50, 35);
  doc.fontSize(13).text("Reporte financiero administrativo", 50, 70);
  doc.fillColor("#111827").fontSize(22).text("Resumen financiero", 50, 150);

  const cards = [
    ["Pagos", formatMoney(report.totals?.payments)],
    ["Depósitos", formatMoney(report.totals?.deposits)],
    ["Retiros", formatMoney(report.totals?.withdrawals)],
    ["Pagos aprobados", formatMoney(report.totals?.approvedPayouts)],
    ["Financiamientos", formatMoney(report.totals?.financingTotal)],
    ["Fraudes detectados", report.counts?.fraudAlerts || 0],
  ];

  let x = 50;
  let y = 200;

  cards.forEach(([label, value], index) => {
    doc.roundedRect(x, y, 230, 85, 12).fillAndStroke("#f8fafc", "#e2e8f0");

    doc
      .fillColor("#64748b")
      .fontSize(11)
      .text(label, x + 18, y + 18);

    doc
      .fillColor("#059669")
      .fontSize(20)
      .text(String(value), x + 18, y + 42);

    x += 260;

    if ((index + 1) % 2 === 0) {
      x = 50;
      y += 110;
    }
  });

  const statsY = y + 20;

  doc.fillColor("#111827").fontSize(18).text("Estadísticas", 50, statsY);

  const stats = [
    ["Transacciones", report.counts?.transactions || 0],
    ["Retiros", report.counts?.payouts || 0],
    ["Financiamientos", report.counts?.financings || 0],
    ["Fraudes", report.counts?.fraudAlerts || 0],
  ];

  let statX = 50;
  let statY = statsY + 45;

  stats.forEach(([label, value], index) => {
    doc
      .roundedRect(statX, statY, 230, 70, 12)
      .fillAndStroke("#ffffff", "#e2e8f0");

    doc
      .fillColor("#64748b")
      .fontSize(10)
      .text(String(label), statX + 16, statY + 16);

    doc
      .fillColor("#111827")
      .fontSize(22)
      .text(String(value), statX + 16, statY + 36);

    statX += 260;

    if ((index + 1) % 2 === 0) {
      statX = 50;
      statY += 90;
    }
  });
  doc
    .fontSize(9)
    .fillColor("#94a3b8")
    .text(`Generado el ${new Date().toLocaleString()}`, 50, 780);

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
};
