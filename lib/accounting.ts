import { prisma } from "./prisma";

export const ACCOUNTS = {
  LOAN_RECEIVABLE: "Loan Receivable",
  INTEREST_INCOME: "Interest Income",
  CASH: "Cash",
  BANK: "Bank",
} as const;

type PaymentMode = "Cash" | "Bank";

function cashOrBankAccount(mode: PaymentMode): string {
  return mode === "Bank" ? ACCOUNTS.BANK : ACCOUNTS.CASH;
}

/** Generate next voucher number with prefix (JV for journal, RV for receipt). */
export async function generateVoucherNo(prefix: "JV" | "RV"): Promise<string> {
  const journals = await prisma.journal.findMany({
    where: { voucherNo: { startsWith: prefix } },
    select: { voucherNo: true },
    orderBy: { voucherNo: "desc" },
    take: 1,
  });

  let nextNum = 1;
  if (journals.length > 0) {
    const lastNum = parseInt(journals[0].voucherNo.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

export interface LoanJournalInput {
  loanId: string;
  loanAmount: number;
  paymentMode: PaymentMode;
  date: Date;
}

/** Create double-entry journal rows when a new loan is issued. */
export async function createLoanJournalEntries(
  input: LoanJournalInput
): Promise<void> {
  const voucherNo = await generateVoucherNo("JV");
  const cashBank = cashOrBankAccount(input.paymentMode);

  await prisma.journal.createMany({
    data: [
      {
        loanId: input.loanId,
        voucherNo,
        account: ACCOUNTS.LOAN_RECEIVABLE,
        debit: input.loanAmount,
        credit: 0,
        date: input.date,
      },
      {
        loanId: input.loanId,
        voucherNo,
        account: cashBank,
        debit: 0,
        credit: input.loanAmount,
        date: input.date,
      },
    ],
  });
}

export interface PaymentJournalInput {
  loanId: string;
  paymentMode: PaymentMode;
  amount: number;
  interestPaid: number;
  principalPaid: number;
  date: Date;
}

/** Create double-entry journal rows when a payment is received. */
export async function createPaymentJournalEntries(
  input: PaymentJournalInput
): Promise<void> {
  const voucherNo = await generateVoucherNo("RV");
  const cashBank = cashOrBankAccount(input.paymentMode);
  const entries: {
    loanId: string;
    voucherNo: string;
    account: string;
    debit: number;
    credit: number;
    date: Date;
  }[] = [
    {
      loanId: input.loanId,
      voucherNo,
      account: cashBank,
      debit: input.amount,
      credit: 0,
      date: input.date,
    },
  ];

  if (input.interestPaid > 0) {
    entries.push({
      loanId: input.loanId,
      voucherNo,
      account: ACCOUNTS.INTEREST_INCOME,
      debit: 0,
      credit: input.interestPaid,
      date: input.date,
    });
  }

  if (input.principalPaid > 0) {
    entries.push({
      loanId: input.loanId,
      voucherNo,
      account: ACCOUNTS.LOAN_RECEIVABLE,
      debit: 0,
      credit: input.principalPaid,
      date: input.date,
    });
  }

  await prisma.journal.createMany({ data: entries });
}
