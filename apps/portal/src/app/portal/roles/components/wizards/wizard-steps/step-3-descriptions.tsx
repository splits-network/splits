import { MarkdownEditor } from '@splits-network/shared-ui';
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

            <MarkdownEditor
                className="fieldset"
                label="Recruiter-Facing Description"
                value={formData.recruiter_description}
                onChange={(value) => setFormData(prev => ({ ...prev, recruiter_description: value }))}
                placeholder="Internal notes for recruiters: pain points, urgency, ideal candidate profile, hiring manager notes..."
                helperText="Internal notes only recruiters will see"
                height={160}
            />

            <MarkdownEditor
                className="fieldset"
                label="Candidate-Facing Description"
                value={formData.candidate_description}
                onChange={(value) => setFormData(prev => ({ ...prev, candidate_description: value }))}
                placeholder="Public job description: responsibilities, team info, company culture, benefits..."
                helperText="Public description candidates will see"
                height={160}
            />
        </div>
    );
}
