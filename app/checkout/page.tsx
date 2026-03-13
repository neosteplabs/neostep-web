"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const FREE_SHIPPING_THRESHOLD = 250;
const SHIPPING_FLAT_RATE = 9;

const shippingCost =
  totalPrice >= FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_FLAT_RATE;

const estimatedTotal = totalPrice + shippingCost;

  async function handleSubmit() {
    if (!user) return;

    setSubmitting(true);
    setError("");

    try {
      const token = await user.getIdToken();

const res = await fetch("/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }
});

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      setOrderId(data.orderId);
      setOrderNumber(data.orderNumber);
      setFinalTotal(data.total);
      setSubmittedAt(new Date());
      setConfirmed(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-semibold">
          Cart is empty
        </h1>
      </div>
    );
  }

  // 🔒 Confirmation Screen (No Redirect)
if (confirmed) {
  return (
    <div className="min-h-screen bg-slate-100 pt-20 md:pt-28 px-5 md:px-6">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm">

        <h1 className="text-2xl md:text-xl font-semibold mb-3">
          Research Order Submitted
        </h1>

        <p className="text-sm text-slate-600 mb-5 md:mb-6 leading-relaxed">
          Your order has been received and is currently pending internal review.
          Orders are subject to verification prior to invoicing and fulfillment.
        </p>

        <div className="border border-slate-200 rounded-lg p-4 md:p-5 mb-5 md:mb-6 text-sm space-y-4">

          <div className="flex justify-between">
            <span>Order ID</span>
            <span className="font-medium break-all text-right max-w-[60%]">
              {orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Status</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
              Pending Review
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-medium">
              ${finalTotal?.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Submitted</span>
            <span className="text-right max-w-[60%]">
              {submittedAt?.toLocaleString()}
            </span>
          </div>

        </div>

        <button
          onClick={() => router.push(`/account/orders/${orderId}`)}
          className="w-full bg-black text-white py-3 uppercase text-xs tracking-widest hover:opacity-90 transition"
        >
          View Order Details
        </button>

      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-100 pt-28 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* LEFT: ORDER SUMMARY */}
        <div className="bg-white p-8 rounded-xl shadow-sm">

          <h1 className="text-lg font-semibold tracking-wide uppercase mb-6">
            Order Summary
          </h1>

          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <div className="text-sm font-medium">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {item.sku} × {item.quantity}
                  </div>
                </div>

                <div className="text-sm font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

<div className="flex justify-between text-slate-500">
  <span>Shipping</span>
  <span>
    {shippingCost === 0 ? "FREE" : `$${shippingCost}`}
  </span>
</div>

<div className="flex justify-between font-semibold text-base pt-4 border-t">
  <span>Total</span>
  <span>${estimatedTotal.toFixed(2)}</span>
</div>
          </div>
        </div>

        {/* RIGHT: SUBMISSION */}
        <div className="bg-white p-8 rounded-xl shadow-sm">

          <h2 className="text-lg font-semibold tracking-wide uppercase mb-6">
            Secure Research Order
          </h2>

          <div className="text-sm text-slate-600 mb-6">
            Logged in as:
            <div className="font-medium mt-1">
              {user.email}
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 mb-6 text-xs text-slate-500">
            All products are sold for laboratory research use only.
            Orders are subject to internal review prior to invoicing and fulfillment.
          </div>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-black text-white py-3 uppercase text-xs tracking-widest hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Research Order"}
          </button>

          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}