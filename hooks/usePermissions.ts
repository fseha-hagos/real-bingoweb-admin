"use client";

import { useMemo } from "react";
import { useSessionContext } from "@/contexts/SessionContext";
import { ROLES, hasPermission, Permission, Role } from "@/lib/rbac";

export function usePermissions() {
    const { user, isLoading } = useSessionContext();

    const role = useMemo(() => {
        if (!user) return ROLES.USER;
        return (user.role as Role) || ROLES.USER;
    }, [user]);

    const can = (permission: Permission) => {
        return hasPermission(role, permission);
    };

    return {
        role,
        can,
        isLoading,
        user
    };
}
