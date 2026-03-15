'use client';

import type { CallHistoryEntry } from '@/lib/types';
import { useBrand } from '@/hooks/use-brand';

interface HistoryTabProps {
    history: CallHistoryEntry[];
    isLoading: boolean;
}

function getStatusAccent(status: string): { label: string; badgeClass: string; borderClass: string } {
    switch (status) {
        case 'completed':
            return { label: 'Completed', badgeClass: 'badge badge-success badge-sm rounded-none', borderClass: 'border-l-4 border-success' };
        case 'cancelled':
            return { label: 'Cancelled', badgeClass: 'badge badge-error badge-sm rounded-none', borderClass: 'border-l-4 border-error' };
        case 'missed':
        case 'no_show':
            return { label: 'Missed', badgeClass: 'badge badge-warning badge-sm rounded-none', borderClass: 'border-l-4 border-warning' };
        case 'scheduled':
            return { label: 'Scheduled', badgeClass: 'badge badge-info badge-sm rounded-none', borderClass: 'border-l-4 border-info' };
        case 'active':
            return { label: 'Active', badgeClass: 'badge badge-primary badge-sm rounded-none', borderClass: 'border-l-4 border-primary' };
        default:
            return { label: status, badgeClass: 'badge badge-ghost badge-sm rounded-none', borderClass: 'border-l-4 border-base-300' };
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
                <i className="fa-duotone fa-regular fa-clock-rotate-left text-5xl text-base-content/15 mb-4" />
                <p className="text-sm font-semibold text-base-content/40">No call history</p>
                <p className="text-sm text-base-content/30 mt-1">Previous calls with this entity will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-black uppercase tracking-widest text-base-content/50">
                Recent Calls ({history.length})
            </p>

            <div className="space-y-2">
                {history.map((entry) => {
                    const status = getStatusAccent(entry.status);
                    return (
                        <div key={entry.id} className={`${status.borderClass} bg-base-200 p-3 space-y-1 shadow-sm`}>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-base-content truncate flex-1 mr-2">
                                    {entry.title || 'Untitled Call'}
                                </p>
                                <span className={status.badgeClass}>{status.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-base-content/50">
                                <span className="font-semibold">{formatDate(entry.scheduled_at || entry.started_at)}</span>
                                <span className="capitalize">{entry.call_type.replace(/_/g, ' ')}</span>
                                {entry.duration_minutes && (
                                    <span className="font-semibold">{formatDuration(entry.duration_minutes)}</span>
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
                className="btn btn-ghost btn-sm rounded-none border border-base-300 w-full"
            >
                View all calls
                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1" />
            </a>
        </div>
    );
}
