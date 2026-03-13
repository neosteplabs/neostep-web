"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/admin/Sidebar";
import ProductCard from "@/components/admin/ProductCard";
import AddProductModal from "@/components/admin/AddProductModal";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import CreateShipmentModal from "@/components/admin/CreateShipmentModal";

type View =
  | "dashboard"
  | "inventory_weightloss"
  | "inventory_recovery"
  | "inventory_nootropic"
  | "inventory_growth"
  | "inventory_research"
  | "inventory_tanning"
  | "trash"
  | "orders"
  | "users"
  | "shipments";

type OrderStatus = "pending" | "completed" | "cancelled";

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedShipments, setExpandedShipments] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [showCreateShipment, setShowCreateShipment] = useState(false);

  const [activeView, setActiveView] = useState<View>("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");
  const [sortMode, setSortMode] = useState<"display" | "alpha">("alpha");

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setProducts(items);
    }
  );

  return () => unsubscribe();
}, []);

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setOrders(items);
    }
  );

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!auth.currentUser) return;

  const unsubscribe = onSnapshot(
    collection(db, "supplierOrders"),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setShipments(items);
    }
  );

  return () => unsubscribe();
}, [auth.currentUser]);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.replace("/");
      return;
    }

    try {
      // 🔐 Verify admin via secure API
      const token = await user.getIdToken(true);
      const res = await fetch("/api/admin/get-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

if (!res.ok) {
  console.error("Admin API check failed:", res.status);
  setLoading(false);
  return;
}

      // Admin confirmed → load admin data
      await fetchUsers();

      setLoading(false);

    } catch (err) {
      console.error("Admin verification failed:", err);
      router.replace("/catalog");
    }
  });

  return () => unsubscribe();
}, [router]);

  const fetchUsers = async () => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) return;

    const res = await fetch("/api/admin/get-users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.users) setUsers(data.users);
  };

const updateUserRole = async (
  targetUid: string,
  tier: "public" | "vip" | "family"
) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) return;

  await fetch("/api/admin/update-user-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetUid, tier }),
  });

  await fetchUsers();
};

  const toggleVisibility = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    await updateDoc(doc(db, "products", id), {
      visible: !product.visible,
    });
  };

  const archiveProduct = async (id: string) => {
    await updateDoc(doc(db, "products", id), {
      archived: true,
      visible: false,
    });

  };

  const restoreProduct = async (id: string) => {
    await updateDoc(doc(db, "products", id), {
      archived: false,
    });

  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    await fetch("/api/admin/update-order-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, status }),
    });
  };

