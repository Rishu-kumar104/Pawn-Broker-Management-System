"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/interest";

interface JournalEntry {
  id: string;
  voucherNo: string;
  account: string;
  debit: number;
  credit: number;
  date: string;
  loan: { customerName: string };
}

export default function DayBookTable() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDayBook() {
      try {
        const res = await fetch("/api/daybook");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEntries(data);
      } catch {
        setError("Failed to load day book entries");
      } finally {
        setLoading(false);
      }
    }
    fetchDayBook();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        Loading day book...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-slate-600">No journal entries yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-700">
              Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700">
              Voucher No
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700">
              Customer
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700">
              Account
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">
              Debit
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">
              Credit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-600">
                {formatDate(entry.date)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {entry.voucherNo}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {entry.loan.customerName}
              </td>
              <td className="px-4 py-3 text-slate-600">{entry.account}</td>
              <td className="px-4 py-3 text-right text-slate-600">
                {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
