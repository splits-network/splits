#!/usr/bin/env pwsh
# Apply Jobs Search Migration to Supabase

Write-Host "🔍 Jobs Full-Text Search Migration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if migration file exists
$migrationFile = "services/ats-service/migrations/017_add_jobs_search_index.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration file found: $migrationFile" -ForegroundColor Green
Write-Host ""

# Read the migration SQL
$migrationSQL = Get-Content $migrationFile -Raw
$lineCount = ($migrationSQL -split "`n").Count
Write-Host "📄 Migration contains $lineCount lines of SQL" -ForegroundColor White
Write-Host ""

Write-Host "⚡ Apply this migration using ONE of these methods:" -ForegroundColor Yellow
Write-Host ""

Write-Host "📌 Method 1: Supabase Dashboard (Recommended)" -ForegroundColor Cyan
Write-Host "   1. Go to: https://supabase.com/dashboard/project/einhgkqmxbkgdohwfayv/sql" -ForegroundColor White
Write-Host "   2. Click 'New query'" -ForegroundColor White
Write-Host "   3. Copy and paste the contents of:" -ForegroundColor White
Write-Host "      $migrationFile" -ForegroundColor Gray
Write-Host "   4. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
Write-Host "   5. Verify: 'Success. No rows returned'" -ForegroundColor Green
Write-Host ""

Write-Host "📌 Method 2: psql Command Line" -ForegroundColor Cyan
Write-Host "   psql `$env:DATABASE_URL -f $migrationFile" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 Method 3: Node.js Script (Auto)" -ForegroundColor Cyan
$scriptExists = Test-Path "scripts/apply-migration.js"
if ($scriptExists) {
    Write-Host "   node scripts/apply-migration.js $migrationFile" -ForegroundColor Gray
} else {
    Write-Host "   (Script not found - use Dashboard instead)" -ForegroundColor DarkGray
}
Write-Host ""

Write-Host "🔍 After migration is applied, verify:" -ForegroundColor Yellow
Write-Host "   1. Column added: " -NoNewline -ForegroundColor White
Write-Host "SELECT company_name FROM jobs LIMIT 1;" -ForegroundColor Gray
Write-Host "   2. Index created: " -NoNewline -ForegroundColor White  
Write-Host "\d jobs" -ForegroundColor Gray -NoNewline
Write-Host " (check for jobs_search_vector_idx)" -ForegroundColor DarkGray
Write-Host "   3. Trigger works: Update a job title and verify search_vector updates" -ForegroundColor White
Write-Host ""

Write-Host "⏭️  Next steps after migration:" -ForegroundColor Yellow
Write-Host "   1. cd services/ats-service" -ForegroundColor Gray
Write-Host "   2. pnpm build" -ForegroundColor Gray
Write-Host "   3. Restart service (Ctrl+C if running, then pnpm dev)" -ForegroundColor Gray
Write-Host "   4. Test search in portal: http://localhost:3000/portal/roles?search=engineer" -ForegroundColor Gray
Write-Host ""

# Offer to open files
Write-Host "📂 Open migration file?" -ForegroundColor Cyan
Write-Host "   code $migrationFile" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Pro tip: After applying, check the implementation guide:" -ForegroundColor Yellow
Write-Host "   code JOBS-SEARCH-IMPLEMENTATION.md" -ForegroundColor Gray
Write-Host ""
