const dotenv = require("dotenv");

const IMAGE_BASE = "/products";

dotenv.config({ path: ".env.local" });

console.log("Project:", process.env.FIREBASE_PROJECT_ID);

async function run() {
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = admin.firestore();

  const allowedCategories = [
    "Weight Loss & Metabolism",
    "Recovery & Performance",
    "Growth Hormone",
    "Nootropics",
    "Tanning",
    "Research Compounds"
  ];

  const usedSkus = new Set();

  function validateProduct(product) {

    // Category validation
    if (!allowedCategories.includes(product.category)) {
      throw new Error(`Invalid category for ${product.name}: ${product.category}`);
    }

    // SKU validation
    for (const c of product.concentrations) {

if (usedSkus.has(c.sku)) {
  throw new Error(`Duplicate SKU detected: ${c.sku}`);
}

      usedSkus.add(c.sku);

    }
  }

  const products = [

    // Weight Loss & Metabolism

    {
      id: "tirzepatide",
      name: "Tirzepatide",
      code: "NS-TZ",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "10mg", sku: "NS-TZ10" },
        { label: "20mg", sku: "NS-TZ20" },
        { label: "30mg", sku: "NS-TZ30" },
        { label: "40mg", sku: "NS-TZ40" },
        { label: "50mg", sku: "NS-TZ50" },
        { label: "60mg", sku: "NS-TZ60" }
      ]
    },

    {
      id: "retatrutide",
      name: "Retatrutide",
      code: "NS-RT",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "10mg", sku: "NS-RT10" },
        { label: "20mg", sku: "NS-RT20" },
        { label: "30mg", sku: "NS-RT30" },
        { label: "40mg", sku: "NS-RT40" },
        { label: "50mg", sku: "NS-RT50" },
        { label: "60mg", sku: "NS-RT60" }
      ]
    },

    {
      id: "semaglutide",
      name: "Semaglutide",
      code: "NS-SM",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "10mg", sku: "NS-SM10" },
        { label: "20mg", sku: "NS-SM20" },
        { label: "30mg", sku: "NS-SM30" }
      ]
    },

    {
      id: "cagrilintide",
      name: "Cagrilintide",
      code: "NS-CGL",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "5mg", sku: "NS-CGL5" },
        { label: "10mg", sku: "NS-CGL10" }
      ]
    },

    {
      id: "5-amino-1mq",
      name: "5-Amino-1MQ",
      code: "NS-AMQ",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "5mg", sku: "NS-AMQ5" },
        { label: "10mg", sku: "NS-AMQ10" },
        { label: "50mg", sku: "NS-AMQ50" }
      ]
    },

    {
      id: "mots-c",
      name: "MOTS-C",
      code: "NS-MOTS",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "10mg", sku: "NS-MOTS10" }
      ]
    },

    {
      id: "aod-9604",
      name: "AOD-9604",
      code: "NS-AOD",
      category: "Weight Loss & Metabolism",
      concentrations: [
        { label: "5mg", sku: "NS-AOD5" },
        { label: "10mg", sku: "NS-AOD10" }
      ]
    },

    // Recovery

    {
      id: "bpc-157",
      name: "BPC-157",
      code: "NS-BPC",
      category: "Recovery & Performance",
      concentrations: [
        { label: "10mg", sku: "NS-BPC10" }
      ]
    },

    {
      id: "tb-500",
      name: "TB-500",
      code: "NS-TB",
      category: "Recovery & Performance",
      concentrations: [
        { label: "10mg", sku: "NS-TB10" }
      ]
    },

    {
      id: "ghk-cu",
      name: "GHK-Cu",
      code: "NS-GHK",
      category: "Recovery & Performance",
      concentrations: [
        { label: "50mg", sku: "NS-GHK50" }
      ]
    },

    // Growth Hormone

    {
      id: "cjc-1295",
      name: "CJC-1295 w/o DAC",
      code: "NS-CJCwod",
      category: "Growth Hormone",
      concentrations: [
        { label: "5mg", sku: "NS-CJC5wod" },
        { label: "10mg", sku: "NS-CJC10wod" }
      ]
    },

    {
      id: "ipamorelin",
      name: "Ipamorelin",
      code: "NS-IPA",
      category: "Growth Hormone",
      concentrations: [
        { label: "5mg", sku: "NS-IPA5" },
        { label: "10mg", sku: "NS-IPA10" }
      ]
    },

    {
      id: "tesamorelin",
      name: "Tesamorelin",
      code: "NS-TESA",
      category: "Growth Hormone",
      concentrations: [
        { label: "10mg", sku: "NS-TESA10" }
      ]
    },

    // Nootropics

    {
      id: "selank",
      name: "Selank",
      code: "NS-SLK",
      category: "Nootropics",
      concentrations: [
        { label: "10mg", sku: "NS-SLK10" }
      ]
    },

    {
      id: "semax",
      name: "Semax",
      code: "NS-SMX",
      category: "Nootropics",
      concentrations: [
        { label: "10mg", sku: "NS-SMX10" }
      ]
    },

    {
      id: "dsip",
      name: "DSIP",
      code: "NS-DSIP",
      category: "Nootropics",
      concentrations: [
        { label: "5mg", sku: "NS-DSIP5" },
        { label: "10mg", sku: "NS-DSIP10" }
      ]
    },

    // Tanning

    {
      id: "melanotan-i",
      name: "Melanotan I",
      code: "NS-MT1",
      category: "Tanning",
      concentrations: [
        { label: "10mg", sku: "NS-MT1" }
      ]
    },

    {
      id: "melanotan-ii",
      name: "Melanotan II",
      code: "NS-MT2",
      category: "Tanning",
      concentrations: [
        { label: "10mg", sku: "NS-MT2" }
      ]
    },

    // Research

    {
      id: "kpv",
      name: "KPV",
      code: "NS-KPV",
      category: "Research Compounds",
      concentrations: [
        { label: "10mg", sku: "NS-KPV10" }
      ]
    },

    {
      id: "nad-plus",
      name: "NAD+",
      code: "NS-NAD",
      category: "Research Compounds",
      concentrations: [
        { label: "100mg", sku: "NS-NAD100" },
        { label: "250mg", sku: "NS-NAD250" },
        { label: "500mg", sku: "NS-NAD500" }
      ]
    }

  ];

  for (const product of products) {

    validateProduct(product);

    const ref = adminDb.collection("products").doc(product.id);
    const existing = await ref.get();

    const concentrations = product.concentrations.map(c => ({
  label: c.label,
  sku: c.sku,
  stock: 0,
  prices: {
    public: 0
  }
}));

const data = {
  name: product.name,
  code: product.code,
  category: product.category,

  images: {
    admin: `${IMAGE_BASE}/admin/${product.id}.png`,
    public: `${IMAGE_BASE}/catalog/${product.id}.png`,
  }
};

    if (!existing.exists) {

await ref.set({
  ...data,
  visible: false,
  displayOrder: 999,
  concentrations
});

      console.log(`Added ${product.name}`);

    } else {

      await ref.update({
  ...data,
  displayOrder: existing.data()?.displayOrder ?? 999,
  reorderLevel: existing.data()?.reorderLevel ?? 5
});

      console.log(`Updated ${product.name} images`);

    }

  }

  console.log("Seeding complete");

}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });