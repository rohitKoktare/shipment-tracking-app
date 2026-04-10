import { ShipmentTable } from "@/components/shipments/shipment-table";
import { Card } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type RecentShipmentsProps = {
  shipments: ShipmentRow[];
};

export function RecentShipments({ shipments }: RecentShipmentsProps) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent Shipments</h2>
        <p className="mt-1 text-sm text-slate-600">Most recently created shipments in your organization.</p>
      </div>
      <ShipmentTable
        shipments={shipments}
        showAction={false}
        emptyState={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-8 text-sm text-slate-600">
            No recent shipments to display yet.
          </div>
        }
      />
    </Card>
  );
}
