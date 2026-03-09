'use client';

import { BrandedHeader } from '@/components/branded-header';
import { PostCallSummary } from '@/components/post-call-summary';
import type { CallDetail } from '@/lib/types';

interface CallEndedProps {
    call: CallDetail;
    duration: number;
}

/**
 * Full-page post-call screen wrapping the PostCallSummary component
 * with branded header and centered layout.
 */
export function CallEnded({ call, duration }: CallEndedProps) {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            <BrandedHeader visible />

            <div className="flex-1 flex items-center justify-center p-6">
                <PostCallSummary call={call} duration={duration} />
            </div>
        </div>
    );
}
