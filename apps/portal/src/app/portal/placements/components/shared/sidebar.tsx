"use client";

import type { Placement } from "../../types";
import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import { useFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: Placement | null;
    onClose: () => void;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const { refresh } = useFilter();

    if (!item) return null;

    const candidateName = item.candidate?.full_name || "Unknown";
    const jobTitle = item.job?.title;

    return (
        <div className="drawer drawer-end">
            <input
                id="placement-new-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!item}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                />

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold truncate">
                                    <i className="fa-duotone fa-regular fa-trophy mr-2" />
                                    {candidateName}
                                </h2>
                                {jobTitle && (
                                    <p className="text-sm text-base-content/60 truncate">
                                        {jobTitle}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <ActionsToolbar
                                    placement={item}
                                    variant="descriptive"
                                    size="md"
                                    showActions={{
                                        viewDetails: false,
                                        statusActions: true,
                                    }}
                                />
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-circle btn-ghost"
                                    aria-label="Close"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Details itemId={item.id} onRefresh={refresh} />
                    </div>
                </div>
            </div>
        </div>
    );
}
