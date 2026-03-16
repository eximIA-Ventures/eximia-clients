"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FolderKanban, Sparkles, Clock, FolderOpen, Bell, Settings,
  FileSignature,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, FolderKanban, Sparkles, Clock, FolderOpen, Bell, Settings,
  FileSignature,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin" || href === "/portal") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 px-3 space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = ICON_MAP[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-lg px-3 h-10 text-[13px] font-medium transition-all duration-200 ${
              active
                ? "bg-accent/15 text-white font-medium ring-1 ring-accent/20"
                : "text-[#777] hover:bg-white/[0.06] hover:text-[#ccc]"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-accent" />
            )}
            {Icon && <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
