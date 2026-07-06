import type { Loan, Payment } from "@prisma/client";
import {
  getBalancePrincipal,
  getPendingInterest,
  getTotalAmountPayable,
  getTotalInterestTillToday,
  isLoanFullyPaid,
  sumPayments,
} from "./interest";

export type LoanWithPayments = Loan & { payments: Payment[] };

export interface LoanComputed {
  balancePrincipal: number;
  pendingInterest: number;
  totalInterestTillToday: number;
  totalAmountPayable: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  status: "Active" | "Closed";
  isFullyPaid: boolean;
}

export function computeLoanMetrics(loan: LoanWithPayments): LoanComputed {
  const balancePrincipal = getBalancePrincipal(loan.loanAmount, loan.payments);
  const pendingInterest = getPendingInterest(
    balancePrincipal,
    loan.interestRate,
    loan.loanDate,
    loan.payments
  );
  const totals = sumPayments(loan.payments);
  const totalInterestTillToday = getTotalInterestTillToday(
    balancePrincipal,
    loan.interestRate,
    loan.loanDate,
    loan.payments
  );
  const totalAmountPayable = getTotalAmountPayable(
    balancePrincipal,
    pendingInterest
  );
  const fullyPaid = isLoanFullyPaid(balancePrincipal, pendingInterest);

  return {
    balancePrincipal,
    pendingInterest,
    totalInterestTillToday,
    totalAmountPayable,
    totalPrincipalPaid: totals.principalPaid,
    totalInterestPaid: totals.interestPaid,
    status: fullyPaid ? "Closed" : "Active",
    isFullyPaid: fullyPaid,
  };
}

export function enrichLoan(loan: LoanWithPayments) {
  return {
    ...loan,
    ...computeLoanMetrics(loan),
  };
}
