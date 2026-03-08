# Script to add userpool node selector and spot tolerations to all CronJobs

$cronJobFiles = Get-ChildItem -Path "." -Recurse -Include "*.yaml" | 
    Where-Object { (Get-Content $_.FullName -Raw) -match 'kind: CronJob' }

foreach ($file in $cronJobFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if already has nodeSelector or tolerations in the pod template
    if ($content -match 'template:\s*\n\s*spec:\s*\n\s*(nodeSelector:|tolerations:)') {
        Write-Host "⚠️  Skipping $($file.Name) (already has nodeSelector or tolerations)" -ForegroundColor Yellow
        continue
    }
    
    # Find the pod template spec section and add nodeSelector and tolerations
    $lines = Get-Content -Path $file.FullName
    $newLines = @()
    $addedScheduling = $false
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $newLines += $line
        
        # Look for "spec:" within the template section (should be indented more than jobTemplate)
        # CronJob structure: spec.jobTemplate.spec.template.spec
        if ($line -match '^(\s{16,})spec:\s*$' -and -not $addedScheduling) {
            $indent = $matches[1] + "    "  # Add 4 more spaces
            
            # Add nodeSelector
            $newLines += "${indent}nodeSelector:"
            $newLines += "${indent}    agentpool: userpool"
            
            # Add tolerations
            $newLines += "${indent}tolerations:"
            $newLines += "${indent}    - key: `"kubernetes.azure.com/scalesetpriority`""
            $newLines += "${indent}      operator: `"Equal`""
            $newLines += "${indent}      value: `"spot`""
            $newLines += "${indent}      effect: `"NoSchedule`""
            
            $addedScheduling = $true
            Write-Host "✅ Updated $($file.Name)" -ForegroundColor Green
        }
    }
    
    if ($addedScheduling) {
        $newLines | Set-Content -Path $file.FullName
    } else {
        Write-Host "⚠️  Could not find pod template spec in $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Done! Updated CronJobs to use userpool with spot tolerations" -ForegroundColor Green
