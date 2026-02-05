"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import ApplicationsList from "./components/applications-list";
import BrowseApplicationsClient from "./components/browse/browse-applications-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";

export default function ApplicationsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "applicationsViewMode",
    );

    // Clear URL params when switching views to prevent stale selection state
    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            // Clear URL params (like applicationId) when changing views
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    // Prevent hydration mismatch by not rendering until loaded
    if (!isLoaded) {
        return <LoadingState message="Loading applications..." />;
    }

    return (
        <>
            <PageTitle
                title="Applications"
                subtitle={
                    viewMode === "browse"
                        ? "Browse candidate applications"
                        : "Track candidate applications"
                }
            >
                <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
            </PageTitle>
            <div className="space-y-6">
                {viewMode === "browse" ? (
                    <BrowseApplicationsClient />
                ) : (
                    <ApplicationsList view={viewMode} />
                )}
            </div>
        </>
    );
}
