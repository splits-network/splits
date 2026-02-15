"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = useState("general");
    const [darkMode, setDarkMode] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [autoAssign, setAutoAssign] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-settings-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-settings-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-settings-nav", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-settings-panel", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const navItems = [
        { key: "general", label: "GENERAL", icon: "fa-gear" },
        { key: "notifications", label: "NOTIFICATIONS", icon: "fa-bell" },
        { key: "security", label: "SECURITY", icon: "fa-shield" },
        { key: "integrations", label: "INTEGRATIONS", icon: "fa-puzzle-piece" },
        { key: "billing", label: "BILLING", icon: "fa-credit-card" },
        { key: "danger", label: "DANGER_ZONE", icon: "fa-triangle-exclamation" },
    ];

    const Toggle = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm text-[#c8ccd4]/60">{label}</span>
            <button
                onClick={onToggle}
                className={`w-10 h-5 border relative transition-colors ${
                    enabled ? "bg-[#3b5ccc]/20 border-[#3b5ccc]/40" : "bg-[#c8ccd4]/5 border-[#c8ccd4]/15"
                }`}
            >
                <div
                    className={`absolute top-0.5 w-3.5 h-3.5 transition-all ${
                        enabled ? "left-[calc(100%-18px)] bg-[#3b5ccc]" : "left-0.5 bg-[#c8ccd4]/30"
                    }`}
                ></div>
            </button>
        </div>
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-settings-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-SETS07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            CONFIGURATION
                        </div>
                    </div>

                    <h1 className="bp-settings-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        System <span className="text-[#3b5ccc]">Settings</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// OPERATOR CONFIGURATION PANEL</p>

                    <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {/* ═══ Sidebar Navigation ═══ */}
                        <div className="bp-settings-nav lg:col-span-1 opacity-0">
                            <div className="border border-[#3b5ccc]/15">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-4 py-3 border-b border-[#3b5ccc]/10">
                                    NAV_MODULES
                                </div>
                                <div className="divide-y divide-[#3b5ccc]/10">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setActiveSection(item.key)}
                                            className={`w-full px-4 py-3 flex items-center gap-3 font-mono text-[10px] tracking-widest transition-colors text-left ${
                                                activeSection === item.key
                                                    ? "text-[#3b5ccc] bg-[#3b5ccc]/5 border-l-2 border-l-[#3b5ccc]"
                                                    : item.key === "danger"
                                                      ? "text-[#ef4444]/40 hover:text-[#ef4444]/70 hover:bg-[#ef4444]/5"
                                                      : "text-[#c8ccd4]/30 hover:text-[#c8ccd4]/60 hover:bg-[#3b5ccc]/5"
                                            }`}
                                        >
                                            <i className={`fa-duotone fa-regular ${item.icon} text-xs w-4`}></i>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ═══ Content Panel ═══ */}
                        <div className="bp-settings-panel lg:col-span-3 opacity-0 space-y-6">
                            {/* General Settings */}
                            {activeSection === "general" && (
                                <>
                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            SECTION-001 // PROFILE SETTINGS
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">DISPLAY_NAME</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Marcus Chen"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">EMAIL_ADDRESS</label>
                                                <input
                                                    type="email"
                                                    defaultValue="m.chen@splitsnetwork.com"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">TIMEZONE</label>
                                                <select className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono">
                                                    <option>America/Los_Angeles (PST)</option>
                                                    <option>America/New_York (EST)</option>
                                                    <option>Europe/London (GMT)</option>
                                                    <option>Asia/Tokyo (JST)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            SECTION-002 // PREFERENCES
                                        </div>
                                        <div className="p-6">
                                            <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} label="Dark Mode" />
                                            <Toggle enabled={autoAssign} onToggle={() => setAutoAssign(!autoAssign)} label="Auto-assign incoming roles" />
                                            <Toggle enabled={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} label="Public profile visibility" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button className="px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                            DISCARD
                                        </button>
                                        <button className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                            SAVE_CHANGES
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Notifications */}
                            {activeSection === "notifications" && (
                                <div className="border border-[#3b5ccc]/15">
                                    <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                        SECTION-003 // NOTIFICATION PREFERENCES
                                    </div>
                                    <div className="p-6 space-y-1">
                                        <Toggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} label="Email notifications" />
                                        <Toggle enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} label="Push notifications" />
                                        <div className="border-t border-[#3b5ccc]/10 mt-4 pt-4">
                                            <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest mb-4">NOTIFICATION_CHANNELS</div>
                                            {[
                                                { label: "New role assignments", channel: "Email + Push" },
                                                { label: "Candidate submissions", channel: "Email" },
                                                { label: "Placement confirmations", channel: "Email + Push" },
                                                { label: "Split-fee proposals", channel: "Email + Push" },
                                                { label: "System updates", channel: "Email" },
                                            ].map((item) => (
                                                <div key={item.label} className="flex items-center justify-between py-2.5">
                                                    <span className="text-sm text-[#c8ccd4]/50">{item.label}</span>
                                                    <span className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-wider">{item.channel}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security */}
                            {activeSection === "security" && (
                                <>
                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            SECTION-004 // AUTHENTICATION
                                        </div>
                                        <div className="p-6">
                                            <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} label="Two-factor authentication" />
                                            <div className="mt-4 pt-4 border-t border-[#3b5ccc]/10">
                                                <button className="px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                                    CHANGE_PASSWORD
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            SECTION-005 // ACTIVE SESSIONS
                                        </div>
                                        <div className="divide-y divide-[#3b5ccc]/10">
                                            {[
                                                { device: "MacBook Pro - Chrome", location: "San Francisco, CA", time: "Current session", active: true },
                                                { device: "iPhone 15 - Safari", location: "San Francisco, CA", time: "2h ago", active: false },
                                                { device: "Windows Desktop - Edge", location: "Oakland, CA", time: "3d ago", active: false },
                                            ].map((session, idx) => (
                                                <div key={idx} className="px-6 py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 ${session.active ? "bg-[#22c55e]" : "bg-[#c8ccd4]/15"}`}></div>
                                                        <div>
                                                            <div className="text-sm text-white">{session.device}</div>
                                                            <div className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-wider mt-0.5">
                                                                {session.location} -- {session.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!session.active && (
                                                        <button className="font-mono text-[9px] text-[#ef4444]/40 tracking-widest hover:text-[#ef4444] transition-colors">
                                                            REVOKE
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Integrations */}
                            {activeSection === "integrations" && (
                                <div className="border border-[#3b5ccc]/15">
                                    <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                        SECTION-006 // CONNECTED SERVICES
                                    </div>
                                    <div className="divide-y divide-[#3b5ccc]/10">
                                        {[
                                            { name: "LinkedIn Recruiter", status: "CONNECTED", icon: "fa-linkedin", connected: true },
                                            { name: "Google Workspace", status: "CONNECTED", icon: "fa-google", connected: true },
                                            { name: "Slack", status: "NOT_CONNECTED", icon: "fa-slack", connected: false },
                                            { name: "Calendly", status: "NOT_CONNECTED", icon: "fa-calendar", connected: false },
                                            { name: "Zoom", status: "CONNECTED", icon: "fa-video", connected: true },
                                        ].map((integration) => (
                                            <div key={integration.name} className="px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 border border-[#3b5ccc]/15 flex items-center justify-center">
                                                        <i className={`fa-brands ${integration.icon} text-lg ${integration.connected ? "text-[#3b5ccc]/60" : "text-[#c8ccd4]/15"}`}></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">{integration.name}</div>
                                                        <div
                                                            className={`font-mono text-[9px] tracking-widest mt-0.5 ${
                                                                integration.connected ? "text-[#22c55e]/50" : "text-[#c8ccd4]/20"
                                                            }`}
                                                        >
                                                            {integration.status}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`px-4 py-2 font-mono text-[9px] tracking-widest border transition-colors ${
                                                        integration.connected
                                                            ? "border-[#ef4444]/20 text-[#ef4444]/40 hover:text-[#ef4444] hover:border-[#ef4444]/40"
                                                            : "border-[#3b5ccc]/30 text-[#3b5ccc] hover:bg-[#3b5ccc]/10"
                                                    }`}
                                                >
                                                    {integration.connected ? "DISCONNECT" : "CONNECT"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Billing */}
                            {activeSection === "billing" && (
                                <>
                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            SECTION-007 // CURRENT PLAN
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="text-lg font-bold text-white">Professional Plan</div>
                                                    <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider mt-1">$99/month -- Billed annually</div>
                                                </div>
                                                <span className="px-3 py-1.5 border border-[#22c55e]/30 bg-[#22c55e]/5 font-mono text-[9px] text-[#22c55e]/70 tracking-widest">
                                                    ACTIVE
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-px bg-[#3b5ccc]/10 mt-4">
                                                {[
                                                    { label: "ROLES", value: "12 / 25" },
                                                    { label: "TEAM", value: "3 / 5" },
                                                    { label: "STORAGE", value: "4.2 GB / 10 GB" },
                                                ].map((usage) => (
                                                    <div key={usage.label} className="bg-[#0a0e17] p-3 text-center">
                                                        <div className="text-sm font-bold text-white">{usage.value}</div>
                                                        <div className="font-mono text-[8px] text-[#3b5ccc]/40 tracking-widest mt-1">{usage.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <button className="px-5 py-2.5 border border-[#3b5ccc]/30 text-[#3b5ccc] font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/10 transition-colors">
                                                    UPGRADE_PLAN
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-[#3b5ccc]/15">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            PAYMENT_METHOD
                                        </div>
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-7 border border-[#3b5ccc]/15 flex items-center justify-center">
                                                    <i className="fa-duotone fa-regular fa-credit-card text-[#3b5ccc]/40"></i>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white font-mono">**** **** **** 4242</div>
                                                    <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider mt-0.5">Expires 12/2027</div>
                                                </div>
                                            </div>
                                            <button className="font-mono text-[9px] text-[#3b5ccc]/50 tracking-widest hover:text-[#3b5ccc] transition-colors">
                                                UPDATE
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Danger Zone */}
                            {activeSection === "danger" && (
                                <div className="border border-[#ef4444]/15">
                                    <div className="font-mono text-[9px] text-[#ef4444]/30 tracking-widest px-6 py-3 border-b border-[#ef4444]/10">
                                        SECTION-008 // DANGER ZONE
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-white">Export Account Data</div>
                                                <div className="text-xs text-[#c8ccd4]/30 mt-1">Download all your data in JSON format</div>
                                            </div>
                                            <button className="px-4 py-2 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[9px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                                EXPORT
                                            </button>
                                        </div>
                                        <div className="border-t border-[#ef4444]/10 pt-6 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-[#ef4444]/70">Deactivate Account</div>
                                                <div className="text-xs text-[#c8ccd4]/30 mt-1">Temporarily disable your account and hide your profile</div>
                                            </div>
                                            <button className="px-4 py-2 border border-[#eab308]/30 text-[#eab308]/60 font-mono text-[9px] tracking-widest hover:text-[#eab308] hover:border-[#eab308]/50 transition-colors">
                                                DEACTIVATE
                                            </button>
                                        </div>
                                        <div className="border-t border-[#ef4444]/10 pt-6 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-[#ef4444]/70">Delete Account</div>
                                                <div className="text-xs text-[#c8ccd4]/30 mt-1">Permanently delete your account and all associated data</div>
                                            </div>
                                            <button className="px-4 py-2 border border-[#ef4444]/30 text-[#ef4444]/60 font-mono text-[9px] tracking-widest hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
                                                DELETE_ACCOUNT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
