'use client';

import Link from 'next/link';
import { MemphisCard, MemphisEmpty, MemphisSkeleton, MemphisBtn } from './primitives';
import { ACCENT, accentAt } from './accent';
import { TopPerformer } from '../hooks/use-top-performers';

interface TopPerformersProps {
    performers: TopPerformer[];
    loading: boolean;
}

const RANK_ACCENTS = [2, 1, 3]; // gold=yellow, silver=teal, bronze=purple

export default function TopPerformers({ performers, loading }: TopPerformersProps) {
    const headerRight = (
        <MemphisBtn href="/portal/admin/reputation" accent={ACCENT[2]} variant="ghost" size="sm">
            View All <i className="fa-duotone fa-regular fa-arrow-right" />
        </MemphisBtn>
    );

    if (loading) {
        return (
            <MemphisCard title="Top Performers" icon="fa-ranking-star" accent={ACCENT[2]} headerRight={headerRight}>
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (performers.length === 0) {
        return (
            <MemphisCard title="Top Performers" icon="fa-ranking-star" accent={ACCENT[2]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-ranking-star"
                    title="No placements this month"
                    description="Top performers will appear here once placements are recorded."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Top Performers" icon="fa-ranking-star" accent={ACCENT[2]} headerRight={headerRight}>
            <div className="space-y-1">
                {performers.map((performer, i) => {
                    const rank = i + 1;
                    const accent = i < 3 ? accentAt(RANK_ACCENTS[i]) : accentAt(i);

                    return (
                        <div
                            key={performer.recruiter_id}
                            className="flex items-center gap-3 p-2 border-b border-dark/10 last:border-0 hover:bg-dark/5 transition-colors"
                        >
                            <div className={`w-7 h-7 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                <span className={`text-[10px] font-black tabular-nums ${accent.textOnBg}`}>
                                    {rank}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-dark line-clamp-1 flex-1">
                                {performer.recruiter_name}
                            </p>
                            <span className="px-2 py-0.5 border-4 border-dark text-[10px] font-black tabular-nums bg-teal/20 text-teal shrink-0">
                                {performer.placement_count} {performer.placement_count === 1 ? 'placement' : 'placements'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
