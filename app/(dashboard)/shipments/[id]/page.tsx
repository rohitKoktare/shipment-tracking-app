import { ArrowLeft, PackageSearch, Search, TrendingUp } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { ConfirmTrackingForm } from "@/components/shipments/confirm-tracking-form";
import { EditTrackingItemForm } from "@/components/shipments/edit-tracking-item-form";
import { ExportShipmentButtons } from "@/components/shipments/export-shipment-buttons";
import { StatusSelectForm } from "@/components/shipments/status-select-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";
import { confirmTrackingItem, updateShipmentStatus, updateTrackingItem, updateTrackingStatus } from "./actions";

const shipmentStatuses = ["Created", "In Transit", "At China Airport", "Dispatched", "Delivered"];
const trackingStatuses = ["Received", "Processing", "Shipped", "Delivered", "Not Delivered"];

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
    trackingQuery = trackingQuery.or(
      `tracking_id.ilike.%${trackingSearch}%,product_name.ilike.%${trackingSearch}%,courier.ilike.%${trackingSearch}%,comment.ilike.%${trackingSearch}%`,
    );
  }

  const { data: trackingItems, error: trackingItemsError } = await trackingQuery;

  if (trackingItemsError) {
    throw new Error(getFriendlySupabaseErrorMessage(trackingItemsError.message));
  }

  return (
    <section className="space-y-6">
      {error ? <p className="rounded-2xl border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button href="/shipments" variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Shipments
        </Button>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="app-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">Shipment Detail</p>
            <h1 className="app-title mt-2 text-4xl text-[var(--text)]">{shipment.name}</h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
              View shipment details, status, and tracking progress in a cleaner operational layout.
            </p>
          </div>
          <div className="flex flex-col gap-3 xl:items-end">
            <ExportShipmentButtons shipment={shipment} trackingItems={trackingItems ?? []} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-[var(--bg-3)] p-4">
              <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">Current Status</p>
              <div className="mt-3">
                <StatusBadge status={shipment.status} type="shipment" />
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--bg-3)] p-4">
              <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">Total Weight</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{shipment.total_weight ?? "-"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-3)] p-4">
              <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">Total Cost</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{shipment.total_cost ?? "-"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-3)] p-4">
              <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">Created</p>
              <p className="mt-3 text-sm font-medium text-[var(--text)]">{new Date(shipment.created_at).toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          {currentUser.role === "admin" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(79,124,255,0.12)] text-[var(--accent)]">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">Change Shipment Status</p>
                  <p className="text-sm text-[var(--text-muted)]">Current status remains visible separately above.</p>
                </div>
              </div>
              <div className="mt-4">
                <StatusSelectForm
                  action={updateShipmentStatus}
                  hiddenFields={{ shipment_id: shipment.id }}
                  name="status"
                  value={shipment.status}
                  options={shipmentStatuses}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-xl font-semibold text-[var(--text)]">Tracking Items</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Monitor item-level status and confirmation progress.</p>
        </div>
        <form method="GET" className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                id="tracking_search"
                name="tracking_search"
                label="Search tracking items"
                defaultValue={trackingSearch}
                placeholder="Search by tracking ID, product, courier, or comment"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" icon={<Search className="h-4 w-4" />}>
                Search
              </Button>
              <Button href={`/shipments/${shipment.id}`} variant="secondary">
                Clear Filters
              </Button>
            </div>
          </div>
        </form>
        {trackingItems && trackingItems.length > 0 ? (
        <>
        <div className="grid gap-4 p-4 lg:hidden">
          {(trackingItems ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[var(--text)] break-all">{item.tracking_id}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{item.product_name || "No product name"}</p>
                </div>
                <EditTrackingItemForm
                  action={updateTrackingItem}
                  shipmentId={shipment.id}
                  item={item}
                  statusOptions={trackingStatuses}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Courier</p>
                  <p className="mt-1 text-[var(--text)]">{item.courier}</p>
                </div>
                <div>
                  <p className="app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Weight / Cost</p>
                  <p className="mt-1 text-[var(--text)]">{item.weight ?? "-"}</p>
                  <p className="text-xs text-[var(--text-muted)]">Cost: {item.cost ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Current Status</p>
                  <StatusBadge status={item.status} type="tracking" />
                </div>
                <div>
                  <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Change Status</p>
                  <StatusSelectForm
                    action={updateTrackingStatus}
                    hiddenFields={{ shipment_id: shipment.id, tracking_item_id: item.id }}
                    name="status"
                    value={item.status}
                    options={trackingStatuses}
                  />
                </div>
                <div>
                  <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Confirmation</p>
                  <ConfirmTrackingForm
                    action={confirmTrackingItem}
                    shipmentId={shipment.id}
                    trackingItemId={item.id}
                    isConfirmed={item.is_confirmed_by_agent}
                  />
                </div>
                {item.comment ? (
                  <div>
                    <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Comment</p>
                    <p className="text-sm text-[var(--text-muted)]">{item.comment}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--bg-3)] text-left text-[var(--text-muted)]">
            <tr>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Tracking ID</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Product</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Courier</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Weight / Cost</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Status</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Comment</th>
              <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Confirmed</th>
              <th className="px-5 py-4 text-right app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-transparent text-[var(--text-muted)]">
            {(trackingItems ?? []).map((item, index) => (
              <tr
                key={item.id}
                className={`${index % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.015)]"} align-top transition-colors hover:bg-[rgba(255,255,255,0.03)]`}
              >
                <td className="px-5 py-5 font-medium text-[var(--text)]">{item.tracking_id}</td>
                <td className="px-5 py-5">{item.product_name || "-"}</td>
                <td className="px-5 py-5 text-[var(--text)]">{item.courier}</td>
                <td className="px-5 py-5">
                  <div className="text-[var(--text)]">{item.weight ?? "-"}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">Cost: {item.cost ?? "-"}</div>
                </td>
                <td className="px-5 py-5">
                  <div>
                    <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Current</p>
                    <StatusBadge status={item.status} type="tracking" />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Change</p>
                    <StatusSelectForm
                      action={updateTrackingStatus}
                      hiddenFields={{ shipment_id: shipment.id, tracking_item_id: item.id }}
                      name="status"
                      value={item.status}
                      options={trackingStatuses}
                    />
                  </div>
                </td>
                <td className="px-5 py-5">
                  {item.comment ? <p className="max-w-xs whitespace-pre-wrap text-sm text-[var(--text-muted)]">{item.comment}</p> : "-"}
                </td>
                <td className="px-5 py-5">
                  <ConfirmTrackingForm
                    action={confirmTrackingItem}
                    shipmentId={shipment.id}
                    trackingItemId={item.id}
                    isConfirmed={item.is_confirmed_by_agent}
                  />
                </td>
                <td className="px-5 py-5 text-right">
                  <EditTrackingItemForm
                    action={updateTrackingItem}
                    shipmentId={shipment.id}
                    item={item}
                    statusOptions={trackingStatuses}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-4)] text-[var(--text-soft)]">
              <PackageSearch className="h-6 w-6" />
            </div>
            <p className="mt-4">
            {trackingSearch ? "No tracking items matched your search." : "No tracking items added."}
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
