"use client";

import { VisibilityToggle } from "./visibility-toggle";

interface EntryCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    metadata?: string;
    visible_to_matching?: boolean;
    onToggleVisibility?: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function EntryCard({
    title,
    subtitle,
    description,
    metadata,
    visible_to_matching = true,
    onToggleVisibility,
    onEdit,
    onDelete,
}: EntryCardProps) {
    return (
        <div className="border border-base-300 bg-base-100 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-base-content truncate">
                        {title}
                    </h4>
                    {subtitle && (
                        <p className="text-xs text-base-content/50 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                    {metadata && (
                        <p className="text-xs text-base-content/40 mt-0.5">
                            {metadata}
                        </p>
                    )}
                    {description && (
                        <p className="text-sm text-base-content/70 mt-2 line-clamp-3">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {onToggleVisibility && (
                        <VisibilityToggle
                            visible={visible_to_matching}
                            onToggle={onToggleVisibility}
                        />
                    )}
                    <button
                        type="button"
                        onClick={onEdit}
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                    >
                        <i className="fa-duotone fa-regular fa-trash" />
                    </button>
                </div>
            </div>
        </div>
    );
}
