"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { getRoleStyle } from "@/lib/utils/color-styles";
import { UserDropdown as BaselUserDropdown } from "@splits-network/basel-ui";

const MENU_ITEMS = [
    {
        href: "/portal/profile",
        icon: "fa-duotone fa-regular fa-user-pen",
        label: "Profile",
        description: "Manage your account",
    },
    {
        href: "/portal/billing",
        icon: "fa-duotone fa-regular fa-credit-card",
        label: "Billing",
        description: "Plans & payments",
    },
];

export function UserDropdown() {
    const { user } = useUser();
    const { logout, isAdmin, isRecruiter, isCompanyUser, isCandidate } =
        useUserProfile();
    const router = useRouter();

    if (!user) return null;

    const userInitials =
        user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            : user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "?";

    const rawUserName =
        user.fullName || user.emailAddresses[0]?.emailAddress || "User";
    const userName =
        rawUserName.length > 30 ? `${rawUserName.slice(0, 30)}...` : rawUserName;
    const rawUserEmail = user.emailAddresses[0]?.emailAddress;
    const userEmail = rawUserEmail
        ? rawUserEmail.length > 30
            ? `${rawUserEmail.slice(0, 30)}...`
            : rawUserEmail
        : undefined;

    const roleDisplay = isAdmin
        ? "Administrator"
        : isRecruiter && isCompanyUser
          ? "Recruiter & Company"
          : isRecruiter
            ? "Recruiter"
            : isCompanyUser
              ? "Company User"
              : isCandidate
                ? "Candidate"
                : "User";

    const roleIcon = isAdmin
        ? "fa-shield-check"
        : isRecruiter
          ? "fa-user-tie"
          : isCompanyUser
            ? "fa-building"
            : isCandidate
              ? "fa-user"
              : "fa-user";

    const roleStyle = getRoleStyle(roleDisplay);

    const handleSignOut = async () => {
        await logout();
        router.refresh();
        router.push("/");
    };

    return (
        <BaselUserDropdown
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userImageUrl={user.imageUrl}
            role={{ label: roleDisplay, icon: roleIcon }}
            menuItems={MENU_ITEMS}
            onSignOut={handleSignOut}
            avatarClassName={`${roleStyle.bg} ${roleStyle.text}`}
            badgeClassName={roleStyle.badgeBg}
            renderLink={({ href, onClick, className, children }) => (
                <Link href={href} onClick={onClick} className={className}>
                    {children}
                </Link>
            )}
        />
    );
}
