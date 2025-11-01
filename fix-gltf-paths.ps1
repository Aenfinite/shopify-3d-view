# Script to fix GLTF binary references to use relative paths
# This ensures the .bin files can be loaded correctly in Next.js

$publicDir = "D:\shopify-3d-viewersss-main\shopify-3d-viewersss-main\public"
$modelsDir = "$publicDir\models\jackets"

# Find all GLTF files
$gltfFiles = Get-ChildItem -Path $modelsDir -Filter "*.gltf" -Recurse

Write-Host "Found $($gltfFiles.Count) GLTF files"

foreach ($file in $gltfFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    # Read the content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if it has an absolute path that needs to be fixed
    if ($content -match '"uri"\s*:\s*"/models/[^"]+"') {
        Write-Host "  Found absolute path - converting to relative..."
        
        # Replace absolute paths with just the filename (relative to the GLTF file)
        $newContent = $content -replace '("uri"\s*:\s*")\/models\/jackets\/[^/]+\/[^/]+\/([^"]+)"', '$1$2"'
        $newContent = $newContent -replace '("uri"\s*:\s*")\/models\/jackets\/[^/]+\/([^"]+)"', '$1$2"'
        $newContent = $newContent -replace '("uri"\s*:\s*")\/models\/jackets\/([^"]+)"', '$1$2"'
        
        # More comprehensive replacement - extract just the filename
        $newContent = $content -replace '("uri"\s*:\s*")/models/jackets/[^"]*?/([^/"]+)"', '$1$2"'
        
        # Write back to file
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        
        Write-Host "  ✅ Converted to relative path!"
    } else {
        Write-Host "  Already has relative path or no .bin reference"
    }
}

Write-Host ""
Write-Host "✅ All GLTF files processed!"
