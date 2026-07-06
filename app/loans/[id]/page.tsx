import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { enrichLoan } from "@/lib/loan-helpers";
import { formatCurrency, formatDate } from "@/lib/interest";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });

  if (!loan) notFound();

  const enriched = enrichLoan(loan);

  const details = [
    { label: "Customer Name", value: loan.customerName },
    { label: "Loan Amount", value: formatCurrency(loan.loanAmount) },
    { label: "Interest Rate", value: `${loan.interestRate}% per month` },
    { label: "Loan Date", value: formatDate(loan.loanDate) },
    { label: "Pledged Item", value: loan.pledgedItem },
    { label: "Net Weight", value: `${loan.netWeight.toFixed(2)} g` },
    { label: "Estimated Value", value: formatCurrency(loan.estimatedValue) },
    {
      label: "Total Interest Till Today",
      value: formatCurrency(enriched.totalInterestTillToday),
    },
    {
      label: "Principal Paid",
      value: formatCurrency(enriched.totalPrincipalPaid),
    },
    {
      label: "Interest Paid",
      value: formatCurrency(enriched.totalInterestPaid),
    },
    {
      label: "Balance Principal",
      value: formatCurrency(enriched.balancePrincipal),
    },
    {
      label: "Total Amount Payable",
      value: formatCurrency(enriched.totalAmountPayable),
      highlight: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/loans"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Loans
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {loan.customerName}
          </h1>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              enriched.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {enriched.status}
          </span>
        </div>
        {!enriched.isFullyPaid && (
          <Link
            href={`/payments?loanId=${loan.id}`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Receive Payment
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Loan Details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {details.map((item) => (
            <div
              key={item.label}
              className={item.highlight ? "sm:col-span-2 rounded-md bg-slate-50 p-4" : ""}
            >
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd
                className={`mt-1 ${
                  item.highlight
                    ? "text-xl font-bold text-slate-900"
                    : "font-medium text-slate-900"
                }`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Payment History
        </h2>
        {loan.payments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Interest Paid
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Principal Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(payment.interestPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(payment.principalPaid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
