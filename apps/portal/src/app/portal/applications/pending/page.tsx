import { Suspense } from 'react';
import PendingApplicationsClient from './pending-applications-client';

export default function PendingApplicationsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-center min-h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        }>
            <PendingApplicationsClient />
        </Suspense>
    );
}
