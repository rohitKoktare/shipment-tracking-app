import { redirect } from "next/navigation";
import { AddUserForm } from "@/components/users/add-user-form";
import { UsersTable } from "@/components/users/users-table";
import { getCurrentUser } from "@/lib/get-current-user";
import { createServiceRoleClient, getFriendlySupabaseErrorMessage } from "@/lib/supabase/server";
import { deleteUser, inviteUser, updateUserRole } from "./actions";

function getMessage(value: string | string[] | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = getMessage(params.error);
  const success = getMessage(params.success);
  const serviceRoleClient = createServiceRoleClient();
  const { data: users, error: usersError } = await serviceRoleClient
    .from("users")
    .select("*")
    .eq("organization_id", currentUser.organization_id)
    .order("created_at", { ascending: false });

  if (usersError) {
    throw new Error(getFriendlySupabaseErrorMessage(usersError.message));
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-600">Invite users, assign roles, and manage access inside your organization.</p>
      </div>

      {success ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <AddUserForm action={inviteUser} />
      <UsersTable
        users={users ?? []}
        currentUserId={currentUser.id}
        updateRoleAction={updateUserRole}
        deleteUserAction={deleteUser}
      />
    </section>
  );
}
