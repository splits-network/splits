"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

type Section = "account" | "notifications" | "privacy" | "billing" | "team" | "integrations" | "appearance";

const SECTIONS: { key: Section; label: string; icon: string; color: string }[] = [
    { key: "account", label: "Account", icon: "fa-duotone fa-regular fa-user", color: C.coral },
    { key: "notifications", label: "Notifications", icon: "fa-duotone fa-regular fa-bell", color: C.teal },
    { key: "privacy", label: "Privacy & Security", icon: "fa-duotone fa-regular fa-shield-check", color: C.yellow },
    { key: "billing", label: "Billing", icon: "fa-duotone fa-regular fa-credit-card", color: C.purple },
    { key: "team", label: "Team", icon: "fa-duotone fa-regular fa-users", color: C.coral },
    { key: "integrations", label: "Integrations", icon: "fa-duotone fa-regular fa-plug", color: C.teal },
    { key: "appearance", label: "Appearance", icon: "fa-duotone fa-regular fa-palette", color: C.yellow },
];

function Toggle({ enabled, onChange, color = C.teal }: { enabled: boolean; onChange: (v: boolean) => void; color?: string }) {
    return (
        <button onClick={() => onChange(!enabled)} className="w-12 h-7 relative border-3 transition-all"
            style={{ borderColor: enabled ? color : "rgba(26,26,46,0.2)", backgroundColor: enabled ? color : C.cream }}>
            <div className="absolute top-0.5 w-4 h-4 transition-all border-2"
                style={{ left: enabled ? "calc(100% - 20px)" : "2px", borderColor: C.dark, backgroundColor: C.white }} />
        </button>
    );
}

