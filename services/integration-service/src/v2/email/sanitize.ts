import sanitize from 'sanitize-html';

const EMAIL_OPTIONS: sanitize.IOptions = {
    allowedTags: [
        ...sanitize.defaults.allowedTags,
        'img', 'h1', 'h2',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
        'caption', 'colgroup', 'col',
        'center', 'font', 'hr',
    ],
    allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        '*': ['style', 'class', 'align', 'valign'],
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target', 'rel'],
        td: ['colspan', 'rowspan', 'width', 'height'],
        th: ['colspan', 'rowspan'],
        table: ['cellpadding', 'cellspacing', 'border', 'width'],
        font: ['color', 'size', 'face'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeEmailBody(html: string | undefined): string | undefined {
    if (!html) return html;
    return sanitize(html, EMAIL_OPTIONS);
}
