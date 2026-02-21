// Types
export type {
    ParticipantDetails,
    UserSummary,
    Message,
    ConversationRow,
    ResyncData,
    Mailbox,
    ConversationFilters,
    ConversationStatusDisplay,
    ChatGatewayEvent,
} from "./types/chat-types";
export {
    getRequestStateDisplay,
    getOtherParticipant,
    getOtherUserId,
    formatMessageDate,
    getInitials,
} from "./types/chat-types";

// Hooks
export { useChatGateway } from "./hooks/use-chat-gateway";
export type { UseChatGatewayOptions } from "./hooks/use-chat-gateway";

// Lib
export { registerChatRefresh, requestChatRefresh } from "./lib/chat-refresh-queue";

// Context
export {
    ChatSidebarProvider,
    useChatSidebar,
    useChatSidebarOptional,
} from "./context/chat-sidebar-context";
export type {
    ChatSidebarState,
    ChatSidebarActions,
    ChatSidebarProviderProps,
} from "./context/chat-sidebar-context";

// Components
export { ChatSidebarShell } from "./components/chat-sidebar-shell";
export type { ChatSidebarShellProps } from "./components/chat-sidebar-shell";
export { ChatSidebarHeader } from "./components/chat-sidebar-header";
export { ChatSidebarList } from "./components/chat-sidebar-list";
export { ChatSidebarListItem } from "./components/chat-sidebar-list-item";
export { ChatSidebarThread } from "./components/chat-sidebar-thread";
