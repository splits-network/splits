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
    const profileResponse: any = await apiClient.get('/v2/users', { params: { limit: 1 } });
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
        console.log('[Company Settings] No company membership found, redirecting to dashboard');
        redirect('/dashboard');
    }

    // Fetch company details
    let company = null;
    if (organizationId) {
        try {
            console.log('[Company Settings] Fetching companies for org:', organizationId);
            const companiesResponse: any = await apiClient.get('/v2/companies');
            console.log('[Company Settings] Companies response:', JSON.stringify(companiesResponse, null, 2));
            const companies = companiesResponse?.data || [];
            console.log('[Company Settings] Found companies:', companies.length);
            company = companies.find((c: any) => c.identity_organization_id === organizationId);
            console.log('[Company Settings] Matched company:', company ? company.name : 'NOT FOUND');
        } catch (error) {
            console.error('[Company Settings] Failed to fetch company:', error);
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
