import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      include: {
        loan: { select: { customerName: true } },
      },
      orderBy: [{ date: "desc" }, { voucherNo: "desc" }],
    });

    return NextResponse.json(journals);
  } catch (error) {
    console.error("GET /api/daybook error:", error);
    return NextResponse.json(
      { error: "Failed to fetch day book entries" },
      { status: 500 }
    );
  }
}
