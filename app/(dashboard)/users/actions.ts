"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";

const USER_ROLES = ["admin", "agent"] as const;

function isUserRole(role: string): role is (typeof USER_ROLES)[number] {
  return USER_ROLES.includes(role as (typeof USER_ROLES)[number]);
}

async function requireAdminUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  return currentUser;
}

export async function inviteUser(formData: FormData) {
  const currentUser = await requireAdminUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");

  if (!name || !email || !isUserRole(role)) {
    redirect("/users?error=Enter a valid name, email, and role.");
  }

  const serviceRoleClient = createServiceRoleClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: existingOrgUser } = await serviceRoleClient
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingOrgUser) {
    if (existingOrgUser.organization_id !== currentUser.organization_id) {
      redirect("/users?error=This user already belongs to another organization.");
    }

    const { error: updateExistingError } = await serviceRoleClient
      .from("users")
      .update({ name, role })
      .eq("id", existingOrgUser.id)
      .eq("organization_id", currentUser.organization_id);

    if (updateExistingError) {
      redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(updateExistingError.message))}`);
    }

    revalidatePath("/users");
    redirect("/users?success=User already existed in this organization, so their details were updated.");
  }

  const { data, error: authError } = await serviceRoleClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/accept-invite`,
    data: {
      name,
      role,
      organization_id: currentUser.organization_id,
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes("user already registered")) {
      const { data: listedUsers, error: listUsersError } = await serviceRoleClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listUsersError) {
        redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(listUsersError.message))}`);
      }

      const authUser = listedUsers.users.find((user) => user.email?.toLowerCase() === email);

      if (!authUser) {
        redirect("/users?error=This auth user already exists, but could not be linked automatically.");
      }

      const { error: insertExistingAuthUserError } = await serviceRoleClient.from("users").insert({
        id: authUser.id,
        name,
        email,
        role,
        organization_id: currentUser.organization_id,
      });

      if (insertExistingAuthUserError) {
        redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(insertExistingAuthUserError.message))}`);
      }

      revalidatePath("/users");
      redirect("/users?success=Existing auth user linked to this organization.");
    }

    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(authError.message))}`);
  }

  const authUser = data.user;

  if (!authUser) {
    redirect("/users?error=Unable to create invited auth user.");
  }

  const { error: insertError } = await serviceRoleClient.from("users").insert({
    id: authUser.id,
    name,
    email,
    role,
    organization_id: currentUser.organization_id,
  });

  if (insertError) {
    await serviceRoleClient.auth.admin.deleteUser(authUser.id);
    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(insertError.message))}`);
  }

  revalidatePath("/users");
  redirect("/users?success=Invite sent successfully.");
}

export async function updateUserRole(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !isUserRole(role)) {
    redirect("/users?error=Invalid role update.");
  }

  const serviceRoleClient = createServiceRoleClient();
  const { error } = await serviceRoleClient
    .from("users")
    .update({ role })
    .eq("id", userId)
    .eq("organization_id", currentUser.organization_id);

  if (error) {
    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(error.message))}`);
  }

  revalidatePath("/users");
}

export async function deleteUser(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = String(formData.get("user_id") ?? "");

  if (!userId) {
    redirect("/users?error=Invalid user.");
  }

  if (userId === currentUser.id) {
    redirect("/users?error=You cannot delete your own account.");
  }

  const serviceRoleClient = createServiceRoleClient();
  const { data: userToDelete, error: lookupError } = await serviceRoleClient
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("organization_id", currentUser.organization_id)
    .maybeSingle();

  if (lookupError) {
    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(lookupError.message))}`);
  }

  if (!userToDelete) {
    redirect("/users?error=User not found.");
  }

  const { error: deleteUserRowError } = await serviceRoleClient
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("organization_id", currentUser.organization_id);

  if (deleteUserRowError) {
    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(deleteUserRowError.message))}`);
  }

  const { error: deleteAuthError } = await serviceRoleClient.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    redirect(`/users?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(deleteAuthError.message))}`);
  }

  revalidatePath("/users");
}
