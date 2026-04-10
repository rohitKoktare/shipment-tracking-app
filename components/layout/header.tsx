"use client";

import { Menu, PlusSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  onOpenMenu: () => void;
  canCreateShipment: boolean;
  userRole: string;
};

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Operations Dashboard",
    subtitle: "Live visibility into shipment movement, item progress, and team activity.",
  },
  "/shipments": {
    title: "Shipments",
    subtitle: "Search, filter, and export organization shipments from one control surface.",
  },
  "/shipments/create": {
    title: "Create Shipment",
    subtitle: "Create a shipment and add tracking items in one streamlined workflow.",
  },
  "/users": {
    title: "Team Access",
    subtitle: "Invite teammates, assign roles, and manage organization access.",
  },
};

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/shipments/") && pathname !== "/shipments/create") {
    return {
      title: "Shipment Detail",
      subtitle: "Review shipment progress, update statuses, and manage tracking items in context.",
    };
  }

  return pageMeta[pathname] ?? pageMeta["/dashboard"];
}

export function Header({ onOpenMenu, canCreateShipment, userRole }: HeaderProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(245,246,248,0.94)] backdrop-blur-xl">
      <div className="flex min-h-14 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] text-[var(--text)] shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:hidden"
          aria-label="Open navigation"
          title="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="app-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
            {userRole} Workspace
          </p>
          <h1 className="app-title truncate text-2xl text-[var(--text)] sm:text-3xl">{meta.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">{meta.subtitle}</p>
        </div>
        {canCreateShipment ? (
          <div className="hidden md:block">
            <Button href="/shipments/create" icon={<PlusSquare className="h-4 w-4" />}>
              Create Shipment
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
