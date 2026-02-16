/**
 * Generates src/components/button.css — Memphis button styles.
 *
 * Reads SilicaUI's button.css as the base, then appends Memphis-specific
 * additions: uppercase text, letter-spacing, palette color variants, border tiers.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateButtonCss() {
    // Read SilicaUI button base, stripping any previous Memphis additions
    const raw = await readFile('src/components/button.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Additions (generated) ═══ */');
    lines.push('');

    // Memphis uppercase + letter-spacing override
    lines.push('.btn {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    text-transform: uppercase;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Palette color variants
    for (const name of config.buttonColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.btn-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --btn-color: var(--color-${name});`);
        lines.push(`    --btn-fg: ${fg};`);
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Size variants with Memphis border tiers + font-size + padding
    for (const [size, def] of Object.entries(config.sizes)) {
        lines.push(`.btn-${size} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    border-width: var(--border-${def.border});`);
        lines.push(`    --fontsize: ${def.btnFs};`);
        lines.push(`    --btn-p: ${def.btnPad.split(' ')[1]};`);
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Outline variants per palette color
    for (const name of config.buttonColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.btn-outline.btn-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push('    &:not(.btn-active, :hover, :active:focus, :focus-visible) {');
        lines.push(`      --btn-fg: var(--color-${name});`);
        lines.push(`      --btn-border: var(--color-${name});`);
        lines.push('    }');
        lines.push('  }');
        lines.push('}');
    }

    // Border override utilities
    lines.push('');
    lines.push('.btn-border-thin { @layer memphis.modifier { border-width: var(--border-detail); } }');
    lines.push('.btn-border-default { @layer memphis.modifier { border-width: var(--border-interactive); } }');
    lines.push('.btn-border-thick { @layer memphis.modifier { border-width: var(--border-container); } }');

    await writeFile('src/components/button.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/button.css (Memphis additions)');
}
