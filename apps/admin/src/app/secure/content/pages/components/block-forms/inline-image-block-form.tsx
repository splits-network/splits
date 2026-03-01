"use client";

import { useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";

interface InlineImageBlock {
    type: "inline-image";
    image: string;
    imageAlt: string;
    caption?: string;
    height?: string;
}

interface Props {
    block: InlineImageBlock | null;
    onSave: (block: InlineImageBlock) => void;
}

export function InlineImageBlockForm({ block, onSave }: Props) {
    const [image, setImage] = useState(block?.image ?? "");
    const [imageAlt, setImageAlt] = useState(block?.imageAlt ?? "");
    const [caption, setCaption] = useState(block?.caption ?? "");
    const [height, setHeight] = useState(block?.height ?? "");

    function handleSave() {
        onSave({
            type: "inline-image",
            image,
            imageAlt,
            caption: caption || undefined,
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
                    placeholder="https://example.com/image.jpg"
                />
            </BaselFormField>

            <BaselFormField label="Alt Text" required hint="Descriptive text for screen readers and SEO">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="A photo of the team at our annual retreat"
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

            <BaselFormField label="Height" hint="CSS height value for the image container (e.g. 45vh, 400px)">
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
