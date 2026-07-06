import Link from "next/link";
import LoanTable from "@/components/LoanTable";

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
          <p className="mt-1 text-sm text-slate-600">
            All pawn loans and their current status
          </p>
        </div>
        <Link
          href="/loans/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create Loan
        </Link>
      </div>

      <div className="mt-8">
        <LoanTable />
      </div>
    </div>
  );
}
