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
  SENT_TO_COOPERATIVE: "Enviada a CoopHispanica",
  UNDER_REVIEW: "En evaluacion",
  COUNTER_OFFER: "Contraoferta",
  CUSTOMER_ACCEPTED: "Oferta aceptada",
  WAITING_COOPERATIVE_PAYMENT: "Pendiente de pago en CoopHispanica",
  REJECTED: "Rechazado",
  RETURNED: "Devuelto",
  SHIPPED: "Enviada",
  SUCCESS: "Exitoso",
  PENDING_PREPARATION: "Pendiente de preparacion",
  PREPARING: "Preparando",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregada",
};

export const statusLabel = (status?: string | null) => {
  if (!status) return "Pendiente";
  return labels[status] || status.replaceAll("_", " ").toLowerCase();
};
