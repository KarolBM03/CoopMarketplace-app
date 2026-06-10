import api from "../api/axios";

export const getDashboardMetrics = async () => {
  const response = await api.get("/admin/metrics");
  return response.data;
};
export const getFinancialReport = async (
  startDate?: string,
  endDate?: string,
) => {
  const response = await api.get("/reports/financial", {
    params: {
      startDate,
      endDate,
    },
  });

  return response.data;
};

export const getAdminFinancialReport = async () => {
  const response = await api.get("/admin/financial-report");
  return response.data;
};

export const getFraudAlerts = async () => {
  const response = await api.get("/admin/fraud-alerts");
  return response.data;
};

export const resolveFraudAlert = async (alertId: string) => {
  const response = await api.patch(`/admin/fraud-alerts/${alertId}/resolve`);

  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get("/admin/top-products");
  return response.data;
};

export const getTopSellers = async () => {
  const response = await api.get("/admin/top-sellers");
  return response.data;
};

export const getSalesChart = async () => {
  const response = await api.get("/admin/sales-chart");
  return response.data;
};

export const getFinancingChart = async () => {
  const response = await api.get("/admin/financing-chart");
  return response.data;
};

export const blockUser = async (userId: string) => {
  const response = await api.patch(`/admin/users/${userId}/block`);

  return response.data;
};

export const unblockUser = async (userId: string) => {
  const response = await api.patch(`/admin/users/${userId}/unblock`);

  return response.data;
};

export const getSellers = async () => {
  const response = await api.get("/admin/sellers");
  return response.data;
};

export const approveSeller = async (userId: string) => {
  const response = await api.patch(`/admin/sellers/${userId}/approve`);

  return response.data;
};

export const rejectSeller = async (userId: string) => {
  const response = await api.patch(`/admin/sellers/${userId}/reject`);

  return response.data;
};

export const downloadFinancialReportPDF = async (
  startDate?: string,
  endDate?: string,
) => {
  const response = await api.get("/reports/financial/pdf", {
    params: {
      startDate,
      endDate,
    },
    responseType: "blob",
  });

  return response.data;
};

export const downloadFinancialExcel = async (
  startDate?: string,
  endDate?: string,
) => {
  const response = await api.get("/reports/financial/excel", {
    params: {
      startDate,
      endDate,
    },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "financial-report.xlsx");

  document.body.appendChild(link);

  link.click();

  link.remove();
};
