import { Eye, PackageSearch } from "lucide-react";
import { ShipmentCard } from "@/components/shipments/shipment-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/types/database.types";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type ShipmentTableProps = {
  shipments: ShipmentRow[];
  showAction?: boolean;
  emptyState?: React.ReactNode;
};

export function ShipmentTable({ shipments, showAction = true, emptyState }: ShipmentTableProps) {
  if (shipments.length === 0) {
    return (
      emptyState ?? (
        <Card className="p-10 text-center text-sm text-[var(--text-muted)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-3)] text-[var(--text-soft)]">
            <PackageSearch className="h-6 w-6" />
          </div>
          <p className="mt-4">No shipments yet. Create your first shipment to get started.</p>
        </Card>
      )
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {shipments.map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} showAction={showAction} />
        ))}
      </div>

      <Card className="hidden overflow-hidden md:block">
      <table className="min-w-full divide-y divide-[var(--border)] text-sm">
        <thead className="bg-[var(--bg-3)] text-left text-[var(--text-muted)]">
          <tr>
            <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Shipment Name</th>
            <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Status</th>
            <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Total Weight</th>
            <th className="px-5 py-4 app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Created Date</th>
            {showAction ? <th className="px-5 py-4 text-center app-mono text-[11px] font-medium uppercase tracking-[0.14em]">Action</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-2)] text-[var(--text-muted)]">
          {shipments.map((shipment, index) => (
            <tr
              key={shipment.id}
              className={`${index % 2 === 0 ? "bg-[var(--bg-2)]" : "bg-[rgba(240,242,245,0.45)]"} transition-colors hover:bg-[rgba(59,110,246,0.04)]`}
            >
              <td className="px-5 py-4 font-medium text-[var(--text)]">{shipment.name}</td>
              <td className="px-5 py-4">
                <StatusBadge status={shipment.status} type="shipment" />
              </td>
              <td className="px-5 py-4">{shipment.total_weight ?? "-"}</td>
              <td className="px-5 py-4">{new Date(shipment.created_at).toLocaleDateString("en-IN")}</td>
              {showAction ? (
                <td className="px-5 py-4 text-center align-middle">
                  <Button
                    href={`/shipments/${shipment.id}`}
                    title="View Shipment"
                    ariaLabel="View Shipment"
                    variant="secondary"
                    size="icon"
                    className="mx-auto h-10 w-10 rounded-2xl"
                    icon={<Eye className="h-4 w-4" />}
                  >
                    <span className="sr-only">View Shipment</span>
                  </Button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      </Card>
    </>
  );
}
