"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  canCreateShipment: boolean;
  canManageUsers: boolean;
  logoutAction: () => void | Promise<void>;
};

export function DashboardShell({
  children,
  userName,
  userRole,
  canCreateShipment,
  canManageUsers,
  logoutAction,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="flex min-h-screen">
        <Sidebar
          userName={userName}
          userRole={userRole}
          canCreateShipment={canCreateShipment}
          canManageUsers={canManageUsers}
          logoutAction={logoutAction}
          mobileNavOpen={mobileNavOpen}
          onCloseMobileNav={() => setMobileNavOpen(false)}
        />
        <div className="min-w-0 flex-1">
          <Header
            onOpenMenu={() => setMobileNavOpen(true)}
            canCreateShipment={canCreateShipment}
            userRole={userRole}
          />
          <main className="app-grid min-h-[calc(100vh-72px)] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
