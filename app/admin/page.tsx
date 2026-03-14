"use client";

import DashboardPanel from "@/components/admin/panels/DashboardPanel";
import InventoryPanel from "@/components/admin/panels/InventoryPanel";
import OrdersPanel from "@/components/admin/panels/OrdersPanel";
import ShipmentsPanel from "@/components/admin/panels/ShipmentsPanel";
import UsersPanel from "@/components/admin/panels/UsersPanel";

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
  const [incomingExpanded, setIncomingExpanded] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateShipment, setShowCreateShipment] = useState(false);

  const [receiveShipmentId, setReceiveShipmentId] = useState<string | null>(null);
  const [receiveDate, setReceiveDate] = useState("");

  const [shipmentSearch, setShipmentSearch] = useState("");

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

}, []);

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
const receiveShipment = async (
  shipmentId: string,
  receivedAt?: string
) => {

  const token = await auth.currentUser?.getIdToken();
  if (!token) return;

  await fetch("/api/admin/shipments/receive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      shipmentId,
      receivedAt
    })
  });

};

const activeProducts = products.filter((p) => !p.archived);
const trashedProducts = products.filter((p) => p.archived === true);

const sortedProducts = [...activeProducts].sort((a, b) => {
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
  <DashboardPanel orders={orders} />
)}

{/* INVENTORY CATEGORIES */}
{activeView.startsWith("inventory") && (

<InventoryPanel
products={products}
sortedProducts={sortedProducts}
activeView={activeView}
inventoryTitles={inventoryTitles}
currentCategoryCount={currentCategoryCount}
setShowAddModal={setShowAddModal}
sortMode={sortMode}
setSortMode={setSortMode}
toggleVisibility={toggleVisibility}
archiveProduct={archiveProduct}
/>

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
<OrdersPanel
orders={orders}
orderFilter={orderFilter}
setOrderFilter={setOrderFilter}
setSelectedOrder={setSelectedOrder}
updateOrderStatus={updateOrderStatus}
/>
)}

{/* SHIPMENTS */}
{activeView === "shipments" && (
<ShipmentsPanel
shipments={shipments}
products={products}
shipmentSearch={shipmentSearch}
setShipmentSearch={setShipmentSearch}
expandedShipments={expandedShipments}
setExpandedShipments={setExpandedShipments}
receiveShipment={receiveShipment}
deleteShipment={deleteShipment}
setShowCreateShipment={setShowCreateShipment}
receiveShipmentId={receiveShipmentId}
setReceiveShipmentId={setReceiveShipmentId}
receiveDate={receiveDate}
setReceiveDate={setReceiveDate}
incomingExpanded={incomingExpanded}
setIncomingExpanded={setIncomingExpanded}
/>
)}
        {/* USERS */}
{activeView === "users" && (
<UsersPanel
users={users}
updateUserRole={updateUserRole}
/>
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