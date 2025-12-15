import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'table';

/**
 * Custom hook to manage and persist view mode (grid/table) preference in localStorage
 * @param storageKey - Unique key for localStorage (e.g., 'rolesViewMode')
 * @param defaultMode - Default view mode if none is stored (defaults to 'grid')
 * @returns [viewMode, setViewMode] tuple
 */
export function useViewMode(
    storageKey: string,
    defaultMode: ViewMode = 'grid'
): [ViewMode, (mode: ViewMode) => void] {
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        // Initialize from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            return (saved === 'grid' || saved === 'table') ? saved : defaultMode;
        }
        return defaultMode;
    });

    // Persist view mode to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, viewMode);
        }
    }, [viewMode, storageKey]);

    return [viewMode, setViewModeState];
}
