/**
 * Generates src/components/badge.css — Memphis badge styles.
 *
 * Reads MemphisUI's badge.css as the base, then appends Memphis-specific
 * additions: uppercase text, palette variants, dot/soft/outline variants.
 */

import { readFile, writeFile } from 'fs/promises';
import { config } from '../../src/theme.config.js';

export async function generateBadgeCss() {
    // Strip any previous Memphis additions before appending fresh ones
    const raw = await readFile('src/components/badge.css', 'utf-8');
    const base = raw.split('/* ═══ Memphis Additions (generated) ═══ */')[0].trimEnd();

    const lines: string[] = [];
    lines.push('');
    lines.push('/* ═══ Memphis Additions (generated) ═══ */');
    lines.push('');

    // Memphis uppercase + letter-spacing + default border (md)
    lines.push('.badge {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    text-transform: uppercase;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('    border-width: var(--border-md);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Palette color variants — use MemphisUI CSS variable pattern
    // Dark border in a separate :not(.badge-outline) rule (pre-flattened, no CSS nesting)
    for (const name of config.badgeColors) {
        const def = config.colors[name];
        const fg = def.text === 'white'
            ? 'var(--color-neutral-content)'
            : 'var(--color-base-content)';

        lines.push(`.badge-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --badge-color: var(--color-${name});`);
        lines.push(`    --badge-fg: ${fg};`);
        lines.push('  }');
        lines.push('}');
        // lines.push(`.badge-${name}:not(.badge-outline):not(.badge-soft):not(.badge-dash) {`);
        // lines.push('  @layer memphis.modifier {');
        // lines.push('    border-color: var(--color-dark);');
        // lines.push('  }');
        // lines.push('}');
    }
    lines.push('');

    // Size variants with Memphis sizing + font-size + padding + gap + letter-spacing
    for (const [size, def] of Object.entries(config.sizes)) {
        lines.push(`.badge-${size} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    border-width: var(--border-${def.border});`);
        lines.push(`    font-size: ${def.badgeFs};`);
        lines.push(`    padding: ${def.badgePad};`);
        if (def.badgeGap) {
            lines.push(`    gap: ${def.badgeGap};`);
        }
        if (def.badgeLs) {
            lines.push(`    letter-spacing: ${def.badgeLs};`);
        }
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Outline variants — just set --badge-color; the base .badge-outline handles
    // border-color: currentColor, and .badge-{color} no longer overrides it
    // (dark border is scoped to :not(.badge-outline) above)
    for (const name of config.badgeOutlineColors) {
        lines.push(`.badge-outline.badge-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --badge-color: var(--color-${name});`);
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Soft variants — set --badge-color for text tint, override bg with Memphis light shade
    for (const name of config.badgeSoftColors) {
        const def = config.colors[name];
        const bg = def.softBg || `var(--color-${name}-light)`;

        lines.push(`.badge-soft.badge-${name} {`);
        lines.push('  @layer memphis.modifier {');
        lines.push(`    --badge-color: var(--color-${name});`);
        lines.push(`    --badge-bg: ${bg};`);
        lines.push(`    --badge-fg: var(--color-base-content);`);
        lines.push('    border-color: var(--color-dark);');
        lines.push('  }');
        lines.push('}');
    }
    lines.push('');

    // Dot variant
    lines.push('.badge-dot {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    background-color: transparent;');
    lines.push('    color: var(--color-base-content);');
    lines.push('    border: none;');
    lines.push('    padding: 0;');
    lines.push('    gap: 0.375rem;');
    lines.push('  }');
    lines.push('}');

    // Border override utilities - full xs-2xl range
    lines.push('');
    lines.push('.badge-border-xs { @layer memphis.modifier { border-width: var(--border-xs); } }');
    lines.push('.badge-border-sm { @layer memphis.modifier { border-width: var(--border-sm); } }');
    lines.push('.badge-border-md { @layer memphis.modifier { border-width: var(--border-md); } }');
    lines.push('.badge-border-lg { @layer memphis.modifier { border-width: var(--border-lg); } }');
    lines.push('.badge-border-xl { @layer memphis.modifier { border-width: var(--border-xl); } }');
    lines.push('.badge-border-2xl { @layer memphis.modifier { border-width: var(--border-2xl); } }');

    await writeFile('src/components/badge.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/badge.css (Memphis additions)');
}
