import Link from "next/link";
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
        <div className="rounded-2xl bg-white p-8 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          No shipments yet. Create your first shipment to get started.
        </div>
      )
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100/80 text-left text-slate-600">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Shipment Name</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            <th className="px-5 py-3.5 font-semibold">Total Weight</th>
            <th className="px-5 py-3.5 font-semibold">Created Date</th>
            {showAction ? <th className="px-5 py-3.5 font-semibold">Action</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {shipments.map((shipment, index) => (
            <tr
              key={shipment.id}
              className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} transition-colors hover:bg-slate-100/70`}
            >
              <td className="px-5 py-4">{shipment.name}</td>
              <td className="px-5 py-4">
                <StatusBadge status={shipment.status} type="shipment" />
              </td>
              <td className="px-5 py-4">{shipment.total_weight ?? "-"}</td>
              <td className="px-5 py-4">{new Date(shipment.created_at).toLocaleDateString("en-IN")}</td>
              {showAction ? (
                <td className="px-5 py-4">
                  <Link
                    href={`/shipments/${shipment.id}`}
                    className="font-medium text-slate-900 underline-offset-4 transition hover:underline"
                  >
                    View
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
