'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CheckoutItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifications?: string;
};

const mockItems: CheckoutItem[] = [
  {
    id: '1',
    name: 'Smoked Brisket Sandwich',
    quantity: 1,
    price: 16.5,
    modifications: 'Brioche bun, extra cheese, jalapeños',
  },
  {
    id: '2',
    name: 'Build Your Own Pizza',
    quantity: 1,
    price: 24,
    modifications: 'Medium 12", classic crust, red sauce, mozzarella, pepperoni, mushrooms',
  },
  {
    id: '3',
    name: 'House Lemonade',
    quantity: 2,
    price: 5,
    modifications: 'Regular sweetness',
  },
];

const DELIVERY_FEE = 2.99;
const SERVICE_FEE = 1.5;

export default function CheckoutPage() {
  const router = useRouter();
  const [isDelivery, setIsDelivery] = useState(true);
  const [timeOption, setTimeOption] = useState<'asap' | 'schedule'>('asap');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'apple-pay'>('card');

  const itemsSubtotal = mockItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total =
    itemsSubtotal +
    (isDelivery ? DELIVERY_FEE : 0) +
    SERVICE_FEE;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a
            href="/restaurant/1"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          </a>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-xs text-stone-500">
              Ember &amp; Oak &middot; 25–35 min delivery
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* Left column - details */}
          <section className="space-y-4">
            {/* Delivery vs pickup */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-4">
              <h2 className="text-sm font-semibold text-stone-900 mb-3">
                Order type
              </h2>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIsDelivery(true)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isDelivery
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setIsDelivery(false)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    !isDelivery
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  Pickup
                </button>
              </div>
              
              {/* Delivery Pricing Info */}
              {isDelivery && (
                <div className="pt-3 border-t border-stone-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-stone-600">Delivery fee</span>
                    <span className="text-sm font-semibold text-stone-900">₵{DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Standard delivery fee applies to all orders. Free delivery on orders over ₵50.
                  </p>
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-stone-900">
                Contact info
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    WhatsApp number (for receipt)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555 000 0000 (WhatsApp)"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                  />
                </div>
              </div>
            </div>

            {/* Address (delivery only) */}
            {isDelivery && (
              <div className="bg-white rounded-2xl border border-stone-200/60 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-stone-900">
                  Delivery address
                </h2>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    Street address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Oak Street"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    Delivery instructions (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Gate code, buzzer, or any special instructions"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Time */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-stone-900">
                When
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimeOption('asap')}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    timeOption === 'asap'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  ASAP (25–35 min)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeOption('schedule')}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    timeOption === 'schedule'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  Schedule
                </button>
              </div>
              {timeOption === 'schedule' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-600">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-600">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-stone-200/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-stone-900">
                Payment
              </h2>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple-pay')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'apple-pay'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span>Apple&nbsp;Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span>Cash</span>
                </button>
              </div>
              {paymentMethod === 'card' && (
                <div className="space-y-2 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-600">
                      Card number
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-600">
                        Exp.
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-600">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-600">
                        ZIP
                      </label>
                      <input
                        type="text"
                        placeholder="94110"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </section>

          {/* Right column - summary */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/60 p-4">
              <h2 className="text-sm font-semibold text-stone-900 mb-3">
                Order summary
              </h2>
              <div className="space-y-3 mb-4">
                {mockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-stone-500">
                        {item.quantity}×
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900">
                          {item.name}
                        </p>
                        {item.modifications && (
                          <p className="text-xs text-stone-400 line-clamp-2">
                            {item.modifications}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-stone-900">
                      ₵{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Items</span>
                  <span className="text-stone-900">
                    ₵{itemsSubtotal.toFixed(2)}
                  </span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery fee</span>
                    <span className="text-stone-900">
                      ₵{DELIVERY_FEE.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Service fee</span>
                  <span className="text-stone-900">
                    ₵{SERVICE_FEE.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="h-px bg-stone-200 my-3" />
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-stone-900">
                  Total
                </span>
                <span className="text-base font-semibold text-stone-900">
                  ₵{total.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-400 text-center">
                By placing your order, you agree to Ember &amp; Oak&apos;s terms and
                refund policy.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating place order bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-stone-500">Total</span>
            <span className="text-base font-semibold text-stone-900">
              ₵{total.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/checkout/confirmation')}
            className="w-full sm:w-auto sm:px-6 py-3 rounded-xl bg-stone-900 text-stone-50 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
          >
            <span>Place order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

