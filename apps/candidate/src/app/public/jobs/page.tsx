import type { Metadata } from 'next';
import { Suspense } from 'react';
import JobsHeader from './components/jobs-header';
import JobsList from './components/jobs-list';

export const metadata: Metadata = {
    title: 'Browse Jobs',
    description: 'Search thousands of open roles and apply with one click on Applicant Network.',
};

export default async function JobsPage() {
    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }>
                <JobsList />
            </Suspense>
        </div>
    );
}
