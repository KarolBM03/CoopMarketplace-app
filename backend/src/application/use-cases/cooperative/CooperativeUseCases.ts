import {
  approveCooperativeLoan,
  createCooperativeInterbankTransaction,
  createCooperativeLoanApplication,
  findCooperativeMemberByCedula,
  getCooperativeHealth,
  getCooperativeInterbankTransactions,
  getCooperativeLoanApplication,
  getCooperativeLoanApplicationHistory,
  getCooperativeLoanGlobalPayments,
  getCooperativeLoanTypes,
  getCooperativeMemberDetail,
  getCooperativeMemberEligibility,
  getCooperativePaymentDetails,
  getCooperativePaymentsByInstallment,
  payCooperativeInstallment,
  payCooperativeLoan,
  testCooperativeLogin,
} from "../../../infrastructure/external-services/cooperative.service";

export class GetCooperativeHealthUseCase {
  execute() {
    return getCooperativeHealth();
  }
}

export class TestCooperativeLoginUseCase {
  execute() {
    return testCooperativeLogin();
  }
}

export class FindCooperativeMemberByCedulaUseCase {
  execute(cedula: string) {
    if (!cedula?.trim()) {
      throw new Error("La cedula es requerida");
    }

    return findCooperativeMemberByCedula(cedula.trim());
  }
}

export class GetCooperativeMemberDetailUseCase {
  execute(socioId: string) {
    if (!socioId) {
      throw new Error("El socioId es requerido");
    }

    return getCooperativeMemberDetail(socioId);
  }
}

export class GetCooperativeEligibilityUseCase {
  execute(socioId: string) {
    if (!socioId) {
      throw new Error("El socioId es requerido");
    }

    return getCooperativeMemberEligibility(socioId);
  }
}

export class GetCooperativeLoanTypesUseCase {
  execute() {
    return getCooperativeLoanTypes();
  }
}

export class CreateCooperativeLoanApplicationUseCase {
  execute(data: {
    socioId: number;
    montoSolicitado: number;
    frecuenciaPago: number;
    cantidadCuotas: number;
    objetivoPrestamo: string;
    tipoPrestamoId: number;
  }) {
    return createCooperativeLoanApplication(data);
  }
}

export class ApproveCooperativeLoanUseCase {
  execute(data: {
    solicitudPrestamoId: number;
    requiereDesembolso: boolean;
    actualizadoPor: string;
  }) {
    return approveCooperativeLoan(data);
  }
}

export class GetCooperativeLoanApplicationUseCase {
  execute(solicitudPrestamoId: string) {
    return getCooperativeLoanApplication(solicitudPrestamoId);
  }
}

export class GetCooperativeLoanApplicationHistoryUseCase {
  execute(solicitudPrestamoId: string) {
    return getCooperativeLoanApplicationHistory(solicitudPrestamoId);
  }
}

export class PayCooperativeLoanUseCase {
  execute(data: { numeroCuentaPrestamo: string; numeroCuentaOrigen: string }) {
    return payCooperativeLoan(data);
  }
}

export class PayCooperativeInstallmentUseCase {
  execute(data: {
    cuentaOrigen: string;
    cuentaPrestamoId: number;
    cuotaId: number;
    montoPagar?: number;
    canal?: string;
  }) {
    return payCooperativeInstallment(data);
  }
}

export class GetCooperativeLoanGlobalPaymentsUseCase {
  execute(prestamoId: string) {
    return getCooperativeLoanGlobalPayments(prestamoId);
  }
}

export class GetCooperativePaymentDetailsUseCase {
  execute(pagoGlobalId: string) {
    return getCooperativePaymentDetails(pagoGlobalId);
  }
}

export class GetCooperativePaymentsByInstallmentUseCase {
  execute(cuotaPrestamoId: string) {
    return getCooperativePaymentsByInstallment(cuotaPrestamoId);
  }
}

export class CreateCooperativeInterbankTransactionUseCase {
  execute(data: {
    name?: string;
    description?: string;
    amount: number;
    noAccountCoop?: string;
    identification?: string;
    nameAccountBank?: string;
    noAccountBank?: string;
    noAccountCoopAdmin?: string;
    accountBankId: string;
    transferetionTypeId: string;
    socioId: number;
    accountType?: string;
  }) {
    return createCooperativeInterbankTransaction(data);
  }
}

export class GetCooperativeInterbankTransactionsUseCase {
  execute(query: Record<string, unknown>) {
    return getCooperativeInterbankTransactions(query);
  }
}
