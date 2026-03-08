'use client';

import { useBrand } from '@/hooks/use-brand';
import { BrandedHeader } from '@/components/branded-header';
import type { CallDetail } from '@/lib/types';

interface CallEndedProps {
    call: CallDetail;
    duration: number;
}

function formatCallDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
}

/**
 * Post-call screen showing duration, participants, and return link.
 */
export function CallEnded({ call, duration }: CallEndedProps) {
    const brand = useBrand();

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            <BrandedHeader visible />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-success/20 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-phone-hangup text-2xl text-success" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-base-content">
                        Call Ended
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-clock" />
                        <span className="text-lg font-medium">
                            {formatCallDuration(duration)}
                        </span>
                    </div>

                    {call.participants.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-wider text-base-content/50">
                                Participants
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {call.participants.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-2 bg-base-100 px-3 py-2"
                                    >
                                        <div className="avatar placeholder">
                                            <div className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center">
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
                                        <span className="text-sm font-medium text-base-content">
                                            {p.user.first_name} {p.user.last_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={brand.portalUrl}
                        className="btn btn-primary btn-lg w-full"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Return to Portal
                    </a>
                </div>
            </div>
        </div>
    );
}
