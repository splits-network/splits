'use client';

import Link from 'next/link';
import { PageTitle } from '@/components/page-title';
import { MyRecruitersSection } from '@/components/recruiters/my-recruiters-section';

export default function RecruitersPage() {
    return (
        <>
            <PageTitle
                title="My Recruiters"
                subtitle="View and manage your recruiter relationships"
            >
                <Link href="/public/marketplace" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-store w-3.5"></i>
                    Browse Marketplace
                </Link>
            </PageTitle>
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <MyRecruitersSection />
            </div>
        </>
    );
}
