'use client';
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { useToast } from "@/lib/toast-context";

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

export default function ApplicationTimeline({ auditLogs }: ApplicationTimelineProps) {
    const { getToken } = useAuth();
    const { profile, isAdmin } = useUserProfile();
    const toast = useToast();
    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="text-center py-8 text-base-content/60">
                        <i className="fa-duotone fa-regular fa-timeline text-4xl mb-2"></i>
                        <p>No activity yet</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ul className="space-y-0">
            {auditLogs.map((log, index) => {
                const label = ACTION_LABELS[log.action] || log.action;
                const icon = ACTION_ICONS[log.action] || 'fa-circle';
                const color = ACTION_COLORS[log.action] || 'text-base-content';

                return (
                    <li key={log.id}>
                        <div className="flex gap-4 py-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full bg-base-200 flex items-center justify-center ${color}`}>
                                    <i className={`fa-duotone fa-regular ${icon}`}></i>
                                </div>
                                {index < auditLogs.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-base-300 my-1"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold">{label}</h4>
                                        <p className="text-sm text-base-content/60">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {log.performed_by_role && (
                                        <span className="badge badge-sm">
                                            {log.performed_by_role}
                                        </span>
                                    )}
                                </div>

                                {/* Show stage change details */}
                                {log.action === 'stage_changed' && log.old_value && log.new_value && (
                                    <div className="mt-2 text-sm">
                                        <span className="badge badge-sm badge-outline">
                                            {log.old_value.stage}
                                        </span>
                                        <i className="fa-duotone fa-regular fa-arrow-right mx-2"></i>
                                        <span className="badge badge-sm badge-primary">
                                            {log.new_value.stage}
                                        </span>
                                    </div>
                                )}

                                {/* Show notes if available */}
                                {log.metadata?.notes && (
                                    <p className="mt-2 text-sm text-base-content/80">
                                        <i className="fa-duotone fa-regular fa-note-sticky mr-1"></i>
                                        {log.metadata.notes}
                                    </p>
                                )}

                                {/* Debug details dropdown */}
                                {(log.old_value || log.new_value || log.metadata) && isAdmin && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
                                            <i className="fa-duotone fa-regular fa-code"></i> Debug Info
                                        </summary>
                                        <ul className="mt-2 space-y-1">
                                            <li>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-ghost"
                                                    onClick={() => {
                                                        const details = {
                                                            id: log.id,
                                                            action: log.action,
                                                            old_value: log.old_value,
                                                            new_value: log.new_value,
                                                            metadata: log.metadata,
                                                        };
                                                        toast.info(JSON.stringify(details, null, 2));
                                                    }}
                                                >
                                                    <i className="fa-duotone fa-regular fa-eye"></i>
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
    );
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
