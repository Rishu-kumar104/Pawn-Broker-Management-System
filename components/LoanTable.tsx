"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/interest";

interface LoanRow {
  id: string;
  customerName: string;
  loanDate: string;
  loanAmount: number;
  interestRate: number;
  balancePrincipal: number;
  status: "Active" | "Closed";
}

export default function LoanTable() {
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/loans${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLoans(data);
      } catch {
        setError("Failed to load loans");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        Loading loans...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 sm:w-auto"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && loans.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-slate-600">No loans found.</p>
          <Link
            href="/loans/new"
            className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
          >
            Create your first loan
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Customer
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Loan Date
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Loan Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Interest Rate
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Balance Principal
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {loan.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(loan.loanDate)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCurrency(loan.loanAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {loan.interestRate}%
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCurrency(loan.balancePrincipal)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        loan.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-sm font-medium text-slate-900 underline hover:no-underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
