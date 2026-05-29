const labels: Record<string, string> = {
  ALL: "Todos",
  ACTIVE: "Activo",
  APPROVED: "Aprobado",
  APPROVED_BY_COOPERATIVE: "Aprobado por cooperativa",
  BLOCKED: "Bloqueado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  LATE: "En mora",
  OVERDUE: "En mora",
  PAID: "Pagado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
  RETURNED: "Devuelto",
  SUCCESS: "Exitoso",
  WAITING_DOWN_PAYMENT: "Pendiente de inicial",
  WAITING_SELLER_APPROVAL: "Pendiente del vendedor",
};

export const statusLabel = (status?: string | null) => {
  if (!status) return "Pendiente";
  return labels[status] || status.replaceAll("_", " ").toLowerCase();
};
