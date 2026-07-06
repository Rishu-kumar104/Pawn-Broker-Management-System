import { differenceInDays } from "date-fns";

/**
 * Calculate interest accrued on principal from loanDate to asOfDate.
 * Formula: (Principal × Rate × Days) / (30 × 100)
 */
export function calculateInterest(
  principal: number,
  interestRate: number,
  loanDate: Date,
  asOfDate: Date = new Date()
): number {
  if (principal <= 0 || interestRate < 0) return 0;

  const days = differenceInDays(asOfDate, loanDate);
  if (days <= 0) return 0;

  const interest = (principal * interestRate * days) / (30 * 100);
  return Math.round(interest * 100) / 100;
}

export interface PaymentSummary {
  principalPaid: number;
  interestPaid: number;
}

export function sumPayments(
  payments: { principalPaid: number; interestPaid: number }[]
): PaymentSummary {
  return payments.reduce(
    (acc, p) => ({
      principalPaid: acc.principalPaid + p.principalPaid,
      interestPaid: acc.interestPaid + p.interestPaid,
    }),
    { principalPaid: 0, interestPaid: 0 }
  );
}

export function getBalancePrincipal(
  loanAmount: number,
  payments: { principalPaid: number }[]
): number {
  const totalPrincipalPaid = payments.reduce(
    (sum, p) => sum + p.principalPaid,
    0
  );
  return Math.round((loanAmount - totalPrincipalPaid) * 100) / 100;
}

export function getLastActivityDate(
  loanDate: Date,
  payments: { paymentDate: Date }[]
): Date {
  if (payments.length === 0) return loanDate;

  const latest = payments.reduce((max, p) =>
    p.paymentDate > max ? p.paymentDate : max
  , payments[0].paymentDate);

  return latest;
}

export function getPendingInterest(
  balancePrincipal: number,
  interestRate: number,
  loanDate: Date,
  payments: { paymentDate: Date }[],
  asOfDate: Date = new Date()
): number {
  const referenceDate = getLastActivityDate(loanDate, payments);
  return calculateInterest(
    balancePrincipal,
    interestRate,
    referenceDate,
    asOfDate
  );
}

export function getTotalInterestTillToday(
  balancePrincipal: number,
  interestRate: number,
  loanDate: Date,
  payments: { paymentDate: Date; interestPaid: number }[],
  asOfDate: Date = new Date()
): number {
  const pending = getPendingInterest(
    balancePrincipal,
    interestRate,
    loanDate,
    payments,
    asOfDate
  );
  const interestPaidTotal = payments.reduce(
    (sum, p) => sum + p.interestPaid,
    0
  );
  return Math.round((pending + interestPaidTotal) * 100) / 100;
}

export function getTotalAmountPayable(
  balancePrincipal: number,
  pendingInterest: number
): number {
  return Math.round((balancePrincipal + pendingInterest) * 100) / 100;
}

export function isLoanFullyPaid(
  balancePrincipal: number,
  pendingInterest: number
): boolean {
  return balancePrincipal <= 0 && pendingInterest <= 0;
}

export function allocatePayment(
  paymentAmount: number,
  pendingInterest: number
): { interestPaid: number; principalPaid: number } {
  const interestPaid = Math.min(paymentAmount, pendingInterest);
  const principalPaid = Math.round((paymentAmount - interestPaid) * 100) / 100;
  return {
    interestPaid: Math.round(interestPaid * 100) / 100,
    principalPaid,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
