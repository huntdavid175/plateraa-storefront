'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentConfirmationPage() {
  const params = useParams();
  const institutionId = params.id as string;

  // Mock confirmation data – will be replaced with real data later
  const orderNumber = 'EO-48219';
  const eta = '25–35 min';

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        <div className="mb-6 mt-6">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mb-2">
            Payment successful
          </h1>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Your order is on its way. We&apos;ve sent your receipt and live updates to your WhatsApp.
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/70 shadow-sm p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-stone-500">Order</p>
              <p className="text-sm font-semibold text-stone-900">
                {orderNumber}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              Confirmed
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-stone-500">Estimated arrival</p>
              <p className="text-sm font-medium text-stone-900">{eta}</p>
            </div>
            <p className="text-xs text-stone-500">
              We&apos;ll keep you posted if anything changes.
            </p>
          </div>

          <div className="h-px bg-stone-200 my-3" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Payment method</span>
              <span className="text-stone-900">Mobile payment</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Total</span>
              <span className="text-stone-900">₵48.49</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <Link
            href={`/restaurant/${institutionId}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to restaurant
          </Link>
        </div>
      </main>
    </div>
  );
}
