"use client";

import Link from "next/link";
import { useUrgencyItems, type UrgencyItem } from "../hooks/use-urgency-items";
import type {
    Application,
    ActiveRecruiter,
} from "../hooks/use-candidate-dashboard-data";
import { urgencyColor } from "./status-color";

interface CandidateUrgencyBarProps {
    applications: Application[];
    activeRecruiters: ActiveRecruiter[];
    unreadMessages: number;
    unreadNotifications: number;
    profileCompletion: number;
    hasResume: boolean;
}

export default function CandidateUrgencyBar({
    applications,
    activeRecruiters,
    unreadMessages,
    unreadNotifications,
    profileCompletion,
    hasResume,
}: CandidateUrgencyBarProps) {
    const items = useUrgencyItems({
        applications,
        activeRecruiters,
        unreadMessages,
        unreadNotifications,
        profileCompletion,
        hasResume,
    });

    if (items.length === 0) return null;

    const topLevel = items[0].level;
    const colorClasses = urgencyColor(topLevel);

    return (
        <div
            className={`urgency-bar border-l-4 px-6 py-3 ${colorClasses} opacity-0`}
        >
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {items.map((item, idx) => (
                        <span key={item.id}>
                            {idx > 0 && (
                                <span className="text-current/30 select-none mr-4">
                                    |
                                </span>
                            )}
                            <Link
                                href={item.href}
                                className="font-semibold hover:underline underline-offset-2"
                            >
                                {item.message}
                            </Link>
                        </span>
                    ))}
                </div>
                <Link
                    href={items[0].href}
                    className="btn btn-sm btn-outline shrink-0"
                    style={{ borderRadius: 0 }}
                >
                    Review now
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </Link>
            </div>
        </div>
    );
}
