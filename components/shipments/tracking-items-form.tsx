"use client";

type TrackingItemValue = {
  tracking_id: string;
  product_name: string;
  courier: string;
  weight: string;
  cost: string;
};

type TrackingItemsFormProps = {
  items: TrackingItemValue[];
  setItems: React.Dispatch<React.SetStateAction<TrackingItemValue[]>>;
};

export function TrackingItemsForm({ items, setItems }: TrackingItemsFormProps) {
  function updateItem(index: number, field: keyof TrackingItemValue, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((current) => [...current, { tracking_id: "", product_name: "", courier: "", weight: "", cost: "" }]);
  }

  function removeItem(index: number) {
    setItems((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Tracking Items</h2>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Add Row
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tracking ID</label>
            <input
              name="tracking_id"
              value={item.tracking_id}
              onChange={(event) => updateItem(index, "tracking_id", event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Product Name</label>
            <input
              name="product_name"
              value={item.product_name}
              onChange={(event) => updateItem(index, "product_name", event.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Courier</label>
            <input
              name="courier"
              value={item.courier}
              onChange={(event) => updateItem(index, "courier", event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Weight</label>
            <input
              name="weight"
              type="number"
              step="0.01"
              min="0"
              value={item.weight}
              onChange={(event) => updateItem(index, "weight", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cost</label>
            <div className="flex gap-2">
              <input
                name="cost"
                type="number"
                step="0.01"
                min="0"
                value={item.cost}
                onChange={(event) => updateItem(index, "cost", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
