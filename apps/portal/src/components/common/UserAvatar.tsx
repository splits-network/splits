import Image from "next/image";

interface UserAvatarProps {
    user: {
        name?: string;
        firstName?: string;
        username?: string;
        profile_image_url?: string;
        imageUrl?: string; // Clerk's image URL for fallback
    };
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export default function UserAvatar({
    user,
    size = "md",
    className = "",
}: UserAvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
    };

    const iconSizes = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
    };

    const imageSizes = {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96,
    };

    // Prioritize our profile_image_url over Clerk's imageUrl for performance
    const imageUrl = user.profile_image_url || user.imageUrl;
    const userName = user.name || user.firstName || user.username || "";

    return (
        <div className={`avatar ${className}`}>
            <div
                className={`${sizeClasses[size]} rounded-full ring ring-primary ring-offset-base-100 ring-offset-1`}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={userName || "User"}
                        width={imageSizes[size]}
                        height={imageSizes[size]}
                        className="rounded-full object-cover"
                        unoptimized={
                            imageUrl.includes("supabase") ? false : true
                        } // Optimize for Supabase CDN
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-base-200 rounded-full">
                        <i
                            className={`fa-duotone fa-regular fa-user ${iconSizes[size]} text-base-content/60`}
                        ></i>
                    </div>
                )}
            </div>
        </div>
    );
}
