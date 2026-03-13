"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { user } = useAuth();
  const { totalQty } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin);
    }

    checkAdmin();
  }, [user]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[80px] bg-white border-b border-slate-200 shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-8">

          <Link href="/catalog">
            <img
              src="/products/catalog/logo/neostep-logo-header.jpg"
              className="h-[40px] object-contain"
              alt="NeoStep Logo"
            />
          </Link>

          {user && (
            <div className="flex items-center gap-6 text-sm text-slate-600">

              <Link href="/catalog" className="hover:text-slate-900">
                Catalog
              </Link>

              <Link href="/account" className="hover:text-slate-900">
                Profile
              </Link>

              {isAdmin && (
                <Link href="/admin" className="hover:text-slate-900">
                  Dashboard
                </Link>
              )}

              {/* CART ICON */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                🛒
                {totalQty > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalQty}
                  </span>
                )}
              </button>

              <button
                onClick={() => signOut(auth)}
                className="hover:text-slate-900"
              >
                Logout
              </button>

            </div>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}