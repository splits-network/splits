"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const TABS = [
    { id: "account", label: "Account", icon: "fa-duotone fa-regular fa-user" },
    {
        id: "notifications",
        label: "Notifications",
        icon: "fa-duotone fa-regular fa-bell",
    },
    {
        id: "privacy",
        label: "Privacy & Security",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        id: "billing",
        label: "Billing",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    { id: "team", label: "Team", icon: "fa-duotone fa-regular fa-users" },
    {
        id: "integrations",
        label: "Integrations",
        icon: "fa-duotone fa-regular fa-puzzle-piece",
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: "fa-duotone fa-regular fa-palette",
    },
];

export default function SettingsFourPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const [accountForm, setAccountForm] = useState({
        name: "Sarah Chen",
        email: "sarah@techhire.com",
        phone: "+1 (415) 555-0142",
        agency: "TechHire Partners",
        title: "Senior Technical Recruiter",
        location: "San Francisco, CA",
        bio: "Passionate about connecting exceptional talent with companies building the future.",
    });
    const [notifs, setNotifs] = useState({
        emailNewApp: true,
        emailPlacement: true,
        emailMessage: true,
        emailDigest: false,
        pushNewApp: true,
        pushMessage: true,
        pushPlacement: false,
        inAppAll: true,
    });
    const [privacy, setPrivacy] = useState({
        profilePublic: true,
        showEmail: false,
        showPhone: false,
        twoFactor: true,
        loginAlerts: true,
        sessionTimeout: "30",
    });
    const [appearance, setAppearance] = useState({
        theme: "dark",
        density: "comfortable",
        animationsEnabled: true,
    });

    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
            );
        }
    }, [activeTab]);

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1200));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const renderToggle = (checked: boolean, onChange: () => void) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="toggle toggle-primary toggle-sm"
        />
    );

    return (
        <div className="cin-page min-h-screen bg-base-100">
            {/* Header */}
            <div className="bg-neutral text-white">
                <div className="max-w-6xl mx-auto px-6 py-10 lg:py-12">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-3">
                        Cinematic Editorial
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-2">
                        <span className="text-primary">Settings</span>
                    </h1>
                    <p className="text-base text-white/50">
                        Manage your account, notifications, and preferences.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="hidden lg:block w-[220px] shrink-0">
                        <nav className="sticky top-4 space-y-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-primary-content shadow-sm" : "text-base-content/50 hover:text-base-content hover:bg-base-200"}`}
                                >
                                    <i
                                        className={`${tab.icon} w-5 text-center`}
                                    />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Mobile Tabs */}
                    <div className="lg:hidden w-full">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="select select-bordered w-full bg-base-200 border-base-content/10 mb-6 font-medium"
                        >
                            {TABS.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div
                        ref={contentRef}
                        className="flex-1 min-w-0 hidden lg:block"
                    >
                        {activeTab === "account" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Account Settings
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Update your personal and professional
                                        information.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
                                        alt=""
                                        className="w-16 h-16 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold">
                                            {accountForm.name}
                                        </div>
                                        <div className="text-xs text-base-content/40">
                                            {accountForm.email}
                                        </div>
                                    </div>
                                    <button className="btn btn-sm bg-base-300 border-base-content/10 font-medium">
                                        Change Avatar
                                    </button>
                                </div>
                                <fieldset className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={accountForm.name}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={accountForm.email}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={accountForm.phone}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={accountForm.title}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Agency
                                            </label>
                                            <input
                                                type="text"
                                                value={accountForm.agency}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        agency: e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={accountForm.location}
                                                onChange={(e) =>
                                                    setAccountForm({
                                                        ...accountForm,
                                                        location:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Bio
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={accountForm.bio}
                                            onChange={(e) =>
                                                setAccountForm({
                                                    ...accountForm,
                                                    bio: e.target.value,
                                                })
                                            }
                                            className="textarea textarea-bordered bg-base-200 border-base-content/10 w-full focus:border-coral focus:outline-none"
                                        />
                                    </div>
                                </fieldset>
                                <div className="border-t border-base-content/5 pt-4">
                                    <h3 className="font-bold text-sm mb-3 text-error">
                                        Danger Zone
                                    </h3>
                                    <button className="btn btn-sm btn-outline border-error text-error hover:bg-error hover:border-error hover:text-white font-medium">
                                        <i className="fa-duotone fa-regular fa-trash" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Notification Preferences
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Choose how and when you want to be
                                        notified.
                                    </p>
                                </div>
                                {[
                                    {
                                        title: "Email Notifications",
                                        items: [
                                            {
                                                label: "New applications",
                                                desc: "When a candidate applies to your listing",
                                                key: "emailNewApp" as const,
                                            },
                                            {
                                                label: "Placements",
                                                desc: "When a placement is confirmed",
                                                key: "emailPlacement" as const,
                                            },
                                            {
                                                label: "Messages",
                                                desc: "New messages from candidates or companies",
                                                key: "emailMessage" as const,
                                            },
                                            {
                                                label: "Weekly digest",
                                                desc: "Summary of activity each week",
                                                key: "emailDigest" as const,
                                            },
                                        ],
                                    },
                                    {
                                        title: "Push Notifications",
                                        items: [
                                            {
                                                label: "New applications",
                                                desc: "Instant notification for new applicants",
                                                key: "pushNewApp" as const,
                                            },
                                            {
                                                label: "Messages",
                                                desc: "Real-time message alerts",
                                                key: "pushMessage" as const,
                                            },
                                            {
                                                label: "Placements",
                                                desc: "Placement confirmations",
                                                key: "pushPlacement" as const,
                                            },
                                        ],
                                    },
                                ].map((group) => (
                                    <div key={group.title}>
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-0 border border-base-content/5 rounded-xl overflow-hidden">
                                            {group.items.map((item, i) => (
                                                <div
                                                    key={item.key}
                                                    className={`flex items-center justify-between px-4 py-3 ${i < group.items.length - 1 ? "border-b border-base-content/5" : ""}`}
                                                >
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {item.label}
                                                        </div>
                                                        <div className="text-xs text-base-content/40">
                                                            {item.desc}
                                                        </div>
                                                    </div>
                                                    {renderToggle(
                                                        notifs[item.key],
                                                        () =>
                                                            setNotifs({
                                                                ...notifs,
                                                                [item.key]:
                                                                    !notifs[
                                                                        item.key
                                                                    ],
                                                            }),
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "privacy" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Privacy & Security
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Control your privacy and protect your
                                        account.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                        Profile Visibility
                                    </h3>
                                    <div className="space-y-0 border border-base-content/5 rounded-xl overflow-hidden">
                                        {[
                                            {
                                                label: "Public profile",
                                                desc: "Allow anyone to view your profile",
                                                key: "profilePublic" as const,
                                            },
                                            {
                                                label: "Show email",
                                                desc: "Display email on your public profile",
                                                key: "showEmail" as const,
                                            },
                                            {
                                                label: "Show phone",
                                                desc: "Display phone on your public profile",
                                                key: "showPhone" as const,
                                            },
                                        ].map((item, i, arr) => (
                                            <div
                                                key={item.key}
                                                className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-base-content/5" : ""}`}
                                            >
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-xs text-base-content/40">
                                                        {item.desc}
                                                    </div>
                                                </div>
                                                {renderToggle(
                                                    privacy[item.key],
                                                    () =>
                                                        setPrivacy({
                                                            ...privacy,
                                                            [item.key]:
                                                                !privacy[
                                                                    item.key
                                                                ],
                                                        }),
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                        Security
                                    </h3>
                                    <div className="space-y-0 border border-base-content/5 rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/5">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Two-factor authentication
                                                </div>
                                                <div className="text-xs text-base-content/40">
                                                    Add extra security to your
                                                    account
                                                </div>
                                            </div>
                                            {renderToggle(
                                                privacy.twoFactor,
                                                () =>
                                                    setPrivacy({
                                                        ...privacy,
                                                        twoFactor:
                                                            !privacy.twoFactor,
                                                    }),
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/5">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Login alerts
                                                </div>
                                                <div className="text-xs text-base-content/40">
                                                    Get notified of new login
                                                    activity
                                                </div>
                                            </div>
                                            {renderToggle(
                                                privacy.loginAlerts,
                                                () =>
                                                    setPrivacy({
                                                        ...privacy,
                                                        loginAlerts:
                                                            !privacy.loginAlerts,
                                                    }),
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Session timeout
                                                </div>
                                                <div className="text-xs text-base-content/40">
                                                    Auto-logout after inactivity
                                                </div>
                                            </div>
                                            <select
                                                value={privacy.sessionTimeout}
                                                onChange={(e) =>
                                                    setPrivacy({
                                                        ...privacy,
                                                        sessionTimeout:
                                                            e.target.value,
                                                    })
                                                }
                                                className="select select-sm select-bordered bg-base-200 border-base-content/10 font-medium"
                                            >
                                                <option value="15">
                                                    15 min
                                                </option>
                                                <option value="30">
                                                    30 min
                                                </option>
                                                <option value="60">
                                                    1 hour
                                                </option>
                                                <option value="never">
                                                    Never
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn btn-sm bg-base-200 border-base-content/10 font-medium">
                                        <i className="fa-duotone fa-regular fa-key" />
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "billing" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Billing & Subscription
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Manage your plan and payment methods.
                                    </p>
                                </div>
                                <div className="border-2 border-coral/20 bg-primary/5 rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="badge badge-primary font-semibold mb-2">
                                                Pro Plan
                                            </span>
                                            <div className="text-2xl font-black">
                                                $99
                                                <span className="text-sm text-base-content/40 font-normal">
                                                    /month
                                                </span>
                                            </div>
                                            <p className="text-sm text-base-content/40 mt-1">
                                                Next billing date: March 14,
                                                2026
                                            </p>
                                        </div>
                                        <button className="btn btn-primary btn-sm font-semibold">
                                            Upgrade
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                        Payment Method
                                    </h3>
                                    <div className="border border-base-content/5 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                                                <i className="fa-brands fa-cc-visa text-lg" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Visa ending in 4242
                                                </div>
                                                <div className="text-xs text-base-content/40">
                                                    Expires 12/2028
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm bg-base-200 border-base-content/10 font-medium">
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "team" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black mb-1">
                                            Team Management
                                        </h2>
                                        <p className="text-sm text-base-content/40">
                                            Manage your team members and
                                            permissions.
                                        </p>
                                    </div>
                                    <button className="btn btn-primary btn-sm font-semibold">
                                        <i className="fa-duotone fa-regular fa-user-plus" />
                                        Invite
                                    </button>
                                </div>
                                <div className="border border-base-content/5 rounded-xl overflow-hidden">
                                    {[
                                        {
                                            name: "Sarah Chen",
                                            email: "sarah@techhire.com",
                                            role: "Owner",
                                            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                                        },
                                        {
                                            name: "Michael Torres",
                                            email: "michael@techhire.com",
                                            role: "Admin",
                                            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                                        },
                                        {
                                            name: "Jessica Park",
                                            email: "jessica@techhire.com",
                                            role: "Member",
                                            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
                                        },
                                    ].map((m, i, arr) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-base-content/5" : ""}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={m.avatar}
                                                    alt=""
                                                    className="w-9 h-9 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {m.name}
                                                    </div>
                                                    <div className="text-xs text-base-content/40">
                                                        {m.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="badge badge-sm bg-base-200 border-0 font-medium">
                                                    {m.role}
                                                </span>
                                                <button className="btn btn-ghost btn-xs btn-square">
                                                    <i className="fa-duotone fa-regular fa-ellipsis-vertical text-base-content/30" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "integrations" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Integrations
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Connect third-party tools to enhance
                                        your workflow.
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        {
                                            name: "Slack",
                                            desc: "Get notifications in Slack channels",
                                            icon: "fa-brands fa-slack",
                                            connected: true,
                                        },
                                        {
                                            name: "Google Calendar",
                                            desc: "Sync interviews and meetings",
                                            icon: "fa-brands fa-google",
                                            connected: true,
                                        },
                                        {
                                            name: "LinkedIn",
                                            desc: "Import candidate profiles",
                                            icon: "fa-brands fa-linkedin",
                                            connected: false,
                                        },
                                        {
                                            name: "Zapier",
                                            desc: "Automate workflows",
                                            icon: "fa-duotone fa-regular fa-bolt",
                                            connected: false,
                                        },
                                    ].map((int, i) => (
                                        <div
                                            key={i}
                                            className="border border-base-content/5 rounded-xl p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                                                    <i
                                                        className={`${int.icon} text-lg`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {int.name}
                                                    </div>
                                                    <div className="text-xs text-base-content/40">
                                                        {int.desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className={`btn btn-sm font-medium ${int.connected ? "bg-success/10 text-success border-success/20" : "bg-base-200 border-base-content/10"}`}
                                            >
                                                {int.connected
                                                    ? "Connected"
                                                    : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1">
                                        Appearance
                                    </h2>
                                    <p className="text-sm text-base-content/40">
                                        Customize how the platform looks and
                                        feels.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                        Theme
                                    </h3>
                                    <div className="flex gap-3">
                                        {["light", "dark", "system"].map(
                                            (t) => (
                                                <button
                                                    key={t}
                                                    onClick={() =>
                                                        setAppearance({
                                                            ...appearance,
                                                            theme: t,
                                                        })
                                                    }
                                                    className={`flex-1 py-4 rounded-xl border-2 text-center font-semibold text-sm transition-all ${appearance.theme === t ? "border-coral bg-primary/5 text-primary" : "border-base-content/10 text-base-content/50 hover:border-coral/30"}`}
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular ${t === "light" ? "fa-sun" : t === "dark" ? "fa-moon" : "fa-desktop"} block text-xl mb-2`}
                                                    />
                                                    <span className="capitalize">
                                                        {t}
                                                    </span>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                        Density
                                    </h3>
                                    <div className="flex gap-3">
                                        {["comfortable", "compact"].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() =>
                                                    setAppearance({
                                                        ...appearance,
                                                        density: d,
                                                    })
                                                }
                                                className={`flex-1 py-3 rounded-xl border-2 text-center font-semibold text-sm transition-all capitalize ${appearance.density === d ? "border-coral bg-primary/5 text-primary" : "border-base-content/10 text-base-content/50 hover:border-coral/30"}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border border-base-content/5 rounded-xl px-4 py-3">
                                    <div>
                                        <div className="font-medium text-sm">
                                            Animations
                                        </div>
                                        <div className="text-xs text-base-content/40">
                                            Enable transition animations
                                        </div>
                                    </div>
                                    {renderToggle(
                                        appearance.animationsEnabled,
                                        () =>
                                            setAppearance({
                                                ...appearance,
                                                animationsEnabled:
                                                    !appearance.animationsEnabled,
                                            }),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Save Bar */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-content/5">
                            <div>
                                {saved && (
                                    <span className="text-sm text-success font-medium flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-check" />
                                        Changes saved
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button className="btn bg-base-200 border-base-content/10 font-semibold">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary font-semibold min-w-[120px]"
                                >
                                    {saving ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
