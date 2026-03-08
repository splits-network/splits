'use client';

import { useState } from 'react';
import type { CallDetail } from '@/lib/types';

interface CallSidePanelProps {
    call: CallDetail;
}

function formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Collapsible side panel showing entity context during a call.
 * Starts collapsed. Slides in from the right on desktop, full-width overlay on mobile.
 */
export function CallSidePanel({ call }: CallSidePanelProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Toggle button -- always visible at edge */}
            <button
                type="button"
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 btn btn-sm btn-neutral h-12"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close side panel' : 'Open side panel'}
            >
                <i className={`fa-duotone fa-regular fa-sidebar ${open ? 'text-primary' : ''}`} />
            </button>

            {/* Backdrop on mobile */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 z-40 h-full bg-base-100 border-l border-base-300 shadow-lg
                    w-full sm:w-80 transition-transform duration-200
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-base-300">
                        <h2 className="font-bold text-base-content">Call Details</h2>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square"
                            onClick={() => setOpen(false)}
                            aria-label="Close panel"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Call info */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-base-content">
                                {call.title || 'Video Call'}
                            </h3>
                            <p className="text-sm text-base-content/60 uppercase tracking-wider">
                                {call.call_type.replace(/_/g, ' ')}
                            </p>
                        </div>

                        {/* Entity links */}
                        {call.entity_links.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider">
                                    Related
                                </p>
                                <div className="space-y-2">
                                    {call.entity_links.map((link) => (
                                        <div
                                            key={`${link.entity_type}-${link.entity_id}`}
                                            className="flex items-center gap-2 bg-base-200 p-3"
                                        >
                                            <i className={`fa-duotone fa-regular ${getEntityIcon(link.entity_type)} text-base-content/60`} />
                                            <div>
                                                <p className="text-sm font-medium text-base-content capitalize">
                                                    {link.entity_type}
                                                </p>
                                                <p className="text-sm text-base-content/50 font-mono">
                                                    {link.entity_id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider">
                                Participants
                            </p>
                            <div className="space-y-2">
                                {call.participants.map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2">
                                        <div className="avatar placeholder">
                                            <div className="w-9 h-9 bg-secondary text-secondary-content flex items-center justify-center">
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
                                        <div>
                                            <p className="text-sm font-medium text-base-content">
                                                {p.user.first_name} {p.user.last_name}
                                            </p>
                                            <p className="text-sm text-base-content/50">
                                                {formatRole(p.role)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function getEntityIcon(entityType: string): string {
    switch (entityType) {
        case 'job': return 'fa-briefcase';
        case 'company': return 'fa-building';
        case 'firm': return 'fa-buildings';
        case 'application': return 'fa-file-user';
        case 'candidate': return 'fa-user';
        default: return 'fa-link';
    }
}
