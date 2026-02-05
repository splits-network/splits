"use client";

import RolesList from "./components/roles-list";
import BrowseRolesClient from "./components/browse/browse-roles-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";

export default function RolesPage() {
    const { viewMode, setViewMode, isLoaded } = useViewMode("rolesViewMode");

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
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
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
