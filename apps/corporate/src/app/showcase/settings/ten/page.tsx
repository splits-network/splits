"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── types ─── */

interface NotifPref {
    label: string;
    email: boolean;
    push: boolean;
    inApp: boolean;
}

/* ─── data ─── */

const settingSections = [
    { id: "account", label: "Account", icon: "fa-user" },
    { id: "notifications", label: "Notifications", icon: "fa-bell" },
    { id: "privacy", label: "Privacy & Security", icon: "fa-shield-check" },
    { id: "billing", label: "Billing", icon: "fa-credit-card" },
    { id: "team", label: "Team", icon: "fa-users" },
    { id: "integrations", label: "Integrations", icon: "fa-plug" },
    { id: "appearance", label: "Appearance", icon: "fa-palette" },
];

const defaultNotifs: NotifPref[] = [
    {
        label: "New candidate submissions",
        email: true,
        push: true,
        inApp: true,
    },
    { label: "Split-fee proposals", email: true, push: true, inApp: true },
    { label: "Placement confirmations", email: true, push: false, inApp: true },
    { label: "Message notifications", email: false, push: true, inApp: true },
    { label: "Weekly digest reports", email: true, push: false, inApp: false },
    {
        label: "Network activity alerts",
        email: false,
        push: false,
        inApp: true,
    },
];

const integrations = [
    {
        name: "Slack",
        icon: "fa-brands fa-slack",
        connected: true,
        desc: "Post notifications to channels",
    },
    {
        name: "Google Workspace",
        icon: "fa-brands fa-google",
        connected: true,
        desc: "Calendar and email sync",
    },
    {
        name: "LinkedIn",
        icon: "fa-brands fa-linkedin",
        connected: false,
        desc: "Import candidate profiles",
    },
    {
        name: "Zapier",
        icon: "fa-duotone fa-regular fa-bolt",
        connected: false,
        desc: "Automate workflows",
    },
];

const teamMembers = [
    {
        name: "Katherine Reyes",
        role: "Admin",
        email: "k.reyes@apex.com",
        status: "active",
    },
    {
        name: "Marcus Chen",
        role: "Recruiter",
        email: "m.chen@apex.com",
        status: "active",
    },
    {
        name: "Sarah Kim",
        role: "Recruiter",
        email: "s.kim@apex.com",
        status: "active",
    },
    {
        name: "David Okonkwo",
        role: "Viewer",
        email: "d.okonkwo@apex.com",
        status: "pending",
    },
];

/* ─── component ─── */

