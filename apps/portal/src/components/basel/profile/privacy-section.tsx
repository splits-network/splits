"use client";

import { useMarketplaceSettings } from "./marketplace-context";
import { BaselToggleRow } from "@splits-network/basel-ui";

export function PrivacySection() {
    const { settings, updateSettings, completeness, incentives, loading } =
        useMarketplaceSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">Privacy</h2>
            <p className="text-base text-base-content/50 mb-8">
                Control what information is visible on your marketplace profile.
            </p>

            <BaselToggleRow
                label="Show success metrics"
                description="Display placement count and success rate on your profile"
                checked={settings.show_success_metrics}
                onChange={(checked) =>
                    updateSettings({ show_success_metrics: checked })
                }
            />

            <BaselToggleRow
                label="Show contact information"
                description="Display email and phone to candidates"
                checked={settings.show_contact_info}
                onChange={(checked) =>
                    updateSettings({ show_contact_info: checked })
                }
            />

            {/* Profile Completeness Breakdown */}
            <div className="mt-10 pt-8 border-t border-base-300">
                <p className="text-sm font-semibold uppercase tracking-widest text-base-content/50 mb-6">
                    Profile Completeness
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary p-4 text-center">
                        <p className="text-sm font-semibold text-base-content/50 mb-1">
                            Basic
                        </p>
                        <p className="text-2xl font-black text-primary">
                            {completeness.categoryScores.basic}%
                        </p>
                    </div>
                    <div className="bg-base-200 border border-base-300 border-l-4 border-l-secondary p-4 text-center">
                        <p className="text-sm font-semibold text-base-content/50 mb-1">
                            Marketplace
                        </p>
                        <p className="text-2xl font-black">
                            {completeness.categoryScores.marketplace}%
                        </p>
                    </div>
                    <div className="bg-base-200 border border-base-300 border-l-4 border-l-accent p-4 text-center">
                        <p className="text-sm font-semibold text-base-content/50 mb-1">
                            Metrics
                        </p>
                        <p className="text-2xl font-black text-accent">
                            {completeness.categoryScores.metrics}%
                        </p>
                    </div>
                </div>

                {/* Incentives */}
                <div className="space-y-2">
                    {incentives.map((incentive, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-base-content/60"
                        >
                            <i
                                className={`fa-duotone fa-regular ${
                                    completeness.tier === "complete"
                                        ? "fa-check text-success"
                                        : "fa-star text-warning"
                                } mt-0.5`}
                            />
                            <span>{incentive}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
