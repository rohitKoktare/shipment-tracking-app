import { PackagePlus, PackageSearch } from "lucide-react";
import { redirect } from "next/navigation";
import { ExportShipmentsButton } from "@/components/shipments/export-shipments-button";
import { ShipmentTable } from "@/components/shipments/shipment-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";

const shipmentStatuses = ["All", "Created", "In Transit", "At China Airport", "Dispatched", "Delivered"];

function getQueryValue(value: string | string[] | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const params = await searchParams;
  const search = getQueryValue(params.search).trim();
  const status = getQueryValue(params.status).trim();
  const from = getQueryValue(params.from).trim();
  const to = getQueryValue(params.to).trim();
  const serviceRoleClient = createServiceRoleClient();
  let query = serviceRoleClient
    .from("shipments")
    .select("*")
    .eq("organization_id", currentUser.organization_id)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (status && status !== "All") {
    query = query.eq("status", status);
  }

  if (from) {
    query = query.gte("created_at", `${from}T00:00:00`);
  }

  if (to) {
    query = query.lte("created_at", `${to}T23:59:59`);
  }

  const { data: shipments, error } = await query;

  if (error) {
    throw new Error(getFriendlySupabaseErrorMessage(error.message));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="app-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">Shipment Control</p>
          <h1 className="app-title text-4xl text-[var(--text)]">Track Every Shipment</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Review shipment flow, filter by status or date, and jump into operational details without leaving this workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportShipmentsButton shipments={shipments ?? []} />
          {currentUser.role === "admin" ? (
            <Button href="/shipments/create" icon={<PackagePlus className="h-4 w-4" />}>
              Create Shipment
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="app-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">Filter Console</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">Search and narrow shipment activity</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {shipmentStatuses.map((option) => (
              <span
                key={option}
                className={`rounded-full border px-3 py-1 text-xs ${
                  (status || "All") === option
                    ? "border-[rgba(79,124,255,0.2)] bg-[rgba(79,124,255,0.12)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-soft)]"
                }`}
              >
                {option}
              </span>
            ))}
          </div>
        </div>
        <form method="GET">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Input
              id="search"
              label="Search shipments"
              name="search"
              defaultValue={search}
              placeholder="Search by shipment name"
            />
          </div>
          <div>
            <Select
              id="status"
              label="Filter by status"
              name="status"
              defaultValue={status || "All"}
            >
              {shipmentStatuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              id="from"
              label="From date"
              name="from"
              type="date"
              defaultValue={from}
            />
          </div>
          <div>
            <Input
              id="to"
              label="To date"
              name="to"
              type="date"
              defaultValue={to}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit">
            Apply Filters
          </Button>
          <Button href="/shipments" variant="secondary">
            Clear Filters
          </Button>
        </div>
        </form>
      </Card>

      <ShipmentTable
        shipments={shipments ?? []}
        emptyState={
          <Card className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-4)] text-[var(--text-soft)]">
              <PackageSearch className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--text)]">No shipments found</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {search || (status && status !== "All") || from || to
                ? "Try adjusting your search or filters."
                : "Create your first shipment to start tracking activity."}
            </p>
            {currentUser.role === "admin" ? (
              <div className="mt-5">
              <Button href="/shipments/create" icon={<PackagePlus className="h-4 w-4" />}>
                Create your first shipment
              </Button>
              </div>
            ) : null}
          </Card>
        }
      />
    </section>
  );
}
