import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentShipments } from "@/components/dashboard/recent-shipments";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";

const shipmentStatuses = ["Created", "In Transit", "At China Airport", "Dispatched", "Delivered"] as const;

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const serviceRoleClient = createServiceRoleClient();
  const organizationId = currentUser.organization_id;

  const [
    totalShipmentsResult,
    activeShipmentsResult,
    deliveredShipmentsResult,
    totalTrackingItemsResult,
    shipmentSummaryResult,
    recentShipmentsResult,
  ] = await Promise.all([
    serviceRoleClient.from("shipments").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    serviceRoleClient
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .neq("status", "Delivered"),
    serviceRoleClient
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "Delivered"),
    serviceRoleClient.from("tracking_items").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    serviceRoleClient
      .from("shipments")
      .select("status,total_weight,total_cost")
      .eq("organization_id", organizationId),
    serviceRoleClient
      .from("shipments")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const queryErrors = [
    totalShipmentsResult.error,
    activeShipmentsResult.error,
    deliveredShipmentsResult.error,
    totalTrackingItemsResult.error,
    shipmentSummaryResult.error,
    recentShipmentsResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    throw new Error(getFriendlySupabaseErrorMessage(queryErrors[0]?.message ?? "Unable to load dashboard."));
  }

  const metrics = [
    { label: "Total Shipments", value: totalShipmentsResult.count ?? 0 },
    { label: "Active Shipments", value: activeShipmentsResult.count ?? 0 },
    { label: "Delivered Shipments", value: deliveredShipmentsResult.count ?? 0 },
    { label: "Total Tracking Items", value: totalTrackingItemsResult.count ?? 0 },
  ];

  const shipmentSummary = shipmentSummaryResult.data ?? [];
  const statusBreakdown = shipmentStatuses.map((status) => ({
    status,
    count: shipmentSummary.filter((shipment) => shipment.status === status).length,
  }));
  const totalWeight = shipmentSummary.reduce((sum, shipment) => sum + Number(shipment.total_weight ?? 0), 0);
  const totalCost = shipmentSummary.reduce((sum, shipment) => sum + Number(shipment.total_cost ?? 0), 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">See shipment activity and recent updates for your organization.</p>
        </div>
        <Link href="/shipments" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          View Shipments
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatsCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Status Breakdown</h2>
            <p className="mt-1 text-sm text-slate-600">Shipment counts grouped by their current status.</p>
          </div>
          <div className="space-y-3">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <StatusBadge status={item.status} type="shipment" />
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatsCard label="Total Weight" value={totalWeight.toFixed(2)} helperText="Combined shipment weight" />
          <StatsCard label="Total Cost" value={totalCost.toFixed(2)} helperText="Combined shipment cost" />
        </div>
      </div>

      <div>
        <div>
          <RecentShipments shipments={recentShipmentsResult.data ?? []} />
        </div>
      </div>
    </section>
  );
}
