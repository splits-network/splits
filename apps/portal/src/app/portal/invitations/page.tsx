"use client";

import InvitationsPageClient from "./components/invitations-client";
import { BrowseInvitationsClient } from "./components/browse/browse-invitations-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";

export default function InvitationsPage() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "invitationsViewMode",
    );

    // Prevent hydration mismatch by not rendering until loaded
    if (!isLoaded) {
        return (
            <>
                <PageTitle
                    title="Invitations"
                    subtitle="Track and manage your candidate invitations"
                />
                <div className="space-y-6">
                    <div className="flex justify-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </>
        );
    }

    const getSubtitle = () => {
        switch (viewMode) {
            case "grid":
                return "Track and manage your candidate invitations";
            case "table":
                return "Track and manage your candidate invitations";
            case "browse":
                return "Browse and manage candidate invitations";
            default:
                return "Track and manage your candidate invitations";
        }
    };

    return (
        <>
            <PageTitle title="Invitations" subtitle={getSubtitle()}>
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </PageTitle>

            {viewMode === "browse" ? (
                <BrowseInvitationsClient />
            ) : (
                <InvitationsPageClient view={viewMode} />
            )}
        </>
    );
}
