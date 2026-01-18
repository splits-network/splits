import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import GateReviewList from '../applications/components/gate-review-list';

export const metadata = {
    title: 'Gate Reviews - Splits Network',
    description: 'Review applications pending at your gate'
};

async function GateReviewsContent() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Determine gate type based on user role
    // For now, we'll default to candidate_recruiter
    // In production, you'd fetch user roles and determine appropriate gate
    const gateType = 'candidate_recruiter'; // TODO: Get from user context

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gate Reviews</h1>
                    <p className="text-base-content/60 mt-2">
                        Review applications pending at your gate
                    </p>
                </div>

                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Pending Reviews</div>
                        <div className="stat-value text-primary">0</div>
                        <div className="stat-desc">Applications awaiting action</div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <GateReviewList gateType={gateType} userId={userId} />
                </div>
            </div>
        </div>
    );
}

export default function GateReviewsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        }>
            <GateReviewsContent />
        </Suspense>
    );
}
