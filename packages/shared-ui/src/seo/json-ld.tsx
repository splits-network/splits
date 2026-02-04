import React from "react";

type JsonLdData = Record<string, any> | Record<string, any>[];

/**
 * Escape JSON for safe injection into HTML script tags.
 * Replaces characters that could break out of script context.
 */
function escapeJsonLd(data: JsonLdData): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
}

export function JsonLd({
    data,
    id,
}: {
    data: JsonLdData;
    id?: string;
}) {
    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: escapeJsonLd(data) }}
        />
    );
}
