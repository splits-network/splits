/**
 * Memphis UI Generator — Orchestrator
 *
 * Reads theme.config.ts and runs all generators to produce:
 * - src/themes/memphis.css      (CSS variables)
 * - src/components/button.css    (Memphis buttons)
 * - src/components/badge.css     (Memphis badges)
 * - src/components/table.css     (Memphis tables)
 * - src/components/controlsbar.css (Memphis controls bar)
 * - src/components/alert.css     (Memphis alerts)
 * - src/components/steps.css     (Memphis steps)
 * - src/components/progress.css  (Memphis progress)
 * - src/components/tooltip.css   (Memphis tooltips)
 * - src/components/indicator.css (Memphis indicators)
 * - src/components/status.css    (Memphis status)
 * - src/utilities/memphis.css    (Memphis utilities)
 * - functions/variables.js       (theme.extend.colors mapping)
 */

import { generateThemeCss } from './generators/theme-css.js';
import { generateVariablesJs } from './generators/variables-js.js';
import { generateButtonCss } from './generators/button-css.js';
import { generateBadgeCss } from './generators/badge-css.js';
import { generateTableCss } from './generators/table-css.js';
import { generateControlsbarCss } from './generators/controlsbar-css.js';
import { generateUtilitiesCss } from './generators/utilities-css.js';
import { generateAlertCss } from './generators/alert-css.js';
import { generateStepsCss } from './generators/steps-css.js';
import { generateProgressCss } from './generators/progress-css.js';
import { generateTooltipCss } from './generators/tooltip-css.js';
import { generateIndicatorCss } from './generators/indicator-css.js';
import { generateStatusCss } from './generators/status-css.js';

async function generate() {
    console.log('▦ Generating Memphis CSS from config...');

    await Promise.all([
        generateThemeCss(),
        generateVariablesJs(),
        generateButtonCss(),
        generateBadgeCss(),
        generateTableCss(),
        generateControlsbarCss(),
        generateUtilitiesCss(),
        generateAlertCss(),
        generateStepsCss(),
        generateProgressCss(),
        generateTooltipCss(),
        generateIndicatorCss(),
        generateStatusCss(),
    ]);

    console.log('▦ Generation complete!');
}

generate().catch((err) => {
    console.error('Generation failed:', err);
    process.exit(1);
});
