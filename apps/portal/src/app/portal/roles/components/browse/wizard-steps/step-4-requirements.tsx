import { FormData } from './types';

interface Step4RequirementsProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Step4Requirements({
    formData,
    setFormData,
}: Step4RequirementsProps) {
    const addMandatory = () => {
        setFormData(prev => ({
            ...prev,
            mandatory_requirements: [...prev.mandatory_requirements, '']
        }));
    };

    const addPreferred = () => {
        setFormData(prev => ({
            ...prev,
            preferred_requirements: [...prev.preferred_requirements, '']
        }));
    };

    const updateMandatory = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            mandatory_requirements: prev.mandatory_requirements.map((req, i) => i === index ? value : req)
        }));
    };

    const updatePreferred = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            preferred_requirements: prev.preferred_requirements.map((req, i) => i === index ? value : req)
        }));
    };

    const removeMandatory = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mandatory_requirements: prev.mandatory_requirements.filter((_, i) => i !== index)
        }));
    };

    const removePreferred = (index: number) => {
        setFormData(prev => ({
            ...prev,
            preferred_requirements: prev.preferred_requirements.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <p className="font-medium">Define what you're looking for</p>
                    <p className="text-sm opacity-80">Mandatory requirements are must-haves. Preferred requirements make candidates more competitive.</p>
                </div>
            </div>

            {/* Mandatory Requirements */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h4 className="font-semibold">Mandatory Requirements</h4>
                        <p className="text-sm text-base-content/60">Must-have qualifications</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={addMandatory}
                    >
                        <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                        Add Mandatory
                    </button>
                </div>
                <div className="space-y-2">
                    {formData.mandatory_requirements.length === 0 ? (
                        <p className="text-base-content/50 text-sm italic py-4 text-center">
                            No mandatory requirements added yet
                        </p>
                    ) : (
                        formData.mandatory_requirements.map((req, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={req}
                                    onChange={(e) => updateMandatory(idx, e.target.value)}
                                    placeholder="e.g., JD from accredited university"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-square"
                                    onClick={() => removeMandatory(idx)}
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Preferred Requirements */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h4 className="font-semibold">Preferred Requirements</h4>
                        <p className="text-sm text-base-content/60">Nice-to-have qualifications</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={addPreferred}
                    >
                        <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                        Add Preferred
                    </button>
                </div>
                <div className="space-y-2">
                    {formData.preferred_requirements.length === 0 ? (
                        <p className="text-base-content/50 text-sm italic py-4 text-center">
                            No preferred requirements added yet
                        </p>
                    ) : (
                        formData.preferred_requirements.map((req, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={req}
                                    onChange={(e) => updatePreferred(idx, e.target.value)}
                                    placeholder="e.g., Experience with React"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-square"
                                    onClick={() => removePreferred(idx)}
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
