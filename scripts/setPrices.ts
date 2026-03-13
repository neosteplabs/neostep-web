import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config({ path: ".env.local" });

if (!admin.apps.length) {
admin.initializeApp({
credential: admin.credential.cert({
projectId: process.env.FIREBASE_PROJECT_ID!,
clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
}),
});
}

const db = admin.firestore();

const prices: Record<string, Record<string, number>> = {

tirzepatide: {
"NS-TZ10": 75,
"NS-TZ20": 120,
"NS-TZ30": 165
},

retatrutide: {
"NS-RT10": 80,
"NS-RT20": 125,
"NS-RT30": 175
},

semaglutide: {
"NS-SM10": 80
},

cagrilintide: {
"NS-CGL5": 95
},

"5-amino-1mq": {
"NS-AMQ10": 90
},

"mots-c": {
"NS-MOTS10": 95
},

"aod-9604": {
"NS-AOD5": 65
},

"bpc-157": {
"NS-BPC10": 45
},

"tb-500": {
"NS-TB10": 65
},

"ghk-cu": {
"NS-GHK50": 75
},

"cjc-1295": {
"NS-CJC5wod": 65
},

ipamorelin: {
"NS-IPA5": 55
},

tesamorelin: {
"NS-TESA10": 85
},

selank: {
"NS-SLK10": 45
},

semax: {
"NS-SMX10": 45
},

dsip: {
"NS-DSIP5": 40
},

"melanotan-i": {
"NS-MT1": 70
},

"melanotan-ii": {
"NS-MT2": 60
},

kpv: {
"NS-KPV10": 65
},

"nad-plus": {
"NS-NAD1000": 160
}

};

async function run() {

console.log("Starting price update...");

for (const productId of Object.keys(prices)) {

const ref = db.collection("products").doc(productId);
const snap = await ref.get();

if (!snap.exists) {
  console.warn("Product not found:", productId);
  continue;
}

const product = snap.data();

if (!product?.concentrations) {
  console.warn("No concentrations found for:", productId);
  continue;
}

const updated = product.concentrations.map((c: any) => {

  const newPrice = prices[productId][c.sku];

  if (newPrice !== undefined) {

    if (!c.prices) {
      c.prices = {};
    }

    c.prices.public = newPrice;

  }

  return c;

});

await ref.update({
  concentrations: updated
});

console.log("Updated prices for", productId);

}

console.log("Pricing update complete");

}

run()
.then(() => process.exit(0))
.catch((err) => {
console.error("Price update failed:", err);
process.exit(1);
});