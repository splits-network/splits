/**
 * Generates src/components/indicator.css — Memphis indicator styles.
 *
 * Reads SilicaUI's indicator.css as the base, then appends Memphis-specific
 * additions: palette color variants for indicator items.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateIndicatorCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/indicator.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Indicator Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Indicator Additions (generated) ═══ */');
    lines.push('');

    // Palette color variants for indicator items
    for (const name of config.indicatorColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.indicator .indicator-item.indicator-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    background-color: var(--color-${name});`);
        lines.push(`    color: ${fg};`);
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/indicator.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/indicator.css (Memphis additions)');
}
