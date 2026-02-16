"use client";

import Details from "./details";
import { useInvitationFilter } from "../../contexts/filter-context";
import ActionsToolbar from "./actions-toolbar";

interface SidebarProps {
    invitation: any | null; // Change from invitationId to full invitation object
    onClose: () => void;
}

export default function Sidebar({ invitation, onClose }: SidebarProps) {
    const { refresh } = useInvitationFilter();

    if (!invitation) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="invitation-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!invitation}
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
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">
                                <i className="fa-duotone fa-regular fa-envelope-open-text mr-2" />
                                Invitation Details
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* Actions Toolbar */}
                                <ActionsToolbar
                                    invitation={invitation}
                                    layout="horizontal"
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
                        <Details
                            invitationId={invitation.id}
                            onRefresh={refresh}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
