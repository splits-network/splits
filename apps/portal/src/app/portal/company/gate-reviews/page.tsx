import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import GateReviewList from '../../applications/components/gate-review-list';

export const metadata = {
    title: 'Company Gate Reviews - Splits Network',
    description: 'Review candidate applications for your company'
};

async function CompanyGateReviewsContent() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Company Gate Reviews</h1>
                    <p className="text-base-content/60 mt-2">
                        Review candidates who have passed recruiter screening
                    </p>
                </div>

                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Pending Reviews</div>
                        <div className="stat-value text-secondary">0</div>
                        <div className="stat-desc">Candidates awaiting decision</div>
                    </div>
                </div>
            </div>

            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <div className="font-semibold">Company Review Stage</div>
                    <div className="text-sm">
                        These candidates have been pre-screened and approved by recruiters.
                        Review their profiles and make your final hiring decision.
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <GateReviewList
                        gateType="company"
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    );
}

export default function CompanyGateReviewsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        }>
            <CompanyGateReviewsContent />
        </Suspense>
    );
}
