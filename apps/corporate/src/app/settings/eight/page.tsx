"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BG = {
  deep: "#0a1628",
  mid: "#0d1d33",
  card: "#0f2847",
  dark: "#081220",
  input: "#0b1a2e",
};

const D = { fast: 0.3, normal: 0.6, hero: 1.0, build: 1.4 };
const E = { smooth: "power2.out", bounce: "back.out(1.2)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.05, normal: 0.1, loose: 0.15 };

const SECTIONS = [
  { id: "account", label: "Account", icon: "fa-user-gear" },
  { id: "notifications", label: "Notifications", icon: "fa-bell" },
  { id: "privacy", label: "Privacy & Security", icon: "fa-shield-check" },
  { id: "billing", label: "Billing", icon: "fa-credit-card" },
  { id: "team", label: "Team", icon: "fa-users" },
  { id: "integrations", label: "Integrations", icon: "fa-puzzle-piece" },
  { id: "appearance", label: "Appearance", icon: "fa-palette" },
];

const TEAM_MEMBERS = [
  { name: "Sarah Chen", email: "sarah@company.com", role: "Admin", avatar: "SC", status: "active" },
  { name: "Marcus Rivera", email: "marcus@company.com", role: "Manager", avatar: "MR", status: "active" },
  { name: "Emily Watson", email: "emily@company.com", role: "Member", avatar: "EW", status: "active" },
  { name: "James Park", email: "james@company.com", role: "Member", avatar: "JP", status: "pending" },
];

const INTEGRATIONS = [
  { name: "Slack", desc: "Get notifications in your Slack channels", icon: "fa-brands fa-slack", connected: true },
  { name: "Google Calendar", desc: "Sync interviews and meetings", icon: "fa-brands fa-google", connected: true },
  { name: "LinkedIn", desc: "Import candidate profiles", icon: "fa-brands fa-linkedin", connected: false },
  { name: "Zapier", desc: "Automate workflows with 5,000+ apps", icon: "fa-bolt", connected: false },
  { name: "HubSpot", desc: "Sync contacts and company data", icon: "fa-h", connected: false },
  { name: "Microsoft Teams", desc: "Collaborate with your hiring team", icon: "fa-brands fa-microsoft", connected: false },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200"
      style={{ backgroundColor: enabled ? "#22d3ee" : "rgba(255,255,255,0.15)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function AccountSection() {
  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">
          // PROFILE INFORMATION
        </h3>
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 rounded-lg border-2 border-cyan-500/30 flex items-center justify-center text-2xl font-bold text-cyan-400" style={{ background: BG.input }}>
            JD
          </div>
          <div className="flex-1">
            <button className="btn btn-sm border border-cyan-500/30 text-cyan-400 bg-transparent hover:bg-cyan-500/10 mb-2">
              <i className="fa-duotone fa-regular fa-camera mr-2" />
              Change Photo
            </button>
            <p className="text-xs text-white/40 font-mono">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">First Name</label>
            <input type="text" defaultValue="John" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Last Name</label>
            <input type="text" defaultValue="Doe" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Email</label>
            <input type="email" defaultValue="john.doe@company.com" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Phone</label>
            <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div className="md:col-span-2">
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Bio</label>
            <textarea rows={3} defaultValue="Senior Recruiter specializing in technology placements across the Pacific Northwest." className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none" style={{ background: BG.input }} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 rounded font-mono text-sm font-bold text-white" style={{ background: "#22d3ee" }}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">
          // CHANGE PASSWORD
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div>
            <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" style={{ background: BG.input }} />
          </div>
          <div className="pt-2">
            <button className="px-4 py-2 rounded font-mono text-sm font-bold text-white" style={{ background: "#22d3ee" }}>
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-500/30 p-6" style={{ background: "rgba(220,38,38,0.05)" }}>
        <h3 className="font-mono text-sm text-red-400 tracking-wider uppercase mb-4">
          // DANGER ZONE
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Delete Account</p>
            <p className="text-white/40 text-sm font-mono">Permanently delete your account and all associated data</p>
          </div>
          <button className="px-4 py-2 rounded border border-red-500/40 text-red-400 font-mono text-sm hover:bg-red-500/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailNewMatch: true,
    emailApplication: true,
    emailWeekly: true,
    emailMarketing: false,
    pushNewMatch: true,
    pushApplication: true,
    pushMessages: true,
    pushMentions: true,
    inAppNewMatch: true,
    inAppApplication: true,
    inAppMessages: true,
    inAppSystem: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const groups = [
    {
      title: "Email Notifications",
      icon: "fa-envelope",
      items: [
        { key: "emailNewMatch" as const, label: "New candidate matches", desc: "When a candidate matches your job criteria" },
        { key: "emailApplication" as const, label: "Application updates", desc: "Status changes on your applications" },
        { key: "emailWeekly" as const, label: "Weekly digest", desc: "Summary of your weekly activity" },
        { key: "emailMarketing" as const, label: "Marketing emails", desc: "Product updates and announcements" },
      ],
    },
    {
      title: "Push Notifications",
      icon: "fa-mobile",
      items: [
        { key: "pushNewMatch" as const, label: "New matches", desc: "Instant alerts for new candidate matches" },
        { key: "pushApplication" as const, label: "Application updates", desc: "Real-time application status changes" },
        { key: "pushMessages" as const, label: "Messages", desc: "New messages from your network" },
        { key: "pushMentions" as const, label: "Mentions", desc: "When someone mentions you" },
      ],
    },
    {
      title: "In-App Notifications",
      icon: "fa-bell",
      items: [
        { key: "inAppNewMatch" as const, label: "New matches", desc: "Match notifications in the app" },
        { key: "inAppApplication" as const, label: "Applications", desc: "Application activity alerts" },
        { key: "inAppMessages" as const, label: "Messages", desc: "Message notifications" },
        { key: "inAppSystem" as const, label: "System updates", desc: "Platform and maintenance alerts" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <div key={group.title} className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
          <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6 flex items-center gap-2">
            <i className={`fa-duotone fa-regular ${group.icon}`} />
            // {group.title.toUpperCase()}
          </h3>
          <div className="space-y-4">
            {group.items.map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-cyan-500/10 last:border-0">
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs font-mono">{item.desc}</p>
                </div>
                <Toggle enabled={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrivacySection() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);

  const sessions = [
    { device: "Chrome on Windows", location: "Seattle, WA", time: "Active now", current: true },
    { device: "Safari on iPhone", location: "Seattle, WA", time: "2 hours ago", current: false },
    { device: "Firefox on MacOS", location: "Portland, OR", time: "3 days ago", current: false },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// SECURITY</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
            <div>
              <p className="text-white text-sm">Two-Factor Authentication</p>
              <p className="text-white/40 text-xs font-mono">Add an extra layer of security to your account</p>
            </div>
            <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm">Login Alerts</p>
              <p className="text-white/40 text-xs font-mono">Get notified of new sign-ins to your account</p>
            </div>
            <Toggle enabled={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// PRIVACY</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
            <div>
              <p className="text-white text-sm">Profile Visibility</p>
              <p className="text-white/40 text-xs font-mono">Make your profile visible in the recruiter directory</p>
            </div>
            <Toggle enabled={profileVisible} onChange={() => setProfileVisible(!profileVisible)} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
            <div>
              <p className="text-white text-sm">Show Email Address</p>
              <p className="text-white/40 text-xs font-mono">Display your email on your public profile</p>
            </div>
            <Toggle enabled={showEmail} onChange={() => setShowEmail(!showEmail)} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
            <div>
              <p className="text-white text-sm">Show Phone Number</p>
              <p className="text-white/40 text-xs font-mono">Display your phone on your public profile</p>
            </div>
            <Toggle enabled={showPhone} onChange={() => setShowPhone(!showPhone)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm">Activity Status</p>
              <p className="text-white/40 text-xs font-mono">Show when you are online to other users</p>
            </div>
            <Toggle enabled={activityStatus} onChange={() => setActivityStatus(!activityStatus)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// ACTIVE SESSIONS</h3>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded border border-cyan-500/10" style={{ background: BG.input }}>
              <div className="flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-desktop text-cyan-400" />
                <div>
                  <p className="text-white text-sm">{s.device}</p>
                  <p className="text-white/40 text-xs font-mono">{s.location} &middot; {s.time}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-xs font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Current</span>
              ) : (
                <button className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// CURRENT PLAN</h3>
        <div className="flex items-center justify-between p-4 rounded border border-cyan-500/20" style={{ background: BG.input }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">Professional Plan</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Active</span>
            </div>
            <p className="text-white/40 text-sm font-mono mt-1">$79/month &middot; Billed monthly &middot; Renews Mar 14, 2026</p>
          </div>
          <button className="px-4 py-2 rounded border border-cyan-500/30 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-colors">
            Upgrade Plan
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[{ label: "Placements", used: 12, max: 25 }, { label: "Team Members", used: 4, max: 10 }, { label: "AI Credits", used: 340, max: 500 }].map(u => (
            <div key={u.label} className="p-3 rounded border border-cyan-500/10" style={{ background: BG.input }}>
              <p className="text-white/40 text-xs font-mono uppercase">{u.label}</p>
              <p className="text-white font-mono text-lg mt-1">{u.used}<span className="text-white/30">/{u.max}</span></p>
              <div className="w-full h-1 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full" style={{ width: `${(u.used / u.max) * 100}%`, background: "#22d3ee" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// PAYMENT METHOD</h3>
        <div className="flex items-center justify-between p-4 rounded border border-cyan-500/10" style={{ background: BG.input }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded border border-cyan-500/20 flex items-center justify-center" style={{ background: BG.dark }}>
              <i className="fa-brands fa-cc-visa text-cyan-400 text-lg" />
            </div>
            <div>
              <p className="text-white text-sm font-mono">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242</p>
              <p className="text-white/40 text-xs font-mono">Expires 12/2027</p>
            </div>
          </div>
          <button className="text-cyan-400 text-sm font-mono hover:text-cyan-300 transition-colors">Update</button>
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// BILLING HISTORY</h3>
        <div className="space-y-2">
          {[
            { date: "Feb 14, 2026", amount: "$79.00", status: "Paid" },
            { date: "Jan 14, 2026", amount: "$79.00", status: "Paid" },
            { date: "Dec 14, 2025", amount: "$79.00", status: "Paid" },
            { date: "Nov 14, 2025", amount: "$79.00", status: "Paid" },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded border border-cyan-500/10" style={{ background: BG.input }}>
              <div className="flex items-center gap-4">
                <i className="fa-duotone fa-regular fa-file-invoice text-cyan-400/50" />
                <span className="text-white text-sm font-mono">{inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-mono text-sm">{inv.amount}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{inv.status}</span>
                <button className="text-cyan-400/50 hover:text-cyan-400 transition-colors">
                  <i className="fa-duotone fa-regular fa-download" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase">// TEAM MEMBERS</h3>
          <button className="px-3 py-1.5 rounded font-mono text-sm font-bold text-white flex items-center gap-2" style={{ background: "#22d3ee" }}>
            <i className="fa-duotone fa-regular fa-user-plus" />
            Invite Member
          </button>
        </div>
        <div className="space-y-3">
          {TEAM_MEMBERS.map((m, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded border border-cyan-500/10" style={{ background: BG.input }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center font-mono text-sm text-cyan-400 font-bold" style={{ background: BG.dark }}>
                  {m.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm">{m.name}</p>
                    {m.status === "pending" && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-mono">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-2 py-1 rounded border border-cyan-500/20 text-white text-sm font-mono focus:outline-none" style={{ background: BG.dark }} defaultValue={m.role}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </select>
                <button className="text-red-400/50 hover:text-red-400 transition-colors">
                  <i className="fa-duotone fa-regular fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// ROLE PERMISSIONS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left py-2 text-white/40 font-mono text-xs uppercase">Permission</th>
                <th className="text-center py-2 text-white/40 font-mono text-xs uppercase">Admin</th>
                <th className="text-center py-2 text-white/40 font-mono text-xs uppercase">Manager</th>
                <th className="text-center py-2 text-white/40 font-mono text-xs uppercase">Member</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: "Manage team members", admin: true, manager: false, member: false },
                { perm: "Edit billing settings", admin: true, manager: false, member: false },
                { perm: "Create job postings", admin: true, manager: true, member: false },
                { perm: "View all candidates", admin: true, manager: true, member: true },
                { perm: "Send messages", admin: true, manager: true, member: true },
                { perm: "Export data", admin: true, manager: true, member: false },
              ].map((r, i) => (
                <tr key={i} className="border-b border-cyan-500/10">
                  <td className="py-3 text-white font-mono text-xs">{r.perm}</td>
                  <td className="text-center py-3"><i className={`fa-duotone fa-regular ${r.admin ? "fa-check text-cyan-400" : "fa-xmark text-white/20"}`} /></td>
                  <td className="text-center py-3"><i className={`fa-duotone fa-regular ${r.manager ? "fa-check text-cyan-400" : "fa-xmark text-white/20"}`} /></td>
                  <td className="text-center py-3"><i className={`fa-duotone fa-regular ${r.member ? "fa-check text-cyan-400" : "fa-xmark text-white/20"}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const [connections, setConnections] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map(i => [i.name, i.connected]))
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// CONNECTED SERVICES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEGRATIONS.map(integ => {
            const connected = connections[integ.name];
            return (
              <div key={integ.name} className="flex items-center justify-between p-4 rounded border border-cyan-500/10" style={{ background: BG.input }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center" style={{ background: BG.dark }}>
                    <i className={`${integ.icon.startsWith("fa-brands") ? integ.icon : `fa-duotone fa-regular ${integ.icon}`} text-cyan-400`} />
                  </div>
                  <div>
                    <p className="text-white text-sm">{integ.name}</p>
                    <p className="text-white/40 text-xs font-mono">{integ.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConnections(c => ({ ...c, [integ.name]: !c[integ.name] }))}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                    connected
                      ? "border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      : "text-white font-bold"
                  }`}
                  style={connected ? {} : { background: "#22d3ee" }}
                >
                  {connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState("dark");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("medium");

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// THEME</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light", icon: "fa-sun" },
            { id: "dark", label: "Dark", icon: "fa-moon" },
            { id: "system", label: "System", icon: "fa-desktop" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded border text-center transition-colors ${
                theme === t.id ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/10 hover:border-cyan-500/20"
              }`}
              style={{ background: theme === t.id ? undefined : BG.input }}
            >
              <i className={`fa-duotone fa-regular ${t.icon} text-2xl ${theme === t.id ? "text-cyan-400" : "text-white/30"} mb-2 block`} />
              <span className={`font-mono text-sm ${theme === t.id ? "text-cyan-400" : "text-white/50"}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// DISPLAY DENSITY</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "compact", label: "Compact" },
            { id: "comfortable", label: "Comfortable" },
            { id: "spacious", label: "Spacious" },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className={`p-4 rounded border text-center transition-colors ${
                density === d.id ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/10 hover:border-cyan-500/20"
              }`}
              style={{ background: density === d.id ? undefined : BG.input }}
            >
              <div className="space-y-1 mb-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`h-${d.id === "compact" ? "1" : d.id === "comfortable" ? "1.5" : "2"} rounded mx-auto`} style={{ width: `${60 + n * 10}%`, background: density === d.id ? "#22d3ee" : "rgba(255,255,255,0.1)", height: d.id === "compact" ? 4 : d.id === "comfortable" ? 6 : 8 }} />
                ))}
              </div>
              <span className={`font-mono text-sm ${density === d.id ? "text-cyan-400" : "text-white/50"}`}>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 p-6" style={{ background: BG.card }}>
        <h3 className="font-mono text-sm text-cyan-400 tracking-wider uppercase mb-6">// FONT SIZE</h3>
        <div className="flex items-center gap-4">
          <span className="text-white/40 font-mono text-xs">A</span>
          <div className="flex-1 flex gap-2">
            {["small", "medium", "large"].map(s => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`flex-1 py-2 rounded font-mono text-sm transition-colors ${
                  fontSize === s ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400" : "border border-cyan-500/10 text-white/40 hover:border-cyan-500/20"
                }`}
                style={{ background: fontSize === s ? undefined : BG.input }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-white/40 font-mono text-lg">A</span>
        </div>
      </div>
    </div>
  );
}

export default function SettingsEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("account");

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".settings-header", { opacity: 0, y: -20, duration: D.normal })
      .from(".settings-sidebar .nav-item", { opacity: 0, x: -20, duration: D.fast, stagger: S.tight }, "-=0.3")
      .from(".settings-content", { opacity: 0, y: 20, duration: D.normal }, "-=0.3");
  }, { scope: containerRef });

  const renderSection = () => {
    switch (activeSection) {
      case "account": return <AccountSection />;
      case "notifications": return <NotificationsSection />;
      case "privacy": return <PrivacySection />;
      case "billing": return <BillingSection />;
      case "team": return <TeamSection />;
      case "integrations": return <IntegrationsSection />;
      case "appearance": return <AppearanceSection />;
      default: return <AccountSection />;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen text-white" style={{ background: BG.deep }}>
      {/* Blueprint Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner Dimension Marks */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="settings-header mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-gear text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-white/40 font-mono text-xs tracking-wider uppercase">// SYSTEM CONFIGURATION</p>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar w-56 shrink-0">
            <div className="rounded-lg border border-cyan-500/20 p-3 sticky top-8" style={{ background: BG.card }}>
              <nav className="space-y-1">
                {SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-colors text-left ${
                      activeSection === section.id
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-white/50 hover:text-white/70 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <i className={`fa-duotone fa-regular ${section.icon} w-4 text-center`} />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="settings-content flex-1 min-w-0">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
