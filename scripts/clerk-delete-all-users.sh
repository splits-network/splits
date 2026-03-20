#!/bin/bash
# Deletes ALL users from Clerk staging/development instances.
# Safety: refuses to run if any key is not a sk_test_ key.

set -euo pipefail

# Load only the Clerk keys from .env
ENV_FILE="$(dirname "$0")/../.env"
SPLITS_CLERK_SECRET_KEY=$(grep '^SPLITS_CLERK_SECRET_KEY=' "$ENV_FILE" | cut -d'=' -f2-)
APP_CLERK_SECRET_KEY=$(grep '^APP_CLERK_SECRET_KEY=' "$ENV_FILE" | cut -d'=' -f2-)
ADMIN_CLERK_SECRET_KEY=$(grep '^ADMIN_CLERK_SECRET_KEY=' "$ENV_FILE" | cut -d'=' -f2-)

node -e "
const instances = [
  { name: 'SPLITS_CLERK', key: '$SPLITS_CLERK_SECRET_KEY' },
  { name: 'APP_CLERK', key: '$APP_CLERK_SECRET_KEY' },
  { name: 'ADMIN_CLERK', key: '$ADMIN_CLERK_SECRET_KEY' },
];

async function run() {
  // Safety check
  for (const inst of instances) {
    if (!inst.key.startsWith('sk_test_')) {
      console.error('ABORT: ' + inst.name + ' key is NOT a test key. Refusing to run.');
      process.exit(1);
    }
  }
  console.log('All keys verified as sk_test_. Proceeding with deletion.\n');

  for (const inst of instances) {
    console.log('=== ' + inst.name + ' ===');

    // Count users
    const countRes = await fetch('https://api.clerk.com/v1/users/count', {
      headers: { Authorization: 'Bearer ' + inst.key },
    });
    const countData = await countRes.json();
    const total = countData.total_count ?? 0;
    console.log('Found ' + total + ' users');

    if (total === 0) {
      console.log('No users to delete. Skipping.\n');
      continue;
    }

    let deleted = 0;

    // Paginate and delete
    while (true) {
      const listRes = await fetch('https://api.clerk.com/v1/users?limit=100&order_by=-created_at', {
        headers: { Authorization: 'Bearer ' + inst.key },
      });
      const listData = await listRes.json();

      // Clerk returns { data: [...] } or just [...]
      const users = listData.data ?? listData;
      if (!Array.isArray(users) || users.length === 0) break;

      for (const user of users) {
        await fetch('https://api.clerk.com/v1/users/' + user.id, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + inst.key },
        });
        deleted++;
        console.log('  Deleted ' + user.id + ' (' + deleted + '/' + total + ')');
      }
    }

    console.log('Deleted ' + deleted + ' users from ' + inst.name + '\n');
  }

  console.log('Done. All Clerk staging users deleted.');
}

run().catch(err => { console.error(err); process.exit(1); });
"
