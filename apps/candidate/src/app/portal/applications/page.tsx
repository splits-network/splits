import { Suspense } from 'react';
import ApplicationsClient from './components/applications-client';

// Loading component for Suspense fallback
function ApplicationsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="h-10 w-64 bg-base-300 animate-pulse rounded mb-2"></div>
                <div className="h-6 w-96 bg-base-300 animate-pulse rounded"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="h-16 bg-base-300 animate-pulse rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    );
}

export default function ApplicationsPage() {
    return (
        <Suspense fallback={<ApplicationsLoading />}>
            <div className="space-y-6">
                <ApplicationsClient />
            </div>
        </Suspense>
    );
}
