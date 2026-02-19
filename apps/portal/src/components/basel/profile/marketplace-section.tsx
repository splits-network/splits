"use client";

import { useMarketplaceSettings } from "./marketplace-context";
import { BaselFormField, BaselStatusPill } from "@splits-network/basel-ui";
import { MarkdownEditor } from "@splits-network/shared-ui";

export function MarketplaceSection() {
    const {
        settings,
        updateSettings,
        completeness,
        tierBadge,
        topPriorities,
        loading,
    } = useMarketplaceSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Marketplace Profile
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage how you appear to candidates in the marketplace.
            </p>

            {/* Profile Strength Indicator */}
            <div className="flex items-center gap-5 p-5 mb-8 bg-base-200 border border-base-300 border-l-4 border-l-primary">
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="var(--color-base-300)"
                            strokeWidth="6"
                            fill="none"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="var(--color-primary)"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${(completeness.percentage / 100) * 163} 163`}
                            className="transition-all duration-500"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black">
                            {completeness.percentage}%
                        </span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold uppercase tracking-widest text-base-content/60">
                            Profile Strength
                        </span>
                        <BaselStatusPill
                            color={
                                completeness.tier === "complete"
                                    ? "success"
                                    : completeness.tier === "strong"
                                      ? "primary"
                                      : completeness.tier === "basic"
                                        ? "warning"
                                        : "neutral"
                            }
                        >
                            <i
                                className={`fa-duotone fa-regular ${tierBadge.icon} mr-1`}
                            />
                            {tierBadge.label}
                        </BaselStatusPill>
                    </div>
                    {topPriorities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {topPriorities.map((field) => (
                                <span
                                    key={field.name}
                                    className="px-2 py-0.5 text-sm font-semibold border border-warning/40 bg-warning/5 text-warning"
                                >
                                    {field.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Enable Marketplace */}
            <div className="flex items-center justify-between py-5 border-b border-base-300">
                <div>
                    <p className="font-semibold">Enable marketplace profile</p>
                    <p className="text-sm text-base-content/40">
                        Allow candidates to discover and connect with you
                    </p>
                </div>
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.marketplace_enabled}
                    onChange={(e) =>
                        updateSettings({
                            marketplace_enabled: e.target.checked,
                        })
                    }
                />
            </div>

            {settings.marketplace_enabled && (
                <div className="mt-6 space-y-6">
                    {/* Visibility */}
                    <BaselFormField label="Visibility">
                        <select
                            value={settings.marketplace_visibility}
                            onChange={(e) =>
                                updateSettings({
                                    marketplace_visibility: e.target.value as
                                        | "public"
                                        | "limited"
                                        | "hidden",
                                })
                            }
                            className="select select-bordered w-full max-w-sm"
                        >
                            <option value="public">Public</option>
                            <option value="limited">Verified Only</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </BaselFormField>

                    {/* Tagline */}
                    <BaselFormField
                        label="Tagline"
                        hint="Short description shown in search results"
                    >
                        <input
                            type="text"
                            placeholder="e.g., Tech Executive Placements"
                            maxLength={255}
                            value={settings.tagline}
                            onChange={(e) =>
                                updateSettings({ tagline: e.target.value })
                            }
                            className="input input-bordered w-full max-w-lg"
                        />
                    </BaselFormField>

                    {/* Location & Phone */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <BaselFormField label="Location">
                            <input
                                type="text"
                                placeholder="e.g., New York, NY"
                                value={settings.location}
                                onChange={(e) =>
                                    updateSettings({
                                        location: e.target.value,
                                    })
                                }
                                className="input input-bordered w-full"
                            />
                        </BaselFormField>

                        <BaselFormField
                            label="Phone Number"
                            hint="Shown if contact info is enabled"
                        >
                            <input
                                type="tel"
                                placeholder="e.g., (555) 123-4567"
                                value={settings.phone}
                                onChange={(e) =>
                                    updateSettings({ phone: e.target.value })
                                }
                                className="input input-bordered w-full"
                            />
                        </BaselFormField>
                    </div>

                    {/* Years of Experience */}
                    <BaselFormField label="Years of Experience">
                        <input
                            type="number"
                            min="0"
                            value={settings.years_experience.toString()}
                            onChange={(e) =>
                                updateSettings({
                                    years_experience:
                                        parseInt(e.target.value) || 0,
                                })
                            }
                            className="input input-bordered w-32"
                        />
                    </BaselFormField>

                    {/* Profile Summary */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm font-semibold uppercase tracking-widest text-base-content/50">
                                Profile Summary
                            </p>
                            <BaselStatusPill color="info">
                                Max 500
                            </BaselStatusPill>
                        </div>
                        <MarkdownEditor
                            value={settings.bio}
                            onChange={(value) =>
                                updateSettings({ bio: value })
                            }
                            placeholder="Brief overview of your recruiting expertise and approach"
                            maxLength={500}
                            showCount
                            height={140}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
