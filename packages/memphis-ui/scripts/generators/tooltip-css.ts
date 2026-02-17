/**
 * Generates src/components/tooltip.css — Memphis tooltip styles.
 *
 * Reads MemphisUI's tooltip.css as the base, then appends Memphis-specific
 * additions: palette color variants for tooltip background and text.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateTooltipCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/tooltip.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Tooltip Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Tooltip Additions (generated) ═══ */');
    lines.push('');

    // Palette color variants
    for (const name of config.tooltipColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.tooltip-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --tooltip-color: var(--color-${name});`);
        lines.push(`    --tooltip-text-color: ${fg};`);
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/tooltip.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/tooltip.css (Memphis additions)');
}
