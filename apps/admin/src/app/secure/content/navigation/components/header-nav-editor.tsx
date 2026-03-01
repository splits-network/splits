"use client";

import { useCallback } from "react";
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
import type { HeaderNavConfig, NavItem } from "@splits-network/shared-types";
import { NavItemCard } from "./nav-item-card";

interface HeaderNavEditorProps {
    config: HeaderNavConfig;
    onChange: (config: HeaderNavConfig) => void;
}

export function HeaderNavEditor({ config, onChange }: HeaderNavEditorProps) {
    const items = config.items;
    const ids = items.map((_, i) => `nav-item-${i}`);

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

            onChange({ items: arrayMove([...items], oldIndex, newIndex) });
        },
        [items, ids, onChange],
    );

    function handleItemChange(index: number, item: NavItem) {
        const updated = [...items];
        updated[index] = item;
        onChange({ items: updated });
    }

    function handleItemDelete(index: number) {
        onChange({ items: items.filter((_, i) => i !== index) });
    }

    function handleAddItem() {
        onChange({ items: [...items, { label: "", href: "" }] });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-base-content/70">
                    <i className="fa-duotone fa-regular fa-bars mr-2 text-primary"></i>
                    Header Nav Items ({items.length})
                </h3>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-primary btn-xs"
                >
                    <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                    Add Item
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 text-base-content/40 border border-dashed border-base-300 bg-base-200">
                    <p className="text-sm">No nav items yet</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <NavItemCard
                                    key={ids[index]}
                                    id={ids[index]}
                                    item={item}
                                    onChange={(updated) => handleItemChange(index, updated)}
                                    onDelete={() => handleItemDelete(index)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
