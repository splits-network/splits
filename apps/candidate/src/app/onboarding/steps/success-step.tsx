"use client";

/**
 * Step 6: Success (Basel Edition)
 * Celebration screen with stats and quick actions.
 * Auto-redirects to dashboard after 15 seconds.
 */

import { useEffect } from "react";

const STATS = [
    {
        value: "3,200+",
        label: "Active Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        value: "800+",
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        value: "12 days",
        label: "Avg to Interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
    },
];

function getQuickActions(redirectUrl?: string) {
    const actions = [];

    if (redirectUrl) {
        actions.push({
            label: "Continue Where You Left Off",
            icon: "fa-duotone fa-regular fa-arrow-right",
            href: redirectUrl,
            color: "btn-primary",
        });
    } else {
        actions.push({
            label: "Browse Open Roles",
            icon: "fa-duotone fa-regular fa-briefcase",
            href: "/portal/dashboard",
            color: "btn-primary",
        });
    }

    actions.push(
        {
            label: "Complete Your Profile",
            icon: "fa-duotone fa-regular fa-user-pen",
            href: "/portal/profile",
            color: "btn-secondary",
        },
        {
            label: "View Your Dashboard",
            icon: "fa-duotone fa-regular fa-gauge-high",
            href: "/portal/dashboard",
            color: "btn-accent",
        },
    );

    return actions;
}

interface SuccessStepProps {
    redirectUrl?: string;
}

export function SuccessStep({ redirectUrl }: SuccessStepProps) {
    const destination = redirectUrl || "/portal/dashboard";

    // Auto-redirect after 15 seconds
    // Hard navigation forces fresh profile fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = destination;
        }, 15000);
        return () => clearTimeout(timer);
    }, [destination]);

    return (
        <div className="text-center py-4">
            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                <i className="fa-duotone fa-regular fa-party-horn text-success text-4xl" />
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-2">
                You&apos;re all set!
            </h1>
            <p className="text-base-content/50 mb-8 max-w-sm mx-auto">
                Your profile is live. Recruiters across the network can now
                match you with roles that fit your experience and preferences.
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
                {getQuickActions(redirectUrl).map((action) => (
                    <button
                        key={action.label}
                        onClick={() => {
                            window.location.href = action.href;
                        }}
                        className={`btn ${action.color} w-full`}
                    >
                        <i className={action.icon} /> {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
