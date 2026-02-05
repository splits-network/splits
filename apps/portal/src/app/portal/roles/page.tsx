"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import RolesList from "./components/roles-list";
import BrowseRolesClient from "./components/browse/browse-roles-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";

export default function RolesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { viewMode, setViewMode, isLoaded } = useViewMode("rolesViewMode");

    // Clear URL params when switching views to prevent stale selection state
    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            // Clear URL params (like jobId) when changing views
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    // Prevent hydration mismatch by not rendering until loaded
    if (!isLoaded) {
        return <LoadingState message="Loading roles..." />;
    }

    return (
        <>
            <PageTitle
                title="Roles"
                subtitle={
                    viewMode === "browse"
                        ? "Browse marketplace opportunities"
                        : "Browse and manage job opportunities"
                }
            >
                <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
            </PageTitle>
            <div className="space-y-6">
                {viewMode === "browse" ? (
                    <BrowseRolesClient />
                ) : (
                    <RolesList view={viewMode} />
                )}
            </div>
        </>
    );
}
