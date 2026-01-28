import { FormData } from './types';

interface Step3DescriptionsProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Step3Descriptions({
    formData,
    setFormData,
}: Step3DescriptionsProps) {
    return (
        <div className="space-y-4">
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <p className="font-medium">Two descriptions for different audiences</p>
                    <p className="text-sm opacity-80">Recruiter-facing notes stay internal. Candidate-facing description is public.</p>
                </div>
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Recruiter-Facing Description</legend>
                <textarea
                    className="textarea w-full h-32"
                    value={formData.recruiter_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, recruiter_description: e.target.value }))}
                    placeholder="Internal notes for recruiters: pain points, urgency, ideal candidate profile, hiring manager notes..."
                />
                <p className="fieldset-label">Internal notes only recruiters will see</p>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Candidate-Facing Description</legend>
                <textarea
                    className="textarea w-full h-32"
                    value={formData.candidate_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidate_description: e.target.value }))}
                    placeholder="Public job description: responsibilities, team info, company culture, benefits..."
                />
                <p className="fieldset-label">Public description candidates will see</p>
            </fieldset>
        </div>
    );
}
