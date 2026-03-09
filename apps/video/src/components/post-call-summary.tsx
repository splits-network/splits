'use client';

import { useBrand } from '@/hooks/use-brand';
import type { CallDetail } from '@/lib/types';

/* ─── Types ────────────────────────────────────────────────────────── */

interface PostCallSummaryProps {
    call: CallDetail;
    duration: number;
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatCallDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
}

function buildPortalCallUrl(portalUrl: string, callId: string): string {
    return `${portalUrl}/portal/calls/${callId}`;
}

function buildFollowUpUrl(portalUrl: string, call: CallDetail): string {
    const params = new URLSearchParams();
    params.set('mode', 'scheduled');
    params.set('followUpFrom', call.id);

    // Pre-fill participants (excluding email-only)
    const participantIds = call.participants
        .map((p) => p.user_id)
        .filter((id) => !id.startsWith('email:'));
    if (participantIds.length > 0) {
        params.set('participants', participantIds.join(','));
    }

    // Pre-fill entity links
    if (call.entity_links.length > 0) {
        const link = call.entity_links[0];
        params.set('entityType', link.entity_type);
        params.set('entityId', link.entity_id);
    }

    return `${portalUrl}/portal/calls/new?${params.toString()}`;
}

/* ─── Component ────────────────────────────────────────────────────── */

/**
 * Post-call summary displaying duration, participants, recording status,
 * entity context, and follow-up actions.
 */
export function PostCallSummary({ call, duration }: PostCallSummaryProps) {
    const brand = useBrand();
    const portalCallUrl = buildPortalCallUrl(brand.portalUrl, call.id);
    const followUpUrl = buildFollowUpUrl(brand.portalUrl, call);

    return (
        <div className="max-w-lg w-full space-y-6">
            {/* Duration */}
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-success/20 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-check text-2xl text-success" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-base-content">Call Complete</h2>
                <div className="flex items-center justify-center gap-2 text-base-content/70">
                    <i className="fa-duotone fa-regular fa-clock" />
                    <span className="text-lg font-medium">{formatCallDuration(duration)}</span>
                </div>
            </div>

            {/* Title & Tags */}
            {(call.title || call.call_type) && (
                <div className="bg-base-100 p-4 space-y-2">
                    {call.title && (
                        <h3 className="font-bold text-base-content">{call.title}</h3>
                    )}
                    <span className="badge badge-ghost text-sm">
                        {call.call_type.replace(/_/g, ' ')}
                    </span>
                </div>
            )}

            {/* Participants */}
            {call.participants.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-base-content/50">
                        Participants ({call.participants.length})
                    </p>
                    <div className="bg-base-100 divide-y divide-base-200">
                        {call.participants.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 p-3">
                                <div className="avatar placeholder">
                                    <div className="w-9 h-9 bg-primary text-primary-content flex items-center justify-center">
                                        {p.user.avatar_url ? (
                                            <img
                                                src={p.user.avatar_url}
                                                alt={`${p.user.first_name} ${p.user.last_name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold">
                                                {p.user.first_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-base-content truncate">
                                        {p.user.first_name} {p.user.last_name}
                                    </p>
                                    <p className="text-sm text-base-content/50 truncate">
                                        {p.user.email}
                                    </p>
                                </div>
                                <span className="badge badge-ghost text-sm capitalize">
                                    {p.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Entity Context */}
            {call.entity_links.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wider text-base-content/50">
                        Linked Entities
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {call.entity_links.map((link) => (
                            <span
                                key={`${link.entity_type}-${link.entity_id}`}
                                className="badge badge-outline text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-link mr-1" />
                                {link.entity_type}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recording Status */}
            <div className="bg-base-100 p-4 flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-circle-dot text-base-content/50" />
                <div>
                    <p className="font-medium text-base-content">Recording</p>
                    <p className="text-sm text-base-content/50">
                        {call.status === 'completed'
                            ? 'Processing - available shortly in portal'
                            : 'Check portal for recording status'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <a
                    href={followUpUrl}
                    className="btn btn-primary btn-block"
                >
                    <i className="fa-duotone fa-regular fa-calendar-plus" />
                    Schedule Follow-up
                </a>
                <a
                    href={portalCallUrl}
                    className="btn btn-outline btn-block"
                >
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                    View in Portal
                </a>
                <a
                    href={brand.portalUrl}
                    className="btn btn-ghost btn-block"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Return to Portal
                </a>
            </div>
        </div>
    );
}
