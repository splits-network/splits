"use client";

import CandidatesListClient from "./components/candidates-list-client";
import CandidateBrowseClient from "./components/browse/candidate-browse-client";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";

export default function CandidatesPage() {
    const { viewMode, setViewMode, isLoaded } =
        useViewMode("candidatesViewMode");

    // Prevent hydration mismatch by not rendering until loaded
    if (!isLoaded) {
        return (
            <>
                <PageTitle
                    title="Candidates"
                    subtitle="Manage your candidate pipeline"
                />
                <div className="space-y-6">
                    <div className="flex justify-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageTitle
                title="Candidates"
                subtitle={
                    viewMode === "browse"
                        ? "Browse candidate marketplace"
                        : "Manage your candidate pipeline"
                }
            >
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </PageTitle>
            <div className="space-y-6">
                {viewMode === "browse" ? (
                    <CandidateBrowseClient />
                ) : (
                    <CandidatesListClient view={viewMode} />
                )}
            </div>
        </>
    );
}