function SettingsField({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-4 border-b-2" style={{ borderColor: C.cream }}>
            <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: C.dark }}>{label}</p>
                {description && <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{description}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

export default function SettingsSixPage() {
    const [active, setActive] = useState<Section>("account");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({ name: "Marcus Thompson", email: "marcus@talentpartners.com", phone: "+1 (555) 234-5678", company: "Talent Partners Inc." });
    const [notifs, setNotifs] = useState({ emailApp: true, emailPlace: true, emailMsg: false, pushApp: true, pushPlace: true, pushMsg: true, inAppAll: true, digest: "daily" });
    const [privacy, setPrivacy] = useState({ twoFactor: false, publicProfile: true, showEmail: false, showPhone: false, activityVisible: true });
    const [appearance, setAppearance] = useState({ theme: "dark", density: "comfortable" });
    const pageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000);
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".settings-sidebar"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
        gsap.fromTo(pageRef.current.querySelector(".settings-content"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 });
    }, []);

    useEffect(() => {
        if (!contentRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(contentRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
    }, [active]);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Header */}
            <div style={{ backgroundColor: C.dark }}>
                <div className="container mx-auto px-4 py-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                        style={{ backgroundColor: C.yellow, color: C.dark }}>
                        <i className="fa-duotone fa-regular fa-gear"></i>Settings
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: C.white }}>
                        Account{" "}<span style={{ color: C.yellow }}>Settings</span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="settings-sidebar lg:col-span-1">
                        <div className="border-4 p-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <div className="space-y-1">
                                {SECTIONS.map((s) => (
                                    <button key={s.key} onClick={() => setActive(s.key)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all text-left"
                                        style={{
                                            borderLeft: `4px solid ${active === s.key ? s.color : "transparent"}`,
                                            backgroundColor: active === s.key ? C.cream : "transparent",
                                            color: active === s.key ? C.dark : "rgba(26,26,46,0.5)",
                                        }}>
                                        <i className={`${s.icon} text-sm`} style={{ color: active === s.key ? s.color : undefined }}></i>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="settings-content lg:col-span-3">
                        <div ref={contentRef} className="border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-8 h-8 flex items-center justify-center"
                                        style={{ backgroundColor: SECTIONS.find(s => s.key === active)?.color }}>
                                        <i className={`${SECTIONS.find(s => s.key === active)?.icon} text-sm`}
                                            style={{ color: SECTIONS.find(s => s.key === active)?.color === C.yellow ? C.dark : C.white }}></i>
                                    </span>
                                    {SECTIONS.find(s => s.key === active)?.label}
                                </h2>
                                {saved && (
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                                        style={{ backgroundColor: C.teal, color: C.dark }}>
                                        <i className="fa-solid fa-check text-xs"></i>Saved
                                    </span>
                                )}
                            </div>

                            {/* Account */}
                            {active === "account" && (
                                <div className="space-y-0">
                                    <SettingsField label="Full Name">
                                        <input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                                            className="px-3 py-2 border-3 text-sm font-semibold outline-none w-64" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                    </SettingsField>
                                    <SettingsField label="Email Address" description="Used for login and notifications">
                                        <input value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                                            className="px-3 py-2 border-3 text-sm font-semibold outline-none w-64" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                    </SettingsField>
                                    <SettingsField label="Phone Number">
                                        <input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                            className="px-3 py-2 border-3 text-sm font-semibold outline-none w-64" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                    </SettingsField>
                                    <SettingsField label="Company">
                                        <input value={profile.company} onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))}
                                            className="px-3 py-2 border-3 text-sm font-semibold outline-none w-64" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                    </SettingsField>
                                    <SettingsField label="Password" description="Last changed 30 days ago">
                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3"
                                            style={{ borderColor: C.coral, color: C.coral }}>Change Password</button>
                                    </SettingsField>
                                </div>
                            )}

                            {/* Notifications */}
                            {active === "notifications" && (
                                <div className="space-y-0">
                                    <div className="mb-4 p-3 border-3" style={{ borderColor: C.teal }}>
                                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.teal }}>
                                            <i className="fa-duotone fa-regular fa-envelope mr-1"></i>Email Notifications
                                        </p>
                                    </div>
                                    <SettingsField label="New Applications" description="When candidates apply to your jobs">
                                        <Toggle enabled={notifs.emailApp} onChange={(v) => setNotifs(n => ({ ...n, emailApp: v }))} />
                                    </SettingsField>
                                    <SettingsField label="Placement Updates" description="When a placement status changes">
                                        <Toggle enabled={notifs.emailPlace} onChange={(v) => setNotifs(n => ({ ...n, emailPlace: v }))} />
                                    </SettingsField>
                                    <SettingsField label="Messages" description="When you receive a new message">
                                        <Toggle enabled={notifs.emailMsg} onChange={(v) => setNotifs(n => ({ ...n, emailMsg: v }))} />
                                    </SettingsField>
                                    <div className="mb-4 mt-6 p-3 border-3" style={{ borderColor: C.purple }}>
                                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.purple }}>
                                            <i className="fa-duotone fa-regular fa-mobile mr-1"></i>Push Notifications
                                        </p>
                                    </div>
                                    <SettingsField label="New Applications"><Toggle enabled={notifs.pushApp} onChange={(v) => setNotifs(n => ({ ...n, pushApp: v }))} color={C.purple} /></SettingsField>
                                    <SettingsField label="Placement Updates"><Toggle enabled={notifs.pushPlace} onChange={(v) => setNotifs(n => ({ ...n, pushPlace: v }))} color={C.purple} /></SettingsField>
                                    <SettingsField label="Messages"><Toggle enabled={notifs.pushMsg} onChange={(v) => setNotifs(n => ({ ...n, pushMsg: v }))} color={C.purple} /></SettingsField>
                                    <SettingsField label="Email Digest" description="Receive a summary of activity">
                                        <select value={notifs.digest} onChange={(e) => setNotifs(n => ({ ...n, digest: e.target.value }))}
                                            className="px-3 py-2 border-3 text-xs font-bold uppercase outline-none cursor-pointer"
                                            style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="never">Never</option>
                                        </select>
                                    </SettingsField>
                                </div>
                            )}

                            {/* Privacy */}
                            {active === "privacy" && (
                                <div className="space-y-0">
                                    <SettingsField label="Two-Factor Authentication" description="Add an extra layer of security">
                                        <Toggle enabled={privacy.twoFactor} onChange={(v) => setPrivacy(p => ({ ...p, twoFactor: v }))} color={C.yellow} />
                                    </SettingsField>
                                    <SettingsField label="Public Profile" description="Allow others to view your profile">
                                        <Toggle enabled={privacy.publicProfile} onChange={(v) => setPrivacy(p => ({ ...p, publicProfile: v }))} color={C.yellow} />
                                    </SettingsField>
                                    <SettingsField label="Show Email Address" description="Display email on your public profile">
                                        <Toggle enabled={privacy.showEmail} onChange={(v) => setPrivacy(p => ({ ...p, showEmail: v }))} color={C.yellow} />
                                    </SettingsField>
                                    <SettingsField label="Show Phone Number"><Toggle enabled={privacy.showPhone} onChange={(v) => setPrivacy(p => ({ ...p, showPhone: v }))} color={C.yellow} /></SettingsField>
                                    <SettingsField label="Activity Visibility" description="Let others see your recent activity">
                                        <Toggle enabled={privacy.activityVisible} onChange={(v) => setPrivacy(p => ({ ...p, activityVisible: v }))} color={C.yellow} />
                                    </SettingsField>
                                    <div className="mt-6 p-4 border-3" style={{ borderColor: C.coral }}>
                                        <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: C.coral }}>
                                            <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1"></i>Danger Zone
                                        </p>
                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3"
                                            style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>Delete Account</button>
                                    </div>
                                </div>
                            )}

                            {/* Billing */}
                            {active === "billing" && (
                                <div>
                                    <div className="border-3 p-6 mb-6" style={{ borderColor: C.purple }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.5 }}>Current Plan</p>
                                                <p className="text-2xl font-black uppercase" style={{ color: C.purple }}>Pro</p>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-black uppercase" style={{ backgroundColor: C.teal, color: C.dark }}>Active</span>
                                        </div>
                                        <div className="flex items-end gap-1 mb-4">
                                            <span className="text-3xl font-black" style={{ color: C.dark }}>$49</span>
                                            <span className="text-sm font-bold mb-1" style={{ color: C.dark, opacity: 0.4 }}>/month</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 text-xs font-black uppercase border-3" style={{ borderColor: C.purple, backgroundColor: C.purple, color: C.white }}>Upgrade</button>
                                            <button className="px-4 py-2 text-xs font-black uppercase border-3" style={{ borderColor: C.dark, color: C.dark }}>Change Plan</button>
                                        </div>
                                    </div>
                                    <SettingsField label="Payment Method" description="Visa ending in 4242">
                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3" style={{ borderColor: C.dark, color: C.dark }}>Update</button>
                                    </SettingsField>
                                    <SettingsField label="Billing Email" description="marcus@talentpartners.com">
                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3" style={{ borderColor: C.dark, color: C.dark }}>Change</button>
                                    </SettingsField>
                                    <SettingsField label="Next Invoice" description="March 1, 2026 - $49.00">
                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3" style={{ borderColor: C.teal, color: C.teal }}>View History</button>
                                    </SettingsField>
                                </div>
                            )}

                            {/* Team */}
                            {active === "team" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-xs font-bold uppercase" style={{ color: C.dark, opacity: 0.5 }}>3 members</p>
                                        <button className="px-4 py-2 text-xs font-black uppercase border-3 flex items-center gap-1"
                                            style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                            <i className="fa-solid fa-plus text-xs"></i>Invite
                                        </button>
                                    </div>
                                    {[
                                        { name: "Marcus Thompson", email: "marcus@tp.com", role: "Admin", color: C.coral },
                                        { name: "Sarah Kim", email: "sarah@tp.com", role: "Member", color: C.teal },
                                        { name: "David Chen", email: "david@tp.com", role: "Member", color: C.purple },
                                    ].map((m, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border-b-2" style={{ borderColor: C.cream }}>
                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 rounded-full"
                                                style={{ borderColor: m.color, backgroundColor: m.color }}>
                                                <span className="text-xs font-black" style={{ color: m.color === C.yellow ? C.dark : C.white }}>
                                                    {m.name.split(" ").map(n => n[0]).join("")}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold" style={{ color: C.dark }}>{m.name}</p>
                                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{m.email}</p>
                                            </div>
                                            <span className="px-2 py-1 text-[10px] font-black uppercase border-2" style={{ borderColor: m.color, color: m.color }}>{m.role}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Integrations */}
                            {active === "integrations" && (
                                <div className="space-y-4">
                                    {[
                                        { name: "Slack", desc: "Get notifications in your Slack workspace", icon: "fa-brands fa-slack", connected: true, color: C.teal },
                                        { name: "Google Calendar", desc: "Sync interviews and meetings", icon: "fa-brands fa-google", connected: true, color: C.coral },
                                        { name: "LinkedIn", desc: "Import candidate profiles", icon: "fa-brands fa-linkedin-in", connected: false, color: C.purple },
                                        { name: "Zapier", desc: "Connect with 5,000+ apps", icon: "fa-duotone fa-regular fa-bolt", connected: false, color: C.yellow },
                                    ].map((int, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border-3" style={{ borderColor: int.color }}>
                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: int.color }}>
                                                <i className={`${int.icon} text-lg`} style={{ color: int.color === C.yellow ? C.dark : C.white }}></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold" style={{ color: C.dark }}>{int.name}</p>
                                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{int.desc}</p>
                                            </div>
                                            <button className="px-4 py-2 text-xs font-black uppercase border-3"
                                                style={{
                                                    borderColor: int.connected ? C.teal : C.dark,
                                                    backgroundColor: int.connected ? C.teal : "transparent",
                                                    color: int.connected ? C.dark : C.dark,
                                                }}>
                                                {int.connected ? "Connected" : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Appearance */}
                            {active === "appearance" && (
                                <div className="space-y-0">
                                    <SettingsField label="Theme" description="Choose your preferred color scheme">
                                        <div className="flex gap-2">
                                            {["dark", "light"].map((t) => (
                                                <button key={t} onClick={() => setAppearance(a => ({ ...a, theme: t }))}
                                                    className="px-4 py-2 text-xs font-black uppercase border-3"
                                                    style={{
                                                        borderColor: appearance.theme === t ? C.yellow : C.dark,
                                                        backgroundColor: appearance.theme === t ? C.yellow : "transparent",
                                                        color: appearance.theme === t ? C.dark : C.dark,
                                                    }}>{t}</button>
                                            ))}
                                        </div>
                                    </SettingsField>
                                    <SettingsField label="Density" description="Adjust spacing and layout">
                                        <div className="flex gap-2">
                                            {["compact", "comfortable", "spacious"].map((d) => (
                                                <button key={d} onClick={() => setAppearance(a => ({ ...a, density: d }))}
                                                    className="px-3 py-2 text-xs font-black uppercase border-3"
                                                    style={{
                                                        borderColor: appearance.density === d ? C.yellow : C.dark,
                                                        backgroundColor: appearance.density === d ? C.yellow : "transparent",
                                                        color: appearance.density === d ? C.dark : C.dark,
                                                    }}>{d}</button>
                                            ))}
                                        </div>
                                    </SettingsField>
                                </div>
                            )}
                        </div>

                        {/* Save Bar */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button className="px-5 py-3 text-xs font-black uppercase tracking-wider border-3" style={{ borderColor: C.dark, color: C.dark }}>
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                                style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                {saving ? <><i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xs"></i>Saving...</> : <><i className="fa-duotone fa-regular fa-floppy-disk text-xs"></i>Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
