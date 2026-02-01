import { ReactNode } from 'react';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

/**
 * Generic browse component types for master-detail split view pattern
 */

export interface BrowseListItem {
    id: string;
    [key: string]: any;
}

export interface BrowseFilters extends Record<string, any> {
    // Base filters - domains can extend this
}

export interface BrowseProps<T extends BrowseListItem, F extends BrowseFilters> {
    // Data fetching
    fetchFn: (params: StandardListParams & F) => Promise<StandardListResponse<T>>;
    defaultFilters?: F;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    
    // Rendering
    renderListItem: (item: T, isSelected: boolean, onSelect: (id: string) => void) => ReactNode;
    renderDetail: (id: string | null, onClose: () => void) => ReactNode;
    
    // UI Customization
    searchPlaceholder?: string;
    emptyStateIcon?: string;
    emptyStateMessage?: string;
    listHeader?: ReactNode;
    
    // Tabs (optional)
    tabs?: {
        key: string;
        label: string;
        filterValue?: any;
        filterKey?: keyof F;
    }[];
    defaultActiveTab?: string;
    
    // Filters
    renderFilters?: (filters: F, onChange: (filters: F) => void) => ReactNode;
    
    // Actions
    actions?: ReactNode;
    
    // URL management
    urlParamName?: string; // Default: 'id'
    
    // Responsive behavior
    listPanelWidth?: string; // Default: 'w-full md:w-96 lg:w-[420px]'
}

export interface BrowseDetailProps {
    id: string | null;
    onClose: () => void;
    children: ReactNode;
    
    // Loading/error states
    loading?: boolean;
    error?: string | null;
    
    // Empty state customization  
    emptyIcon?: string;
    emptyMessage?: string;
}

export interface BrowseListPanelProps<T extends BrowseListItem, F extends BrowseFilters> {
    // Core props
    selectedId: string | null;
    onSelect: (id: string) => void;
    
    // Data
    fetchFn: (params: StandardListParams & F) => Promise<StandardListResponse<T>>;
    defaultFilters?: F;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    
    // Rendering
    renderListItem: (item: T, isSelected: boolean, onSelect: (id: string) => void) => ReactNode;
    renderFilters?: (filters: F, onChange: (filters: F) => void) => ReactNode;
    
    // UI
    searchPlaceholder?: string;
    listHeader?: ReactNode;
    actions?: ReactNode;
    
    // Tabs
    tabs?: {
        key: string;
        label: string;
        filterValue?: any;
        filterKey?: keyof F;
    }[];
    defaultActiveTab?: string;
    
    // Style
    className?: string;
    listPanelWidth?: string;
}

export interface BrowseFilterDropdownProps<F extends BrowseFilters> {
    filters: F;
    onChange: (filters: F) => void;
    preserveFilters?: (keyof F)[]; // Filters to preserve when resetting
    children: ReactNode; // Filter form content
}