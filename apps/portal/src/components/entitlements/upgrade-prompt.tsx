"use client";

import Link from "next/link";
import type { BooleanEntitlement } from "@splits-network/shared-types";
import { ENTITLEMENT_COPY } from "./entitlement-copy";

type UpgradeVariant = "inline" | "overlay" | "card" | "banner";

interface UpgradePromptProps {
    /** The entitlement that is locked */
    entitlement: BooleanEntitlement;
    /** Visual treatment */
    variant?: UpgradeVariant;
    /** Override the default icon */
    icon?: string;
    /** Override the default title */
    title?: string;
    /** Override the default description */
    description?: string;
}

/**
 * Generic upgrade/upsell prompt shown when a feature is locked behind a plan.
 * Replaces TrueScoreUpsell, LockedTabUpgrade, and all other one-off upsell components.
 */
export function UpgradePrompt({
    entitlement,
    variant = "card",
    icon: iconOverride,
    title: titleOverride,
    description: descOverride,
}: UpgradePromptProps) {
    const copy = ENTITLEMENT_COPY[entitlement];
    const icon = iconOverride ?? copy.icon;
    const title = titleOverride ?? copy.title;
    const description = descOverride ?? copy.description;
    const ctaText = copy.ctaText;

    if (variant === "inline") {
        return (
            <div className="flex items-center gap-3 rounded-lg bg-base-200 px-4 py-3">
                <i className={`${icon} text-base-content/50`} />
                <span className="text-sm text-base-content/70">{title}</span>
                <Link
                    href="/portal/profile?section=subscription"
                    className="btn btn-primary btn-xs ml-auto"
                >
                    {ctaText}
                </Link>
            </div>
        );
    }

    if (variant === "banner") {
        return (
            <div className="alert alert-info">
                <i className={icon} />
                <div>
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm">{description}</p>
                </div>
                <Link
                    href="/portal/profile?section=subscription"
                    className="btn btn-primary btn-sm"
                >
                    {ctaText}
                </Link>
            </div>
        );
    }

    if (variant === "overlay") {
        return (
            <div className="relative">
                <div className="pointer-events-none select-none blur-sm opacity-50">
                    <div className="h-48 rounded-lg bg-base-200" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200">
                        <i className={`${icon} text-xl text-base-content/60`} />
                    </div>
                    <h4 className="text-lg font-semibold">{title}</h4>
                    <p className="max-w-sm text-center text-sm text-base-content/70">
                        {description}
                    </p>
                    <Link
                        href="/portal/profile?section=subscription"
                        className="btn btn-primary btn-sm"
                    >
                        {ctaText}
                    </Link>
                </div>
            </div>
        );
    }

    // Default: card variant
    return (
        <div className="card bg-base-200 shadow-sm">
            <div className="card-body items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <i className={`${icon} text-2xl text-primary`} />
                </div>
                <h3 className="card-title text-lg">{title}</h3>
                <p className="max-w-md text-sm text-base-content/70">
                    {description}
                </p>
                <div className="card-actions mt-2">
                    <Link
                        href="/portal/profile?section=subscription"
                        className="btn btn-primary btn-sm"
                    >
                        {ctaText}
                    </Link>
                </div>
            </div>
        </div>
    );
}
