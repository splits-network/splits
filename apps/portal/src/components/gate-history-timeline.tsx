'use client';

import { formatRelativeTime } from '@/lib/utils';

interface GateHistoryEntry {
    gate: string;
    action: 'approved' | 'denied' | 'info_requested' | 'info_provided' | 'entered';
    timestamp: string;
    reviewer_user_id?: string;
    reviewer_name?: string;
    notes?: string;
    reason?: string;
    questions?: string;
    answers?: string;
}

interface GateHistoryTimelineProps {
    history: GateHistoryEntry[];
    className?: string;
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'approved':
            return 'fa-circle-check text-success';
        case 'denied':
            return 'fa-circle-xmark text-error';
        case 'info_requested':
            return 'fa-circle-question text-warning';
        case 'info_provided':
            return 'fa-circle-info text-info';
        case 'entered':
            return 'fa-arrow-right text-base-content';
        default:
            return 'fa-circle text-base-content';
    }
};

const getActionLabel = (action: string) => {
    switch (action) {
        case 'approved':
            return 'Approved';
        case 'denied':
            return 'Denied';
        case 'info_requested':
            return 'Information Requested';
        case 'info_provided':
            return 'Information Provided';
        case 'entered':
            return 'Gate Entered';
        default:
            return action;
    }
};

const getGateLabel = (gate: string) => {
    switch (gate) {
        case 'candidate_recruiter':
            return 'Candidate Recruiter Review';
        case 'company_recruiter':
            return 'Company Recruiter Review';
        case 'company':
            return 'Company Review';
        default:
            return gate;
    }
};

export default function GateHistoryTimeline({ history, className = '' }: GateHistoryTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <i className="fa-duotone fa-regular fa-clock-rotate-left text-4xl text-base-content/30 mb-2"></i>
                <p className="text-base-content/60">No gate history available</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {history.map((entry, index) => (
                <div key={index} className="flex gap-4">
                    {/* Timeline icon */}
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center flex-shrink-0">
                            <i className={`fa-duotone fa-regular ${getActionIcon(entry.action)}`}></i>
                        </div>
                        {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-base-300 mt-2"></div>
                        )}
                    </div>

                    {/* Timeline content */}
                    <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h4 className="font-semibold">{getGateLabel(entry.gate)}</h4>
                                <p className="text-sm text-base-content/70">
                                    {getActionLabel(entry.action)}
                                    {entry.reviewer_name && ` by ${entry.reviewer_name}`}
                                </p>
                            </div>
                            <span className="text-xs text-base-content/60 whitespace-nowrap ml-4">
                                {formatRelativeTime(entry.timestamp)}
                            </span>
                        </div>

                        {/* Action details */}
                        {entry.notes && (
                            <div className="mt-2 p-3 bg-base-200 rounded">
                                <p className="text-sm font-medium mb-1">Notes:</p>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap">{entry.notes}</p>
                            </div>
                        )}

                        {entry.reason && (
                            <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded">
                                <p className="text-sm font-medium mb-1 text-error">Reason for Denial:</p>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap">{entry.reason}</p>
                            </div>
                        )}

                        {entry.questions && (
                            <div className="mt-2 p-3 bg-warning/10 border border-warning/20 rounded">
                                <p className="text-sm font-medium mb-1 text-warning">Information Requested:</p>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap">{entry.questions}</p>
                            </div>
                        )}

                        {entry.answers && (
                            <div className="mt-2 p-3 bg-info/10 border border-info/20 rounded">
                                <p className="text-sm font-medium mb-1 text-info">Information Provided:</p>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap">{entry.answers}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
