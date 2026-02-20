/**
 * Content Seeding Script
 *
 * Upserts all seed pages into the content_pages table.
 * Run: npx tsx services/content-service/seeds/seed-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import { pages, navigation } from './data';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log(`Seeding ${pages.length} content pages...`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const page of pages) {
        const { data: existing } = await supabase
            .from('content_pages')
            .select('id')
            .eq('slug', page.slug)
            .eq('app', page.app)
            .is('deleted_at', null)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('content_pages')
                .update({
                    title: page.title,
                    description: page.description,
                    og_image: page.og_image,
                    category: page.category,
                    author: page.author,
                    read_time: page.read_time,
                    blocks: page.blocks,
                    meta: page.meta,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

            if (error) {
                console.error(`  ERROR updating ${page.app}/${page.slug}: ${error.message}`);
                errors++;
            } else {
                console.log(`  Updated: ${page.app}/${page.slug}`);
                updated++;
            }
        } else {
            const { error } = await supabase.from('content_pages').insert({
                slug: page.slug,
                app: page.app,
                title: page.title,
                description: page.description,
                og_image: page.og_image,
                category: page.category,
                status: page.status || 'published',
                published_at: page.published_at || new Date().toISOString(),
                author: page.author,
                read_time: page.read_time,
                blocks: page.blocks,
                meta: page.meta || {},
            });

            if (error) {
                console.error(`  ERROR creating ${page.app}/${page.slug}: ${error.message}`);
                errors++;
            } else {
                console.log(`  Created: ${page.app}/${page.slug}`);
                created++;
            }
        }
    }

    console.log(`\nDone! Created: ${created}, Updated: ${updated}, Errors: ${errors}`);

    // --- Navigation ---
    console.log(`\nSeeding ${navigation.length} navigation configs...`);

    let navCreated = 0;
    let navUpdated = 0;
    let navErrors = 0;

    for (const nav of navigation) {
        const { data: existing } = await supabase
            .from('content_navigation')
            .select('id')
            .eq('app', nav.app)
            .eq('location', nav.location)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('content_navigation')
                .update({ config: nav.config, updated_at: new Date().toISOString() })
                .eq('id', existing.id);

            if (error) {
                console.error(`  ERROR updating nav ${nav.app}/${nav.location}: ${error.message}`);
                navErrors++;
            } else {
                console.log(`  Updated nav: ${nav.app}/${nav.location}`);
                navUpdated++;
            }
        } else {
            const { error } = await supabase.from('content_navigation').insert({
                app: nav.app,
                location: nav.location,
                config: nav.config,
            });

            if (error) {
                console.error(`  ERROR creating nav ${nav.app}/${nav.location}: ${error.message}`);
                navErrors++;
            } else {
                console.log(`  Created nav: ${nav.app}/${nav.location}`);
                navCreated++;
            }
        }
    }

    console.log(`\nNav done! Created: ${navCreated}, Updated: ${navUpdated}, Errors: ${navErrors}`);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
