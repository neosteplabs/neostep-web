"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function CreateShipmentModal({ products, onClose, onCreated }: any) {

const [supplierName, setSupplierName] = useState("");
const [supplierCompany, setSupplierCompany] = useState("");
const [productCost, setProductCost] = useState(0);
const [shippingCost, setShippingCost] = useState(0);
const [paymentFees, setPaymentFees] = useState(0);
const [otherFees, setOtherFees] = useState(0);

const [trackingNumber, setTrackingNumber] = useState("");
const [carrier, setCarrier] = useState("FedEx");

const [orderDate, setOrderDate] = useState(
  new Date().toISOString().slice(0,16)
);

const [items, setItems] = useState([
  {
    productId: "",
    productName: "",
    sku: "",
    boxes: 1,
    vialsPerBox: 10
  }
]);

const [saving, setSaving] = useState(false);

  async function createShipment() {
  console.log("Creating shipment", supplierName, items);

  if (saving) return;

  setSaving(true);

    const token = await auth.currentUser?.getIdToken();

    const formattedItems = items
  .filter((item:any) => item.productId && item.sku)
  .map((item:any) => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      boxesOrdered: item.boxes,
      vialsPerBox: item.vialsPerBox,
      totalVials: item.boxes * item.vialsPerBox
    }));
    if (!supplierName.trim()) {
  alert("Please enter a supplier name");
  return;
}

if (items.some(i => !i.productId || !i.sku)) {
  alert("Please select a product and SKU for each item");
  return;
}

    const res = await fetch("/api/admin/shipments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
body: JSON.stringify({
  supplierName,
  supplierCompany,
  orderDate,
  trackingNumber,
  carrier,

  costs: {
    productCost,
    shippingCost,
    paymentFees,
    otherFees,
    total:
      productCost +
      shippingCost +
      paymentFees +
      otherFees
  },

  items
})
    });

const data = await res.json();
console.log("Shipment API response:", data);

setSaving(false);

onCreated();
onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/40 backdrop-blur-sm pt-24 pb-10">

      <div className="bg-white rounded-xl p-6 w-full max-w-[640px] max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold">Create Shipment</h2>

{/* Supplier */}
<div className="grid grid-cols-2 gap-3">

  <div>
    <label className="text-sm">Supplier Name</label>

    <input
      value={supplierName}
      onChange={(e)=>setSupplierName(e.target.value)}
      className="w-full border rounded px-3 py-2"
    />
  </div>

  <div>
    <label className="text-sm">Company</label>

    <input
      value={supplierCompany}
      onChange={(e)=>setSupplierCompany(e.target.value)}
      className="w-full border rounded px-3 py-2"
    />
  </div>

</div>

{/* Order Date */}
<div>
  <label className="text-sm">Order Date</label>

  <input
    type="datetime-local"
    value={orderDate}
    onChange={(e)=>setOrderDate(e.target.value)}
    className="w-full border rounded px-3 py-2"
  />
</div>

{/* Tracking Info */}
<div className="grid grid-cols-2 gap-3">

  <div>
    <label className="text-sm">Tracking Number</label>

    <input
      value={trackingNumber}
      onChange={(e)=>setTrackingNumber(e.target.value)}
      className="w-full border rounded px-3 py-2"
    />
  </div>

  <div>
    <label className="text-sm">Carrier</label>

    <input
      value={carrier}
      onChange={(e)=>setCarrier(e.target.value)}
      className="w-full border rounded px-3 py-2"
    />
  </div>

</div>

        {/* ITEMS */}
        <div className="space-y-4">

          {items.map((item:any, index:number) => {

            const product = products.find((p:any) => p.id === item.productId);

            return (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >

                <div className="grid grid-cols-2 gap-3">

                  {/* PRODUCT */}
                  <div>
                    <label className="text-sm">Product</label>

                    <select
                      value={item.productId}
                      onChange={(e)=>{

                        const product = products.find((p:any)=>p.id === e.target.value);

                        const updated = [...items];
                        updated[index].productId = product?.id || "";
                        updated[index].productName = product?.name || "";
                        updated[index].sku = "";

                        setItems(updated);

                      }}
                      className="w-full border rounded px-2 py-2"
                    >
                      <option value="">Select</option>

                      {products.map((p:any)=>(
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="text-sm">SKU</label>

                    <select
                      value={item.sku}
                      onChange={(e)=>{

                        const updated = [...items];
                        updated[index].sku = e.target.value;

                        setItems(updated);

                      }}
                      className="w-full border rounded px-2 py-2"
                    >
                      <option value="">Select</option>

                      {product?.concentrations?.map((c:any)=>(
                        <option key={c.sku} value={c.sku}>
                          {c.sku}
                        </option>
                      ))}

                    </select>
                  </div>

                </div>

                {/* BOXES + VIALS */}
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="text-sm">Boxes</label>

                    <input
                      type="number"
                      value={item.boxes}
                      onChange={(e)=>{

                        const updated = [...items];
                        updated[index].boxes = Number(e.target.value);

                        setItems(updated);

                      }}
                      className="w-full border rounded px-2 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm">Vials / Box</label>

                    <input
                      type="number"
                      value={item.vialsPerBox}
                      onChange={(e)=>{

                        const updated = [...items];
                        updated[index].vialsPerBox = Number(e.target.value);

                        setItems(updated);

                      }}
                      className="w-full border rounded px-2 py-2"
                    />
                  </div>

                </div>

                <div className="text-sm text-gray-500">
                  Total Vials: {item.boxes * item.vialsPerBox}
                </div>

              </div>
            );
          })}

<div className="mt-6 border-t pt-4">
  <h3 className="text-sm font-semibold mb-3">Shipment Costs</h3>

  <div className="grid grid-cols-2 gap-3">

    <div>
      <label className="text-xs text-slate-500">Product Cost</label>
      <input
        type="number"
        value={productCost}
        onChange={(e)=>setProductCost(Number(e.target.value))}
        className="w-full border rounded px-2 py-1"
      />
    </div>

    <div>
      <label className="text-xs text-slate-500">Shipping</label>
      <input
        type="number"
        value={shippingCost}
        onChange={(e)=>setShippingCost(Number(e.target.value))}
        className="w-full border rounded px-2 py-1"
      />
    </div>

    <div>
      <label className="text-xs text-slate-500">Payment Fees</label>
      <input
        type="number"
        value={paymentFees}
        onChange={(e)=>setPaymentFees(Number(e.target.value))}
        className="w-full border rounded px-2 py-1"
      />
    </div>

    <div>
      <label className="text-xs text-slate-500">Other Fees</label>
      <input
        type="number"
        value={otherFees}
        onChange={(e)=>setOtherFees(Number(e.target.value))}
        className="w-full border rounded px-2 py-1"
      />
    </div>

  </div>

  <div className="mt-3 text-sm font-semibold">
    Total Cost: $
    {(productCost + shippingCost + paymentFees + otherFees).toFixed(2)}
  </div>

</div>

          {/* ADD PRODUCT BUTTON */}
          <button
            onClick={() =>
              setItems([
                ...items,
                {
                  productId: "",
                  productName: "",
                  sku: "",
                  boxes: 1,
                  vialsPerBox: 10
                }
              ])
            }
            className="text-blue-600 text-sm"
          >
            + Add Product
          </button>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 pt-4">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

<button
  onClick={createShipment}
  disabled={saving}
  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
>
  {saving ? "Creating..." : "Create Shipment"}
</button>

        </div>

      </div>
    </div>
  );
}