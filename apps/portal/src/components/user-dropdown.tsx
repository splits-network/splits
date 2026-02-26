"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { getRoleStyle } from "@/lib/utils/color-styles";
import { UserDropdown as BaselUserDropdown } from "@splits-network/basel-ui";

export function UserDropdown() {
    const { user } = useUser();
    const { logout, isAdmin, isRecruiter, isCompanyUser, isCandidate, hasRole } =
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

    const companyRoleLabel = hasRole("company_admin")
        ? "Company Admin"
        : "Hiring Manager";

    const roleDisplay = isAdmin
        ? "Administrator"
        : isRecruiter && isCompanyUser
          ? `Recruiter & ${companyRoleLabel}`
          : isRecruiter
            ? "Recruiter"
            : isCompanyUser
              ? companyRoleLabel
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

    const menuItems = useMemo(() => {
        const items = [
            {
                href: "/portal/profile",
                icon: "fa-duotone fa-regular fa-user-pen",
                label: "Profile",
                description: "Manage your account",
            },
        ];

        if (isRecruiter) {
            items.push({
                href: "/portal/billing",
                icon: "fa-duotone fa-regular fa-credit-card",
                label: "Billing",
                description: "Plans & payments",
            });
        }

        if (isCompanyUser) {
            items.push({
                href: "/portal/company/settings",
                icon: "fa-duotone fa-regular fa-building-gear",
                label: "Company Settings",
                description: "Manage your company",
            });
        }

        if (isAdmin) {
            items.push({
                href: "/portal/admin",
                icon: "fa-duotone fa-regular fa-gauge-high",
                label: "Admin Dashboard",
                description: "Platform administration",
            });
        }

        return items;
    }, [isRecruiter, isCompanyUser, isAdmin]);

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
            menuItems={menuItems}
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
