"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Package, PanelLeftClose, PanelLeftOpen, PlusSquare, User2, Users } from "lucide-react";
import { useState } from "react";

type SidebarProps = {
  userName: string;
  userRole: string;
  canCreateShipment: boolean;
  canManageUsers: boolean;
  logoutAction: () => void | Promise<void>;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function Sidebar({
  userName,
  userRole,
  canCreateShipment,
  canManageUsers,
  logoutAction,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/shipments", label: "Shipments", icon: Package },
    ...(canCreateShipment ? [{ href: "/shipments/create", label: "Create Shipment", icon: PlusSquare }] : []),
    ...(canManageUsers ? [{ href: "/users", label: "Users", icon: Users }] : []),
  ];

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-[240px]"} flex min-h-screen flex-col border-r border-slate-200 bg-white transition-all`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        {!collapsed ? <span className="text-sm font-semibold text-slate-900">Shipment Tracker</span> : null}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && item.href !== "/shipments/create" && pathname.startsWith(item.href));
          const isPrimary = item.href === "/shipments/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-l-4 border-slate-900 bg-slate-900 text-white"
                  : isPrimary
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
          <div className="rounded-full bg-slate-200 p-2 text-slate-700">
            <User2 className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-600">{userRole}</p>
            </div>
          ) : null}
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? "Logout" : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </form>
      </div>
    </aside>
  );
}
