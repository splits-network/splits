"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStandardList, UseStandardListReturn } from "@/hooks/use-standard-list";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Job, UnifiedJobFilters } from "../types";

const STATS_VISIBLE_KEY = "rolesStatsVisible";

// Extended return type with role-specific data
interface RolesFilterContextValue extends UseStandardListReturn<Job, UnifiedJobFilters> {
    // User role info
    userRole: string | null;
    canManageRole: boolean;
    canCreateRole: boolean;
    showJobAssignmentFilter: boolean;
    profileLoading: boolean;
    // Stats visibility
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const RolesFilterContext = createContext<RolesFilterContextValue | null>(null);

interface RolesFilterProviderProps {
    children: ReactNode;
}

export function RolesFilterProvider({ children }: RolesFilterProviderProps) {
    const { getToken } = useAuth();
    const {
        profile,
        isAdmin,
        isRecruiter,
        isCompanyUser,
        isLoading: profileLoading,
    } = useUserProfile();

    // State for tracking if recruiter has manageable companies
    const [hasManageableCompanies, setHasManageableCompanies] = useState(false);

    // Stats visibility state with localStorage persistence
    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    // Load stats visibility preference from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STATS_VISIBLE_KEY);
            if (stored !== null) {
                setShowStatsState(stored === "true");
            }
            setStatsLoaded(true);
        }
    }, []);

    // Wrapper to persist stats visibility to localStorage
    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<UnifiedJobFilters>(
        () => ({
            status: undefined,
            job_owner_filter: "all",
        }),
        [],
    );

    // Use the standard list hook with server-side pagination/filtering
    const listState = useStandardList<Job, UnifiedJobFilters>({
        endpoint: "/jobs",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Derive user role from context
    const userRole = isAdmin
        ? "platform_admin"
        : profile?.roles?.includes("company_admin")
            ? "company_admin"
            : profile?.roles?.includes("hiring_manager")
                ? "hiring_manager"
                : isRecruiter
                    ? "recruiter"
                    : profile?.roles?.[0] || null;

    // Check if user can manage roles
    const canManageRole = isAdmin || profile?.roles?.includes("company_admin");

    // Check if job assignment filter should be shown
    const showJobAssignmentFilter =
        userRole === "recruiter" ||
        userRole === "company_admin" ||
        userRole === "hiring_manager";

    // Check if recruiter has manageable companies
    useEffect(() => {
        if (isRecruiter && !profileLoading) {
            async function checkManageableCompanies() {
                try {
                    const token = await getToken();
                    if (!token) return;
                    const client = createAuthenticatedClient(token);
                    const response = await client.get<{ data: { id: string; name: string }[] }>(
                        "/recruiter-companies/manageable-companies-with-details"
                    );
                    setHasManageableCompanies((response.data || []).length > 0);
                } catch (err) {
                    console.error("Failed to check manageable companies:", err);
                    setHasManageableCompanies(false);
                }
            }
            checkManageableCompanies();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecruiter, profileLoading]);

    // Permission check for creating roles
    const canCreateRole =
        isAdmin ||
        isCompanyUser ||
        (isRecruiter && hasManageableCompanies);

    const contextValue: RolesFilterContextValue = {
        ...listState,
        userRole,
        canManageRole: canManageRole || false,
        canCreateRole,
        showJobAssignmentFilter,
        profileLoading: profileLoading || !statsLoaded,
        showStats,
        setShowStats,
    };

    return (
        <RolesFilterContext.Provider value={contextValue}>
            {children}
        </RolesFilterContext.Provider>
    );
}

export function useRolesFilter() {
    const context = useContext(RolesFilterContext);
    if (!context) {
        throw new Error("useRolesFilter must be used within RolesFilterProvider");
    }
    return context;
}
