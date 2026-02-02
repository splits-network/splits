"use client";

import { useState, useCallback, useMemo } from "react";

interface UseBulkSelectionOptions<T> {
    items: T[];
    getItemId: (item: T) => string;
}

interface UseBulkSelectionReturn<T> {
    selectedIds: Set<string>;
    selectedCount: number;
    selectedItems: T[];
    isSelected: (id: string) => boolean;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    toggleItem: (id: string) => void;
    toggleAll: () => void;
    selectAll: () => void;
    clearSelection: () => void;
    selectItems: (ids: string[]) => void;
}

export function useBulkSelection<T>({
    items,
    getItemId,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const itemIds = useMemo(
        () => new Set(items.map(getItemId)),
        [items, getItemId]
    );

    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(items.map(getItemId)));
    }, [items, getItemId]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const toggleAll = useCallback(() => {
        setSelectedIds((prev) => {
            // If all items are selected, deselect all
            if (prev.size === items.length && items.length > 0) {
                return new Set();
            }
            // Otherwise select all
            return new Set(items.map(getItemId));
        });
    }, [items, getItemId]);

    const selectItems = useCallback((ids: string[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const isSelected = useCallback(
        (id: string) => selectedIds.has(id),
        [selectedIds]
    );

    const selectedItems = useMemo(
        () => items.filter((item) => selectedIds.has(getItemId(item))),
        [items, selectedIds, getItemId]
    );

    // Filter out selected IDs that are no longer in the items list
    const validSelectedIds = useMemo(() => {
        const valid = new Set<string>();
        selectedIds.forEach((id) => {
            if (itemIds.has(id)) {
                valid.add(id);
            }
        });
        return valid;
    }, [selectedIds, itemIds]);

    const isAllSelected = useMemo(
        () => validSelectedIds.size === items.length && items.length > 0,
        [validSelectedIds, items]
    );

    const isSomeSelected = useMemo(
        () => validSelectedIds.size > 0,
        [validSelectedIds]
    );

    return {
        selectedIds: validSelectedIds,
        selectedCount: validSelectedIds.size,
        selectedItems,
        isSelected,
        isAllSelected,
        isSomeSelected,
        toggleItem,
        toggleAll,
        selectAll,
        clearSelection,
        selectItems,
    };
}
