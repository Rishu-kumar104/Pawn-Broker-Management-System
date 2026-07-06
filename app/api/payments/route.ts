import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentJournalEntries } from "@/lib/accounting";
import {
  allocatePayment,
  getBalancePrincipal,
  getPendingInterest,
  isLoanFullyPaid,
} from "@/lib/interest";
import {
  createPaymentSchema,
  validationErrorResponse,
} from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");

    const payments = await prisma.payment.findMany({
      where: loanId ? { loanId } : undefined,
      include: {
        loan: { select: { customerName: true, id: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(validationErrorResponse(parsed.error), {
        status: 400,
      });
    }

    const { loanId, amount } = parsed.data;
    const paymentDate = parsed.data.paymentDate ?? new Date();

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { payments: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const balancePrincipal = getBalancePrincipal(loan.loanAmount, loan.payments);
    const pendingInterest = getPendingInterest(
      balancePrincipal,
      loan.interestRate,
      loan.loanDate,
      loan.payments,
      paymentDate
    );

    if (isLoanFullyPaid(balancePrincipal, pendingInterest)) {
      return NextResponse.json(
        { error: "Loan is already fully paid" },
        { status: 400 }
      );
    }

    const { interestPaid, principalPaid } = allocatePayment(
      amount,
      pendingInterest
    );

    const payment = await prisma.payment.create({
      data: {
        loanId,
        amount,
        principalPaid,
        interestPaid,
        paymentDate,
      },
    });

    await createPaymentJournalEntries({
      loanId,
      paymentMode: loan.paymentMode as "Cash" | "Bank",
      amount,
      interestPaid,
      principalPaid,
      date: paymentDate,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
