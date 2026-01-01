'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client'; import { useToast } from '@/lib/toast-context';
interface Job {
    id: string;
    title: string;
    company_id: string;
    location?: string;
    fee_percentage: number;
    status: string;
    salary_min?: number;
    salary_max?: number;
    department?: string;
    description?: string;
    recruiter_description?: string;
    candidate_description?: string;
    employment_type?: 'full_time' | 'contract' | 'temporary';
    open_to_relocation: boolean;
    show_salary_range: boolean;
    splits_fee_percentage: number;
    job_owner_id?: string;
    requirements?: Array<{ id: string; requirement_type: 'mandatory' | 'preferred'; description: string; sort_order: number }>;
    pre_screen_questions?: Array<{ id: string; question: string; question_type: string; options?: string[]; is_required: boolean; sort_order: number }>;
}

export default function EditRolePage() {
    const router = useRouter();
    const params = useParams();
    const { getToken } = useAuth();
    const roleId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [job, setJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        company_id: '',
        location: '',
        fee_percentage: 20,
        salary_min: '',
        salary_max: '',
        description: '',
        recruiter_description: '',
        candidate_description: '',
        department: '',
        status: 'active',
        employment_type: 'full_time' as 'full_time' | 'contract' | 'temporary',
        open_to_relocation: false,
        show_salary_range: true,
        splits_fee_percentage: 50,
        job_owner_id: '',
    });
    const [requirements, setRequirements] = useState<Array<{ id?: string; type: 'mandatory' | 'preferred'; description: string }>>([]);
    const [preScreenQuestions, setPreScreenQuestions] = useState<Array<{ id?: string; question: string; question_type: 'text' | 'yes_no' | 'select' | 'multi_select'; options?: string[]; is_required: boolean }>>([]);

    useEffect(() => {
        fetchJob();
    }, [roleId]);

    const fetchJob = async () => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.getJob(roleId);
            const jobData = response.data;

            setJob(jobData);
            setFormData({
                title: jobData.title || '',
                company_id: jobData.company_id || '',
                location: jobData.location || '',
                fee_percentage: jobData.fee_percentage || 20,
                salary_min: jobData.salary_min?.toString() || '',
                salary_max: jobData.salary_max?.toString() || '',
                description: jobData.description || '',
                recruiter_description: jobData.recruiter_description || '',
                candidate_description: jobData.candidate_description || '',
                department: jobData.department || '',
                status: jobData.status || 'active',
                employment_type: jobData.employment_type || 'full_time',
                open_to_relocation: jobData.open_to_relocation || false,
                show_salary_range: jobData.show_salary_range ?? true,
                splits_fee_percentage: jobData.splits_fee_percentage || 50,
                job_owner_id: jobData.job_owner_id || '',
            });

            // Load requirements
            if (jobData.requirements) {
                setRequirements(jobData.requirements.map((r: any) => ({
                    id: r.id,
                    type: r.requirement_type,
                    description: r.description
                })));
            }

            // Load pre-screen questions
            if (jobData.pre_screen_questions) {
                setPreScreenQuestions(jobData.pre_screen_questions.map((q: any) => ({
                    id: q.id,
                    question: q.question,
                    question_type: q.question_type,
                    options: q.options,
                    is_required: q.is_required
                })));
            }
        } catch (error: any) {
            console.error('Failed to fetch job:', error);
            alert(`Failed to load role: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);

            // Build payload with only changed fields
            const payload: any = {
                title: formData.title,
                fee_percentage: formData.fee_percentage,
                status: formData.status,
                employment_type: formData.employment_type,
                open_to_relocation: formData.open_to_relocation,
                show_salary_range: formData.show_salary_range,
                splits_fee_percentage: formData.splits_fee_percentage,
            };

            if (formData.location) payload.location = formData.location;
            if (formData.department) payload.department = formData.department;
            if (formData.description) payload.description = formData.description;
            if (formData.recruiter_description) payload.recruiter_description = formData.recruiter_description;
            if (formData.candidate_description) payload.candidate_description = formData.candidate_description;
            if (formData.salary_min) payload.salary_min = parseInt(formData.salary_min);
            if (formData.salary_max) payload.salary_max = parseInt(formData.salary_max);
            if (formData.job_owner_id) payload.job_owner_id = formData.job_owner_id;

            // Add requirements and pre-screen questions
            payload.requirements = requirements;
            payload.pre_screen_questions = preScreenQuestions;

            await client.patch(`/jobs/${roleId}`, payload);

            alert('Role updated successfully!');
            router.push(`/roles/${roleId}`);
        } catch (error: any) {
            console.error('Failed to update role:', error);
            alert(`Failed to update role: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>Role not found</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href={`/roles/${roleId}`} className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Role
                </Link>
                <h1 className="text-3xl font-bold">Edit Role</h1>
                <p className="text-base-content/70 mt-1">
                    Update the role details and settings
                </p>
            </div>

            {/* Form */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className='fieldset'>
                                <label className="label">Job Title *</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="fieldset">
                                <label className="label">Company ID</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.company_id}
                                    disabled
                                />
                                <label className="label">
                                    <span className="label-text-alt">Company cannot be changed</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Department</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Fee Percentage *</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    value={formData.fee_percentage}
                                    onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                                <label className="label">
                                    <span className="label-text-alt">Percentage of annual salary</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Status *</label>
                                <select
                                    className="select w-full"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="filled">Filled</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        {/* Salary Range */}
                        <div className="divider">Salary Range (Optional)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="fieldset">
                                <label className="label">Minimum Salary</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    value={formData.salary_min}
                                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                    placeholder="e.g. 100000"
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Maximum Salary</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                    placeholder="e.g. 150000"
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm"
                                        checked={formData.show_salary_range}
                                        onChange={(e) => setFormData({ ...formData, show_salary_range: e.target.checked })}
                                    />
                                    <span>Show Salary Range to Candidates</span>
                                </label>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="divider">Additional Details</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="fieldset">
                                <label className="label">Employment Type *</label>
                                <select
                                    className="select w-full"
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'full_time' | 'contract' | 'temporary' })}
                                    required
                                >
                                    <option value="full_time">Full-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="temporary">Temporary</option>
                                </select>
                            </div>

                            <div className="fieldset">
                                <label className="label flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm"
                                        checked={formData.open_to_relocation}
                                        onChange={(e) => setFormData({ ...formData, open_to_relocation: e.target.checked })}
                                    />
                                    <span>Open to Relocation</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Splits Fee Percentage *</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    value={formData.splits_fee_percentage}
                                    onChange={(e) => setFormData({ ...formData, splits_fee_percentage: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                    max="100"
                                    step="1"
                                />
                                <label className="label">
                                    <span className="label-text-alt">Default 50% - recruiter split of placement fee</span>
                                </label>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="divider">Job Descriptions</div>
                        <div className="fieldset">
                            <label className="label">Recruiter-Facing Description</label>
                            <textarea
                                className="textarea w-full h-32"
                                value={formData.recruiter_description}
                                onChange={(e) => setFormData({ ...formData, recruiter_description: e.target.value })}
                                placeholder="Internal notes, hiring manager details, and context for recruiters..."
                            ></textarea>
                            <label className="label">
                                <span className="label-text-alt">Only visible to recruiters</span>
                            </label>
                        </div>

                        <div className="fieldset">
                            <label className="label">Candidate-Facing Description</label>
                            <textarea
                                className="textarea w-full h-32"
                                value={formData.candidate_description}
                                onChange={(e) => setFormData({ ...formData, candidate_description: e.target.value })}
                                placeholder="Public job posting text that candidates will see..."
                            ></textarea>
                            <label className="label">
                                <span className="label-text-alt">Visible to candidates</span>
                            </label>
                        </div>

                        {/* Requirements */}
                        <div className="divider">Requirements</div>
                        <div className="alert alert-info mb-4">
                            <i className="fa-solid fa-circle-info"></i>
                            <div>
                                <p className="font-medium">Define what you're looking for in candidates</p>
                                <p className="text-sm opacity-80">Mandatory requirements are must-haves that candidates should meet. Preferred requirements are nice-to-haves that make a candidate more competitive.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <label className="label">Mandatory Requirements</label>
                                        <p className="text-xs text-base-content/60 -mt-1">Must-have qualifications (e.g., "JD from accredited university", "5+ years in role")</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => setRequirements([...requirements, { type: 'mandatory', description: '' }])}
                                    >
                                        <i className="fa-solid fa-plus mr-1"></i>
                                        Add Mandatory
                                    </button>
                                </div>
                                {requirements.filter(r => r.type === 'mandatory').map((req, idx) => {
                                    const actualIdx = requirements.findIndex(r => r === req);
                                    return (
                                        <div key={req.id || actualIdx} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={req.description}
                                                onChange={(e) => {
                                                    const newReqs = [...requirements];
                                                    newReqs[actualIdx].description = e.target.value;
                                                    setRequirements(newReqs);
                                                }}
                                                placeholder="e.g., JD from accredited university"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-square"
                                                onClick={() => setRequirements(requirements.filter((_, i) => i !== actualIdx))}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <label className="label">Preferred Requirements</label>
                                        <p className="text-xs text-base-content/60 -mt-1">Nice-to-have qualifications that make candidates more competitive</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => setRequirements([...requirements, { type: 'preferred', description: '' }])}
                                    >
                                        <i className="fa-solid fa-plus mr-1"></i>
                                        Add Preferred
                                    </button>
                                </div>
                                {requirements.filter(r => r.type === 'preferred').map((req, idx) => {
                                    const actualIdx = requirements.findIndex(r => r === req);
                                    return (
                                        <div key={req.id || actualIdx} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={req.description}
                                                onChange={(e) => {
                                                    const newReqs = [...requirements];
                                                    newReqs[actualIdx].description = e.target.value;
                                                    setRequirements(newReqs);
                                                }}
                                                placeholder="e.g., Experience with React"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-square"
                                                onClick={() => setRequirements(requirements.filter((_, i) => i !== actualIdx))}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pre-Screen Questions */}
                        <div className="divider">Pre-Screen Questions</div>
                        <div className="alert alert-info mb-4">
                            <i className="fa-solid fa-circle-info"></i>
                            <div>
                                <p className="font-medium">Screen candidates before review</p>
                                <p className="text-sm opacity-80">Ask specific questions to gather important information upfront. Question types: <strong>Text</strong> (open-ended), <strong>Yes/No</strong> (binary), <strong>Select</strong> (single choice), <strong>Multi-Select</strong> (multiple choices).</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <label className="label">Questions for Candidates</label>
                                    <p className="text-xs text-base-content/60 -mt-1">Examples: eligibility, clearance status, work authorization, relocation willingness</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setPreScreenQuestions([...preScreenQuestions, { question: '', question_type: 'text', is_required: true }])}
                                >
                                    <i className="fa-solid fa-plus mr-1"></i>
                                    Add Question
                                </button>
                            </div>
                            {preScreenQuestions.map((q, idx) => (
                                <div key={q.id || idx} className="card bg-base-200 p-4">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="input flex-1"
                                                value={q.question}
                                                onChange={(e) => {
                                                    const newQ = [...preScreenQuestions];
                                                    newQ[idx].question = e.target.value;
                                                    setPreScreenQuestions(newQ);
                                                }}
                                                placeholder="Enter question..."
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-square"
                                                onClick={() => setPreScreenQuestions(preScreenQuestions.filter((_, i) => i !== idx))}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="select"
                                                value={q.question_type}
                                                onChange={(e) => {
                                                    const newQ = [...preScreenQuestions];
                                                    newQ[idx].question_type = e.target.value as any;
                                                    setPreScreenQuestions(newQ);
                                                }}
                                            >
                                                <option value="text">Text</option>
                                                <option value="yes_no">Yes/No</option>
                                                <option value="select">Select One</option>
                                                <option value="multi_select">Multi-Select</option>
                                            </select>
                                            <label className="label flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm"
                                                    checked={q.is_required}
                                                    onChange={(e) => {
                                                        const newQ = [...preScreenQuestions];
                                                        newQ[idx].is_required = e.target.checked;
                                                        setPreScreenQuestions(newQ);
                                                    }}
                                                />
                                                <span>Required</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                            <Link href={`/roles/${roleId}`} className="btn btn-ghost">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-save mr-2"></i>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
