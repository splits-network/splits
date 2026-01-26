'use client';

/**
 * Preferences Step - Step 4 of Candidate Onboarding
 * Job type, remote/relocation, availability, and salary preferences (all optional)
 */

import { useOnboarding } from '../onboarding-provider';
import { JOB_TYPE_OPTIONS, SALARY_RANGES, AVAILABILITY_OPTIONS } from '../types';

export function PreferencesStep() {
    const { state, updateProfileData } = useOnboarding();

    const handleJobTypeToggle = (value: string) => {
        const currentTypes = state.profileData.desired_job_type || [];
        const newTypes = currentTypes.includes(value)
            ? currentTypes.filter(t => t !== value)
            : [...currentTypes, value];
        updateProfileData({ desired_job_type: newTypes });
    };

    const handleSalaryMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            updateProfileData({ desired_salary_min: undefined });
        } else {
            updateProfileData({ desired_salary_min: parseInt(value, 10) });
        }
    };

    const handleSalaryMaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            updateProfileData({ desired_salary_max: undefined });
        } else {
            const maxValue = value === 'unlimited' ? 999999999 : parseInt(value, 10);
            updateProfileData({ desired_salary_max: maxValue });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-sliders text-3xl text-accent"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">
                    Job Preferences
                </h2>
                <p className="text-base-content/70 text-sm">
                    Help us match you with the right opportunities. All fields are optional.
                </p>
            </div>

            {/* Form Fields */}
            <div className="mx-auto space-y-6">
                {/* Job Type */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        What type of work are you looking for?
                    </legend>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {JOB_TYPE_OPTIONS.map(option => {
                            const isSelected = state.profileData.desired_job_type?.includes(option.value);
                            return (
                                <label 
                                    key={option.value}
                                    className={`
                                        flex items-center gap-2 p-3 rounded-lg border cursor-pointer
                                        transition-all duration-200
                                        ${isSelected 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-base-300 hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <input 
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={isSelected}
                                        onChange={() => handleJobTypeToggle(option.value)}
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>

                {/* Availability */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">When can you start?</legend>
                    <select 
                        className="select w-full"
                        value={state.profileData.availability || ''}
                        onChange={(e) => updateProfileData({ availability: e.target.value || undefined })}
                    >
                        <option value="">Select availability...</option>
                        {AVAILABILITY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </fieldset>

                {/* Work Flexibility */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Work Flexibility</legend>
                    <div className="space-y-2 mt-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-base-300 cursor-pointer hover:border-primary/50 transition-all">
                            <input 
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={state.profileData.open_to_remote || false}
                                onChange={() => updateProfileData({ 
                                    open_to_remote: !state.profileData.open_to_remote 
                                })}
                            />
                            <div>
                                <span className="font-medium text-sm">Open to remote work</span>
                                <p className="text-xs text-base-content/60">
                                    Include remote opportunities in your matches
                                </p>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-base-300 cursor-pointer hover:border-primary/50 transition-all">
                            <input 
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={state.profileData.open_to_relocation || false}
                                onChange={() => updateProfileData({ 
                                    open_to_relocation: !state.profileData.open_to_relocation 
                                })}
                            />
                            <div>
                                <span className="font-medium text-sm">Open to relocation</span>
                                <p className="text-xs text-base-content/60">
                                    Willing to move for the right opportunity
                                </p>
                            </div>
                        </label>
                    </div>
                </fieldset>

                {/* Salary Range */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Desired Salary Range (USD)</legend>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                            <label className="text-xs text-base-content/60 mb-1 block">Minimum</label>
                            <select 
                                className="select w-full"
                                value={state.profileData.desired_salary_min ?? ''}
                                onChange={handleSalaryMinChange}
                            >
                                <option value="">No minimum</option>
                                {SALARY_RANGES.slice(0, -1).map(range => (
                                    <option key={range.min} value={range.min}>
                                        ${(range.min / 1000).toFixed(0)}K
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-base-content/60 mb-1 block">Maximum</label>
                            <select 
                                className="select w-full"
                                value={
                                    state.profileData.desired_salary_max === 999999999 
                                        ? 'unlimited' 
                                        : state.profileData.desired_salary_max ?? ''
                                }
                                onChange={handleSalaryMaxChange}
                            >
                                <option value="">No maximum</option>
                                {SALARY_RANGES.map(range => (
                                    <option 
                                        key={range.max ?? 'unlimited'} 
                                        value={range.max ?? 'unlimited'}
                                    >
                                        {range.max 
                                            ? `$${(range.max / 1000).toFixed(0)}K` 
                                            : 'No limit'
                                        }
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="fieldset-label">
                        Helps filter job opportunities based on compensation
                    </p>
                </fieldset>
            </div>

            {/* Almost Done Note */}
            <div className="bg-success/10 rounded-lg p-4 mx-auto">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-party-horn text-success text-xl mt-0.5"></i>
                    <div>
                        <h4 className="font-medium text-sm text-success">You're almost done!</h4>
                        <p className="text-xs text-base-content/70 mt-1">
                            Click "Complete Setup" to finish your profile and start exploring opportunities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
