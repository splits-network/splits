import { describe, it, expect } from 'vitest';
import { buildQueryString } from '../../src/routes/v2/common';

describe('buildQueryString (unit)', () => {
    it('returns empty string for empty query', () => {
        expect(buildQueryString()).toBe('');
        expect(buildQueryString({})).toBe('');
    });

    it('serializes primitive and array values', () => {
        const qs = buildQueryString({
            page: 2,
            tag: ['a', 'b'],
            search: 'test',
            empty: undefined,
        });

        expect(qs).toContain('page=2');
        expect(qs).toContain('tag=a');
        expect(qs).toContain('tag=b');
        expect(qs).toContain('search=test');
        expect(qs).not.toContain('empty');
    });
});
