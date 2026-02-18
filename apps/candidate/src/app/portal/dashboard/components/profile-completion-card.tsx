'use client';

import Link from 'next/link';
import { Card, Badge, ScoreBar, Button } from '@splits-network/memphis-ui';
import type { ProfileCompleteness } from '@/lib/utils/profile-completeness';

interface ProfileCompletionCardProps {
    completion: ProfileCompleteness;
}

const TIER_BADGE_COLOR: Record<string, 'coral' | 'yellow' | 'teal' | 'purple'> = {
    minimal: 'coral',
    basic: 'yellow',
    strong: 'teal',
    complete: 'purple',
};

export default function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
    if (completion.percentage >= 100) return null;

    const badgeColor = TIER_BADGE_COLOR[completion.tier] || 'coral';

    return (
        <Card className="border-4 border-dark">
            <div className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex flex-col items-center gap-4 text-center grow sm:flex-row sm:items-center sm:text-left">
                        {/* Score bar replaces radial-progress */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <span className="text-2xl font-black text-dark tabular-nums">
                                {completion.percentage}%
                            </span>
                            <ScoreBar score={completion.percentage} showLabel={false} className="w-20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-dark">Completion Level:</span>
                                <Badge color={badgeColor} size="xs">
                                    {completion.tier.charAt(0).toUpperCase() + completion.tier.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-dark/50">
                                A complete profile helps you stand out to recruiters
                            </p>
                        </div>
                    </div>

                    {completion.missingFields.length > 0 && (
                        <div className="grow md:mb-4">
                            <p className="text-xs font-black uppercase tracking-widest text-dark mb-2">Top Priorities:</p>
                            <ul className="space-y-1">
                                {completion.missingFields.slice(0, 3).map((field, index) => (
                                    <li
                                        key={index}
                                        className="text-[11px] text-dark/60 flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-circle-dot text-coral text-xs"></i>
                                        {field.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <Link href="/portal/profile" className="inline-flex">
                        <Button color="coral" size="sm">
                            Complete Profile
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
