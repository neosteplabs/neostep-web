import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Dynamic pricing engine (server authoritative)
 */
function calculateTierPrice(
  publicPrice: number,
  tier: "public" | "vip" | "family"
) {
  if (tier === "public") return publicPrice;

  // $100 and above
  if (publicPrice >= 100) {
    return tier === "vip"
      ? publicPrice - 20
      : publicPrice - 40;
  }

  // $60 to $99.99
  if (publicPrice >= 60) {
    return tier === "vip"
      ? publicPrice - 10
      : publicPrice - 20;
  }

  // Below $60
  return publicPrice;
}

import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decoded = await adminAuth.verifyIdToken(idToken);

    const uid = decoded.uid;
// Prevent duplicate pending orders
const existingOrder = await adminDb
  .collection("orders")
  .where("uid", "==", uid)
  .where("status", "==", "pending")
  .limit(1)
  .get();
    // 🔐 Fetch user tier
    const userSnap = await adminDb
      .collection("users")
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    const userData = userSnap.data();
    const tier: "public" | "vip" | "family" =
      userData?.tier || "public";

    // 🔎 Fetch Cart
    const cartRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("cart");

    const cartSnapshot = await cartRef.get();

    if (cartSnapshot.empty) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }
    
if (!existingOrder.empty) {
  return NextResponse.json(
    { error: "Pending order already exists." },
    { status: 400 }
  );
}
    let subtotal = 0;
    const items: {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  publicPrice: number;
  price: number;
  total: number;
}[] = [];

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();

      const { productId, sku, quantity } = cartData;

if (!productId || !sku || typeof quantity !== "number" || quantity <= 0) {
  return NextResponse.json(
    { error: "Invalid cart item." },
    { status: 400 }
  );
}
      // 🔐 Fetch authoritative product
      const productSnap = await adminDb
        .collection("products")
        .doc(productId)
        .get();

      if (!productSnap.exists) {
        return NextResponse.json(
          { error: "Product no longer exists." },
          { status: 400 }
        );
      }

      const product = productSnap.data() as any;

      const concentration = product?.concentrations?.find(
        (c: any) => c.sku === sku
      );

      if (!concentration) {
        return NextResponse.json(
          { error: "Invalid product SKU." },
          { status: 400 }
        );
      }

      const publicPrice = Number(
        concentration.prices?.public ?? 0
      );

      const stock = Number(concentration.stock ?? 0);

      if (publicPrice <= 0) {
        return NextResponse.json(
          { error: "Invalid pricing configuration." },
          { status: 400 }
        );
      }

      if (stock - quantity < 0) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (${sku}).` },
          { status: 400 }
        );
      }

      // 🔐 Authoritative tier price calculation
      const price = calculateTierPrice(publicPrice, tier);

      const itemTotal = price * quantity;
      subtotal += itemTotal;

      items.push({
        productId,
        name: product.name,
        sku,
        quantity,
        publicPrice,
        price, // final charged price
        total: itemTotal,
      });
    }

    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    // 🔢 Generate Short Order Number
    const now = new Date();
    const shortYear = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const unique = Date.now().toString().slice(-4);
    const orderNumber = `${shortYear}${month}${day}${unique}`;

    const orderRef = await adminDb.collection("orders").add({
      uid,
      orderNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "pending",
      fulfillmentStatus: "pending",
      inventoryAdjusted: false,
      financials: {
        subtotal,
        tax,
        shipping,
        total,
      },
      items,
    });

    // 🧹 Clear Cart
    const batch = adminDb.batch();
    cartSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderNumber,
      total,
    });

  } catch (error) {
    console.error("Checkout error:", error);

return NextResponse.json(
  { error: error instanceof Error ? error.message : "Checkout failed." },
  { status: 500 }
);
  }
}