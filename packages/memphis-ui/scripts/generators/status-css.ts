/**
 * Generates src/components/status.css — Memphis status styles.
 *
 * Reads SilicaUI's status.css as the base, then appends Memphis-specific
 * additions: palette color variants for the status dot.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateStatusCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/status.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Status Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Status Additions (generated) ═══ */');
    lines.push('');

    // Palette color variants
    for (const name of config.statusColors) {
        lines.push(`.status-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --status-color: var(--color-${name});`);
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/status.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/status.css (Memphis additions)');
}
