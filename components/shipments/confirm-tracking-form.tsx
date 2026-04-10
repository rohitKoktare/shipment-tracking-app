import { CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/ui/loading-button";

type ConfirmTrackingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  shipmentId: string;
  trackingItemId: string;
  isConfirmed: boolean;
};

export function ConfirmTrackingForm({
  action,
  shipmentId,
  trackingItemId,
  isConfirmed,
}: ConfirmTrackingFormProps) {
  if (isConfirmed) {
    return <Badge tone="success">Confirmed</Badge>;
  }

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="shipment_id" value={shipmentId} />
      <input type="hidden" name="tracking_item_id" value={trackingItemId} />
      <Badge tone="warning">Pending</Badge>
      <LoadingButton
        variant="secondary"
        size="sm"
        loadingText="Confirming..."
        icon={<CheckCheck className="h-4 w-4" />}
        className="justify-start"
      >
        Confirm Received
      </LoadingButton>
    </form>
  );
}
