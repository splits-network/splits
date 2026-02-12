'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const menuItems = [
    {
        href: '/portal/dashboard',
        icon: 'fa-house',
        label: 'Dashboard',
        description: 'Overview & activity',
    },
    {
        href: '/portal/profile',
        icon: 'fa-user-pen',
        label: 'Profile',
        description: 'Manage your account',
    },
    {
        href: '/portal/applications',
        icon: 'fa-file-lines',
        label: 'Applications',
        description: 'Track your progress',
    },
    {
        href: '/portal/documents',
        icon: 'fa-folder-open',
        label: 'Documents',
        description: 'Resumes & files',
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
                className={`
                    group flex items-center gap-2.5 px-2 py-1.5 rounded-xl
                    transition-all duration-200 cursor-pointer
                    hover:bg-base-200/80
                    ${isOpen ? 'bg-base-200/80' : ''}
                `}
            >
                <div className="relative">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-base-300 group-hover:ring-primary/30 transition-all duration-200"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-xs ring-2 ring-primary/20">
                            {userInitials}
                        </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-base-100" />
                </div>

                <div className="hidden md:flex flex-col leading-tight text-left">
                    <span className="text-sm font-medium text-base-content truncate max-w-[120px]">
                        {user.firstName || userName}
                    </span>
                </div>

                <i
                    className={`
                        fa-duotone fa-regular fa-chevron-down text-[10px] text-base-content/40
                        transition-transform duration-200 hidden md:block
                        ${isOpen ? 'rotate-180' : ''}
                    `}
                />
            </button>

            {/* Dropdown Panel */}
            <div
                className={`
                    absolute right-0 mt-2 w-72 bg-base-100 rounded-2xl shadow-lg
                    border border-base-200 overflow-hidden z-[100]
                    transition-all duration-200 origin-top-right
                    ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                `}
            >
                {/* User Header */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={userName}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-base-300"
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm ring-2 ring-primary/20">
                                    {userInitials}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-base-content truncate">
                                {userName}
                            </div>
                            {userEmail && (
                                <div className="text-xs text-base-content/50 truncate mt-0.5">
                                    {userEmail}
                                </div>
                            )}
                            <div className="mt-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    <i className="fa-duotone fa-regular fa-user text-[10px]"></i>
                                    Candidate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="group/item flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200/70 transition-all duration-150"
                        >
                            <span className="w-8 h-8 rounded-lg bg-base-200/60 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors duration-150">
                                <i className={`fa-duotone fa-regular ${item.icon} text-sm text-base-content/50 group-hover/item:text-primary transition-colors duration-150`}></i>
                            </span>
                            <div>
                                <div className="text-sm font-medium text-base-content">
                                    {item.label}
                                </div>
                                <div className="text-[11px] text-base-content/45">
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Sign Out */}
                <div className="p-2 border-t border-base-200">
                    <button
                        onClick={handleSignOut}
                        className="group/signout flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-error/8 transition-all duration-150"
                    >
                        <span className="w-8 h-8 rounded-lg bg-base-200/60 flex items-center justify-center group-hover/signout:bg-error/10 transition-colors duration-150">
                            <i className="fa-duotone fa-regular fa-right-from-bracket text-sm text-base-content/50 group-hover/signout:text-error transition-colors duration-150"></i>
                        </span>
                        <span className="text-sm font-medium text-base-content group-hover/signout:text-error transition-colors duration-150">
                            Sign out
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
