"use client";

import { CompanyTagsSection } from "./company-tags-section";

interface CultureTabProps {
    companyId: string;
}

export function CultureTab({ companyId }: CultureTabProps) {
    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Culture & Tech Stack
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Define your tech stack, perks, and company culture to attract
                the right talent.
            </p>
            <CompanyTagsSection companyId={companyId} />
        </div>
    );
}
