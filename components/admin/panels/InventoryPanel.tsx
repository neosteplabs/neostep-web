"use client";

import ProductCard from "@/components/admin/ProductCard";

export default function InventoryPanel({
products,
sortedProducts,
activeView,
inventoryTitles,
currentCategoryCount,
setShowAddModal,
sortMode,
setSortMode,
toggleVisibility,
archiveProduct
}: any){

return (

<div className="max-w-6xl mx-auto">

<div className="flex justify-between items-center mb-8">

<h1 className="text-xl font-semibold text-white">
{inventoryTitles[activeView] || "Product Inventory"} ({currentCategoryCount})
</h1>

<div className="flex gap-4">

<button
onClick={()=>setShowAddModal(true)}
className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
>
+ Add Product
</button>

<select
value={sortMode}
onChange={(e)=>setSortMode(e.target.value)}
className="bg-white border border-slate-300 rounded-md px-3 py-1 text-sm"
>

<option value="alpha">Alphabetical (A–Z)</option>
<option value="display">Display Order</option>

</select>

</div>

</div>


<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

{sortedProducts
.filter((product:any)=>{

const cat = (product.category || "").toLowerCase();

if (activeView === "inventory_weightloss") return cat.includes("weight");
if (activeView === "inventory_recovery") return cat.includes("recovery");
if (activeView === "inventory_nootropic") return cat.includes("nootropic");
if (activeView === "inventory_growth") return cat.includes("growth");
if (activeView === "inventory_research") return cat.includes("research");
if (activeView === "inventory_tanning") return cat.includes("tanning");

return true;

})
.map((product:any)=>(
<ProductCard
key={product.id}
product={product}
onToggleVisibility={toggleVisibility}
onArchive={archiveProduct}
/>
))}

</div>

</div>

);
}