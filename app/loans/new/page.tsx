import Link from "next/link";
import LoanForm from "@/components/LoanForm";

export default function NewLoanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/loans"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Loans
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create Loan</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter customer and pledged item details to issue a new loan
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LoanForm />
      </div>
    </div>
  );
}
