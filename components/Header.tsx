"use client";

import { LogOut, Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSessionContext } from "@/contexts/SessionContext";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { clearSession, user } = useSessionContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-xs sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 mr-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name || "User"}</p>
              <p className="text-xs text-gray-500">{user.phoneNumber}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
              }`}>
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
