"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out" };

type SettingsTab = "account" | "notifications" | "privacy" | "billing" | "integrations" | "appearance";

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "account", label: "Account", icon: "fa-user" },
    { id: "notifications", label: "Notifications", icon: "fa-bell" },
    { id: "privacy", label: "Privacy & Security", icon: "fa-shield" },
    { id: "billing", label: "Billing", icon: "fa-credit-card" },
    { id: "integrations", label: "Integrations", icon: "fa-puzzle-piece" },
    { id: "appearance", label: "Appearance", icon: "fa-palette" },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle} className={`w-10 h-5 relative transition-colors flex-shrink-0 ${enabled ? "bg-neutral" : "bg-base-300"}`}>
            <div className={`absolute top-0.5 w-4 h-4 transition-all ${enabled ? "left-5.5 bg-neutral-content" : "left-0.5 bg-base-content/30"}`} />
        </button>
    );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-base-300 last:border-0">
            <div className="flex-1 min-w-0 mr-4">
                <div className="text-xs font-bold tracking-tight">{label}</div>
                {description && <div className="text-[10px] text-base-content/30 mt-0.5">{description}</div>}
            </div>
            {children}
        </div>
    );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
    return (
        <div className="flex items-end gap-3 mb-4">
            <span className="text-2xl font-black tracking-tighter text-neutral/8 select-none">{number}</span>
            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">{title}</p>
        </div>
    );
}

