import { FormData } from './types';

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
                    <legend className="fieldset-legend">Minimum Salary (USD)</legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.salary_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
                        placeholder="100000"
                        min="0"
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Maximum Salary (USD)</legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.salary_max}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
                        placeholder="150000"
                        min="0"
                    />
                </fieldset>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Display Options</legend>
                <label className="label cursor-pointer">
                    <span className="label-text">Show salary range to candidates</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.show_salary_range}
                        onChange={(e) => setFormData(prev => ({ ...prev, show_salary_range: e.target.checked }))}
                    />
                </label>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Fee Percentage *</legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.fee_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, fee_percentage: parseFloat(e.target.value) || 0 }))}
                        placeholder="20"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                    />
                    <p className="fieldset-label">Percentage of annual salary (0-100%)</p>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Guarantee Period (Days) *</legend>
                    <input
                        type="number"
                        className="input w-full"
                        value={formData.guarantee_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, guarantee_days: parseInt(e.target.value) || 90 }))}
                        placeholder="90"
                        min="1"
                        max="365"
                        required
                    />
                    <p className="fieldset-label">Placement guarantee period (1-365 days)</p>
                </fieldset>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Employment Type *</legend>
                <select
                    className="select w-full"
                    value={formData.employment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value as any }))}
                    required
                >
                    <option value="full_time">Full Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, open_to_relocation: e.target.checked }))}
                    />
                </label>
            </fieldset>
        </div>
    );
}
