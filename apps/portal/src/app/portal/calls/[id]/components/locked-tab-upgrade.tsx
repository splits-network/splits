"use client";

import Link from "next/link";

interface LockedTabUpgradeProps {
    icon: string;
    title: string;
    description: string;
    upgradeTier: string;
}

export function LockedTabUpgrade({
    icon,
    title,
    description,
    upgradeTier,
}: LockedTabUpgradeProps) {
    return (
        <div className="border-2 border-base-300 p-12 text-center">
            <i
                className={`fa-duotone fa-regular ${icon} text-4xl text-base-content/20 mb-4 block`}
            />
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-base-content/50 max-w-sm mx-auto mb-6">
                {description}
            </p>
            <Link
                href="/portal/profile?section=subscription"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 0 }}
            >
                <i className="fa-duotone fa-regular fa-arrow-up-right" />
                Upgrade to {upgradeTier}
            </Link>
        </div>
    );
}
