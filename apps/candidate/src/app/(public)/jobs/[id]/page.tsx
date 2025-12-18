import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatSalary, formatDate } from '@/lib/utils';

// Mock data - will be replaced with API calls
const mockJob = {
  id: '1',
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  company_description: 'A leading technology company building the future of software.',
  location: 'San Francisco, CA',
  salary_min: 150000,
  salary_max: 200000,
  type: 'Full-time',
  remote: true,
  posted_at: '2025-12-15',
  description: `We are seeking a talented Senior Software Engineer to join our growing team. 

In this role, you will:
- Design and build scalable backend systems
- Mentor junior engineers
- Collaborate with product and design teams
- Write clean, maintainable code
- Participate in code reviews and technical discussions

This is an excellent opportunity to work on challenging problems with a talented team.`,
  requirements: `Required:
- 5+ years of software engineering experience
- Strong proficiency in TypeScript/Node.js
- Experience with modern web frameworks (React, Next.js)
- Understanding of database design and optimization
- Excellent communication skills

Preferred:
- Experience with microservices architecture
- Knowledge of cloud platforms (AWS, GCP)
- Open source contributions
- Startup experience`,
  benefits: `- Competitive salary and equity
- Health, dental, and vision insurance
- 401(k) matching
- Flexible work schedule
- Remote-friendly culture
- Professional development budget
- Unlimited PTO`,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // TODO: Replace with API call
  // const job = await apiClient.get(`/jobs/${id}`);
  const job = mockJob;

  if (!job) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link href="/jobs" className="btn btn-ghost mb-6">
        <i className="fa-solid fa-arrow-left"></i>
        Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
          <h2 className="text-2xl font-semibold mb-4">{job.company}</h2>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="badge badge-lg">
              <i className="fa-solid fa-location-dot mr-2"></i>
              {job.location}
            </div>
            <div className="badge badge-lg">
              <i className="fa-solid fa-briefcase mr-2"></i>
              {job.type}
            </div>
            {job.remote && (
              <div className="badge badge-lg badge-success">
                <i className="fa-solid fa-house mr-2"></i>
                Remote
              </div>
            )}
            <div className="badge badge-lg">
              <i className="fa-solid fa-calendar mr-2"></i>
              Posted {formatDate(job.posted_at)}
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/70 mb-1">Salary Range</p>
              <p className="text-2xl font-bold text-primary">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/sign-up" className="btn btn-primary btn-lg">
                <i className="fa-solid fa-paper-plane"></i>
                Apply Now
              </Link>
              <button className="btn btn-outline btn-lg">
                <i className="fa-solid fa-bookmark"></i>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Company */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <i className="fa-solid fa-building"></i>
            About {job.company}
          </h3>
          <p className="whitespace-pre-line">{job.company_description}</p>
        </div>
      </div>

      {/* Job Description */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <i className="fa-solid fa-file-lines"></i>
            Job Description
          </h3>
          <p className="whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <i className="fa-solid fa-list-check"></i>
            Requirements
          </h3>
          <p className="whitespace-pre-line">{job.requirements}</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <i className="fa-solid fa-gift"></i>
            Benefits
          </h3>
          <p className="whitespace-pre-line">{job.benefits}</p>
        </div>
      </div>

      {/* Apply CTA */}
      <div className="card bg-primary text-white shadow-lg">
        <div className="card-body text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Apply?
          </h3>
          <p className="mb-6">
            Create an account to apply with one click and track your application.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up" className="btn btn-lg bg-white text-primary hover:bg-gray-100">
              <i className="fa-solid fa-user-plus"></i>
              Create Account
            </Link>
            <Link href="/sign-in" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">
              <i className="fa-solid fa-right-to-bracket"></i>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
