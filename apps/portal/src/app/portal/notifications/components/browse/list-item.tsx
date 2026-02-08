import {
    InAppNotification,
    formatNotificationTime,
    getNotificationIcon,
} from "@/lib/notifications";

interface NotificationListItemProps {
    item: InAppNotification;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function NotificationListItem({
    item,
    isSelected,
    onSelect,
}: NotificationListItemProps) {
    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative flex gap-2.5 px-3 py-2.5 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : !item.read
                          ? "bg-primary/5 border-l-4 border-l-primary/40"
                          : "border-l-4 border-l-transparent"
                }
            `}
        >
            {/* Icon */}
            <div className="shrink-0">
                <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs
                    ${!item.read ? "bg-primary text-primary-content" : "bg-base-300"}
                `}
                >
                    <i
                        className={`fa-duotone fa-regular ${getNotificationIcon(item.category)}`}
                    ></i>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={`text-xs leading-snug line-clamp-2 ${!item.read ? "font-semibold" : "text-base-content/80"}`}
                    >
                        {item.subject}
                    </p>
                    {!item.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1"></div>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-base-content/50">
                        {formatNotificationTime(item.created_at)}
                    </span>
                    {item.category && (
                        <span className="badge badge-xs badge-ghost">
                            {item.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
