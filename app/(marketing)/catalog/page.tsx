"use client";

import Image from "next/image";
import QuickViewModal from "@/components/QuickViewModal";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileGate from "@/components/ProfileGate";
import { useCart } from "@/context/CartContext";
import { calculateTierPrice } from "@/lib/pricing";
import { useAuth } from "@/context/AuthContext"; // adjust if your tier lives elsewhere

type Concentration = {
  label: string;
  sku: string;
  stock: number;
  prices: {
    public: number;
  };
};

type Product = {
  id: string;
  name: string;
  images: {
    admin: string;
    public: string;
  };
  visible: boolean;
  displayOrder: number;
  concentrations: Concentration[];
};


const STACK_SUGGESTIONS: Record<string, string[]> = {
  retatrutide: ["Cagrilintide", "Tirzepatide"],
  tirzepatide: ["Cagrilintide", "Semaglutide"],
  semaglutide: ["Cagrilintide"],
  cagrilintide: ["Retatrutide", "Semaglutide"],
};

export default function CatalogPage() {
  return (
    <ProtectedRoute>
      <ProfileGate>
        <CatalogContent />
      </ProfileGate>
    </ProtectedRoute>
  );
}

function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<"public" | "vip" | "family">("public");

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // 1️⃣ Fetch tier first
        const userSnap = await getDoc(doc(db, "users", user.uid));

        const tier =
          userSnap.exists() && userSnap.data().tier
            ? userSnap.data().tier
            : "public";

        setUserTier(tier);

        // 2️⃣ Fetch products after tier
const q = query(
  collection(db, "products"),
  where("visible", "==", true),
  orderBy("name", "asc")
);

        const snapshot = await getDocs(q);

        const items: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        setProducts(items);
      } catch (err) {
        console.error("Catalog load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading)
    return <p className="mt-40 text-center">Loading catalog...</p>;

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">
          Research Compound Catalog
        </h1>
      </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    addToCart={addToCart}
    userTier={userTier}
    onQuickView={() => setQuickViewProduct(product)}
  />
))}
      </div>

      {quickViewProduct && (
  <QuickViewModal
    product={quickViewProduct}
    onClose={() => setQuickViewProduct(null)}
  />
)}
    </>
  );
}

function ProductCard({
  product,
  addToCart,
  userTier,
  onQuickView,
}: {
  product: Product;
  addToCart: any;
  userTier: "public" | "vip" | "family";
  onQuickView: () => void;
}) {
  const publicPrices =
    product.concentrations?.map((c) => c.prices?.public || 0) || [];

  const lowest =
    publicPrices.length > 0
      ? Math.min(...publicPrices.map((p) =>
          calculateTierPrice(p, userTier)
        ))
      : 0;

const selectedConcentration =
  product.concentrations?.[0];
  
  return (
<div
  onClick={onQuickView}
className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer max-w-[320px] mx-auto"
>
{product.images?.public && (
<div className="flex justify-center mb-4">
  <Image
    src={product.images.public}
    alt={product.name}
    width={180}
    height={180}
    className="object-contain"
    loading="eager"
    unoptimized
  />
</div>
)}

      <h3 className="text-lg font-medium mb-2">
        {product.name}
      </h3>
      <p className="text-xs text-slate-500 mb-2">
      {product.concentrations.map((c) => c.label).join(" • ")}
      </p>
      <p className="text-xs text-green-600 font-medium mb-2">
      Verified Research Compound • COA Available
      </p>

<p className="text-xs mb-2">
  {selectedConcentration?.stock === 0 && (
    <span className="text-red-600 font-medium">
      Out of stock
    </span>
  )}

  {selectedConcentration?.stock > 0 &&
    selectedConcentration.stock <= 5 && (
      <span className="text-orange-600 font-medium">
        ⚠ Only {selectedConcentration.stock} left
      </span>
  )}

  {selectedConcentration?.stock > 5 && (
    <span className="text-slate-500">
      {selectedConcentration.stock} in stock
    </span>
  )}
</p>

      <p className="font-semibold text-slate-800 mb-4">
  From ${lowest}
</p>

{selectedConcentration && selectedConcentration.stock === 0 && (
  <div className="text-red-600 text-sm font-medium mb-3">
    Out of stock — restock pending
  </div>
)}

<button
  onClick={onQuickView}
  className="w-full mt-2 border border-slate-300 text-sm px-4 py-2 rounded-md hover:bg-slate-100 transition"
>
  View Details →
</button>
    </div>
  );
}
