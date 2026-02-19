"use client";

import type { OnboardingActions, UserRole } from "../types";

interface RoleStepProps {
    selectedRole: UserRole | null;
    actions: OnboardingActions;
}

const ROLES = [
    {
        id: "recruiter" as const,
        title: "I am a Recruiter",
        desc: "Source and place candidates for split-fee commissions. Browse open roles, submit candidates, and track your placements.",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "primary" as const,
        badge: "Most Popular",
        benefits: [
            "Browse open roles from verified companies",
            "Transparent split terms before submitting",
            "Verified placements and tracked payouts",
        ],
    },
    {
        id: "company_admin" as const,
        title: "I am a Company",
        desc: "Post roles to the recruiter marketplace. Set your split terms, review submissions, and manage placements.",
        icon: "fa-duotone fa-regular fa-building",
        color: "secondary" as const,
        benefits: [
            "Wider talent reach through competing recruiters",
            "You set the split terms and fee structure",
            "One dashboard for every role and submission",
        ],
    },
];

export function RoleStep({ selectedRole, actions }: RoleStepProps) {
    const handleSelect = (role: UserRole) => {
        actions.setRole(role);
        if (role === "recruiter") {
            actions.setStep(2);
        } else {
            actions.setStep(3);
        }
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 1
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Welcome to Splits
            </h1>
            <p className="text-base-content/50 mb-8">
                Tell us how you will be using the platform.
            </p>

            <div className="space-y-4">
                {ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    const borderColor =
                        role.color === "primary"
                            ? "border-primary"
                            : "border-secondary";
                    const bgColor =
                        role.color === "primary"
                            ? "bg-primary/5"
                            : "bg-secondary/5";
                    const iconColor =
                        role.color === "primary"
                            ? "text-primary"
                            : "text-secondary";
                    const iconBg =
                        role.color === "primary"
                            ? "bg-primary/10"
                            : "bg-secondary/10";
                    const checkColor =
                        role.color === "primary"
                            ? "text-primary"
                            : "text-secondary";

                    return (
                        <button
                            key={role.id}
                            onClick={() => handleSelect(role.id)}
                            className={`w-full text-left p-6 border-2 transition-all ${
                                isSelected
                                    ? `${borderColor} ${bgColor}`
                                    : "border-base-300 hover:border-base-content/20"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 ${iconBg} flex items-center justify-center flex-shrink-0`}
                                >
                                    <i
                                        className={`${role.icon} ${iconColor} text-xl`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold">
                                            {role.title}
                                        </h3>
                                        {role.badge && (
                                            <span className="badge badge-primary badge-sm text-[10px]">
                                                {role.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-base-content/50 mb-3">
                                        {role.desc}
                                    </p>
                                    <ul className="space-y-1">
                                        {role.benefits.map((b) => (
                                            <li
                                                key={b}
                                                className="flex items-center gap-2 text-xs text-base-content/60"
                                            >
                                                <i className="fa-solid fa-check text-success text-[10px]" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {isSelected && (
                                    <i
                                        className={`fa-solid fa-circle-check ${checkColor} text-lg flex-shrink-0`}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
