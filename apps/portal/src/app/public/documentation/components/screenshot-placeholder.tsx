export function ScreenshotPlaceholder({
    title,
    description,
    variant,
    filename,
    imageSrc,
}: {
    title: string;
    description: string;
    variant: "desktop" | "mobile";
    filename: string;
    imageSrc?: string;
}) {
    const mockupClass =
        variant === "desktop" ? "mockup-browser border" : "mockup-phone border";
    return (
        <div className="space-y-3 rounded-xl border border-dashed border-base-300 p-4 bg-base-100">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-base-content">
                        {title}
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                        {description}
                    </div>
                </div>
                <span className="badge badge-outline badge-sm">{variant}</span>
            </div>
            <div className="flex justify-center">
                <div className={mockupClass}>
                    {variant === "desktop" ? (
                        <>
                            <div className="mockup-browser-toolbar">
                                <div className="input">splits.network</div>
                            </div>
                            <div className="bg-base-200 flex justify-center">
                                <img
                                    src={
                                        imageSrc ||
                                        "https://placehold.co/1200x800?text=Desktop+Screenshot+Placeholder"
                                    }
                                    alt={`${title} placeholder`}
                                    className="w-full max-w-3xl"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="mockup-phone-display">
                            <div className="mockup-browser">
                                <div className="bg-base-200 flex justify-center">
                                    <img
                                        src={
                                            imageSrc ||
                                            "https://placehold.co/600x1200?text=Mobile+Screenshot+Placeholder"
                                        }
                                        alt={`${title} placeholder`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="mockup-browser-toolbar px-6 py-4 bg-base-100 m-0">
                                    <div className="input input-lg">
                                        splits.network
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-xs text-base-content/60">
                Suggested filename:{" "}
                <span className="font-mono">{filename}</span>
            </div>
        </div>
    );
}
