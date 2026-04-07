import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/get-current-user";
import { logout } from "./actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userName={currentUser.name ?? currentUser.email}
        userRole={currentUser.role === "admin" ? "Admin" : "Agent"}
        canCreateShipment={currentUser.role === "admin"}
        canManageUsers={currentUser.role === "admin"}
        logoutAction={logout}
      />
      <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
