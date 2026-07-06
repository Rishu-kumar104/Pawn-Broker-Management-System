"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    customerName: "",
    loanDate: new Date().toISOString().split("T")[0],
    loanAmount: "",
    interestRate: "",
    pledgedItem: "",
    grossWeight: "",
    stoneWeight: "0",
    estimatedValue: "",
    paymentMode: "Cash" as "Cash" | "Bank",
  });

  const grossWeight = parseFloat(form.grossWeight) || 0;
  const stoneWeight = parseFloat(form.stoneWeight) || 0;
  const netWeight = Math.max(0, grossWeight - stoneWeight);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          loanAmount: parseFloat(form.loanAmount),
          interestRate: parseFloat(form.interestRate),
          grossWeight: parseFloat(form.grossWeight),
          stoneWeight: parseFloat(form.stoneWeight),
          estimatedValue: parseFloat(form.estimatedValue),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "Failed to create loan");
        return;
      }

      router.push(`/loans/${data.id}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className={labelClass}>
            Customer Name *
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            required
            value={form.customerName}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.customerName && (
            <p className={errorClass}>{fieldErrors.customerName[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="loanDate" className={labelClass}>
            Loan Date *
          </label>
          <input
            id="loanDate"
            name="loanDate"
            type="date"
            required
            value={form.loanDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="loanAmount" className={labelClass}>
            Loan Amount *
          </label>
          <input
            id="loanAmount"
            name="loanAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.loanAmount}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.loanAmount && (
            <p className={errorClass}>{fieldErrors.loanAmount[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="interestRate" className={labelClass}>
            Interest Rate (% per month) *
          </label>
          <input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.interestRate}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.interestRate && (
            <p className={errorClass}>{fieldErrors.interestRate[0]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pledgedItem" className={labelClass}>
            Pledged Item Name *
          </label>
          <input
            id="pledgedItem"
            name="pledgedItem"
            type="text"
            required
            value={form.pledgedItem}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="grossWeight" className={labelClass}>
            Gross Weight (g) *
          </label>
          <input
            id="grossWeight"
            name="grossWeight"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.grossWeight}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.grossWeight && (
            <p className={errorClass}>{fieldErrors.grossWeight[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="stoneWeight" className={labelClass}>
            Stone Weight (g)
          </label>
          <input
            id="stoneWeight"
            name="stoneWeight"
            type="number"
            step="0.01"
            min="0"
            value={form.stoneWeight}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.stoneWeight && (
            <p className={errorClass}>{fieldErrors.stoneWeight[0]}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Net Weight (g)</label>
          <input
            type="text"
            readOnly
            value={netWeight.toFixed(2)}
            className={`${inputClass} bg-slate-50 text-slate-600`}
          />
        </div>

        <div>
          <label htmlFor="estimatedValue" className={labelClass}>
            Estimated Item Value *
          </label>
          <input
            id="estimatedValue"
            name="estimatedValue"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.estimatedValue}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="paymentMode" className={labelClass}>
            Payment Mode *
          </label>
          <select
            id="paymentMode"
            name="paymentMode"
            value={form.paymentMode}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving..." : "Create Loan"}
      </button>
    </form>
  );
}
