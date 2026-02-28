'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type NotificationType = 'system' | 'maintenance' | 'feature' | 'alert';
type NotificationSeverity = 'info' | 'warning' | 'critical';

type SiteNotification = {
    id?: string;
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message?: string;
    starts_at?: string;
    expires_at?: string;
    is_active: boolean;
    dismissible: boolean;
};

type NotificationFormProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initial?: { id?: string; type?: string; severity?: string; title?: string; message?: string; starts_at?: string; expires_at?: string; is_active?: boolean; dismissible?: boolean };
};

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'feature', label: 'Feature' },
    { value: 'alert', label: 'Alert' },
];

const SEVERITY_OPTIONS: { value: NotificationSeverity; label: string }[] = [
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'critical', label: 'Critical' },
];

const EMPTY: SiteNotification = {
    type: 'system',
    severity: 'info',
    title: '',
    message: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
    dismissible: true,
};

export function NotificationForm({ isOpen, onClose, onSuccess, initial }: NotificationFormProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [form, setForm] = useState<SiteNotification>({ ...EMPTY });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initial) {
            setForm({
                ...EMPTY,
                ...initial,
                type: (initial.type as NotificationType) ?? EMPTY.type,
                severity: (initial.severity as NotificationSeverity) ?? EMPTY.severity,
            });
        } else {
            setForm({ ...EMPTY });
        }
    }, [initial, isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) dialog.showModal();
        else dialog.close();
    }, [isOpen]);

    function set<K extends keyof SiteNotification>(key: K, value: SiteNotification[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            const payload = {
                type: form.type,
                severity: form.severity,
                title: form.title.trim(),
                message: form.message?.trim() || null,
                starts_at: form.starts_at || null,
                expires_at: form.expires_at || null,
                is_active: form.is_active,
                dismissible: form.dismissible,
            };
            if (initial?.id) {
                await client.patch(`/admin/notification/admin/site-notifications/${initial.id}`, payload);
                toast.success('Notification updated');
            } else {
                await client.post('/admin/notification/admin/site-notifications', payload);
                toast.success('Notification created');
            }
            onSuccess();
            onClose();
        } catch {
            toast.error('Failed to save notification');
        } finally {
            setLoading(false);
        }
    }

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-lg">
                <h3 className="font-black text-lg mb-4">
                    {initial?.id ? 'Edit Notification' : 'Create Notification'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <fieldset className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label label-text text-sm">Type</label>
                            <select className="select select-sm select-bordered w-full" value={form.type} onChange={(e) => set('type', e.target.value as NotificationType)}>
                                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label label-text text-sm">Severity</label>
                            <select className="select select-sm select-bordered w-full" value={form.severity} onChange={(e) => set('severity', e.target.value as NotificationSeverity)}>
                                {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </fieldset>

                    <fieldset>
                        <label className="label label-text text-sm">Title <span className="text-error">*</span></label>
                        <input
                            type="text"
                            className="input input-sm input-bordered w-full"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            required
                            maxLength={200}
                        />
                    </fieldset>

                    <fieldset>
                        <label className="label label-text text-sm">Message</label>
                        <textarea
                            className="textarea textarea-bordered textarea-sm w-full"
                            rows={3}
                            value={form.message ?? ''}
                            onChange={(e) => set('message', e.target.value)}
                            maxLength={1000}
                        />
                    </fieldset>

                    <fieldset className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label label-text text-sm">Starts At</label>
                            <input type="datetime-local" className="input input-sm input-bordered w-full" value={form.starts_at ?? ''} onChange={(e) => set('starts_at', e.target.value)} />
                        </div>
                        <div>
                            <label className="label label-text text-sm">Expires At</label>
                            <input type="datetime-local" className="input input-sm input-bordered w-full" value={form.expires_at ?? ''} onChange={(e) => set('expires_at', e.target.value)} />
                        </div>
                    </fieldset>

                    <fieldset className="flex items-center gap-6">
                        <label className="label cursor-pointer gap-2">
                            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
                            <span className="label-text text-sm">Active</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input type="checkbox" className="toggle toggle-sm" checked={form.dismissible} onChange={(e) => set('dismissible', e.target.checked)} />
                            <span className="label-text text-sm">Dismissible</span>
                        </label>
                    </fieldset>

                    <div className="modal-action mt-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !form.title.trim()}>
                            {loading && <span className="loading loading-spinner loading-xs" />}
                            {initial?.id ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button type="submit">close</button></form>
        </dialog>
    );
}
