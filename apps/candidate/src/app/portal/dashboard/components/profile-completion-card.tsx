'use client';

import Link from 'next/link';
import type { ProfileCompleteness } from '@/lib/utils/profile-completeness';

interface ProfileCompletionCardProps {
    completion: ProfileCompleteness;
}

export default function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
    if (completion.percentage >= 100) return null;

    return (
        <div className="card bg-base-200">
            <div className="card-body p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex flex-col items-center gap-4 text-center grow sm:flex-row sm:items-center sm:text-left">
                        <div
                            className="radial-progress text-primary"
                            style={{ '--value': completion.percentage } as React.CSSProperties}
                            role="progressbar"
                        >
                            <span className="text-lg md:text-2xl font-bold">
                                {completion.percentage}%
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">Completion Level:</span>
                                <span
                                    className={`badge ${
                                        completion.tier === 'complete'
                                            ? 'badge-success'
                                            : completion.tier === 'strong'
                                              ? 'badge-info'
                                              : completion.tier === 'basic'
                                                ? 'badge-warning'
                                                : 'badge-error'
                                    }`}
                                >
                                    {completion.tier.charAt(0).toUpperCase() + completion.tier.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-base-content/70">
                                A complete profile helps you stand out to recruiters
                            </p>
                        </div>
                    </div>

                    {completion.missingFields.length > 0 && (
                        <div className="grow md:mb-4">
                            <p className="text-sm font-semibold mb-2">Top Priorities:</p>
                            <ul className="space-y-1">
                                {completion.missingFields.slice(0, 3).map((field, index) => (
                                    <li
                                        key={index}
                                        className="text-sm text-base-content/70 flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-circle-dot text-primary text-xs"></i>
                                        {field.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Link
                        href="/portal/profile"
                        className="btn btn-primary btn-sm w-full sm:w-auto"
                    >
                        Complete Profile
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
}
