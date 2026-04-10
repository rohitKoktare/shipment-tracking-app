import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
  type: "shipment" | "tracking";
};

const shipmentStatusTones: Record<string, "neutral" | "info" | "warning" | "success" | "accent"> = {
  Created: "neutral",
  "In Transit": "info",
  "At China Airport": "warning",
  Dispatched: "accent",
  Delivered: "success",
};

const trackingStatusTones: Record<string, "neutral" | "info" | "warning" | "success" | "danger" | "accent"> = {
  Received: "neutral",
  Processing: "info",
  Shipped: "accent",
  Delivered: "success",
  "Not Delivered": "danger",
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const tone =
    type === "shipment"
      ? shipmentStatusTones[status] ?? "neutral"
      : trackingStatusTones[status] ?? "neutral";

  return <Badge tone={tone}>{status}</Badge>;
}
