"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const tabs = [
    { id: "account", label: "Account", icon: "fa-regular fa-user" },
    { id: "notifications", label: "Notifications", icon: "fa-regular fa-bell" },
    { id: "privacy", label: "Privacy", icon: "fa-regular fa-shield-check" },
    { id: "billing", label: "Billing", icon: "fa-regular fa-credit-card" },
    { id: "team", label: "Team", icon: "fa-regular fa-users" },
    { id: "integrations", label: "Integrations", icon: "fa-regular fa-plug" },
];

export default function SettingsNinePage() {
    const ref = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("account");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [name, setName] = useState("Jane Doe");
    const [email, setEmail] = useState("jane@techcorp.com");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [appNotifs, setAppNotifs] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [profilePublic, setProfilePublic] = useState(true);
    const [showActivity, setShowActivity] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    useGSAP(() => {
        if (!ref.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(ref.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 }); return; }
        const $1 = (s: string) => ref.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".set-title"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
        tl.fromTo($1(".set-nav"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.4");
        tl.fromTo($1(".set-body"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
    }, { scope: ref });

    const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000); };

    const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
        <button onClick={onToggle} className={`w-10 h-5 border-2 relative transition-colors ${on ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15"}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white transition-all ${on ? "left-[calc(100%-14px)]" : "left-0.5"}`} />
        </button>
    );

    const SettingRow = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
        <div className="flex items-center justify-between py-4 border-b border-dashed border-[#233876]/8 last:border-0">
            <div><div className="text-sm font-semibold text-[#0f1b3d]">{label}</div><div className="text-xs text-[#0f1b3d]/35 mt-0.5">{desc}</div></div>
            {children}
        </div>
    );

    const inputCls = "w-full px-4 py-2.5 border-2 border-[#233876]/10 text-sm bg-white outline-none text-[#0f1b3d] focus:border-[#233876]/30 transition-colors placeholder-[#0f1b3d]/25";

    return (
        <div ref={ref} className="min-h-screen bg-[#f7f8fa]">
            <section className="relative py-12 bg-white border-b-2 border-[#233876]/10 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="container mx-auto px-6 relative z-10"><div className="max-w-5xl mx-auto set-title opacity-0">
                    <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-3">REF: EN-SET-09 // Configuration</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d]">Settings</h1>
                </div></div>
            </section>

            <section className="relative py-8"><div className="container mx-auto px-6"><div className="max-w-5xl mx-auto grid lg:grid-cols-4 gap-6">
                {/* Sidebar nav */}
                <div className="set-nav opacity-0">
                    <div className="border-2 border-[#233876]/10 bg-white relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" /><div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                        <nav className="py-2">
                            {tabs.map((t) => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors relative ${activeTab === t.id ? "bg-[#233876]/[0.05]" : "hover:bg-[#233876]/[0.02]"}`}>
                                    {activeTab === t.id && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#233876]" />}
                                    <div className={`w-7 h-7 border flex items-center justify-center ${activeTab === t.id ? "border-[#233876]/20" : "border-[#233876]/8"}`}>
                                        <i className={`${t.icon} text-xs ${activeTab === t.id ? "text-[#233876]" : "text-[#233876]/30"}`} />
                                    </div>
                                    <span className={`text-sm ${activeTab === t.id ? "font-semibold text-[#0f1b3d]" : "text-[#0f1b3d]/40"}`}>{t.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 set-body opacity-0">
                    <div className="border-2 border-[#233876]/10 bg-white relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" /><div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" /><div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                        {activeTab === "account" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Account</div><h2 className="text-xl font-bold text-[#0f1b3d]">Profile Information</h2></div>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dashed border-[#233876]/8">
                                        <div className="w-16 h-16 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876]"><span className="font-mono text-xl font-bold text-white">JD</span></div>
                                        <div><button className="px-4 py-1.5 border border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors">Change Avatar</button><div className="font-mono text-[9px] text-[#233876]/20 mt-1">JPG, PNG up to 2MB</div></div>
                                    </div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Full Name</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Email Address</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Role</label><select className={inputCls}><option>Admin</option><option>Recruiter</option><option>Viewer</option></select></div>
                                    <div className="pt-4 border-t border-dashed border-[#233876]/8"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-3">Password</div>
                                        <button className="px-5 py-2 border-2 border-[#233876]/15 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium">Change Password</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Preferences</div><h2 className="text-xl font-bold text-[#0f1b3d]">Notification Settings</h2></div>
                                <SettingRow label="Email Notifications" desc="Receive updates about applications and placements via email"><Toggle on={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} /></SettingRow>
                                <SettingRow label="Push Notifications" desc="Browser push notifications for real-time updates"><Toggle on={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} /></SettingRow>
                                <SettingRow label="In-App Notifications" desc="Show notification badges and alerts in the app"><Toggle on={appNotifs} onToggle={() => setAppNotifs(!appNotifs)} /></SettingRow>
                                <SettingRow label="Weekly Digest" desc="Summary email of activity sent every Monday"><Toggle on={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} /></SettingRow>
                            </div>
                        )}

                        {activeTab === "privacy" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Security</div><h2 className="text-xl font-bold text-[#0f1b3d]">Privacy & Security</h2></div>
                                <SettingRow label="Public Profile" desc="Allow others in the network to find your profile"><Toggle on={profilePublic} onToggle={() => setProfilePublic(!profilePublic)} /></SettingRow>
                                <SettingRow label="Show Activity" desc="Display recent activity on your public profile"><Toggle on={showActivity} onToggle={() => setShowActivity(!showActivity)} /></SettingRow>
                                <SettingRow label="Two-Factor Authentication" desc="Add an extra layer of security to your account"><Toggle on={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} /></SettingRow>
                                <div className="mt-6 p-4 border-2 border-red-400/15 bg-red-50/20">
                                    <div className="text-sm font-semibold text-red-600 mb-1">Danger Zone</div>
                                    <p className="text-xs text-[#0f1b3d]/35 mb-3">Permanently delete your account and all associated data.</p>
                                    <button className="px-4 py-1.5 border-2 border-red-400/30 text-xs text-red-500 hover:border-red-400 transition-colors">Delete Account</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "billing" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Subscription</div><h2 className="text-xl font-bold text-[#0f1b3d]">Billing & Plan</h2></div>
                                <div className="border-2 border-[#233876]/15 p-5 mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div><span className="font-mono text-[9px] text-white bg-[#233876] px-2 py-0.5 uppercase tracking-wider">Pro Plan</span><div className="font-mono text-2xl font-bold text-[#233876] mt-2">$49<span className="text-sm font-normal text-[#0f1b3d]/30">/month</span></div></div>
                                        <button className="px-4 py-1.5 border-2 border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors">Change Plan</button>
                                    </div>
                                    <div className="h-1.5 bg-[#233876]/10"><div className="h-full bg-[#233876]" style={{ width: "65%" }} /></div>
                                    <div className="font-mono text-[9px] text-[#0f1b3d]/25 mt-1">65% of billing period used &middot; Renews Mar 14, 2026</div>
                                </div>
                                <div className="text-sm font-semibold text-[#0f1b3d] mb-3">Payment Method</div>
                                <div className="flex items-center gap-3 p-3 border border-[#233876]/10">
                                    <div className="w-8 h-8 border border-[#233876]/10 flex items-center justify-center"><i className="fa-brands fa-cc-visa text-[#233876]/40" /></div>
                                    <div><div className="text-xs text-[#0f1b3d]/60">Visa ending in 4242</div><div className="font-mono text-[9px] text-[#0f1b3d]/25">Expires 12/2027</div></div>
                                    <button className="ml-auto text-xs text-[#233876] hover:text-[#1a2a5c] transition-colors">Update</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "team" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Organization</div><h2 className="text-xl font-bold text-[#0f1b3d]">Team Members</h2></div>
                                <div className="space-y-px bg-[#233876]/10 mb-4">
                                    {[{ name: "Jane Doe", email: "jane@techcorp.com", role: "Admin", initials: "JD" }, { name: "Alex Kim", email: "alex@techcorp.com", role: "Recruiter", initials: "AK" }, { name: "Robin Lee", email: "robin@techcorp.com", role: "Viewer", initials: "RL" }].map((m, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white">
                                            <div className="w-8 h-8 border border-[#233876]/10 flex items-center justify-center bg-[#233876]"><span className="font-mono text-[9px] font-bold text-white">{m.initials}</span></div>
                                            <div className="flex-1"><div className="text-xs font-semibold text-[#0f1b3d]">{m.name}</div><div className="text-[10px] text-[#0f1b3d]/30">{m.email}</div></div>
                                            <span className="font-mono text-[9px] text-[#233876]/40 border border-[#233876]/10 px-2 py-0.5">{m.role}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="px-4 py-2 border-2 border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors font-medium"><i className="fa-regular fa-plus text-[10px] mr-1" /> Invite Member</button>
                            </div>
                        )}

                        {activeTab === "integrations" && (
                            <div className="p-6">
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Connected</div><h2 className="text-xl font-bold text-[#0f1b3d]">Integrations</h2></div>
                                <div className="space-y-3">
                                    {[{ name: "Slack", desc: "Real-time notifications in your workspace", icon: "fa-brands fa-slack", connected: true }, { name: "Google Calendar", desc: "Sync interviews and meetings", icon: "fa-brands fa-google", connected: true }, { name: "LinkedIn", desc: "Import candidate profiles", icon: "fa-brands fa-linkedin-in", connected: false }, { name: "Zapier", desc: "Connect to 5000+ apps", icon: "fa-regular fa-bolt", connected: false }].map((int, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border border-[#233876]/8">
                                            <div className="w-10 h-10 border border-[#233876]/10 flex items-center justify-center"><i className={`${int.icon} text-lg text-[#233876]/30`} /></div>
                                            <div className="flex-1"><div className="text-sm font-semibold text-[#0f1b3d]">{int.name}</div><div className="text-xs text-[#0f1b3d]/35">{int.desc}</div></div>
                                            <button className={`px-4 py-1.5 border text-xs font-medium transition-colors ${int.connected ? "border-emerald-400/30 text-emerald-600" : "border-[#233876]/15 text-[#233876] hover:border-[#233876]"}`}>
                                                {int.connected ? "Connected" : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save bar */}
                        <div className="px-6 py-4 border-t-2 border-[#233876]/8 flex items-center justify-between bg-[#f7f8fa]/50">
                            <span className="font-mono text-[9px] text-[#233876]/20 tracking-wider">{saved ? "CHANGES SAVED" : "UNSAVED CHANGES"}</span>
                            <div className="flex gap-2">
                                <button className="px-5 py-2 border-2 border-[#233876]/15 text-sm text-[#0f1b3d]/40 hover:text-[#0f1b3d] transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="px-5 py-2 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium flex items-center gap-2">
                                    {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white animate-spin" />Saving...</> : saved ? <><i className="fa-regular fa-check text-xs" />Saved</> : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div></div></section>
        </div>
    );
}
