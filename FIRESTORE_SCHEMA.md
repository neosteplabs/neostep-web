# NeoStep Firestore Schema (AI Reference)

This document describes the Firestore database structure used by the NeoStep research compound system.

---

# users

Collection:

users/{uid}

Fields:

email: string
tier: public | vip | family
isAdmin: boolean
profileComplete: boolean

address1
address2
city
state
zip
phone

profileCompleteAt: timestamp

---

# user cart

Subcollection:

users/{uid}/cart/{itemId}

Fields:

productId: string
sku: string
quantity: number

Cart items are validated during checkout against live product data.

---

# products

Collection:

products/{productId}

Fields:

name: string
visible: boolean
archived: boolean
displayOrder: number

images:
public: string
admin: string

concentrations: array

Example concentration:

{
label: "10 mg",
sku: "NS-RT10",
stock: number,
prices: {
public: number
}
}

Stock is tracked per SKU inside concentrations.

---

# orders

Collection:

orders/{orderId}

Fields:

uid: string
orderNumber: string

createdAt: timestamp
updatedAt: timestamp

status: pending | completed | cancelled
fulfillmentStatus: pending | completed | cancelled

inventoryAdjusted: boolean

financials:

subtotal
tax
shipping
total

items: array

Example item:

{
productId: string
name: string
sku: string
quantity: number
publicPrice: number
price: number
total: number
}

Inventory changes happen when order status becomes "completed".

---

# supplierOrders (shipments)

Collection:

supplierOrders/{shipmentId}

Fields:

supplierName: string
supplierCompany: string

orderDate: timestamp
createdAt: timestamp

status: ordered | received
receivedAt: timestamp

items: array

Example item:

{
productId: string
sku: string
boxesOrdered: number
vialsPerBox: number
totalVials: number
}

Receiving a shipment increases product stock.

---

# inventoryLogs

Collection:

inventoryLogs/{logId}

Fields:

type: shipment | order

sku
productId

change: number

previousStock
newStock

referenceType: shipment | order
referenceId: string

createdAt: timestamp

This provides a full audit trail for inventory changes.

---

# Inventory Flow

Shipment received
→ stock increases

Order completed
→ stock decreases

Logs are written to inventoryLogs.

---

# Security Notes

Client applications never set:

price
stock

Server validates:

product existence
SKU validity
stock availability
tier pricing
