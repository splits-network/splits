import { useState, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { CandidateSettings } from "./types";

interface SectionProfileProps {
    settings: CandidateSettings;
    name: string;
    onNameChange: (name: string) => void;
    onNameSubmit: (e: FormEvent) => Promise<void>;
    submitting: boolean;
    nameSuccess: string;
    onUpdate: (updates: Partial<CandidateSettings>) => void;
}

export function SectionProfile({
    settings,
    name,
    onNameChange,
    onNameSubmit,
    submitting,
    nameSuccess,
    onUpdate,
}: SectionProfileProps) {
    const { user: clerkUser } = useUser();
    const [saved, setSaved] = useState(false);

    const initials = name
        ? name
              .split(" ")
              .map((n) => n.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "??";

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Profile Information
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Update your personal details and public profile.
            </p>

            {/* Avatar + Name */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-base-300">
                <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center font-black text-2xl shrink-0">
                    {initials}
                </div>
                <div className="flex-1">
                    <form onSubmit={onNameSubmit}>
                        <fieldset>
                            <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                required
                            />
                            <p className="text-xs text-base-content/30 mt-1">
                                Your name will be synced to your account
                            </p>
                        </fieldset>

                        {nameSuccess && (
                            <div className="mt-2 text-sm text-success font-semibold">
                                <i className="fa-solid fa-check mr-1" />
                                {nameSuccess}
                            </div>
                        )}

                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() =>
                                    onNameChange(settings.user?.name || "")
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={
                                    submitting || name === settings.user?.name
                                }
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Name"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Contact & Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email
                    </label>
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        value={
                            clerkUser?.primaryEmailAddress?.emailAddress ||
                            settings.user?.email ||
                            ""
                        }
                        disabled
                    />
                    <p className="text-xs text-base-content/30 mt-1">
                        Contact support to change your email
                    </p>
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Phone
                    </label>
                    <input
                        type="tel"
                        className="input input-bordered w-full"
                        placeholder="e.g., +1 (415) 555-0142"
                        value={settings.phone || ""}
                        onChange={(e) => onUpdate({ phone: e.target.value })}
                    />
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Current Title
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="e.g., Senior Software Engineer"
                        maxLength={255}
                        value={settings.current_title || ""}
                        onChange={(e) =>
                            onUpdate({ current_title: e.target.value })
                        }
                    />
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Current Company
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="e.g., Tech Corp"
                        value={settings.current_company || ""}
                        onChange={(e) =>
                            onUpdate({ current_company: e.target.value })
                        }
                    />
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Location
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="e.g., San Francisco, CA"
                        value={settings.location || ""}
                        onChange={(e) =>
                            onUpdate({ location: e.target.value })
                        }
                    />
                </fieldset>
            </div>

            {/* Short Bio */}
            <div className="mb-8">
                <MarkdownEditor
                    label="Profile Summary (Card Preview)"
                    value={settings.bio || ""}
                    onChange={(value) => onUpdate({ bio: value })}
                    placeholder="Brief summary of your background and skills (shows on marketplace cards)"
                    maxLength={500}
                    showCount
                    height={160}
                    helperText="Short bio displayed on marketplace cards"
                />
            </div>
        </div>
    );
}
