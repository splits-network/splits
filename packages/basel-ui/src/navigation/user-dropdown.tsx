"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserDropdownMenuItem {
    href: string;
    icon: string;
    label: string;
    description?: string;
}

export interface UserDropdownRole {
    /** Display text, e.g. "Recruiter", "Candidate", "Administrator" */
    label: string;
    /** FontAwesome icon class (without fa-duotone prefix), e.g. "fa-user-tie" */
    icon?: string;
}

export interface UserDropdownProps {
    /** User display name */
    userName: string;
    /** User email (optional, shown below name) */
    userEmail?: string;
    /** Two-letter initials for avatar fallback */
    userInitials: string;
    /** URL to user avatar image (optional) */
    userImageUrl?: string;
    /** User role badge */
    role?: UserDropdownRole;
    /** Navigation items in the dropdown */
    menuItems: UserDropdownMenuItem[];
    /** Called when sign-out is clicked */
    onSignOut: () => void | Promise<void>;
    /** Optional: render a custom Link component (for Next.js Link). Falls back to <a>. */
    renderLink?: (props: {
        href: string;
        onClick?: () => void;
        className: string;
        children: React.ReactNode;
    }) => React.ReactNode;
    /** Override avatar bg/text classes (default: "bg-primary text-primary-content") */
    avatarClassName?: string;
    /** Override role badge classes (default: "bg-primary/10 text-primary") */
    badgeClassName?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Basel Design System — User Dropdown
 *
 * Editorial-style user menu following the Split-Screen Editorial header pattern.
 * Uses DaisyUI semantic tokens only. Sharp corners, subtle shadows, clean typography.
 *
 * @see showcase/headers/one for the reference design
 */
export function UserDropdown({
    userName,
    userEmail,
    userInitials,
    userImageUrl,
    role,
    menuItems,
    onSignOut,
    renderLink,
    avatarClassName = "bg-primary text-primary-content",
    badgeClassName = "bg-primary/10 text-primary",
}: UserDropdownProps) {
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
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        setIsOpen(false);
        await onSignOut();
    };

    const handleItemClick = () => {
        setIsOpen(false);
    };

    // Link renderer — uses Next.js Link if provided, falls back to <a>
    const LinkComponent = ({
        href,
        onClick,
        className,
        children,
    }: {
        href: string;
        onClick?: () => void;
        className: string;
        children: React.ReactNode;
    }) => {
        if (renderLink) {
            return <>{renderLink({ href, onClick, className, children })}</>;
        }
        return (
            <a href={href} onClick={onClick} className={className}>
                {children}
            </a>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── Trigger ──────────────────────────────────────── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1 hover:bg-base-200 transition-colors cursor-pointer"
            >
                <div className={`w-8 h-8 ${avatarClassName} flex items-center justify-center font-bold text-xs overflow-hidden`}>
                    {userImageUrl ? (
                        <img
                            src={userImageUrl}
                            alt={userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        userInitials
                    )}
                </div>
                <div className="hidden md:block text-left">
                    <div className="text-xs font-bold leading-tight">
                        {userName}
                    </div>
                    {role && (
                        <div className="text-[10px] text-base-content/50">
                            {role.label}
                        </div>
                    )}
                </div>
                <i
                    className={`fa-solid fa-chevron-down text-[8px] text-base-content/40 hidden md:block transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* ── Dropdown Panel ────────────────────────────────── */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-base-100 border border-base-300 shadow-lg py-2 z-[100]">
                    {/* User header */}
                    <div className="px-4 py-3 border-b border-base-300">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${avatarClassName} flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden`}>
                                {userImageUrl ? (
                                    <img
                                        src={userImageUrl}
                                        alt={userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    userInitials
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold truncate">
                                    {userName}
                                </div>
                                {userEmail && (
                                    <div className="text-[11px] text-base-content/50 truncate mt-0.5">
                                        {userEmail}
                                    </div>
                                )}
                                {role && (
                                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClassName}`}>
                                        {role.icon && (
                                            <i
                                                className={`fa-duotone fa-regular ${role.icon} text-[9px]`}
                                            />
                                        )}
                                        {role.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {menuItems.map((item) => (
                            <LinkComponent
                                key={item.href}
                                href={item.href}
                                onClick={handleItemClick}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
                            >
                                <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                    <i
                                        className={`${item.icon} text-primary text-xs`}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">
                                        {item.label}
                                    </div>
                                    {item.description && (
                                        <div className="text-[11px] text-base-content/50">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </LinkComponent>
                        ))}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-base-300 pt-1">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error/70 hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right-from-bracket text-xs w-4 text-center" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
