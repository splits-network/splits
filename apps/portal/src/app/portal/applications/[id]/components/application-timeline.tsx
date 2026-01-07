'use client';

interface ApplicationAuditLog {
    id: string;
    application_id: string;
    action: string;
    performed_by_user_id?: string;
    performed_by_role?: string;
    company_id?: string;
    old_value?: Record<string, any>;
    new_value?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at: string;
}

interface ApplicationTimelineProps {
    auditLogs: ApplicationAuditLog[];
}

const ACTION_LABELS: Record<string, string> = {
    created: 'Application Created',
    draft_saved: 'Draft Saved',
    submitted_to_recruiter: 'Submitted to Recruiter',
    recruiter_reviewed: 'Reviewed by Recruiter',
    submitted_to_company: 'Submitted to Company',
    stage_changed: 'Stage Changed',
    note_added: 'Note Added',
    accepted: 'Accepted by Company',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    viewed: 'Viewed',
};

const ACTION_ICONS: Record<string, string> = {
    created: 'fa-plus-circle',
    draft_saved: 'fa-save',
    submitted_to_recruiter: 'fa-paper-plane',
    recruiter_reviewed: 'fa-eye',
    submitted_to_company: 'fa-building',
    stage_changed: 'fa-arrow-right-arrow-left',
    note_added: 'fa-note-sticky',
    accepted: 'fa-check-circle',
    rejected: 'fa-times-circle',
    withdrawn: 'fa-undo',
    viewed: 'fa-eye',
};

const ACTION_COLORS: Record<string, string> = {
    created: 'text-info',
    draft_saved: 'text-warning',
    submitted_to_recruiter: 'text-primary',
    recruiter_reviewed: 'text-info',
    submitted_to_company: 'text-success',
    stage_changed: 'text-primary',
    note_added: 'text-warning',
    accepted: 'text-success',
    rejected: 'text-error',
    withdrawn: 'text-warning',
    viewed: 'text-base-content/50',
};

export default function ApplicationTimeline({ auditLogs }: ApplicationTimelineProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const getActionDescription = (log: ApplicationAuditLog): string => {
        if (log.action === 'stage_changed' && log.old_value && log.new_value) {
            return `Stage updated from ${log.old_value.stage} to ${log.new_value.stage}`;
        }

        if (log.action === 'note_added' && log.metadata?.note) {
            return `Added note: "${log.metadata.note.substring(0, 100)}${log.metadata.note.length > 100 ? '...' : ''}"`;
        }

        if (log.action === 'rejected' && log.metadata?.reason) {
            return `Rejected: ${log.metadata.reason}`;
        }

        if (log.action === 'withdrawn' && log.metadata?.reason) {
            return `Withdrawn: ${log.metadata.reason}`;
        }

        return ACTION_LABELS[log.action] || log.action;
    };

    const getRoleDisplay = (role?: string): string => {
        if (!role) return 'System';

        const roles: Record<string, string> = {
            recruiter: 'Recruiter',
            company_admin: 'Company Admin',
            hiring_manager: 'Hiring Manager',
            candidate: 'Candidate',
            platform_admin: 'Admin',
        };

        return roles[role] || role;
    };

    if (auditLogs.length === 0) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body text-center py-8">
                    <i className="fa-solid fa-clock-rotate-left text-4xl text-base-content/20 mb-2"></i>
                    <p className="text-base-content/70">No activity recorded yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title mb-4">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    Activity Timeline
                </h2>

                <ul className="timeline timeline-vertical timeline-compact">
                    {auditLogs.map((log, index) => {
                        const { date, time } = formatDate(log.created_at);
                        const actionLabel = ACTION_LABELS[log.action] || log.action;
                        const actionIcon = ACTION_ICONS[log.action] || 'fa-circle';
                        const actionColor = ACTION_COLORS[log.action] || 'text-base-content';
                        const description = getActionDescription(log);
                        const roleDisplay = getRoleDisplay(log.performed_by_role);

                        return (
                            <li key={log.id}>
                                {index > 0 && <hr />}
                                <div className="timeline-start text-sm text-base-content/70 w-32">
                                    <div className="font-semibold">{date}</div>
                                    <div className="text-xs">{time}</div>
                                </div>
                                <div className="timeline-middle">
                                    <i className={`fa-solid ${actionIcon} ${actionColor}`}></i>
                                </div>
                                <div className="timeline-end timeline-box mb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-base-content mb-1">
                                                {actionLabel}
                                            </div>
                                            <div className="text-sm text-base-content/70 mb-2">
                                                {description}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-base-content/60">
                                                <span className="badge badge-ghost badge-sm">
                                                    {roleDisplay}
                                                </span>
                                                {log.performed_by_user_id && (
                                                    <span className="font-mono">
                                                        {log.performed_by_user_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {(log.old_value || log.new_value || log.metadata) && (
                                            <details className="dropdown dropdown-end">
                                                <summary className="btn btn-ghost btn-xs">
                                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                                </summary>
                                                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                const details = {
                                                                    action: log.action,
                                                                    old_value: log.old_value,
                                                                    new_value: log.new_value,
                                                                    metadata: log.metadata,
                                                                };
                                                                alert(JSON.stringify(details, null, 2));
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-eye"></i>
                                                            View Details
                                                        </button>
                                                    </li>
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                </div>
                                {index < auditLogs.length - 1 && <hr />}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
