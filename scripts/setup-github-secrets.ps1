# GitHub Secrets Setup Script
# ================================
# This script sets up GitHub Actions secrets for both staging and production environments.
# 
# Prerequisites:
# 1. Install GitHub CLI: https://cli.github.com/
# 2. Authenticate: gh auth login
# 3. Copy secrets.template.json to secrets.json and fill in values
#
# Usage: ./scripts/setup-github-secrets.ps1

$ErrorActionPreference = "Stop"

# Repository (change if needed)
$REPO = "splits-network/splits"

# Load secrets from JSON file
$SecretsFile = Join-Path $PSScriptRoot "secrets.json"

if (-not (Test-Path $SecretsFile)) {
    Write-Host "ERROR: secrets.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get started:" -ForegroundColor Yellow
    Write-Host "  1. Copy secrets.template.json to secrets.json"
    Write-Host "  2. Fill in your secret values"
    Write-Host "  3. Run this script again"
    Write-Host ""
    Write-Host "  cp scripts/secrets.template.json scripts/secrets.json"
    exit 1
}

Write-Host "Loading secrets from $SecretsFile" -ForegroundColor Cyan
$Secrets = Get-Content $SecretsFile | ConvertFrom-Json

Write-Host "Setting up GitHub secrets for $REPO" -ForegroundColor Cyan
Write-Host "Make sure you've created 'staging' and 'production' environments in GitHub first!" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# SET SHARED SECRETS (Repository-level)
# ============================================================================

Write-Host "`n=== Setting Shared Repository Secrets ===" -ForegroundColor Green

foreach ($property in $Secrets.shared.PSObject.Properties) {
    $key = $property.Name
    $value = $property.Value
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  Skipping $key (empty value)" -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "  Setting $key..." -ForegroundColor Gray
    $value | gh secret set $key --repo $REPO
}

# ============================================================================
# SET PRODUCTION SECRETS
# ============================================================================

Write-Host "`n=== Setting Production Environment Secrets ===" -ForegroundColor Green

foreach ($property in $Secrets.production.PSObject.Properties) {
    $key = $property.Name
    $value = $property.Value
    
    # Handle AZURE_CREDENTIALS as nested object - convert back to JSON
    if ($key -eq "AZURE_CREDENTIALS") {
        $value = $value | ConvertTo-Json -Compress
    }
    
    if ([string]::IsNullOrWhiteSpace($value) -or $value -eq "{}") {
        Write-Host "  Skipping $key (empty value)" -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "  Setting $key..." -ForegroundColor Gray
    $value | gh secret set $key --repo $REPO --env production
}

# ============================================================================
# SET STAGING SECRETS
# ============================================================================

Write-Host "`n=== Setting Staging Environment Secrets ===" -ForegroundColor Green

foreach ($property in $Secrets.staging.PSObject.Properties) {
    $key = $property.Name
    $value = $property.Value
    
    # Handle AZURE_CREDENTIALS as nested object - convert back to JSON
    if ($key -eq "AZURE_CREDENTIALS") {
        $value = $value | ConvertTo-Json -Compress
    }
    
    if ([string]::IsNullOrWhiteSpace($value) -or $value -eq "{}") {
        Write-Host "  Skipping $key (empty value)" -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "  Setting $key..." -ForegroundColor Gray
    $value | gh secret set $key --repo $REPO --env staging
}

Write-Host "`n✅ All secrets have been set!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify secrets in GitHub: Settings > Secrets and variables > Actions"
Write-Host "  2. Trigger a staging deployment to test"
Write-Host ""
Write-Host "1. Verify secrets in GitHub: Settings → Secrets and variables → Actions"
Write-Host "2. Check that 'staging' and 'production' environments exist"
Write-Host "3. Test with a deployment"
