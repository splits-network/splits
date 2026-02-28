'use client';

import React from 'react';
import { useAdminActivity, type ActivityMode } from '@/hooks/use-admin-activity';

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_ICONS: Record<string, string> = {
    user_created: 'fa-user-plus',
    job_posted: 'fa-briefcase',
    application_submitted: 'fa-file-user',
    recruiter_approved: 'fa-badge-check',
    payment_processed: 'fa-money-bill-wave',
    fraud_flagged: 'fa-shield-exclamation',
    default: 'fa-circle-dot',
};

function getIcon(type: string): string {
    return TYPE_ICONS[type] ?? TYPE_ICONS.default;
}

// Placeholder when no activity data available
const PLACEHOLDER: { id: string; type: string; description: string; createdAt: string }[] = [
    { id: '1', type: 'user_created', description: 'New user registered', createdAt: new Date(Date.now() - 300_000).toISOString() },
    { id: '2', type: 'job_posted', description: 'Job posted: Senior Engineer', createdAt: new Date(Date.now() - 900_000).toISOString() },
    { id: '3', type: 'recruiter_approved', description: 'Recruiter approved: TechHire LLC', createdAt: new Date(Date.now() - 1_800_000).toISOString() },
    { id: '4', type: 'payment_processed', description: 'Payout processed: $2,400', createdAt: new Date(Date.now() - 3_600_000).toISOString() },
    { id: '5', type: 'application_submitted', description: 'Application submitted', createdAt: new Date(Date.now() - 7_200_000).toISOString() },
];

export function DashboardActivity() {
    const { activities, loading, mode, setMode } = useAdminActivity();

    const displayItems = activities.length > 0 ? activities : PLACEHOLDER;
    const isPlaceholder = activities.length === 0 && !loading;

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
            <div className="card-body p-4 gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-wave-pulse text-primary" />
                        <h3 className="font-semibold text-sm">Activity Feed</h3>
                    </div>
                    <div className="join">
                        <button
                            className={`join-item btn btn-xs ${mode === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setMode('admin' as ActivityMode)}
                            type="button"
                        >
                            Admin
                        </button>
                        <button
                            className={`join-item btn btn-xs ${mode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setMode('all' as ActivityMode)}
                            type="button"
                        >
                            All
                        </button>
                    </div>
                </div>

                {isPlaceholder && (
                    <div className="badge badge-ghost badge-xs text-base-content/40 self-start">
                        Sample Data
                    </div>
                )}

                <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton h-8 w-full" />
                        ))
                    ) : (
                        displayItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-base-200 transition-colors text-sm"
                            >
                                <i className={`fa-duotone fa-regular ${getIcon(item.type)} text-primary/70 shrink-0`} />
                                <span className="flex-1 truncate text-base-content/80">{item.description}</span>
                                <span className="text-xs text-base-content/40 shrink-0">
                                    {timeAgo(item.createdAt)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
