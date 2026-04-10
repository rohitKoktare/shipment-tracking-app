"use client";

import { useState } from "react";
import { Pencil, Save } from "lucide-react";
import type { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

type TrackingItemRow = Database["public"]["Tables"]["tracking_items"]["Row"];

type EditTrackingItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  shipmentId: string;
  item: TrackingItemRow;
  statusOptions: string[];
};

export function EditTrackingItemForm({
  action,
  shipmentId,
  item,
  statusOptions,
}: EditTrackingItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setIsOpen((current) => !current)}
        title={isOpen ? "Cancel editing" : "Edit tracking item"}
        aria-label={isOpen ? "Cancel editing" : "Edit tracking item"}
        variant="secondary"
        size="icon"
        className="mx-auto h-10 w-10 rounded-2xl"
        icon={<Pencil className="h-4 w-4" />}
      >
        <span className="sr-only">{isOpen ? "Cancel editing" : "Edit tracking item"}</span>
      </Button>

      {isOpen ? (
        <form action={action} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] p-4 shadow-sm">
          <input type="hidden" name="shipment_id" value={shipmentId} />
          <input type="hidden" name="tracking_item_id" value={item.id} />

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              id={`tracking_id-${item.id}`}
              name="tracking_id"
              label="Tracking ID"
              defaultValue={item.tracking_id}
              required
            />
            <Input
              id={`product_name-${item.id}`}
              name="product_name"
              label="Product Name"
              defaultValue={item.product_name ?? ""}
            />
            <Input
              id={`courier-${item.id}`}
              name="courier"
              label="Courier"
              defaultValue={item.courier}
              required
            />
            <Select
              id={`status-${item.id}`}
              name="status"
              label="Status"
              defaultValue={item.status}
            >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </Select>
            <Input
              id={`weight-${item.id}`}
              name="weight"
              type="number"
              step="0.01"
              min="0"
              label="Weight"
              defaultValue={item.weight ?? ""}
            />
            <Input
              id={`cost-${item.id}`}
              name="cost"
              type="number"
              step="0.01"
              min="0"
              label="Cost"
              defaultValue={item.cost ?? ""}
            />
          </div>

          <Textarea
            id={`comment-${item.id}`}
            name="comment"
            label="Comment"
            defaultValue={item.comment ?? ""}
            rows={3}
            placeholder="Add delivery notes, address issues, or delay reasons"
          />

          <div className="flex justify-end">
            <LoadingButton loadingText="Saving..." icon={<Save className="h-4 w-4" />}>
              Save Changes
            </LoadingButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
