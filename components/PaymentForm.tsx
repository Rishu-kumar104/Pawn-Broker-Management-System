"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/interest";

interface LoanOption {
  id: string;
  customerName: string;
  balancePrincipal: number;
  pendingInterest: number;
  totalAmountPayable: number;
  isFullyPaid: boolean;
}

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLoanId = searchParams.get("loanId");

  const [loans, setLoans] = useState<LoanOption[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    loanId: preselectedLoanId || "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    async function fetchLoans() {
      try {
        const res = await fetch("/api/loans");
        const data = await res.json();
        const activeLoans = data.filter((l: LoanOption) => !l.isFullyPaid);
        setLoans(activeLoans);
        if (preselectedLoanId && activeLoans.some((l: LoanOption) => l.id === preselectedLoanId)) {
          setForm((prev) => ({ ...prev, loanId: preselectedLoanId }));
        }
      } catch {
        setError("Failed to load loans");
      } finally {
        setLoadingLoans(false);
      }
    }
    fetchLoans();
  }, [preselectedLoanId]);

  const selectedLoan = loans.find((l) => l.id === form.loanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: form.loanId,
          amount: parseFloat(form.amount),
          paymentDate: form.paymentDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) setFieldErrors(data.details);
        setError(data.error || "Failed to record payment");
        return;
      }

      setSuccess(
        `Payment recorded: Interest ${formatCurrency(data.interestPaid)}, Principal ${formatCurrency(data.principalPaid)}`
      );
      setForm((prev) => ({ ...prev, amount: "" }));

      const loansRes = await fetch("/api/loans");
      const loansData = await loansRes.json();
      setLoans(loansData.filter((l: LoanOption) => !l.isFullyPaid));

      if (preselectedLoanId) {
        setTimeout(() => router.push(`/loans/${preselectedLoanId}`), 1500);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  if (loadingLoans) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        Loading loans...
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-slate-600">No active loans available for payment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="loanId" className={labelClass}>
          Select Loan *
        </label>
        <select
          id="loanId"
          name="loanId"
          required
          value={form.loanId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, loanId: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">-- Select a loan --</option>
          {loans.map((loan) => (
            <option key={loan.id} value={loan.id}>
              {loan.customerName} — Payable:{" "}
              {formatCurrency(loan.totalAmountPayable)}
            </option>
          ))}
        </select>
        {fieldErrors.loanId && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.loanId[0]}</p>
        )}
      </div>

      {selectedLoan && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Balance Principal:{" "}
            <span className="font-medium text-slate-900">
              {formatCurrency(selectedLoan.balancePrincipal)}
            </span>
          </p>
          <p className="mt-1">
            Pending Interest:{" "}
            <span className="font-medium text-slate-900">
              {formatCurrency(selectedLoan.pendingInterest)}
            </span>
          </p>
          <p className="mt-1">
            Total Payable:{" "}
            <span className="font-medium text-slate-900">
              {formatCurrency(selectedLoan.totalAmountPayable)}
            </span>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="paymentDate" className={labelClass}>
          Payment Date
        </label>
        <input
          id="paymentDate"
          name="paymentDate"
          type="date"
          value={form.paymentDate}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, paymentDate: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="amount" className={labelClass}>
          Payment Amount *
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={form.amount}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, amount: e.target.value }))
          }
          className={inputClass}
        />
        {fieldErrors.amount && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.amount[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !form.loanId}
        className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : "Receive Payment"}
      </button>
    </form>
  );
}
