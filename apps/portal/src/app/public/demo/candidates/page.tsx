"use client";

import { useState, useEffect } from "react";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useDemoFeature } from "@/lib/demo/demo-context";
import { initializeDemoCandidates } from "@/lib/demo/candidates/mock-data";
import { GridView } from "./components/grid/grid-view";
import { TableView } from "./components/table/table-view";
import { BrowseView } from "./components/browse/browse-view";

export default function CandidatesTemplatePage() {
    const isDemoMode = useDemoFeature("candidates");
    const [viewMode, setViewMode] = useState<"browse" | "table" | "grid">(
        "browse",
    );

    // For demo template, we should always be in demo mode
    // Let's force it to true since we're in the /demo/candidates path
    const forceDemoMode = true;

    console.log("Demo mode from hook:", isDemoMode);
    console.log("Force demo mode:", forceDemoMode);

    // Initialize demo data once when page loads
    useEffect(() => {
        if (typeof window !== "undefined") {
            console.log("Current path:", window.location.pathname);
            console.log("Search params:", window.location.search);
        }

        if (forceDemoMode) {
            console.log("Initializing demo candidates...");
            initializeDemoCandidates();

            // Check if data was initialized
            const stored = localStorage.getItem("splits-demo-candidates");
            if (stored) {
                const data = JSON.parse(stored);
                console.log(
                    "Demo candidates initialized:",
                    data.length,
                    "candidates",
                );
            } else {
                console.warn(
                    "No demo candidates found in localStorage after initialization",
                );
            }
        } else {
            console.log("Demo mode is false, not initializing candidates");
        }
    }, [forceDemoMode]);

    if (!forceDemoMode && !isDemoMode) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-info-circle" />
                    <span>
                        This is a demo template. Add <code>?demo=true</code> to
                        the URL to enable demo mode.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="badge badge-primary badge-outline">
                        Demo Mode
                    </div>
                    <ViewToggle
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                    />
                </div>
            </div>

            {/* View Content */}
            {viewMode === "grid" && <GridView />}
            {viewMode === "table" && <TableView />}
            {viewMode === "browse" && <BrowseView />}
        </div>
    );
}
