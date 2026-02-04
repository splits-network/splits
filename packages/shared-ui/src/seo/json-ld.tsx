import React from "react";

type JsonLdData = Record<string, any> | Record<string, any>[];

/**
 * Safely serializes JSON-LD data by escaping characters that could break out of script tags.
 * This prevents XSS vulnerabilities when injecting JSON into HTML.
 * 
 * Escapes:
 * - `<` to `\u003c` (prevents breaking out of script tag)
 * - `>` to `\u003e` (prevents breaking out of script tag)
 * - `&` to `\u0026` (prevents HTML entity interpretation)
 * 
 * @param data - The JSON-LD data to serialize
 * @returns Safely escaped JSON string
 */
function safeJsonLdSerialize(data: JsonLdData): string {
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
            dangerouslySetInnerHTML={{ __html: safeJsonLdSerialize(data) }}
        />
    );
}
