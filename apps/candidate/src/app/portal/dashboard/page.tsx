import { currentUser, auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';

interface DashboardStats {
    applications: number;
    interviews: number;
    offers: number;
    active_relationships: number;
}

interface RecentApplication {
    id: string;
    job_title: string;
    company: string;
    status: string;
    applied_at: string;
}

export default async function DashboardPage() {
    const user = await currentUser();
    const { getToken } = await auth();

    // Fetch real data from API
    let stats: DashboardStats = {
        applications: 0,
        interviews: 0,
        offers: 0,
        active_relationships: 0,
    };
    let recentApplications: RecentApplication[] = [];

    try {
        const token = await getToken();
        if (token) {
            const client = createAuthenticatedClient(token);

            // Fetch applications and calculate stats from them
            const applicationsResponse = await client.get('/applications');
            const allApplications = applicationsResponse.data || [];

            // Calculate stats from applications
            stats.applications = allApplications.length;
            stats.interviews = allApplications.filter((app: any) =>
                app.stage === 'interview' || app.stage === 'final_interview'
            ).length;
            stats.offers = allApplications.filter((app: any) =>
                app.stage === 'offer'
            ).length;

            // Fetch recruiter relationships to get active count
            try {
                const recruitersResponse = await client.get('/recruiter-candidates');
                const relationships = recruitersResponse.data || [];
                stats.active_relationships = relationships.filter((rel: any) =>
                    rel.status === 'active'
                ).length;
            } catch (err) {
                console.error('Failed to load recruiter relationships:', err);
            }

            // Get recent applications (last 5)
            recentApplications = allApplications
                .sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .slice(0, 5)
                .map((app: any) => ({
                    id: app.id,
                    job_title: app.job?.title || 'Unknown Position',
                    company: app.job?.company_name || 'Unknown Company',
                    status: app.stage || 'applied',
                    applied_at: app.created_at,
                }));
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {user?.firstName || 'there'}!
                </h1>
                <p className="text-lg text-base-content/70">
                    Here's an overview of your job search
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/70 mb-1">Applications</p>
                                <p className="text-3xl font-bold">{stats.applications}</p>
                            </div>
                            <i className="fa-solid fa-file-lines text-4xl text-primary"></i>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/70 mb-1">Interviews</p>
                                <p className="text-3xl font-bold">{stats.interviews}</p>
                            </div>
                            <i className="fa-solid fa-calendar-check text-4xl text-success"></i>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/70 mb-1">Offers</p>
                                <p className="text-3xl font-bold">{stats.offers}</p>
                            </div>
                            <i className="fa-solid fa-trophy text-4xl text-warning"></i>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/70 mb-1">Active Recruiters</p>
                                <p className="text-3xl font-bold">{stats.active_relationships}</p>
                            </div>
                            <i className="fa-solid fa-users text-4xl text-info"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                                Recent Applications
                            </h2>
                            <Link href="/portal/application" className="link link-primary text-sm">
                                View All
                            </Link>
                        </div>

                        {recentApplications.length > 0 ? (
                            <div className="space-y-4">
                                {recentApplications.map((app) => (
                                    <Link key={app.id} href={`/portal/application/${app.id}`}>
                                        <div className="p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer">
                                            <h3 className="font-semibold mb-1">{app.job_title}</h3>
                                            <p className="text-sm text-base-content/70 mb-2">
                                                {app.company}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="badge badge-primary">{app.status}</span>
                                                <span className="text-xs text-base-content/70">
                                                    Applied {new Date(app.applied_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-base-content/70">
                                <i className="fa-solid fa-inbox text-4xl mb-2 opacity-30"></i>
                                <p>No applications yet</p>
                                <p className="text-sm mt-1">Start applying to jobs to see them here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <i className="fa-solid fa-bolt"></i>
                            Quick Actions
                        </h2>

                        <div className="space-y-3">
                            <Link
                                href="/jobs"
                                className="btn btn-primary btn-block justify-start"
                            >
                                <i className="fa-solid fa-search"></i>
                                Browse Jobs
                            </Link>
                            <Link
                                href="/portal/profile"
                                className="btn btn-outline btn-block justify-start"
                            >
                                <i className="fa-solid fa-user"></i>
                                Update Profile
                            </Link>
                            <Link
                                href="/documents"
                                className="btn btn-outline btn-block justify-start"
                            >
                                <i className="fa-solid fa-upload"></i>
                                Upload Resume
                            </Link>
                            <Link
                                href="/portal/application"
                                className="btn btn-outline btn-block justify-start"
                            >
                                <i className="fa-solid fa-list"></i>
                                View Applications
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Completion */}
            <div className="card bg-primary text-white shadow mt-6">
                <div className="card-body">
                    <h2 className="card-title mb-4">Complete Your Profile</h2>
                    <p className="mb-4">
                        A complete profile helps you stand out to employers. You're 60% complete!
                    </p>
                    <progress className="progress progress-warning w-full mb-4" value="60" max="100"></progress>
                    <Link href="/portal/profile" className="btn bg-white text-primary hover:bg-gray-100 w-fit">
                        Complete Profile
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
}
