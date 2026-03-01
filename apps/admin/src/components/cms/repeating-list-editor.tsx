"use client";

import { useCallback, useMemo } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { SortableItemWrapper } from "./sortable-item-wrapper";
import type { ReactNode } from "react";

interface RepeatingListEditorProps<T> {
    items: T[];
    onChange: (items: T[]) => void;
    renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
    defaultItem: () => T;
    addLabel: string;
    className?: string;
    itemIds?: string[];
}

export function RepeatingListEditor<T>({
    items,
    onChange,
    renderItem,
    defaultItem,
    addLabel,
    className,
    itemIds: externalIds,
}: RepeatingListEditorProps<T>) {
    const ids = useMemo(
        () => externalIds ?? items.map((_, i) => `item-${i}`),
        [externalIds, items],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = ids.indexOf(String(active.id));
            const newIndex = ids.indexOf(String(over.id));
            if (oldIndex === -1 || newIndex === -1) return;

            onChange(arrayMove([...items], oldIndex, newIndex));
        },
        [ids, items, onChange],
    );

    const handleUpdate = useCallback(
        (index: number, patch: Partial<T>) => {
            const updated = [...items];
            updated[index] = { ...updated[index], ...patch };
            onChange(updated);
        },
        [items, onChange],
    );

    const handleDelete = useCallback(
        (index: number) => {
            onChange(items.filter((_, i) => i !== index));
        },
        [items, onChange],
    );

    const handleAdd = useCallback(() => {
        onChange([...items, defaultItem()]);
    }, [items, onChange, defaultItem]);

    return (
        <div className={className}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <SortableItemWrapper key={ids[index]} id={ids[index]}>
                                {({ dragHandleProps }) => (
                                    <div className="flex items-start gap-2 bg-base-100 border border-base-300 p-3 group">
                                        <button
                                            type="button"
                                            ref={dragHandleProps.ref}
                                            {...dragHandleProps.listeners}
                                            {...dragHandleProps.attributes}
                                            className="mt-2 cursor-grab active:cursor-grabbing text-base-content/30 hover:text-base-content/60 transition-colors"
                                            tabIndex={-1}
                                        >
                                            <i className="fa-duotone fa-regular fa-grip-dots-vertical"></i>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            {renderItem(item, index, (patch) =>
                                                handleUpdate(index, patch),
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(index)}
                                            className="mt-2 btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove"
                                        >
                                            <i className="fa-duotone fa-regular fa-trash-can"></i>
                                        </button>
                                    </div>
                                )}
                            </SortableItemWrapper>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                type="button"
                onClick={handleAdd}
                className="btn btn-ghost btn-sm mt-3 text-primary"
            >
                <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                {addLabel}
            </button>
        </div>
    );
}
