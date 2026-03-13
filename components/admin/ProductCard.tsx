"use client";

import { useState } from "react";
import Image from "next/image";
import { productImage } from "@/lib/productImage";
import ProductModal from "./ProductModal";

type Props = {
  product: any;
  onToggleVisibility?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  isTrash?: boolean;
};

export default function ProductCard({
  product,
  onToggleVisibility,
  onArchive,
  onRestore,
  isTrash = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
const [imgSrc, setImgSrc] = useState(
  `/products/catalog/${product.id.toLowerCase()}.png`
);
  const isHidden = product.visible === false;

  const publicPrices =
    product.concentrations?.map((c: any) => c.prices?.public || 0) || [];

  const min =
    publicPrices.length > 0 ? Math.min(...publicPrices) : 0;
  const max =
    publicPrices.length > 0 ? Math.max(...publicPrices) : 0;  
const totalStock =
  product.concentrations?.reduce(
    (sum: number, c: any) => sum + (c.stock || 0),
    0
  ) || 0;
  const reorderLevel = product.reorderLevel ?? 0;
const reorderNeeded = reorderLevel > 0 && totalStock <= reorderLevel;

let stockBorder = "border-slate-200";

if (totalStock === 0) {
  stockBorder = "border-red-400";
} else if (totalStock <= 5) {
  stockBorder = "border-amber-400";
}
  return (
    <>
      <div
  onClick={() => setModalOpen(true)}
  className={`relative bg-white rounded-xl border ${stockBorder}
  shadow-sm hover:shadow-md hover:-translate-y-0.5
  transition-all duration-200 text-center cursor-pointer
  overflow-hidden
  ${isHidden ? "opacity-60" : ""}`}
>
        {/* Three Dot Menu */}
        {!isTrash && (
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-md shadow-md text-sm z-20">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 text-red-600"
                  onClick={() => {
                    onArchive?.(product.id);
                    setMenuOpen(false);
                  }}
                >
                  Move to Trash
                </button>
              </div>
            )}
          </div>
        )}

        {/* Restore Button (Trash View) */}
        {isTrash && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore?.(product.id);
            }}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs"
          >
            Restore
          </button>
        )}

{/* Product Image */}
<div
  onClick={() => setModalOpen(true)}
  className="relative w-full h-40 mb-3 flex items-center justify-center overflow-hidden"
>
  <Image
    src={imgSrc}
    alt={product.name}
    fill
    className="object-contain p-3"
    sizes="(max-width: 768px) 100vw, 300px"
    onError={() => setImgSrc("/products/catalog/default.png")}
  />
</div>

        {/* Name */}
        <div className="p-6 pt-2">
          {product.name}
        </div>

        {/* Code */}
        <div className="text-xs text-slate-500 mb-2">
          {product.code}
        </div>

        {/* Price Range */}
        <div className="text-sm font-semibold text-slate-900">
          ${min}
          {min !== max && ` – $${max.toFixed(0)}`}
        </div>

        <div className="mt-2 text-xs text-slate-500">

  <div>Stock: {totalStock}</div>

  {totalStock === 0 && (
    <div className="text-red-600 font-medium">
      Out of Stock
    </div>
  )}

  {reorderNeeded && (
    <div className="text-orange-600 font-semibold">
      ⚠ Reorder Recommended
    </div>
  )}

</div>

        {/* Plain Visible Checkbox (Bottom Left) */}
        {!isTrash && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!isHidden}
              onChange={() => {
                onToggleVisibility?.(product.id);
              }}
              className="w-4 h-4"
            />
            <span className="text-xs">
              Visible
            </span>
          </div>
        )}
      </div>

      {modalOpen && !isTrash && (
<ProductModal
  product={product}
  onClose={() => setModalOpen(false)}
  onSaved={() => setModalOpen(false)}
/>
      )}
    </>
  );
}