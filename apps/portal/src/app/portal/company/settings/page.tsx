import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CompanySettingsForm from './components/settings-form';
import { ApiClient } from '@/lib/api-client';

export default async function CompanySettingsPage() {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Fetch user profile
    const apiClient = new ApiClient(token);
    const profileResponse: any = await apiClient.get('/users', { params: { limit: 1 } });
    const profileArray = Array.isArray(profileResponse?.data)
        ? profileResponse.data
        : Array.isArray(profileResponse)
            ? profileResponse
            : [];
    const profile = profileArray[0] || {};

    const roles: string[] = Array.isArray(profile.roles) ? profile.roles : [];
    const hasCompanyRole = roles.some((role) => role === 'company_admin' || role === 'hiring_manager');
    const organizationId = Array.isArray(profile.organization_ids) ? profile.organization_ids[0] : null;

    if (!hasCompanyRole || !organizationId) {
        redirect('/portal/dashboard');
    }

    // Fetch company details
    let company = null;
    if (organizationId) {
        try {
            const companiesResponse: any = await apiClient.get('/companies');
            const companies = companiesResponse?.data || [];
            company = companies.find((c: any) => c.identity_organization_id === organizationId);
        } catch (error) {
            console.error('[Company Settings] Failed to fetch company');
        }
    } else {
        console.log('[Company Settings] No organization ID on membership');
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
                organizationId={organizationId}
            />
        </div>
    );
}
