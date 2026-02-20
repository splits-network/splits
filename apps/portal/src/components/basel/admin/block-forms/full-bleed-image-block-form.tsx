"use client";

import { useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";

interface FullBleedImageBlock {
    type: "full-bleed-image";
    image: string;
    imageAlt: string;
    caption?: string;
    overlayText?: string;
    overlayAccentText?: string;
    height?: string;
}

interface Props {
    block: FullBleedImageBlock | null;
    onSave: (block: FullBleedImageBlock) => void;
}

export function FullBleedImageBlockForm({ block, onSave }: Props) {
    const [image, setImage] = useState(block?.image ?? "");
    const [imageAlt, setImageAlt] = useState(block?.imageAlt ?? "");
    const [caption, setCaption] = useState(block?.caption ?? "");
    const [overlayText, setOverlayText] = useState(block?.overlayText ?? "");
    const [overlayAccentText, setOverlayAccentText] = useState(block?.overlayAccentText ?? "");
    const [height, setHeight] = useState(block?.height ?? "");

    function handleSave() {
        onSave({
            type: "full-bleed-image",
            image,
            imageAlt,
            caption: caption || undefined,
            overlayText: overlayText || undefined,
            overlayAccentText: overlayText && overlayAccentText ? overlayAccentText : undefined,
            height: height || undefined,
        });
    }

    const canSave = image.trim() && imageAlt.trim();

    return (
        <div className="space-y-5">
            <BaselFormField label="Image URL" required hint="Full URL to the image file">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                />
            </BaselFormField>

            <BaselFormField label="Alt Text" required hint="Descriptive text for screen readers and SEO">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Full width landscape photograph of…"
                />
            </BaselFormField>

            <BaselFormField label="Caption" hint="Optional caption displayed below the image">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Photo caption…"
                />
            </BaselFormField>

            <BaselFormField label="Overlay Text" hint="Large text rendered on top of the image">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="A bold headline over the image"
                />
            </BaselFormField>

            {overlayText.trim() && (
                <BaselFormField
                    label="Overlay Accent Text"
                    hint="Secondary accent text shown alongside the overlay text"
                >
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={overlayAccentText}
                        onChange={(e) => setOverlayAccentText(e.target.value)}
                        placeholder="A supporting accent phrase"
                    />
                </BaselFormField>
            )}

            <BaselFormField label="Height" hint="CSS height value for the image container (e.g. 45vh, 600px)">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="45vh"
                />
            </BaselFormField>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
