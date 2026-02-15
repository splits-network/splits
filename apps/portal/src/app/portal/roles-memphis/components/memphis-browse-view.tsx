"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Badge,
    EmptyState,
    GeometricDecoration,
    BadgeTabs,
    getAccentColor,
} from "@splits-network/memphis-ui";
import type { AccentColor, BadgeTab } from "@splits-network/memphis-ui";
import { useRolesFilter } from "../../roles/contexts/roles-filter-context";
import { Job, formatCommuteTypes, formatJobLevel } from "../../roles/types";
import DetailPanel from "../../roles/components/browse/detail-panel";

const STATUS_ACCENT: Record<string, AccentColor> = {
    active: "teal",
    paused: "yellow",
    filled: "purple",
    closed: "coral",
};

const BROWSE_TABS: BadgeTab[] = [
    { key: "mine", label: "My Roles" },
    { key: "all", label: "Marketplace" },
];

// Accent → Tailwind class mappings (avoids inline style hex)
const TEXT_CLASSES: Record<string, string> = {
    coral: "text-coral",
    teal: "text-teal",
    yellow: "text-yellow",
    purple: "text-purple",
};

const BORDER_LEFT_CLASSES: Record<string, string> = {
    coral: "border-l-coral",
    teal: "border-l-teal",
    yellow: "border-l-yellow",
    purple: "border-l-purple",
};

export default function MemphisBrowseView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        data: jobs,
        loading,
        error,
        page,
        totalPages,
        goToPage,
        refresh,
        filters,
        setFilter,
    } = useRolesFilter();

    // URL-based selection
    const selectedId = searchParams.get("roleId");

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("roleId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("roleId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Tab handling
    const activeTab = filters.job_owner_filter === "assigned" ? "mine" : "all";

    const handleTabChange = useCallback(
        (tabKey: string) => {
            setFilter("job_owner_filter", tabKey === "mine" ? "assigned" : "all");
            goToPage(1);
        },
        [setFilter, goToPage],
    );

    if (error) {
        return (
            <EmptyState
                icon="fa-duotone fa-regular fa-triangle-exclamation"
                title="Error Loading Roles"
                description={error}
                color="coral"
                action={
                    <button onClick={refresh} className="memphis-btn memphis-btn-sm btn-coral">
                        Try Again
                    </button>
                }
            />
        );
    }

    return (
        <div className="flex border-memphis border-dark bg-white" style={{ height: "calc(100vh - 340px)", minHeight: "500px" }}>
            {/* Left Panel - List */}
            <div
                className={`
                    flex flex-col border-r-4 border-dark bg-cream
                    w-full md:w-96 lg:w-[420px]
                    ${selectedId ? "hidden md:flex" : "flex"}
                `}
            >
                {/* Panel Header */}
                <div className="p-4 border-b-2 border-dark/10">
                    <BadgeTabs
                        tabs={BROWSE_TABS}
                        activeKey={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && jobs.length === 0 ? (
                        <div className="p-8 text-center">
                            <GeometricDecoration shape="square" color="coral" size={24} className="mx-auto mb-3 animate-spin" />
                            <p className="text-xs font-black uppercase tracking-wider text-dark/40">
                                Loading...
                            </p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="p-8 text-center">
                            <i className="fa-duotone fa-briefcase text-4xl text-dark/20 mb-4 block" />
                            <p className="text-xs font-black uppercase tracking-wider text-dark/40">
                                No roles found
                            </p>
                        </div>
                    ) : (
                        <>
                            {jobs.map((job, index) => (
                                <MemphisBrowseListItem
                                    key={job.id}
                                    job={job}
                                    index={index}
                                    isSelected={selectedId === job.id}
                                    onSelect={handleSelect}
                                />
                            ))}

                            {/* Loading indicator */}
                            {loading && jobs.length > 0 && (
                                <div className="p-4 text-center">
                                    <GeometricDecoration shape="circle" color="teal" size={16} className="mx-auto animate-pulse" />
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t-2 border-dark/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-dark/40">
                                        Page {page} of {totalPages}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => goToPage(page - 1)}
                                            className="w-8 h-8 flex items-center justify-center border-2 border-dark text-dark disabled:opacity-30"
                                        >
                                            <i className="fa-solid fa-chevron-left text-xs" />
                                        </button>
                                        <button
                                            disabled={page >= totalPages}
                                            onClick={() => goToPage(page + 1)}
                                            className="w-8 h-8 flex items-center justify-center border-2 border-dark text-dark disabled:opacity-30"
                                        >
                                            <i className="fa-solid fa-chevron-right text-xs" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Detail */}
            <div
                className={`
                    flex-1 flex flex-col bg-white min-w-0
                    ${selectedId ? "fixed inset-0 z-50 flex md:static md:z-auto" : "hidden md:flex"}
                `}
            >
                {selectedId ? (
                    <DetailPanel id={selectedId} onClose={handleClose} />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <GeometricDecoration
                                shape="square"
                                color="coral"
                                size={48}
                                className="mx-auto mb-4 opacity-30"
                            />
                            <p className="text-sm font-black uppercase tracking-wider text-dark/30">
                                Select a role to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Browse List Item ---

interface MemphisBrowseListItemProps {
    job: Job;
    index: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

function MemphisBrowseListItem({
    job,
    index,
    isSelected,
    onSelect,
}: MemphisBrowseListItemProps) {
    const accent = getAccentColor(index);
    const statusAccent = STATUS_ACCENT[job.status] || "dark";

    return (
        <div
            onClick={() => onSelect(job.id)}
            className={`
                group relative px-4 py-3 cursor-pointer transition-all border-b-2 border-dark/5
                border-l-4
                ${isSelected ? `${BORDER_LEFT_CLASSES[accent] || "border-l-coral"} bg-white` : "border-l-transparent"}
            `}
        >
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-xs font-black uppercase tracking-wide text-dark line-clamp-1">
                    {job.title}
                </h3>
                <Badge variant={statusAccent}>
                    {job.status}
                </Badge>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold text-dark/50 mt-1">
                <span className="line-clamp-1">
                    {job.company?.name || "Confidential"}
                </span>
                {job.location && (
                    <>
                        <span className="text-dark/20">&bull;</span>
                        <span className="line-clamp-1 shrink-0">{job.location}</span>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    {formatCommuteTypes(job.commute_types) && (
                        <span className="text-[9px] font-bold uppercase text-dark/40 truncate">
                            {formatCommuteTypes(job.commute_types)}
                        </span>
                    )}
                    {formatJobLevel(job.job_level) && (
                        <>
                            {formatCommuteTypes(job.commute_types) && (
                                <span className="text-dark/20">&middot;</span>
                            )}
                            <span className="text-[9px] font-bold uppercase text-dark/40">
                                {formatJobLevel(job.job_level)}
                            </span>
                        </>
                    )}
                </div>
                {(job.fee_percentage || 0) > 0 && (
                    <span className={`text-xs font-black ${TEXT_CLASSES[accent] || "text-coral"}`}>
                        {job.fee_percentage}%
                    </span>
                )}
            </div>
        </div>
    );
}
