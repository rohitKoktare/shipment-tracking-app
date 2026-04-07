"use client";

import { useState } from "react";
import { TrackingItemsForm } from "@/components/shipments/tracking-items-form";

type ShipmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string | null;
};

type TrackingItemValue = {
  tracking_id: string;
  courier: string;
  weight: string;
  cost: string;
};

export function ShipmentForm({ action, error }: ShipmentFormProps) {
  const [items, setItems] = useState<TrackingItemValue[]>([
    { tracking_id: "", courier: "", weight: "", cost: "" },
  ]);

  return (
    <form action={action} className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create Shipment</h1>
        <p className="mt-2 text-sm text-slate-600">Create a shipment and add its tracking items in one step.</p>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Shipment Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="total_weight" className="mb-1 block text-sm font-medium text-slate-700">
            Total Weight
          </label>
          <input
            id="total_weight"
            name="total_weight"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="total_cost" className="mb-1 block text-sm font-medium text-slate-700">
            Total Cost
          </label>
          <input
            id="total_cost"
            name="total_cost"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <TrackingItemsForm items={items} setItems={setItems} />

      {items.map((item, index) => (
        <div key={index} className="hidden">
          <input name={`tracking_items[${index}][tracking_id]`} value={item.tracking_id} readOnly />
          <input name={`tracking_items[${index}][courier]`} value={item.courier} readOnly />
          <input name={`tracking_items[${index}][weight]`} value={item.weight} readOnly />
          <input name={`tracking_items[${index}][cost]`} value={item.cost} readOnly />
        </div>
      ))}

      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Create Shipment
      </button>
    </form>
  );
}
