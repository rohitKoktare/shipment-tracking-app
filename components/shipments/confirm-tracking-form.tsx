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
    return (
      <span className="inline-flex cursor-not-allowed rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
        Confirmed
      </span>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="shipment_id" value={shipmentId} />
      <input type="hidden" name="tracking_item_id" value={trackingItemId} />
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
        Pending
      </span>
      <button
        type="submit"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Confirm Received
      </button>
    </form>
  );
}
