"use client";

import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselFormField,
} from "@splits-network/basel-ui";
import type { ContentApp } from "@splits-network/shared-types";

export interface PageMetaForm {
    title: string;
    slug: string;
    description: string;
    og_image: string;
    category: string;
    author: string;
    read_time: string;
    app: ContentApp;
}

interface PageSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    meta: PageMetaForm;
    onChange: (meta: PageMetaForm) => void;
}

export function PageSettingsModal({ isOpen, onClose, meta, onChange }: PageSettingsModalProps) {
    function update(patch: Partial<PageMetaForm>) {
        onChange({ ...meta, ...patch });
    }

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
            <BaselModalHeader
                title="Page Settings"
                icon="fa-gear"
                iconColor="primary"
                onClose={onClose}
            />
            <BaselModalBody>
                <div className="space-y-4">
                    <BaselFormField label="Title" required>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={meta.title}
                            onChange={(e) => update({ title: e.target.value })}
                        />
                    </BaselFormField>

                    <BaselFormField label="Slug" required hint="URL path segment">
                        <input
                            type="text"
                            className="input input-bordered w-full font-mono text-sm"
                            value={meta.slug}
                            onChange={(e) => update({ slug: e.target.value })}
                        />
                    </BaselFormField>

                    <BaselFormField label="Description" hint="SEO meta description">
                        <textarea
                            className="textarea textarea-bordered w-full h-20"
                            value={meta.description}
                            onChange={(e) => update({ description: e.target.value })}
                        />
                    </BaselFormField>

                    <BaselFormField label="OG Image URL" hint="Social sharing preview image">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={meta.og_image}
                            onChange={(e) => update({ og_image: e.target.value })}
                            placeholder="https://..."
                        />
                    </BaselFormField>

                    <div className="grid grid-cols-2 gap-4">
                        <BaselFormField label="Category">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={meta.category}
                                onChange={(e) => update({ category: e.target.value })}
                                placeholder="marketing"
                            />
                        </BaselFormField>

                        <BaselFormField label="App" hint="Read-only after creation">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={meta.app}
                                disabled
                            />
                        </BaselFormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <BaselFormField label="Author">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={meta.author}
                                onChange={(e) => update({ author: e.target.value })}
                                placeholder="Author name"
                            />
                        </BaselFormField>

                        <BaselFormField label="Read Time">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={meta.read_time}
                                onChange={(e) => update({ read_time: e.target.value })}
                                placeholder="5 min read"
                            />
                        </BaselFormField>
                    </div>
                </div>
            </BaselModalBody>
            <BaselModalFooter align="end">
                <button className="btn btn-primary" onClick={onClose}>
                    Done
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
