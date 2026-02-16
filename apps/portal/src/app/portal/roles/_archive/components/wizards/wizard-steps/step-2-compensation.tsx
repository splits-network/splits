import { FormData } from "./types";

const COMMUTE_TYPE_OPTIONS = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid_1', label: 'Hybrid (1 day in office)' },
    { value: 'hybrid_2', label: 'Hybrid (2 days in office)' },
    { value: 'hybrid_3', label: 'Hybrid (3 days in office)' },
    { value: 'hybrid_4', label: 'Hybrid (4 days in office)' },
    { value: 'in_office', label: 'In Office' },
] as const;

const JOB_LEVEL_OPTIONS = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Director' },
    { value: 'vp', label: 'VP' },
    { value: 'c_suite', label: 'C-Suite' },
] as const;

interface Step2CompensationProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Step2Compensation({
    formData,
    setFormData,
}: Step2CompensationProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Minimum Salary (USD)
                    </legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.salary_min}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                salary_min: e.target.value,
                            }))
                        }
                        placeholder="100000"
                        min="0"
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Maximum Salary (USD)
                    </legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.salary_max}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                salary_max: e.target.value,
                            }))
                        }
                        placeholder="150000"
                        min="0"
                    />
                </fieldset>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Display Options</legend>
                <label className="label cursor-pointer">
                    <span className="label-text">
                        Show salary range to candidates
                    </span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.show_salary_range}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                show_salary_range: e.target.checked,
                            }))
                        }
                    />
                </label>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend flex justify-between w-full">
                        <span>Fee Percentage *</span>
                        <div
                            className="tooltip tooltip-info tooltip-left"
                            data-tip="Percentage of the candidate’s annual base salary used to calculate the placement fee. Set this based on your company’s standard fee policy and role difficulty so recruiters and hiring teams align on expectations. Learn more in Documentation."
                        >
                            <i className="fa-duotone fa-regular fa-circle-info fa-lg text-info" />
                        </div>
                    </legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.fee_percentage}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                fee_percentage: parseFloat(e.target.value) || 0,
                            }))
                        }
                        placeholder="20"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend flex justify-between w-full">
                        <span>Guarantee Period (Days) *</span>
                        <div
                            className="tooltip tooltip-info tooltip-left"
                            data-tip="Time window for replacement or refund if a hire doesn’t work out. Choose a duration that matches your company’s policy and the seniority of the role. Learn more in Documentation."
                        >
                            <i className="fa-duotone fa-regular fa-circle-info fa-lg text-info" />
                        </div>
                    </legend>
                    <select
                        className="select w-full"
                        value={formData.guarantee_days ?? 0}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                guarantee_days: parseInt(e.target.value, 10),
                            }))
                        }
                        required
                    >
                        <option value={0}>No guarantee</option>
                        <option value={15}>15 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                    </select>
                </fieldset>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Employment Type *</legend>
                <select
                    className="select w-full"
                    value={formData.employment_type}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            employment_type: e.target
                                .value as FormData["employment_type"],
                        }))
                    }
                    required
                >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Commute Type</legend>
                <div className="flex flex-wrap gap-4">
                    {COMMUTE_TYPE_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className="label cursor-pointer gap-2"
                        >
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={formData.commute_types.includes(
                                    option.value,
                                )}
                                onChange={(e) => {
                                    const value = option.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        commute_types: e.target.checked
                                            ? [...prev.commute_types, value]
                                            : prev.commute_types.filter(
                                                  (t) => t !== value,
                                              ),
                                    }));
                                }}
                            />
                            <span className="label-text">{option.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Job Level</legend>
                <select
                    className="select w-full"
                    value={formData.job_level}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            job_level: e.target.value,
                        }))
                    }
                >
                    <option value="">Select Level</option>
                    {JOB_LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Additional Options</legend>
                <label className="label cursor-pointer">
                    <span className="label-text">Open to relocation</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.open_to_relocation}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                open_to_relocation: e.target.checked,
                            }))
                        }
                    />
                </label>
            </fieldset>
        </div>
    );
}
