"use client";

import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import { useFilter } from "../../contexts/filter-context";
import type { Application } from "../../types";

interface SidebarProps {
    item: Application | null;
    onClose: () => void;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const { refresh } = useFilter();

    if (!item) return null;

    return (
        <div className="drawer drawer-end">
            <input
                id="application-detail-drawer"
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

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                <i className="fa-duotone fa-regular fa-file-lines mr-2" />
                                Application Details
                            </h2>
                            <div className="flex items-center gap-2">
                                <ActionsToolbar
                                    variant="descriptive"
                                    size="md"
                                    item={item}
                                    onStageChange={() => {
                                        refresh();
                                        onClose();
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
