# Script to add userpool node selector and spot tolerations to all application deployments
# Excludes stateful services (RabbitMQ, Redis) which should stay on regular nodes

$excludedServices = @('rabbitmq', 'redis')

$deploymentFiles = Get-ChildItem -Path "." -Recurse -Filter "deployment.yaml"

foreach ($file in $deploymentFiles) {
    $serviceName = $file.Directory.Name
    
    # Skip stateful services
    if ($excludedServices -contains $serviceName) {
        Write-Host "⏭️  Skipping $serviceName (stateful service)" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if already has nodeSelector or tolerations
    if ($content -match 'nodeSelector:' -or $content -match 'tolerations:') {
        Write-Host "⚠️  Skipping $serviceName (already has nodeSelector or tolerations)" -ForegroundColor Yellow
        continue
    }
    
    # Find the spec.template.spec section and add nodeSelector and tolerations
    # Looking for "spec:" at the template level
    $lines = Get-Content -Path $file.FullName
    $newLines = @()
    $inTemplateSpec = $false
    $addedScheduling = $false
    $indent = ""
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $newLines += $line
        
        # Detect when we're in the template spec section (after "spec:" within "template:")
        if ($line -match '^\s+template:') {
            $inTemplateSpec = $true
        }
        
        # Once we find spec: after template:, add our configuration
        if ($inTemplateSpec -and $line -match '^(\s+)spec:\s*$' -and -not $addedScheduling) {
            $indent = $matches[1] + "    "  # Add 4 more spaces for proper indentation
            
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
            Write-Host "✅ Updated $serviceName" -ForegroundColor Green
        }
    }
    
    if ($addedScheduling) {
        # Write the modified content back
        $newLines | Set-Content -Path $file.FullName
    } else {
        Write-Host "⚠️  Could not find template spec in $serviceName" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Done! Updated deployments to use userpool with spot tolerations" -ForegroundColor Green
