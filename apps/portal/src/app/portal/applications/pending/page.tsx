import { Suspense } from 'react';
import Link from 'next/link';
import PendingApplicationsList from './components/pending-list';

export default function PendingApplicationsPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="flex items-center justify-center min-h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pending Applications</h1>
                        <p className="text-base-content/70 mt-1">
                            Review and submit applications from your candidates
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/portal/applications" className="btn btn-ghost gap-2">
                            <i className="fa-duotone fa-regular fa-arrow-left"></i>
                            All Applications
                        </Link>
                    </div>
                </div>

                <PendingApplicationsList />
            </div>
        </Suspense>
    );
}
