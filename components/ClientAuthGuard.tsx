"use client";

import AuthGuard from "./AuthGuard";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/rbac";

interface ClientAuthGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export default function ClientAuthGuard({
  children,
  permission,
  fallback,
}: ClientAuthGuardProps) {
  const { can, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !can(permission) && !fallback) {
      router.push("/");
    }
  }, [isLoading, can, permission, fallback, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading permissions...</div>;
  }

  if (!can(permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <AuthGuard>{children}</AuthGuard>;
}

