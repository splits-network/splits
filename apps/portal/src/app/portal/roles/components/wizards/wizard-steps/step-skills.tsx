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
            <div>
                <h4 className="text-sm font-bold text-base-content mb-1">
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

            <div>
                <h4 className="text-sm font-bold text-base-content mb-1">
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
                />
            </div>
        </div>
    );
}
