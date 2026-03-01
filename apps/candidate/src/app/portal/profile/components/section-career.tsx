import {
    CandidateSettings,
    JOB_TYPE_OPTIONS,
    AVAILABILITY_OPTIONS,
} from "./types";

interface SectionCareerProps {
    settings: CandidateSettings;
    onUpdate: (updates: Partial<CandidateSettings>) => void;
}

export function SectionCareer({ settings, onUpdate }: SectionCareerProps) {
    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Career Preferences
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Help recruiters find the right opportunities for you.
            </p>

            <div className="space-y-6">
                {/* Salary Range */}
                <div className="grid md:grid-cols-2 gap-6">
                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            Desired Salary (Min)
                        </label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            placeholder="e.g., 100000"
                            value={settings.desired_salary_min || ""}
                            onChange={(e) =>
                                onUpdate({
                                    desired_salary_min:
                                        parseInt(e.target.value) || undefined,
                                })
                            }
                        />
                    </fieldset>

                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            Desired Salary (Max)
                        </label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            placeholder="e.g., 150000"
                            value={settings.desired_salary_max || ""}
                            onChange={(e) =>
                                onUpdate({
                                    desired_salary_max:
                                        parseInt(e.target.value) || undefined,
                                })
                            }
                        />
                    </fieldset>
                </div>

                {/* Job Type */}
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Desired Job Type
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={settings.desired_job_type || ""}
                        onChange={(e) =>
                            onUpdate({
                                desired_job_type:
                                    e.target.value || undefined,
                            })
                        }
                    >
                        <option value="">Select...</option>
                        {JOB_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </fieldset>

                {/* Availability */}
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Availability
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={settings.availability || ""}
                        onChange={(e) =>
                            onUpdate({
                                availability: e.target.value || undefined,
                            })
                        }
                    >
                        <option value="">Select...</option>
                        {AVAILABILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </fieldset>

                {/* Remote & Relocation Toggles */}
                <div className="border-t border-base-300 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold">
                                Open to Remote Work
                            </p>
                            <p className="text-xs text-base-content/40">
                                Include remote roles in matching
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={settings.open_to_remote || false}
                            onChange={(e) =>
                                onUpdate({
                                    open_to_remote: e.target.checked,
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold">
                                Open to Relocation
                            </p>
                            <p className="text-xs text-base-content/40">
                                Show roles that require relocation
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={settings.open_to_relocation || false}
                            onChange={(e) =>
                                onUpdate({
                                    open_to_relocation: e.target.checked,
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
