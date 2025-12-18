import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();

  // Mock data - will be replaced with API calls
  const stats = {
    applications: 12,
    interviews: 3,
    offers: 1,
    savedJobs: 8,
  };

  const recentApplications = [
    {
      id: '1',
      job_title: 'Senior Software Engineer',
      company: 'Tech Corp',
      status: 'Interview Scheduled',
      applied_at: '2025-12-10',
    },
    {
      id: '2',
      job_title: 'Product Manager',
      company: 'Startup Inc',
      status: 'Under Review',
      applied_at: '2025-12-08',
    },
  ];

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
        <div className="card bg-base-100 shadow-lg">
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

        <div className="card bg-base-100 shadow-lg">
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

        <div className="card bg-base-100 shadow-lg">
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

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70 mb-1">Saved Jobs</p>
                <p className="text-3xl font-bold">{stats.savedJobs}</p>
              </div>
              <i className="fa-solid fa-bookmark text-4xl text-info"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">
                <i className="fa-solid fa-clock-rotate-left"></i>
                Recent Applications
              </h2>
              <Link href="/applications" className="link link-primary text-sm">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="p-4 bg-base-200 rounded-lg">
                  <h3 className="font-semibold mb-1">{app.job_title}</h3>
                  <p className="text-sm text-base-content/70 mb-2">
                    {app.company}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary">{app.status}</span>
                    <span className="text-xs text-base-content/70">
                      Applied {app.applied_at}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-lg">
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
                href="/profile"
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
                href="/applications"
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
      <div className="card bg-primary text-white shadow-lg mt-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Complete Your Profile</h2>
          <p className="mb-4">
            A complete profile helps you stand out to employers. You're 60% complete!
          </p>
          <progress className="progress progress-warning w-full mb-4" value="60" max="100"></progress>
          <Link href="/profile" className="btn bg-white text-primary hover:bg-gray-100 w-fit">
            Complete Profile
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
