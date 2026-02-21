# Comprehensive image organization based on product titles

$mappings = @{
    # Serving & Kitchen
    "matte-black-cheese-knives-book-box" = @("Cheese knives, charcuterie board, and 2 tier tray combined - 3.png")
    "two-tier-round-slate-stone-and-metal-serving-tray" = @("TwoTierPlatter.png")
    
    # Sage & Ritual
    "white-sage-with-dried-lavender-smudge-sticks" = @("dark hair female burning sage with crystal candles.png")
    
    # Mirrors
    "rectangle-vanity-mirror" = @("Another trinket dish and table top mirror.png", "Better trinket dish and table top mirror.png")
    
    # Vases
    "ceramic-skull-vase" = @("black vase.png")
    "heart-shaped-resin-flower-vase" = @("red heart vase.png")
    
    # Bedding
    "luxury-satin-6-piece-sheet-set" = @("Satin Sheets.png", "Satin Sheets 2.png")
    
    # Decor - Stars
    "set-of-3-large-black-cast-iron-starburst-wall-hangings" = @("Black and Gold Stars on real wall set up - BEST.png", "Black and Gold Stars on all black background.png")
    "large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor" = @("Black and Gold Stars on patterned background - 1.png", "Black and Gold Stars on patterned background - 2.png")
    
    # Furniture
    "yolanda-24-round-upholstered-accent-ottoman" = @("Room set up with frankenstein and ottoman - 1.png", "Room set up with frankenstein and ottoman - 2.png")
    
    # Ornaments
    "frankenstein-glass-ornament" = @("Frankenstein glass ornament.png")
    "wicked-witch-crescent-moon-glass-ornament" = @("Wicked witch crescent moon glass ornament.png")
    "creepy-nun-glass-ornament" = @("Creepy nun glass ornament.png")
    
    # Comforter
    "crushed-velvet-4-piece-comforter-set" = @("Autumon.png", "Autumon2.png")
    
    # Dinnerware
    "mesa-18-piece-stoneware-dinnerware-set" = @("Charcuterie board.png")
    
    # Glassware
    "black-swan-whiskey-glass-set-of-4" = @("black vase.png")
    "venus-ribbed-champagne-coupe-set-7oz-set-of-6" = @("red heart vase.png")
    
    # Teacups
    "gothic-striped-bat-wing-halloween-teacup" = @("gothic-striped-bat-wing-halloween-teacup.png")
    "gothic-halloween-black-spider-teacup" = @("gothic-halloween-black-spider-teacup.png")
}

$organized = 0
$skipped = 0

foreach ($handle in $mappings.Keys) {
    $images = $mappings[$handle]
    $productDir = "public\products\$handle"
    
    # Create directory
    if (-not (Test-Path $productDir)) {
        New-Item -ItemType Directory -Force -Path $productDir | Out-Null
    }
    
    $imageIndex = 0
    foreach ($imageFile in $images) {
        $sourcePath = "public\images\$imageFile"
        
        if (Test-Path $sourcePath) {
            # Check what images already exist
            $existingHero = Test-Path "$productDir\hero.jpg"
            $existingFront = Test-Path "$productDir\front.jpg"
            
            $targetName = if (-not $existingHero) { 
                "hero.jpg" 
            } elseif (-not $existingFront) { 
                "front.jpg" 
            } else { 
                "hover.jpg" 
            }
            
            $targetPath = "$productDir\$targetName"
            
            Copy-Item $sourcePath $targetPath -Force
            Write-Host "OK $handle/$targetName <- $imageFile" -ForegroundColor Green
            $organized++
            $imageIndex++
        } else {
            Write-Host "SKIP Image not found: $imageFile" -ForegroundColor Yellow
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "Organized: $organized images"
Write-Host "Skipped: $skipped images"
