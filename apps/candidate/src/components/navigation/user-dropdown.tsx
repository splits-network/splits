'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { UserDropdown as BaselUserDropdown } from '@splits-network/basel-ui';

const MENU_ITEMS = [
    {
        href: '/portal/dashboard',
        icon: 'fa-duotone fa-regular fa-house',
        label: 'Dashboard',
        description: 'Overview & activity',
    },
    {
        href: '/portal/profile',
        icon: 'fa-duotone fa-regular fa-user-pen',
        label: 'Profile',
        description: 'Manage your account',
    },
    {
        href: '/portal/applications',
        icon: 'fa-duotone fa-regular fa-file-lines',
        label: 'Applications',
        description: 'Track your progress',
    },
    {
        href: '/portal/documents',
        icon: 'fa-duotone fa-regular fa-folder-open',
        label: 'Documents',
        description: 'Resumes & files',
    },
];

export default function UserDropdown() {
    const { user } = useUser();
    const { signOut } = useClerk();

    if (!user) return null;

    const userInitials =
        user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            : user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?';

    const rawUserName =
        user.fullName || user.emailAddresses[0]?.emailAddress || 'User';
    const userName =
        rawUserName.length > 30 ? `${rawUserName.slice(0, 30)}…` : rawUserName;
    const rawUserEmail = user.emailAddresses[0]?.emailAddress;
    const userEmail = rawUserEmail
        ? rawUserEmail.length > 30
            ? `${rawUserEmail.slice(0, 30)}…`
            : rawUserEmail
        : undefined;

    return (
        <BaselUserDropdown
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userImageUrl={user.imageUrl}
            role={{ label: 'Candidate', icon: 'fa-user' }}
            menuItems={MENU_ITEMS}
            onSignOut={() => signOut({ redirectUrl: '/' })}
            renderLink={({ href, onClick, className, children }) => (
                <Link href={href} onClick={onClick} className={className}>
                    {children}
                </Link>
            )}
        />
    );
}
