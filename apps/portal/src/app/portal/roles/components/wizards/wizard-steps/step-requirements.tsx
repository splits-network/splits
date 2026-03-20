"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";
import type { FormData } from "./types";

interface StepRequirementsProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
}

export function StepRequirements({ formData, onChange }: StepRequirementsProps) {
    const addMandatory = () =>
        onChange({ mandatory_requirements: [...formData.mandatory_requirements, ""] });
    const addPreferred = () =>
        onChange({ preferred_requirements: [...formData.preferred_requirements, ""] });
    const updateMandatory = (index: number, value: string) =>
        onChange({ mandatory_requirements: formData.mandatory_requirements.map((r, i) => (i === index ? value : r)) });
    const updatePreferred = (index: number, value: string) =>
        onChange({ preferred_requirements: formData.preferred_requirements.map((r, i) => (i === index ? value : r)) });
    const removeMandatory = (index: number) =>
        onChange({ mandatory_requirements: formData.mandatory_requirements.filter((_, i) => i !== index) });
    const removePreferred = (index: number) =>
        onChange({ preferred_requirements: formData.preferred_requirements.filter((_, i) => i !== index) });

    return (
        <div className="space-y-6">
            <div role="alert" className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info" />
                <span className="text-sm">
                    Requirements appear on the job listing. Candidates are
                    matched based on mandatory criteria.
                </span>
            </div>

            {/* Mandatory */}
            <WizardHelpZone
                title="Mandatory Requirements"
                description="Must-have qualifications that candidates need to be considered. These are used for matching and filtering."
                tips={["Be specific — '5+ years React' beats 'experienced developer'", "Too many mandatory requirements reduces the candidate pool", "Focus on truly non-negotiable qualifications"]}
            >
                <div className="border-l-4 border-primary pl-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-shield-check text-primary" />
                                Mandatory Requirements
                            </h4>
                            <span className="text-sm text-base-content/50 font-semibold">
                                Must-have qualifications
                            </span>
                        </div>
                        <button type="button" className="btn btn-primary btn-sm" onClick={addMandatory}>
                            <i className="fa-duotone fa-regular fa-plus mr-1" />
                            Add
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.mandatory_requirements.length === 0 ? (
                            <p className="text-base-content/40 text-sm font-semibold py-6 text-center border-2 border-dashed border-primary/20 bg-primary/5">
                                No requirements added. Use Add to create must-have criteria.
                            </p>
                        ) : (
                            formData.mandatory_requirements.map((req, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        className="input flex-1"
                                        value={req}
                                        onChange={(e) => updateMandatory(idx, e.target.value)}
                                        placeholder="e.g., 5+ years of React experience"
                                    />
                                    <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => removeMandatory(idx)}>
                                        <i className="fa-duotone fa-regular fa-trash" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </WizardHelpZone>

            {/* Preferred */}
            <WizardHelpZone
                title="Preferred Requirements"
                description="Nice-to-have qualifications that strengthen a candidate's application but aren't required."
                tips={["Use these for 'bonus' skills or experience", "Helps recruiters prioritize among qualified candidates"]}
            >
                <div className="border-l-4 border-secondary pl-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-star text-secondary" />
                                Preferred Requirements
                            </h4>
                            <span className="text-sm text-base-content/50 font-semibold">
                                Nice-to-have qualifications
                            </span>
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addPreferred}>
                            <i className="fa-duotone fa-regular fa-plus mr-1" />
                            Add
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.preferred_requirements.length === 0 ? (
                            <p className="text-base-content/40 text-sm font-semibold py-6 text-center border-2 border-dashed border-secondary/20 bg-secondary/5">
                                No preferred requirements. Use Add to list nice-to-have qualifications.
                            </p>
                        ) : (
                            formData.preferred_requirements.map((req, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        className="input flex-1"
                                        value={req}
                                        onChange={(e) => updatePreferred(idx, e.target.value)}
                                        placeholder="e.g., Experience with GraphQL"
                                    />
                                    <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => removePreferred(idx)}>
                                        <i className="fa-duotone fa-regular fa-trash" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </WizardHelpZone>
        </div>
    );
}
