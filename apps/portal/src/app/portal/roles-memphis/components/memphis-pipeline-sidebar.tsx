"use client";

import { MemphisSidebarOverlay } from "./memphis-sidebar-overlay";
import CandidatePipeline from "../../roles/components/candidate-pipeline";

interface MemphisPipelineSidebarProps {
    roleId: string | null;
    roleTitle?: string;
    onClose: () => void;
}

export default function MemphisPipelineSidebar({
    roleId,
    roleTitle,
    onClose,
}: MemphisPipelineSidebarProps) {
    return (
        <MemphisSidebarOverlay
            isOpen={!!roleId}
            onClose={onClose}
            title="Candidate Pipeline"
            subtitle={roleTitle}
        >
            {roleId && (
                <div className="p-4">
                    <CandidatePipeline roleId={roleId} />
                </div>
            )}
        </MemphisSidebarOverlay>
    );
}
