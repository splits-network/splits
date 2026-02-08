"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DISMISS_KEY = "company-billing-prompt-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CompanyBillingPromptProps {
    status: "not_started" | "incomplete" | "ready";
    onSetUp?: () => void;
}

export function CompanyBillingPrompt({
    status,
    onSetUp,
}: CompanyBillingPromptProps) {
    const [dismissed, setDismissed] = useState(true); // Default hidden to prevent flash

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

    if (dismissed || status === "ready") {
        return null;
    }

    return (
        <div className="alert alert-info shadow-sm mb-4">
            <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
            <div className="flex-1">
                <span className="text-sm">
                    Set up billing to enable placement invoicing for your hires.
                </span>
            </div>
            <div className="flex items-center gap-2">
                {onSetUp ? (
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onSetUp}
                    >
                        Set Up Billing
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                ) : (
                    <Link
                        href="/portal/company/settings"
                        className="btn btn-sm btn-primary"
                    >
                        Set Up Billing
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
