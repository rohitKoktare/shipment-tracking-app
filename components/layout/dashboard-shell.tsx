"use client";

import { useEffect, useState } from "react";
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
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("shiptrack-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("shiptrack-theme", theme);
  }, [theme]);

  function handleThemeChange(nextTheme: "dark" | "light") {
    setTheme(nextTheme);
  }

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
            theme={theme}
            onThemeChange={handleThemeChange}
          />
          <main className="app-grid min-h-[calc(100vh-96px)] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
