import React from "react";

type JsonLdData = Record<string, any> | Record<string, any>[];

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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
