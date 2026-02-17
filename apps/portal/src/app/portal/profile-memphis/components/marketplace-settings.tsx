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
    MemphisTriangle,
    MemphisPlus,
    AlertBanner,
    Badge,
} from "@splits-network/memphis-ui";

interface MarketplaceSettings {
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

export function MarketplaceSettings() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<MarketplaceSettings>({
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

    // Accumulate changes for batch saving
    const pendingChangesRef = useRef<Partial<MarketplaceSettings>>({});

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

    // Debounced auto-save function
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

            // Clear pending changes before saving to prevent race conditions
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

    const updateSettings = (updates: Partial<MarketplaceSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        // Accumulate changes for batch saving
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

    // Calculate profile completeness
    const completeness = useMemo(() => {
        return calculateProfileCompleteness(settings);
    }, [settings]);

    const tierBadge = getCompletionTierBadge(completeness.tier);
    const topPriorities = getTopPriorityFields(completeness.missingFields, 3);
    const incentives = getCompletionIncentives(completeness.tier);

    // Helper to update bio_rich in marketplace_profile
    const updateBioRich = (bio_rich: string) => {
        updateSettings({
            marketplace_profile: {
                ...settings.marketplace_profile,
                bio_rich,
            },
        });
    };

    if (loading) {
        return (
            <div className="border-4 border-dark bg-white p-8">
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-dark border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Payout Status */}
            <ConnectStatusCard variant="compact" />

            {/* Profile Completeness Indicator */}
            <div className="border-4 border-teal bg-white p-8 relative">
                <MemphisTriangle
                    color="teal"
                    size="lg"
                    className="absolute top-6 right-6 opacity-15"
                />

                <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                    {/* Progress Ring */}
                    <div className="flex-shrink-0">
                        <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="var(--color-cream)"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="var(--color-teal)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(completeness.percentage / 100) * 352} 352`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl font-black text-dark">
                                    {completeness.percentage}%
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                    Complete
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completeness Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-black uppercase tracking-wide text-dark">
                                Profile Strength
                            </h3>
                            <Badge variant={tierBadge.color as any} size="sm">
                                <i className={`fa-duotone fa-regular ${tierBadge.icon} text-xs`}></i>
                                {tierBadge.label}
                            </Badge>
                        </div>

                        {/* Category Breakdown */}
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

                        {/* Top Priorities */}
                        {topPriorities.length > 0 && (
                            <div className="mb-3">
                                <div className="text-xs font-black uppercase tracking-wider text-dark/70 mb-2">
                                    Top Priorities:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {topPriorities.map((field) => (
                                        <span
                                            key={field.name}
                                            className="px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-yellow text-dark"
                                        >
                                            <i className="fa-duotone fa-regular fa-circle-exclamation text-yellow mr-1"></i>
                                            {field.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Incentives */}
                        <div className="text-xs text-dark/60 font-bold space-y-1">
                            {incentives.map((incentive, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${completeness.tier === "complete" ? "fa-check text-teal" : "fa-star text-yellow"} text-xs mt-0.5`}
                                    ></i>
                                    <span>{incentive}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Status */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm">
                    {saving && (
                        <>
                            <div className="w-4 h-4 border-3 border-dark border-t-transparent animate-spin"></div>
                            <span className="text-dark/70 font-bold">
                                Saving...
                            </span>
                        </>
                    )}
                    {!saving && lastSaved && (
                        <>
                            <i className="fa-duotone fa-regular fa-check text-teal"></i>
                            <span className="text-dark/70 font-bold">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <AlertBanner type="error">
                    {error}
                </AlertBanner>
            )}

            {/* Enable Marketplace */}
            <div className="border-4 border-dark bg-white p-8 relative">
                <MemphisPlus
                    color="dark"
                    size="md"
                    className="absolute top-4 right-4 opacity-20"
                />

                <div className="relative z-10">
                    <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-6 text-dark">
                        <span className="w-8 h-8 flex items-center justify-center bg-dark">
                            <i className="fa-duotone fa-regular fa-store text-white text-sm"></i>
                        </span>
                        Marketplace Participation
                    </h2>

                    <div className="flex items-center justify-between py-4 border-b-2 border-cream">
                        <div>
                            <div className="text-sm font-black uppercase tracking-wide text-dark">
                                Enable marketplace profile
                            </div>
                            <div className="text-xs text-dark/60 font-bold mt-1">
                                Allow candidates to discover and connect with you
                            </div>
                        </div>
                        <Toggle
                            enabled={settings.marketplace_enabled}
                            onChange={(enabled) =>
                                updateSettings({ marketplace_enabled: enabled })
                            }
                            color="teal"
                        />
                    </div>

                    {settings.marketplace_enabled && (
                        <div className="mt-6">
                            <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                Visibility
                            </label>
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
                                        label: "Public - Visible to all candidates",
                                    },
                                    {
                                        value: "limited",
                                        label: "Limited - Visible to verified candidates only",
                                    },
                                    {
                                        value: "hidden",
                                        label: "Hidden - Not visible in marketplace",
                                    },
                                ]}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {settings.marketplace_enabled && (
                <>
                    {/* Profile Information */}
                    <div className="border-4 border-coral bg-white p-8 relative">
                        <MemphisTriangle
                            color="coral"
                            size="md"
                            className="absolute top-4 right-4 opacity-20"
                        />

                        <div className="relative z-10">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-6 text-dark">
                                <span className="w-8 h-8 flex items-center justify-center bg-coral">
                                    <i className="fa-duotone fa-regular fa-id-card text-white text-sm"></i>
                                </span>
                                Profile Information
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        Tagline
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Specialized in Tech Executive Placements"
                                        maxLength={255}
                                        value={settings.tagline}
                                        onChange={(e) =>
                                            updateSettings({
                                                tagline: e.target.value,
                                            })
                                        }
                                        className="w-full"
                                    />
                                    <p className="text-xs mt-2 text-dark/50 font-bold">
                                        Short description shown in search results
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        Location
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., New York, NY"
                                        value={settings.location}
                                        onChange={(e) =>
                                            updateSettings({
                                                location: e.target.value,
                                            })
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder="e.g., (555) 123-4567"
                                        value={settings.phone}
                                        onChange={(e) =>
                                            updateSettings({
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full"
                                    />
                                    <p className="text-xs mt-2 text-dark/50 font-bold">
                                        Contact number for candidates (only shown if contact info is enabled)
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        Years of Experience
                                    </label>
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
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2 text-dark">
                                        Profile Summary (Card Preview)
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow text-dark">
                                            Max 500
                                        </span>
                                    </label>
                                    <MarkdownEditor
                                        value={settings.bio}
                                        onChange={(value) =>
                                            updateSettings({ bio: value })
                                        }
                                        placeholder="Brief overview of your recruiting expertise and approach (shows on marketplace cards)"
                                        maxLength={500}
                                        showCount
                                        height={140}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Industries */}
                    <div className="border-4 border-teal bg-white p-8 relative">
                        <MemphisPlus
                            color="teal"
                            size="md"
                            className="absolute top-4 right-4 opacity-20"
                        />

                        <div className="relative z-10">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-4 text-dark">
                                <span className="w-8 h-8 flex items-center justify-center bg-teal">
                                    <i className="fa-duotone fa-regular fa-industry text-dark text-sm"></i>
                                </span>
                                Industries
                            </h2>
                            <p className="text-sm text-dark/70 font-bold mb-6">
                                Select the industries you specialize in
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {INDUSTRY_OPTIONS.map((industry, idx) => {
                                    const isSelected = settings.industries.includes(industry);
                                    const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                                    return (
                                        <button
                                            key={industry}
                                            type="button"
                                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 ${
                                                isSelected
                                                    ? `bg-${accentColor} border-${accentColor}`
                                                    : "border-dark"
                                            }`}
                                            style={
                                                isSelected
                                                    ? {
                                                          backgroundColor: `var(--color-${accentColor})`,
                                                          borderColor: `var(--color-${accentColor})`,
                                                          color: accentColor === "yellow" || accentColor === "teal" ? "var(--color-dark)" : "white",
                                                      }
                                                    : {
                                                          borderColor: "var(--color-dark)",
                                                          color: "var(--color-dark)",
                                                      }
                                            }
                                            onClick={() => toggleIndustry(industry)}
                                        >
                                            {industry}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="border-4 border-purple bg-white p-8 relative">
                        <MemphisTriangle
                            color="purple"
                            size="md"
                            className="absolute top-4 right-4 opacity-20"
                        />

                        <div className="relative z-10">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-4 text-dark">
                                <span className="w-8 h-8 flex items-center justify-center bg-purple">
                                    <i className="fa-duotone fa-regular fa-bullseye text-white text-sm"></i>
                                </span>
                                Specialties
                            </h2>
                            <p className="text-sm text-dark/70 font-bold mb-6">
                                Select the roles/functions you specialize in
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {SPECIALTY_OPTIONS.map((specialty, idx) => {
                                    const isSelected = settings.specialties.includes(specialty);
                                    const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
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
                                                          color: accentColor === "yellow" || accentColor === "teal" ? "var(--color-dark)" : "white",
                                                      }
                                                    : {
                                                          borderColor: "var(--color-dark)",
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

                    {/* Detailed Bio (Rich Text) */}
                    <div className="border-4 border-yellow bg-white p-8 relative">
                        <MemphisPlus
                            color="yellow"
                            size="lg"
                            className="absolute top-6 right-6 opacity-15"
                        />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 text-dark">
                                    <span className="w-8 h-8 flex items-center justify-center bg-yellow">
                                        <i className="fa-duotone fa-regular fa-pen-to-square text-dark text-sm"></i>
                                    </span>
                                    Detailed Bio
                                </h2>
                                <Badge variant="teal" size="sm">
                                    <i className="fa-duotone fa-regular fa-sparkles text-xs"></i>
                                    Boost Profile +10%
                                </Badge>
                            </div>
                            <p className="text-sm text-dark/70 font-bold mb-6">
                                Share your story, achievements, and what makes
                                you unique. Supports Markdown formatting.
                            </p>

                            <MarkdownEditor
                                label="Your Story"
                                showCount
                                value={
                                    settings.marketplace_profile?.bio_rich || ""
                                }
                                onChange={updateBioRich}
                                placeholder={`Tell candidates about yourself...\n\nExample:\n- **15+ years** in tech recruitment\n- Specialized in C-level placements\n- Former software engineer, understands technical roles deeply\n- Track record: 50+ successful placements at top startups\n\nUse **bold**, *italic*, and bullet points to make it engaging!`}
                                helperText="Tip: Use Markdown for formatting (**, *, bullets). This will appear prominently on your marketplace profile."
                                height={240}
                            />
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="border-4 border-dark bg-white p-8 relative">
                        <MemphisTriangle
                            color="dark"
                            size="md"
                            className="absolute top-4 right-4 opacity-20"
                        />

                        <div className="relative z-10">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-6 text-dark">
                                <span className="w-8 h-8 flex items-center justify-center bg-dark">
                                    <i className="fa-duotone fa-regular fa-shield-check text-white text-sm"></i>
                                </span>
                                Privacy Settings
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-4 border-b-2 border-cream">
                                    <div>
                                        <div className="text-sm font-black uppercase tracking-wide text-dark">
                                            Show success metrics
                                        </div>
                                        <div className="text-xs text-dark/60 font-bold mt-1">
                                            Display placement count and success
                                            rate
                                        </div>
                                    </div>
                                    <Toggle
                                        enabled={settings.show_success_metrics}
                                        onChange={(enabled) =>
                                            updateSettings({
                                                show_success_metrics: enabled,
                                            })
                                        }
                                        color="teal"
                                    />
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <div className="text-sm font-black uppercase tracking-wide text-dark">
                                            Show contact information
                                        </div>
                                        <div className="text-xs text-dark/60 font-bold mt-1">
                                            Display email and phone to
                                            candidates
                                        </div>
                                    </div>
                                    <Toggle
                                        enabled={settings.show_contact_info}
                                        onChange={(enabled) =>
                                            updateSettings({
                                                show_contact_info: enabled,
                                            })
                                        }
                                        color="teal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
