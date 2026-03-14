"use client";

type OrderStatus = "pending" | "completed" | "cancelled";

export default function OrdersPanel({
  orders,
  orderFilter,
  setOrderFilter,
  setSelectedOrder,
  updateOrderStatus
}: any) {

const filteredOrders =
orderFilter === "all"
? orders
: orders.filter((o:any)=>o.status === orderFilter);

return (

<div className="max-w-6xl mx-auto">

<div className="flex justify-between items-center mb-8">

<h1 className="text-xl font-semibold text-white">
Orders
</h1>

<select
value={orderFilter}
onChange={(e)=>setOrderFilter(e.target.value)}
className="bg-white border border-slate-300 rounded-md px-3 py-1 text-sm"
>

<option value="all">All</option>
<option value="pending">Pending</option>
<option value="completed">Completed</option>
<option value="cancelled">Cancelled</option>

</select>

</div>


<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

<div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs uppercase text-slate-400 border-b">
<div>Order</div>
<div>Date</div>
<div>Total</div>
<div>Status</div>
<div>Inventory</div>
</div>


{filteredOrders.map((order:any)=>(

<div
key={order.id}
onClick={()=>setSelectedOrder(order)}
className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 border-b text-sm hover:bg-slate-50 cursor-pointer"
>

<div className="truncate font-medium">
{order.orderNumber || order.id}
</div>

<div>
{order.createdAt?.toDate
? order.createdAt.toDate().toLocaleDateString()
: "—"}
</div>

<div>
${order.financials?.total || 0}
</div>

<div
onClick={(e)=>e.stopPropagation()}
className="flex items-center gap-2"
>

<select
value={order.status || "pending"}
onChange={(e)=>
updateOrderStatus(order.id, e.target.value as OrderStatus)
}
className="h-9 px-4 rounded-lg border border-slate-200 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
>

<option value="pending">Pending</option>
<option value="completed">Completed</option>
<option value="cancelled">Cancelled</option>

</select>

</div>

<div>
{order.inventoryAdjusted ? "Adjusted" : "Pending"}
</div>

</div>

))}

</div>

</div>

);
}