'use client';

import type { CallHistoryEntry } from '@/lib/types';
import { useBrand } from '@/hooks/use-brand';

interface HistoryTabProps {
    history: CallHistoryEntry[];
    isLoading: boolean;
}

function getStatusBadge(status: string): { label: string; className: string } {
    switch (status) {
        case 'completed':
            return { label: 'Completed', className: 'badge badge-success badge-sm' };
        case 'cancelled':
            return { label: 'Cancelled', className: 'badge badge-error badge-sm' };
        case 'missed':
        case 'no_show':
            return { label: 'Missed', className: 'badge badge-warning badge-sm' };
        case 'scheduled':
            return { label: 'Scheduled', className: 'badge badge-info badge-sm' };
        case 'active':
            return { label: 'Active', className: 'badge badge-primary badge-sm' };
        default:
            return { label: status, className: 'badge badge-ghost badge-sm' };
    }
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDuration(minutes: number | null): string {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * History tab: shows recent calls with the same entity.
 * Compact cards with date, type, title, duration, and status.
 */
export function HistoryTab({ history, isLoading }: HistoryTabProps) {
    const brand = useBrand();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12">
                <i className="fa-duotone fa-regular fa-clock-rotate-left text-3xl text-base-content/30 mb-3" />
                <p className="text-sm text-base-content/50">No previous calls with this entity</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider">
                Recent Calls ({history.length})
            </p>

            <div className="space-y-2">
                {history.map((entry) => {
                    const badge = getStatusBadge(entry.status);
                    return (
                        <div key={entry.id} className="bg-base-200 p-3 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-base-content truncate flex-1 mr-2">
                                    {entry.title || 'Untitled Call'}
                                </p>
                                <span className={badge.className}>{badge.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-base-content/50">
                                <span>{formatDate(entry.scheduled_at || entry.started_at)}</span>
                                <span className="capitalize">{entry.call_type.replace(/_/g, ' ')}</span>
                                {entry.duration_minutes && (
                                    <span>{formatDuration(entry.duration_minutes)}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View all link to portal */}
            <a
                href={`${brand.portalUrl}/portal/calls`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm w-full"
            >
                View all calls
                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1" />
            </a>
        </div>
    );
}
