"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { MarketplaceProfile } from "@splits-network/shared-types";
import {
    calculateProfileCompleteness,
    getCompletionTierBadge,
    getTopPriorityFields,
    getCompletionIncentives,
} from "@/lib/utils/profile-completeness";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { ConnectStatusCard } from "@/components/stripe/connect-status-card";
import {
    Button,
    Input,
    Select,
    Toggle,
    AlertBanner,
    Badge,
    SettingsField,
} from "@splits-network/memphis-ui";

interface MarketplaceSettingsData {
    marketplace_enabled: boolean;
    marketplace_visibility: "public" | "limited" | "hidden";
    industries: string[];
    specialties: string[];
    location: string;
    phone: string;
    tagline: string;
    years_experience: number;
    bio: string;
    marketplace_profile: MarketplaceProfile;
    show_success_metrics: boolean;
    show_contact_info: boolean;
}

const INDUSTRY_OPTIONS = [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Retail",
    "Education",
    "Consulting",
    "Professional Services",
    "Real Estate",
    "Recruitment",
    "Hospitality",
    "Construction",
    "Energy",
    "Telecommunications",
    "Media & Entertainment",
    "Transportation",
    "Other",
];

const SPECIALTY_OPTIONS = [
    "Executive",
    "Engineering",
    "Product Management",
    "Design",
    "Data Science",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "Legal",
    "Human Resources",
    "Customer Success",
    "Administrative",
];

const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;

const MARKETPLACE_SECTIONS = [
    "marketplace",
    "specializations",
    "bio",
    "privacy",
    "payouts",
];

interface MarketplaceSettingsProps {
    activeSection: string;
}

