"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

/* ─── types ─── */

interface JobFormData {
  title: string;
  company: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  type: string;
  description: string;
  requirements: string;
}

interface WizardFormData {
  // Step 1
  title: string;
  company: string;
  location: string;
  type: string;
  // Step 2
  experienceLevel: string;
  skills: string;
  description: string;
  // Step 3
  salaryMin: string;
  salaryMax: string;
  equity: string;
  benefits: string;
}

const emptyJobForm: JobFormData = {
  title: "",
  company: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  type: "full-time",
  description: "",
  requirements: "",
};

const emptyWizardForm: WizardFormData = {
  title: "",
  company: "",
  location: "",
  type: "full-time",
  experienceLevel: "mid",
  skills: "",
  description: "",
  salaryMin: "",
  salaryMax: "",
  equity: "",
  benefits: "",
};

const jobTypes = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const experienceLevels = [
  { value: "junior", label: "Junior (0-2 yrs)" },
  { value: "mid", label: "Mid-Level (3-5 yrs)" },
  { value: "senior", label: "Senior (6-9 yrs)" },
  { value: "lead", label: "Lead (10+ yrs)" },
];

/* ─── animations ─── */

function animateModalIn(
  backdropEl: HTMLElement | null,
  boxEl: HTMLElement | null,
  onComplete?: () => void
) {
  if (!backdropEl || !boxEl) return;
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete,
  });
  tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.25 }).fromTo(
    boxEl,
    { opacity: 0, y: 40, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35 },
    "-=0.1"
  );
}

function animateModalOut(
  backdropEl: HTMLElement | null,
  boxEl: HTMLElement | null,
  onComplete?: () => void
) {
  if (!backdropEl || !boxEl) {
    onComplete?.();
    return;
  }
  const tl = gsap.timeline({
    defaults: { ease: "power2.in" },
    onComplete,
  });
  tl.to(boxEl, { opacity: 0, y: 30, scale: 0.97, duration: 0.2 }).to(
    backdropEl,
    { opacity: 0, duration: 0.2 },
    "-=0.1"
  );
}

/* ─── reusable field component ─── */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-1.5">
      <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">
        {label}
      </label>
      {children}
    </fieldset>
  );
}

/* ─── Standard Modal ─── */

function CreateJobModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<JobFormData>(emptyJobForm);
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setForm(emptyJobForm);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (visible) {
      animateModalIn(backdropRef.current, boxRef.current);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    animateModalOut(backdropRef.current, boxRef.current, () => {
      setVisible(false);
      onClose();
    });
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.company.trim()) newErrors.company = "Company is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      handleClose();
    }, 1200);
  };

  const update = (field: keyof JobFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={boxRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-base-200 border border-base-content/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <i className="fa-duotone fa-regular fa-file-plus text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Create Job Listing
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                // new_position.create
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <i className="fa-duotone fa-regular fa-xmark text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Job Title">
              <input
                type="text"
                className={`input input-sm w-full bg-base-300 border font-mono text-sm ${
                  errors.title
                    ? "border-error"
                    : "border-base-content/10 focus:border-primary/40"
                }`}
                placeholder="Senior Software Engineer"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
              {errors.title && (
                <p className="text-error text-[11px] font-mono mt-0.5">
                  {errors.title}
                </p>
              )}
            </Field>

            <Field label="Company">
              <input
                type="text"
                className={`input input-sm w-full bg-base-300 border font-mono text-sm ${
                  errors.company
                    ? "border-error"
                    : "border-base-content/10 focus:border-primary/40"
                }`}
                placeholder="Acme Corp"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              />
              {errors.company && (
                <p className="text-error text-[11px] font-mono mt-0.5">
                  {errors.company}
                </p>
              )}
            </Field>

            <Field label="Location">
              <input
                type="text"
                className={`input input-sm w-full bg-base-300 border font-mono text-sm ${
                  errors.location
                    ? "border-error"
                    : "border-base-content/10 focus:border-primary/40"
                }`}
                placeholder="San Francisco, CA"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
              {errors.location && (
                <p className="text-error text-[11px] font-mono mt-0.5">
                  {errors.location}
                </p>
              )}
            </Field>

            <Field label="Job Type">
              <select
                className="select select-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {jobTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Salary Min ($)">
              <input
                type="text"
                className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                placeholder="80,000"
                value={form.salaryMin}
                onChange={(e) => update("salaryMin", e.target.value)}
              />
            </Field>
            <Field label="Salary Max ($)">
              <input
                type="text"
                className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                placeholder="120,000"
                value={form.salaryMax}
                onChange={(e) => update("salaryMax", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={`textarea textarea-sm w-full bg-base-300 border font-mono text-sm min-h-[80px] ${
                errors.description
                  ? "border-error"
                  : "border-base-content/10 focus:border-primary/40"
              }`}
              placeholder="Describe the role, responsibilities, and team..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-error text-[11px] font-mono mt-0.5">
                {errors.description}
              </p>
            )}
          </Field>

          <Field label="Requirements">
            <textarea
              className="textarea textarea-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm min-h-[80px]"
              placeholder="List key qualifications, one per line..."
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-base-content/10">
          <div className="flex items-center gap-2 text-base-content/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Form Ready
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-xs"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Deploying...
                </>
              ) : (
                <>
                  <i className="fa-duotone fa-regular fa-check mr-1" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Wizard Modal ─── */

function WizardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<WizardFormData>(emptyWizardForm);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 4;
  const stepLabels = ["Job Details", "Requirements", "Compensation", "Review"];
  const stepIcons = ["fa-briefcase", "fa-list-check", "fa-money-bill-wave", "fa-rocket-launch"];

  useEffect(() => {
    if (open) {
      setVisible(true);
      setForm(emptyWizardForm);
      setStep(0);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (visible) {
      animateModalIn(backdropRef.current, boxRef.current);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    animateModalOut(backdropRef.current, boxRef.current, () => {
      setVisible(false);
      onClose();
    });
  }, [onClose]);

  const animateStepTransition = (direction: "next" | "back", cb: () => void) => {
    if (!stepContentRef.current) {
      cb();
      return;
    }
    const xOut = direction === "next" ? -30 : 30;
    const xIn = direction === "next" ? 30 : -30;
    gsap.to(stepContentRef.current, {
      opacity: 0,
      x: xOut,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        cb();
        gsap.fromTo(
          stepContentRef.current,
          { opacity: 0, x: xIn },
          { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }
        );
      },
    });
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      animateStepTransition("next", () => setStep((s) => s + 1));
    }
  };

  const goBack = () => {
    if (step > 0) {
      animateStepTransition("back", () => setStep((s) => s - 1));
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      handleClose();
    }, 1500);
  };

  const update = (field: keyof WizardFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={boxRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-base-200 border border-base-content/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Post a Job
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                // wizard.deploy_sequence
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <i className="fa-duotone fa-regular fa-xmark text-lg" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between mb-3">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center border text-xs font-mono transition-colors duration-300 ${
                    i < step
                      ? "bg-primary text-primary-content border-primary"
                      : i === step
                      ? "bg-primary/10 text-primary border-primary/40"
                      : "bg-base-300 text-base-content/20 border-base-content/10"
                  }`}
                >
                  {i < step ? (
                    <i className="fa-duotone fa-regular fa-check text-xs" />
                  ) : (
                    <i className={`fa-duotone fa-regular ${stepIcons[i]} text-xs`} />
                  )}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider hidden sm:inline ${
                    i === step
                      ? "text-primary"
                      : i < step
                      ? "text-base-content/40"
                      : "text-base-content/20"
                  }`}
                >
                  {label}
                </span>
                {i < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-[1px] mx-2 transition-colors duration-300 ${
                      i < step ? "bg-primary/40" : "bg-base-content/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full h-[2px] bg-base-content/5">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div ref={stepContentRef} className="p-6 min-h-[280px]">
          {step === 0 && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-base-content/30 uppercase tracking-wider mb-4">
                Phase 01 // Job Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Job Title">
                  <input
                    type="text"
                    className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    placeholder="Senior Software Engineer"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </Field>
                <Field label="Company">
                  <input
                    type="text"
                    className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    placeholder="San Francisco, CA"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                  />
                </Field>
                <Field label="Job Type">
                  <select
                    className="select select-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                  >
                    {jobTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-base-content/30 uppercase tracking-wider mb-4">
                Phase 02 // Requirements
              </p>
              <Field label="Experience Level">
                <select
                  className="select select-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                  value={form.experienceLevel}
                  onChange={(e) => update("experienceLevel", e.target.value)}
                >
                  {experienceLevels.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Skills">
                <input
                  type="text"
                  className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                  placeholder="React, TypeScript, Node.js, PostgreSQL"
                  value={form.skills}
                  onChange={(e) => update("skills", e.target.value)}
                />
              </Field>
              <Field label="Role Description">
                <textarea
                  className="textarea textarea-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm min-h-[100px]"
                  placeholder="Describe responsibilities and day-to-day tasks..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-base-content/30 uppercase tracking-wider mb-4">
                Phase 03 // Compensation
              </p>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Salary Min ($)">
                  <input
                    type="text"
                    className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    placeholder="100,000"
                    value={form.salaryMin}
                    onChange={(e) => update("salaryMin", e.target.value)}
                  />
                </Field>
                <Field label="Salary Max ($)">
                  <input
                    type="text"
                    className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                    placeholder="150,000"
                    value={form.salaryMax}
                    onChange={(e) => update("salaryMax", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Equity Package">
                <input
                  type="text"
                  className="input input-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm"
                  placeholder="0.05% - 0.15% ISOs"
                  value={form.equity}
                  onChange={(e) => update("equity", e.target.value)}
                />
              </Field>
              <Field label="Benefits">
                <textarea
                  className="textarea textarea-sm w-full bg-base-300 border border-base-content/10 focus:border-primary/40 font-mono text-sm min-h-[80px]"
                  placeholder="Health insurance, 401k match, remote work, unlimited PTO..."
                  value={form.benefits}
                  onChange={(e) => update("benefits", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-base-content/30 uppercase tracking-wider mb-4">
                Phase 04 // Review &amp; Deploy
              </p>

              <div className="space-y-4">
                {/* Job Details Review */}
                <div className="p-4 bg-base-300 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-duotone fa-regular fa-briefcase text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Job Details
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Title
                      </span>
                      <p className="text-base-content/70">
                        {form.title || "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Company
                      </span>
                      <p className="text-base-content/70">
                        {form.company || "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Location
                      </span>
                      <p className="text-base-content/70">
                        {form.location || "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Type
                      </span>
                      <p className="text-base-content/70">
                        {jobTypes.find((t) => t.value === form.type)?.label || "---"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements Review */}
                <div className="p-4 bg-base-300 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-duotone fa-regular fa-list-check text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Requirements
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Experience
                      </span>
                      <p className="text-base-content/70">
                        {experienceLevels.find(
                          (l) => l.value === form.experienceLevel
                        )?.label || "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Skills
                      </span>
                      <p className="text-base-content/70">
                        {form.skills || "---"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compensation Review */}
                <div className="p-4 bg-base-300 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-duotone fa-regular fa-money-bill-wave text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Compensation
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Salary Range
                      </span>
                      <p className="text-base-content/70">
                        {form.salaryMin && form.salaryMax
                          ? `$${form.salaryMin} - $${form.salaryMax}`
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/30 font-mono text-[10px] uppercase">
                        Equity
                      </span>
                      <p className="text-base-content/70">
                        {form.equity || "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-base-content/10">
          <div className="flex items-center gap-2 text-base-content/20">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <div className="flex gap-3">
            {step === 0 ? (
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={goBack}
                className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs"
              >
                <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                Back
              </button>
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={goNext}
                className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-xs"
              >
                Next
                <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-xs"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <i className="fa-duotone fa-regular fa-rocket-launch mr-1" />
                    Deploy Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirmation Modal ─── */

function DeleteConfirmModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDeleting(false);
    }
  }, [open]);

  useEffect(() => {
    if (visible) {
      animateModalIn(backdropRef.current, boxRef.current);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    animateModalOut(backdropRef.current, boxRef.current, () => {
      setVisible(false);
      onClose();
    });
  }, [onClose]);

  const handleConfirm = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      handleClose();
    }, 1000);
  };

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={boxRef}
        className="w-full max-w-md bg-base-200 border border-base-content/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-error/10 text-error border border-error/20">
              <i className="fa-duotone fa-regular fa-triangle-exclamation text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Delete Job</h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                // destructive.action
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <i className="fa-duotone fa-regular fa-xmark text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="p-4 bg-error/5 border border-error/10 mb-5">
            <div className="flex gap-3">
              <i className="fa-duotone fa-regular fa-radiation text-error mt-0.5" />
              <div>
                <p className="text-sm font-bold text-error mb-1">
                  Warning: Irreversible Operation
                </p>
                <p className="text-sm text-base-content/50 leading-relaxed">
                  You are about to permanently delete the job listing{" "}
                  <span className="font-mono text-base-content/70">
                    &quot;Senior Software Engineer&quot;
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-base-content/40">
            <div className="flex items-center gap-2">
              <i className="fa-duotone fa-regular fa-xmark text-error text-xs" />
              <span>All candidate applications will be removed</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-duotone fa-regular fa-xmark text-error text-xs" />
              <span>Split-fee assignments will be cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-duotone fa-regular fa-xmark text-error text-xs" />
              <span>Network visibility will be terminated</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-base-content/10">
          <div className="flex items-center gap-2 text-error/40">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Awaiting Confirmation
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-xs"
            >
              Abort
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="btn btn-error btn-sm font-mono uppercase tracking-wider text-xs"
            >
              {deleting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Terminating...
                </>
              ) : (
                <>
                  <i className="fa-duotone fa-regular fa-trash mr-1" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page Component ─── */

export default function ModalsShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !mainRef.current) return;

    const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
    heroTl
      .fromTo(
        ".page-scanline",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6 }
      )
      .fromTo(
        ".page-title span",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        "-=0.2"
      )
      .fromTo(
        ".page-subtitle",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.1"
      )
      .fromTo(
        ".trigger-card",
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: "power3.out",
        },
        "-=0.2"
      );

    gsap.fromTo(
      ".status-dot-page",
      { scale: 0.6, opacity: 0.4 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
        ease: "sine.inOut",
      }
    );
  }, []);

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
    >
      {/* Background grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner decorations */}
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-24">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="page-scanline h-[2px] bg-primary w-48 mx-auto mb-10 origin-left" />

          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-6 opacity-80">
            sys.ui &gt; modal_components v2.0
          </p>

          <h1 className="page-title text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-8">
            <span className="block">Modal</span>
            <span className="block text-primary">Systems</span>
            <span className="block text-base-content/60 text-2xl md:text-3xl mt-2 font-light tracking-wide">
              Interactive Overlays
            </span>
          </h1>

          <p className="page-subtitle max-w-2xl mx-auto text-lg text-base-content/50 font-light leading-relaxed">
            Three distinct modal patterns for mission-critical operations.
            Standard forms, guided wizards, and destructive confirmations.
          </p>
        </div>
      </section>

      {/* Trigger Cards */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
              // modal.triggers
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Select Operation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Create Job */}
            <div className="trigger-card group relative p-8 bg-base-200 border border-base-content/5 hover:border-primary/30 transition-colors duration-300">
              <span className="absolute top-4 right-4 font-mono text-xs text-base-content/20">
                01
              </span>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                  <i className="fa-duotone fa-regular fa-file-plus text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Standard Modal
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="status-dot-page w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                      ready
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-base-content/50 leading-relaxed mb-6">
                A complete job creation form with field validation, type
                selection, and salary range configuration. Standard single-view
                modal pattern.
              </p>

              <div className="pt-4 border-t border-base-content/5">
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn btn-primary btn-sm w-full font-mono uppercase tracking-wider text-xs"
                >
                  <i className="fa-duotone fa-regular fa-plus mr-2" />
                  Create Job Listing
                </button>
              </div>
            </div>

            {/* Card 2: Wizard */}
            <div className="trigger-card group relative p-8 bg-base-200 border border-base-content/5 hover:border-primary/30 transition-colors duration-300">
              <span className="absolute top-4 right-4 font-mono text-xs text-base-content/20">
                02
              </span>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                  <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Wizard Modal
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="status-dot-page w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                      ready
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-base-content/50 leading-relaxed mb-6">
                A four-phase guided deployment sequence. Collects job details,
                requirements, and compensation with a final review before
                submission.
              </p>

              <div className="pt-4 border-t border-base-content/5">
                <button
                  onClick={() => setShowWizard(true)}
                  className="btn btn-primary btn-sm w-full font-mono uppercase tracking-wider text-xs"
                >
                  <i className="fa-duotone fa-regular fa-play mr-2" />
                  Post a Job (Wizard)
                </button>
              </div>
            </div>

            {/* Card 3: Delete Confirmation */}
            <div className="trigger-card group relative p-8 bg-base-200 border border-base-content/5 hover:border-error/30 transition-colors duration-300">
              <span className="absolute top-4 right-4 font-mono text-xs text-base-content/20">
                03
              </span>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-error/10 text-error border border-error/20">
                  <i className="fa-duotone fa-regular fa-triangle-exclamation text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Confirmation Dialog
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="status-dot-page w-1.5 h-1.5 rounded-full bg-warning" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-warning">
                      caution
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-base-content/50 leading-relaxed mb-6">
                A destructive action confirmation dialog with detailed impact
                warnings and explicit user acknowledgment before proceeding.
              </p>

              <div className="pt-4 border-t border-base-content/5">
                <button
                  onClick={() => setShowDelete(true)}
                  className="btn btn-error btn-sm w-full font-mono uppercase tracking-wider text-xs"
                >
                  <i className="fa-duotone fa-regular fa-trash mr-2" />
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Status */}
      <section className="py-12 px-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              All Modal Systems Operational
            </span>
          </div>
          <span className="text-base-content/10">|</span>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Splits Network // Component Showcase
          </span>
        </div>
      </section>

      {/* Modals */}
      <CreateJobModal open={showCreate} onClose={() => setShowCreate(false)} />
      <WizardModal open={showWizard} onClose={() => setShowWizard(false)} />
      <DeleteConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
      />
    </main>
  );
}
