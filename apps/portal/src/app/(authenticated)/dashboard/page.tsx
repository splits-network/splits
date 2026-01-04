import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import RecruiterDashboard from './components/recruiter-dashboard';
import CompanyDashboard from './components/company-dashboard';
import AdminDashboard from './components/admin-dashboard';
import { ApiClient } from '@/lib/api-client';

export default async function DashboardPage() {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Fetch user profile to determine persona
    const apiClient = new ApiClient(token);
    let profileData: any = {};
    try {
        const profileResponse = await apiClient.get('/users', { params: { limit: 1 } });
        const profileArray = Array.isArray(profileResponse?.data)
            ? profileResponse.data
            : Array.isArray(profileResponse)
                ? profileResponse
                : [];
        profileData = profileArray[0] || {};
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="alert alert-error max-w-md">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Failed to load dashboard. Please try again.</span>
                </div>
            </div>
        );
    }

    // Determine user role/persona
    const roles: string[] = Array.isArray(profileData.roles) ? profileData.roles : [];
    const isAdmin = Boolean(profileData.is_platform_admin || roles.includes('platform_admin'));
    const isCompanyUser = roles.some((role: string) =>
        role === 'company_admin' || role === 'hiring_manager'
    );

    // Check if user is a recruiter by looking for recruiter profile in network service
    // Recruiters don't need organization memberships - they operate independently
    let isRecruiter = false;
    let recruiterProfile = null;
    if (profileData.recruiter_id) {
        try {
            const recruiterResponse = await apiClient.get(
                `/recruiters/${profileData.recruiter_id}`
            );
            if (recruiterResponse?.data) {
                isRecruiter = true;
                recruiterProfile = recruiterResponse.data;
            }
        } catch (error) {
            console.log('Failed to fetch recruiter profile', error);
        }
    }

    // Route to appropriate dashboard
    if (isAdmin) {
        return <AdminDashboard token={token} profile={profileData} />;
    } else if (isCompanyUser) {
        return <CompanyDashboard token={token} profile={profileData} />;
    } else if (isRecruiter && recruiterProfile) {
        // Pass recruiter profile data to dashboard
        return <RecruiterDashboard token={token} profile={{ ...profileData, recruiter: recruiterProfile }} />;
    }

    // Default: Show onboarding or empty state
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="card bg-base-100 shadow max-w-md">
                <div className="card-body text-center">
                    <i className="fa-solid fa-user-circle text-6xl text-primary mb-4"></i>
                    <h2 className="card-title justify-center">Welcome to Splits Network!</h2>
                    <p className="text-base-content/70">
                        Your account is being set up. Please complete your profile to get started.
                    </p>
                    <div className="card-actions justify-center mt-4">
                        <a href="/profile" className="btn btn-primary">
                            Complete Profile
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
