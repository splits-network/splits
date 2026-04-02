"use client";

import Link from "next/link";

interface StepGetStartedProps {
    jobTitle: string;
    companyName: string;
    hasQuestions: boolean;
}

const STEPS = [
    {
        icon: "fa-duotone fa-regular fa-folder-open",
        label: "Supporting Documents",
        description: "Attach portfolios, certifications, or other files",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope-open-text",
        label: "Cover Letter",
        description: "Add an optional cover letter",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-question",
        label: "Screening Questions",
        description: "Answer questions from the hiring team",
        conditional: true,
    },
    {
        icon: "fa-duotone fa-regular fa-message-lines",
        label: "Notes",
        description: "Share additional context with the employer",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-check",
        label: "Review & AI Analysis",
        description: "Review your application and get an AI fit analysis",
    },
];

export default function StepGetStarted({
    jobTitle,
    companyName,
    hasQuestions,
}: StepGetStartedProps) {
    const visibleSteps = STEPS.filter(
        (s) => !s.conditional || (s.conditional && hasQuestions),
    );

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
                    Applying to
                </p>
                <h3 className="text-xl font-black tracking-tight mb-1">
                    {jobTitle}
                </h3>
                <p className="text-sm text-base-content/50">
                    {companyName}
                </p>
            </div>

            {/* Smart Resume callout */}
            <div className="bg-primary/5 border-l-4 border-primary p-4">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-file-user text-primary text-lg mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">
                            Your Smart Resume is automatically tailored
                        </p>
                        <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                            We generate a version of your Smart Resume specifically
                            optimized for this role. No need to upload or select a resume —
                            it's handled for you.
                        </p>
                        <Link
                            href="/portal/smart-resume"
                            target="_blank"
                            className="text-xs text-primary font-semibold mt-2 inline-flex items-center gap-1 hover:underline"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-[10px]" />
                            Review your Smart Resume
                        </Link>
                    </div>
                </div>
            </div>

            {/* Steps overview */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Here's what to expect
                </p>
                <div className="space-y-0">
                    {visibleSteps.map((step, i) => (
                        <div
                            key={step.label}
                            className="flex items-center gap-4 p-3 border-l-2 border-base-300"
                        >
                            <div className="w-7 h-7 bg-base-200 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-base-content/40">
                                    {i + 1}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold">{step.label}</p>
                                <p className="text-xs text-base-content/50">
                                    {step.description}
                                </p>
                            </div>
                            <i className={`${step.icon} text-base-content/20`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* AI review callout */}
            <div className="bg-secondary/5 border-l-4 border-secondary p-4">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-brain-circuit text-secondary text-lg mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">
                            AI-powered fit analysis
                        </p>
                        <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                            Before your application reaches the hiring team, our AI
                            analyzes your fit for the role. You'll see the results and
                            decide whether to submit — no surprises.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
