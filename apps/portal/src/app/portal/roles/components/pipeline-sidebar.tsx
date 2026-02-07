"use client";

import CandidatePipeline from "./candidate-pipeline";

// ===== TYPES =====

interface PipelineSidebarProps {
    roleId: string | null;
    roleTitle?: string;
    onClose: () => void;
}

// ===== COMPONENT =====

export default function PipelineSidebar({
    roleId,
    roleTitle,
    onClose,
}: PipelineSidebarProps) {
    if (!roleId) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="role-pipeline-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!roleId}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close pipeline sidebar"
                ></label>

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">
                                Candidate Pipeline
                            </h2>
                            {roleTitle && (
                                <p className="text-sm text-base-content/60">
                                    {roleTitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <CandidatePipeline roleId={roleId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
