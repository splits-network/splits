/**
 * Memphis UI TailwindCSS v4 Plugin
 *
 * Registers Memphis-specific utility classes and component base styles.
 * All styles follow Memphis principles: NO shadows, sharp corners, thick borders.
 *
 * Border Hierarchy (3 tiers):
 *   --border-container:   4px  (cards, modals, tables outer, tab bars)
 *   --border-interactive: 3px  (buttons, inputs, selects, badges, CTAs)
 *   --border-detail:      2px  (checkboxes, toggle internals, table cells, tiny indicators)
 *
 * Usage in CSS:
 *   @plugin "@splits-network/memphis-ui/plugin";
 */

import { baseStyles } from './base';
import { buttonUtilities, buttonComponents } from './button';
import { badgeUtilities, badgeComponents } from './badge';
import { cardComponents } from './card';
import { inputComponents } from './input';
import { selectComponents } from './select';
import { tableComponents } from './table';
import { tabsComponents } from './tabs';
import { modalComponents } from './modal';
import { checkboxComponents } from './checkbox';
import { toggleComponents } from './toggle';
import { controlsBarComponents } from './controls-bar';
import { sharedUtilities } from './utilities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function memphisPlugin({ addBase, addUtilities, addComponents }: any) {
    addBase(baseStyles);

    addUtilities({
        ...buttonUtilities,
        ...badgeUtilities,
        ...sharedUtilities,
    });

    addComponents({
        ...buttonComponents,
        ...cardComponents,
        ...badgeComponents,
        ...inputComponents,
        ...selectComponents,
        ...tableComponents,
        ...tabsComponents,
        ...modalComponents,
        ...checkboxComponents,
        ...toggleComponents,
        ...controlsBarComponents,
    });
}
