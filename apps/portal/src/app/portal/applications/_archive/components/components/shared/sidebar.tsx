"use client";

import { Application } from "../../types";
import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import { useFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: Application | null;
    onClose: () => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
}

export default function Sidebar({ item, onClose, onMessage }: SidebarProps) {
    const { refresh } = useFilter();

    if (!item) return null;

    const candidateName = item.candidate?.full_name || "Unknown";
    const jobTitle = item.job?.title;

    return (
        <div className="drawer drawer-end">
            <input
                id="application-new-detail-drawer"
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
                        <div className="flex items-center justify-between mb-2">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-semibold text-base-content truncate">
                                    Application Details
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <ActionsToolbar
                                    application={item}
                                    variant="descriptive"
                                    size="md"
                                    showActions={{
                                        viewDetails: false,
                                        message: true,
                                        addNote: true,
                                        advanceStage: true,
                                        reject: true,
                                        requestChanges: true,
                                        requestPrescreen: true,
                                    }}
                                    onMessage={onMessage}
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

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Details itemId={item.id} onRefresh={refresh} />
                    </div>
                </div>
            </div>
        </div>
    );
}
