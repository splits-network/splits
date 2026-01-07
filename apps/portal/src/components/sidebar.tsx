'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserProfile } from '@/contexts';
import { useClerk, useUser } from '@clerk/nextjs';
import { useState, useEffect, useMemo } from 'react';
import NotificationBell from './notification-bell';

interface NavItem {
    href: string;
    label: string;
    icon: string;
    roles: string[];
    section?: 'main' | 'management' | 'settings';
    badge?: number;
}

// Navigation items organized by section
const navItems: NavItem[] = [
    // Main section
    { href: '/portal/dashboard', label: 'Dashboard', icon: 'fa-house', roles: ['all'], section: 'main' },
    { href: '/portal/roles', label: 'Roles', icon: 'fa-briefcase', roles: ['all'], section: 'management' },

    // Management section (recruiter/company focused)
    { href: '/portal/invitations', label: 'Invitations', icon: 'fa-envelope', roles: ['recruiter'], section: 'management' },
    { href: '/portal/candidates', label: 'Candidates', icon: 'fa-users', roles: ['recruiter', 'platform_admin'], section: 'management' },
    { href: '/portal/applications', label: 'Applications', icon: 'fa-file-lines', roles: ['company_admin', 'hiring_manager', 'recruiter'], section: 'management' },
    { href: '/portal/placements', label: 'Placements', icon: 'fa-trophy', roles: ['recruiter', 'platform_admin'], section: 'management' },

    // Settings section
    { href: '/portal/profile', label: 'Profile', icon: 'fa-user', roles: ['recruiter', 'company_admin', 'hiring_manager'], section: 'settings' },
    { href: '/portal/billing', label: 'Billing', icon: 'fa-credit-card', roles: ['all'], section: 'settings' },
    { href: '/portal/company/settings', label: 'Company Settings', icon: 'fa-building', roles: ['company_admin', 'hiring_manager'], section: 'settings' },
    { href: '/portal/company/team', label: 'Team', icon: 'fa-user-group', roles: ['company_admin', 'hiring_manager'], section: 'settings' },
];

const adminNavItems: NavItem[] = [
    { href: '/portal/admin', label: 'Admin Dashboard', icon: 'fa-gauge-high', roles: ['platform_admin'], section: 'main' },
];

