'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';
import UserDropdown from './user-dropdown';
import NotificationBell from './notification-bell';

export default function Header() {
    const { isSignedIn } = useAuth();
    const [isDark, setIsDark] = useState(false);
    const menuRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        // Sync state with pre-rendered theme from localStorage
        try {
            const saved = localStorage.getItem('theme') || 'applicant-light';
            setIsDark(saved === 'applicant-dark');
        } catch { }
    }, []);

    useEffect(() => {
        // Close other dropdowns when one is opened
        const handleToggle = (e: Event) => {
            const target = e.target as HTMLDetailsElement;
            if (target.tagName === 'DETAILS' && target.open) {
                const allDetails = menuRef.current?.querySelectorAll('details');
                allDetails?.forEach((details) => {
                    if (details !== target && details.open) {
                        details.open = false;
                    }
                });
            }
        };

        // Close dropdowns when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const menu = menuRef.current;

            // Check if click is outside the menu
            if (menu && !menu.contains(target)) {
                const allDetails = menu.querySelectorAll('details[open]');
                allDetails.forEach((details) => {
                    details.removeAttribute('open');
                });
            }
        };

        const menu = menuRef.current;
        menu?.addEventListener('toggle', handleToggle, true);
        document.addEventListener('click', handleClickOutside);

        return () => {
            menu?.removeEventListener('toggle', handleToggle, true);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked;
        const theme = checked ? 'applicant-dark' : 'applicant-light';
        document.documentElement.setAttribute('data-theme', theme);
        setIsDark(checked);
        try {
            localStorage.setItem('theme', theme);
        } catch { }
    };

    const closeAllDropdowns = () => {
        const allDetails = menuRef.current?.querySelectorAll('details');
        allDetails?.forEach((details) => {
            details.open = false;
        });
    };

    const jobCategories = [
        { name: 'Engineering', icon: 'code', count: '2.3K' },
        { name: 'Sales', icon: 'handshake', count: '1.8K' },
        { name: 'Marketing', icon: 'bullhorn', count: '1.2K' },
        { name: 'Design', icon: 'palette', count: '890' },
        { name: 'Product', icon: 'lightbulb', count: '760' },
        { name: 'Customer Success', icon: 'headset', count: '540' },
    ];

    return (
        <header className="navbar bg-base-100 shadow sticky top-0 z-50">
            {/* Start: Brand + Mobile menu */}
            <div className="navbar-start ps-4">
                <div className="dropdown lg:hidden">
                    <label tabIndex={0} className="btn btn-ghost">
                        <i className="fa-solid fa-bars"></i>
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link href="/public/jobs">Find Jobs</Link></li>
                        <li><Link href="/marketplace">Find a Recruiter</Link></li>
                        <li><Link href="/how-it-works">How It Works</Link></li>
                        <li><Link href="/resources">Resources</Link></li>
                        <li><Link href="/companies">Companies</Link></li>
                        {isSignedIn && (
                            <>
                                <li className="menu-title mt-2">My Account</li>
                                <li><Link href="/portal/dashboard">Dashboard</Link></li>
                                <li><Link href="/portal/application">Applications</Link></li>
                                <li><Link href="/portal/profile">Profile</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <Link href="/" className="">
                    <img src="/logo.svg" alt="Applicant Network" className="h-12" />
                </Link>
            </div>

            {/* Center: Desktop mega menus */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-1" ref={menuRef}>
                    <li><Link href="/how-it-works">How It Works</Link></li>

                    {/* Jobs Mega Dropdown */}
                    <li>
                        <details>
                            <summary>Jobs</summary>
                            <ul className="p-6 bg-base-100 shadow border border-base-300 rounded-box min-w-[600px] z-50">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-sm mb-3 text-base-content/60">BROWSE BY CATEGORY</h3>
                                        <ul className="space-y-2">
                                            {jobCategories.map((cat) => (
                                                <li key={cat.name}>
                                                    <Link
                                                        href={`/jobs?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                                                        className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg transition-colors group"
                                                        onClick={closeAllDropdowns}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <i className={`fa-solid fa-${cat.icon} text-primary group-hover:scale-110 transition-transform`}></i>
                                                            <span>{cat.name}</span>
                                                        </div>
                                                        <span className="badge badge-ghost badge-sm">{cat.count}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm mb-3 text-base-content/60">POPULAR SEARCHES</h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <Link href="/public/jobs?remote=true" className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                    <i className="fa-solid fa-house-laptop text-secondary"></i>
                                                    Remote Jobs
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/public/jobs?level=director" className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                    <i className="fa-solid fa-user-tie text-accent"></i>
                                                    Director Roles
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/public/jobs?salary_min=100000" className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                    <i className="fa-solid fa-dollar-sign text-success"></i>
                                                    $100K+ Salary
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/public/jobs?type=full_time" className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                    <i className="fa-solid fa-briefcase text-info"></i>
                                                    Full-Time Positions
                                                </Link>
                                            </li>
                                        </ul>
                                        <div className="mt-4 pt-4 border-t border-base-300">
                                            <Link href="/public/jobs" className="btn btn-primary btn-sm btn-block" onClick={closeAllDropdowns}>
                                                View All Jobs <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                        </details>
                    </li>

                    {/* Resources Mega Dropdown */}
                    <li>
                        <details>
                            <summary>Resources</summary>
                            <ul className="p-6 bg-base-100 shadow border border-base-300 rounded-box min-w-[500px] z-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <li>
                                            <Link href="/resources/career-guides" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-book text-primary text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Career Guides</div>
                                                    <div className="text-xs text-base-content/60">Expert advice for your journey</div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/resources/salary-insights" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-chart-line text-success text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Salary Insights</div>
                                                    <div className="text-xs text-base-content/60">Know your worth</div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/resources/interview-prep" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-user-tie text-secondary text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Interview Prep</div>
                                                    <div className="text-xs text-base-content/60">Ace your next interview</div>
                                                </div>
                                            </Link>
                                        </li>
                                    </div>
                                    <div className="space-y-1">
                                        <li>
                                            <Link href="/resources/success-stories" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-star text-warning text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Success Stories</div>
                                                    <div className="text-xs text-base-content/60">Real candidate experiences</div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/resources/resume-tips" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-file-alt text-info text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Resume Tips</div>
                                                    <div className="text-xs text-base-content/60">Stand out from the crowd</div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/resources/industry-trends" className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                                <i className="fa-solid fa-trending-up text-accent text-lg mt-1"></i>
                                                <div>
                                                    <div className="font-semibold">Industry Trends</div>
                                                    <div className="text-xs text-base-content/60">Stay ahead of the curve</div>
                                                </div>
                                            </Link>
                                        </li>
                                    </div>
                                </div>
                            </ul>
                        </details>
                    </li>

                    {/* Recruiters/Marketplace Link */}
                    <li>
                        <Link href="/marketplace" className="flex items-center gap-2">
                            <i className="fa-solid fa-users text-primary"></i>
                            Find a Recruiter
                        </Link>
                    </li>

                    {/* Companies Mega Dropdown */}
                    <li>
                        <details>
                            <summary>Companies</summary>
                            <ul className="p-6 bg-base-100 shadow border border-base-300 rounded-box min-w-[450px] z-50">
                                <h3 className="font-bold text-sm mb-3 text-base-content/60">EXPLORE COMPANIES</h3>
                                <div className="space-y-1">
                                    <li>
                                        <Link href="/companies" className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                            <i className="fa-solid fa-building text-primary text-lg"></i>
                                            <div>
                                                <div className="font-semibold">Browse All Companies</div>
                                                <div className="text-xs text-base-content/60">Discover top employers</div>
                                            </div>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/companies/featured" className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                            <i className="fa-solid fa-crown text-warning text-lg"></i>
                                            <div>
                                                <div className="font-semibold">Featured Employers</div>
                                                <div className="text-xs text-base-content/60">Companies actively hiring</div>
                                            </div>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/companies/reviews" className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg" onClick={closeAllDropdowns}>
                                            <i className="fa-solid fa-star text-success text-lg"></i>
                                            <div>
                                                <div className="font-semibold">Company Reviews</div>
                                                <div className="text-xs text-base-content/60">See what others say</div>
                                            </div>
                                        </Link>
                                    </li>
                                </div>
                                <div className="divider my-4"></div>
                                <h3 className="font-bold text-sm mb-3 text-base-content/60">FOR EMPLOYERS</h3>
                                <li>
                                    <Link href="/for-recruiters" className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg bg-primary/5 border border-primary/20" onClick={closeAllDropdowns}>
                                        <i className="fa-solid fa-user-tie text-primary text-lg"></i>
                                        <div>
                                            <div className="font-semibold">Hire Great Talent</div>
                                            <div className="text-xs text-base-content/60">Partner with expert recruiters</div>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>

            {/* End: Actions + Theme toggle */}
            <div className="navbar-end gap-2 items-center pe-4">
                <label className="swap swap-rotate cursor-pointer btn btn-ghost btn-circle" title="Toggle Theme">
                    <input
                        type="checkbox"
                        checked={isDark}
                        onChange={handleThemeChange}
                        className="theme-controller"
                    />
                    <i className="fa-solid fa-sun swap-off text-xl"></i>
                    <i className="fa-solid fa-moon swap-on text-xl"></i>
                </label>

                {isSignedIn ? (
                    <>
                        <Link href="/portal/dashboard" className="btn btn-ghost xs:btn-circle" title='Dashboard'>
                            <i className="fa-solid fa-gauge text-xl"></i> <span className='hidden md:inline-block'>Dashboard</span>
                        </Link>
                        <NotificationBell />
                        <UserDropdown />
                    </>
                ) : (
                    <>
                        <Link href="/sign-in" className="btn btn-ghost">Sign In</Link>
                        <Link href="/sign-up" className="btn btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </header>
    );
}
