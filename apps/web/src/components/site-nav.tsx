"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/for-individuals", label: "For Individuals" },
  { href: "/for-care-orgs", label: "For Care Orgs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Request Demo" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("site-nav-link", isActive && "site-nav-link--active")}
          >
            {item.label}
          </Link>
        );
      })}
      <Link href="/login" className="button-secondary ml-2 !min-h-[2.85rem] !px-4 !py-2.5">
        Admin Login
      </Link>
    </nav>
  );
}
