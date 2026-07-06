Add-Type -AssemblyName System.Drawing
$hdri = "C:\Users\dloza\Documents\Daniels project\Stimulo\Butaques\web\assets\hdri"
$out  = "C:\Users\dloza\Documents\Daniels project\Stimulo\Butaques\web\assets\img"

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
function Save-Jpeg($bmp, $path, $q) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$q)
  $bmp.Save($path, $jpegCodec, $ep)
}
function Convert-Pano($inPath, $outPath, $maxW) {
  $img = [System.Drawing.Image]::FromFile($inPath)
  $scale = [Math]::Min(1.0, $maxW / $img.Width)
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose(); $img.Dispose()
  Save-Jpeg $bmp $outPath 80
  $bmp.Dispose()
  Write-Output ("OK {0} ({1}x{2})" -f [System.IO.Path]::GetFileName($outPath), $w, $h)
}
function Convert-Crop($inPath, $outPath, $x, $y, $cw, $ch, $outW) {
  $img = [System.Drawing.Image]::FromFile($inPath)
  $scale = [Math]::Min(1.0, $outW / $cw)
  $w = [int]($cw * $scale); $h = [int]($ch * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $dest = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g.DrawImage($img, $dest, $x, $y, $cw, $ch, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $img.Dispose()
  Save-Jpeg $bmp $outPath 84
  $bmp.Dispose()
  Write-Output ("OK " + [System.IO.Path]::GetFileName($outPath))
}

$i = [System.Drawing.Image]::FromFile("$hdri\carpentry_shop_02.jpg")
Write-Output ("carpentry dims: {0}x{1}" -f $i.Width, $i.Height)
$i.Dispose()

Convert-Pano "$hdri\lebombo.jpg"            "$out\sala-moderno-dia.jpg" 4096
Convert-Pano "$hdri\aft_lounge.jpg"         "$out\sala-moderno-noche.jpg" 4096
Convert-Pano "$hdri\lythwood_room.jpg"      "$out\sala-rustico-dia.jpg" 4096
Convert-Pano "$hdri\cayley_interior.jpg"    "$out\sala-rustico-noche.jpg" 4096
Convert-Pano "$hdri\veranda.jpg"            "$out\sala-mediterraneo-dia.jpg" 4096
Convert-Pano "$hdri\st_fagans_interior.jpg" "$out\sala-mediterraneo-noche.jpg" 4096
Convert-Pano "$hdri\reading_room.jpg"       "$out\sala-clasico-dia.jpg" 4096
Convert-Pano "$hdri\royal_esplanade.jpg"    "$out\sala-clasico-noche.jpg" 4096

Convert-Crop "$hdri\carpentry_shop_02.jpg" "$out\taller-1.jpg" 1700 1450 2100 1575 1600
Convert-Crop "$hdri\carpentry_shop_02.jpg" "$out\taller-2.jpg" 5300 1300 1500 1875 1200
