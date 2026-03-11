'use client';

/* ─── Types ────────────────────────────────────────────────────────── */

interface EntityLink {
    entity_type: string;
}

interface CallTypeSelectorProps {
    value: string;
    onChange: (slug: string) => void;
    entityLinks?: EntityLink[];
}

const CALL_TYPE_OPTIONS = [
    { value: 'interview', label: 'Interview' },
    { value: 'recruiting_call', label: 'Recruiting Call' },
    { value: 'client_meeting', label: 'Client Meeting' },
    { value: 'internal_call', label: 'Internal Call' },
];

/* ─── Helper ────────────────────────────────────────────────────────── */

export function inferCallType(entityLinks?: EntityLink[]): string {
    if (!entityLinks || entityLinks.length === 0) return 'recruiting_call';
    if (entityLinks.some((e) => e.entity_type === 'application')) return 'interview';
    if (entityLinks.some((e) => e.entity_type === 'company')) return 'client_meeting';
    return 'recruiting_call';
}

/* ─── Component ────────────────────────────────────────────────────── */

export function CallTypeSelector({ value, onChange }: CallTypeSelectorProps) {
    return (
        <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                Call Type
            </legend>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="select w-full"
            >
                {CALL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </fieldset>
    );
}
