import React from 'react';
import { AuditLogEntry, ViewerRole } from './types';
import { PipelineProgress } from './pipeline-progress';
import { ActivityFeed } from './activity-feed';

export interface ApplicationTimelinePanelProps {
    auditLogs: AuditLogEntry[];
    currentStage: string;
    viewerRole: ViewerRole;
    showPipelineProgress?: boolean;
    showActivityFeed?: boolean;
    showDebugInfo?: boolean;
}

export function ApplicationTimelinePanel({
    auditLogs,
    currentStage,
    viewerRole,
    showPipelineProgress = true,
    showActivityFeed = true,
    showDebugInfo = false,
}: ApplicationTimelinePanelProps) {
    // Detect if a recruiter is involved from audit log data
    const hasRecruiter = auditLogs.some(log =>
        log.action === 'recruiter_proposed' ||
        log.action === 'recruiter_proposed_job' ||
        log.action === 'proposal_accepted' ||
        log.action === 'candidate_approved_opportunity' ||
        log.performed_by_role === 'recruiter' ||
        log.metadata?.has_recruiter === true ||
        log.new_value?.candidate_recruiter_id != null
    );

    return (
        <div className="flex flex-col h-full min-h-0">
            {showPipelineProgress && (
                <div className="card bg-base-200 p-4 shrink-0">
                    <h4 className="font-semibold mb-3 text-sm">
                        <i className="fa-duotone fa-regular fa-diagram-next mr-2" />
                        Application Progress
                    </h4>
                    <PipelineProgress
                        currentStage={currentStage}
                        hasRecruiter={hasRecruiter}
                    />
                </div>
            )}

            {showActivityFeed && (
                <div className="flex flex-col min-h-0 flex-1 mt-4">
                    <h4 className="font-semibold mb-3 text-sm shrink-0">
                        <i className="fa-duotone fa-regular fa-timeline mr-2" />
                        Activity
                    </h4>
                    <div className="overflow-y-auto flex-1 min-h-0">
                        <ActivityFeed
                            auditLogs={auditLogs}
                            showDebugInfo={showDebugInfo}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
