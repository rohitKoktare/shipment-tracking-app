import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportShipmentsButton } from "@/components/shipments/export-shipments-button";
import { ShipmentTable } from "@/components/shipments/shipment-table";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Shipments</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all your shipments from one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportShipmentsButton shipments={shipments ?? []} />
          {currentUser.role === "admin" ? (
            <Link href="/shipments/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Create Shipment
            </Link>
          ) : null}
        </div>
      </div>

      <form method="GET" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
              Search shipments
            </label>
            <input
              id="search"
              name="search"
              defaultValue={search}
              placeholder="Search by shipment name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Filter by status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status || "All"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-slate-500"
            >
              {shipmentStatuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from" className="mb-1 block text-sm font-medium text-slate-700">
              From date
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={from}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-sm font-medium text-slate-700">
              To date
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={to}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
          <Link
            href="/shipments"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </Link>
        </div>
      </form>

      <ShipmentTable
        shipments={shipments ?? []}
        emptyState={
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">No shipments found</h2>
            <p className="mt-2 text-sm text-slate-600">
              {search || (status && status !== "All") || from || to
                ? "Try adjusting your search or filters."
                : "Create your first shipment to start tracking activity."}
            </p>
            {currentUser.role === "admin" ? (
              <Link
                href="/shipments/create"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Create your first shipment
              </Link>
            ) : null}
          </div>
        }
      />
    </section>
  );
}
