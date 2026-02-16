"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StepMeta {
    key: string;
    label: string;
    icon: string;
    description: string;
}

const STEPS: StepMeta[] = [
    {
        key: "welcome",
        label: "Welcome",
        icon: "fa-duotone fa-regular fa-hand-wave",
        description: "Let's get you started",
    },
    {
        key: "profile",
        label: "Your Profile",
        icon: "fa-duotone fa-regular fa-user-pen",
        description: "Tell us about yourself",
    },
    {
        key: "company",
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
        description: "Set up your organization",
    },
    {
        key: "preferences",
        label: "Preferences",
        icon: "fa-duotone fa-regular fa-sliders",
        description: "Customize your experience",
    },
    {
        key: "complete",
        label: "All Set",
        icon: "fa-duotone fa-regular fa-rocket-launch",
        description: "You're ready to go",
    },
];

const INDUSTRIES = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Legal",
    "Marketing",
    "Consulting",
    "Non-Profit",
];

const SPECIALIZATIONS = [
    "Executive Search",
    "Technical Recruiting",
    "Healthcare Staffing",
    "Financial Services",
    "Sales & Marketing",
    "Engineering",
    "Product & Design",
    "Data & Analytics",
    "Operations",
    "Human Resources",
];

const NOTIFICATION_OPTIONS = [
    {
        key: "new_roles",
        label: "New matching roles",
        description: "Get notified when roles match your criteria",
    },
    {
        key: "candidate_updates",
        label: "Candidate updates",
        description: "Status changes on submitted candidates",
    },
    {
        key: "messages",
        label: "Direct messages",
        description: "When someone sends you a message",
    },
    {
        key: "weekly_digest",
        label: "Weekly digest",
        description: "Summary of marketplace activity",
    },
    {
        key: "placement_alerts",
        label: "Placement alerts",
        description: "When placements are confirmed",
    },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OnboardingFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);

    /* form state */
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [title, setTitle] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [companyName, setCompanyName] = useState("");
    const [companySize, setCompanySize] = useState("");
    const [website, setWebsite] = useState("");
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<Record<string, boolean>>(
        {
            new_roles: true,
            candidate_updates: true,
            messages: true,
            weekly_digest: false,
            placement_alerts: true,
        },
    );
    const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(false);

    /* animate step content on change */
    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-step-content",
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            );
        },
        { dependencies: [step], scope: containerRef },
    );

    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-onboard-hero",
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            );
        },
        { scope: containerRef },
    );

    /* helpers */
    const toggleIndustry = (ind: string) =>
        setSelectedIndustries((prev) =>
            prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind],
        );

    const toggleSpec = (spec: string) =>
        setSelectedSpecs((prev) =>
            prev.includes(spec)
                ? prev.filter((s) => s !== spec)
                : [...prev, spec],
        );

    const toggleNotif = (key: string) =>
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleAvatarChange = () => {
        setAvatarPreview("/avatar-placeholder.jpg");
    };

    const handleComplete = () => {
        setCompleting(true);
        setTimeout(() => {
            setCompleting(false);
            setCompleted(true);
        }, 2000);
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return true;
            case 1:
                return firstName.trim() !== "" && lastName.trim() !== "";
            case 2:
                return companyName.trim() !== "";
            case 3:
                return selectedSpecs.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const progress = ((step + 1) / STEPS.length) * 100;

    /* ---------------------------------------------------------------- */
    /*  Step renderers                                                   */
    /* ---------------------------------------------------------------- */

    const renderWelcome = () => (
        <div className="cin-step-content flex flex-col items-center text-center max-w-2xl mx-auto gap-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fa-duotone fa-regular fa-hand-wave text-4xl text-primary" />
            </div>
            <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                    Welcome to Splits Network
                </h2>
                <p className="text-base-content/60 text-lg leading-relaxed">
                    The split-fee recruiting marketplace that connects top
                    recruiters with hiring companies. Let&apos;s get your
                    account set up in just a few minutes.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
                {[
                    {
                        icon: "fa-handshake",
                        title: "Split Fees",
                        desc: "Collaborate with other recruiters",
                    },
                    {
                        icon: "fa-magnifying-glass-dollar",
                        title: "Find Roles",
                        desc: "Access exclusive job listings",
                    },
                    {
                        icon: "fa-chart-line",
                        title: "Grow",
                        desc: "Track your placements & revenue",
                    },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="bg-base-200/50 border border-base-300 rounded-lg p-5 text-center"
                    >
                        <i
                            className={`fa-duotone fa-regular ${item.icon} text-2xl text-primary mb-3 block`}
                        />
                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-base-content/50">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="cin-step-content max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    Your Profile
                </h2>
                <p className="text-base-content/60">
                    This information helps companies and recruiters find you.
                </p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center overflow-hidden border-2 border-base-300">
                    {avatarPreview ? (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-user text-2xl text-primary" />
                        </div>
                    ) : (
                        <i className="fa-duotone fa-regular fa-camera text-xl text-base-content/40" />
                    )}
                </div>
                <div>
                    <button
                        onClick={handleAvatarChange}
                        className="btn btn-sm btn-outline border-base-300"
                    >
                        Upload Photo
                    </button>
                    <p className="text-xs text-base-content/40 mt-1">
                        JPG, PNG. Max 2MB.
                    </p>
                </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        First Name *
                    </legend>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sarah"
                        className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    />
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Last Name *
                    </legend>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Chen"
                        className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    />
                </fieldset>
            </div>

            {/* Title & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Job Title
                    </legend>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Senior Recruiter"
                        className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    />
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Phone
                    </legend>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    />
                </fieldset>
            </div>

            {/* Bio */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                    Bio
                </legend>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A brief introduction about your recruiting experience..."
                    rows={4}
                    className="textarea textarea-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                />
                <p className="text-xs text-base-content/40 mt-1">
                    {bio.length}/300 characters
                </p>
            </fieldset>
        </div>
    );

    const renderCompany = () => (
        <div className="cin-step-content max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    Your Company
                </h2>
                <p className="text-base-content/60">
                    Tell us about the organization you represent.
                </p>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                    Company Name *
                </legend>
                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Recruiting"
                    className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                />
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Company Size
                    </legend>
                    <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="select select-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                    </select>
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Website
                    </legend>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://acme-recruiting.com"
                        className="input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral"
                    />
                </fieldset>
            </div>

            {/* Industries */}
            <div>
                <p className="text-xs uppercase tracking-wider text-base-content/50 mb-3 font-semibold">
                    Industries You Recruit For
                </p>
                <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => toggleIndustry(ind)}
                            className={`btn btn-sm rounded-full ${
                                selectedIndustries.includes(ind)
                                    ? "btn-primary"
                                    : "btn-outline border-base-300 hover:border-coral"
                            }`}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logo upload zone */}
            <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center hover:border-coral/40 transition-colors cursor-pointer">
                <i className="fa-duotone fa-regular fa-cloud-arrow-up text-3xl text-base-content/30 mb-3 block" />
                <p className="text-sm font-semibold text-base-content/60">
                    Drop your company logo here
                </p>
                <p className="text-xs text-base-content/40 mt-1">
                    SVG, PNG, or JPG (max 1MB)
                </p>
            </div>
        </div>
    );

    const renderPreferences = () => (
        <div className="cin-step-content max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    Preferences
                </h2>
                <p className="text-base-content/60">
                    Customize how Splits Network works for you.
                </p>
            </div>

            {/* Specializations */}
            <div>
                <p className="text-xs uppercase tracking-wider text-base-content/50 mb-1 font-semibold">
                    Your Specializations *
                </p>
                <p className="text-xs text-base-content/40 mb-3">
                    Select at least one area of expertise.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => toggleSpec(spec)}
                            className={`btn btn-sm justify-start gap-2 ${
                                selectedSpecs.includes(spec)
                                    ? "btn-primary"
                                    : "btn-ghost border border-base-300"
                            }`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${
                                    selectedSpecs.includes(spec)
                                        ? "fa-circle-check"
                                        : "fa-circle"
                                } text-xs`}
                            />
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div>
                <p className="text-xs uppercase tracking-wider text-base-content/50 mb-3 font-semibold">
                    Notification Preferences
                </p>
                <div className="space-y-3">
                    {NOTIFICATION_OPTIONS.map((opt) => (
                        <label
                            key={opt.key}
                            className="flex items-center justify-between p-3 bg-base-200/50 border border-base-300 rounded-lg cursor-pointer hover:border-coral/30 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-semibold">
                                    {opt.label}
                                </p>
                                <p className="text-xs text-base-content/50">
                                    {opt.description}
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={notifications[opt.key] ?? false}
                                onChange={() => toggleNotif(opt.key)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Theme */}
            <div>
                <p className="text-xs uppercase tracking-wider text-base-content/50 mb-3 font-semibold">
                    Appearance
                </p>
                <div className="flex gap-3">
                    {(["system", "light", "dark"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`btn btn-sm flex-1 capitalize ${
                                theme === t
                                    ? "btn-primary"
                                    : "btn-ghost border border-base-300"
                            }`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${
                                    t === "system"
                                        ? "fa-display"
                                        : t === "light"
                                          ? "fa-sun"
                                          : "fa-moon"
                                } mr-1`}
                            />
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderComplete = () => (
        <div className="cin-step-content flex flex-col items-center text-center max-w-2xl mx-auto gap-8">
            {completed ? (
                <>
                    <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-circle-check text-4xl text-success" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            You&apos;re All Set!
                        </h2>
                        <p className="text-base-content/60 text-lg leading-relaxed">
                            Your account is ready. Start exploring the
                            marketplace, find matching roles, and connect with
                            other recruiters.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        {[
                            {
                                icon: "fa-briefcase",
                                label: "Browse Roles",
                                desc: "Explore open positions",
                            },
                            {
                                icon: "fa-users",
                                label: "Find Partners",
                                desc: "Connect with recruiters",
                            },
                            {
                                icon: "fa-user-plus",
                                label: "Add Candidate",
                                desc: "Submit your first candidate",
                            },
                        ].map((action) => (
                            <button
                                key={action.label}
                                className="btn btn-ghost border border-base-300 h-auto py-6 flex-col gap-2 hover:border-coral/40"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${action.icon} text-2xl text-primary`}
                                />
                                <span className="font-bold text-sm">
                                    {action.label}
                                </span>
                                <span className="text-xs text-base-content/50">
                                    {action.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-rocket-launch text-4xl text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Ready to Launch?
                        </h2>
                        <p className="text-base-content/60 text-lg leading-relaxed">
                            Here&apos;s a summary of your setup. Click finish to
                            complete your onboarding.
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="w-full bg-base-200/50 border border-base-300 rounded-lg p-6 text-left space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-base-300">
                            <span className="text-sm text-base-content/50">
                                Name
                            </span>
                            <span className="font-semibold text-sm">
                                {firstName} {lastName}
                            </span>
                        </div>
                        {title && (
                            <div className="flex justify-between items-center pb-3 border-b border-base-300">
                                <span className="text-sm text-base-content/50">
                                    Title
                                </span>
                                <span className="font-semibold text-sm">
                                    {title}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pb-3 border-b border-base-300">
                            <span className="text-sm text-base-content/50">
                                Company
                            </span>
                            <span className="font-semibold text-sm">
                                {companyName}
                            </span>
                        </div>
                        {selectedIndustries.length > 0 && (
                            <div className="flex justify-between items-start pb-3 border-b border-base-300">
                                <span className="text-sm text-base-content/50">
                                    Industries
                                </span>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                    {selectedIndustries.map((ind) => (
                                        <span
                                            key={ind}
                                            className="badge badge-sm badge-primary badge-outline"
                                        >
                                            {ind}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-start">
                            <span className="text-sm text-base-content/50">
                                Specializations
                            </span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                {selectedSpecs.map((spec) => (
                                    <span
                                        key={spec}
                                        className="badge badge-sm badge-primary"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="btn btn-primary btn-lg"
                    >
                        {completing ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Setting up your account...
                            </>
                        ) : (
                            <>
                                Complete Setup
                                <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                            </>
                        )}
                    </button>
                </>
            )}
        </div>
    );

    const stepRenderers = [
        renderWelcome,
        renderProfile,
        renderCompany,
        renderPreferences,
        renderComplete,
    ];

    /* ---------------------------------------------------------------- */
    /*  Layout                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-base-100 flex flex-col"
        >
            {/* Header */}
            <header className="cin-onboard-hero bg-neutral text-neutral-content">
                <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-split text-sm text-primary-content" />
                        </div>
                        <span className="font-black text-lg tracking-tight">
                            Splits
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-content/50">
                            Step {step + 1} of {STEPS.length}
                        </span>
                        <button className="btn btn-ghost btn-sm text-neutral-content/60 hover:text-neutral-content">
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Step indicator - desktop */}
            <div className="hidden md:block border-b border-base-300 bg-base-100">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.key}
                                onClick={() => {
                                    if (i < step) setStep(i);
                                }}
                                disabled={i > step}
                                className={`flex items-center gap-2 px-5 py-4 text-sm border-b-2 transition-colors ${
                                    i === step
                                        ? "border-coral text-primary font-semibold"
                                        : i < step
                                          ? "border-transparent text-base-content/60 hover:text-primary cursor-pointer"
                                          : "border-transparent text-base-content/30 cursor-not-allowed"
                                }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        i < step
                                            ? "bg-primary text-primary-content"
                                            : i === step
                                              ? "bg-primary/10 text-primary border border-coral"
                                              : "bg-base-300 text-base-content/40"
                                    }`}
                                >
                                    {i < step ? (
                                        <i className="fa-duotone fa-regular fa-check text-[10px]" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className="hidden lg:inline">
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile step label */}
            <div className="md:hidden px-6 py-3 border-b border-base-300 flex items-center gap-2">
                <i className={`${STEPS[step].icon} text-primary text-sm`} />
                <span className="font-semibold text-sm">
                    {STEPS[step].label}
                </span>
                <span className="text-xs text-base-content/40 ml-auto">
                    {STEPS[step].description}
                </span>
            </div>

            {/* Step Content */}
            <main className="flex-1 py-10 px-6">{stepRenderers[step]()}</main>

            {/* Footer nav */}
            {!completed && (
                <footer className="border-t border-base-300 bg-base-100">
                    <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            disabled={step === 0}
                            className="btn btn-ghost btn-sm gap-2 disabled:opacity-30"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left text-xs" />
                            Back
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Dots for mobile */}
                            <div className="flex gap-1.5 md:hidden">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            i === step
                                                ? "bg-primary"
                                                : i < step
                                                  ? "bg-primary/40"
                                                  : "bg-base-300"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() =>
                                    setStep((s) =>
                                        Math.min(STEPS.length - 1, s + 1),
                                    )
                                }
                                disabled={!canProceed()}
                                className="btn btn-primary btn-sm gap-2"
                            >
                                Continue
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>
                </footer>
            )}
        </div>
    );
}
