import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req: Request) {

  const token = req.headers.get("authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const decoded = await getAuth().verifyIdToken(token);

  if (!decoded.admin) {
    return NextResponse.json({ error: "Not admin" }, { status: 403 });
  }

  const data = await req.json();

await adminDb.collection("supplierOrders").add({
  supplierName: data.supplierName,
  supplierCompany: data.supplierCompany,
  orderDate: new Date(data.orderDate),

  trackingNumber: data.trackingNumber || "",
  carrier: data.carrier || "",
  trackingUrl: data.trackingUrl || "",

  costs: data.costs || {},

  status: "ordered",

  createdAt: new Date(),

  items: data.items || []
});

  return NextResponse.json({ success: true });
}