import { CandidateSettings } from "./types";

interface SectionOnlineProps {
    settings: CandidateSettings;
    onUpdate: (updates: Partial<CandidateSettings>) => void;
}

export function SectionOnline({ settings, onUpdate }: SectionOnlineProps) {
    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Online Presence
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Add links to your professional profiles and portfolio.
            </p>

            <div className="space-y-6">
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        <i className="fa-brands fa-linkedin text-[#0077B5] mr-1" />
                        LinkedIn URL
                    </label>
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={settings.linkedin_url || ""}
                        onChange={(e) =>
                            onUpdate({ linkedin_url: e.target.value })
                        }
                    />
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        <i className="fa-brands fa-github mr-1" />
                        GitHub URL
                    </label>
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        placeholder="https://github.com/yourusername"
                        value={settings.github_url || ""}
                        onChange={(e) =>
                            onUpdate({ github_url: e.target.value })
                        }
                    />
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                        Portfolio URL
                    </label>
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        placeholder="https://yourportfolio.com"
                        value={settings.portfolio_url || ""}
                        onChange={(e) =>
                            onUpdate({ portfolio_url: e.target.value })
                        }
                    />
                    <p className="text-xs text-base-content/30 mt-1">
                        Personal website, portfolio, or other professional URL
                    </p>
                </fieldset>
            </div>
        </div>
    );
}
