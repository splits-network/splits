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

const STEPS = [
  { id: 1, label: "Welcome", icon: "fa-hand-wave" },
  { id: 2, label: "Profile", icon: "fa-user" },
  { id: 3, label: "Expertise", icon: "fa-briefcase" },
  { id: 4, label: "Preferences", icon: "fa-sliders" },
  { id: 5, label: "Complete", icon: "fa-check" },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Manufacturing",
  "Retail", "Education", "Energy", "Legal",
  "Real Estate", "Media", "Consulting", "Government",
];

const SPECIALIZATIONS = [
  "Software Engineering", "Product Management", "Data Science",
  "UX/UI Design", "DevOps/SRE", "Cloud Architecture",
  "Cybersecurity", "Machine Learning", "Mobile Development",
  "Frontend Development", "Backend Development", "Full Stack",
];

export default function OnboardingEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    role: "",
    phone: "",
    location: "",
    selectedIndustries: [] as string[],
    selectedSpecs: [] as string[],
    experience: "",
    notifyMatches: true,
    notifyMessages: true,
    notifyWeekly: false,
    profileVisibility: "public",
  });

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".onboard-logo", { opacity: 0, scale: 0.8, duration: D.normal, ease: E.bounce })
      .from(".onboard-progress", { opacity: 0, y: -10, duration: D.fast }, "-=0.2")
      .from(".onboard-card", { opacity: 0, y: 30, duration: D.normal }, "-=0.2");
  }, { scope: containerRef });

  useGSAP(() => {
    gsap.fromTo(".step-content", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: D.fast, ease: E.smooth });
  }, [currentStep]);

  const toggleIndustry = (ind: string) => {
    setFormData(prev => ({
      ...prev,
      selectedIndustries: prev.selectedIndustries.includes(ind)
        ? prev.selectedIndustries.filter(i => i !== ind)
        : [...prev.selectedIndustries, ind],
    }));
  };

  const toggleSpec = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecs: prev.selectedSpecs.includes(spec)
        ? prev.selectedSpecs.filter(s => s !== spec)
        : [...prev.selectedSpecs, spec],
    }));
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 5));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl border-2 border-cyan-500/30 flex items-center justify-center" style={{ background: BG.input }}>
              <i className="fa-duotone fa-regular fa-hard-hat text-cyan-400 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome to Splits Network</h2>
            <p className="text-white/50 font-mono text-sm max-w-md mx-auto mb-8">
              Let&apos;s set up your recruiter profile. This will take about 3 minutes and help us match you with the right opportunities.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { icon: "fa-magnifying-glass", label: "Discover Roles", desc: "Find split-fee opportunities" },
                { icon: "fa-handshake", label: "Connect", desc: "Partner with top recruiters" },
                { icon: "fa-chart-line", label: "Grow", desc: "Track your placements" },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-lg border border-cyan-500/10 text-center" style={{ background: BG.input }}>
                  <i className={`fa-duotone fa-regular ${item.icon} text-cyan-400 text-xl mb-2 block`} />
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/40 text-xs font-mono mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={nextStep} className="px-8 py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
              Get Started <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="text-xl font-bold text-white mb-1">Tell us about yourself</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-6">// PROFILE INFORMATION</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
                  style={{ background: BG.input }}
                />
              </div>
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
                  style={{ background: BG.input }}
                />
              </div>
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                  placeholder="Acme Recruiting"
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
                  style={{ background: BG.input }}
                />
              </div>
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                  style={{ background: BG.input }}
                >
                  <option value="">Select your role</option>
                  <option value="recruiter">Independent Recruiter</option>
                  <option value="agency_recruiter">Agency Recruiter</option>
                  <option value="ta_leader">TA Leader</option>
                  <option value="hiring_manager">Hiring Manager</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
                  style={{ background: BG.input }}
                />
              </div>
              <div>
                <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="Seattle, WA"
                  className="w-full px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
                  style={{ background: BG.input }}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="text-xl font-bold text-white mb-1">Your expertise</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-6">// SELECT YOUR SPECIALIZATIONS</p>

            <div className="mb-6">
              <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3 block">Industries you recruit for</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => {
                  const selected = formData.selectedIndustries.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => toggleIndustry(ind)}
                      className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                        selected
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400"
                          : "border border-cyan-500/15 text-white/50 hover:border-cyan-500/30 hover:text-white/70"
                      }`}
                      style={selected ? {} : { background: BG.input }}
                    >
                      {selected && <i className="fa-duotone fa-regular fa-check mr-1.5 text-xs" />}
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3 block">Role specializations</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map(spec => {
                  const selected = formData.selectedSpecs.includes(spec);
                  return (
                    <button
                      key={spec}
                      onClick={() => toggleSpec(spec)}
                      className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                        selected
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400"
                          : "border border-cyan-500/15 text-white/50 hover:border-cyan-500/30 hover:text-white/70"
                      }`}
                      style={selected ? {} : { background: BG.input }}
                    >
                      {selected && <i className="fa-duotone fa-regular fa-check mr-1.5 text-xs" />}
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1 block">Years of recruiting experience</label>
              <select
                value={formData.experience}
                onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))}
                className="w-full max-w-xs px-3 py-2.5 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                style={{ background: BG.input }}
              >
                <option value="">Select experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11+">11+ years</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="text-xl font-bold text-white mb-1">Set your preferences</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-6">// NOTIFICATION & PRIVACY</p>

            <div className="rounded-lg border border-cyan-500/20 p-5 mb-4" style={{ background: BG.input }}>
              <h3 className="font-mono text-sm text-cyan-400 mb-4">Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: "notifyMatches" as const, label: "New job matches", desc: "Get notified when jobs match your expertise" },
                  { key: "notifyMessages" as const, label: "Messages", desc: "Receive alerts for new messages" },
                  { key: "notifyWeekly" as const, label: "Weekly digest", desc: "Summary of your weekly activity" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{item.label}</p>
                      <p className="text-white/40 text-xs font-mono">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setFormData(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="relative w-11 h-6 rounded-full transition-colors duration-200"
                      style={{ backgroundColor: formData[item.key] ? "#22d3ee" : "rgba(255,255,255,0.15)" }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                        style={{ transform: formData[item.key] ? "translateX(20px)" : "translateX(0)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-cyan-500/20 p-5" style={{ background: BG.input }}>
              <h3 className="font-mono text-sm text-cyan-400 mb-4">Profile Visibility</h3>
              <div className="space-y-3">
                {[
                  { value: "public", label: "Public", desc: "Visible to all recruiters and companies", icon: "fa-globe" },
                  { value: "network", label: "Network Only", desc: "Visible only to your connections", icon: "fa-user-group" },
                  { value: "private", label: "Private", desc: "Only you can see your profile", icon: "fa-lock" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData(p => ({ ...p, profileVisibility: opt.value }))}
                    className={`w-full flex items-center gap-4 p-3 rounded border transition-colors text-left ${
                      formData.profileVisibility === opt.value
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-cyan-500/10 hover:border-cyan-500/20"
                    }`}
                  >
                    <i className={`fa-duotone fa-regular ${opt.icon} w-5 text-center ${formData.profileVisibility === opt.value ? "text-cyan-400" : "text-white/30"}`} />
                    <div>
                      <p className={`text-sm ${formData.profileVisibility === opt.value ? "text-cyan-400" : "text-white/70"}`}>{opt.label}</p>
                      <p className="text-white/40 text-xs font-mono">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-cyan-400 flex items-center justify-center" style={{ background: "rgba(34,211,238,0.1)" }}>
              <i className="fa-duotone fa-regular fa-check text-cyan-400 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">You&apos;re All Set!</h2>
            <p className="text-white/50 font-mono text-sm max-w-md mx-auto mb-8">
              Your profile is ready. Start exploring split-fee opportunities and connect with recruiters in your network.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              {[
                { value: formData.selectedIndustries.length.toString(), label: "Industries" },
                { value: formData.selectedSpecs.length.toString(), label: "Specializations" },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-lg border border-cyan-500/20 text-center" style={{ background: BG.input }}>
                  <p className="text-2xl font-bold text-cyan-400 font-mono">{stat.value}</p>
                  <p className="text-white/40 text-xs font-mono uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <button className="px-6 py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
                <i className="fa-duotone fa-regular fa-rocket mr-2" />
                Go to Dashboard
              </button>
              <button className="px-6 py-3 rounded-lg font-mono text-sm border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                Browse Jobs
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen text-white flex items-center justify-center" style={{ background: BG.deep }}>
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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="onboard-logo text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/20" style={{ background: BG.card }}>
            <i className="fa-duotone fa-regular fa-compass-drafting text-cyan-400 text-xl" />
            <span className="font-mono text-sm text-cyan-400 tracking-wider">SPLITS NETWORK</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="onboard-progress mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                  currentStep >= step.id
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                    : "border-cyan-500/15 text-white/25"
                }`} style={currentStep < step.id ? { background: BG.input } : {}}>
                  {currentStep > step.id ? (
                    <i className="fa-duotone fa-regular fa-check text-sm" />
                  ) : (
                    <i className={`fa-duotone fa-regular ${step.icon} text-sm`} />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-12 sm:w-20 h-0.5 mx-1" style={{ background: currentStep > step.id ? "#22d3ee" : "rgba(34,211,238,0.15)" }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-white/40 uppercase tracking-wider">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </p>
            <p className="font-mono text-xs text-cyan-400">{Math.round((currentStep / STEPS.length) * 100)}%</p>
          </div>
          <div className="w-full h-1 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(currentStep / STEPS.length) * 100}%`, background: "#22d3ee" }} />
          </div>
        </div>

        {/* Step Content Card */}
        <div className="onboard-card rounded-xl border border-cyan-500/20 p-8" style={{ background: BG.card }}>
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep > 1 && currentStep < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-cyan-500/10">
              <button onClick={prevStep} className="px-4 py-2 rounded font-mono text-sm text-white/50 hover:text-white/70 transition-colors flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded font-mono text-sm text-white/40 hover:text-white/60 transition-colors">
                  Skip
                </button>
                <button onClick={nextStep} className="px-6 py-2 rounded font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
                  Continue <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 font-mono text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
