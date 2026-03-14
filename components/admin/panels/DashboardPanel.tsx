export default function DashboardPanel({ orders }: any) {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Orders" value={orders.length} />

        <StatCard
          label="Pending"
          value={orders.filter((o:any) => o.status === "pending").length}
        />

        <StatCard
          label="Completed"
          value={orders.filter((o:any) => o.status === "completed").length}
        />

        <StatCard
          label="Revenue"
          value={
            "$" +
            orders.reduce(
              (sum:any, o:any) => sum + (o.financials?.total || 0),
              0
            )
          }
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}