"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface ProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    bio: string;
}

interface NotificationPrefs {
    emailNewJobs: boolean;
    emailApplications: boolean;
    emailPlacements: boolean;
    emailWeeklyDigest: boolean;
    pushMessages: boolean;
    pushStatusChanges: boolean;
    pushUrgentOnly: boolean;
    inAppAll: boolean;
}

const SECTIONS = [
    { id: "profile", label: "Profile", icon: "fa-duotone fa-regular fa-user" },
    { id: "notifications", label: "Notifications", icon: "fa-duotone fa-regular fa-bell" },
    { id: "security", label: "Security", icon: "fa-duotone fa-regular fa-shield-check" },
    { id: "billing", label: "Billing", icon: "fa-duotone fa-regular fa-credit-card" },
    { id: "team", label: "Team", icon: "fa-duotone fa-regular fa-users" },
    { id: "integrations", label: "Integrations", icon: "fa-duotone fa-regular fa-plug" },
    { id: "appearance", label: "Appearance", icon: "fa-duotone fa-regular fa-palette" },
];

const teamMembers = [
    { name: "Sarah Chen", email: "sarah@apex.com", role: "Admin", avatar: "SC" },
    { name: "Marcus Webb", email: "marcus@apex.com", role: "Recruiter", avatar: "MW" },
    { name: "Lisa Park", email: "lisa@apex.com", role: "Recruiter", avatar: "LP" },
];

