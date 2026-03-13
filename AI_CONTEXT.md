# NeoStep System Context (AI Reference)

This document explains the architecture and data flow for the NeoStep research compound storefront and admin system.

---

# Stack

Next.js (App Router)
Firebase Authentication
Firestore
Firebase Admin SDK
TailwindCSS

---

# User Roles

Users are stored in:

users/{uid}

Fields:

email
tier → public | vip | family
isAdmin → boolean

Tier controls pricing discounts.

Admin users can:

manage products
manage shipments
update order status
manage user tiers

Admin verification happens server-side.

---

# Product Structure

products/catalog/{productId}

name
visible
archived
displayOrder

concentrations[]

Each concentration contains:

sku
label
stock
prices.public

Stock is tracked per SKU.

---

# Cart System

Cart is stored per user:

users/{uid}/cart/{itemId}

Fields:

productId
sku
quantity

Cart items are validated during checkout.

---

# Checkout Flow

Endpoint:

POST /api/checkout

Process:

1 Fetch user tier
2 Fetch cart items
3 Validate product + SKU
4 Validate stock
5 Calculate tier pricing
6 Create order
7 Clear cart

Orders are created with:

status: pending
inventoryAdjusted: false

Inventory is NOT changed during checkout.

---

# Order Completion Logic

Admin dashboard changes order status.

Endpoint:

POST /api/admin/update-order-status

When status becomes "completed":

inventoryAdjusted === false

System will:

loop through order items
subtract quantity from product stock
update product concentrations
set inventoryAdjusted = true

This prevents double subtraction.

---

# Shipment System

Shipments are stored in:

supplierOrders/{shipmentId}

Each shipment contains items:

productId
sku
boxesOrdered
vialsPerBox
totalVials

Admin receives shipment via:

POST /api/admin/shipments/receive

Processing:

1 locate product
2 locate concentration by sku
3 add totalVials to stock
4 log inventory change
5 mark shipment received

---

# Inventory Logs

Collection:

inventoryLogs

Fields:

type → shipment | order
sku
productId
change
previousStock
newStock
referenceType
referenceId

Used for audit trail.

---

# Pricing Engine

Tier pricing is calculated server-side.

Function:

calculateTierPrice(publicPrice, tier)

Discount rules:

Public → no discount

VIP
$100+ → $20 off
$60–$99 → $10 off

Family
$100+ → $40 off
$60–$99 → $20 off

---

# Security Model

Client cannot set price.

Server verifies:

product
SKU
stock
tier
price

Checkout is server-authoritative.

---

# Admin Dashboard

Main views:

Dashboard
Inventory
Trash
Orders
Shipments
Users

Admin authentication verified via Firebase Admin SDK.

---

# Important Safety Mechanisms

inventoryAdjusted flag prevents double inventory subtraction.

Stock validation happens both:

checkout
order completion

Shipment receiving increases inventory.

---

# Primary Business Logic Locations

Checkout logic

app/api/checkout/route.ts

Inventory adjustment

app/api/admin/update-order-status/route.ts

Shipment receiving

app/api/admin/shipments/receive/route.ts