function NavItem({ item, isActive, badge }: { item: NavItem; isActive: boolean; badge?: number }) {
    return (
        <Link
            href={item.href}
            className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                transition-all duration-200 mb-0.5
                ${isActive
                    ? 'bg-base-100 text-primary font-medium'
                    : 'text-base-content/70 hover:bg-base-200/70 hover:text-base-content'
                }
            `}
        >
            {/* Active indicator bar */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}

            <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive
                ? 'bg-primary text-primary-content'
                : 'bg-base-200/50 text-base-content/60 group-hover:bg-base-300/70 group-hover:text-base-content'
                }`}>
                <i className={`fa-solid ${item.icon} text-sm`}></i>
            </span>

            <span className="flex-1">{item.label}</span>

            {/* Badge for counts */}
            {badge !== undefined && badge > 0 && (
                <span className="badge badge-sm badge-primary">{badge > 99 ? '99+' : badge}</span>
            )}
        </Link>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="px-3 pt-4 pb-2">
            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                {title}
            </span>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();
    const { signOut } = useClerk();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    // Badge counts (could be fetched from API)
    const [badges, setBadges] = useState<Record<string, number>>({});
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Sync state with pre-rendered theme from localStorage
        try {
            const saved = localStorage.getItem('theme') || 'splits-light';
            setIsDark(saved === 'splits-dark');
        } catch { }
    }, []);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked;
        const theme = checked ? 'splits-dark' : 'splits-light';
        document.documentElement.setAttribute('data-theme', theme);
        setIsDark(checked);
        try {
            localStorage.setItem('theme', theme);
        } catch { }
    };

    // Filter items based on user role
    const filterByRole = (item: NavItem) => {
        if (item.roles.includes('all')) return true;
        if (isAdmin) return true;
        if (isRecruiter && item.roles.includes('recruiter')) return true;
        if (isCompanyUser && (item.roles.includes('company_admin') || item.roles.includes('hiring_manager'))) return true;
        return false;
    };

    // Group items by section
    const groupedItems = useMemo(() => {
        const filtered = navItems.filter(filterByRole);
        return {
            main: filtered.filter(i => i.section === 'main'),
            management: filtered.filter(i => i.section === 'management'),
            settings: filtered.filter(i => i.section === 'settings'),
        };
    }, [isAdmin, isRecruiter, isCompanyUser]);

    // Get user initials for avatar
    const userInitials = useMemo(() => {
        if (!user) return '?';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || '?';
    }, [user]);

    // Get role display text
    const roleDisplay = useMemo(() => {
        if (isAdmin) return 'Administrator';
        if (isRecruiter && isCompanyUser) return 'Recruiter & Company';
        if (isRecruiter) return 'Recruiter';
        if (isCompanyUser) return 'Company User';
        return 'User';
    }, [isAdmin, isRecruiter, isCompanyUser]);

    return (
        <>
            <div className="drawer-side z-40 overflow-visible hidden md:block">
                <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
                <aside className="bg-base-300 w-64 min-h-screen flex flex-col border-r border-base-200">

                    {/* Logo / Brand */}
                    <div className="px-4 py-5 border-b border-base-200/50">
                        <Link href="/" className="">
                            <img src="/logo.svg" alt="Applicant Network" className="h-12" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
                        {/* Main Section */}
                        {groupedItems.main.length > 0 && (
                            <div>
                                {groupedItems.main.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href))}
                                        badge={badges[item.href]}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Management Section */}
                        {groupedItems.management.length > 0 && (
                            <div>
                                <SectionHeader title="Management" />
                                {groupedItems.management.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={pathname === item.href || pathname.startsWith(item.href)}
                                        badge={badges[item.href]}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Settings Section */}
                        {groupedItems.settings.length > 0 && (
                            <div>
                                <SectionHeader title="Settings" />
                                {groupedItems.settings.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={pathname === item.href || pathname.startsWith(item.href)}
                                        badge={badges[item.href]}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Admin Section */}
                        {isAdmin && adminNavItems.length > 0 && (
                            <div>
                                <SectionHeader title="Platform" />
                                {adminNavItems.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                                    />
                                ))}
                            </div>
                        )}
                    </nav>
                    <div className='flex justify-evenly'>
                        <div className="flex items-center justify-center gap-2 py-2">
                            <i className="fa-solid fa-sun text-yellow-500"></i>
                            <input
                                type="checkbox"
                                checked={isDark}
                                onChange={handleThemeChange}
                                className="toggle"
                                title="Toggle Theme"
                            />
                            <i className="fa-solid fa-moon text-blue-400"></i>
                        </div>
                        <NotificationBell position="right" />
                    </div>
                    {/* User Footer */}
                    <div className="border-t border-base-200/50 p-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                            <div className="avatar avatar-placeholder">
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    {user?.imageUrl ? (
                                        <img src={user.imageUrl} alt="" className="rounded-full" />
                                    ) : (
                                        userInitials
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-base-content truncate">
                                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                                </p>
                                <p className="text-xs text-base-content/50 truncate">
                                    {roleDisplay}
                                </p>
                            </div>
                            <details className="dropdown dropdown-top dropdown-right">
                                <summary className="btn btn-ghost btn-sm px-2">
                                    <i className="fa-solid fa-ellipsis-vertical text-base-content/60"></i>
                                </summary>
                                <ul className="dropdown-content menu bg-base-100 rounded-box shadow p-2 w-56 z-[1]">
                                    <li>
                                        <Link href="/portal/profile" className="justify-between">
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-user text-base-content/70"></i>
                                                Profile
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/portal/billing" className="justify-between">
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-credit-card text-base-content/70"></i>
                                                Billing
                                            </span>
                                        </Link>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => signOut()}
                                            className="text-error"
                                        >
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                                Sign out
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </details>
                        </div>
                    </div>
                </aside>
            </div>
            {/* Mobile Dock - visible only on small screens */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50">
                <div className="dock bg-base-100 border-t border-base-200">
                    {(() => {
                        const dockConfigHrefs = ['/portal/dashboard', '/portal/roles', '/portal/applications', '/portal/candidates'];
                        const dockItems = navItems
                            .filter((i) => dockConfigHrefs.includes(i.href))
                            .filter(filterByRole);
                        const isItemActive = (href: string) => href === '/portal/dashboard'
                            ? pathname === href
                            : pathname === href || pathname.startsWith(`${href}/`);
                        return dockItems.map((item) => (
                            <button
                                key={item.href}
                                type="button"
                                onClick={() => router.push(item.href)}
                                className={isItemActive(item.href) ? 'dock-active' : ''}
                                title={item.label}
                            >
                                <i className={`fa-solid ${item.icon}`}></i>
                                <span className="dock-label">{item.label}</span>
                            </button>
                        ));
                    })()}
                    {/* Menu button for additional options */}
                    <details className="dropdown dropdown-top">
                        <summary className="dock-label dock" role="button" tabIndex={0}>
                            <i className="fa-solid fa-ellipsis"></i>
                            <span className="dock-label">Menu</span>
                        </summary>
                        <ul className="dropdown-content menu bg-base-100 rounded-box shadow p-2 w-56 z-[1]">
                            <li>
                                <Link href="/portal/profile" className="justify-between">
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-user text-base-content/70"></i>
                                        Profile
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/portal/billing" className="justify-between">
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-credit-card text-base-content/70"></i>
                                        Billing
                                    </span>
                                </Link>
                            </li>
                            {isCompanyUser && (
                                <>
                                    <li>
                                        <Link href="/portal/company/settings" className="justify-between">
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-building text-base-content/70"></i>
                                                Company Settings
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/portal/company/team" className="justify-between">
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-user-group text-base-content/70"></i>
                                                Team
                                            </span>
                                        </Link>
                                    </li>
                                </>
                            )}
                            <div className="divider my-1"></div>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => signOut()}
                                    className="text-error"
                                >
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                        Sign out
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </details>
                </div>
            </div>
        </>
    );
}
