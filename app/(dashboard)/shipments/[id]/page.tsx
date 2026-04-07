import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmTrackingForm } from "@/components/shipments/confirm-tracking-form";
import { ExportShipmentButtons } from "@/components/shipments/export-shipment-buttons";
import { StatusSelectForm } from "@/components/shipments/status-select-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";
import { confirmTrackingItem, updateShipmentStatus, updateTrackingStatus } from "./actions";

const shipmentStatuses = ["Created", "In Transit", "At China Airport", "Dispatched", "Delivered"];
const trackingStatuses = ["Received", "Processing", "Shipped", "Delivered"];

function getQueryValue(value: string | string[] | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function ShipmentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; tracking_search?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const query = await searchParams;
  const error = getQueryValue(query.error);
  const trackingSearch = getQueryValue(query.tracking_search)?.trim() ?? "";
  const serviceRoleClient = createServiceRoleClient();

  const { data: shipment, error: shipmentError } = await serviceRoleClient
    .from("shipments")
    .select("*")
    .eq("id", id)
    .eq("organization_id", currentUser.organization_id)
    .maybeSingle();

  if (shipmentError) {
    throw new Error(getFriendlySupabaseErrorMessage(shipmentError.message));
  }

  if (!shipment) {
    notFound();
  }

  let trackingQuery = serviceRoleClient
    .from("tracking_items")
    .select("*")
    .eq("shipment_id", shipment.id)
    .eq("organization_id", currentUser.organization_id)
    .order("created_at", { ascending: true });

  if (trackingSearch) {
    trackingQuery = trackingQuery.or(`tracking_id.ilike.%${trackingSearch}%,courier.ilike.%${trackingSearch}%`);
  }

  const { data: trackingItems, error: trackingItemsError } = await trackingQuery;

  if (trackingItemsError) {
    throw new Error(getFriendlySupabaseErrorMessage(trackingItemsError.message));
  }

  return (
    <section className="space-y-6">
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{shipment.name}</h1>
            <p className="mt-2 text-sm text-slate-600">View shipment details, status, and tracking progress.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <ExportShipmentButtons shipment={shipment} trackingItems={trackingItems ?? []} />
            {currentUser.role === "admin" ? (
              <div className="min-w-56">
                <p className="mb-1 text-sm font-medium text-slate-700">Shipment Status</p>
                <StatusSelectForm
                  action={updateShipmentStatus}
                  hiddenFields={{ shipment_id: shipment.id }}
                  name="status"
                  value={shipment.status}
                  options={shipmentStatuses}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-medium text-slate-900">Status:</span>{" "}
            <StatusBadge status={shipment.status} type="shipment" />
          </p>
          <p><span className="font-medium text-slate-900">Total Weight:</span> {shipment.total_weight ?? "-"}</p>
          <p><span className="font-medium text-slate-900">Total Cost:</span> {shipment.total_cost ?? "-"}</p>
          <p><span className="font-medium text-slate-900">Created:</span> {new Date(shipment.created_at).toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Tracking Items</h2>
          <p className="mt-1 text-sm text-slate-600">Monitor item-level status and confirmation progress.</p>
        </div>
        <form method="GET" className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label htmlFor="tracking_search" className="mb-1 block text-sm font-medium text-slate-700">
                Search tracking items
              </label>
              <input
                id="tracking_search"
                name="tracking_search"
                defaultValue={trackingSearch}
                placeholder="Search by tracking ID or courier"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Search
              </button>
              <Link
                href={`/shipments/${shipment.id}`}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </Link>
            </div>
          </div>
        </form>
        {trackingItems && trackingItems.length > 0 ? (
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100/80 text-left text-slate-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Tracking ID</th>
              <th className="px-5 py-3.5 font-semibold">Courier</th>
              <th className="px-5 py-3.5 font-semibold">Weight</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Confirmed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            {(trackingItems ?? []).map((item, index) => (
              <tr
                key={item.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} transition-colors hover:bg-slate-100/70`}
              >
                <td className="px-5 py-4">{item.tracking_id}</td>
                <td className="px-5 py-4">{item.courier}</td>
                <td className="px-5 py-4">{item.weight ?? "-"}</td>
                <td className="px-5 py-4">
                  <div className="mb-2">
                    <StatusBadge status={item.status} type="tracking" />
                  </div>
                  <StatusSelectForm
                    action={updateTrackingStatus}
                    hiddenFields={{ shipment_id: shipment.id, tracking_item_id: item.id }}
                    name="status"
                    value={item.status}
                    options={trackingStatuses}
                  />
                </td>
                <td className="px-5 py-4">
                  <ConfirmTrackingForm
                    action={confirmTrackingItem}
                    shipmentId={shipment.id}
                    trackingItemId={item.id}
                    isConfirmed={item.is_confirmed_by_agent}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-slate-600">
            {trackingSearch ? "No tracking items matched your search." : "No tracking items added."}
          </div>
        )}
      </div>
    </section>
  );
}
