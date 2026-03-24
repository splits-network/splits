"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";

interface RecruiterOption {
    id: string;
    recruiter_id: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_bio?: string;
}

interface StepRecruiterProps {
    recruiters: RecruiterOption[];
    selectedRecruiterId: string | null;
    onChange: (recruiterId: string) => void;
}

export default function StepRecruiter({
    recruiters,
    selectedRecruiterId,
    onChange,
}: StepRecruiterProps) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Choose Your Representative
                </p>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Select a recruiter
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    You have multiple active recruiters. Choose who should
                    represent you for this application.
                </p>
            </div>

            <WizardHelpZone
                title="Your Recruiter"
                description="Choose which recruiter will represent you for this application. They'll advocate on your behalf with the hiring team."
                icon="fa-duotone fa-regular fa-user-tie"
                tips={[
                    "Pick the recruiter who knows your strengths best for this type of role",
                    "Your recruiter will be notified when you submit this application",
                    "They may reach out to discuss strategy before forwarding your application",
                ]}
            >
            <div className="space-y-3">
                {recruiters.map((recruiter) => {
                    const isSelected =
                        selectedRecruiterId === recruiter.recruiter_id;
                    return (
                        <button
                            key={recruiter.recruiter_id}
                            type="button"
                            className={`w-full text-left p-4 border transition-colors ${
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-base-300 bg-base-100 hover:border-base-content/20"
                            }`}
                            onClick={() => onChange(recruiter.recruiter_id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="avatar avatar-placeholder flex-shrink-0">
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center ${
                                            isSelected
                                                ? "bg-primary text-primary-content"
                                                : "bg-base-300 text-base-content/60"
                                        }`}
                                    >
                                        <span className="text-sm font-bold">
                                            {(recruiter.recruiter_name || "?")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm">
                                        {recruiter.recruiter_name}
                                    </p>
                                    <p className="text-sm text-base-content/50 truncate">
                                        {recruiter.recruiter_email}
                                    </p>
                                    {recruiter.recruiter_bio && (
                                        <p className="text-sm text-base-content/40 mt-1 line-clamp-1">
                                            {recruiter.recruiter_bio}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <i className="fa-duotone fa-regular fa-circle-check text-primary text-lg flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            </WizardHelpZone>

        </div>
    );
}
