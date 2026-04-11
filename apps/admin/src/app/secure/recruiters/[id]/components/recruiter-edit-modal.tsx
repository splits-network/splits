'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';
import type { RecruiterDetail } from '../page';

type Props = {
    recruiter: RecruiterDetail;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function RecruiterEditModal({ recruiter, isOpen, onClose, onSuccess }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        bio: recruiter.bio ?? '',
        tagline: recruiter.tagline ?? '',
        location: recruiter.location ?? '',
        phone: recruiter.phone ?? '',
        years_experience: recruiter.years_experience ?? '',
        industries: (recruiter.industries ?? []).join(', '),
        specialties: (recruiter.specialties ?? []).join(', '),
        candidate_recruiter: recruiter.candidate_recruiter,
        company_recruiter: recruiter.company_recruiter,
        marketplace_enabled: recruiter.marketplace_enabled,
        marketplace_visibility: recruiter.marketplace_visibility ?? 'public',
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) dialog.showModal();
        else dialog.close();
    }, [isOpen]);

    useEffect(() => {
        setForm({
            bio: recruiter.bio ?? '',
            tagline: recruiter.tagline ?? '',
            location: recruiter.location ?? '',
            phone: recruiter.phone ?? '',
            years_experience: recruiter.years_experience ?? '',
            industries: (recruiter.industries ?? []).join(', '),
            specialties: (recruiter.specialties ?? []).join(', '),
            candidate_recruiter: recruiter.candidate_recruiter,
            company_recruiter: recruiter.company_recruiter,
            marketplace_enabled: recruiter.marketplace_enabled,
            marketplace_visibility: recruiter.marketplace_visibility ?? 'public',
        });
    }, [recruiter]);

    function parseList(value: string): string[] {
        return value.split(',').map(s => s.trim()).filter(Boolean);
    }

    async function handleSave() {
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/network/admin/recruiters/${recruiter.id}`, {
                bio: form.bio || null,
                tagline: form.tagline || null,
                location: form.location || null,
                phone: form.phone || null,
                years_experience: form.years_experience ? Number(form.years_experience) : null,
                industries: parseList(form.industries),
                specialties: parseList(form.specialties),
                candidate_recruiter: form.candidate_recruiter,
                company_recruiter: form.company_recruiter,
                marketplace_enabled: form.marketplace_enabled,
                marketplace_visibility: form.marketplace_visibility,
            });
            toast.success('Recruiter profile updated');
            onSuccess();
        } catch {
            toast.error('Failed to update recruiter');
        } finally {
            setSaving(false);
        }
    }

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-lg">
                <h3 className="font-black text-lg mb-4">Edit Recruiter Profile</h3>

                <div className="space-y-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tagline</legend>
                        <input
                            type="text"
                            className="input input-sm w-full"
                            value={form.tagline}
                            onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Bio</legend>
                        <textarea
                            className="textarea textarea-sm w-full min-h-20"
                            value={form.bio}
                            onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                        />
                    </fieldset>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Location</legend>
                            <input
                                type="text"
                                className="input input-sm w-full"
                                value={form.location}
                                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Phone</legend>
                            <input
                                type="text"
                                className="input input-sm w-full"
                                value={form.phone}
                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Years of Experience</legend>
                        <input
                            type="number"
                            className="input input-sm w-full"
                            value={form.years_experience}
                            onChange={(e) => setForm(f => ({ ...f, years_experience: e.target.value }))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Industries (comma-separated)</legend>
                        <input
                            type="text"
                            className="input input-sm w-full"
                            placeholder="Technology, Healthcare, Finance"
                            value={form.industries}
                            onChange={(e) => setForm(f => ({ ...f, industries: e.target.value }))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Specialties (comma-separated)</legend>
                        <input
                            type="text"
                            className="input input-sm w-full"
                            placeholder="Executive Search, Engineering, Sales"
                            value={form.specialties}
                            onChange={(e) => setForm(f => ({ ...f, specialties: e.target.value }))}
                        />
                    </fieldset>

                    <div className="divider text-xs text-base-content/40">Recruiter Type</div>

                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={form.candidate_recruiter}
                                onChange={(e) => setForm(f => ({ ...f, candidate_recruiter: e.target.checked }))}
                            />
                            <span className="text-sm">Candidate Recruiter</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={form.company_recruiter}
                                onChange={(e) => setForm(f => ({ ...f, company_recruiter: e.target.checked }))}
                            />
                            <span className="text-sm">Company Recruiter</span>
                        </label>
                    </div>

                    <div className="divider text-xs text-base-content/40">Marketplace</div>

                    <div className="flex items-center gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="checkbox"
                                className="toggle toggle-sm toggle-primary"
                                checked={form.marketplace_enabled}
                                onChange={(e) => setForm(f => ({ ...f, marketplace_enabled: e.target.checked }))}
                            />
                            <span className="text-sm">Marketplace Enabled</span>
                        </label>
                        <select
                            className="select select-sm"
                            value={form.marketplace_visibility}
                            onChange={(e) => setForm(f => ({ ...f, marketplace_visibility: e.target.value }))}
                            disabled={!form.marketplace_enabled}
                        >
                            <option value="public">Public</option>
                            <option value="limited">Limited</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                </div>

                <div className="modal-action">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                        {saving && <span className="loading loading-spinner loading-xs" />}
                        Save Changes
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
