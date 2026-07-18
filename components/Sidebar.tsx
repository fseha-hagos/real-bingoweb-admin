"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Settings,
  CreditCard,
  BarChart3,
  Wallet,
  Trophy,
  Megaphone,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Games",
    href: "/games",
    icon: Gamepad2,
  },
  {
    title: "Deposit/Withdraw",
    href: "/deposit-requests",
    icon: Wallet,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: History,
  },
  {
    title: "Tournaments",
    href: "/tournaments",
    icon: Trophy,
  },
  {
    title: "Bingo Cards",
    href: "/bingo-cards",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
];

import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/rbac";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { can, isLoading } = usePermissions();

  if (isLoading) return <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 hidden md:block" />;

  const filteredMenuItems = menuItems.filter(item => {
    switch (item.title) {
      case "Users":
        return can(PERMISSIONS.VIEW_USERS);
      case "Settings":
        return can(PERMISSIONS.MANAGE_SETTINGS);
      case "Games":
        return can(PERMISSIONS.VIEW_GAMES);
      case "Deposit/Withdraw":
        return can(PERMISSIONS.VIEW_TRANSACTIONS) || can(PERMISSIONS.APPROVE_DEPOSITS);
      case "Transactions":
        return can(PERMISSIONS.VIEW_TRANSACTIONS);
      case "Announcements":
        return can(PERMISSIONS.SEND_ANNOUNCEMENTS);
      case "Tournaments":
        return can(PERMISSIONS.VIEW_TOURNAMENTS);
      case "Bingo Cards":
        return can(PERMISSIONS.VIEW_GAMES);
      case "Analytics":
        return can(PERMISSIONS.VIEW_DASHBOARD);
      case "Dashboard":
        return can(PERMISSIONS.VIEW_DASHBOARD);
      default:
        return true;
    }
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-gray-900 text-white border-r border-gray-800 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Bingo Admin</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

