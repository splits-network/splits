"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { RecruiterCompanyPermissions } from "@/app/portal/invitation/shared/types";

export interface CompanyPermissionEntry {
    company_id: string;
    company_name: string;
    permissions: RecruiterCompanyPermissions;
}

export interface RecruiterPermissionsState {
    permissions: CompanyPermissionEntry[];
    isLoading: boolean;
    hasPermission: (
        companyId: string,
        permission: keyof RecruiterCompanyPermissions,
    ) => boolean;
    getCompanyIdsWithPermission: (
        permission: keyof RecruiterCompanyPermissions,
    ) => string[];
    refresh: () => Promise<void>;
}

export function useRecruiterPermissions(
    recruiterId: string | null,
): RecruiterPermissionsState {
    const { getToken } = useAuth();
    const [permissions, setPermissions] = useState<CompanyPermissionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPermissions = useCallback(async () => {
        if (!recruiterId) {
            setPermissions([]);
            return;
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{
                data: CompanyPermissionEntry[];
            }>("/recruiter-companies/my-permissions");
            setPermissions(response.data || []);
        } catch (err) {
            console.error("Failed to fetch recruiter permissions:", err);
            setPermissions([]);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recruiterId]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const hasPermission = useCallback(
        (
            companyId: string,
            permission: keyof RecruiterCompanyPermissions,
        ): boolean => {
            const entry = permissions.find((p) => p.company_id === companyId);
            return entry?.permissions?.[permission] === true;
        },
        [permissions],
    );

    const getCompanyIdsWithPermission = useCallback(
        (permission: keyof RecruiterCompanyPermissions): string[] => {
            return permissions
                .filter((p) => p.permissions?.[permission] === true)
                .map((p) => p.company_id);
        },
        [permissions],
    );

    return {
        permissions,
        isLoading,
        hasPermission,
        getCompanyIdsWithPermission,
        refresh: fetchPermissions,
    };
}
