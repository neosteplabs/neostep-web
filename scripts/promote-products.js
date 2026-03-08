const admin = require("firebase-admin");

// Load service account from environment variable path
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function promote() {
  console.log("Promoting products_new → products...");

  const snapshot = await db.collection("products_new").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`Copying ${doc.id}`);
    await db.collection("products").doc(doc.id).set(data);
  }

  console.log("Promotion complete.");
  process.exit();
}

promote().catch((err) => {
  console.error(err);
  process.exit(1);
});