"use client";

import AdminModal from "@/components/admin/AdminModal";
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  onClose: () => void;
};

type Concentration = {
  label: string;
  family: number;
  public: number;
  vip: number;
  stock: number;
};

export default function AddProductModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [codeSuffix, setCodeSuffix] = useState("");
  const [visible, setVisible] = useState(true);
  const [concentrations, setConcentrations] = useState<Concentration[]>([
    { label: "", family: 0, public: 0, vip: 0, stock: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
const CODE_MAP: Record<string, string> = {
  retatrutide: "RT",
  tirzepatide: "TZ",
  semaglutide: "SM",
  cagrilintide: "CG",
  tb500: "TB",
  bpc157: "BP",
  tesofensine: "TS",
  aod9604: "AOD",
};      

  const handleAddConcentration = () => {
    setConcentrations([
      ...concentrations,
      { label: "", family: 0, public: 0, vip: 0, stock: 0 },
    ]);
  };

  const handleRemoveConcentration = (index: number) => {
    setConcentrations((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleChange = (
    index: number,
    field: keyof Concentration,
    value: string | number
  ) => {
    const updated = [...concentrations];
    // @ts-ignore
    updated[index][field] = value;
    setConcentrations(updated);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!name.trim()) throw new Error("Product name is required.");
      if (!codeSuffix.trim()) throw new Error("Product code is required.");

      const slug = slugify(name);
      const code = `NS-${codeSuffix.toUpperCase()}`;

      const docRef = doc(db, "products", slug);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        throw new Error("A product with this name already exists.");
      }

      const skuSet = new Set();

      const formattedConcentrations = concentrations
        .filter((c) => c.label.trim())
        .map((c) => {
          const numeric = c.label.replace(/\D/g, "");
          const sku = `${code}${numeric}`;

          if (skuSet.has(sku)) {
  throw new Error(`Duplicate concentration detected: ${c.label}`);
}

skuSet.add(sku);

          return {
            label: c.label,
            prices: {
              family: Number(c.family),
              public: Number(c.public),
              vip: Number(c.vip),
            },
            sku: sku.toUpperCase(),
            stock: Number(c.stock),
          };
        });

      if (formattedConcentrations.length === 0) {
        throw new Error("At least one concentration is required.");
      }

      await setDoc(docRef, {
        name,
        code,
        image: `/admin/products/${slug}.png`,
        displayOrder: Date.now(),
        visible,
        archived: false,
        concentrations: formattedConcentrations,
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal onClose={onClose} width="w-[700px]">
      <h2 className="text-2xl font-semibold mb-6">
        Add Product
      </h2>

      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}

      {/* PRODUCT INFO */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-sm font-medium">
            Product Name
          </label>
<input
  value={name}
  onChange={(e) => {
    const value = e.target.value;
    setName(value);

    const key = value.toLowerCase();
    if (CODE_MAP[key]) {
      setCodeSuffix(CODE_MAP[key]);
    }
  }}
  className="w-full border rounded-md px-3 py-2 mt-1"
/>
        </div>

        <div>
          <label className="text-sm font-medium">
            Product Code
          </label>
          <div className="flex mt-1">
            <div className="flex items-center px-3 bg-slate-100 border border-r-0 rounded-l-md text-sm font-medium">
              NS-
            </div>
            <input
              value={codeSuffix}
              onChange={(e) =>
                setCodeSuffix(e.target.value.toUpperCase())
              }
              className="w-full border rounded-r-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium">
          Product Visibility
        </span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={visible}
            onChange={() => setVisible(!visible)}
          />
          Visible
        </label>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Concentrations
        </h3>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 text-xs uppercase text-slate-500 mb-2 px-2">
          <div>Label</div>
          <div>Family</div>
          <div>Public</div>
          <div>VIP</div>
          <div>Stock</div>
          <div></div>
        </div>

        {/* TABLE ROWS */}
        {concentrations.map((c, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-3 items-center mb-3"
          >
            <input
              placeholder="10mg"
              value={c.label}
              onChange={(e) =>
                handleChange(index, "label", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            />

            <input
              type="number"
              value={c.family}
              onChange={(e) =>
                handleChange(index, "family", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            />

            <input
              type="number"
              value={c.public}
              onChange={(e) =>
                handleChange(index, "public", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            />

            <input
              type="number"
              value={c.vip}
              onChange={(e) =>
                handleChange(index, "vip", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            />

            <input
              type="number"
              value={c.stock}
              onChange={(e) =>
                handleChange(index, "stock", e.target.value)
              }
              className={`border rounded-md px-3 py-2 ${
                c.stock === 0
                  ? "border-red-300 bg-red-50"
                  : ""
              }`}
            />

            <button
              onClick={() =>
                handleRemoveConcentration(index)
              }
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={handleAddConcentration}
          className="text-blue-600 text-sm mt-3"
        >
          + Add Concentration
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm transition"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </AdminModal>
  );
}