import React from "react";

type JsonLdData = Record<string, any> | Record<string, any>[];

/**
 * Safely serializes JSON-LD data by escaping characters that could break out of script tags.
 * This prevents XSS vulnerabilities when injecting JSON into HTML.
 * 
 * Escapes:
 * - `<` to `\u003c` (prevents breaking out of script tag)
 * - `>` to `\u003e` (prevents breaking out of script tag)
 * - `/` to `\u002f` (prevents </script> sequences)
 * - `&` to `\u0026` (prevents HTML entity interpretation)
 * - U+2028 (LINE SEPARATOR) and U+2029 (PARAGRAPH SEPARATOR) to prevent JS parsing issues
 * 
 * @param data - The JSON-LD data to serialize
 * @returns Safely escaped JSON string
 */
function safeJsonLdSerialize(data: JsonLdData): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/\//g, '\\u002f')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
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
