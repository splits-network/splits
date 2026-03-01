import { CandidateSettings } from "./types";

interface SectionPrivacyProps {
    settings: CandidateSettings;
    onUpdate: (updates: Partial<CandidateSettings>) => void;
}

const PRIVACY_TOGGLES = [
    {
        key: "show_email" as const,
        label: "Show email address",
        description: "Display email to recruiters",
    },
    {
        key: "show_phone" as const,
        label: "Show phone number",
        description: "Display phone to recruiters",
    },
    {
        key: "show_location" as const,
        label: "Show location",
        description: "Display location to recruiters",
    },
    {
        key: "show_current_company" as const,
        label: "Show current company",
        description: "Display current employer",
    },
    {
        key: "show_salary_expectations" as const,
        label: "Show salary expectations",
        description: "Display desired salary range",
        defaultValue: false,
    },
];

export function SectionPrivacy({ settings, onUpdate }: SectionPrivacyProps) {
    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Privacy Settings
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Control what information is visible to recruiters.
            </p>

            <div className="space-y-0">
                {PRIVACY_TOGGLES.map((toggle) => (
                    <div
                        key={toggle.key}
                        className="flex items-center justify-between py-5 border-b border-base-300"
                    >
                        <div>
                            <p className="font-semibold text-sm">
                                {toggle.label}
                            </p>
                            <p className="text-xs text-base-content/40">
                                {toggle.description}
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={
                                settings[toggle.key] ??
                                (toggle.defaultValue !== undefined
                                    ? toggle.defaultValue
                                    : true)
                            }
                            onChange={(e) =>
                                onUpdate({
                                    [toggle.key]: e.target.checked,
                                })
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
