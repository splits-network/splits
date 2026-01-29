import { FormData, Company } from './types';

interface Step1BasicInfoProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    companies: Company[];
    isAdmin: boolean;
}

export default function Step1BasicInfo({
    formData,
    setFormData,
    companies,
    isAdmin,
}: Step1BasicInfoProps) {
    return (
        <div className="space-y-4">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Job Title *</legend>
                <input
                    type="text"
                    className="input w-full"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                    required
                />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Company *</legend>
                {isAdmin ? (
                    <select
                        className="select w-full"
                        value={formData.company_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                        required
                    >
                        <option value="">Select a company...</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        className="input w-full"
                        value={companies[0]?.name || 'Loading...'}
                        disabled
                    />
                )}
                <p className="fieldset-label">
                    {isAdmin ? 'Select the company for this role' : 'Your company is automatically selected'}
                </p>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Location</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., New York, NY or Remote"
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Department</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Engineering"
                    />
                </fieldset>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Status *</legend>
                <select
                    className="select w-full"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    required
                >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                </select>
                <p className="fieldset-label">
                    Active roles are visible to recruiters in the marketplace
                </p>
            </fieldset>
        </div>
    );
}
