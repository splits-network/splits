/**
 * Generates src/components/badge.css — Memphis badge styles.
 *
 * Reads SilicaUI's badge.css as the base, then appends Memphis-specific
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

    // Memphis uppercase + letter-spacing + thinner default border
    lines.push('.badge {');
    lines.push('  @layer memphis.modifier {');
    lines.push('    text-transform: uppercase;');
    lines.push('    letter-spacing: var(--ls);');
    lines.push('    border-width: var(--border-interactive);');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Palette color variants — use SilicaUI CSS variable pattern
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

    // Size variants with border tiers + font-size + padding
    // Badge borders step down one tier from the shared size config
    const badgeBorderTier: Record<string, string> = {
        container: 'interactive',
        interactive: 'detail',
        detail: 'detail',
    };
    for (const [size, def] of Object.entries(config.sizes)) {
        const rules = [];
        rules.push(`border-width: var(--border-${badgeBorderTier[def.border] || def.border});`);
        rules.push(`font-size: ${def.badgeFs};`);
        rules.push(`padding-inline: ${def.badgePad};`);
        if (def.badgeLs) rules.push(`letter-spacing: ${def.badgeLs};`);
        if (def.badgeGap) rules.push(`gap: ${def.badgeGap};`);

        lines.push(`.badge-${size} {`);
        lines.push('  @layer memphis.modifier {');
        for (const rule of rules) lines.push(`    ${rule}`);
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

    // Border override utilities
    lines.push('');
    lines.push('.badge-border-thin { @layer memphis.modifier { border-width: var(--border-detail); } }');
    lines.push('.badge-border-default { @layer memphis.modifier { border-width: var(--border-interactive); } }');
    lines.push('.badge-border-thick { @layer memphis.modifier { border-width: var(--border-container); } }');

    await writeFile('src/components/badge.css', base + '\n' + lines.join('\n') + '\n');
    console.log('  ✓ src/components/badge.css (Memphis additions)');
}