export default function SettingsThreePage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("account");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Toggle states
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [inAppNotifs, setInAppNotifs] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [profilePublic, setProfilePublic] = useState(true);
    const [showEarnings, setShowEarnings] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [compactView, setCompactView] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1500);
    };

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
        tl.fromTo($1(".page-title"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
        tl.fromTo($(".nav-item"), { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: D.fast, stagger: 0.04 }, "-=0.2");
    }, { scope: containerRef });

    const inputClass = "w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 transition-colors";

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    <div className="flex items-end gap-4 mb-5">
                        <span className="page-number opacity-0 text-5xl lg:text-7xl font-black tracking-tighter text-neutral/6 select-none leading-none">S3</span>
                        <div className="page-title opacity-0 pb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-1">Configuration</p>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">Settings</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-[70vh]">
                {/* Sidebar nav */}
                <aside className="w-56 border-r border-neutral/10 flex-shrink-0 py-6 px-3 hidden lg:block">
                    <div className="space-y-0.5">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`nav-item opacity-0 w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${activeTab === tab.id ? "bg-neutral text-neutral-content" : "text-base-content/40 hover:text-base-content hover:bg-base-200"}`}>
                                <i className={`fa-duotone fa-regular ${tab.icon} w-4 text-center text-xs`} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Mobile tabs */}
                <div className="lg:hidden border-b border-neutral/10 px-6 overflow-x-auto flex gap-0">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-[9px] uppercase tracking-[0.15em] font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? "text-base-content border-b-2 border-neutral -mb-[1px]" : "text-base-content/30"}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-6 lg:px-10 py-8 max-w-3xl">
                    {activeTab === "account" && (
                        <div className="space-y-8">
                            <div>
                                <SectionHeader number="01" title="Profile Information" />
                                <div className="h-[1px] bg-neutral/10 mb-4" />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">First Name</label>
                                            <input type="text" defaultValue="Sarah" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Last Name</label>
                                            <input type="text" defaultValue="Mitchell" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Email</label>
                                        <input type="email" defaultValue="sarah@techtalent.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Bio</label>
                                        <textarea rows={3} defaultValue="Senior Technical Recruiter specializing in engineering talent." className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <SectionHeader number="02" title="Password" />
                                <div className="h-[1px] bg-neutral/10 mb-4" />
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Current Password</label>
                                        <input type="password" placeholder="Enter current password" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">New Password</label>
                                            <input type="password" placeholder="New password" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Confirm</label>
                                            <input type="password" placeholder="Confirm new password" className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-8">
                            <div>
                                <SectionHeader number="01" title="Channels" />
                                <div className="h-[1px] bg-neutral/10 mb-2" />
                                <SettingRow label="Email Notifications" description="Receive updates via email"><Toggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} /></SettingRow>
                                <SettingRow label="Push Notifications" description="Browser push notifications"><Toggle enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} /></SettingRow>
                                <SettingRow label="In-App Notifications" description="Show in notification center"><Toggle enabled={inAppNotifs} onToggle={() => setInAppNotifs(!inAppNotifs)} /></SettingRow>
                                <SettingRow label="Weekly Digest" description="Summary email every Monday"><Toggle enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} /></SettingRow>
                            </div>
                            <div>
                                <SectionHeader number="02" title="Notification Types" />
                                <div className="h-[1px] bg-neutral/10 mb-2" />
                                {["New job matches", "Candidate submissions", "Placement updates", "Split-fee proposals", "Messages", "System alerts"].map((type) => (
                                    <SettingRow key={type} label={type}>
                                        <select className="bg-base-200 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-bold outline-none cursor-pointer border-2 border-transparent focus:border-neutral">
                                            <option>All</option>
                                            <option>Important</option>
                                            <option>Off</option>
                                        </select>
                                    </SettingRow>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "privacy" && (
                        <div className="space-y-8">
                            <div>
                                <SectionHeader number="01" title="Security" />
                                <div className="h-[1px] bg-neutral/10 mb-2" />
                                <SettingRow label="Two-Factor Authentication" description="Add extra security to your account"><Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} /></SettingRow>
                                <SettingRow label="Active Sessions" description="2 active sessions">
                                    <button className="text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/30 hover:text-base-content transition-colors">Manage</button>
                                </SettingRow>
                            </div>
                            <div>
                                <SectionHeader number="02" title="Visibility" />
                                <div className="h-[1px] bg-neutral/10 mb-2" />
                                <SettingRow label="Public Profile" description="Allow others to find your profile"><Toggle enabled={profilePublic} onToggle={() => setProfilePublic(!profilePublic)} /></SettingRow>
                                <SettingRow label="Show Earnings" description="Display total earnings on profile"><Toggle enabled={showEarnings} onToggle={() => setShowEarnings(!showEarnings)} /></SettingRow>
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="space-y-8">
                            <div>
                                <SectionHeader number="01" title="Current Plan" />
                                <div className="h-[1px] bg-neutral/10 mb-4" />
                                <div className="border-2 border-neutral p-5 flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-black tracking-tight">Professional</div>
                                        <div className="text-[10px] text-base-content/30 mt-0.5">$49/month / Billed annually</div>
                                    </div>
                                    <button className="px-4 py-2 bg-base-200 text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 hover:text-base-content transition-colors">Upgrade</button>
                                </div>
                            </div>
                            <div>
                                <SectionHeader number="02" title="Payment Method" />
                                <div className="h-[1px] bg-neutral/10 mb-4" />
                                <div className="flex items-center justify-between p-4 bg-base-200">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-brands fa-cc-visa text-lg text-base-content/30" />
                                        <div>
                                            <div className="text-xs font-bold tracking-tight">Visa ending in 4242</div>
                                            <div className="text-[9px] text-base-content/30">Expires 12/2027</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/30 hover:text-base-content transition-colors">Update</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "integrations" && (
                        <div>
                            <SectionHeader number="01" title="Connected Services" />
                            <div className="h-[1px] bg-neutral/10 mb-4" />
                            <div className="space-y-[2px] bg-neutral/10">
                                {[
                                    { name: "LinkedIn", icon: "fa-brands fa-linkedin-in", connected: true, desc: "Import candidates and sync profile" },
                                    { name: "Google Workspace", icon: "fa-brands fa-google", connected: true, desc: "Calendar sync and email integration" },
                                    { name: "Slack", icon: "fa-brands fa-slack", connected: false, desc: "Get notifications in Slack channels" },
                                    { name: "Greenhouse", icon: "fa-duotone fa-regular fa-seedling", connected: false, desc: "Sync with your ATS" },
                                ].map((int) => (
                                    <div key={int.name} className="bg-base-100 p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-base-200 flex items-center justify-center flex-shrink-0">
                                            <i className={`${int.icon} text-base-content/30`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold tracking-tight">{int.name}</div>
                                            <div className="text-[9px] text-base-content/30">{int.desc}</div>
                                        </div>
                                        <button className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] font-bold transition-colors ${int.connected ? "bg-success/10 text-success hover:bg-error/10 hover:text-error" : "bg-base-200 text-base-content/30 hover:text-base-content"}`}>
                                            {int.connected ? "Connected" : "Connect"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-8">
                            <div>
                                <SectionHeader number="01" title="Theme" />
                                <div className="h-[1px] bg-neutral/10 mb-2" />
                                <SettingRow label="Dark Mode" description="Switch to dark color scheme"><Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} /></SettingRow>
                                <SettingRow label="Compact View" description="Reduce spacing in lists and tables"><Toggle enabled={compactView} onToggle={() => setCompactView(!compactView)} /></SettingRow>
                            </div>
                            <div>
                                <SectionHeader number="02" title="Font Size" />
                                <div className="h-[1px] bg-neutral/10 mb-4" />
                                <div className="grid grid-cols-3 gap-[2px] bg-neutral/10">
                                    {["Small", "Default", "Large"].map((size, i) => (
                                        <button key={size} className={`bg-base-100 py-3 text-center transition-colors ${i === 1 ? "bg-neutral text-neutral-content" : "hover:bg-base-200"}`}>
                                            <span className={`font-bold tracking-tight ${i === 0 ? "text-[11px]" : i === 2 ? "text-base" : "text-sm"}`}>{size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save bar */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-neutral/10">
                        <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/25 hover:text-base-content transition-colors">
                            Reset to Defaults
                        </button>
                        <div className="flex items-center gap-3">
                            {saved && (
                                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-success flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-circle-check text-xs" /> Saved
                                </span>
                            )}
                            <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving ? <><span className="w-3 h-3 border-2 border-neutral-content/30 border-t-neutral-content animate-spin" />Saving...</> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
