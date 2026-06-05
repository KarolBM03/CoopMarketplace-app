import ExcelJS from "exceljs";

const money = (value = 0) => Number(value || 0);

export const generateFinancialExcel = async (report: any) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reporte Financiero");

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = "CoopMarket";
  sheet.getCell("A1").font = {
    bold: true,
    size: 22,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF059669" },
  };
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 38;

  sheet.mergeCells("A2:D2");
  sheet.getCell("A2").value = "Reporte financiero administrativo";
  sheet.getCell("A2").font = {
    bold: true,
    size: 14,
    color: { argb: "FF334155" },
  };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.addRow([]);
  sheet.addRow(["Concepto", "Valor", "Tipo", "Fecha generado"]);

  const headerRow = sheet.getRow(4);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };

  const generatedAt = new Date().toLocaleString();

  const rows = [
    ["Pagos", money(report.totals?.payments), "Monto", generatedAt],
    ["Depósitos", money(report.totals?.deposits), "Monto", generatedAt],
    [
      "Financiamientos",
      money(report.totals?.financingTotal),
      "Monto",
      generatedAt,
    ],
    [
      "Transacciones",
      report.counts?.transactions || 0,
      "Cantidad",
      generatedAt,
    ],
    [
      "Financiamientos registrados",
      report.counts?.financings || 0,
      "Cantidad",
      generatedAt,
    ],
    [
      "Fraudes detectados",
      report.counts?.fraudAlerts || 0,
      "Cantidad",
      generatedAt,
    ],
  ];

  rows.forEach((row) => sheet.addRow(row));

  sheet.columns = [
    { key: "concept", width: 32 },
    { key: "value", width: 22 },
    { key: "type", width: 18 },
    { key: "date", width: 28 },
  ];

  sheet.getColumn(2).numFmt = "#,##0";

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle" };
    });

    if (rowNumber > 4) {
      row.height = 24;
    }
  });

  sheet.views = [{ state: "frozen", ySplit: 4 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};



