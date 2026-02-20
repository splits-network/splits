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
import type { ContentBlock } from "@splits-network/shared-types";
import { SortableBlockCard } from "./sortable-block-card";

interface BlockPanelProps {
    blocks: ContentBlock[];
    blockIds: string[];
    onBlocksChange: (blocks: ContentBlock[], ids: string[]) => void;
    onAddBlock: () => void;
    onEditBlock: (index: number) => void;
    onDeleteBlock: (index: number) => void;
}

export function BlockPanel({
    blocks,
    blockIds,
    onBlocksChange,
    onAddBlock,
    onEditBlock,
    onDeleteBlock,
}: BlockPanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = blockIds.indexOf(String(active.id));
            const newIndex = blockIds.indexOf(String(over.id));
            if (oldIndex === -1 || newIndex === -1) return;

            const newBlocks = arrayMove([...blocks], oldIndex, newIndex);
            const newIds = arrayMove([...blockIds], oldIndex, newIndex);
            onBlocksChange(newBlocks, newIds);
        },
        [blocks, blockIds, onBlocksChange],
    );

    return (
        <div className="w-96 flex-shrink-0 flex flex-col border-r border-base-300 bg-base-200">
            {/* Header */}
            <div className="p-3 border-b border-base-300 bg-base-100 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Blocks ({blocks.length})
                </span>
                <button
                    type="button"
                    onClick={onAddBlock}
                    className="btn btn-primary btn-xs"
                >
                    <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                    Add Block
                </button>
            </div>

            {/* Block list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {blocks.length === 0 ? (
                    <div className="text-center py-12 text-base-content/40">
                        <i className="fa-duotone fa-regular fa-layer-group text-3xl mb-2 block"></i>
                        <p className="text-sm">No blocks yet</p>
                        <p className="text-xs mt-1">Click "Add Block" to start building</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                            {blocks.map((block, index) => (
                                <SortableBlockCard
                                    key={blockIds[index]}
                                    id={blockIds[index]}
                                    block={block}
                                    index={index}
                                    onEdit={() => onEditBlock(index)}
                                    onDelete={() => onDeleteBlock(index)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
