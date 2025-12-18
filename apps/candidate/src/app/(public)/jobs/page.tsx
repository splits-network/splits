import Link from 'next/link';
import { formatSalary, formatDate } from '@/lib/utils';

// Mock data - will be replaced with API calls
const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    salary_min: 150000,
    salary_max: 200000,
    type: 'Full-time',
    remote: true,
    posted_at: '2025-12-15',
    description: 'Join our engineering team to build amazing products...',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Startup Inc',
    location: 'New York, NY',
    salary_min: 120000,
    salary_max: 160000,
    type: 'Full-time',
    remote: false,
    posted_at: '2025-12-14',
    description: 'Lead product strategy and execution...',
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    salary_min: 90000,
    salary_max: 130000,
    type: 'Full-time',
    remote: true,
    posted_at: '2025-12-13',
    description: 'Create beautiful and intuitive user experiences...',
  },
];

export default async function JobsPage() {
  // TODO: Replace with API call
  // const jobs = await apiClient.get('/jobs');
  const jobs = mockJobs;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Jobs</h1>
        <p className="text-lg text-base-content/70">
          Explore thousands of opportunities from top employers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-200 shadow-lg mb-8">
        <div className="card-body">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="fieldset md:col-span-2">
              <label className="label">Search</label>
              <input
                type="text"
                placeholder="Job title, keywords..."
                className="input w-full"
              />
            </div>
            <div className="fieldset">
              <label className="label">Location</label>
              <input
                type="text"
                placeholder="City, state, or remote"
                className="input w-full"
              />
            </div>
            <div className="fieldset">
              <label className="label">Job Type</label>
              <select className="select w-full">
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary">
              <i className="fa-solid fa-search"></i>
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-base-content/70">
          Showing {jobs.length} jobs
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="card-title text-2xl mb-2">{job.title}</h2>
                  <p className="text-lg font-semibold mb-2">{job.company}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-base-content/70 mb-4">
                    <span>
                      <i className="fa-solid fa-location-dot"></i> {job.location}
                    </span>
                    <span>
                      <i className="fa-solid fa-briefcase"></i> {job.type}
                    </span>
                    {job.remote && (
                      <span>
                        <i className="fa-solid fa-house"></i> Remote
                      </span>
                    )}
                    <span>
                      <i className="fa-solid fa-calendar"></i> Posted {formatDate(job.posted_at)}
                    </span>
                  </div>
                  <p className="line-clamp-2 mb-4">{job.description}</p>
                </div>
                <div className="text-right">
                  <div className="badge badge-primary badge-lg mb-2">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="join">
          <button className="join-item btn">«</button>
          <button className="join-item btn btn-active">1</button>
          <button className="join-item btn">2</button>
          <button className="join-item btn">3</button>
          <button className="join-item btn">»</button>
        </div>
      </div>
    </div>
  );
}
