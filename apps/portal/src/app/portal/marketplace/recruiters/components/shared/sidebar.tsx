"use client";

import { RecruiterWithUser, getDisplayName } from "../../types";
import Details from "./details";
import RecruiterActionsToolbar from "./actions-toolbar";
import { useRecruiterFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: RecruiterWithUser | null;
    onClose: () => void;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const { refresh } = useRecruiterFilter();

    if (!item) return null;

    const displayName = getDisplayName(item);

    return (
        <div className="drawer drawer-end">
            <input
                id="recruiter-detail-drawer"
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
                                    <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                                    {displayName}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <RecruiterActionsToolbar
                                    recruiter={item}
                                    variant="descriptive"
                                    size="md"
                                />
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-square btn-ghost"
                                    aria-label="Close"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Details itemId={item.id} onRefresh={refresh} />
                    </div>
                </div>
            </div>
        </div>
    );
}
