type StatusBadgeProps = {
  status: string;
  type: "shipment" | "tracking";
};

const shipmentStatusClasses: Record<string, string> = {
  Created: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Transit": "bg-blue-50 text-blue-700 ring-blue-200",
  "At China Airport": "bg-violet-50 text-violet-700 ring-violet-200",
  Dispatched: "bg-orange-50 text-orange-700 ring-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const trackingStatusClasses: Record<string, string> = {
  Received: "bg-slate-100 text-slate-700 ring-slate-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  Shipped: "bg-orange-50 text-orange-700 ring-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const classes =
    type === "shipment"
      ? shipmentStatusClasses[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      : trackingStatusClasses[status] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {status}
    </span>
  );
}
