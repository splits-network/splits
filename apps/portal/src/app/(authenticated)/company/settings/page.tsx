import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CompanySettingsForm from './components/settings-form';

async function fetchFromGateway(endpoint: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
}

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
    const profileResponse: any = await fetchFromGateway('/api/me', token);
    const profile = profileResponse?.data;
    console.log('[Company Settings] Profile:', JSON.stringify(profile, null, 2));

    // Check if user is company admin
    const memberships = profile?.memberships || [];
    console.log('[Company Settings] Memberships:', JSON.stringify(memberships, null, 2));
    const companyMembership = memberships.find((m: any) =>
        ['company_admin', 'hiring_manager'].includes(m.role)
    );
    console.log('[Company Settings] Company membership:', JSON.stringify(companyMembership, null, 2));

    if (!companyMembership) {
        console.log('[Company Settings] No company membership found, redirecting to dashboard');
        redirect('/dashboard');
    }

    // Fetch company details
    let company = null;
    console.log('[Company Settings] Organization ID:', companyMembership.organization_id);
    if (companyMembership.organization_id) {
        try {
            console.log('[Company Settings] Fetching companies for org:', companyMembership.organization_id);
            // First try to get company by organization ID
            const companiesResponse: any = await fetchFromGateway('/api/companies', token);
            console.log('[Company Settings] Companies response:', JSON.stringify(companiesResponse, null, 2));
            const companies = companiesResponse?.data || [];
            console.log('[Company Settings] Found companies:', companies.length);
            company = companies.find((c: any) => c.identity_organization_id === companyMembership.organization_id);
            console.log('[Company Settings] Matched company:', company ? company.name : 'NOT FOUND');
        } catch (error) {
            console.error('[Company Settings] Failed to fetch company:', error);
        }
    } else {
        console.log('[Company Settings] No organization ID on membership');
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Company Settings</h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company profile and preferences
                </p>
            </div>

            <CompanySettingsForm
                company={company}
                organizationId={companyMembership.organization_id}
            />
        </div>
    );
}
