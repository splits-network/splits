'use client';

import Link from 'next/link';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { TopPerformer } from '../../hooks/use-top-performers';

interface TopPerformersProps {
    performers: TopPerformer[];
    loading: boolean;
}

const RANK_STYLES: Record<number, string> = {
    1: 'bg-warning/20 text-warning border-warning/30',
    2: 'bg-base-300/50 text-base-content/70 border-base-300',
    3: 'bg-accent/10 text-accent border-accent/20',
};

export default function TopPerformers({ performers, loading }: TopPerformersProps) {
    if (loading) {
        return (
            <ContentCard title="Top performers" icon="fa-ranking-star" className="bg-base-200">
                <SkeletonList count={5} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    if (performers.length === 0) {
        return (
            <ContentCard title="Top performers" icon="fa-ranking-star" className="bg-base-200">
                <EmptyState
                    icon="fa-ranking-star"
                    title="No placements this month"
                    description="Top performers will appear here once placements are recorded."
                    size="sm"
                />
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Top performers"
            icon="fa-ranking-star"
            className="bg-base-200"
            headerActions={
                <Link href="/portal/admin/reputation" className="btn btn-sm btn-ghost text-xs">
                    View all
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                </Link>
            }
        >
            <div className="space-y-1 -mx-2">
                {performers.map((performer, i) => {
                    const rank = i + 1;
                    const rankStyle = RANK_STYLES[rank] || 'bg-base-200 text-base-content/50 border-base-300/50';

                    return (
                        <div
                            key={performer.recruiter_id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300/50 transition-all"
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${rankStyle} tabular-nums`}>
                                {rank}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold line-clamp-1">
                                    {performer.recruiter_name}
                                </p>
                            </div>
                            <span className="badge badge-sm badge-primary badge-outline tabular-nums shrink-0">
                                {performer.placement_count} {performer.placement_count === 1 ? 'placement' : 'placements'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </ContentCard>
    );
}
