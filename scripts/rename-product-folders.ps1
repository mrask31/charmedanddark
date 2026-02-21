# Rename product folders to match actual database handles

$mappings = @{
    "celestial-taper-candles" = "set-of-3-starry-night-celestial-taper-candles"
    "obsidian-pillar-candle" = "calming-crystal-candle-with-rough-amethyst"
    "white-sage-bundle" = "white-sage-w-eucalyptus-smudge-sticks"
    "skull-bookend-set" = "skull-book-ends-gothic-lifesize-human"
    "gothic-table-mirror" = "antique-mirror"
}

$renamed = 0
$skipped = 0

foreach ($oldName in $mappings.Keys) {
    $newName = $mappings[$oldName]
    $oldPath = "public\products\$oldName"
    $newPath = "public\products\$newName"
    
    if (Test-Path $oldPath) {
        if (Test-Path $newPath) {
            Write-Host "⚠️  Target already exists: $newName" -ForegroundColor Yellow
            $skipped++
        } else {
            Rename-Item -Path $oldPath -NewName $newName
            Write-Host "✅ Renamed: $oldName → $newName" -ForegroundColor Green
            $renamed++
        }
    } else {
        Write-Host "⚠️  Source not found: $oldName" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "Renamed: $renamed folders"
Write-Host "Skipped: $skipped folders"
