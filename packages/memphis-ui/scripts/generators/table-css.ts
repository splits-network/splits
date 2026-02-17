/**
 * Generates src/components/table.css — Memphis table styles.
 *
 * Memphis tables have: dark header, alternating cream rows, container border.
 * This replaces MemphisUI's table.css entirely.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateTableCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/table.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Table Overrides (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Table Overrides (generated) ═══ */');
    lines.push('');

    // Memphis table header: dark background, white text, uppercase
    lines.push('.table :where(thead th, thead td, tfoot th, tfoot td) {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    background-color: var(--color-dark);');
    lines.push('    color: var(--color-neutral-content);');
    lines.push('    font-weight: 700;');
    lines.push('    text-transform: uppercase;');
    lines.push('    font-size: 0.75rem;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Alternating cream rows
    lines.push('.table :where(tbody tr:nth-child(even)) {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    background-color: var(--color-cream);');
    lines.push('  }');
    lines.push('}');

    await writeFile('src/components/table.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/table.css (Memphis overrides)');
}