const deleteShipment = async (shipmentId: string) => {
  const confirmText = prompt(
    'Type "DELETE" to permanently remove this shipment.'
  );

  if (confirmText !== "DELETE") {
    alert("Deletion cancelled.");
    return;
  }

  await deleteDoc(doc(db, "supplierOrders", shipmentId));
  
};
const receiveShipment = async (shipmentId: string) => {

  const token = await auth.currentUser?.getIdToken();
  if (!token) return;

  await fetch("/api/admin/shipments/receive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ shipmentId })
  });

};

  const activeProducts = products.filter((p) => !p.archived);
  const trashedProducts = products.filter((p) => p.archived === true);

  const sortedProducts = [...activeProducts].sort((a, b) => {
  const sortedProducts = [...activeProducts].sort((a, b) => {
  if (sortMode === "alpha") {
    return (a.name || "").localeCompare(b.name || "");
  }
  return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
});
    if (sortMode === "alpha") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

const categoryCounts = {

  weightloss: products.filter(p =>
    p.category?.toLowerCase().includes("weight")
  ).length,

  recovery: products.filter(p =>
    p.category?.toLowerCase().includes("recovery")
  ).length,

  nootropic: products.filter(p =>
    p.category?.toLowerCase().includes("nootropic")
  ).length,

  growth: products.filter(p =>
    p.category?.toLowerCase().includes("growth")
  ).length,

  research: products.filter(p =>
    p.category?.toLowerCase().includes("research")
  ).length,

  tanning: products.filter(p =>
    p.category?.toLowerCase().includes("tanning")
  ).length,
};

const inventoryTitles: Record<string, string> = {
  inventory_weightloss: "Weight Loss Inventory",
  inventory_recovery: "Recovery Inventory",
  inventory_nootropic: "Nootropic Inventory",
  inventory_growth: "Growth Hormone Inventory",
  inventory_research: "Research Compounds Inventory",
  inventory_tanning: "Tanning Inventory",
};

const currentCategoryCount = (() => {
  if (activeView === "inventory_weightloss") return categoryCounts.weightloss;
  if (activeView === "inventory_recovery") return categoryCounts.recovery;
  if (activeView === "inventory_nootropic") return categoryCounts.nootropic;
  if (activeView === "inventory_growth") return categoryCounts.growth;
  if (activeView === "inventory_research") return categoryCounts.research;
  if (activeView === "inventory_tanning") return categoryCounts.tanning;

  return products.length;
})();

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((o) => o.status === orderFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center pt-20">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 flex">
      <div className="w-[240px] border-r border-slate-800 bg-slate-900">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          trashCount={trashedProducts.length}
          counts={categoryCounts}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-10">

        {/* DASHBOARD */}
        {activeView === "dashboard" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold text-white mb-8">
              Dashboard
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Orders" value={orders.length} />
              <StatCard
                label="Pending"
                value={orders.filter(o => o.status === "pending").length}
              />
              <StatCard
                label="Completed"
                value={orders.filter(o => o.status === "completed").length}
              />
              <StatCard
                label="Revenue"
                value={
                  "$" +
                  orders.reduce(
                    (sum, o) => sum + (o.financials?.total || 0),
                    0
                  )
                }
              />
            </div>
          </div>
        )}

{/* INVENTORY CATEGORIES */}
{activeView.startsWith("inventory") && (
  <div className="max-w-6xl mx-auto">

    <div className="flex justify-between items-center mb-8">
<h1 className="text-xl font-semibold text-white">
  {inventoryTitles[activeView] || "Product Inventory"} ({currentCategoryCount})
</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
        >
          + Add Product
        </button>

        <select
          value={sortMode}
          onChange={(e) =>
            setSortMode(e.target.value as "display" | "alpha")
          }
          className="bg-white border border-slate-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="alpha">Alphabetical (A–Z)</option>
          <option value="display">Display Order</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sortedProducts
 .filter((product) => {

  const cat = (product.category || "").toLowerCase();

  if (activeView === "inventory_weightloss")
    return cat.includes("weight");

  if (activeView === "inventory_recovery")
    return cat.includes("recovery");

  if (activeView === "inventory_nootropic")
    return cat.includes("nootropic");

  if (activeView === "inventory_growth")
  return cat.includes("growth");

  if (activeView === "inventory_research")
  return cat.includes("research");

  if (activeView === "inventory_tanning")
  return cat.includes("tanning");

  return true;
})
        .map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onToggleVisibility={toggleVisibility}
            onArchive={archiveProduct}
          />
        ))}
    </div>

  </div>
)}

        {/* TRASH */}
        {activeView === "trash" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-semibold text-white mb-8">
              Trash
            </h1>

            {trashedProducts.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                Trash is empty.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trashedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isTrash
                    onRestore={restoreProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
{activeView === "orders" && (
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-xl font-semibold text-white">
        Orders
      </h1>

      <select
        value={orderFilter}
        onChange={(e) =>
          setOrderFilter(
            e.target.value as "all" | OrderStatus
          )
        }
        className="bg-white border border-slate-300 rounded-md px-3 py-1 text-sm"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs uppercase text-slate-400 border-b">
        <div>Order</div>
        <div>Date</div>
        <div>Total</div>
        <div>Status</div>
        <div>Inventory</div>
      </div>

      {filteredOrders.map((order) => (
        <div
          key={order.id}
          onClick={() => setSelectedOrder(order)}
          className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 border-b text-sm hover:bg-slate-50 cursor-pointer"
        >
          <div className="truncate font-medium">
            {order.orderNumber || order.id}
          </div>

          <div>
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleDateString()
              : "—"}
          </div>

          <div>${order.financials?.total || 0}</div>

          <div
  onClick={(e) => e.stopPropagation()}
  className="flex items-center gap-2"
>
            <select
              value={order.status || "pending"}
              onChange={(e) =>
                updateOrderStatus(
                  order.id,
                  e.target.value as OrderStatus
                )
              }
              className="h-9 px-4 rounded-lg border border-slate-200 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            {order.inventoryAdjusted ? "Adjusted" : "Pending"}
          </div>
        </div>
      ))}

    </div>
  </div>
)}

{/* SHIPMENTS */}
{activeView === "shipments" && (
  <div className="max-w-6xl mx-auto">

    <div className="flex justify-between items-center mb-8">
      <h1 className="text-xl font-semibold text-white">
        Supplier Shipments
      </h1>

      <button
        onClick={() => setShowCreateShipment(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
      >
        + Create Shipment
      </button>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

<div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] px-6 py-3 text-xs uppercase text-slate-400 border-b">
  <div>Supplier</div>
  <div>Company</div>
  <div>Ordered</div>
  <div>Items</div>
  <div>Status</div>
</div>

{shipments.map((shipment) => (
  <div key={shipment.id}>

    <div
      onClick={() =>
        setExpandedShipments((prev) =>
          prev.includes(shipment.id)
            ? prev.filter((x) => x !== shipment.id)
            : [...prev, shipment.id]
        )
      }
      className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] items-center px-6 py-4 border-b text-sm cursor-pointer hover:bg-slate-50"
    >
      <div className="font-medium">
        {shipment.supplierName}
      </div>

      <div>
        {shipment.supplierCompany || "—"}
      </div>

      <div>
        {shipment.orderDate?.toDate
          ? shipment.orderDate.toDate().toLocaleDateString()
          : "—"}
      </div>

<div className="text-xs">
  <div>
    {shipment.items?.reduce((sum:any,i:any)=>sum+(i.boxesOrdered||0),0)||0} boxes
  </div>

  <div className="text-slate-400">
    {shipment.items?.reduce((sum:any,i:any)=>sum+(i.totalVials||0),0)||0} vials
  </div>
</div>

      <div
  onClick={(e) => e.stopPropagation()}
  className="flex items-center gap-2"
>
        {shipment.status !== "received" ? (
          <button
            onClick={() => receiveShipment(shipment.id)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
          >
            Receive
          </button>
        ) : (
          <span className="text-slate-500">{shipment.status}</span>
        )}

          <button
    onClick={() => deleteShipment(shipment.id)}
    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
  >
    Delete
  </button>
      </div>
    </div>

    {expandedShipments.includes(shipment.id) && (
<div className="bg-slate-50 px-10 py-4 border-b text-sm">
  {shipment.items?.map((item: any, index: number) => (
    <div
      key={index}
      className="grid grid-cols-2 max-w-md py-1 text-slate-700"
    >
      <div>{item.sku}</div>
      <div>
  {item.boxesOrdered || 0} box{item.boxesOrdered === 1 ? "" : "es"} → {(item.boxesOrdered || 0) * item.vialsPerBox} vials
</div>
    </div>
  ))}
</div>
)}

  </div>
))}

    </div>
  </div>
)}

        {/* USERS */}
{activeView === "users" && (
  <div className="max-w-6xl mx-auto">
    <h1 className="text-2xl font-semibold text-white mb-8">
      User Management
    </h1>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="grid grid-cols-3 px-6 py-3 text-xs uppercase text-slate-400 border-b">
        <div>Email</div>
        <div>Tier</div>
        <div></div>
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-3 items-center px-6 py-4 border-b text-sm"
        >
          <div className="truncate">{user.email}</div>

          <select
            value={user.tier || "public"}
            onChange={(e) =>
              updateUserRole(
                user.id,
                e.target.value as "public" | "vip" | "family"
              )
            }
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="public">Public</option>
            <option value="vip">VIP</option>
            <option value="family">Family</option>
          </select>

          <div className="text-xs text-slate-400">
            UID: {user.id}
          </div>
        </div>
      ))}

    </div>
  </div>
)}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

{showAddModal && (
  <AddProductModal
    onClose={() => {
      setShowAddModal(false);
    }}
  />
)}
      {showCreateShipment && (
  <CreateShipmentModal
    products={products}
    onClose={() => setShowCreateShipment(false)}
    onCreated={() => {}}
  />
)}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}