export const payInstallment = async (installmentId: string) => {
  throw new Error(
    `El pago de cuotas esta pendiente de integracion con la cooperativa. Cuota: ${installmentId}`,
  );
};
