"use client";

import { useState } from "react";

type View =
  | "dashboard"
  | "inventory_weightloss"
  | "inventory_recovery"
  | "inventory_nootropic"
  | "inventory_growth"
  | "inventory_research"
  | "inventory_tanning"
  | "orders"
  | "shipments"
  | "trash"
  | "users";

type Props = {
  activeView: View;
  setActiveView: (view: View) => void;
  trashCount: number;
  counts: Record<string, number>;
};

export default function Sidebar({
  activeView,
  setActiveView,
  trashCount,
  counts
}: Props) {
  const [inventoryOpen, setInventoryOpen] = useState(false);
const totalInventory =
  (counts.weightloss || 0) +
  (counts.recovery || 0) +
  (counts.nootropic || 0) +
  (counts.growth || 0) +
  (counts.research || 0) +
  (counts.tanning || 0);
  return (
    <div className="h-full w-full bg-slate-900 text-slate-200 flex flex-col px-5 py-8">

      {/* HEADER */}
      <h1 className="text-lg font-semibold mb-8 tracking-wide text-white">
        NeoStep Admin
      </h1>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-2 text-sm">

        {/* DASHBOARD */}
        <button
          onClick={() => setActiveView("dashboard")}
          className={`text-left px-3 py-2 rounded-md transition ${
            activeView === "dashboard"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800"
          }`}
        >
          Dashboard
        </button>

        {/* INVENTORY */}
        <button
          onClick={() => setInventoryOpen(!inventoryOpen)}
          className="flex items-center justify-between text-left px-3 py-2 rounded-md transition hover:bg-slate-800"
        >
          <span>Inventory ({totalInventory})</span>

          <span
            className={`text-xs transition-transform ${
              inventoryOpen ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        </button>

        {inventoryOpen && (
          <div className="ml-4 flex flex-col gap-1">

            <button
              onClick={() => setActiveView("inventory_weightloss")}
              className={`text-left px-3 py-2 rounded-md transition ${
                activeView === "inventory_weightloss"
                  ? "bg-slate-700 text-white"
                  : "hover:bg-slate-800"
              }`}
            >
              Weight Loss ({counts.weightloss || 0})
            </button>

            <button
              onClick={() => setActiveView("inventory_recovery")}
              className={`text-left px-3 py-2 rounded-md transition ${
                activeView === "inventory_recovery"
                  ? "bg-slate-700 text-white"
                  : "hover:bg-slate-800"
              }`}
            >
              Recovery ({counts.recovery || 0})
            </button>

            <button
              onClick={() => setActiveView("inventory_nootropic")}
              className={`text-left px-3 py-2 rounded-md transition ${
                activeView === "inventory_nootropic"
                  ? "bg-slate-700 text-white"
                  : "hover:bg-slate-800"
              }`}
            >
              Nootropic ({counts.nootropic || 0})
            </button>
            <button
  onClick={() => setActiveView("inventory_growth")}
  className={`text-left px-3 py-2 rounded-md transition ${
    activeView === "inventory_growth"
      ? "bg-slate-700 text-white"
      : "hover:bg-slate-800"
  }`}
>
  Growth Hormone ({counts.growth || 0})
</button>

<button
  onClick={() => setActiveView("inventory_research")}
  className={`text-left px-3 py-2 rounded-md transition ${
    activeView === "inventory_research"
      ? "bg-slate-700 text-white"
      : "hover:bg-slate-800"
  }`}
>
  Research Compounds ({counts.research || 0})
</button>

<button
  onClick={() => setActiveView("inventory_tanning")}
  className={`text-left px-3 py-2 rounded-md transition ${
    activeView === "inventory_tanning"
      ? "bg-slate-700 text-white"
      : "hover:bg-slate-800"
  }`}
>
  Tanning ({counts.tanning || 0})
</button>

          </div>
        )}

        {/* ORDERS */}
        <button
          onClick={() => setActiveView("orders")}
          className={`text-left px-3 py-2 rounded-md transition ${
            activeView === "orders"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800"
          }`}
        >
          Orders
        </button>

        {/* SHIPMENTS */}
        <button
          onClick={() => setActiveView("shipments")}
          className={`text-left px-3 py-2 rounded-md transition ${
            activeView === "shipments"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800"
          }`}
        >
          Shipments
        </button>

        {/* TRASH */}
        <button
          onClick={() => setActiveView("trash")}
          className={`text-left px-3 py-2 rounded-md transition ${
            activeView === "trash"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800"
          }`}
        >
          Trash ({trashCount})
        </button>

        {/* USERS */}
        <button
          onClick={() => setActiveView("users")}
          className={`text-left px-3 py-2 rounded-md transition ${
            activeView === "users"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800"
          }`}
        >
          Users
        </button>

      </nav>

      {/* FOOTER */}
      <div className="mt-auto text-xs opacity-50 pt-8">
        Internal Control Panel
      </div>

    </div>
  );
}