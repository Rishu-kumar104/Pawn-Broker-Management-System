import { Suspense } from "react";
import PaymentForm from "@/components/PaymentForm";

function PaymentFormFallback() {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500">
      Loading...
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Receive Payment</h1>
      <p className="mt-1 text-sm text-slate-600">
        Record a payment against an active loan. Interest is allocated first,
        then principal.
      </p>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Suspense fallback={<PaymentFormFallback />}>
          <PaymentForm />
        </Suspense>
      </div>
    </div>
  );
}
