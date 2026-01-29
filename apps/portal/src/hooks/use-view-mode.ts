import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'table' | 'browse';

/**
 * Custom hook to manage and persist view mode (grid/table/browse) preference in localStorage
 * @param storageKey - Unique key for localStorage (e.g., 'rolesViewMode')
 * @param defaultMode - Default view mode if none is stored (defaults to 'grid')
 * @returns Object with viewMode, setViewMode, cycleView, and isLoaded
 */
export function useViewMode(
    storageKey: string,
    defaultMode: ViewMode = 'grid'
) {
    const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved && ['grid', 'table', 'browse'].includes(saved)) {
            setViewModeState(saved as ViewMode);
        }
        setIsLoaded(true);
    }, [storageKey]);

    // Save to localStorage when view changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(storageKey, viewMode);
        }
    }, [viewMode, storageKey, isLoaded]);

    const cycleView = () => {
        setViewModeState(prev => {
            switch (prev) {
                case 'grid': return 'table';
                case 'table': return 'browse';
                case 'browse': return 'grid';
                default: return 'grid';
            }
        });
    };

    return {
        viewMode,
        setViewMode: setViewModeState,
        cycleView,
        isLoaded
    };
}
