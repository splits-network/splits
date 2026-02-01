"use client";

import Link from "next/link";

const navLinks = [
    { label: "For Recruiters", href: "#for-recruiters" },
    { label: "For Candidates", href: "#for-candidates" },
    { label: "For Companies", href: "#for-companies" },
    { label: "FAQ", href: "#contact" },
];

export function Header() {
    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    return (
        <header className="navbar bg-base-100/95 backdrop-blur-sm border-b border-base-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="Employment Networks"
                            className="h-12"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) =>
                                    handleSmoothScroll(e, link.href)
                                }
                                className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors rounded-lg hover:bg-base-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <a
                        href="https://splits.network"
                        className="hidden md:inline-flex btn btn-ghost btn-sm font-medium"
                    >
                        Recruiter Login
                    </a>
                    <a
                        href="https://applicant.network"
                        className="btn btn-primary btn-sm font-medium"
                    >
                        <span className="hidden sm:inline">Find Jobs</span>
                        <span className="sm:hidden">Jobs</span>
                    </a>

                    {/* Mobile menu */}
                    <div className="dropdown dropdown-end lg:hidden">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            <i className="fa-duotone fa-regular fa-bars text-lg"></i>
                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-200"
                        >
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        onClick={(e) =>
                                            handleSmoothScroll(e, link.href)
                                        }
                                        className="font-medium"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <hr className="my-2" />
                            </li>
                            <li>
                                <a
                                    href="https://splits.network"
                                    className="text-primary font-semibold"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    Recruiter Login
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://applicant.network"
                                    className="text-secondary font-semibold"
                                >
                                    <i className="fa-duotone fa-regular fa-user"></i>
                                    Candidate Portal
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}
