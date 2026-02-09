'use client';

import { useUserProfile } from "@/contexts";
import { ApplicationTimelinePanel, type AuditLogEntry, type ViewerRole } from "@splits-network/shared-ui";

interface ApplicationTimelineProps {
    auditLogs: AuditLogEntry[];
    currentStage: string;
}

export default function ApplicationTimeline({ auditLogs, currentStage }: ApplicationTimelineProps) {
    const { profile, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    const viewerRole: ViewerRole = isAdmin ? 'admin'
        : isCompanyUser ? 'company'
        : isRecruiter ? 'recruiter'
        : 'candidate';

    return (
        <ApplicationTimelinePanel
            auditLogs={auditLogs}
            currentStage={currentStage}
            viewerRole={viewerRole}
            showDebugInfo={isAdmin}
        />
    );
}
