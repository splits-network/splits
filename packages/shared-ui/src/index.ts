export { MarkdownEditor, type MarkdownEditorProps, markdownToolbarCommands } from './markdown/markdown-editor';
export { MarkdownRenderer, type MarkdownRendererProps, markdownRenderConfig } from './markdown/markdown-renderer';
export { JsonLd } from './seo/json-ld';

// Browse components
export { BrowseLayout } from './browse/browse-layout';
export { BrowseListPanel, createBrowseListPanel } from './browse/list-panel';
export { BrowseDetailPanel } from './browse/detail-panel';
export { BrowseFilterDropdown } from './browse/filter-dropdown';
export {
    createBrowseComponents,
    createFilterField,
    type UseStandardListResult,
    type UseStandardListConfig
} from './browse/hooks';
export type {
    BrowseProps,
    BrowseFilters,
    BrowseListItem,
    BrowseDetailProps,
    BrowseListPanelProps,
    BrowseFilterDropdownProps
} from './browse/types';
// Service status
export {
    ServiceStatusBanner,
    SiteNotificationBanner,
    type ServiceStatusBannerProps,
    useServiceHealth,
    type ServiceHealth,
    useSiteNotifications,
    type SiteNotification,
    getGatewayBaseUrl,
} from './service-status';

// Loading components
export {
    LoadingSpinner,
    LoadingState,
    SkeletonLoader,
    SkeletonList,
    ButtonLoading,
    ModalLoadingOverlay,
    ChartLoadingState,
    SplashLoading,
    SIZE_GUIDELINES,
    COLOR_GUIDELINES,
    type LoadingSpinnerProps,
    type LoadingStateProps,
    type SkeletonLoaderProps,
    type SkeletonListProps,
    type SkeletonVariant,
    type ButtonLoadingProps,
    type ModalLoadingOverlayProps,
    type ChartLoadingStateProps,
    type SplashLoadingProps,
    type SpinnerSize,
    type SpinnerType,
    type LoadingColor,
} from './loading';

// Application Timeline components
export {
    ApplicationTimelinePanel,
    PipelineProgress,
    ActivityFeed,
    interpretAuditLog,
    STAGE_DISPLAY_NAMES,
    ROLE_DISPLAY_NAMES,
    DIRECT_PIPELINE_STAGES,
    RECRUITER_PIPELINE_STAGES,
    type ApplicationTimelinePanelProps,
    type AuditLogEntry,
    type TimelineEvent,
    type ViewerRole,
} from './application-timeline';

// Portal components
export { ModalPortal } from './portal/modal-portal';

// Safe Modal components (React 19 compatible)
export {
    SafeModal,
    SafeModalHeader,
    SafeModalActions,
    type SafeModalProps,
} from './components/SafeModal';

// Note: DevDebugPanel moved to apps/portal/src/components/dev-debug-panel.tsx
// because it depends on Clerk hooks which cause duplicate-instance issues
// when imported cross-package via transpilePackages.

// Activity tracker
export { ActivityTracker, type ActivityTrackerProps } from './activity';

// Application Notes components
export {
    ApplicationNotesPanel,
    ApplicationNoteItem,
    AddNoteForm,
    NOTE_TYPE_CONFIG,
    CREATOR_TYPE_CONFIG,
    VISIBILITY_CONFIG,
    type ApplicationNotesPanelProps,
    type ApplicationNoteItemProps,
    type AddNoteFormProps,
    type ApplicationNotesConfig,
    type CreateNoteData,
    type UpdateNoteData,
} from './application-notes';
