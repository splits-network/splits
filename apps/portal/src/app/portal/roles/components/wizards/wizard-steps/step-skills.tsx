"use client";

import { BaselSkillPicker, type SkillOption } from "@splits-network/basel-ui";

interface StepSkillsProps {
    requiredSkills: SkillOption[];
    preferredSkills: SkillOption[];
    onRequiredChange: (skills: SkillOption[]) => void;
    onPreferredChange: (skills: SkillOption[]) => void;
    searchFn: (query: string) => Promise<SkillOption[]>;
    createFn: (name: string) => Promise<SkillOption>;
}

export function StepSkills({
    requiredSkills,
    preferredSkills,
    onRequiredChange,
    onPreferredChange,
    searchFn,
    createFn,
}: StepSkillsProps) {
    return (
        <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4">
                <h4 className="text-sm font-bold text-base-content mb-1 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-shield-check text-primary" />
                    Required Skills
                </h4>
                <p className="text-sm text-base-content/50 mb-4">
                    Skills the candidate must have for this role.
                </p>
                <BaselSkillPicker
                    selectedSkills={requiredSkills}
                    onSkillsChange={onRequiredChange}
                    searchFn={searchFn}
                    createFn={createFn}
                    placeholder="Search for required skills..."
                    maxSkills={20}
                />
            </div>

            <div className="divider" />

            <div className="border-l-4 border-secondary pl-4">
                <h4 className="text-sm font-bold text-base-content mb-1 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-star text-secondary" />
                    Nice-to-Have Skills
                </h4>
                <p className="text-sm text-base-content/50 mb-4">
                    Skills that are preferred but not required.
                </p>
                <BaselSkillPicker
                    selectedSkills={preferredSkills}
                    onSkillsChange={onPreferredChange}
                    searchFn={searchFn}
                    createFn={createFn}
                    placeholder="Search for preferred skills..."
                    maxSkills={20}
                    dropUp
                />
            </div>
        </div>
    );
}
