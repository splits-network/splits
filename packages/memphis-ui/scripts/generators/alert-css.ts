/**
 * Generates src/components/alert.css — Memphis alert styles.
 *
 * Reads MemphisUI's alert.css as the base, then appends Memphis-specific
 * additions: border hierarchy, typography, palette color variants, soft variants.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateAlertCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/alert.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Alert Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Alert Additions (generated) ═══ */');
    lines.push('');

    // Memphis base alert: border (md) + typography
    lines.push('.alert {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    border: var(--border-md) solid var(--color-dark);');
    lines.push('    text-transform: uppercase;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Palette color variants
    for (const name of config.alertColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.alert-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    background-color: var(--color-${name});`);
        lines.push(`    color: ${fg};`);
        lines.push('    border-color: var(--color-dark);');
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Soft variants
    for (const name of config.alertColors) {
        const def = config.colors[name];
        if (!def.light && !def.softBg) continue;

        const bg = def.softBg || `var(--color-${name}-light)`;

        lines.push(`.alert-soft.alert-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    background-color: ${bg};`);
        lines.push('    color: var(--color-base-content);');
        lines.push('    border-color: var(--color-dark);');
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/alert.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/alert.css (Memphis additions)');
}
