'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SelectedModification = {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifications: SelectedModification[];
  totalPrice: number;
};

const DELIVERY_FEE = 2.99;
const SERVICE_FEE = 1.5;

type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
};

type CheckoutClientProps = {
  institutionId: string;
  institutionName: string;
  branches: Branch[];
};

export default function CheckoutClient({ institutionId, institutionName, branches }: CheckoutClientProps) {
  const router = useRouter();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDelivery, setIsDelivery] = useState(true);
  const [timeOption, setTimeOption] = useState<'asap' | 'schedule'>('asap');
  const [paymentMethod, setPaymentMethod] = useState<'mobile-payment' | 'cash'>('mobile-payment');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`cart-${institutionId}`);
      if (saved) {
        try {
          const parsedCart = JSON.parse(saved);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    }
  }, [institutionId]);

  // Auto-select first branch if available
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  // Format modifications for display
  const formatModifications = (modifications: SelectedModification[]): string => {
    if (!modifications || modifications.length === 0) return '';
    return modifications.map(m => m.name).join(', ');
  };

  const itemsSubtotal = cart.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  const subtotal = itemsSubtotal + SERVICE_FEE; // Include service fee in subtotal
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  // Transform cart data to order format
  const transformCartToOrderItems = () => {
    const orderItems: Array<{
      menu_item_id: string | null;
      item_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      variant_name: string | null;
      notes: string | null;
    }> = [];
    
    const addonsMap: Record<string, Array<{
      addon_name: string;
      addon_price: number;
      quantity: number;
    }>> = {};

    cart.forEach((cartItem, index) => {
      // Separate variants from addons
      const variantMod = cartItem.modifications.find(m => m.groupId === 'variant');
      const addonMods = cartItem.modifications.filter(m => m.groupId === 'addons');
      
      // Calculate base unit price (item price + variant price difference)
      const variantPriceDiff = variantMod ? variantMod.price : 0;
      const baseUnitPrice = cartItem.price + variantPriceDiff;
      
      // Calculate unit price including addons (for total_price calculation)
      const addonPricePerUnit = addonMods.reduce((sum, addon) => sum + addon.price, 0);
      const unitPriceWithAddons = baseUnitPrice + addonPricePerUnit;
      
      orderItems.push({
        menu_item_id: cartItem.itemId || null,
        item_name: cartItem.name,
        quantity: cartItem.quantity,
        unit_price: unitPriceWithAddons,
        total_price: cartItem.totalPrice,
        variant_name: variantMod ? variantMod.name : null,
        notes: null,
      });

      // Store addons for this item (use index to match orderItems array)
      if (addonMods.length > 0) {
        const itemKey = `item-${index}`;
        addonsMap[itemKey] = addonMods.map(addon => ({
          addon_name: addon.name,
          addon_price: addon.price,
          quantity: cartItem.quantity, // Each unit gets the addon
        }));
      }
    });

    return { orderItems, addonsMap };
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (cart.length === 0) {
      setSubmitError('Your cart is empty');
      return;
    }

    if (!customerName.trim()) {
      setSubmitError('Please enter your name');
      return;
    }

    if (!customerPhone.trim()) {
      setSubmitError('Please enter your WhatsApp number');
      return;
    }

    if (isDelivery && !deliveryAddress.trim()) {
      setSubmitError('Please enter a delivery address');
      return;
    }

    if (!isDelivery && !selectedBranch) {
      setSubmitError('Please select a branch for pickup');
      return;
    }

    // Ensure branch is selected (use first branch if delivery and no branch selected)
    const branchId = isDelivery 
      ? (selectedBranch || branches[0]?.id || '')
      : selectedBranch;

    if (!branchId) {
      setSubmitError('Please select a branch');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { orderItems, addonsMap } = transformCartToOrderItems();

      // Map payment method
      const paymentMethodMap: Record<string, 'cash' | 'mobile_money'> = {
        'cash': 'cash',
        'mobile-payment': 'mobile_money',
      };

      const backendPaymentMethod = paymentMethodMap[paymentMethod] || null;
      const isMobileMoney = backendPaymentMethod === 'mobile_money';
      const nowIso = new Date().toISOString();

      // Create order data
      const orderData = {
        institution_id: institutionId,
        branch_id: branchId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        delivery_address: isDelivery ? deliveryAddress.trim() : null,
        delivery_type: isDelivery ? 'delivery' : 'pickup',
        channel: 'website',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        payment_method: backendPaymentMethod,
        payment_status: isMobileMoney ? 'paid' : 'pending',
        paid_at: isMobileMoney ? nowIso : null,
        notes: deliveryInstructions.trim() || null,
        status: 'pending' as const,
      };

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: orderData,
          items: orderItems,
          addonsMap,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear cart
      localStorage.removeItem(`cart-${institutionId}`);

      // Navigate to confirmation page with order ID
      router.push(`/restaurant/${institutionId}/checkout/confirmation?orderId=${result.order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/restaurant/${institutionId}`}
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
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-xs text-stone-500">
              {institutionName} &middot; 25–35 min delivery
            </p>
          </div>
        </div>
      </header>

      {/* Error message */}
      {submitError && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {submitError}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* Left column - details */}
          <section className="space-y-4">
            {/* Branch Selection */}
            {!isDelivery && (
              <div className="bg-white rounded-2xl border border-stone-200/60 p-4">
                <h2 className="text-sm font-semibold text-stone-900 mb-3">
                  Select branch
                </h2>
                {branches.length === 0 ? (
                  <p className="text-sm text-stone-500">No branches available</p>
                ) : (
                  <div className="space-y-2">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setSelectedBranch(branch.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedBranch === branch.id
                            ? 'border-stone-900 bg-stone-50'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">
                              {branch.name}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {branch.address}
                            </p>
                            {branch.phone && (
                              <p className="text-xs text-stone-400 mt-0.5">
                                {branch.phone}
                              </p>
                            )}
                          </div>
                          {selectedBranch === branch.id && (
                            <svg
                              className="w-5 h-5 text-stone-900 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                    Full name *
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    WhatsApp number (for receipt) *
                  </label>
                  <input
                    type="tel"
                    placeholder="+233 XX XXX XXXX (WhatsApp)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-600">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                />
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
                    Street address *
                  </label>
                  <input
                    type="text"
                    placeholder="123 Oak Street"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
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
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
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
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-600">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
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
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile-payment')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'mobile-payment'
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Mobile payment</span>
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Cash</span>
                </button>
              </div>
              {paymentMethod === 'mobile-payment' && (
                <div className="pt-2">
                  <p className="text-xs text-stone-500">
                    You&apos;ll complete payment using your mobile money service (MTN, Vodafone, etc.) when your order arrives.
                  </p>
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
                {cart.length === 0 ? (
                  <p className="text-sm text-stone-500 text-center py-4">
                    Your cart is empty
                  </p>
                ) : (
                  cart.map((item) => {
                    const modificationsText = formatModifications(item.modifications);
                    return (
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
                            {modificationsText && (
                              <p className="text-xs text-stone-400 line-clamp-2">
                                {modificationsText}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-stone-900">
                          ₵{item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="text-stone-900">
                    ₵{subtotal.toFixed(2)}
                  </span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery fee</span>
                    <span className="text-stone-900">
                      ₵{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
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
                By placing your order, you agree to {institutionName}&apos;s terms and
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
            onClick={handlePlaceOrder}
            disabled={isSubmitting || (!isDelivery && !selectedBranch)}
            className="w-full sm:w-auto sm:px-6 py-3 rounded-xl bg-stone-900 text-stone-50 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Placing order...</span>
              </>
            ) : (
              <span>Place order</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
