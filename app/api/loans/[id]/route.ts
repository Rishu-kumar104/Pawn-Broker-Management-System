import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichLoan } from "@/lib/loan-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        payments: { orderBy: { paymentDate: "desc" } },
        journals: { orderBy: { date: "desc" } },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(enrichLoan(loan));
  } catch (error) {
    console.error("GET /api/loans/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan" },
      { status: 500 }
    );
  }
}
