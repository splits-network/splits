'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ACCENT_HEX } from '@splits-network/memphis-ui';

const MENU_ITEMS = [
    {
        href: '/portal/dashboard',
        icon: 'fa-duotone fa-regular fa-house',
        label: 'Dashboard',
        description: 'Overview & activity',
        color: ACCENT_HEX.coral,
    },
    {
        href: '/portal/profile',
        icon: 'fa-duotone fa-regular fa-user-pen',
        label: 'Profile',
        description: 'Manage your account',
        color: ACCENT_HEX.teal,
    },
    {
        href: '/portal/applications',
        icon: 'fa-duotone fa-regular fa-file-lines',
        label: 'Applications',
        description: 'Track your progress',
        color: ACCENT_HEX.yellow,
    },
    {
        href: '/portal/documents',
        icon: 'fa-duotone fa-regular fa-folder-open',
        label: 'Documents',
        description: 'Resumes & files',
        color: ACCENT_HEX.purple,
    },
];

export default function UserDropdown() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut({ redirectUrl: '/' });
    };

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
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
            >
                <div
                    className="w-9 h-9 flex items-center justify-center border-container text-[10px] font-black overflow-hidden"
                    style={{
                        borderColor: ACCENT_HEX.teal,
                        backgroundColor: user.imageUrl ? 'transparent' : ACCENT_HEX.teal,
                        color: user.imageUrl ? 'var(--color-cream)' : 'var(--color-dark)',
                    }}
                >
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        userInitials
                    )}
                </div>
                <i
                    className={`fa-solid fa-chevron-down text-[8px] text-cream/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 border-container border-teal z-[100] bg-dark"
                    style={{ minWidth: '288px' }}
                >
                    {/* User header */}
                    <div className="p-4 border-b-4 border-dark-gray">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 flex items-center justify-center border-container text-sm font-black flex-shrink-0 overflow-hidden"
                                style={{
                                    borderColor: ACCENT_HEX.yellow,
                                    backgroundColor: user.imageUrl ? 'transparent' : ACCENT_HEX.yellow,
                                    color: user.imageUrl ? 'var(--color-cream)' : 'var(--color-dark)',
                                }}
                            >
                                {user.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt={userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    userInitials
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-black uppercase tracking-wide truncate text-white">
                                    {userName}
                                </div>
                                {userEmail && (
                                    <div className="text-[10px] truncate mt-0.5 text-cream/40">
                                        {userEmail}
                                    </div>
                                )}
                                <div className="mt-1.5">
                                    <span
                                        className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border-interactive"
                                        style={{ borderColor: ACCENT_HEX.yellow, color: ACCENT_HEX.yellow }}
                                    >
                                        <i className="fa-duotone fa-regular fa-user text-[8px]" />
                                        Candidate
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 transition-all hover:translate-x-1 border-l-4 border-transparent"
                                onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = item.color; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}
                            >
                                <div
                                    className="w-8 h-8 flex items-center justify-center border-interactive flex-shrink-0"
                                    style={{ borderColor: item.color }}
                                >
                                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wide text-white">
                                        {item.label}
                                    </div>
                                    <div className="text-[10px] text-cream/40">
                                        {item.description}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Sign out */}
                    <div className="p-2 border-t-4 border-dark-gray">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2.5 transition-all hover:translate-x-1 cursor-pointer border-l-4 border-transparent hover:border-coral"
                        >
                            <div className="w-8 h-8 flex items-center justify-center border-interactive border-coral flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-right-from-bracket text-sm text-coral" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wide text-coral">
                                Sign Out
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
