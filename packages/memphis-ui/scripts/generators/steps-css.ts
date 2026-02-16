/**
 * Generates src/components/steps.css — Memphis step styles.
 *
 * Reads SilicaUI's steps.css as the base, then appends Memphis-specific
 * additions: uppercase text, letter-spacing, palette color variants.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateStepsCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/steps.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Steps Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Steps Additions (generated) ═══ */');
    lines.push('');

    // Memphis step base: uppercase + letter-spacing
    lines.push('.steps .step {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    text-transform: uppercase;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Palette color variants
    for (const name of config.stepColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.step-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --step-color: var(--color-${name});`);
        lines.push(`    --step-fg: ${fg};`);
        lines.push('  }');
        lines.push('}');
    }

    await writeFile('src/components/steps.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/steps.css (Memphis additions)');
}
