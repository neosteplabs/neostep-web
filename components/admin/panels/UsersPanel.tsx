"use client";

export default function UsersPanel({
  users,
  updateUserRole
}: any) {

return (

<div className="max-w-6xl mx-auto">

<h1 className="text-2xl font-semibold text-white mb-8">
User Management
</h1>

<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

<div className="grid grid-cols-3 px-6 py-3 text-xs uppercase text-slate-400 border-b">
<div>Email</div>
<div>Tier</div>
<div></div>
</div>

{users.map((user:any)=>(

<div
key={user.id}
className="grid grid-cols-3 items-center px-6 py-4 border-b text-sm"
>

<div className="truncate">
{user.email}
</div>

<select
value={user.tier || "public"}
onChange={(e)=>
updateUserRole(
user.id,
e.target.value as "public" | "vip" | "family"
)
}
className="h-9 px-4 rounded-lg border border-slate-200 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
>

<option value="public">Public</option>
<option value="vip">VIP</option>
<option value="family">Family</option>

</select>

<div className="text-xs text-slate-400">
UID: {user.id}
</div>

</div>

))}

</div>

</div>

);
}