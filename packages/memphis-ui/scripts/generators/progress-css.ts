/**
 * Generates src/components/progress.css — Memphis progress styles.
 *
 * Reads SilicaUI's progress.css as the base, then appends Memphis-specific
 * additions: palette color variants for the progress fill.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateProgressCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/progress.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Progress Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Progress Additions (generated) ═══ */');
    lines.push('');

    // Palette color variants — progress fill color
    for (const name of config.progressColors) {
        lines.push(`.progress-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    color: var(--color-${name});`);
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/progress.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/progress.css (Memphis additions)');
}
