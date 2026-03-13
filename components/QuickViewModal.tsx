"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculateTierPrice } from "@/lib/pricing";
import { Product, Concentration } from "@/types/product";

type Props = {
  product: any;
  onClose: () => void;
};

export default function QuickViewModal({ product, onClose }: Props) {

  const { addToCart } = useCart();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const concentration = product.concentrations[selectedIndex];

  const price = calculateTierPrice(
    concentration.prices.public,
    "public"
  );

  return (
    /* OVERLAY */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        className="
          bg-white
          w-full
          md:max-w-3xl
          md:rounded-xl
          max-h-[90vh]
          overflow-y-auto

          p-6 md:p-8 pb-24 md:pb-8
          grid grid-cols-1 md:grid-cols-2 gap-6

          relative

opacity-0
scale-95
animate-[modalIn_.22s_cubic-bezier(.16,1,.3,1)_forwards]

          md:shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-slate-700 text-3xl leading-none"
        >
          ✕
        </button>

{/* PRODUCT IMAGE */}
<div className="flex items-center justify-center">
  <img
    src={product.images?.public}
    alt={product.name}
    className="max-h-[320px] object-contain mx-auto"
  />
</div>

        {/* PRODUCT INFO */}
        <div>

          <h2 className="text-xl font-semibold mb-1">
            {product.name}
          </h2>

          <p className="text-sm text-slate-500 mb-3">
            Laboratory research compound available in multiple concentrations.
          </p>

{/* AVAILABLE CONCENTRATIONS LIST */}
<div className="mb-2">

  <div className="text-xs font-medium text-slate-500 mb-2">
    Available Concentrations
  </div>

  <div className="space-y-0.5 text-sm">
    {product.concentrations.map((c: Concentration, i: number) => {

      const price = calculateTierPrice(
        c.prices.public,
        "public"
      );

      return (
        <div
          key={i}
          className="flex justify-between text-slate-700"
        >

          <span>{c.label}</span>

          <span className="flex items-center gap-2">

            ${price}

            {c.stock <= 5 && c.stock > 0 && (
<span className="text-xs text-orange-600 flex items-center gap-1">
  <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
  {c.stock} left
</span>
            )}

            {c.stock === 0 && (
              <span className="text-xs text-red-600">
                Out
              </span>
            )}

          </span>

        </div>
      );
    })}
  </div>

</div>

          {/* CONCENTRATION SELECTOR */}
          <select
            value={selectedIndex}
            onChange={(e) => {
              setSelectedIndex(Number(e.target.value));
              setQuantity(1);
            }}
            className="w-full mb-3 border border-slate-300 rounded-md px-3 py-2"
          >
            {product.concentrations.map((c: Concentration, i: number) => {
              const price = calculateTierPrice(
                c.prices.public,
                "public"
              );

              return (
                <option
                  key={i}
                  value={i}
                  disabled={c.stock === 0}
                >
                  {c.label} – ${price}
                  {c.stock === 0
                    ? " (Out of stock)"
                                       : c.stock <= 5
                    ? ` (${c.stock} left)`
                    : ""}
                </option>
              );
            })}
          </select>

{/* QUANTITY SELECTOR */}
<div className="flex items-center border border-slate-300 rounded-md w-fit mb-3">

  <button
    onClick={() =>
      setQuantity((q) => Math.max(1, q - 1))
    }
    className="px-4 py-2 text-slate-600 hover:bg-slate-100"
  >
    −
  </button>

  <span className="px-5 text-sm font-medium">
    {quantity}
  </span>

  <button
    onClick={() =>
      setQuantity((q) =>
        Math.min(concentration.stock, q + 1)
      )
    }
    className="px-4 py-2 text-slate-600 hover:bg-slate-100"
  >
    +
  </button>

</div>

          {/* STOCK WARNING */}
          {concentration.stock <= 5 && concentration.stock > 0 && (
            <div className="text-xs text-orange-500 mb-4">
              Only {concentration.stock} remaining
            </div>
          )}

          {/* DESKTOP ADD TO CART */}
          <div className="hidden md:block">
            <button
              disabled={concentration.stock === 0}
              onClick={() => {

                if (quantity > concentration.stock) {
                  alert("Not enough stock available.");
                  return;
                }

                addToCart({
                  productId: product.id,
                  name: product.name,
                  sku: concentration.sku,
                  price,
                  quantity
                });

                onClose();

              }}
              className={`w-full py-3 rounded-md text-white ${
                concentration.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {concentration.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          </div>

        </div>

      </div>

      {/* MOBILE STICKY ADD TO CART */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <button
          disabled={concentration.stock === 0}
          onClick={() => {

            if (quantity > concentration.stock) {
              alert("Not enough stock available.");
              return;
            }

            addToCart({
              productId: product.id,
              name: product.name,
              sku: concentration.sku,
              price,
              quantity
            });

            onClose();

          }}
          className={`w-full py-4 rounded-lg text-white text-lg ${
            concentration.stock === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600"
          }`}
        >
          {concentration.stock === 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
      </div>

    </div>
  );
}