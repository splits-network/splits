import Link from 'next/link';

export default function PublicNav() {
  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            <i className="fa-solid fa-briefcase"></i>
            Applicant Network
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/jobs">Browse Jobs</Link>
            </li>
            <li>
              <Link href="/sign-in" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
