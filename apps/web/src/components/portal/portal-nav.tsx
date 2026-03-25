"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/users", label: "Supported Users" },
  { href: "/portal/routines", label: "Routines" },
  { href: "/portal/assignments", label: "Assignments" },
  { href: "/portal/reports", label: "Reporting" },
  { href: "/portal/settings", label: "Settings" },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <div className="mt-3 space-y-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/portal"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("portal-nav-link", isActive && "portal-nav-link--active")}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
