"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";

const SHIPMENT_STATUSES = ["Created", "In Transit", "At China Airport", "Dispatched", "Delivered"] as const;
const TRACKING_STATUSES = ["Received", "Processing", "Shipped", "Delivered"] as const;

function isShipmentStatus(status: string): status is (typeof SHIPMENT_STATUSES)[number] {
  return SHIPMENT_STATUSES.includes(status as (typeof SHIPMENT_STATUSES)[number]);
}

function isTrackingStatus(status: string): status is (typeof TRACKING_STATUSES)[number] {
  return TRACKING_STATUSES.includes(status as (typeof TRACKING_STATUSES)[number]);
}

export async function updateShipmentStatus(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/shipments");
  }

  const shipmentId = String(formData.get("shipment_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!shipmentId || !isShipmentStatus(status)) {
    redirect(`/shipments/${shipmentId || ""}?error=Invalid shipment status.`);
  }

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("shipments")
    .update({ status })
    .eq("id", shipmentId)
    .eq("organization_id", currentUser.organization_id);

  if (error) {
    redirect(`/shipments/${shipmentId}?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(error.message))}`);
  }

  revalidatePath("/shipments");
  revalidatePath("/dashboard");
  revalidatePath(`/shipments/${shipmentId}`);
}

export async function updateTrackingStatus(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const shipmentId = String(formData.get("shipment_id") ?? "");
  const trackingItemId = String(formData.get("tracking_item_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!shipmentId || !trackingItemId || !isTrackingStatus(status)) {
    redirect(`/shipments/${shipmentId || ""}?error=Invalid tracking item status.`);
  }

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("tracking_items")
    .update({ status })
    .eq("id", trackingItemId)
    .eq("shipment_id", shipmentId)
    .eq("organization_id", currentUser.organization_id);

  if (error) {
    redirect(`/shipments/${shipmentId}?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(error.message))}`);
  }

  revalidatePath("/shipments");
  revalidatePath("/dashboard");
  revalidatePath(`/shipments/${shipmentId}`);
}

export async function confirmTrackingItem(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const shipmentId = String(formData.get("shipment_id") ?? "");
  const trackingItemId = String(formData.get("tracking_item_id") ?? "");

  if (!shipmentId || !trackingItemId) {
    redirect(`/shipments/${shipmentId || ""}?error=Invalid tracking item.`);
  }

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("tracking_items")
    .update({
      is_confirmed_by_agent: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", trackingItemId)
    .eq("shipment_id", shipmentId)
    .eq("organization_id", currentUser.organization_id);

  if (error) {
    redirect(`/shipments/${shipmentId}?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(error.message))}`);
  }

  revalidatePath(`/shipments/${shipmentId}`);
}
