interface CameraOffFallbackProps {
    name: string;
    avatarUrl?: string;
}

export function CameraOffFallback({ name, avatarUrl }: CameraOffFallbackProps) {
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col items-center justify-center h-full bg-base-300">
            <div className="avatar">
                <div className="w-24 rounded-full">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} />
                    ) : (
                        <div className="bg-primary text-primary-content flex items-center justify-center text-3xl font-bold w-24 h-24 rounded-full">
                            {initial}
                        </div>
                    )}
                </div>
            </div>
            <p className="mt-4 text-lg font-medium text-base-content">{name}</p>
        </div>
    );
}
