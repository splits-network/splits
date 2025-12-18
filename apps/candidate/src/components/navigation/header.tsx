'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 border-b border-base-300">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <i className="fa-solid fa-bars text-xl"></i>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href="/jobs">Browse Jobs</Link></li>
            {isSignedIn ? (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/applications">Applications</Link></li>
                <li><Link href="/profile">Profile</Link></li>
                <li><Link href="/documents">Documents</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/sign-in">Sign In</Link></li>
                <li><Link href="/sign-up">Get Started</Link></li>
              </>
            )}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          <i className="fa-solid fa-briefcase text-primary"></i>
          <span className="hidden sm:inline">Applicant Network</span>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/jobs">Browse Jobs</Link></li>
          {isSignedIn && (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/applications">Applications</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><Link href="/documents">Documents</Link></li>
            </>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div className="hidden lg:flex gap-2">
            <Link href="/sign-in" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
