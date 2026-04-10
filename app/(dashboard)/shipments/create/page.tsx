import { redirect } from "next/navigation";
import { z } from "zod";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";

const shipmentSchema = z.object({
  name: z.string().trim().min(1, "Shipment name is required."),
  total_weight: z.string().optional(),
  total_cost: z.string().optional(),
});

const trackingItemSchema = z.object({
  tracking_id: z.string().trim().min(1, "Tracking ID is required."),
  product_name: z.string().trim().optional(),
  courier: z.string().trim().min(1, "Courier is required."),
  weight: z.string().optional(),
  cost: z.string().optional(),
});

function parseNumber(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractTrackingItems(formData: FormData) {
  const items = new Map<number, Record<string, string>>();

  for (const [key, rawValue] of formData.entries()) {
    if (typeof rawValue !== "string") {
      continue;
    }

    const match = key.match(/^tracking_items\[(\d+)\]\[(tracking_id|product_name|courier|weight|cost)\]$/);

    if (!match) {
      continue;
    }

    const index = Number(match[1]);
    const field = match[2];
    const current = items.get(index) ?? {};
    current[field] = rawValue;
    items.set(index, current);
  }

  return Array.from(items.values());
}

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) {
    return null;
  }

  return Array.isArray(error) ? error[0] : error;
}

export default async function CreateShipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/shipments");
  }

  const params = await searchParams;
  const error = getErrorMessage(params.error);

  async function createShipment(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    if (currentUser.role !== "admin") {
      redirect("/shipments");
    }

    const parsedShipment = shipmentSchema.safeParse({
      name: formData.get("name"),
      total_weight: formData.get("total_weight"),
      total_cost: formData.get("total_cost"),
    });

    if (!parsedShipment.success) {
      redirect(`/shipments/create?error=${encodeURIComponent(parsedShipment.error.issues[0]?.message ?? "Invalid shipment details.")}`);
    }

    const trackingItems = extractTrackingItems(formData);

    if (trackingItems.length === 0) {
      redirect("/shipments/create?error=Add at least one tracking item.");
    }

    const parsedTrackingItems = trackingItems.map((item) => trackingItemSchema.safeParse(item));
    const invalidTrackingItem = parsedTrackingItems.find((result) => !result.success);

    if (invalidTrackingItem && !invalidTrackingItem.success) {
      redirect(`/shipments/create?error=${encodeURIComponent(invalidTrackingItem.error.issues[0]?.message ?? "Invalid tracking item.")}`);
    }

    const serviceRoleClient = createServiceRoleClient();
    const { data: shipment, error: shipmentError } = await serviceRoleClient
      .from("shipments")
      .insert({
        name: parsedShipment.data.name,
        total_weight: parseNumber(parsedShipment.data.total_weight),
        total_cost: parseNumber(parsedShipment.data.total_cost),
        status: "Created",
        organization_id: currentUser.organization_id,
        created_by: currentUser.id,
      })
      .select("id")
      .single();

    if (shipmentError || !shipment) {
      redirect(
        `/shipments/create?error=${encodeURIComponent(
          getFriendlySupabaseErrorMessage(shipmentError?.message ?? "Unable to create shipment."),
        )}`,
      );
    }

    const trackingRows = parsedTrackingItems.map((result) => {
      const item = result.success ? result.data : null;

      return {
        shipment_id: shipment.id,
        organization_id: currentUser.organization_id,
        tracking_id: item?.tracking_id ?? "",
        product_name: item?.product_name || null,
        courier: item?.courier ?? "",
        weight: parseNumber(item?.weight),
        cost: parseNumber(item?.cost),
        status: "Received",
        is_confirmed_by_agent: false,
      };
    });

    const { error: trackingItemsError } = await serviceRoleClient.from("tracking_items").insert(trackingRows);

    if (trackingItemsError) {
      await serviceRoleClient.from("shipments").delete().eq("id", shipment.id).eq("organization_id", currentUser.organization_id);
      redirect(`/shipments/create?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(trackingItemsError.message))}`);
    }

    redirect(`/shipments/${shipment.id}`);
  }

  return <ShipmentForm action={createShipment} error={error} />;
}
