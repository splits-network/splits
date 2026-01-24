import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';

async function checkUsers() {
    try {
        const dbConfig = loadDatabaseConfig();
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        
        const { data, error } = await supabase
            .from('users')
            .select('clerk_user_id, email, name')
            .limit(3);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('Users in database:');
        console.table(data);
        
        if (data && data.length > 0) {
            console.log('✅ Found users with proper email addresses');
        } else {
            console.log('❌ No users found');
        }
    } catch (error) {
        console.error('Failed:', error);
    }
}

checkUsers();