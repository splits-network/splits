"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

interface SortableItemWrapperProps {
    id: string;
    children: (props: {
        dragHandleProps: {
            ref: (node: HTMLElement | null) => void;
            listeners: Record<string, Function> | undefined;
            attributes: Record<string, any>;
        };
        isDragging: boolean;
    }) => ReactNode;
    className?: string;
}

export function SortableItemWrapper({ id, children, className }: SortableItemWrapperProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={className}>
            {children({
                dragHandleProps: {
                    ref: setActivatorNodeRef,
                    listeners,
                    attributes,
                },
                isDragging,
            })}
        </div>
    );
}
