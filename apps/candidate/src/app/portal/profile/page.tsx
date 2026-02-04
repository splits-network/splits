"use client";

import { useState, useEffect, useMemo, FormEvent, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { MarketplaceProfile } from "@splits-network/shared-types";
import {
    calculateProfileCompleteness,
    TIER_CONFIG,
} from "@/lib/utils/profile-completeness";
import { useToast } from "@/lib/toast-context";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface CandidateSettings {
    id: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    skills?: string[];
    //industries?: string[];
    //specialties?: string[];
    bio?: string;
    marketplace_profile?: MarketplaceProfile;
    marketplace_visibility?: "public" | "limited" | "hidden";
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    show_current_company?: boolean;
    show_salary_expectations?: boolean;
    desired_salary_min?: number;
    desired_salary_max?: number;
    desired_job_type?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    availability?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Freelance"];
const AVAILABILITY_OPTIONS = [
    "Immediate",
    "2 weeks",
    "1 month",
    "2+ months",
    "Not actively looking",
];

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

export default function ProfilePage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const { user: clerkUser } = useUser();
    const [settings, setSettings] = useState<CandidateSettings | null>(null);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Accumulate changes for batch saving
    const pendingChangesRef = useRef<Partial<CandidateSettings>>({});

    // Name edit state
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [nameSuccess, setNameSuccess] = useState("");

    // Calculate profile completeness
    const completeness = useMemo(() => {
        if (!settings)
            return {
                percentage: 0,
                tier: "incomplete" as const,
                completedFields: [],
                missingFields: [],
            };
        return calculateProfileCompleteness(settings);
    }, [settings]);

    const tierBadge = useMemo(() => {
        const config = TIER_CONFIG[completeness.tier];
        return {
            label: config.title,
            color: `badge-${config.color}`,
            icon:
                completeness.tier === "complete"
                    ? "fa-check-circle"
                    : "fa-star",
        };
    }, [completeness.tier]);

    const topPriorities = useMemo(() => {
        return completeness.missingFields.slice(0, 3);
    }, [completeness.missingFields]);

    const incentives = useMemo(() => {
        const config = TIER_CONFIG[completeness.tier];
        return config.benefits || [];
    }, [completeness.tier]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError("Please sign in to manage profile settings.");
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const result = await client.get("/candidates/me", {
                params: {
                    include: "user",
                },
            });
            const dataArray = result.data || result;
            let data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
            // If candidate doesn't exist (self-signup without recruiter invitation), create one
            if (!data) {
                try {
                    // Create candidate record using Clerk user data
                    const createResult = await client.post("/candidates", {
                        full_name:
                            clerkUser?.fullName ||
                            clerkUser?.firstName ||
                            "New Candidate",
                        email:
                            clerkUser?.primaryEmailAddress?.emailAddress || "",
                    });
                    data = createResult.data || createResult;
                } catch (createErr: any) {
                    console.error(
                        "Failed to create candidate profile:",
                        createErr,
                    );
                    setError(
                        "Failed to create candidate profile. Please try again or contact support.",
                    );
                    setLoading(false);
                    return;
                }
            }

            setCandidateId(data.id);
            setSettings({
                id: data.id,
                phone: data.phone || "",
                location: data.location || "",
                current_title: data.current_title || "",
                current_company: data.current_company || "",
                linkedin_url: data.linkedin_url || "",
                github_url: data.github_url || "",
                portfolio_url: data.portfolio_url || "",
                skills: data.skills || [],
                //industries: data.industries || [],
                //specialties: data.specialties || [],
                bio: data.bio || "",
                marketplace_profile: data.marketplace_profile || {},
                marketplace_visibility: data.marketplace_visibility || "public",
                show_email: data.show_email ?? true,
                show_phone: data.show_phone ?? true,
                show_location: data.show_location ?? true,
                show_current_company: data.show_current_company ?? true,
                show_salary_expectations:
                    data.show_salary_expectations ?? false,
                desired_salary_min: data.desired_salary_min || undefined,
                desired_salary_max: data.desired_salary_max || undefined,
                desired_job_type: data.desired_job_type || "",
                open_to_remote: data.open_to_remote ?? false,
                open_to_relocation: data.open_to_relocation ?? false,
                availability: data.availability || "",
                user: {
                    id: data.user?.id,
                    email: data.user?.email,
                    name: data.user?.name,
                },
            });
            setName(data.user?.name || "");
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to load candidate settings:", err);
            setError(err.message || "Failed to load settings");
            setLoading(false);
        }
    };

    const debouncedSave = useDebouncedCallback(async () => {
        if (!candidateId || Object.keys(pendingChangesRef.current).length === 0)
            return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const changesToSave = { ...pendingChangesRef.current };

            // Clear pending changes before saving to prevent race conditions
            pendingChangesRef.current = {};

            await client.patch(`/candidates/${candidateId}`, changesToSave);
            toast.success("Profile updated!");
            setSaving(false);
        } catch (err: any) {
            console.error("Failed to save settings:", err);
            toast.error("Failed to save changes");
            setError("Failed to save changes");
            setSaving(false);
        }
    }, 1000);

    const updateSettings = (updates: Partial<CandidateSettings>) => {
        if (!settings) return;
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        // Accumulate changes for batch saving
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            ...updates,
        };
        debouncedSave();
    };

    const updateBioRich = (bio_rich: string) => {
        updateSettings({
            marketplace_profile: {
                ...settings?.marketplace_profile,
                bio_rich,
            },
        });
    };

    const toggleIndustry = (industry: string) => {
        const industries = settings?.marketplace_profile?.industries || [];
        const updated = industries.includes(industry)
            ? industries.filter((i) => i !== industry)
            : [...industries, industry];
        updateSettings({
            marketplace_profile: {
                ...settings?.marketplace_profile,
                industries: updated,
            },
        });
    };

    const toggleSpecialty = (specialty: string) => {
        const specialties = settings?.marketplace_profile?.specialties || [];
        const updated = specialties.includes(specialty)
            ? specialties.filter((s) => s !== specialty)
            : [...specialties, specialty];
        updateSettings({
            marketplace_profile: {
                ...settings?.marketplace_profile,
                specialties: updated,
            },
        });
    };

    const handleNameSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        setSubmitting(true);
        setError("");
        setNameSuccess("");

        try {
            const token = await getToken();
            if (!token || !candidateId) {
                setError("Please sign in to update your profile.");
                setSubmitting(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/candidates/${candidateId}`, {
                full_name: name.trim(),
            });
            await client.patch(`/users/${settings?.user?.id}`, {
                name: name.trim(),
            });

            if (settings) {
                setSettings({
                    ...settings,
                    user: { ...settings.user!, name: name.trim() },
                });
            }
            setNameSuccess("Name updated successfully!");
            setTimeout(() => setNameSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to update name:", err);
            setError("Failed to update name. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                Your Profile
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Settings */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Profile Completeness Indicator */}
                    <div className="card bg-primary/10 border border-primary/20">
                        <div className="card-body">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Progress Ring */}
                                <div className="shrink-0 flex justify-center sm:justify-start">
                                    <div
                                        className="radial-progress text-primary"
                                        style={
                                            {
                                                "--value":
                                                    completeness.percentage,
                                                "--size": "6rem",
                                                "--thickness": "0.5rem",
                                            } as any
                                        }
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {completeness.percentage}%
                                            </div>
                                            <div className="text-xs text-base-content/70">
                                                Complete
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completeness Info */}
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                        <h3 className="text-xl font-bold">
                                            Profile Strength
                                        </h3>
                                        <span
                                            className={`badge ${tierBadge.color} badge-sm sm:badge-md gap-1 whitespace-nowrap self-center sm:self-auto`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${tierBadge.icon}`}
                                            ></i>
                                            {tierBadge.label}
                                        </span>
                                    </div>

                                    {/* Top Priorities */}
                                    {topPriorities.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-xs font-semibold text-base-content/70 mb-1">
                                                Top Priorities:
                                            </div>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                                                {topPriorities.map((field) => (
                                                    <span
                                                        key={field.name}
                                                        className="badge badge-sm badge-outline gap-1"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                                        {field.label} (+
                                                        {field.weight} pts)
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Incentives */}
                                    <div className="text-xs text-base-content/70">
                                        {incentives
                                            .slice(0, 3)
                                            .map((incentive, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-1"
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular ${completeness.tier === "complete" ? "fa-check" : "fa-star"} text-xs mt-0.5`}
                                                    ></i>
                                                    <span>{incentive}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Marketplace Participation */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">
                                Marketplace Participation
                            </h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Control your visibility to recruiters in the
                                marketplace
                            </p>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Visibility
                                </legend>
                                <select
                                    className="select w-full"
                                    value={
                                        settings?.marketplace_visibility ||
                                        "public"
                                    }
                                    onChange={(e) =>
                                        updateSettings({
                                            marketplace_visibility: e.target
                                                .value as any,
                                        })
                                    }
                                >
                                    <option value="public">
                                        Public - Visible to all candidates
                                    </option>
                                    <option value="limited">
                                        Limited - Visible to verified recruiters
                                        only
                                    </option>
                                    <option value="hidden">
                                        Hidden - Not visible in marketplace
                                    </option>
                                </select>
                            </fieldset>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Profile Information</h2>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Current Title
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Senior Software Engineer"
                                    maxLength={255}
                                    value={settings?.current_title || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            current_title: e.target.value,
                                        })
                                    }
                                />
                                <p className="fieldset-label">
                                    Your current job title
                                </p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Current Company
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Tech Corp"
                                    value={settings?.current_company || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            current_company: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Location
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., San Francisco, CA"
                                    value={settings?.location || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            location: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <MarkdownEditor
                                    className="fieldset"
                                    label="Profile Summary (Card Preview)"
                                    value={settings?.bio || ""}
                                    onChange={(value) =>
                                        updateSettings({ bio: value })
                                    }
                                    placeholder="Brief summary of your background and skills (shows on marketplace cards)"
                                    maxLength={500}
                                    showCount
                                    height={160}
                                    helperText="Short bio displayed on marketplace cards"
                                />
                            </fieldset>
                        </div>
                    </div>

                    {/* Online Presence */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-duotone fa-regular fa-globe"></i>
                                Online Presence
                            </h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Add links to your professional profiles and
                                portfolio
                            </p>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    <i className="fa-brands fa-linkedin text-[#0077B5] mr-1"></i>
                                    LinkedIn URL
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={settings?.linkedin_url || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            linkedin_url: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    <i className="fa-brands fa-github mr-1"></i>
                                    GitHub URL
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    placeholder="https://github.com/yourusername"
                                    value={settings?.github_url || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            github_url: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    <i className="fa-duotone fa-regular fa-briefcase mr-1"></i>
                                    Portfolio URL
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    placeholder="https://yourportfolio.com"
                                    value={settings?.portfolio_url || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            portfolio_url: e.target.value,
                                        })
                                    }
                                />
                                <p className="fieldset-label">
                                    Personal website, portfolio, or other
                                    professional URL
                                </p>
                            </fieldset>
                        </div>
                    </div>

                    {/* Industries */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Industries</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Select the industries you're interested in
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {INDUSTRY_OPTIONS.map((industry) => (
                                    <button
                                        key={industry}
                                        type="button"
                                        className={`btn btn-xs sm:btn-sm ${
                                            (
                                                settings?.marketplace_profile
                                                    ?.industries || []
                                            ).includes(industry)
                                                ? "btn-primary"
                                                : "btn-outline"
                                        }`}
                                        onClick={() => toggleIndustry(industry)}
                                    >
                                        {industry}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Specialties</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Select the roles/functions you specialize in
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {SPECIALTY_OPTIONS.map((specialty) => (
                                    <button
                                        key={specialty}
                                        type="button"
                                        className={`btn btn-xs sm:btn-sm ${
                                            (
                                                settings?.marketplace_profile
                                                    ?.specialties || []
                                            ).includes(specialty)
                                                ? "btn-primary"
                                                : "btn-outline"
                                        }`}
                                        onClick={() =>
                                            toggleSpecialty(specialty)
                                        }
                                    >
                                        {specialty}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Bio */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="card-title">Detailed Bio</h2>
                                <span className="badge badge-primary badge-sm gap-1">
                                    <i className="fa-duotone fa-regular fa-sparkles"></i>
                                    Boost Profile +12%
                                </span>
                            </div>
                            <p className="text-sm text-base-content/70 mb-4">
                                Share your story, achievements, and what makes
                                you unique. Supports Markdown formatting.
                            </p>

                            <MarkdownEditor
                                className="fieldset"
                                label="Your Story"
                                showCount
                                value={
                                    settings?.marketplace_profile?.bio_rich ||
                                    ""
                                }
                                onChange={(value) => updateBioRich(value)}
                                placeholder={`Tell recruiters about yourself...\n\nExample:\n- **8+ years** of software engineering experience\n- Led teams of 5-10 developers at high-growth startups\n- Expert in React, TypeScript, Node.js\n- Built products used by 1M+ users\n\nUse **bold**, *italic*, and bullet points to make it engaging!`}
                                helperText="Tip: Use Markdown for formatting (**, *, bullets). This will appear prominently on your marketplace profile."
                                height={240}
                            />
                        </div>
                    </div>

                    {/* Career Preferences */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Career Preferences</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Help recruiters find the right opportunities for
                                you
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Desired Salary (Min)
                                    </legend>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        placeholder="e.g., 100000"
                                        value={
                                            settings?.desired_salary_min || ""
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                desired_salary_min:
                                                    parseInt(e.target.value) ||
                                                    undefined,
                                            })
                                        }
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Desired Salary (Max)
                                    </legend>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        placeholder="e.g., 150000"
                                        value={
                                            settings?.desired_salary_max || ""
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                desired_salary_max:
                                                    parseInt(e.target.value) ||
                                                    undefined,
                                            })
                                        }
                                    />
                                </fieldset>
                            </div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Desired Job Type
                                </legend>
                                <select
                                    className="select w-full"
                                    value={settings?.desired_job_type || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            desired_job_type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select...</option>
                                    {JOB_TYPE_OPTIONS.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Availability
                                </legend>
                                <select
                                    className="select w-full"
                                    value={settings?.availability || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            availability: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select...</option>
                                    {AVAILABILITY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Open to Remote Work
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Include remote roles in matching
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={
                                            settings?.open_to_remote || false
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                open_to_remote:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Open to Relocation
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Show roles that require relocation
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={
                                            settings?.open_to_relocation ||
                                            false
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                open_to_relocation:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Privacy Settings</h2>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Show email address
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Display email to recruiters
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={settings?.show_email ?? true}
                                        onChange={(e) =>
                                            updateSettings({
                                                show_email: e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>

                            <div className="divider"></div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Show phone number
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Display phone to recruiters
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={settings?.show_phone ?? true}
                                        onChange={(e) =>
                                            updateSettings({
                                                show_phone: e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>

                            <div className="divider"></div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Show location
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Display location to recruiters
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={
                                            settings?.show_location ?? true
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                show_location: e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>

                            <div className="divider"></div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Show current company
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Display current employer
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={
                                            settings?.show_current_company ??
                                            true
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                show_current_company:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>

                            <div className="divider"></div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Show salary expectations
                                </legend>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="fieldset-label m-0">
                                        Display desired salary range
                                    </p>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={
                                            settings?.show_salary_expectations ??
                                            false
                                        }
                                        onChange={(e) =>
                                            updateSettings({
                                                show_salary_expectations:
                                                    e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>

                {/* Right Column - Profile & Account */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Profile & Account Card */}
                    <div className="card bg-base-200 shadow">
                        <form onSubmit={handleNameSubmit}>
                            <div className="card-body">
                                <h2 className="card-title">
                                    <i className="fa-duotone fa-regular fa-user"></i>
                                    Profile & Account
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    Manage your personal information
                                </p>

                                {nameSuccess && (
                                    <div className="alert alert-success mt-4">
                                        <i className="fa-duotone fa-regular fa-check"></i>
                                        <span>{nameSuccess}</span>
                                    </div>
                                )}

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Full Name *
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                    />
                                    <p className="fieldset-label">
                                        Your name will be synced to your account
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Email Address
                                    </legend>
                                    <input
                                        type="email"
                                        className="input w-full"
                                        value={
                                            clerkUser?.primaryEmailAddress
                                                ?.emailAddress ||
                                            settings?.user?.email ||
                                            ""
                                        }
                                        disabled
                                    />
                                    <p className="fieldset-label">
                                        Contact support to change your email
                                        address
                                    </p>
                                </fieldset>

                                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                    <button
                                        type="button"
                                        className="btn w-full sm:w-auto"
                                        onClick={() =>
                                            setName(settings?.user?.name || "")
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full sm:w-auto"
                                        disabled={
                                            submitting ||
                                            name === settings?.user?.name
                                        }
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-regular fa-floppy-disk"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Security Card */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-duotone fa-regular fa-shield-halved"></i>
                                Security
                            </h2>
                            <p className="text-sm text-base-content/70">
                                Manage your password and two-factor
                                authentication
                            </p>

                            <div className="space-y-4 mt-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="font-medium">
                                            Password
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Change your password to keep your
                                            account secure
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-ghost w-full sm:w-auto">
                                        <i className="fa-duotone fa-regular fa-key"></i>
                                        Change Password
                                    </button>
                                </div>

                                <div className="divider"></div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="font-medium">
                                            Two-Factor Authentication
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Add an extra layer of security to
                                            your account
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-ghost w-full sm:w-auto">
                                        <i className="fa-duotone fa-regular fa-shield-check"></i>
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
