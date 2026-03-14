import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {

    // Extract auth token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Firebase token
    const decoded = await getAuth().verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Not admin" }, { status: 403 });
    }

    // Parse request body
    const { shipmentId, receivedAt } = await req.json();

    if (!shipmentId) {
      return NextResponse.json(
        { error: "shipmentId required" },
        { status: 400 }
      );
    }

    const shipmentRef = adminDb.collection("supplierOrders").doc(shipmentId);
    const shipmentSnap = await shipmentRef.get();

    if (!shipmentSnap.exists) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    const shipment = shipmentSnap.data();

    if (shipment?.status === "received") {
      return NextResponse.json({ message: "Already received" });
    }

    const items = shipment?.products || [];

    const batch = adminDb.batch();

    for (const item of items) {

      const productRef = adminDb.collection("products").doc(item.productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) continue;

      const product = productSnap.data();
      const concentrations = product?.concentrations || [];

      let previousStock = 0;
      let newStock = 0;

      const updatedConcentrations = concentrations.map((c: any) => {

        if (c.sku === item.sku) {

          previousStock = c.stock || 0;
          newStock = previousStock + item.totalVials;

          return {
            ...c,
            stock: newStock
          };
        }

        return c;
      });

      batch.update(productRef, {
        concentrations: updatedConcentrations
      });

      const logRef = adminDb.collection("inventoryLogs").doc();

      batch.set(logRef, {
        type: "shipment",
        sku: item.sku,
        productId: item.productId,
        change: item.totalVials,
        previousStock,
        newStock,
        referenceType: "shipment",
        referenceId: shipmentId,
        createdAt: FieldValue.serverTimestamp()
      });

    }

    batch.update(shipmentRef, {
      status: "received",
      receivedAt: receivedAt
        ? new Date(receivedAt)
        : FieldValue.serverTimestamp()
    });

    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error("Shipment processing error:", error);

    return NextResponse.json(
      { error: "Shipment processing failed" },
      { status: 500 }
    );

  }
}