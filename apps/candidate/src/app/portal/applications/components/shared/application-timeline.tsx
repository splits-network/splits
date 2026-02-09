'use client';

import { ApplicationTimelinePanel, type AuditLogEntry } from "@splits-network/shared-ui";

interface ApplicationTimelineProps {
    auditLogs: AuditLogEntry[];
    currentStage: string;
}

export default function ApplicationTimeline({ auditLogs, currentStage }: ApplicationTimelineProps) {
    return (
        <ApplicationTimelinePanel
            auditLogs={auditLogs}
            currentStage={currentStage}
            viewerRole="candidate"
            showDebugInfo={false}
        />
    );
}
