'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { PageTitle } from '@/components/page-title';
import { TrendPeriodSelector } from '@/components/charts/trend-period-selector';
import CandidateDashboard from './components/candidate-dashboard';

export default function DashboardPage() {
    const { user } = useUser();
    const [trendPeriod, setTrendPeriod] = useState(6);

    return (
        <>
            <PageTitle
                title={`Welcome back, ${user?.firstName || 'there'}!`}
                subtitle="Here's an overview of your job search"
            >
                <TrendPeriodSelector
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
                <div className="hidden lg:block w-px h-6 bg-base-300" />
                <Link href="/public/jobs" className="btn btn-primary btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-search w-3.5"></i>
                    Browse Jobs
                </Link>
                <Link href="/portal/profile" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-user w-3.5"></i>
                    My Profile
                </Link>
                <Link href="/portal/documents" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-file-lines w-3.5"></i>
                    Documents
                </Link>
            </PageTitle>
            <CandidateDashboard
                trendPeriod={trendPeriod}
                onTrendPeriodChange={setTrendPeriod}
            />
        </>
    );
}
