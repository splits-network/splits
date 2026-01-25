'use client';

import Link from 'next/link';

export function Header() {
    return (
        <header className="navbar bg-base-100 border-b border-base-200 shadow-sm sticky top-0 z-50">
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                        <i className="fa-duotone fa-regular fa-bars text-xl"></i>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li><a href="#products">Products</a></li>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <li><hr className="my-2" /></li>
                        <li><a href="https://splits.network" className="text-primary font-semibold">Recruiter Login</a></li>
                        <li><a href="https://applicant.network" className="text-secondary font-semibold">Candidate Portal</a></li>
                    </ul>
                </div>
                <Link href="/" className="btn btn-ghost normal-case p-0 h-auto">
                    <img src="/logo.svg" alt="Employment Networks" className="h-16" />
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal gap-1">
                    <li>
                        <a href="#products" className="hover:text-primary transition-colors">
                            Products
                        </a>
                    </li>
                    <li>
                        <a href="#about" className="hover:text-primary transition-colors">
                            About Us
                        </a>
                    </li>
                    <li>
                        <a href="#contact" className="hover:text-primary transition-colors">
                            Contact
                        </a>
                    </li>
                </ul>
            </div>

            <div className="navbar-end gap-3">
                <a 
                    href="https://splits.network" 
                    className="hidden md:inline-flex btn btn-ghost font-medium"
                >
                    Recruiter Login
                </a>
                <a 
                    href="https://applicant.network" 
                    className="btn btn-primary font-medium"
                >
                    <span className="hidden sm:inline">Candidate Portal</span>
                    <span className="sm:hidden">Apply</span>
                </a>
            </div>
        </header>
    );
}
