"use client";

import { useEffect } from "react";
import type { UserRole } from "../types";

interface SuccessStepProps {
    selectedRole: UserRole | null;
}

const STATS = [
    {
        value: "2,400+",
        label: "Open Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        value: "800+",
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        value: "$42K",
        label: "Avg Fee",
        icon: "fa-duotone fa-regular fa-dollar-sign",
    },
];

const RECRUITER_ACTIONS = [
    {
        label: "Browse Open Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        href: "/portal/roles",
        color: "btn-primary",
    },
    {
        label: "Add a Candidate",
        icon: "fa-duotone fa-regular fa-user-plus",
        href: "/portal/candidates",
        color: "btn-secondary",
    },
    {
        label: "Find Split Partners",
        icon: "fa-duotone fa-regular fa-handshake",
        href: "/portal/recruiters",
        color: "btn-accent",
    },
];

const COMPANY_ACTIONS = [
    {
        label: "Post Your First Role",
        icon: "fa-duotone fa-regular fa-plus",
        href: "/portal/roles",
        color: "btn-primary",
    },
    {
        label: "Browse Recruiters",
        icon: "fa-duotone fa-regular fa-users",
        href: "/portal/recruiters",
        color: "btn-secondary",
    },
    {
        label: "View Dashboard",
        icon: "fa-duotone fa-regular fa-gauge-high",
        href: "/portal/dashboard",
        color: "btn-accent",
    },
];

export function SuccessStep({ selectedRole }: SuccessStepProps) {
    const quickActions =
        selectedRole === "recruiter" ? RECRUITER_ACTIONS : COMPANY_ACTIONS;

    // Auto-redirect after 15 seconds if user doesn't click
    // Hard navigation forces fresh profile fetch — avoids stale context redirect loop
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "/portal/dashboard";
        }, 15000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="text-center py-4">
            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                <i className="fa-duotone fa-regular fa-party-horn text-success text-4xl" />
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-2">
                You are all set!
            </h1>
            <p className="text-base-content/50 mb-8 max-w-sm mx-auto">
                {selectedRole === "recruiter"
                    ? "Your profile is active and your subscription is running. Browse roles, submit candidates, and start earning."
                    : "Your company workspace is ready. Post your first role and watch recruiters compete to fill it."}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm mx-auto">
                {STATS.map((stat) => (
                    <div
                        key={stat.label}
                        className="p-4 bg-base-200 border border-base-300 text-center"
                    >
                        <i
                            className={`${stat.icon} text-primary text-lg mb-2 block`}
                        />
                        <div className="text-lg font-black">{stat.value}</div>
                        <div className="text-[10px] uppercase tracking-widest text-base-content/40">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {quickActions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => { window.location.href = action.href; }}
                        className={`btn ${action.color} w-full`}
                    >
                        <i className={action.icon} /> {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
