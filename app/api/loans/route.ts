import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLoanJournalEntries } from "@/lib/accounting";
import { enrichLoan } from "@/lib/loan-helpers";
import {
  createLoanSchema,
  validationErrorResponse,
} from "@/lib/validations";

function getDatabaseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Unable to open the database file")) {
    return "Database write failed. SQLite is not writable in Vercel serverless runtime. Use a hosted Postgres database and set DATABASE_URL in Vercel.";
  }

  if (message.includes("Environment variable not found: DATABASE_URL")) {
    return "DATABASE_URL is missing. Set this environment variable in Vercel project settings.";
  }

  return "Failed to create loan";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const loans = await prisma.loan.findMany({
      where: search
        ? { customerName: { contains: search } }
        : undefined,
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    });

    const enriched = loans.map(enrichLoan);

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/loans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createLoanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(validationErrorResponse(parsed.error), {
        status: 400,
      });
    }

    const data = parsed.data;
    const netWeight = data.grossWeight - data.stoneWeight;

    const loan = await prisma.loan.create({
      data: {
        customerName: data.customerName,
        loanDate: data.loanDate,
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        pledgedItem: data.pledgedItem,
        grossWeight: data.grossWeight,
        stoneWeight: data.stoneWeight,
        netWeight,
        estimatedValue: data.estimatedValue,
        paymentMode: data.paymentMode,
      },
    });

    await createLoanJournalEntries({
      loanId: loan.id,
      loanAmount: loan.loanAmount,
      paymentMode: data.paymentMode,
      date: data.loanDate,
    });

    const fullLoan = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: { payments: true },
    });

    return NextResponse.json(enrichLoan(fullLoan!), { status: 201 });
  } catch (error) {
    console.error("POST /api/loans error:", error);
    const message = getDatabaseErrorMessage(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
