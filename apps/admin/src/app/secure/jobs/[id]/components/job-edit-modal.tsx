'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';
import type { JobDetail } from '../page';

const LEVEL_OPTIONS = ['', 'entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_suite'];
const EMPLOYMENT_OPTIONS = ['', 'full_time', 'part_time', 'contract', 'temporary'];

type Props = {
    job: JobDetail;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function JobEditModal({ job, isOpen, onClose, onSuccess }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: job.title ?? '',
        description: job.description ?? '',
        recruiter_description: job.recruiter_description ?? '',
        location: job.location ?? '',
        department: job.department ?? '',
        job_level: job.job_level ?? '',
        employment_type: job.employment_type ?? '',
        salary_min: job.salary_min ?? '',
        salary_max: job.salary_max ?? '',
        fee_percentage: job.fee_percentage ?? '',
        guarantee_days: job.guarantee_days ?? 90,
        is_early_access: job.is_early_access,
        is_priority: job.is_priority,
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) dialog.showModal();
        else dialog.close();
    }, [isOpen]);

    useEffect(() => {
        setForm({
            title: job.title ?? '',
            description: job.description ?? '',
            recruiter_description: job.recruiter_description ?? '',
            location: job.location ?? '',
            department: job.department ?? '',
            job_level: job.job_level ?? '',
            employment_type: job.employment_type ?? '',
            salary_min: job.salary_min ?? '',
            salary_max: job.salary_max ?? '',
            fee_percentage: job.fee_percentage ?? '',
            guarantee_days: job.guarantee_days ?? 90,
            is_early_access: job.is_early_access,
            is_priority: job.is_priority,
        });
    }, [job]);

    async function handleSave() {
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/ats/admin/jobs/${job.id}`, {
                title: form.title || null,
                description: form.description || null,
                recruiter_description: form.recruiter_description || null,
                location: form.location || null,
                department: form.department || null,
                job_level: form.job_level || null,
                employment_type: form.employment_type || null,
                salary_min: form.salary_min ? Number(form.salary_min) : null,
                salary_max: form.salary_max ? Number(form.salary_max) : null,
                fee_percentage: form.fee_percentage ? Number(form.fee_percentage) : null,
                guarantee_days: Number(form.guarantee_days),
                is_early_access: form.is_early_access,
                is_priority: form.is_priority,
            });
            toast.success('Job updated');
            onSuccess();
        } catch {
            toast.error('Failed to update job');
        } finally {
            setSaving(false);
        }
    }

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-lg max-h-[85vh]">
                <h3 className="font-black text-lg mb-4">Edit Job</h3>

                <div className="space-y-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Title</legend>
                        <input type="text" className="input input-sm w-full" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                    </fieldset>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Location</legend>
                            <input type="text" className="input input-sm w-full" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Department</legend>
                            <input type="text" className="input input-sm w-full" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} />
                        </fieldset>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Level</legend>
                            <select className="select select-sm w-full" value={form.job_level} onChange={(e) => setForm(f => ({ ...f, job_level: e.target.value }))}>
                                {LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o ? o.replace(/_/g, ' ') : 'Not set'}</option>)}
                            </select>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Employment Type</legend>
                            <select className="select select-sm w-full" value={form.employment_type} onChange={(e) => setForm(f => ({ ...f, employment_type: e.target.value }))}>
                                {EMPLOYMENT_OPTIONS.map(o => <option key={o} value={o}>{o ? o.replace(/_/g, ' ') : 'Not set'}</option>)}
                            </select>
                        </fieldset>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Salary Min</legend>
                            <input type="number" className="input input-sm w-full" value={form.salary_min} onChange={(e) => setForm(f => ({ ...f, salary_min: e.target.value }))} />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Salary Max</legend>
                            <input type="number" className="input input-sm w-full" value={form.salary_max} onChange={(e) => setForm(f => ({ ...f, salary_max: e.target.value }))} />
                        </fieldset>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Fee %</legend>
                            <input type="number" className="input input-sm w-full" min="0" max="100" value={form.fee_percentage} onChange={(e) => setForm(f => ({ ...f, fee_percentage: e.target.value }))} />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Guarantee Days</legend>
                            <input type="number" className="input input-sm w-full" min="1" max="365" value={form.guarantee_days} onChange={(e) => setForm(f => ({ ...f, guarantee_days: e.target.value }))} />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Description</legend>
                        <textarea className="textarea textarea-sm w-full min-h-24" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Recruiter Notes</legend>
                        <textarea className="textarea textarea-sm w-full min-h-16" value={form.recruiter_description} onChange={(e) => setForm(f => ({ ...f, recruiter_description: e.target.value }))} />
                    </fieldset>

                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input type="checkbox" className="checkbox checkbox-sm" checked={form.is_early_access} onChange={(e) => setForm(f => ({ ...f, is_early_access: e.target.checked }))} />
                            <span className="text-sm">Early Access</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input type="checkbox" className="checkbox checkbox-sm" checked={form.is_priority} onChange={(e) => setForm(f => ({ ...f, is_priority: e.target.checked }))} />
                            <span className="text-sm">Priority</span>
                        </label>
                    </div>
                </div>

                <div className="modal-action">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                        {saving && <span className="loading loading-spinner loading-xs" />}
                        Save Changes
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop"><button type="submit">close</button></form>
        </dialog>
    );
}
