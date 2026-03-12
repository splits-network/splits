"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useDebouncedCallback } from "@/hooks/use-debounce";

interface EffectivePreference {
    category: string;
    label: string;
    description: string;
    icon: string;
    email_enabled: boolean;
    in_app_enabled: boolean;
    unsubscribable: boolean;
    email_entitled: boolean;
}

/** Candidate-relevant categories only */
const CANDIDATE_GROUPS = [
    {
        title: "Activity",
        categories: [
            "applications",
            "interviews",
            "offers_hires",
            "jobs_matches",
        ],
    },
    {
        title: "Communication",
        categories: ["calls", "messaging"],
    },
    {
        title: "Account",
        categories: ["security", "invitations"],
    },
    {
        title: "Updates",
        categories: ["engagement"],
    },
];

const CANDIDATE_CATEGORIES = new Set(
    CANDIDATE_GROUPS.flatMap((g) => g.categories),
);

export function SectionNotifications() {
    const { getToken } = useAuth();
    const [preferences, setPreferences] = useState<EffectivePreference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadPreferences = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const result = await client.get("/notification-preferences");
            const all: EffectivePreference[] = result.data || [];
            setPreferences(
                all.filter((p) => CANDIDATE_CATEGORIES.has(p.category)),
            );
        } catch (err: any) {
            setError(err.message || "Failed to load notification preferences");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    const debouncedSave = useDebouncedCallback(
        async (updated: EffectivePreference[]) => {
            setSaving(true);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.put("/notification-preferences", {
                    preferences: updated.map((p) => ({
                        category: p.category,
                        email_enabled: p.email_enabled,
                        in_app_enabled: p.in_app_enabled,
                    })),
                });
            } catch (err: any) {
                setError("Failed to save preferences");
            } finally {
                setSaving(false);
            }
        },
        800,
    );

    const togglePreference = (
        category: string,
        field: "email_enabled" | "in_app_enabled",
    ) => {
        const updated = preferences.map((p) =>
            p.category === category ? { ...p, [field]: !p[field] } : p,
        );
        setPreferences(updated);
        debouncedSave(updated);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    const prefMap = new Map(preferences.map((p) => [p.category, p]));
    const emailEntitled = preferences[0]?.email_entitled ?? true;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black tracking-tight">
                    Notifications
                </h2>
                <p className="text-base text-base-content/50 mt-1">
                    Control which notifications you receive and how.
                </p>
            </div>

            {saving && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="loading loading-spinner loading-sm" />
                    <span className="text-base-content/60 font-semibold">
                        Saving...
                    </span>
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span>{error}</span>
                </div>
            )}

            {!emailEntitled && (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-circle-info" />
                    <span>
                        Email notifications are available on Pro and Partner
                        plans. Upgrade to enable email delivery.
                    </span>
                </div>
            )}

            {/* Column headers */}
            <div className="flex items-center justify-end gap-8 pr-2 text-sm font-semibold text-base-content/40 uppercase tracking-wider">
                <span className="w-14 text-center">Email</span>
                <span className="w-14 text-center">In-App</span>
            </div>

            {CANDIDATE_GROUPS.map((group) => (
                <div key={group.title}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30">
                            {group.title}
                        </span>
                        <div className="flex-1 h-px bg-base-300" />
                    </div>

                    <div className="space-y-1">
                        {group.categories.map((cat) => {
                            const pref = prefMap.get(cat);
                            if (!pref) return null;

                            const emailDisabled =
                                pref.unsubscribable || !emailEntitled;
                            const inAppDisabled = pref.unsubscribable;

                            return (
                                <div
                                    key={cat}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-base-200/50 transition-colors"
                                >
                                    <i
                                        className={`${pref.icon} w-5 text-center text-base-content/40`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {pref.label}
                                            </span>
                                            {pref.unsubscribable && (
                                                <span className="text-sm text-base-content/30">
                                                    (Required)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-base-content/40 truncate">
                                            {pref.description}
                                        </p>
                                    </div>

                                    <div className="w-14 flex justify-center">
                                        <div
                                            className={
                                                !emailEntitled &&
                                                !pref.unsubscribable
                                                    ? "tooltip tooltip-left"
                                                    : ""
                                            }
                                            data-tip={
                                                !emailEntitled &&
                                                !pref.unsubscribable
                                                    ? "Upgrade to enable"
                                                    : undefined
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                checked={pref.email_enabled}
                                                disabled={emailDisabled}
                                                onChange={() =>
                                                    togglePreference(
                                                        cat,
                                                        "email_enabled",
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="w-14 flex justify-center">
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-sm toggle-primary"
                                            checked={pref.in_app_enabled}
                                            disabled={inAppDisabled}
                                            onChange={() =>
                                                togglePreference(
                                                    cat,
                                                    "in_app_enabled",
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
