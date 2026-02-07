import Image from "next/image";

export interface UserAvatarProps {
    user: {
        name?: string;
        firstName?: string;
        username?: string;
        profile_image_url?: string;
        imageUrl?: string;
    };
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    showRing?: boolean;
}

const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
};

const iconSizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
};

const imageSizes = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
};

export function UserAvatar({
    user,
    size = "md",
    className = "",
    showRing = true,
}: UserAvatarProps) {
    const imageUrl = user.profile_image_url || user.imageUrl;
    const userName = user.name || user.firstName || user.username || "";

    const ringClass = showRing
        ? "ring ring-primary ring-offset-base-100 ring-offset-1"
        : "";

    return (
        <div className={`avatar ${className}`}>
            <div
                className={`${sizeClasses[size]} rounded-full ${ringClass}`}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={userName || "User"}
                        width={imageSizes[size]}
                        height={imageSizes[size]}
                        className="rounded-full object-cover"
                        unoptimized={!imageUrl.includes("supabase")}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-base-200 rounded-full">
                        <i
                            className={`fa-duotone fa-regular fa-user ${iconSizes[size]} text-base-content/60`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
