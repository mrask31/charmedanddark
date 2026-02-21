# Organize product images into proper folder structure

$mappings = @{
    "celestial-taper-candles" = @("threeStarCandle1.png", "threeStarCandle2.png")
    "obsidian-pillar-candle" = @("Candle with Ethos 2.png", "Candle with Ethos 3.png")
    "ebonized-serving-board" = @("Charcuterie board.png")
    "matte-cheese-knife-set" = @("Cheese knives, charcuterie board, and 2 tier tray combined - 2.png")
    "two-tier-serving-stand" = @("TwoTierPlatter.png")
    "white-sage-bundle" = @("Dark haired female burning sage with candles.png")
    "brass-trinket-dish" = @("Trinket dish and table top mirror.png", "Better trinket dish and table top mirror.png")
    "gothic-table-mirror" = @("Another trinket dish and table top mirror.png")
    "matte-black-vase" = @("black vase.png")
    "crimson-heart-vase" = @("red heart vase.png")
    "blush-satin-pillowcase-set" = @("BlushPinkBedding.png")
    "midnight-satin-sheet-set" = @("Satin Sheets.png", "Satin Sheets 2.png")
    "skull-bookend-set" = @("Skull bookends.png")
    "constellation-wall-art" = @("Black and Gold Stars on real wall set up - BEST.png", "Black and Gold Stars on all black background.png")
    "velvet-ottoman" = @("Room set up with frankenstein and ottoman - 1.png")
}

$organized = 0
$skipped = 0

foreach ($handle in $mappings.Keys) {
    $images = $mappings[$handle]
    $productDir = "public\products\$handle"
    
    # Create directory
    New-Item -ItemType Directory -Force -Path $productDir | Out-Null
    
    $imageIndex = 0
    foreach ($imageFile in $images) {
        $sourcePath = "public\images\$imageFile"
        
        if (Test-Path $sourcePath) {
            $targetName = if ($imageIndex -eq 0) { "hero.jpg" } elseif ($imageIndex -eq 1) { "front.jpg" } else { "hover.jpg" }
            $targetPath = "$productDir\$targetName"
            
            Copy-Item $sourcePath $targetPath -Force
            Write-Host "✅ $handle/$targetName ← $imageFile" -ForegroundColor Green
            $organized++
            $imageIndex++
        } else {
            Write-Host "⚠️  Image not found: $imageFile" -ForegroundColor Yellow
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "Organized: $organized images"
Write-Host "Skipped: $skipped images"
