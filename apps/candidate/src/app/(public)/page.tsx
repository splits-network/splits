import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Next Career Opportunity
            </h1>
            <p className="text-xl mb-8">
              Browse thousands of jobs from top employers. Connect with
              recruiters and land your dream role.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/jobs" className="btn btn-lg bg-white text-primary hover:bg-gray-100">
                <i className="fa-solid fa-search"></i>
                Browse Jobs
              </Link>
              <Link href="/sign-up" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">
                <i className="fa-solid fa-user-plus"></i>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Applicant Network?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <i className="fa-solid fa-magnifying-glass text-5xl text-primary mb-4"></i>
                <h3 className="card-title">Easy Job Search</h3>
                <p>
                  Browse thousands of jobs with powerful search and filtering
                  tools. Find exactly what you're looking for.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <i className="fa-solid fa-bolt text-5xl text-primary mb-4"></i>
                <h3 className="card-title">Quick Apply</h3>
                <p>
                  Apply to multiple jobs with one click using your profile.
                  Save time and apply faster.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <i className="fa-solid fa-chart-line text-5xl text-primary mb-4"></i>
                <h3 className="card-title">Track Applications</h3>
                <p>
                  Keep track of all your applications in one place. See status
                  updates and communication history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of candidates finding their dream jobs every day.
          </p>
          <Link href="/sign-up" className="btn btn-lg bg-white text-primary hover:bg-gray-100">
            Create Free Account
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
