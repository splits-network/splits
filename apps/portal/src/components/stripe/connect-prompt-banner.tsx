"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStripeConnectStatus } from "@/hooks/use-stripe-connect-status";
import { useUserProfile } from "@/contexts";

const DISMISS_KEY = "connect-prompt-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ConnectPromptBannerProps {
    onSetUp?: () => void;
}

export function ConnectPromptBanner({ onSetUp }: ConnectPromptBannerProps) {
    const { isRecruiter } = useUserProfile();
    const { loading, status } = useStripeConnectStatus();
    const [dismissed, setDismissed] = useState(true); // Default to hidden to prevent flash

    useEffect(() => {
        const stored = localStorage.getItem(DISMISS_KEY);
        if (stored) {
            const expiry = parseInt(stored, 10);
            if (Date.now() < expiry) {
                setDismissed(true);
                return;
            }
            localStorage.removeItem(DISMISS_KEY);
        }
        setDismissed(false);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(
            DISMISS_KEY,
            String(Date.now() + DISMISS_DURATION_MS)
        );
        setDismissed(true);
    };

    // Don't show for non-recruiters, while loading, if dismissed, or if already ready/pending
    if (
        !isRecruiter ||
        loading ||
        dismissed ||
        status === "ready" ||
        status === "pending_verification"
    ) {
        return null;
    }

    return (
        <div className="alert alert-info shadow-sm mb-4">
            <i className="fa-duotone fa-regular fa-building-columns"></i>
            <div className="flex-1">
                <span className="text-sm">
                    Set up your payouts to receive commissions from
                    placements.
                </span>
            </div>
            <div className="flex items-center gap-2">
                {onSetUp ? (
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onSetUp}
                    >
                        Set Up Now
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                ) : (
                    <Link
                        href="/portal/billing/connect"
                        className="btn btn-sm btn-primary"
                    >
                        Set Up Now
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </Link>
                )}
                <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                >
                    <i className="fa-duotone fa-regular fa-xmark"></i>
                </button>
            </div>
        </div>
    );
}
