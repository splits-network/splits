"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";
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

            <fieldset>
                <label className="block font-bold text-sm uppercase tracking-wider mb-2">
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

            <fieldset>
                <label className="block font-bold text-sm uppercase tracking-wider mb-2">
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
        </div>
    );
}
