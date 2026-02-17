#!/bin/bash
# Memphis Switchover Script - Placements Feature
# Run this after closing all VS Code windows and stopping dev servers

set -e

PORTAL_PATH="g:/code/splits.network/apps/portal/src/app/portal"

echo -e "\033[36mMemphis Placements Switchover\033[0m"
echo "============================="
echo ""

# Check prerequisites
echo -e "\033[33mChecking prerequisites...\033[0m"
if [ ! -d "$PORTAL_PATH/placements" ]; then
    echo -e "\033[31m❌ Original placements directory not found!\033[0m"
    exit 1
fi
if [ ! -d "$PORTAL_PATH/placements-memphis" ]; then
    echo -e "\033[31m❌ Memphis placements directory not found!\033[0m"
    exit 1
fi
if [ -d "$PORTAL_PATH/placements-legacy" ]; then
    echo -e "\033[33m⚠️  placements-legacy already exists! Remove it first or choose a different name.\033[0m"
    exit 1
fi

echo -e "\033[32m✓ Prerequisites met\033[0m"
echo ""

# Confirm
echo "Proceed with switchover? This will:"
echo "  1. Rename placements → placements-legacy"
echo "  2. Rename placements-memphis → placements"
echo ""
read -p "Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "\033[33mSwitchover cancelled.\033[0m"
    exit 0
fi

echo ""
echo -e "\033[33mExecuting switchover...\033[0m"

# Step 1: Archive original
echo -n "  1. Archiving placements → placements-legacy..."
mv "$PORTAL_PATH/placements" "$PORTAL_PATH/placements-legacy"
echo -e " \033[32m✓\033[0m"

# Step 2: Promote Memphis
echo -n "  2. Promoting placements-memphis → placements..."
mv "$PORTAL_PATH/placements-memphis" "$PORTAL_PATH/placements"
echo -e " \033[32m✓\033[0m"

echo ""
echo -e "\033[32m✅ Switchover complete!\033[0m"
echo ""
echo -e "\033[36mNext steps:\033[0m"
echo "  1. Run: pnpm --filter @splits-network/portal build"
echo "  2. Test the placements page in the portal"
echo "  3. If stable, delete placements-legacy/"
echo ""
