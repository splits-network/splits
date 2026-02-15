"use client";

import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── data ─── */

const specializationOptions = ["Senior Engineering", "Engineering Leadership", "Full-Stack", "Frontend", "Backend", "DevOps/SRE", "AI/ML", "Mobile", "Product Management", "Design", "Sales", "Marketing", "Executive Search"];
const regionOptions = ["West Coast", "East Coast", "Midwest", "Southeast", "Pacific Northwest", "Mountain West", "Remote-First", "International"];
const splitPrefs = ["50/50 Standard", "60/40 Favor Sourcer", "40/60 Favor Client", "Flexible / Negotiable"];

const steps = [
  { label: "Welcome", icon: "fa-power-off", tag: "// system.boot" },
  { label: "Profile", icon: "fa-user", tag: "// identity.configure" },
  { label: "Specializations", icon: "fa-radar", tag: "// skills.calibrate" },
  { label: "Preferences", icon: "fa-sliders", tag: "// params.set" },
  { label: "Complete", icon: "fa-rocket-launch", tag: "// deploy.ready" },
];

/* ─── component ─── */

export default function OnboardingShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "", company: "", title: "", location: "",
    specializations: [] as string[], regions: [] as string[], splitPref: "", bio: "",
    notifyEmail: true, notifyPush: true, profilePublic: true,
  });

  useGSAP(() => {
    if (!mainRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(".onboard-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(".onboard-content", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" });
    gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: mainRef });

  const animateStep = useCallback((dir: "next" | "back", cb: () => void) => {
    if (!stepRef.current) { cb(); return; }
    const xOut = dir === "next" ? -30 : 30;
    const xIn = dir === "next" ? 30 : -30;
    gsap.to(stepRef.current, { opacity: 0, x: xOut, duration: 0.15, ease: "power2.in", onComplete: () => { cb(); gsap.fromTo(stepRef.current, { opacity: 0, x: xIn }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }); } });
  }, []);

  const goNext = () => { if (step < 4) animateStep("next", () => setStep(s => s + 1)); };
  const goBack = () => { if (step > 0) animateStep("back", () => setStep(s => s - 1)); };

  const toggleArr = (field: "specializations" | "regions", val: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(v => v !== val) : [...prev[field], val],
    }));
  };

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content flex flex-col">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      {/* Top bar */}
      <div className="relative z-10 border-b border-base-content/5 bg-base-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20"><i className="fa-duotone fa-regular fa-split text-sm" /></div>
            <span className="font-mono text-xs font-bold tracking-wider uppercase">Splits Network</span>
          </div>
          <div className="flex items-center gap-2"><span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" /><span className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">Onboarding Active</span></div>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className={`w-9 h-9 flex items-center justify-center border font-mono text-xs transition-colors duration-300 ${
                i < step ? "bg-primary text-primary-content border-primary" : i === step ? "bg-primary/10 text-primary border-primary/40" : "bg-base-200 text-base-content/20 border-base-content/10"
              }`}>{i < step ? <i className="fa-duotone fa-regular fa-check text-xs" /> : <i className={`fa-duotone fa-regular ${s.icon} text-xs`} />}</div>
              <span className={`font-mono text-[10px] uppercase tracking-wider hidden md:inline ${i === step ? "text-primary" : i < step ? "text-base-content/40" : "text-base-content/15"}`}>{s.label}</span>
              {i < 4 && <div className={`flex-1 h-[1px] mx-2 transition-colors ${i < step ? "bg-primary/40" : "bg-base-content/10"}`} />}
            </div>
          ))}
        </div>
        <div className="w-full h-[2px] bg-base-content/5"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div ref={stepRef} className="onboard-content w-full max-w-2xl">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="onboard-scanline h-[2px] bg-primary w-48 mx-auto mb-8 origin-left" />
              <div className="w-20 h-20 flex items-center justify-center bg-primary/10 text-primary border-2 border-primary/20 mx-auto mb-6"><i className="fa-duotone fa-regular fa-terminal text-3xl" /></div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-4">// system.welcome</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Welcome, Operator</h1>
              <p className="text-base-content/50 max-w-lg mx-auto leading-relaxed mb-8">
                You are about to initialize your command center on the Splits Network. We will configure your identity, calibrate your specializations, and set your operational preferences.
              </p>
              <div className="flex gap-4 justify-center mb-8">
                {[
                  { icon: "fa-clock", label: "~3 minutes" },
                  { icon: "fa-lock", label: "Secure & private" },
                  { icon: "fa-pen-to-square", label: "Edit anytime" },
                ].map((i) => (
                  <div key={i.label} className="flex items-center gap-2 text-base-content/30">
                    <i className={`fa-duotone fa-regular ${i.icon} text-xs`} />
                    <span className="font-mono text-[10px] uppercase tracking-wider">{i.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={goNext} className="btn btn-primary btn-lg font-mono uppercase tracking-wider text-sm">
                <i className="fa-duotone fa-regular fa-power-off mr-2" /> Initialize System
              </button>
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="bg-base-200 border border-base-content/10 p-6">
              <div className="flex items-center gap-2 mb-6"><i className="fa-duotone fa-regular fa-user text-primary text-lg" /><div><h2 className="text-xl font-bold tracking-tight">Identity Configuration</h2><p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">{steps[1].tag}</p></div></div>
              <div className="space-y-4">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-20 h-20 flex items-center justify-center bg-base-300 border-2 border-dashed border-base-content/10 text-base-content/20 cursor-pointer hover:border-primary/30 transition-colors"><i className="fa-duotone fa-regular fa-camera text-xl" /></div>
                  <div><p className="text-sm font-bold mb-1">Upload Photo</p><p className="font-mono text-[10px] text-base-content/25">JPG, PNG. Max 2MB.</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="space-y-1.5"><label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Full Name <span className="text-error">*</span></label><input type="text" placeholder="Katherine Reyes" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm" /></fieldset>
                  <fieldset className="space-y-1.5"><label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Company <span className="text-error">*</span></label><input type="text" placeholder="Apex Recruiting" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm" /></fieldset>
                  <fieldset className="space-y-1.5"><label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Title</label><input type="text" placeholder="Senior Recruiter" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm" /></fieldset>
                  <fieldset className="space-y-1.5"><label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Location</label><input type="text" placeholder="San Francisco, CA" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="input input-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm" /></fieldset>
                </div>
                <fieldset className="space-y-1.5"><label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Bio</label><textarea placeholder="Brief description of your recruiting background..." value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} className="textarea textarea-sm w-full bg-base-300 border border-base-content/10 font-mono text-sm min-h-[80px]" /></fieldset>
              </div>
            </div>
          )}

          {/* Step 2: Specializations */}
          {step === 2 && (
            <div className="bg-base-200 border border-base-content/10 p-6">
              <div className="flex items-center gap-2 mb-6"><i className="fa-duotone fa-regular fa-radar text-primary text-lg" /><div><h2 className="text-xl font-bold tracking-tight">Skill Calibration</h2><p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">{steps[2].tag}</p></div></div>
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-base-content/40 mb-3">Recruiting Specializations</p>
                  <p className="text-xs text-base-content/30 mb-3">Select all areas you recruit for</p>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map(s => (
                      <button key={s} onClick={() => toggleArr("specializations", s)} className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                        formData.specializations.includes(s) ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-300 border-base-content/10 text-base-content/30 hover:border-base-content/20"
                      }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-base-content/40 mb-3">Coverage Regions</p>
                  <div className="flex flex-wrap gap-2">
                    {regionOptions.map(r => (
                      <button key={r} onClick={() => toggleArr("regions", r)} className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                        formData.regions.includes(r) ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-300 border-base-content/10 text-base-content/30 hover:border-base-content/20"
                      }`}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="bg-base-200 border border-base-content/10 p-6">
              <div className="flex items-center gap-2 mb-6"><i className="fa-duotone fa-regular fa-sliders text-primary text-lg" /><div><h2 className="text-xl font-bold tracking-tight">Operational Parameters</h2><p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">{steps[3].tag}</p></div></div>
              <div className="space-y-5">
                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Default Split-Fee Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    {splitPrefs.map(sp => (
                      <label key={sp} className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border transition-colors font-mono text-xs ${
                        formData.splitPref === sp ? "bg-primary/10 border-primary/30 text-primary" : "bg-base-300 border-base-content/10 text-base-content/40"
                      }`}><input type="radio" name="split" value={sp} checked={formData.splitPref === sp} onChange={() => setFormData(p => ({ ...p, splitPref: sp }))} className="hidden" />{sp}</label>
                    ))}
                  </div>
                </fieldset>
                <div className="space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Notification Channels</p>
                  <label className="flex items-center justify-between p-3 bg-base-300 border border-base-content/5 cursor-pointer">
                    <div><p className="text-sm">Email Notifications</p><p className="text-xs text-base-content/25">Receive updates via email</p></div>
                    <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={formData.notifyEmail} onChange={() => setFormData(p => ({ ...p, notifyEmail: !p.notifyEmail }))} />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-base-300 border border-base-content/5 cursor-pointer">
                    <div><p className="text-sm">Push Notifications</p><p className="text-xs text-base-content/25">Browser and mobile alerts</p></div>
                    <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={formData.notifyPush} onChange={() => setFormData(p => ({ ...p, notifyPush: !p.notifyPush }))} />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-base-300 border border-base-content/5 cursor-pointer">
                    <div><p className="text-sm">Public Profile</p><p className="text-xs text-base-content/25">Visible to the network</p></div>
                    <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={formData.profilePublic} onChange={() => setFormData(p => ({ ...p, profilePublic: !p.profilePublic }))} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-24 h-24 flex items-center justify-center bg-success/10 text-success border-2 border-success/20 mx-auto mb-6"><i className="fa-duotone fa-regular fa-check text-4xl" /></div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-success mb-4">// deployment.complete</p>
              <h1 className="text-4xl font-black tracking-tight mb-4">System Initialized</h1>
              <p className="text-base-content/50 max-w-lg mx-auto leading-relaxed mb-8">
                Your command center is fully operational. The network is scanning for matching job orders and potential split-fee partners based on your configured specializations.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="p-4 bg-base-200 border border-base-content/5 text-center"><p className="font-mono text-xl font-black text-primary">{formData.specializations.length}</p><p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">Specializations</p></div>
                <div className="p-4 bg-base-200 border border-base-content/5 text-center"><p className="font-mono text-xl font-black text-primary">{formData.regions.length}</p><p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">Regions</p></div>
                <div className="p-4 bg-base-200 border border-base-content/5 text-center"><p className="font-mono text-xl font-black text-success">100%</p><p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">Ready</p></div>
              </div>
              <div className="flex gap-3 justify-center">
                <button className="btn btn-primary font-mono uppercase tracking-wider text-xs"><i className="fa-duotone fa-regular fa-grid-2 mr-2" /> Go to Dashboard</button>
                <button className="btn btn-outline font-mono uppercase tracking-wider text-xs"><i className="fa-duotone fa-regular fa-plus mr-2" /> Deploy First Job</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      {step > 0 && step < 4 && (
        <div className="relative z-10 border-t border-base-content/10 bg-base-200">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base-content/20"><span className="font-mono text-[10px] uppercase tracking-wider">Phase {step + 1} of 5</span></div>
            <div className="flex gap-3">
              <button onClick={goBack} className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs"><i className="fa-duotone fa-regular fa-arrow-left mr-1" /> Back</button>
              <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs text-base-content/25">Skip</button>
              <button onClick={goNext} className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-xs">Next <i className="fa-duotone fa-regular fa-arrow-right ml-1" /></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
