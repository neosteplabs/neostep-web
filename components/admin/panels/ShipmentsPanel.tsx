"use client";

export default function ShipmentsPanel({
  shipments,
  products,
  shipmentSearch,
  setShipmentSearch,
  expandedShipments,
  setExpandedShipments,
  receiveShipment,
  deleteShipment,
  setShowCreateShipment,
  receiveShipmentId,
  setReceiveShipmentId,
  receiveDate,
  setReceiveDate,
  incomingExpanded,
  setIncomingExpanded
}: any) {

return (

<div className="max-w-6xl mx-auto">

<div className="flex justify-between items-center mb-6">
<h1 className="text-xl font-semibold text-white">
Supplier Shipments
</h1>

<button
onClick={() => setShowCreateShipment(true)}
className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
>
+ Create Shipment
</button>
</div>


<div className="mb-6">
<input
value={shipmentSearch}
onChange={(e)=>setShipmentSearch(e.target.value)}
placeholder="Search supplier, company, or tracking..."
className="w-full md:w-[420px] border border-slate-300 rounded px-3 py-2 text-sm"
/>
</div>

{/* Incoming Inventory Forecast */}

<div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">

<div
onClick={()=>setIncomingExpanded(!incomingExpanded)}
className="flex items-center gap-2 text-sm font-semibold mb-4 cursor-pointer select-none hover:text-blue-600"
>

<span className="text-slate-400">
{incomingExpanded ? "▼" : "▶"}
</span>

Incoming Inventory

</div>


{incomingExpanded && (

<>
{Object.entries(

shipments
.filter((s:any)=>s.status !== "received")
.flatMap((s:any)=>s.items || [])
.reduce((acc:any,item:any)=>{

const product = products.find((p:any)=>p.id === item.productId)

if(!product) return acc

const concentration =
product.concentrations?.find((c:any)=>c.sku === item.sku)

const productName = product.name
const label = concentration?.label || ""

if(!acc[productName]){
acc[productName] = {}
}

if(!acc[productName][label]){
acc[productName][label] = {
boxes:0,
vials:0,
currentStock:
product.concentrations
?.find((c:any)=>c.sku === item.sku)?.stock || 0
}
}

acc[productName][label].boxes += item.boxes || 0
acc[productName][label].vials +=
(item.boxes || 0) * (item.vialsPerBox || 0)

return acc

},{})
)

.sort(([a],[b]) => a.localeCompare(b))

.map(([productName,concentrations]:any)=>(

<div key={productName} className="mb-4">

<div className="font-semibold text-slate-800 mb-1">
{productName}
</div>

{Object.entries(concentrations)
.sort(([a],[b])=>a.localeCompare(b))
.map(([label,data]:any)=>{

const current = data.currentStock
const incoming = data.vials
const future = current + incoming

return (

<div
key={label}
className={`grid grid-cols-[1fr_1fr_1fr_1fr] py-1 text-sm pl-4 ${
future < 20 ? "bg-red-50" : ""
}`}
>

<div className="text-slate-600">
{label}
</div>

<div className={`${
current < 20 ? "text-red-600 font-semibold" : "text-slate-500"
}`}>
Current: {current}
</div>

<div className="text-blue-600">
Incoming: {incoming}
</div>

<div className="font-semibold">
Future: {future}
</div>

</div>

)

})}

</div>

))}
</>
)}

</div>

<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

<div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] px-6 py-3 text-xs uppercase text-slate-400 border-b">
<div>Supplier</div>
<div>Company</div>
<div>Ordered</div>
<div>Items</div>
<div>Status</div>
</div>


{shipments
.filter((shipment:any)=>{

console.log("Shipments:", shipments);

const search = shipmentSearch.toLowerCase();

return (
shipment.supplierName?.toLowerCase().includes(search) ||
shipment.supplierCompany?.toLowerCase().includes(search) ||
shipment.trackingNumber?.toLowerCase().includes(search)
);

})
.map((shipment:any)=>(

<div key={shipment.id}>

<div
onClick={()=>setExpandedShipments((prev:any)=>
prev.includes(shipment.id)
? prev.filter((x:any)=>x!==shipment.id)
: [...prev, shipment.id]
)}
className="grid grid-cols-[24px_2fr_2fr_2fr_1fr_1fr] items-center px-6 py-4 border-b text-sm cursor-pointer hover:bg-slate-50"
>

<div className="text-slate-400 text-sm transition-transform duration-200">
{expandedShipments.includes(shipment.id) ? "▼" : "▶"}
</div>

<div className="font-medium">
{shipment.supplierName}
</div>

<div>
{shipment.supplierCompany || "—"}
</div>

<div>
{shipment.orderDate?.toDate
? shipment.orderDate.toDate().toLocaleDateString()
: "—"}
</div>

<div className="text-xs">

<div>
{shipment.items?.reduce((sum:any,i:any)=>sum+(i.boxes||0),0)||0} boxes
</div>

<div className="text-slate-400">
{shipment.items?.reduce((sum:any,i:any)=>sum+((i.boxes||0)*(i.vialsPerBox||0)),0)||0} vials
</div>

</div>

<div
onClick={(e)=>e.stopPropagation()}
className="flex items-center gap-2"
>

{shipment.status !== "received" ? (

<button
onClick={()=>{
  setReceiveShipmentId(shipment.id)
  setReceiveDate(new Date().toISOString().slice(0,16))
}}
className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
>
Receive
</button>

) : (
<span className="text-slate-500">{shipment.status}</span>
)}

<button
onClick={()=>deleteShipment(shipment.id)}
className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
>
Delete
</button>

</div>

</div>

{expandedShipments.includes(shipment.id) && (

<div className="bg-slate-50 border-b px-6 py-4 text-sm">

{shipment.items?.map((item:any,index:number)=>(

<div
key={index}
className="grid grid-cols-[2fr_1fr_1fr] py-1 text-slate-700"
>

<div>
{item.productName} ({item.sku})
</div>

<div>
{item.boxes || 0} boxes
</div>

<div>
{(item.boxes || 0) * (item.vialsPerBox || 0)} vials
</div>

</div>

))}

</div>

)}

</div>

))}

</div>

{receiveShipmentId && (

<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">

<h2 className="text-lg font-semibold mb-4">
Confirm Shipment Received
</h2>

<label className="text-sm text-slate-600 block mb-1">
Received Date
</label>

<input
type="datetime-local"
value={receiveDate}
onChange={(e)=>setReceiveDate(e.target.value)}
className="w-full border rounded px-3 py-2 mb-4"
/>

<div className="flex justify-end gap-3">

<button
onClick={()=>setReceiveShipmentId(null)}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={()=>{
receiveShipment(receiveShipmentId, receiveDate)
setReceiveShipmentId(null)
}}
className="px-4 py-2 bg-green-600 text-white rounded"
>
Confirm Receive
</button>

</div>

</div>

</div>

)}

</div>

);
}