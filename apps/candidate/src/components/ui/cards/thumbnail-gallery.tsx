'use client';

export interface ThumbnailGalleryProps {
    /** Images to display */
    images: Array<{
        src: string;
        alt?: string;
        label?: string;
    }>;
    /** Max thumbnails to show */
    maxItems?: number;
}

export function ThumbnailGallery({ images, maxItems = 4 }: ThumbnailGalleryProps) {
    const displayImages = images.slice(0, maxItems);

    return (
        <div className="py-3">
            <div className="flex gap-2">
                {displayImages.map((img, index) => (
                    <div key={index} className="flex-1 space-y-1">
                        <div className="aspect-square rounded-lg overflow-hidden bg-base-200">
                            <img
                                src={img.src}
                                alt={img.alt || ''}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {img.label && (
                            <div className="text-xs text-base-content/50 text-center truncate">
                                {img.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
