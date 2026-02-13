import Link from 'next/link';
import UserDropdown from './user-dropdown';

export default function AuthenticatedNav() {
    return (
        <nav className="navbar bg-base-100 shadow">
            <div className="container mx-auto">
                <div className="flex-1">
                    <Link href="/portal/dashboard" className="btn btn-ghost text-xl">
                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                        Applicant Network
                    </Link>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1 gap-2">
                        <li>
                            <Link href="/public/jobs">Browse Jobs</Link>
                        </li>
                        <li>
                            <Link href="/portal/dashboard">
                                <i className="fa-duotone fa-regular fa-house"></i>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/portal/applications">
                                <i className="fa-duotone fa-regular fa-file-lines"></i>
                                Applications
                            </Link>
                        </li>
                        <li>
                            <Link href="/portal/recruiters">
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                My Recruiters
                            </Link>
                        </li>
                        <li>
                            <Link href="/portal/messages">
                                <i className="fa-duotone fa-regular fa-messages"></i>
                                Messages
                            </Link>
                        </li>
                        <li>
                            <Link href="/portal/profile">
                                <i className="fa-duotone fa-regular fa-user"></i>
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/portal/documents">
                                <i className="fa-duotone fa-regular fa-folder"></i>
                                Documents
                            </Link>
                        </li>
                        <li className="ml-4">
                            <UserDropdown />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
