# Script to make replica counts environment-specific using envsubst pattern

$deploymentFiles = Get-ChildItem -Path "." -Recurse -Filter "deployment.yaml"

foreach ($file in $deploymentFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace hardcoded replica counts with environment variable
    # This will allow staging to use 1 replica and production to use more
    $updated = $content -replace '(\s+replicas:\s+)\d+', '$1${REPLICAS:-2}'
    
    if ($content -ne $updated) {
        Set-Content -Path $file.FullName -Value $updated -NoNewline
        Write-Host "✅ Updated $($file.Directory.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✨ Done! Replica counts now use `${REPLICAS:-2} (default 2, override in workflow)" -ForegroundColor Green
Write-Host "Add to staging workflow: export REPLICAS=1" -ForegroundColor Cyan
Write-Host "Add to production workflow: export REPLICAS=3" -ForegroundColor Cyan
