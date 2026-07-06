import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { enrichLoan } from "@/lib/loan-helpers";
import { formatCurrency } from "@/lib/interest";

async function getDashboardStats() {
  const loans = await prisma.loan.findMany({
    include: { payments: true },
  });

  const enriched = loans.map(enrichLoan);
  const activeLoans = enriched.filter((l) => l.status === "Active").length;
  const totalPrincipalOutstanding = enriched.reduce(
    (sum, l) => sum + l.balancePrincipal,
    0
  );
  const totalInterestCollected = enriched.reduce(
    (sum, l) => sum + l.totalInterestPaid,
    0
  );

  return {
    totalLoans: loans.length,
    activeLoans,
    totalPrincipalOutstanding,
    totalInterestCollected,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Loans",
      value: stats.totalLoans.toString(),
      href: "/loans",
    },
    {
      title: "Active Loans",
      value: stats.activeLoans.toString(),
      href: "/loans",
    },
    {
      title: "Total Principal Outstanding",
      value: formatCurrency(stats.totalPrincipalOutstanding),
      href: "/loans",
    },
    {
      title: "Total Interest Collected",
      value: formatCurrency(stats.totalInterestCollected),
      href: "/daybook",
    },
  ];

  const quickLinks = [
    { href: "/loans", label: "View All Loans", desc: "Browse and search loans" },
    { href: "/loans/new", label: "Create Loan", desc: "Issue a new pawn loan" },
    {
      href: "/payments",
      label: "Receive Payment",
      desc: "Record customer payments",
    },
    { href: "/daybook", label: "Day Book", desc: "View journal entries" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Overview of your pawn broker operations
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-600">{card.title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">
        Quick Actions
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="font-medium text-slate-900">{link.label}</p>
            <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
