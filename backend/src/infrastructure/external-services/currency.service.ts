const manualRates: Record<string, number> = {
  DOP: 1,
  USD: Number(process.env.USD_TO_DOP || 59),
  EUR: Number(process.env.EUR_TO_DOP || 64),
};

export const getExchangeRate = (from = "DOP", to = "DOP") => {
  const fromRate = manualRates[from] || 1;
  const toRate = manualRates[to] || 1;

  return fromRate / toRate;
};

export const convertCurrency = (
  amount: number,
  from = "DOP",
  to = "DOP",
) => {
  return amount * getExchangeRate(from, to);
};

export const formatMoney = (amount: number, currency = "DOP") => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
  }).format(amount);
};



