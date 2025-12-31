'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
}

interface UserProfile {
    memberships: Array<{
        organization_id: string;
        role: string;
    }>;
}

export default function NewRolePage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        company_id: '',
        location: '',
        fee_percentage: 20,
        salary_min: '',
        salary_max: '',
        description: '', // Deprecated, use recruiter_description
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
    const [requirements, setRequirements] = useState<Array<{ type: 'mandatory' | 'preferred', description: string }>>([]);
    const [preScreenQuestions, setPreScreenQuestions] = useState<Array<{ question: string, question_type: 'text' | 'yes_no' | 'select' | 'multi_select', options?: string[], is_required: boolean }>>([]);

    useEffect(() => {
        async function initializeForm() {
            try {
                const token = await getToken();
                if (!token) {
                    console.error('No auth token available');
                    return;
                }

                console.log('Initializing form...');
                const client = createAuthenticatedClient(token);

                // Get user profile to check role and company
                console.log('Fetching user profile...');
                const profileResponse = await client.get<{ data: UserProfile[] }>('/v2/users?limit=1');
                console.log('Profile response:', profileResponse);
                const profile = profileResponse.data?.[0] || profileResponse.data;

                // Check if user is a platform admin
                const isAdmin = profile.memberships?.some(m => m.role === 'platform_admin');
                console.log('Is platform admin:', isAdmin);
                setIsPlatformAdmin(isAdmin);

                if (isAdmin) {
                    // Platform admin: fetch all companies for dropdown
                    try {
                        console.log('Fetching companies...');
                        const companiesResponse = await client.get<{ data: Company[] }>('/v2/companies');
                        console.log('Companies response:', companiesResponse);
                        setCompanies(companiesResponse.data || []);
                    } catch (err) {
                        console.error('Failed to fetch companies:', err);
                        alert('Failed to load companies. Please check the console for details.');
                    }
                } else {
                    // Company admin: auto-populate from their organization
                    // Find the company associated with their organization
                    const membership = profile.memberships?.find(m => m.role === 'company_admin');
                    if (membership?.organization_id) {
                        // Fetch company by organization ID
                        try {
                            console.log('Fetching company for org:', membership.organization_id);
                            const companyResponse = await client.get<{ data: Company }>(`/companies/by-org/${membership.organization_id}`);
                            console.log('Company response:', companyResponse);
                            if (companyResponse.data) {
                                setFormData(prev => ({ ...prev, company_id: companyResponse.data.id }));
                            } else {
                                console.warn('No company found for organization');
                            }
                        } catch (err: any) {
                            // Company doesn't exist yet - they need to create one first
                            console.error('Could not fetch company:', err);
                            // Check if it's a 404 (company not found) vs other error
                            if (err.message?.includes('404') || err.message?.includes('not found')) {
                                alert('No company found for your organization. Please ask your platform admin to create a company linked to your organization first.');
                            } else {
                                alert('Error loading company information. Please try again or contact support.');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to initialize form:', error);
            } finally {
                setInitializing(false);
            }
        }

        initializeForm();
    }, [getToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            // Validate company_id is set
            if (!formData.company_id) {
                alert('Please select a company');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            // Convert salary values to numbers
            const payload: any = {
                title: formData.title,
                company_id: formData.company_id,
                fee_percentage: formData.fee_percentage,
                status: formData.status,
                employment_type: formData.employment_type,
                open_to_relocation: formData.open_to_relocation,
                show_salary_range: formData.show_salary_range,
                splits_fee_percentage: formData.splits_fee_percentage,
            };

            console.log('Submitting job payload:', payload);

            if (formData.location) payload.location = formData.location;
            if (formData.department) payload.department = formData.department;
            if (formData.recruiter_description) payload.recruiter_description = formData.recruiter_description;
            if (formData.candidate_description) payload.candidate_description = formData.candidate_description;
            if (formData.description) payload.description = formData.description; // Backward compatibility
            if (formData.salary_min) payload.salary_min = parseInt(formData.salary_min);
            if (formData.salary_max) payload.salary_max = parseInt(formData.salary_max);
            if (formData.job_owner_id) payload.job_owner_id = formData.job_owner_id;

            // Add requirements and pre-screen questions
            payload.requirements = requirements;
            payload.pre_screen_questions = preScreenQuestions;

            await client.post('/jobs', payload);

            alert('Role created successfully!');
            router.push('/roles');
        } catch (error: any) {
            console.error('Failed to create role:', error);
            alert(`Failed to create role: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/roles" className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Roles
                </Link>
                <h1 className="text-3xl font-bold">Create New Role</h1>
                <p className="text-base-content/70 mt-1">
                    Add a new role to your organization
                </p>
            </div>

            {/* Form */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="fieldset">
                                <label className="label">Job Title *</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Senior React Developer"
                                />
                            </div>

                            {isPlatformAdmin ? (
                                <div className="fieldset">
                                    <label className="label">Company *</label>
                                    <select
                                        className="select w-full"
                                        value={formData.company_id}
                                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a company...</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="fieldset">
                                    <label className="label">Company</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.company_id}
                                        disabled
                                        placeholder="Auto-populated from your organization"
                                    />
                                    <label className="label">
                                        <span className="label-text-alt">Linked to your organization</span>
                                    </label>
                                </div>
                            )}

                            <div className="fieldset">
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Remote, New York, NY"
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Department</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g. Engineering"
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
                                        <div key={actualIdx} className="flex gap-2 mb-2">
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
                                        <div key={actualIdx} className="flex gap-2 mb-2">
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
                                <div key={idx} className="card bg-base-200 p-4">
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

                        {/* Description (Backward Compatibility) - Hidden */}
                        <input type="hidden" value={formData.description} />

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                            <Link href="/roles" className="btn btn-ghost">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-plus mr-2"></i>
                                        Create Role
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
