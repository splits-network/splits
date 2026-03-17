// Navigation components
export {
    UserDropdown,
    type UserDropdownProps,
    type UserDropdownMenuItem,
    type UserDropdownRole,
    BaselSidebar,
    type BaselSidebarProps,
    type BaselSidebarNavItem,
    type BaselSidebarSection,
} from './navigation';

// Layout components
export {
    BaselHeader,
    type BaselHeaderProps,
    BaselFooter,
    type BaselFooterProps,
    BaselSplitView,
    type BaselSplitViewProps,
} from './layout';

// Service status components
export {
    ServiceStatusBanner,
    ServiceStatusProvider,
    ServiceStatusDebugger,
    useSiteNotifications,
    type ServiceStatusBannerProps,
    type ServiceStatusProviderProps,
    type SiteNotification,
} from './service-status';

// Theme components
export {
    ThemeProvider,
    useTheme,
    ThemeScript,
    ThemeToggle,
    type ThemeToggleProps,
} from './theme';

// Modal components
export {
    BaselModal,
    type BaselModalProps,
    BaselModalHeader,
    type BaselModalHeaderProps,
    type BaselModalHeaderVariant,
    BaselModalBody,
    type BaselModalBodyProps,
    BaselModalFooter,
    type BaselModalFooterProps,
    BaselAlertBox,
    type BaselAlertBoxProps,
    type BaselAlertVariant,
    BaselConfirmModal,
    type BaselConfirmModalProps,
    BaselWizardModal,
    type BaselWizardModalProps,
    type BaselWizardStep,
    BaselPromptModal,
    type BaselPromptModalProps,
} from './modals';

// Button components
export {
    Button,
    type ButtonProps,
    ExpandableButton,
    type ExpandableButtonProps,
    type SpeedDialAction,
    SpeedMenu,
    type SpeedMenuProps,
} from './buttons';

// Form components
export {
    BaselFieldError,
    type BaselFieldErrorProps,
    BaselFormField,
    type BaselFormFieldProps,
    BaselChipGroup,
    type BaselChipGroupProps,
    BaselRadioCardGroup,
    type BaselRadioCardGroupProps,
    type BaselRadioCardOption,
    BaselFileUpload,
    type BaselFileUploadProps,
    BaselStepIndicator,
    type BaselStepIndicatorProps,
    type BaselStepDef,
    BaselReviewSection,
    type BaselReviewSectionProps,
    type BaselReviewItem,
    BaselProgressSidebar,
    type BaselProgressSidebarProps,
    type BaselProgressStep,
    BaselSkillPicker,
    type BaselSkillPickerProps,
    type SkillOption,
} from './forms';

// Display components
export {
    BaselBadge,
    type BaselBadgeProps,
    type BaselBadgeVariant,
    type BaselBadgeSize,
    BaselStatusPill,
    type BaselStatusPillProps,
    type BaselStatusColor,
    BaselKpiCard,
    type BaselKpiCardProps,
    BaselEmptyState,
    type BaselEmptyStateProps,
    type BaselEmptyStateAction,
    type BaselEmptyStateStep,
    BaselTabBar,
    type BaselTabBarProps,
    type BaselTab,
    BaselVerticalTabBar,
    type BaselVerticalTabBarProps,
    BaselKeyValueList,
    type BaselKeyValueListProps,
    type BaselKeyValueItem,
    BaselTimeline,
    BaselTimelineItem,
    type BaselTimelineProps,
    type BaselTimelineItemProps,
    type BaselTimelineItemData,
    BaselToggleRow,
    type BaselToggleRowProps,
    BaselSectionHeading,
    type BaselSectionHeadingProps,
    BaselSidebarCard,
    type BaselSidebarCardProps,
    BaselChartCard,
    type BaselChartCardProps,
    BaselActivityItem,
    type BaselActivityItemProps,
    BaselMicroStat,
    type BaselMicroStatProps,
    BaselCheckList,
    type BaselCheckListProps,
    BaselSeparatorLabel,
    type BaselSeparatorLabelProps,
    BaselAvatar,
    type BaselAvatarProps,
    type BaselAvatarSize,
    type BaselPresenceStatus,
    BaselLevelIndicator,
    type BaselLevelIndicatorProps,
} from './display';

// Content components (CMS article renderer + block components)
export {
    BaselArticleRenderer,
    type BaselArticleRendererProps,
    BaselArticleAnimated,
    type BaselArticleAnimatedProps,
    BaselArticleAnimationWrapper,
    type BaselArticleAnimationWrapperProps,
} from './content';

// CSS animation hooks
export {
    useScrollReveal,
    useAnimatedCounter,
} from './animations';

// Consent components
export {
    BaselCookieConsent,
    type BaselCookieConsentProps,
    readConsentCookie,
    writeConsentCookie,
    type ConsentPreferences,
} from './consent';

// List components (controls-bar, view mode, results count, filters)
export {
    type BaselViewMode,
    BaselControlsBarShell,
    type BaselControlsBarShellProps,
    BaselViewModeSelector,
    type BaselViewModeSelectorProps,
    BaselResultsCount,
    type BaselResultsCountProps,
    BaselRefreshButton,
    type BaselRefreshButtonProps,
    BaselScopeToggle,
    type BaselScopeToggleProps,
    BaselFilterSelect,
    type BaselFilterSelectProps,
    BaselSortSelect,
    type BaselSortSelectProps,
    type BaselSortOption,
    BaselExpandToggle,
    type BaselExpandToggleProps,
    BaselPageHeader,
    type BaselPageHeaderProps,
    type BaselPageHeaderStat,
} from './lists';

// Panel components (detail panel header, tabs)
export {
    PanelHeader,
    type PanelHeaderProps,
    type PanelStat,
    type PanelHeaderBadge,
    type PanelHeaderMeta,
    PanelTabs,
    type PanelTabsProps,
    type PanelTab,
} from './panels';

// Toast components
export {
    BaselToastProvider,
    useBaselToast,
    BaselToastItem,
    type BaselToastType,
    type BaselToastOptions,
    type BaselToastData,
    type BaselToastAction,
} from './toast';

// Color utilities
export {
    type BaselSemanticColor,
    type BaselInteractiveColor,
    semanticText,
    semanticBg,
    semanticBg10,
    semanticBg5,
    semanticBorder,
    semanticPill,
    semanticBtn,
    semanticToggle,
    semanticRadio,
    semanticCheckbox,
    semanticChip,
} from './utils/colors';

// Application stage display
export {
    getStageDisplay,
    type StageDisplay,
    type StageDisplayOptions,
} from './utils/application-stage';
