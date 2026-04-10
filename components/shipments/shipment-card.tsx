import { Eye, Package2 } from "lucide-react";
import type { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type ShipmentCardProps = {
  shipment: ShipmentRow;
  showAction?: boolean;
};

export function ShipmentCard({ shipment, showAction = true }: ShipmentCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(79,124,255,0.12)] text-[var(--accent)]">
            <Package2 className="h-4 w-4" />
          </div>
          <h3 className="truncate text-base font-semibold text-[var(--text)]">{shipment.name}</h3>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Created {new Date(shipment.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
        <StatusBadge status={shipment.status} type="shipment" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--bg-3)] p-3 text-sm">
        <div>
          <p className="app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Total Weight</p>
          <p className="mt-1 font-medium text-[var(--text)]">{shipment.total_weight ?? "-"}</p>
        </div>
        <div>
          <p className="app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">Total Cost</p>
          <p className="mt-1 font-medium text-[var(--text)]">{shipment.total_cost ?? "-"}</p>
        </div>
      </div>

      {showAction ? (
        <div className="mt-4">
          <Button
            href={`/shipments/${shipment.id}`}
            variant="secondary"
            className="w-full"
            icon={<Eye className="h-4 w-4" />}
          >
            View Shipment
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
