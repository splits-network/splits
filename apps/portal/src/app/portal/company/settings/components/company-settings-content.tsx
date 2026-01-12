'use client';

import { useUserProfile } from '@/contexts';
import { redirect } from 'next/navigation';
import CompanySettingsForm from './settings-form';

interface CompanySettingsContentProps {
    company: any;
}

export default function CompanySettingsContent({ company }: CompanySettingsContentProps) {
    const { profile, isLoading, isCompanyUser } = useUserProfile();

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (!isCompanyUser || !profile?.organization_ids || profile.organization_ids.length === 0) {
        redirect('/portal/dashboard');
        return null;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Company Settings</h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company profile and preferences
                </p>
            </div>

            <CompanySettingsForm
                company={company}
                organizationId={profile.organization_ids[0]}
            />
        </div>
    );
}
