import prisma from "../database/prisma";

interface CalculateLoanData {
  amount: number;
  months: number;
  annualInterestRate: number;
}

interface ApplyLoanData {
  userId: string;
  amount: number;
  months: number;

  annualInterestRate: number;

  income: number;
  company: string;
  documentId: string;
}

export const calculateLoan = ({
  amount,
  months,
  annualInterestRate,
}: CalculateLoanData) => {
  const monthlyRate = annualInterestRate / 12 / 100;

  const monthlyPayment =
    (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - amount;

  return {
    amount,
    months,
    annualInterestRate,
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
  };
};

export const applyLoan = async ({
  userId,
  amount,
  months,
  annualInterestRate,
  income,
  company,
  documentId,
}: ApplyLoanData) => {
  if (!userId) {
    throw new Error("Usuario requerido");
  }

  let score = 50;

  if (income >= amount * 0.5) {
    score += 20;
  }

  if (months <= 12) {
    score += 10;
  }

  const status = score >= 70 ? "APPROVED" : "PENDING";

  const calculation = calculateLoan({
    amount,
    months,
    annualInterestRate,
  });

  const loan = await prisma.loan.create({
    data: {
      userId,
      amount,
      months,
      annualInterestRate,
      monthlyPayment: calculation.monthlyPayment,
      totalPayment: calculation.totalPayment,
      totalInterest: calculation.totalInterest,
      income,
      company,
      documentId,
      score,
      status,
    },
  });

  const cooperativeResponse = {
    status: "PENDING",
    message: "Prestamo local creado; CoopHispanica maneja el flujo real.",
  };

  return {
    ...loan,
    cooperativeResponse,
  };
};

export const getLoanStatus = async (loanId: string) => {
  const loan = await prisma.loan.findUnique({
    where: {
      id: loanId,
    },
  });

  if (!loan) {
    throw new Error("Préstamo no encontrado");
  }

  return loan;
};

export const syncLoanPayments = async (loanId: string) => {
  const loan = await prisma.loan.findUnique({
    where: {
      id: loanId,
    },
  });

  if (!loan) {
    throw new Error("Préstamo no encontrado");
  }

  return {
    synced: true,
    loanId: loan.id,
    status: loan.status,
  };
};