export default function SettingsShowcaseTen() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeSection, setActiveSection] = useState("account");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notifs, setNotifs] = useState(defaultNotifs);
    const [twoFactor, setTwoFactor] = useState(true);
    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".settings-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".settings-header",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                )
                .fromTo(
                    ".settings-body",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                );
            gsap.fromTo(
                ".status-pulse",
                { scale: 0.6, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );
        },
        { scope: mainRef },
    );

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1200);
    };

    const toggleNotif = (idx: number, channel: "email" | "push" | "inApp") => {
        setNotifs((prev) =>
            prev.map((n, i) =>
                i === idx ? { ...n, [channel]: !n[channel] } : n,
            ),
        );
    };

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
        >
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-coral/30 pointer-events-none z-10" />

            {/* Header */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-8">
                <div className="settings-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />
                <div className="settings-header">
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">
                        sys.config &gt; operator_settings v2.0
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        System Configuration
                    </h1>
                </div>
            </section>

            {/* Body */}
            <section className="settings-body relative z-10 max-w-6xl mx-auto px-6 pb-24">
                <div className="flex gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-56 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-6 space-y-1">
                            {settingSections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                                        activeSection === s.id
                                            ? "bg-primary/10 border border-coral/20 text-primary"
                                            : "text-base-content/30 hover:text-base-content/50 border border-transparent"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${s.icon} text-xs w-4 text-center`}
                                    />{" "}
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Mobile nav */}
                        <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
                            {settingSections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap border transition-colors ${
                                        activeSection === s.id
                                            ? "bg-primary/10 border-coral/20 text-primary"
                                            : "bg-base-200 border-base-content/10 text-base-content/30"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Account */}
                        {activeSection === "account" && (
                            <div className="space-y-6">
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <i className="fa-duotone fa-regular fa-user text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // account.profile
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-20 h-20 flex items-center justify-center bg-primary/10 text-primary border-2 border-coral/20 font-mono text-2xl font-black">
                                            KR
                                        </div>
                                        <div>
                                            <button className="btn btn-outline btn-xs font-mono uppercase tracking-wider text-[9px] mb-1">
                                                Change Avatar
                                            </button>
                                            <p className="font-mono text-[10px] text-base-content/20">
                                                JPG, PNG, or GIF. Max 2MB.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue="Katherine Reyes"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue="Senior Recruiting Partner"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                defaultValue="k.reyes@apexrecruiting.com"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue="+1 (415) 555-0142"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5 md:col-span-2">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Bio
                                            </label>
                                            <textarea
                                                defaultValue={profile.bio}
                                                className="textarea textarea-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm min-h-[80px]"
                                            />
                                        </fieldset>
                                    </div>
                                </div>
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <i className="fa-duotone fa-regular fa-key text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // password.change
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="********"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                        <fieldset className="space-y-1.5">
                                            <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm"
                                            />
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeSection === "notifications" && (
                            <div className="p-6 bg-base-200 border border-base-content/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <i className="fa-duotone fa-regular fa-bell text-primary text-sm" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                        // notification.preferences
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-base-content/10">
                                                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-base-content/30 pb-3">
                                                    Event
                                                </th>
                                                <th className="text-center font-mono text-[10px] uppercase tracking-wider text-base-content/30 pb-3 w-20">
                                                    Email
                                                </th>
                                                <th className="text-center font-mono text-[10px] uppercase tracking-wider text-base-content/30 pb-3 w-20">
                                                    Push
                                                </th>
                                                <th className="text-center font-mono text-[10px] uppercase tracking-wider text-base-content/30 pb-3 w-20">
                                                    In-App
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifs.map((n, i) => (
                                                <tr
                                                    key={n.label}
                                                    className="border-b border-base-content/5"
                                                >
                                                    <td className="py-3 text-sm text-base-content/50">
                                                        {n.label}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-xs toggle-primary"
                                                            checked={n.email}
                                                            onChange={() =>
                                                                toggleNotif(
                                                                    i,
                                                                    "email",
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-xs toggle-primary"
                                                            checked={n.push}
                                                            onChange={() =>
                                                                toggleNotif(
                                                                    i,
                                                                    "push",
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-xs toggle-primary"
                                                            checked={n.inApp}
                                                            onChange={() =>
                                                                toggleNotif(
                                                                    i,
                                                                    "inApp",
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Privacy */}
                        {activeSection === "privacy" && (
                            <div className="space-y-6">
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <i className="fa-duotone fa-regular fa-shield-check text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // security.config
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Two-Factor Authentication
                                                </p>
                                                <p className="text-xs text-base-content/30">
                                                    Add an extra layer of
                                                    security to your account
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                checked={twoFactor}
                                                onChange={() =>
                                                    setTwoFactor(!twoFactor)
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Profile Visibility
                                                </p>
                                                <p className="text-xs text-base-content/30">
                                                    Control who can view your
                                                    recruiter profile
                                                </p>
                                            </div>
                                            <select className="select select-xs bg-base-200 border border-base-content/10 font-mono text-xs">
                                                <option>Network Only</option>
                                                <option>Public</option>
                                                <option>Private</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Activity Status
                                                </p>
                                                <p className="text-xs text-base-content/30">
                                                    Show when you are online
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                defaultChecked
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // session.log
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                device: "Chrome on macOS",
                                                location: "San Francisco, CA",
                                                time: "Current session",
                                                current: true,
                                            },
                                            {
                                                device: "Safari on iPhone",
                                                location: "San Francisco, CA",
                                                time: "2 hours ago",
                                                current: false,
                                            },
                                            {
                                                device: "Chrome on Windows",
                                                location: "Denver, CO",
                                                time: "3 days ago",
                                                current: false,
                                            },
                                        ].map((s, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-3 bg-base-300 border border-base-content/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {s.current && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                    )}
                                                    {!s.current && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-base-content/10" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-bold">
                                                            {s.device}
                                                        </p>
                                                        <p className="font-mono text-[10px] text-base-content/25">
                                                            {s.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-[10px] text-base-content/20">
                                                        {s.time}
                                                    </span>
                                                    {!s.current && (
                                                        <button className="font-mono text-[10px] text-error/50 hover:text-error uppercase tracking-wider">
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing */}
                        {activeSection === "billing" && (
                            <div className="space-y-6">
                                <div className="p-6 bg-base-200 border border-coral/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-credit-card text-primary text-sm" />
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                                // current.plan
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-primary/10 border border-coral/20 text-primary font-mono text-[10px] uppercase tracking-wider">
                                            Pro
                                        </span>
                                    </div>
                                    <p className="font-mono text-3xl font-black text-primary mb-1">
                                        $99
                                        <span className="text-base text-base-content/30">
                                            /mo
                                        </span>
                                    </p>
                                    <p className="text-xs text-base-content/40 mb-4">
                                        Billed annually. Next billing date: Mar
                                        15, 2026
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="btn btn-outline btn-xs font-mono uppercase tracking-wider text-[9px]">
                                            Change Plan
                                        </button>
                                        <button className="btn btn-ghost btn-xs font-mono uppercase tracking-wider text-[9px] text-error/50 hover:text-error">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-receipt text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // billing.history
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                date: "Feb 15, 2026",
                                                amount: "$99.00",
                                                status: "Paid",
                                            },
                                            {
                                                date: "Jan 15, 2026",
                                                amount: "$99.00",
                                                status: "Paid",
                                            },
                                            {
                                                date: "Dec 15, 2025",
                                                amount: "$99.00",
                                                status: "Paid",
                                            },
                                        ].map((inv) => (
                                            <div
                                                key={inv.date}
                                                className="flex items-center justify-between p-3 bg-base-300 border border-base-content/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs">
                                                        {inv.date}
                                                    </span>
                                                    <span className="font-mono text-xs text-primary font-bold">
                                                        {inv.amount}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-1.5 py-0.5 bg-success/10 border border-success/20 text-success font-mono text-[9px]">
                                                        {inv.status}
                                                    </span>
                                                    <button className="font-mono text-[10px] text-base-content/25 hover:text-primary uppercase tracking-wider">
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Team */}
                        {activeSection === "team" && (
                            <div className="p-6 bg-base-200 border border-base-content/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-users text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // team.members
                                        </span>
                                    </div>
                                    <button className="btn btn-primary btn-xs font-mono uppercase tracking-wider text-[9px]">
                                        <i className="fa-duotone fa-regular fa-plus mr-1" />{" "}
                                        Invite
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {teamMembers.map((m) => (
                                        <div
                                            key={m.email}
                                            className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-coral/20 font-mono text-xs font-bold">
                                                    {m.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {m.name}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-base-content/25">
                                                        {m.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`px-2 py-0.5 border font-mono text-[9px] uppercase ${m.status === "active" ? "bg-success/10 border-success/20 text-success" : "bg-warning/10 border-warning/20 text-warning"}`}
                                                >
                                                    {m.status}
                                                </span>
                                                <select
                                                    className="select select-xs bg-base-200 border border-base-content/10 font-mono text-[10px]"
                                                    defaultValue={m.role}
                                                >
                                                    <option>Admin</option>
                                                    <option>Recruiter</option>
                                                    <option>Viewer</option>
                                                </select>
                                                <button className="btn btn-ghost btn-xs btn-square">
                                                    <i className="fa-duotone fa-regular fa-ellipsis text-xs text-base-content/30" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Integrations */}
                        {activeSection === "integrations" && (
                            <div className="p-6 bg-base-200 border border-base-content/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <i className="fa-duotone fa-regular fa-plug text-primary text-sm" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                        // integrations
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {integrations.map((ig) => (
                                        <div
                                            key={ig.name}
                                            className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center bg-base-200 border border-base-content/10">
                                                    <i
                                                        className={`${ig.icon} text-lg text-base-content/40`}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {ig.name}
                                                    </p>
                                                    <p className="text-xs text-base-content/30">
                                                        {ig.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className={`btn btn-sm font-mono uppercase tracking-wider text-[10px] ${ig.connected ? "btn-outline" : "btn-primary"}`}
                                            >
                                                {ig.connected
                                                    ? "Disconnect"
                                                    : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Appearance */}
                        {activeSection === "appearance" && (
                            <div className="p-6 bg-base-200 border border-base-content/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <i className="fa-duotone fa-regular fa-palette text-primary text-sm" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                        // appearance
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-mono text-[11px] uppercase tracking-wider text-base-content/40 mb-3">
                                            Theme
                                        </p>
                                        <div className="flex gap-3">
                                            {(
                                                [
                                                    "dark",
                                                    "light",
                                                    "system",
                                                ] as const
                                            ).map((t) => (
                                                <label
                                                    key={t}
                                                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer border transition-colors font-mono text-xs uppercase tracking-wider flex-1 justify-center ${
                                                        theme === t
                                                            ? "bg-primary/10 border-coral/30 text-primary"
                                                            : "bg-base-300 border-base-content/10 text-base-content/40"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="theme"
                                                        value={t}
                                                        checked={theme === t}
                                                        onChange={() =>
                                                            setTheme(t)
                                                        }
                                                        className="hidden"
                                                    />
                                                    <i
                                                        className={`fa-duotone fa-regular ${t === "dark" ? "fa-moon" : t === "light" ? "fa-sun" : "fa-display"} text-sm`}
                                                    />{" "}
                                                    {t}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5">
                                        <div>
                                            <p className="text-sm font-bold">
                                                Compact Mode
                                            </p>
                                            <p className="text-xs text-base-content/30">
                                                Reduce spacing for denser layout
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-sm toggle-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-300 border border-base-content/5">
                                        <div>
                                            <p className="text-sm font-bold">
                                                Reduce Animations
                                            </p>
                                            <p className="text-xs text-base-content/30">
                                                Minimize motion for
                                                accessibility
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-sm toggle-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Bar */}
                        <div className="flex items-center justify-between p-4 bg-base-200 border border-base-content/10 sticky bottom-4">
                            <div className="flex items-center gap-2">
                                {saved && (
                                    <>
                                        <i className="fa-duotone fa-regular fa-check text-success text-sm" />
                                        <span className="font-mono text-[10px] text-success uppercase tracking-wider">
                                            Changes Saved
                                        </span>
                                    </>
                                )}
                                {!saved && (
                                    <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider">
                                        Unsaved changes
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-xs"
                                >
                                    {saving ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs" />{" "}
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-floppy-disk mr-1" />{" "}
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
                <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
                    <div className="flex items-center gap-2">
                        <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Settings System Operational
                        </span>
                    </div>
                    <span className="text-base-content/10">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                        Splits Network // Component Showcase
                    </span>
                </div>
            </section>
        </main>
    );
}

const profile = {
    bio: "15+ years of technical recruiting experience specializing in senior engineering and leadership placements.",
};
