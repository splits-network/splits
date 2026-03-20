"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";
import { WizardHelpZone } from "@splits-network/basel-ui";
import type { FormData } from "./types";

interface StepDescriptionsProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
}

export function StepDescriptions({ formData, onChange }: StepDescriptionsProps) {
    return (
        <div className="space-y-5">
            <div role="alert" className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info" />
                <span className="text-sm">
                    Two descriptions for different audiences. Recruiter-facing
                    notes stay internal. Candidate-facing description is public.
                </span>
            </div>

            <WizardHelpZone
                title="Recruiter Brief"
                description="Internal notes visible only to recruiters working this role. Share context they won't find in the public listing."
                tips={["Include hiring manager pain points and urgency level", "Describe the ideal candidate beyond the job spec", "Mention deal-breakers or non-negotiables", "Recruiters with better briefs submit stronger candidates"]}
            >
                <fieldset className="border-l-4 border-warning pl-4">
                    <label className="block font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-lock text-warning" />
                        Recruiter Brief
                    </label>
                    <MarkdownEditor
                        value={formData.recruiter_description}
                        onChange={(value) => onChange({ recruiter_description: value })}
                        placeholder="Internal notes for recruiters: pain points, urgency, ideal candidate profile..."
                        helperText="Internal only. Visible to recruiters working this role."
                        height={160}
                    />
                </fieldset>
            </WizardHelpZone>

            <WizardHelpZone
                title="Candidate Description"
                description="The public job description shown to candidates on the job listing. This is what sells the role."
                tips={["Lead with what makes the role exciting", "Include team size, tech stack, and growth opportunities", "Keep it concise — candidates skim long descriptions", "Markdown formatting is supported"]}
            >
                <fieldset className="border-l-4 border-success pl-4">
                    <label className="block font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-globe text-success" />
                        Candidate-Facing Description
                    </label>
                    <MarkdownEditor
                        value={formData.candidate_description}
                        onChange={(value) => onChange({ candidate_description: value })}
                        placeholder="Public job description: responsibilities, team info, company culture..."
                        helperText="Public. Shown to candidates on the job listing."
                        height={160}
                    />
                </fieldset>
            </WizardHelpZone>
        </div>
    );
}
