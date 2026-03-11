'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { BaselFormField } from '@splits-network/basel-ui';

/* ─── Types ────────────────────────────────────────────────────────── */

interface CallTag {
    slug: string;
    label: string;
}

interface TagPickerProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

/* ─── Component ────────────────────────────────────────────────────── */

export function TagPicker({ selectedTags, onChange }: TagPickerProps) {
    const { getToken } = useAuth();
    const [tags, setTags] = useState<CallTag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get('/calls/tags') as { data: CallTag[] };
                setTags(res.data || []);
            } catch {
                setTags([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTag = (slug: string) => {
        if (selectedTags.includes(slug)) {
            onChange(selectedTags.filter((t) => t !== slug));
        } else {
            onChange([...selectedTags, slug]);
        }
    };

    if (loading) {
        return (
            <BaselFormField label="Tags" hint="Optional">
                <div className="flex gap-2">
                    <span className="loading loading-dots loading-sm" />
                </div>
            </BaselFormField>
        );
    }

    if (tags.length === 0) return null;

    return (
        <BaselFormField label="Tags" hint="Optional">
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.slug);
                    return (
                        <button
                            key={tag.slug}
                            type="button"
                            className={`badge badge-lg cursor-pointer transition-colors ${
                                isSelected
                                    ? 'badge-primary'
                                    : 'badge-outline hover:badge-primary hover:badge-outline'
                            }`}
                            onClick={() => toggleTag(tag.slug)}
                        >
                            {tag.label}
                        </button>
                    );
                })}
            </div>
        </BaselFormField>
    );
}
