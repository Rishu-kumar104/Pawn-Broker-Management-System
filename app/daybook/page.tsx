import DayBookTable from "@/components/DayBookTable";

export default function DayBookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Day Book</h1>
      <p className="mt-1 text-sm text-slate-600">
        All journal entries sorted by date (newest first)
      </p>

      <div className="mt-8">
        <DayBookTable />
      </div>
    </div>
  );
}
