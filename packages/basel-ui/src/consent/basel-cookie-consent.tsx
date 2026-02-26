"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    readConsentCookie,
    writeConsentCookie,
    type ConsentPreferences,
} from "./cookie-helpers";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselCookieConsentProps {
    /** Links to your Cookie Policy page (relative or absolute) */
    cookiePolicyHref?: string;
    /** Links to your Privacy Policy page (relative or absolute) */
    privacyPolicyHref?: string;
    /**
     * Optional callback fired after the user saves consent.
     * Use this to sync preferences to a backend for authenticated users.
     */
    onConsentSaved?: (preferences: ConsentPreferences) => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BaselCookieConsent({
    cookiePolicyHref = "/cookie-policy",
    privacyPolicyHref = "/privacy-policy",
    onConsentSaved,
}: BaselCookieConsentProps) {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {
        const existing = readConsentCookie();
        if (!existing) {
            const timer = setTimeout(() => setShowBanner(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = useCallback(
        (partial: {
            functional: boolean;
            analytics: boolean;
            marketing: boolean;
        }) => {
            const prefs: ConsentPreferences = {
                necessary: true,
                functional: partial.functional,
                analytics: partial.analytics,
                marketing: partial.marketing,
                timestamp: new Date().toISOString(),
            };

            writeConsentCookie(prefs);
            setShowBanner(false);
            setShowPreferences(false);
            onConsentSaved?.(prefs);
        },
        [onConsentSaved],
    );

    const handleAcceptAll = useCallback(() => {
        saveConsent({ functional: true, analytics: true, marketing: true });
    }, [saveConsent]);

    const handleNecessaryOnly = useCallback(() => {
        saveConsent({ functional: false, analytics: false, marketing: false });
    }, [saveConsent]);

    if (!showBanner) return null;

    if (showPreferences) {
        return createPortal(
            <CookiePreferencesPanel
                cookiePolicyHref={cookiePolicyHref}
                privacyPolicyHref={privacyPolicyHref}
                onSave={saveConsent}
                onClose={() => setShowPreferences(false)}
            />,
            document.body,
        );
    }

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-base-100 shadow-md border-t-4 border-primary">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-start gap-3 mb-2">
                        <i className="fa-duotone fa-regular fa-cookie-bite text-3xl text-primary shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">
                                We Value Your Privacy
                            </h3>
                            <p className="text-sm text-base-content/80">
                                We use cookies to enhance your experience,
                                analyze traffic, and personalize content. By
                                clicking &ldquo;Accept All&rdquo;, you consent
                                to our use of cookies. Learn more in our{" "}
                                <a
                                    href={cookiePolicyHref}
                                    className="link link-primary"
                                >
                                    Cookie Policy
                                </a>{" "}
                                and{" "}
                                <a
                                    href={privacyPolicyHref}
                                    className="link link-primary"
                                >
                                    Privacy Policy
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowPreferences(true)}
                            className="btn btn-ghost btn-sm"
                        >
                            <i className="fa-duotone fa-regular fa-sliders mr-2" />
                            Preferences
                        </button>
                        <button
                            onClick={handleNecessaryOnly}
                            className="btn btn-outline btn-sm"
                        >
                            Necessary Only
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="btn btn-primary btn-sm"
                        >
                            <i className="fa-duotone fa-regular fa-check mr-2" />
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ─── Preferences Panel ──────────────────────────────────────────────────── */

interface CookiePreferencesPanelProps {
    cookiePolicyHref: string;
    privacyPolicyHref: string;
    onSave: (prefs: {
        functional: boolean;
        analytics: boolean;
        marketing: boolean;
    }) => void;
    onClose: () => void;
}

function CookiePreferencesPanel({
    cookiePolicyHref,
    privacyPolicyHref,
    onSave,
    onClose,
}: CookiePreferencesPanelProps) {
    const [prefs, setPrefs] = useState({
        functional: true,
        analytics: true,
        marketing: false,
    });

    return (
        <div className="modal modal-open" role="dialog">
            <div className="modal-backdrop bg-neutral/60" onClick={onClose} />
            <div
                className="modal-box max-w-2xl bg-base-100 p-0 overflow-hidden max-h-[90vh] flex flex-col"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-cookie-bite text-primary" />
                        Cookie Preferences
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm text-base-content/80 mb-6">
                        Manage your cookie preferences below. Necessary cookies
                        are always enabled as they are required for the website
                        to function properly.
                    </p>

                    <div className="space-y-4">
                        <CookieCategory
                            icon="fa-lock"
                            iconColor="text-primary"
                            title="Strictly Necessary Cookies"
                            description="Essential for the website to function. These cannot be disabled."
                            alwaysOn
                        />
                        <CookieCategory
                            icon="fa-sliders"
                            iconColor="text-secondary"
                            title="Functionality Cookies"
                            description="Remember your preferences and settings for a personalized experience."
                            checked={prefs.functional}
                            onChange={(v) =>
                                setPrefs({ ...prefs, functional: v })
                            }
                        />
                        <CookieCategory
                            icon="fa-chart-line"
                            iconColor="text-accent"
                            title="Analytics Cookies"
                            description="Help us understand how visitors use our website to improve performance."
                            checked={prefs.analytics}
                            onChange={(v) =>
                                setPrefs({ ...prefs, analytics: v })
                            }
                        />
                        <CookieCategory
                            icon="fa-bullseye"
                            iconColor="text-info"
                            title="Marketing Cookies"
                            description="Track your activity to deliver relevant advertising and measure effectiveness."
                            checked={prefs.marketing}
                            onChange={(v) =>
                                setPrefs({ ...prefs, marketing: v })
                            }
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={onClose} className="btn btn-ghost">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(prefs)}
                            className="btn btn-primary"
                        >
                            <i className="fa-duotone fa-regular fa-check mr-2" />
                            Save Preferences
                        </button>
                    </div>
                    <p className="text-sm text-base-content/60">
                        For more information, read our{" "}
                        <a
                            href={cookiePolicyHref}
                            className="link link-primary"
                        >
                            Cookie Policy
                        </a>{" "}
                        and{" "}
                        <a
                            href={privacyPolicyHref}
                            className="link link-primary"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Cookie Category Row ────────────────────────────────────────────────── */

function CookieCategory({
    icon,
    iconColor,
    title,
    description,
    alwaysOn,
    checked,
    onChange,
}: {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    alwaysOn?: boolean;
    checked?: boolean;
    onChange?: (value: boolean) => void;
}) {
    return (
        <div className="bg-base-200 p-4" style={{ borderRadius: 0 }}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <i
                            className={`fa-duotone fa-regular ${icon} ${iconColor}`}
                        />
                        <h3 className="font-semibold">{title}</h3>
                    </div>
                    <p className="text-sm text-base-content/70">
                        {description}
                    </p>
                </div>
                {alwaysOn ? (
                    <div className="badge badge-success">Always On</div>
                ) : (
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={checked}
                        onChange={(e) => onChange?.(e.target.checked)}
                    />
                )}
            </div>
        </div>
    );
}