const integrations = [
    { name: "LinkedIn Recruiter", status: "connected", icon: "fa-brands fa-linkedin-in" },
    { name: "Slack", status: "connected", icon: "fa-brands fa-slack" },
    { name: "Google Calendar", status: "disconnected", icon: "fa-brands fa-google" },
    { name: "Stripe", status: "connected", icon: "fa-brands fa-stripe" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function SettingsPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = useState("profile");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<ProfileForm>({
        firstName: "Sarah", lastName: "Chen", email: "sarah@apexrecruiting.com",
        phone: "+1 (415) 555-0142", company: "Apex Recruiting Partners",
        bio: "Senior Executive Recruiter specializing in technology leadership roles.",
    });
    const [notifs, setNotifs] = useState<NotificationPrefs>({
        emailNewJobs: true, emailApplications: true, emailPlacements: true,
        emailWeeklyDigest: true, pushMessages: true, pushStatusChanges: false,
        pushUrgentOnly: true, inAppAll: true,
    });
    const [theme, setTheme] = useState("system");
    const [twoFactor, setTwoFactor] = useState(false);

    useGSAP(() => {
        gsap.from("[data-page-text]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        gsap.from("[data-nav-item]", { x: -20, opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.3, ease: "power2.out" });
    }, { scope: containerRef });

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000);
    };

    const renderSection = () => {
        switch (activeSection) {
            case "profile":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Profile Information</p>
                            <p className="text-sm text-base-content/50">Update your personal information and how others see you on the network.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">First Name</label>
                                <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Last Name</label>
                                <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
                            </fieldset>
                        </div>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Email</label>
                            <input type="email" className="input input-bordered w-full bg-base-200 focus:border-secondary" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                        </fieldset>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Phone</label>
                                <input type="tel" className="input input-bordered w-full bg-base-200 focus:border-secondary" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Company</label>
                                <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
                            </fieldset>
                        </div>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Bio</label>
                            <textarea className="textarea textarea-bordered w-full bg-base-200 focus:border-secondary h-24" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
                        </fieldset>
                    </div>
                );
            case "notifications":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Notification Preferences</p>
                            <p className="text-sm text-base-content/50">Choose how and when you want to be notified.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">Email Notifications</p>
                            <div className="space-y-4">
                                {([["emailNewJobs", "New Job Matches", "Get notified when new jobs match your specializations"],
                                    ["emailApplications", "Application Updates", "Status changes on candidates you have submitted"],
                                    ["emailPlacements", "Placement Confirmations", "Notifications when placements are confirmed"],
                                    ["emailWeeklyDigest", "Weekly Digest", "A summary of marketplace activity every Monday"]] as const).map(([key, label, desc]) => (
                                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                                        <div>
                                            <p className="text-sm font-medium text-base-content group-hover:text-base-content">{label}</p>
                                            <p className="text-xs text-base-content/40">{desc}</p>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={notifs[key]} onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">Push Notifications</p>
                            <div className="space-y-4">
                                {([["pushMessages", "Direct Messages", "Real-time alerts for new messages"],
                                    ["pushStatusChanges", "Status Changes", "Candidate and job status updates"],
                                    ["pushUrgentOnly", "Urgent Jobs Only", "Only notify for high-priority listings"]] as const).map(([key, label, desc]) => (
                                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                                        <div>
                                            <p className="text-sm font-medium text-base-content">{label}</p>
                                            <p className="text-xs text-base-content/40">{desc}</p>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={notifs[key]} onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Security Settings</p>
                            <p className="text-sm text-base-content/50">Manage your password, two-factor authentication, and active sessions.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div className="border border-base-300 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-bold text-base-content">Change Password</p>
                                    <p className="text-xs text-base-content/50">Last changed 45 days ago</p>
                                </div>
                                <button className="btn btn-ghost btn-sm border border-base-300 font-semibold uppercase text-[10px] tracking-wider">Update</button>
                            </div>
                        </div>
                        <div className="border border-base-300 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-base-content">Two-Factor Authentication</p>
                                    <p className="text-xs text-base-content/50">{twoFactor ? "Enabled - Authenticator app" : "Not enabled - We recommend enabling 2FA"}</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-secondary" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
                            </div>
                        </div>
                        <div className="border border-base-300 p-6">
                            <p className="font-bold text-base-content mb-3">Active Sessions</p>
                            <div className="space-y-3">
                                {[{ device: "MacBook Pro - Chrome", location: "San Francisco, CA", current: true },
                                    { device: "iPhone 15 - Safari", location: "San Francisco, CA", current: false }].map((s) => (
                                    <div key={s.device} className="flex items-center justify-between py-2 border-b border-base-300 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <i className={`fa-duotone fa-regular ${s.device.includes("Mac") ? "fa-laptop" : "fa-mobile"} text-base-content/30`} />
                                            <div>
                                                <p className="text-sm text-base-content">{s.device}</p>
                                                <p className="text-xs text-base-content/40">{s.location}</p>
                                            </div>
                                        </div>
                                        {s.current ? <span className="text-[10px] uppercase tracking-wider text-secondary font-medium">Current</span>
                                            : <button className="text-[10px] uppercase tracking-wider text-error font-medium hover:text-error/80">Revoke</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "billing":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Billing & Subscription</p>
                            <p className="text-sm text-base-content/50">Manage your plan, payment methods, and billing history.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div className="border border-secondary/20 bg-secondary/5 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-secondary font-medium">Current Plan</p>
                                    <p className="text-2xl font-bold text-base-content">Pro Plan</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">$79<span className="text-sm text-base-content/40 font-normal">/mo</span></p>
                            </div>
                            <p className="text-xs text-base-content/50 mb-4">Renews March 14, 2026 &middot; 5 of 10 seats used</p>
                            <div className="flex gap-3">
                                <button className="btn btn-secondary btn-sm font-semibold uppercase text-[10px] tracking-wider">Upgrade</button>
                                <button className="btn btn-ghost btn-sm border border-base-300 font-semibold uppercase text-[10px] tracking-wider">Manage</button>
                            </div>
                        </div>
                        <div className="border border-base-300 p-6">
                            <p className="font-bold text-base-content mb-4">Payment Method</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-7 bg-base-200 flex items-center justify-center border border-base-300">
                                    <i className="fa-brands fa-cc-visa text-base-content/50" />
                                </div>
                                <div>
                                    <p className="text-sm text-base-content">&middot;&middot;&middot;&middot; 4242</p>
                                    <p className="text-xs text-base-content/40">Expires 08/27</p>
                                </div>
                                <button className="ml-auto text-[10px] uppercase tracking-wider text-secondary font-medium">Update</button>
                            </div>
                        </div>
                    </div>
                );
            case "team":
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Team Management</p>
                                <p className="text-sm text-base-content/50">Manage team members and their roles.</p>
                            </div>
                            <button className="btn btn-secondary btn-sm font-semibold uppercase text-[10px] tracking-wider">
                                <i className="fa-duotone fa-regular fa-user-plus mr-2" />Invite
                            </button>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div className="space-y-0">
                            {teamMembers.map((m) => (
                                <div key={m.email} className="flex items-center justify-between py-4 border-b border-base-300 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-primary flex items-center justify-center"><span className="text-primary-content text-xs font-bold">{m.avatar}</span></div>
                                        <div>
                                            <p className="text-sm font-medium text-base-content">{m.name}</p>
                                            <p className="text-xs text-base-content/40">{m.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] uppercase tracking-wider font-medium ${m.role === "Admin" ? "text-secondary" : "text-base-content/50"}`}>{m.role}</span>
                                        <button className="btn btn-ghost btn-xs text-base-content/30 hover:text-base-content"><i className="fa-regular fa-ellipsis-vertical" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "integrations":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Integrations</p>
                            <p className="text-sm text-base-content/50">Connect third-party services to enhance your workflow.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {integrations.map((ig) => (
                                <div key={ig.name} className="border border-base-300 p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <i className={`${ig.icon} text-xl text-base-content/40`} />
                                        <div>
                                            <p className="text-sm font-medium text-base-content">{ig.name}</p>
                                            <p className={`text-[10px] uppercase tracking-wider font-medium ${ig.status === "connected" ? "text-secondary" : "text-base-content/30"}`}>{ig.status}</p>
                                        </div>
                                    </div>
                                    <button className={`btn btn-sm font-semibold uppercase text-[10px] tracking-wider ${ig.status === "connected" ? "btn-ghost border border-base-300" : "btn-secondary"}`}>
                                        {ig.status === "connected" ? "Manage" : "Connect"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "appearance":
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Appearance</p>
                            <p className="text-sm text-base-content/50">Customize how the platform looks for you.</p>
                        </div>
                        <div className="h-px bg-base-300" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">Theme</p>
                            <div className="grid grid-cols-3 gap-4">
                                {[{ value: "light", label: "Light", icon: "fa-duotone fa-regular fa-sun" },
                                    { value: "dark", label: "Dark", icon: "fa-duotone fa-regular fa-moon" },
                                    { value: "system", label: "System", icon: "fa-duotone fa-regular fa-laptop" }].map((t) => (
                                    <button key={t.value} onClick={() => setTheme(t.value)}
                                        className={`border p-5 text-center transition-colors ${theme === t.value ? "border-secondary bg-secondary/5" : "border-base-300 hover:border-secondary/40"}`}>
                                        <i className={`${t.icon} text-xl mb-2 block ${theme === t.value ? "text-secondary" : "text-base-content/30"}`} />
                                        <p className={`text-xs uppercase tracking-wider font-medium ${theme === t.value ? "text-secondary" : "text-base-content/50"}`}>{t.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            <section className="bg-neutral text-neutral-content py-16 md:py-20">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <p data-page-text className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">Account</p>
                    <h1 data-page-text className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95] mb-3">Settings</h1>
                    <p data-page-text className="text-lg text-neutral-content/60 max-w-lg">Manage your account, preferences, team, and integrations.</p>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <nav className="lg:col-span-1 space-y-1">
                            {SECTIONS.map((s) => (
                                <button key={s.id} data-nav-item onClick={() => setActiveSection(s.id)}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-colors border-l-2 ${activeSection === s.id ? "border-secondary text-base-content bg-base-200" : "border-transparent text-base-content/40 hover:text-base-content hover:bg-base-200/50"}`}>
                                    <i className={`${s.icon} w-4`} />{s.label}
                                </button>
                            ))}
                        </nav>
                        <div className="lg:col-span-3">
                            <div className="border border-base-300 p-6 md:p-8">{renderSection()}</div>
                            <div className="flex items-center justify-between mt-6">
                                <div>
                                    {saved && <p className="text-xs text-secondary font-medium flex items-center gap-2"><i className="fa-duotone fa-regular fa-circle-check" />Changes saved</p>}
                                </div>
                                <div className="flex gap-3">
                                    <button className="btn btn-ghost font-semibold uppercase text-xs tracking-wider text-base-content/50">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8">
                                        {saving ? <><span className="loading loading-spinner loading-xs mr-2" />Saving...</> : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Settings &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
