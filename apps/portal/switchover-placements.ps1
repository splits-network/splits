# Memphis Switchover Script - Placements Feature
# Run this after closing all VS Code windows and stopping dev servers

$ErrorActionPreference = "Stop"
$portalPath = "G:\code\splits.network\apps\portal\src\app\portal"

Write-Host "Memphis Placements Switchover" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Test-Path "$portalPath\placements")) {
    Write-Host "❌ Original placements directory not found!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "$portalPath\placements-memphis")) {
    Write-Host "❌ Memphis placements directory not found!" -ForegroundColor Red
    exit 1
}
if (Test-Path "$portalPath\placements-legacy") {
    Write-Host "⚠️  placements-legacy already exists! Remove it first or choose a different name." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Prerequisites met" -ForegroundColor Green
Write-Host ""

# Confirm
$confirm = Read-Host "Proceed with switchover? This will:
  1. Rename placements → placements-legacy
  2. Rename placements-memphis → placements

Type 'yes' to continue"

if ($confirm -ne "yes") {
    Write-Host "Switchover cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing switchover..." -ForegroundColor Yellow

try {
    # Step 1: Archive original
    Write-Host "  1. Archiving placements → placements-legacy..." -NoNewline
    Rename-Item -Path "$portalPath\placements" -NewName "placements-legacy" -Force
    Write-Host " ✓" -ForegroundColor Green

    # Step 2: Promote Memphis
    Write-Host "  2. Promoting placements-memphis → placements..." -NoNewline
    Rename-Item -Path "$portalPath\placements-memphis" -NewName "placements" -Force
    Write-Host " ✓" -ForegroundColor Green

    Write-Host ""
    Write-Host "✅ Switchover complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: pnpm --filter @splits-network/portal build" -ForegroundColor White
    Write-Host "  2. Test the placements page in the portal" -ForegroundColor White
    Write-Host "  3. If stable, delete placements-legacy/" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  - All VS Code windows are closed" -ForegroundColor White
    Write-Host "  - No dev servers are running (pnpm dev)" -ForegroundColor White
    Write-Host "  - File Explorer is not open in the placements directory" -ForegroundColor White
    Write-Host "  - No other processes have files open" -ForegroundColor White

    # Attempt rollback if first step succeeded
    if (Test-Path "$portalPath\placements-legacy") {
        Write-Host ""
        Write-Host "Attempting rollback..." -ForegroundColor Yellow
        try {
            Rename-Item -Path "$portalPath\placements-legacy" -NewName "placements" -Force
            Write-Host "✓ Rollback successful" -ForegroundColor Green
        } catch {
            Write-Host "❌ Rollback failed! Manual intervention required." -ForegroundColor Red
        }
    }

    exit 1
}
