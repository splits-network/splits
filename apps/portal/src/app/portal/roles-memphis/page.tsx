"use client";

import { useCallback, useMemo, useState } from "react";
import { GeometricDecoration } from "@splits-network/memphis-ui";
import { MemphisHeader } from "./components/memphis-header";
import MemphisGridView from "./components/memphis-grid-view";
import MemphisTableView from "./components/memphis-table-view";
import MemphisBrowseView from "./components/memphis-browse-view";
import {
    RolesFilterProvider,
    useRolesFilter,
} from "../roles/contexts/roles-filter-context";

type ViewMode = "grid" | "table" | "browse";

function RolesMemphisContent() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const {
        profileLoading,
        data: jobs,
        total,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        canCreateRole,
        showJobAssignmentFilter,
        refresh,
    } = useRolesFilter();

    const handleViewChange = useCallback((mode: string) => {
        setViewMode(mode as ViewMode);
    }, []);

    // Stat counts for hero
    const activeCount = useMemo(
        () => jobs.filter((j) => j.status === "active").length,
        [jobs],
    );
    const pausedCount = useMemo(
        () => jobs.filter((j) => j.status === "paused").length,
        [jobs],
    );
    const filledCount = useMemo(
        () => jobs.filter((j) => j.status === "filled").length,
        [jobs],
    );

    // Memphis-styled loading state
    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <GeometricDecoration shape="square" color="coral" size={32} className="animate-spin" />
                        <GeometricDecoration shape="circle" color="teal" size={32} className="animate-pulse" />
                        <GeometricDecoration shape="triangle" color="yellow" size={32} className="animate-bounce" />
                        <GeometricDecoration shape="cross" color="purple" size={32} className="animate-spin" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-dark/50">
                        Loading Roles...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <MemphisHeader
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                clearSearch={clearSearch}
                filters={filters}
                setFilter={setFilter}
                loading={loading}
                canCreateRole={canCreateRole}
                showJobAssignmentFilter={showJobAssignmentFilter}
                refresh={refresh}
                viewMode={viewMode}
                onViewChange={handleViewChange}
                total={total}
                activeCount={activeCount}
                pausedCount={pausedCount}
                filledCount={filledCount}
            />

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                    Showing {jobs.length} of {total} roles
                </span>
                {searchInput && (
                    <span className="text-xs font-bold uppercase tracking-wider text-coral">
                        Filtered by: &ldquo;{searchInput}&rdquo;
                    </span>
                )}
            </div>

            {viewMode === "grid" && <MemphisGridView />}
            {viewMode === "table" && <MemphisTableView />}
            {viewMode === "browse" && <MemphisBrowseView />}
        </div>
    );
}

export default function RolesMemphisPage() {
    return (
        <RolesFilterProvider>
            <RolesMemphisContent />
        </RolesFilterProvider>
    );
}
