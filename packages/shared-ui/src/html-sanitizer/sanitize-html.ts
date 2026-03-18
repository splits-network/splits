import DOMPurify from 'isomorphic-dompurify';

const EMAIL_CONFIG = {
    ALLOWED_TAGS: [
        'div', 'span', 'p', 'br', 'hr',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'b', 'i', 'u', 'em', 'strong', 'small', 'sub', 'sup', 'mark',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'center', 'font',
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'colspan', 'rowspan', 'cellpadding', 'cellspacing', 'border',
        'align', 'valign',
        'style', 'class',
        'color', 'size', 'face',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

const CALENDAR_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'em', 'strong', 'u',
        'a', 'ul', 'ol', 'li', 'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
};

export function sanitizeEmailHtml(html: string): string {
    return DOMPurify.sanitize(html, EMAIL_CONFIG);
}

export function sanitizeCalendarHtml(html: string): string {
    return DOMPurify.sanitize(html, CALENDAR_CONFIG);
}
