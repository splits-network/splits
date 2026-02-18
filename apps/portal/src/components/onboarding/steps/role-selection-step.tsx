"use client";

/**
 * Step 1: Welcome + Role Selection (Memphis Edition)
 * A stunning welcome experience with hero section
 * and rich role cards with benefits, badges, and accent fills.
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useOnboarding } from "../onboarding-provider";
import { UserRole } from "../types";

/** Role card benefit */
interface RoleBenefit {
    text: string;
}

/** Role card definition */
interface RoleCard {
    value: UserRole;
    icon: string;
    title: string;
    tagline: string;
    description: string;
    benefits: RoleBenefit[];
    accentBg: string;
    accentBgLight: string;
    accentBorder: string;
    accentText: string;
    hoverBorder: string;
    badge?: string;
}

const ROLE_CARDS: RoleCard[] = [
    {
        value: "recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Recruiter",
        tagline: "Your Network Just Got Bigger",
        description:
            "Access roles from companies you have never met. Submit candidates, negotiate splits, and get paid — all through one platform built for recruiters who move fast.",
        benefits: [
            { text: "Browse open roles from verified companies" },
            { text: "Transparent split terms before you submit" },
            { text: "Verified placements and tracked payouts" },
        ],
        accentBg: "bg-coral",
        accentBgLight: "bg-coral/10",
        accentBorder: "border-coral",
        accentText: "text-coral",
        hoverBorder: "hover:border-coral",
        badge: "Most Popular",
    },
    {
        value: "company_admin",
        icon: "fa-duotone fa-regular fa-building",
        title: "Company",
        tagline: "Recruiters Compete. You Hire Faster.",
        description:
            "Post roles to a marketplace of vetted recruiters who bring candidates you would never find alone. Set the split, review submissions, and hire — all from one dashboard.",
        benefits: [
            { text: "Wider talent reach through competing recruiters" },
            { text: "You set the split terms and fee structure" },
            { text: "One dashboard for every role and submission" },
        ],
        accentBg: "bg-teal",
        accentBgLight: "bg-teal/10",
        accentBorder: "border-teal",
        accentText: "text-teal",
        hoverBorder: "hover:border-teal",
    },
];

export function RoleSelectionStep() {
    const { state, actions } = useOnboarding();
    const { user } = useUser();
    const [selectedValue, setSelectedValue] = useState<string>(
        state.selectedRole || "",
    );

    const firstName = user?.firstName;

    const handleRoleSelect = (value: string) => {
        setSelectedValue(value);
        const role = value as UserRole;
        actions.setRole(role);
        // Only recruiters need to select a subscription plan
        if (role === "recruiter") {
            actions.setStep(2);
        } else {
            actions.setStep(3);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* ── A) Welcome Hero Section ── */}
            <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4 border-coral bg-coral">
                    <i className="fa-duotone fa-regular fa-hand-wave text-3xl text-cream"></i>
                </div>

                {/* Headline */}
                <h2 className="text-3xl font-black uppercase tracking-tight text-dark mb-3">
                    {firstName ? (
                        <>
                            {firstName},{" "}
                            <span className="text-coral">
                                You&apos;re In.
                            </span>
                            <br />
                            Now Let&apos;s Build.
                        </>
                    ) : (
                        <>
                            You&apos;re In.{" "}
                            <span className="text-coral">Now Let&apos;s Build.</span>
                        </>
                    )}
                </h2>

                {/* Subtitle */}
                <p className="text-dark/60 text-sm max-w-md mx-auto">
                    Splits Network is the recruiting marketplace where
                    collaboration replaces competition. Pick your role and
                    we&apos;ll have you live in under two minutes.
                </p>
            </div>

            {/* ── B) Role Selection Section ── */}
            <div className="space-y-4">
                {/* Section Label */}
                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50 text-center">
                    I am a...
                </p>

                {/* Role Cards */}
                <div className="grid gap-4">
                    {ROLE_CARDS.map((card) => {
                        const isSelected = selectedValue === card.value;

                        return (
                            <button
                                key={card.value}
                                type="button"
                                onClick={() => handleRoleSelect(card.value)}
                                className={[
                                    "relative text-left p-6 border-4 transition-all duration-150",
                                    "hover:-translate-y-1",
                                    isSelected
                                        ? `${card.accentBg} ${card.accentBorder}`
                                        : `border-dark/15 ${card.hoverBorder}`,
                                ].join(" ")}
                            >
                                {/* "Most Popular" Badge */}
                                {card.badge && (
                                    <span className="absolute -top-3 right-4 px-3 py-1 bg-yellow text-dark text-xs font-black uppercase tracking-[0.15em]">
                                        {card.badge}
                                    </span>
                                )}

                                <div className="flex gap-5">
                                    {/* Icon Box */}
                                    <div
                                        className={[
                                            "w-14 h-14 flex-shrink-0 flex items-center justify-center border-4",
                                            isSelected
                                                ? "border-cream/30 bg-cream/20"
                                                : `${card.accentBorder} ${card.accentBgLight}`,
                                        ].join(" ")}
                                    >
                                        <i
                                            className={[
                                                card.icon,
                                                "text-xl",
                                                isSelected
                                                    ? "text-cream"
                                                    : card.accentText,
                                            ].join(" ")}
                                        ></i>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Title */}
                                        <h3
                                            className={[
                                                "text-lg font-black uppercase tracking-tight",
                                                isSelected
                                                    ? "text-cream"
                                                    : "text-dark",
                                            ].join(" ")}
                                        >
                                            {card.title}
                                        </h3>

                                        {/* Tagline */}
                                        <p
                                            className={[
                                                "text-sm font-bold mt-0.5",
                                                isSelected
                                                    ? "text-cream/80"
                                                    : "text-dark/70",
                                            ].join(" ")}
                                        >
                                            {card.tagline}
                                        </p>

                                        {/* Description */}
                                        <p
                                            className={[
                                                "text-sm mt-2",
                                                isSelected
                                                    ? "text-cream/70"
                                                    : "text-dark/50",
                                            ].join(" ")}
                                        >
                                            {card.description}
                                        </p>

                                        {/* Benefits */}
                                        <ul className="mt-3 space-y-1.5">
                                            {card.benefits.map((benefit, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-2"
                                                >
                                                    <i
                                                        className={[
                                                            "fa-duotone fa-regular fa-circle-check text-sm",
                                                            isSelected
                                                                ? "text-cream/80"
                                                                : card.accentText,
                                                        ].join(" ")}
                                                    ></i>
                                                    <span
                                                        className={[
                                                            "text-sm font-semibold",
                                                            isSelected
                                                                ? "text-cream/80"
                                                                : "text-dark/60",
                                                        ].join(" ")}
                                                    >
                                                        {benefit.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── C) Error Display ── */}
            {state.error && (
                <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                    <span className="text-sm font-bold text-dark">
                        {state.error}
                    </span>
                </div>
            )}
        </div>
    );
}
