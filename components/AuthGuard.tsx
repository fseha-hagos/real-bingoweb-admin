"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionContext } from "@/contexts/SessionContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useSessionContext();

  useEffect(() => {
    if (isLoading) return;

    console.log("AuthGuard - User:", user);
    console.log("AuthGuard - Role:", user?.role);

    if (pathname === "/login") {
      // If on login page and has session, redirect to dashboard
      if (user) {
        router.replace("/");
      }
    } else {
      // On other pages, check for administrative session
      const isAdminOrOperator = user?.role === "ADMIN" || user?.role === "OPERATOR";

      console.log("AuthGuard - isAdminOrOperator:", isAdminOrOperator);

      if (!user || !isAdminOrOperator) {
        console.log("AuthGuard - Redirecting to login");
        router.replace("/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Verifying session...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

