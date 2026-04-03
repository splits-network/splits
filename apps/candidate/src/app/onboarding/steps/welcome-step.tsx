"use client";

/**
 * Step 1: Welcome + Smart Resume Introduction
 * Greets by name, explains the Smart Resume concept and value.
 */

import { useUser } from "@clerk/nextjs";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

interface WelcomeStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

const VALUE_PROPS = [
    {
        icon: "fa-duotone fa-regular fa-file-user",
        color: "text-primary",
        title: "One profile, every application",
        description:
            "Build your career profile once. Our AI tailors it for each role you apply to — no more rewriting resumes.",
    },
    {
        icon: "fa-duotone fa-regular fa-brain-circuit",
        color: "text-secondary",
        title: "AI-powered fit analysis",
        description:
            "Before your application reaches the hiring team, get an instant analysis of how well you match the role.",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        color: "text-accent",
        title: "Multiple recruiters, one network",
        description:
            "Recruiters across the network compete to place you. You stay informed at every stage.",
    },
];

export function WelcomeStep({ state, actions }: WelcomeStepProps) {
    const { user } = useUser();
    const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "";

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Welcome
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                {firstName ? `Hey ${firstName}, let's get you set up` : "Let's get you set up"}
            </h1>
            <p className="text-base-content/50 mb-8">
                We do things a little differently here. Instead of uploading a
                new resume for every job, you build one Smart Resume that works
                across the entire network.
            </p>

            {/* Value props */}
            <div className="space-y-4 mb-8">
                {VALUE_PROPS.map((prop) => (
                    <div
                        key={prop.title}
                        className="flex items-start gap-4 p-4 bg-base-200 border border-base-300"
                    >
                        <i className={`${prop.icon} ${prop.color} text-xl mt-0.5`} />
                        <div>
                            <p className="font-bold text-sm">{prop.title}</p>
                            <p className="text-xs text-base-content/50 mt-0.5 leading-relaxed">
                                {prop.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="border-l-4 border-primary bg-primary/5 p-5 mb-6">
                <h3 className="text-sm font-bold mb-2">
                    How it works
                </h3>
                <p className="text-xs text-base-content/50 leading-relaxed">
                    Upload an existing resume and our AI extracts your
                    experiences, skills, education, and certifications into a
                    structured profile. You can review and refine it anytime.
                    Don't have a resume handy? No problem — skip it and build
                    your profile manually later.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-end pt-6 border-t border-base-300">
                <button
                    className="btn btn-primary"
                    onClick={() => actions.setStep(2)}
                >
                    Get Started
                    <i className="fa-solid fa-arrow-right text-xs" />
                </button>
            </div>
        </div>
    );
}
