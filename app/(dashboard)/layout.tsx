import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
    <DashboardShell
      userName={currentUser.name ?? currentUser.email}
      userRole={currentUser.role === "admin" ? "Admin" : "Agent"}
      canCreateShipment={currentUser.role === "admin"}
      canManageUsers={currentUser.role === "admin"}
      logoutAction={logout}
    >
      {children}
    </DashboardShell>
  );
}