export function MarketplaceSettings({ activeSection }: MarketplaceSettingsProps) {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<MarketplaceSettingsData>({
        marketplace_enabled: false,
        marketplace_visibility: "public",
        industries: [],
        specialties: [],
        location: "",
        phone: "",
        tagline: "",
        years_experience: 0,
        bio: "",
        marketplace_profile: {},
        show_success_metrics: false,
        show_contact_info: true,
    });
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const pendingChangesRef = useRef<Partial<MarketplaceSettingsData>>({});

    useEffect(() => {
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError("Please sign in to manage marketplace settings.");
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const result = await client.getCurrentRecruiter();
            const data = result.data;

            setRecruiterId(data.id);
            setSettings({
                marketplace_enabled: data.marketplace_enabled ?? false,
                marketplace_visibility: data.marketplace_visibility || "public",
                industries: data.industries || [],
                specialties: data.specialties || [],
                location: data.location || "",
                phone: data.phone || "",
                tagline: data.tagline || "",
                years_experience: data.years_experience || 0,
                bio: data.bio || "",
                marketplace_profile: data.marketplace_profile || {},
                show_success_metrics: data.show_success_metrics ?? false,
                show_contact_info: data.show_contact_info !== false,
            });
        } catch (err) {
            console.error("Failed to load marketplace settings:", err);
            setError("Failed to load settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const debouncedSave = useDebouncedCallback(async () => {
        if (Object.keys(pendingChangesRef.current).length === 0) return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                setError("Please sign in to update marketplace settings.");
                return;
            }
            if (!recruiterId) {
                setError(
                    "Recruiter profile not loaded. Please refresh and try again.",
                );
                return;
            }

            const client = createAuthenticatedClient(token);
            const changesToSave = { ...pendingChangesRef.current };
            pendingChangesRef.current = {};

            const payload = {
                marketplace_enabled:
                    changesToSave.marketplace_enabled ??
                    settings.marketplace_enabled,
                marketplace_visibility:
                    changesToSave.marketplace_visibility ??
                    settings.marketplace_visibility,
                industries: changesToSave.industries ?? settings.industries,
                specialties: changesToSave.specialties ?? settings.specialties,
                location: changesToSave.location ?? settings.location,
                phone: changesToSave.phone ?? settings.phone,
                tagline: changesToSave.tagline ?? settings.tagline,
                years_experience:
                    changesToSave.years_experience ?? settings.years_experience,
                bio: changesToSave.bio ?? settings.bio,
                marketplace_profile:
                    changesToSave.marketplace_profile ??
                    settings.marketplace_profile,
                show_success_metrics:
                    changesToSave.show_success_metrics ??
                    settings.show_success_metrics,
                show_contact_info:
                    changesToSave.show_contact_info ??
                    settings.show_contact_info,
            };
            await client.patch(`/recruiters/${recruiterId}`, payload);
            setLastSaved(new Date());
            setError("");
        } catch (err) {
            console.error("Failed to update marketplace settings:", err);
            setError("Failed to auto-save. Please try again.");
        } finally {
            setSaving(false);
        }
    }, 1000);

    const updateSettings = (updates: Partial<MarketplaceSettingsData>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            ...updates,
        };
        debouncedSave();
    };

    const toggleIndustry = (industry: string) => {
        const newIndustries = settings.industries.includes(industry)
            ? settings.industries.filter((i) => i !== industry)
            : [...settings.industries, industry];
        updateSettings({ industries: newIndustries });
    };

    const toggleSpecialty = (specialty: string) => {
        const newSpecialties = settings.specialties.includes(specialty)
            ? settings.specialties.filter((s) => s !== specialty)
            : [...settings.specialties, specialty];
        updateSettings({ specialties: newSpecialties });
    };

    const completeness = useMemo(() => {
        return calculateProfileCompleteness(settings);
    }, [settings]);

    const tierBadge = getCompletionTierBadge(completeness.tier);
    const topPriorities = getTopPriorityFields(completeness.missingFields, 3);
    const incentives = getCompletionIncentives(completeness.tier);

    const updateBioRich = (bio_rich: string) => {
        updateSettings({
            marketplace_profile: {
                ...settings.marketplace_profile,
                bio_rich,
            },
        });
    };

    // Only render when a marketplace section is active
    if (!MARKETPLACE_SECTIONS.includes(activeSection)) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-dark border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Save Status */}
            <SaveStatus saving={saving} lastSaved={lastSaved} error={error} />

            {/* Marketplace Section */}
            {activeSection === "marketplace" && (
                <div className="space-y-0">
                    {/* Profile Completeness Summary */}
                    <div className="flex items-center gap-4 p-4 mb-6 border-4 border-teal">
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    stroke="var(--color-cream)"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    stroke="var(--color-teal)"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(completeness.percentage / 100) * 163} 163`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-black text-dark">
                                    {completeness.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-black uppercase tracking-wider text-dark">
                                    Profile Strength
                                </span>
                                <Badge
                                    color={tierBadge.color as any}
                                    size="xs"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${tierBadge.icon} text-xs`}
                                    />
                                    {tierBadge.label}
                                </Badge>
                            </div>
                            {topPriorities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {topPriorities.map((field) => (
                                        <span
                                            key={field.name}
                                            className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-yellow text-dark"
                                        >
                                            {field.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <SettingsField
                        label="Enable marketplace profile"
                        description="Allow candidates to discover and connect with you"
                    >
                        <Toggle
                            enabled={settings.marketplace_enabled}
                            onChange={(enabled) =>
                                updateSettings({ marketplace_enabled: enabled })
                            }
                            accent="teal"
                        />
                    </SettingsField>

                    {settings.marketplace_enabled && (
                        <>
                            <SettingsField
                                label="Visibility"
                                description="Control who can see your profile"
                            >
                                <Select
                                    value={settings.marketplace_visibility}
                                    onChange={(e) =>
                                        updateSettings({
                                            marketplace_visibility: e.target
                                                .value as any,
                                        })
                                    }
                                    options={[
                                        {
                                            value: "public",
                                            label: "Public",
                                        },
                                        {
                                            value: "limited",
                                            label: "Verified Only",
                                        },
                                        {
                                            value: "hidden",
                                            label: "Hidden",
                                        },
                                    ]}
                                />
                            </SettingsField>

                            <SettingsField
                                label="Tagline"
                                description="Short description shown in search results"
                            >
                                <Input
                                    type="text"
                                    placeholder="e.g., Tech Executive Placements"
                                    maxLength={255}
                                    value={settings.tagline}
                                    onChange={(e) =>
                                        updateSettings({
                                            tagline: e.target.value,
                                        })
                                    }
                                    className="w-64"
                                />
                            </SettingsField>

                            <SettingsField
                                label="Location"
                                description="Where you operate"
                            >
                                <Input
                                    type="text"
                                    placeholder="e.g., New York, NY"
                                    value={settings.location}
                                    onChange={(e) =>
                                        updateSettings({
                                            location: e.target.value,
                                        })
                                    }
                                    className="w-64"
                                />
                            </SettingsField>

                            <SettingsField
                                label="Phone Number"
                                description="Shown if contact info is enabled"
                            >
                                <Input
                                    type="tel"
                                    placeholder="e.g., (555) 123-4567"
                                    value={settings.phone}
                                    onChange={(e) =>
                                        updateSettings({
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-64"
                                />
                            </SettingsField>

                            <SettingsField
                                label="Years of Experience"
                                description="Your recruiting experience"
                            >
                                <Input
                                    type="number"
                                    min="0"
                                    value={settings.years_experience.toString()}
                                    onChange={(e) =>
                                        updateSettings({
                                            years_experience:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="w-32"
                                />
                            </SettingsField>

                            <div className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <p className="text-sm font-bold text-dark">
                                        Profile Summary
                                    </p>
                                    <Badge color="yellow" size="xs">
                                        Max 500
                                    </Badge>
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
                        </>
                    )}
                </div>
            )}

            {/* Specializations Section */}
            {activeSection === "specializations" && (
                <div>
                    {/* Industries */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-industry text-dark text-xs" />
                            </span>
                            <p className="text-sm font-black uppercase tracking-wider text-dark">
                                Industries
                            </p>
                        </div>
                        <p className="text-xs text-dark/50 font-bold mb-4">
                            Select the industries you specialize in
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {INDUSTRY_OPTIONS.map((industry, idx) => {
                                const isSelected =
                                    settings.industries.includes(industry);
                                const accentColor =
                                    ACCENT_COLORS[idx % ACCENT_COLORS.length];
                                return (
                                    <button
                                        key={industry}
                                        type="button"
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5`}
                                        style={
                                            isSelected
                                                ? {
                                                      backgroundColor: `var(--color-${accentColor})`,
                                                      borderColor: `var(--color-${accentColor})`,
                                                      color:
                                                          accentColor ===
                                                              "yellow" ||
                                                          accentColor === "teal"
                                                              ? "var(--color-dark)"
                                                              : "white",
                                                  }
                                                : {
                                                      borderColor:
                                                          "var(--color-dark)",
                                                      color: "var(--color-dark)",
                                                  }
                                        }
                                        onClick={() =>
                                            toggleIndustry(industry)
                                        }
                                    >
                                        {industry}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="border-t-4 border-cream pt-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-purple">
                                <i className="fa-duotone fa-regular fa-bullseye text-white text-xs" />
                            </span>
                            <p className="text-sm font-black uppercase tracking-wider text-dark">
                                Specialties
                            </p>
                        </div>
                        <p className="text-xs text-dark/50 font-bold mb-4">
                            Select the roles/functions you specialize in
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {SPECIALTY_OPTIONS.map((specialty, idx) => {
                                const isSelected =
                                    settings.specialties.includes(specialty);
                                const accentColor =
                                    ACCENT_COLORS[idx % ACCENT_COLORS.length];
                                return (
                                    <button
                                        key={specialty}
                                        type="button"
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5`}
                                        style={
                                            isSelected
                                                ? {
                                                      backgroundColor: `var(--color-${accentColor})`,
                                                      borderColor: `var(--color-${accentColor})`,
                                                      color:
                                                          accentColor ===
                                                              "yellow" ||
                                                          accentColor === "teal"
                                                              ? "var(--color-dark)"
                                                              : "white",
                                                  }
                                                : {
                                                      borderColor:
                                                          "var(--color-dark)",
                                                      color: "var(--color-dark)",
                                                  }
                                        }
                                        onClick={() =>
                                            toggleSpecialty(specialty)
                                        }
                                    >
                                        {specialty}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bio & Content Section */}
            {activeSection === "bio" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-dark/70 font-bold">
                            Share your story, achievements, and what makes you
                            unique. Supports Markdown formatting.
                        </p>
                        <Badge color="teal" size="sm">
                            <i className="fa-duotone fa-regular fa-sparkles text-xs" />
                            Boost Profile +10%
                        </Badge>
                    </div>

                    <MarkdownEditor
                        label="Your Story"
                        showCount
                        value={settings.marketplace_profile?.bio_rich || ""}
                        onChange={updateBioRich}
                        placeholder={`Tell candidates about yourself...\n\nExample:\n- **15+ years** in tech recruitment\n- Specialized in C-level placements\n- Former software engineer, understands technical roles deeply\n- Track record: 50+ successful placements at top startups\n\nUse **bold**, *italic*, and bullet points to make it engaging!`}
                        helperText="Tip: Use Markdown for formatting (**, *, bullets). This will appear prominently on your marketplace profile."
                        height={300}
                    />
                </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
                <div className="space-y-0">
                    <SettingsField
                        label="Show success metrics"
                        description="Display placement count and success rate on your profile"
                    >
                        <Toggle
                            enabled={settings.show_success_metrics}
                            onChange={(enabled) =>
                                updateSettings({
                                    show_success_metrics: enabled,
                                })
                            }
                            accent="teal"
                        />
                    </SettingsField>

                    <SettingsField
                        label="Show contact information"
                        description="Display email and phone to candidates"
                    >
                        <Toggle
                            enabled={settings.show_contact_info}
                            onChange={(enabled) =>
                                updateSettings({
                                    show_contact_info: enabled,
                                })
                            }
                            accent="teal"
                        />
                    </SettingsField>

                    {/* Profile Completeness Breakdown */}
                    <div className="mt-8 pt-6 border-t-4 border-cream">
                        <p className="text-sm font-black uppercase tracking-wider text-dark mb-4">
                            Profile Completeness
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="border-3 border-coral p-3 text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Basic
                                </div>
                                <div className="text-xl font-black text-coral">
                                    {completeness.categoryScores.basic}%
                                </div>
                            </div>
                            <div className="border-3 border-teal p-3 text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Marketplace
                                </div>
                                <div className="text-xl font-black text-dark">
                                    {completeness.categoryScores.marketplace}%
                                </div>
                            </div>
                            <div className="border-3 border-purple p-3 text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Metrics
                                </div>
                                <div className="text-xl font-black text-purple">
                                    {completeness.categoryScores.metrics}%
                                </div>
                            </div>
                        </div>

                        {/* Incentives */}
                        <div className="text-xs text-dark/60 font-bold space-y-1">
                            {incentives.map((incentive, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${completeness.tier === "complete" ? "fa-check text-teal" : "fa-star text-yellow"} text-xs mt-0.5`}
                                    />
                                    <span>{incentive}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Payouts Section */}
            {activeSection === "payouts" && (
                <div>
                    <ConnectStatusCard variant="full" />
                </div>
            )}
        </div>
    );
}

function SaveStatus({
    saving,
    lastSaved,
    error,
}: {
    saving: boolean;
    lastSaved: Date | null;
    error: string;
}) {
    return (
        <>
            {error && (
                <AlertBanner type="error" className="mb-4">
                    {error}
                </AlertBanner>
            )}
            <div className="flex items-center gap-2 text-sm mb-4">
                {saving && (
                    <>
                        <div className="w-4 h-4 border-3 border-dark border-t-transparent animate-spin" />
                        <span className="text-dark/70 font-bold">
                            Saving...
                        </span>
                    </>
                )}
                {!saving && lastSaved && (
                    <>
                        <i className="fa-duotone fa-regular fa-check text-teal" />
                        <span className="text-dark/70 font-bold">
                            Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    </>
                )}
            </div>
        </>
    );
}
