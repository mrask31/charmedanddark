# Flatten all product images into a single folder
# Rename files to: [product-handle].jpg (using hero images only)

$sourceDir = "public\products"
$targetDir = "public\product-images"

# Create target directory
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$moved = 0
$skipped = 0

# Get all subdirectories (product folders)
Get-ChildItem -Path $sourceDir -Directory | ForEach-Object {
    $productHandle = $_.Name
    $heroImage = Join-Path $_.FullName "hero.jpg"
    
    if (Test-Path $heroImage) {
        $targetFile = Join-Path $targetDir "$productHandle.jpg"
        
        if (Test-Path $targetFile) {
            Write-Host "SKIP Already exists: $productHandle.jpg" -ForegroundColor Yellow
            $skipped++
        } else {
            Copy-Item $heroImage $targetFile
            Write-Host "OK Copied: $productHandle.jpg" -ForegroundColor Green
            $moved++
        }
    } else {
        Write-Host "SKIP No hero image: $productHandle" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "Moved: $moved images"
Write-Host "Skipped: $skipped items"
Write-Host ""
Write-Host "All product images are now in: public/product-images/"
Write-Host "You can now upload these to Supabase Storage."
