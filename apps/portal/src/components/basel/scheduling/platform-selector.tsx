"use client";

/* ─── Types ────────────────────────────────────────────────────────────── */

export type MeetingPlatform = "splits_video" | "google_meet" | "microsoft_teams";

interface PlatformOption {
    value: MeetingPlatform;
    label: string;
    description: string;
    iconClass: string;
    badge?: string;
}

interface PlatformSelectorProps {
    selectedPlatform: MeetingPlatform;
    onSelect: (platform: MeetingPlatform) => void;
    hasGoogleConnection: boolean;
    hasMicrosoftConnection: boolean;
}

/* ─── Platform Options ─────────────────────────────────────────────────── */

const PLATFORMS: PlatformOption[] = [
    {
        value: "splits_video",
        label: "Splits Network Video",
        description: "In-app video call",
        iconClass: "fa-duotone fa-regular fa-video",
        badge: "Recommended",
    },
    {
        value: "google_meet",
        label: "Google Meet",
        description: "Google Meet link",
        iconClass: "fa-brands fa-google",
    },
    {
        value: "microsoft_teams",
        label: "Microsoft Teams",
        description: "Teams meeting link",
        iconClass: "fa-brands fa-microsoft",
    },
];

/* ─── Component ────────────────────────────────────────────────────────── */

export default function PlatformSelector({
    selectedPlatform,
    onSelect,
    hasGoogleConnection,
    hasMicrosoftConnection,
}: PlatformSelectorProps) {
    const isDisabled = (platform: MeetingPlatform): boolean => {
        if (platform === "google_meet") return !hasGoogleConnection;
        if (platform === "microsoft_teams") return !hasMicrosoftConnection;
        return false;
    };

    return (
        <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                Meeting Platform
            </legend>
            <div className="space-y-2">
                {PLATFORMS.map((platform) => {
                    const disabled = isDisabled(platform.value);
                    const selected = selectedPlatform === platform.value;

                    return (
                        <button
                            key={platform.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect(platform.value)}
                            className={`w-full text-left px-4 py-3 border transition-colors ${
                                disabled
                                    ? "border-base-300 bg-base-200 opacity-50 cursor-not-allowed"
                                    : selected
                                      ? "border-primary bg-primary/5"
                                      : "border-base-300 hover:border-primary/30"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <i
                                    className={`${platform.iconClass} text-lg ${
                                        selected
                                            ? "text-primary"
                                            : "text-base-content/50"
                                    }`}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold">
                                            {platform.label}
                                        </p>
                                        {platform.badge && (
                                            <span className="badge badge-primary badge-sm">
                                                {platform.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-base-content/50">
                                        {platform.description}
                                    </p>
                                </div>
                                {disabled && (
                                    <a
                                        href="/portal/integrations"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        Connect
                                    </a>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
