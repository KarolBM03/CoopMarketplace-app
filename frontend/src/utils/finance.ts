export interface InstallmentCalculationInput {
  amount: number;
  months: number;
  annualInterestRate: number;
}

export interface InstallmentCalculation {
  baseAmount: number;
  months: number;
  annualInterestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

const roundMoney = (value: number) => Number(value.toFixed(2));

export const calculateInstallments = ({
  amount,
  months,
  annualInterestRate,
}: InstallmentCalculationInput): InstallmentCalculation => {
  if (amount <= 0 || months <= 0) {
    return {
      baseAmount: 0,
      months,
      annualInterestRate,
      monthlyPayment: 0,
      totalInterest: 0,
      totalAmount: 0,
    };
  }

  const monthlyRate = annualInterestRate / 12 / 100;

  const monthlyPayment =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  const totalAmount = monthlyPayment * months;

  return {
    baseAmount: roundMoney(amount),
    months,
    annualInterestRate,
    monthlyPayment: roundMoney(monthlyPayment),
    totalInterest: roundMoney(totalAmount - amount),
    totalAmount: roundMoney(totalAmount),
  };
};

export const createIdempotencyKey = (prefix: string) => {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${random}`;
};

