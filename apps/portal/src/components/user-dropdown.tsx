"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";

export function UserDropdown() {
    const { user } = useUser();
    const { logout } = useUserProfile();
    const router = useRouter();
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
        await logout();
        router.refresh();
        router.push("/");
    };

    if (!user) return null;

    const userInitials =
        user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            : user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "?";

    const rawUserName =
        user.fullName || user.emailAddresses[0]?.emailAddress || "User";
    const userName =
        rawUserName.length > 20 ? `${rawUserName.slice(0, 20)}…` : rawUserName;
    const rawUserEmail = user.emailAddresses[0]?.emailAddress;
    const userEmail = rawUserEmail
        ? rawUserEmail.length > 20
            ? `${rawUserEmail.slice(0, 20)}…`
            : rawUserEmail
        : undefined;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                {userName && (
                    <span className="hidden md:inline text-sm font-medium text-base-content">
                        {userName}
                    </span>
                )}
                {user.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-sm">
                        {userInitials}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-base-100 rounded-lg shadow border border-base-200 overflow-hidden z-[100]">
                    <div className="px-4 py-4 border-b border-base-200">
                        <div className="font-semibold text-sm text-base-content">
                            {userName}
                        </div>
                        {userEmail && (
                            <div className="text-sm text-base-content/60 mt-0.5">
                                {userEmail}
                            </div>
                        )}
                    </div>

                    <div className="py-2">
                        <Link
                            href="/portal/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors text-sm text-base-content"
                        >
                            <i className="fa-duotone fa-regular fa-user w-4 text-base-content/60"></i>
                            Profile
                        </Link>
                        <Link
                            href="/portal/billing"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors text-sm text-base-content"
                        >
                            <i className="fa-duotone fa-regular fa-credit-card w-4 text-base-content/60"></i>
                            Billing
                        </Link>
                    </div>

                    <div className="border-t border-base-200 py-2">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-error/10 transition-colors text-sm text-error"
                        >
                            <i className="fa-duotone fa-regular fa-right-from-bracket w-4"></i>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
