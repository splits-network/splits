"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* --- Data ----------------------------------------------------------------- */

const settingsSections = [
    { id: "profile", label: "Profile", icon: "fa-duotone fa-regular fa-user" },
    {
        id: "notifications",
        label: "Notifications",
        icon: "fa-duotone fa-regular fa-bell",
    },
    {
        id: "security",
        label: "Security",
        icon: "fa-duotone fa-regular fa-shield",
    },
    {
        id: "billing",
        label: "Billing",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    {
        id: "integrations",
        label: "Integrations",
        icon: "fa-duotone fa-regular fa-plug",
    },
    {
        id: "preferences",
        label: "Preferences",
        icon: "fa-duotone fa-regular fa-sliders",
    },
];

const notificationSettings = [
    {
        id: "email_placements",
        label: "Placement updates",
        description: "Get notified when a placement status changes",
        enabled: true,
    },
    {
        id: "email_candidates",
        label: "New candidate submissions",
        description: "Alerts when recruiters submit candidates to your roles",
        enabled: true,
    },
    {
        id: "email_messages",
        label: "Direct messages",
        description: "Email notifications for new messages",
        enabled: false,
    },
    {
        id: "email_weekly",
        label: "Weekly digest",
        description: "Summary of marketplace activity and your pipeline",
        enabled: true,
    },
    {
        id: "email_marketing",
        label: "Product updates",
        description: "New features, tips, and Splits Network news",
        enabled: false,
    },
];

const integrations = [
    {
        name: "Slack",
        icon: "fa-brands fa-slack",
        status: "connected",
        description: "Post placement updates to your team channel",
    },
    {
        name: "Google Calendar",
        icon: "fa-brands fa-google",
        status: "connected",
        description: "Sync interview schedules automatically",
    },
    {
        name: "LinkedIn",
        icon: "fa-brands fa-linkedin-in",
        status: "disconnected",
        description: "Import candidate profiles and sync connections",
    },
    {
        name: "Greenhouse",
        icon: "fa-duotone fa-regular fa-seedling",
        status: "disconnected",
        description: "Two-way sync with your ATS pipeline",
    },
    {
        name: "Zapier",
        icon: "fa-duotone fa-regular fa-bolt",
        status: "disconnected",
        description: "Connect to 5,000+ apps with custom workflows",
    },
];

/* --- Page ----------------------------------------------------------------- */

export default function SettingsOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeSection, setActiveSection] = useState("profile");
    const [notifications, setNotifications] = useState(
        notificationSettings.reduce(
            (acc, n) => ({ ...acc, [n.id]: n.enabled }),
            {} as Record<string, boolean>,
        ),
    );
    const [twoFactor, setTwoFactor] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    const [timezone, setTimezone] = useState("America/Los_Angeles");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".settings-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".settings-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".settings-desc"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                )
                .fromTo(
                    $1(".settings-content"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="settings-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Account
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="settings-title-word inline-block opacity-0">
                                Your
                            </span>{" "}
                            <span className="settings-title-word inline-block opacity-0 text-primary">
                                settings.
                            </span>
                        </h1>
                        <p className="settings-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Manage your profile, security, notifications, and
                            integrations all in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="settings-content opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {settingsSections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left ${activeSection === s.id ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-200"}`}
                                >
                                    <i
                                        className={`${s.icon} w-4 text-center`}
                                    />
                                    {s.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-4">
                        {/* Profile */}
                        {activeSection === "profile" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Profile Information
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Update your personal details and public
                                    profile.
                                </p>

                                <div className="flex items-start gap-6 mb-8 pb-8 border-b border-base-300">
                                    <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center font-black text-2xl flex-shrink-0">
                                        SK
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">
                                            Profile Photo
                                        </p>
                                        <p className="text-xs text-base-content/40 mb-3">
                                            JPG or PNG. 1MB max.
                                        </p>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm btn-primary">
                                                Upload New
                                            </button>
                                            <button className="btn btn-sm btn-ghost">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="Sarah"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="Kim"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            defaultValue="sarah@example.com"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            defaultValue="+1 (415) 555-0142"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                    <fieldset className="md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            Bio
                                        </label>
                                        <textarea
                                            defaultValue="Veteran technical recruiter with 8+ years specializing in engineering and product placements."
                                            className="textarea textarea-bordered w-full h-24"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="San Francisco, CA"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="linkedin.com/in/sarahkim"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-base-300">
                                    <p className="text-xs text-base-content/30">
                                        Last updated 3 days ago
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn btn-primary"
                                        >
                                            {saved ? (
                                                <>
                                                    <i className="fa-solid fa-check" />{" "}
                                                    Saved
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeSection === "notifications" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Notification Preferences
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Control what emails and alerts you receive.
                                </p>

                                <div className="space-y-0">
                                    {notificationSettings.map((n) => (
                                        <div
                                            key={n.id}
                                            className="flex items-center justify-between py-5 border-b border-base-300"
                                        >
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {n.label}
                                                </p>
                                                <p className="text-xs text-base-content/40">
                                                    {n.description}
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-primary"
                                                checked={
                                                    notifications[n.id] || false
                                                }
                                                onChange={() =>
                                                    setNotifications((p) => ({
                                                        ...p,
                                                        [n.id]: !p[n.id],
                                                    }))
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-8 pt-6 border-t border-base-300">
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary"
                                    >
                                        {saved ? (
                                            <>
                                                <i className="fa-solid fa-check" />{" "}
                                                Saved
                                            </>
                                        ) : (
                                            "Save Preferences"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security */}
                        {activeSection === "security" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Security
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Manage your password and account security.
                                </p>

                                <div className="space-y-6">
                                    <div className="bg-base-200 p-6 border border-base-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold">
                                                    Password
                                                </h3>
                                                <p className="text-xs text-base-content/40">
                                                    Last changed 45 days ago
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-ghost">
                                                Change Password
                                            </button>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 flex-1 bg-success"
                                                />
                                            ))}
                                            <div className="h-1 flex-1 bg-base-300" />
                                        </div>
                                        <p className="text-[10px] text-success mt-1 font-semibold">
                                            Strong password
                                        </p>
                                    </div>

                                    <div className="bg-base-200 p-6 border border-base-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    Two-Factor Authentication{" "}
                                                    {twoFactor && (
                                                        <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase">
                                                            Active
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-base-content/40 mt-1">
                                                    Add an extra layer of
                                                    security to your account
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-success"
                                                checked={twoFactor}
                                                onChange={() =>
                                                    setTwoFactor(!twoFactor)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-base-200 p-6 border border-base-300">
                                        <h3 className="font-bold mb-3">
                                            Active Sessions
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    device: "Chrome on macOS",
                                                    location:
                                                        "San Francisco, CA",
                                                    current: true,
                                                    time: "Now",
                                                },
                                                {
                                                    device: "Safari on iPhone",
                                                    location:
                                                        "San Francisco, CA",
                                                    current: false,
                                                    time: "2 hours ago",
                                                },
                                                {
                                                    device: "Firefox on Windows",
                                                    location: "New York, NY",
                                                    current: false,
                                                    time: "3 days ago",
                                                },
                                            ].map((session, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between py-2 border-b border-base-300 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <i
                                                            className={`fa-duotone fa-regular fa-${session.current ? "laptop" : "mobile"} text-base-content/40`}
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {session.device}{" "}
                                                                {session.current && (
                                                                    <span className="text-[10px] text-success font-bold ml-1">
                                                                        CURRENT
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-base-content/40">
                                                                {
                                                                    session.location
                                                                }{" "}
                                                                &middot;{" "}
                                                                {session.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!session.current && (
                                                        <button className="btn btn-xs btn-ghost text-error">
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-error/5 border border-error/20 p-6">
                                        <h3 className="font-bold text-error mb-1">
                                            Danger Zone
                                        </h3>
                                        <p className="text-xs text-base-content/50 mb-4">
                                            Permanently delete your account and
                                            all associated data.
                                        </p>
                                        <button className="btn btn-sm btn-error btn-outline">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing */}
                        {activeSection === "billing" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Billing & Subscription
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Manage your plan and payment methods.
                                </p>

                                <div className="bg-base-200 border border-base-300 p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">
                                                    Pro Plan
                                                </h3>
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                                    Current
                                                </span>
                                            </div>
                                            <p className="text-sm text-base-content/50 mt-1">
                                                $49/month &middot; Renews March
                                                15, 2026
                                            </p>
                                        </div>
                                        <button className="btn btn-sm btn-ghost">
                                            Change Plan
                                        </button>
                                    </div>
                                    <div className="w-full bg-base-300 h-2 mb-2">
                                        <div
                                            className="bg-primary h-2"
                                            style={{ width: "72%" }}
                                        />
                                    </div>
                                    <p className="text-xs text-base-content/40">
                                        72% of billing period used
                                    </p>
                                </div>

                                <div className="bg-base-200 border border-base-300 p-6 mb-6">
                                    <h3 className="font-bold mb-4">
                                        Payment Method
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-7 bg-neutral text-neutral-content flex items-center justify-center text-xs font-bold">
                                                VISA
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    &bull;&bull;&bull;&bull;
                                                    &bull;&bull;&bull;&bull;
                                                    &bull;&bull;&bull;&bull;
                                                    4242
                                                </p>
                                                <p className="text-xs text-base-content/40">
                                                    Expires 08/2027
                                                </p>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-ghost">
                                            Update
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-base-200 border border-base-300 p-6">
                                    <h3 className="font-bold mb-4">
                                        Recent Invoices
                                    </h3>
                                    <div className="space-y-0">
                                        {[
                                            {
                                                date: "Feb 15, 2026",
                                                amount: "$49.00",
                                                status: "Paid",
                                            },
                                            {
                                                date: "Jan 15, 2026",
                                                amount: "$49.00",
                                                status: "Paid",
                                            },
                                            {
                                                date: "Dec 15, 2025",
                                                amount: "$49.00",
                                                status: "Paid",
                                            },
                                        ].map((inv, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between py-3 border-b border-base-300 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="fa-duotone fa-regular fa-file-invoice text-base-content/30" />
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {inv.date}
                                                        </p>
                                                        <p className="text-xs text-base-content/40">
                                                            {inv.amount}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase">
                                                        {inv.status}
                                                    </span>
                                                    <button className="btn btn-xs btn-ghost">
                                                        <i className="fa-duotone fa-regular fa-download" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Integrations */}
                        {activeSection === "integrations" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Integrations
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Connect your favorite tools to streamline
                                    your workflow.
                                </p>

                                <div className="space-y-4">
                                    {integrations.map((int) => (
                                        <div
                                            key={int.name}
                                            className="bg-base-200 border border-base-300 p-5 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-base-100 border border-base-300 flex items-center justify-center">
                                                    <i
                                                        className={`${int.icon} text-lg`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-sm">
                                                            {int.name}
                                                        </h3>
                                                        {int.status ===
                                                            "connected" && (
                                                            <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase">
                                                                Connected
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-base-content/40">
                                                        {int.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className={`btn btn-sm ${int.status === "connected" ? "btn-ghost text-error" : "btn-primary"}`}
                                            >
                                                {int.status === "connected"
                                                    ? "Disconnect"
                                                    : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preferences */}
                        {activeSection === "preferences" && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">
                                    Preferences
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Customize your experience.
                                </p>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                                            Appearance
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(
                                                [
                                                    "light",
                                                    "dark",
                                                    "system",
                                                ] as const
                                            ).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTheme(t)}
                                                    className={`p-4 border-2 text-center transition-all ${theme === t ? "border-coral bg-primary/5" : "border-base-300 hover:border-base-content/20"}`}
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular fa-${t === "light" ? "sun" : t === "dark" ? "moon" : "circle-half-stroke"} text-xl mb-2 block ${theme === t ? "text-primary" : "text-base-content/40"}`}
                                                    />
                                                    <span className="text-xs font-semibold capitalize">
                                                        {t}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-base-300 pt-8">
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                                            Locale
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <fieldset>
                                                <label className="text-xs font-semibold text-base-content/50 mb-2 block">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={timezone}
                                                    onChange={(e) =>
                                                        setTimezone(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="select select-bordered w-full"
                                                >
                                                    <option value="America/Los_Angeles">
                                                        Pacific Time (PT)
                                                    </option>
                                                    <option value="America/Denver">
                                                        Mountain Time (MT)
                                                    </option>
                                                    <option value="America/Chicago">
                                                        Central Time (CT)
                                                    </option>
                                                    <option value="America/New_York">
                                                        Eastern Time (ET)
                                                    </option>
                                                </select>
                                            </fieldset>
                                            <fieldset>
                                                <label className="text-xs font-semibold text-base-content/50 mb-2 block">
                                                    Date Format
                                                </label>
                                                <select className="select select-bordered w-full">
                                                    <option>MM/DD/YYYY</option>
                                                    <option>DD/MM/YYYY</option>
                                                    <option>YYYY-MM-DD</option>
                                                </select>
                                            </fieldset>
                                        </div>
                                    </div>

                                    <div className="border-t border-base-300 pt-8">
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                                            Accessibility
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        Reduce motion
                                                    </p>
                                                    <p className="text-xs text-base-content/40">
                                                        Minimize animations and
                                                        transitions
                                                    </p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        High contrast
                                                    </p>
                                                    <p className="text-xs text-base-content/40">
                                                        Increase contrast for
                                                        better readability
                                                    </p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 pt-6 border-t border-base-300">
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary"
                                    >
                                        {saved ? (
                                            <>
                                                <i className="fa-solid fa-check" />{" "}
                                                Saved
                                            </>
                                        ) : (
                                            "Save Preferences"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
