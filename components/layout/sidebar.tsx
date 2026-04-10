"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Package, PlusSquare, User2, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  userName: string;
  userRole: string;
  canCreateShipment: boolean;
  canManageUsers: boolean;
  logoutAction: () => void | Promise<void>;
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
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
  mobileNavOpen,
  onCloseMobileNav,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/shipments", label: "Shipments", icon: Package },
    ...(canCreateShipment ? [{ href: "/shipments/create", label: "Create Shipment", icon: PlusSquare }] : []),
    ...(canManageUsers ? [{ href: "/users", label: "Users", icon: Users }] : []),
  ];

  function isItemActive(href: string) {
    return pathname === href || (href !== "/dashboard" && href !== "/shipments/create" && pathname.startsWith(href));
  }

  const navContent = (
    <>
      <div className="border-b border-[var(--border)] px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          {!collapsed ? (
            <div className="transition-opacity duration-200">
              <p className="text-lg font-semibold text-[var(--text)]">ShipTrack</p>
              <p className="app-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">Operations</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5">
        {navItems.map((item) => {
          const isActive = isItemActive(item.href);
          const isPrimary = item.href === "/shipments/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobileNav}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(59,110,246,0.09)] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(59,110,246,0.16)]"
                  : isPrimary
                    ? "bg-[rgba(59,110,246,0.07)] text-[var(--text)] hover:bg-[rgba(59,110,246,0.12)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-[var(--text)]"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
              {!collapsed && (item.href === "/shipments/create" || item.href === "/users") ? (
                <span className="ml-auto app-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-soft)]">
                  {item.href === "/users" ? "admin" : "quick"}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[var(--bg-3)] px-3 py-3">
          <div className="rounded-full bg-[var(--bg-2)] p-2 text-[var(--text)] ring-1 ring-[var(--border)]">
            <User2 className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text)]">{userName}</p>
              <p className="text-xs text-[var(--text-muted)]">{userRole}</p>
            </div>
          ) : null}
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className={`w-full justify-start shadow-none ${collapsed ? "px-0" : ""}`}
            icon={<LogOut className="h-4 w-4 shrink-0" />}
            title={collapsed ? "Logout" : undefined}
            ariaLabel="Logout"
          >
            {!collapsed ? "Logout" : ""}
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`${collapsed ? "w-[88px]" : "w-[280px]"} sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[rgba(255,255,255,0.9)] backdrop-blur-xl transition-[width] duration-200 ease-linear lg:flex`}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-2)] shadow-none"
            icon={collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          >
            <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </Button>
        </div>
        {navContent}
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.18)] backdrop-blur-sm lg:hidden" onClick={onCloseMobileNav}>
          <aside
            className="app-surface scrollbar-thin absolute inset-y-0 left-0 w-[86%] max-w-[320px] overflow-y-auto rounded-r-[28px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
              <p className="text-xl font-semibold text-[var(--text)]">ShipTrack</p>
              <button
                type="button"
                onClick={onCloseMobileNav}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] text-[var(--text)]"
                aria-label="Close navigation"
                title="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex min-h-[calc(100vh-72px)] flex-col">{navContent}</div>
          </aside>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[rgba(255,255,255,0.96)] px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${
                  isActive ? "bg-[rgba(59,110,246,0.08)] text-[var(--accent)]" : "text-[var(--text-soft)]"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-[var(--accent)]" : ""}`} />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
