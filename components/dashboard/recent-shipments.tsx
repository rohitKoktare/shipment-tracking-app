import { ShipmentTable } from "@/components/shipments/shipment-table";
import type { Database } from "@/types/database.types";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type RecentShipmentsProps = {
  shipments: ShipmentRow[];
};

export function RecentShipments({ shipments }: RecentShipmentsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent Shipments</h2>
        <p className="mt-1 text-sm text-slate-600">Most recently created shipments in your organization.</p>
      </div>
      <ShipmentTable
        shipments={shipments}
        showAction={false}
        emptyState={
          <div className="rounded-2xl bg-white p-8 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            No recent shipments to display yet.
          </div>
        }
      />
    </div>
  );
}
