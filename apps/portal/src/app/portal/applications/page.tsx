"use client";

import ApplicationsList from "./components/applications-list";
import BrowseApplicationsClient from "./components/browse/browse-applications-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";

export default function ApplicationsPage() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "applicationsViewMode",
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
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
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
