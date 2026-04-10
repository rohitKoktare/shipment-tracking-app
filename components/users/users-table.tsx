import { Trash2, Users } from "lucide-react";
import { StatusSelectForm } from "@/components/shipments/status-select-form";
import { LoadingButton } from "@/components/ui/loading-button";
import type { Database } from "@/types/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

type UsersTableProps = {
  users: UserRow[];
  currentUserId: string;
  updateRoleAction: (formData: FormData) => void | Promise<void>;
  deleteUserAction: (formData: FormData) => void | Promise<void>;
};

function RoleBadge({ role }: { role: UserRow["role"] }) {
  const styles =
    role === "admin"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}>
      {role === "admin" ? "Admin" : "Agent"}
    </span>
  );
}

export function UsersTable({
  users,
  currentUserId,
  updateRoleAction,
  deleteUserAction,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">No users yet</h2>
        <p className="mt-2 text-sm text-slate-600">Invite your first agent or admin to this organization.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Created Date</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {users.map((user, index) => (
            <tr
              key={user.id}
              className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"} transition-colors hover:bg-slate-50`}
            >
              <td className="px-4 py-3 align-top">{user.name ?? "-"}</td>
              <td className="px-4 py-3 align-top">{user.email}</td>
              <td className="px-4 py-3">
                <div className="mb-2">
                  <RoleBadge role={user.role} />
                </div>
                <StatusSelectForm
                  action={updateRoleAction}
                  hiddenFields={{ user_id: user.id }}
                  name="role"
                  value={user.role}
                  options={["admin", "agent"]}
                />
              </td>
              <td className="px-4 py-3 align-top">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
              <td className="px-4 py-3 text-right align-top">
                {user.id === currentUserId ? (
                  <span className="text-xs text-slate-500">Current User</span>
                ) : (
                  <form action={deleteUserAction} className="inline-flex">
                    <input type="hidden" name="user_id" value={user.id} />
                    <LoadingButton
                      variant="destructive"
                      size="sm"
                      loadingText="Deleting..."
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </LoadingButton>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
