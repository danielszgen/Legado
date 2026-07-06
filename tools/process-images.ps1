Add-Type -AssemblyName System.Drawing
$src = "C:\Users\dloza\Documents\Daniels project\Stimulo\Butaques\web\assets"
$out = "$src\img"
New-Item -ItemType Directory -Force $out | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
function Save-Jpeg($bmp, $path, $q) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$q)
  $bmp.Save($path, $jpegCodec, $ep)
}
function Convert-Img($inPath, $outPath, $cropRect, $maxW, $desatWarm) {
  $img = [System.Drawing.Image]::FromFile($inPath)
  $sx = 0; $sy = 0; $sw = $img.Width; $sh = $img.Height
  if ($cropRect) { $sx = $cropRect[0]; $sy = $cropRect[1]; $sw = $cropRect[2]; $sh = $cropRect[3] }
  $scale = [Math]::Min(1.0, $maxW / $sw)
  $w = [int]($sw * $scale); $h = [int]($sh * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  if ($desatWarm) {
    $s = 0.35; $lr = 0.3086*(1-$s); $lg = 0.6094*(1-$s); $lb = 0.0820*(1-$s)
    $m = New-Object System.Drawing.Imaging.ColorMatrix
    $m.Matrix00 = [float](($lr+$s)*1.04); $m.Matrix01 = [float]($lr*0.99);      $m.Matrix02 = [float]($lr*0.90)
    $m.Matrix10 = [float]($lg*1.04);      $m.Matrix11 = [float](($lg+$s)*0.99); $m.Matrix12 = [float]($lg*0.90)
    $m.Matrix20 = [float]($lb*1.04);      $m.Matrix21 = [float]($lb*0.99);      $m.Matrix22 = [float](($lb+$s)*0.90)
    $m.Matrix33 = 1.0; $m.Matrix44 = 1.0
    $attr.SetColorMatrix($m)
  }
  $dest = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g.DrawImage($img, $dest, $sx, $sy, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $g.Dispose(); $img.Dispose()
  Save-Jpeg $bmp $outPath 86
  $bmp.Dispose()
  Write-Output ("OK " + [System.IO.Path]::GetFileName($outPath))
}

foreach ($f in @("$src\ref\nordic.png","$src\ref\baltic.png","$src\ref\lara.png","$src\ref\venus.png","$src\moher\Nordic_002-copia.jpg","$src\moher\Nordic_003-copia.jpg","$src\moher\Venus_002-copia-e1732520732967.jpg","$src\moher\Baltic_02-copia.jpg","$src\moher\sillon-moher-lara-4.jpg")) {
  $i = [System.Drawing.Image]::FromFile($f)
  Write-Output ("{0} {1}x{2}" -f [System.IO.Path]::GetFileName($f), $i.Width, $i.Height)
  $i.Dispose()
}

Convert-Img "$src\ref\nordic.png"  "$out\nordic-ambiente.jpg" $null 1400 $false
Convert-Img "$src\moher\Nordic_002-copia.jpg" "$out\nordic-persona.jpg" $null 1400 $false
Convert-Img "$src\moher\Nordic_003-copia.jpg" "$out\nordic-detalle.jpg" @(450, 620, 640, 640) 900 $false

Convert-Img "$src\ref\venus.png"   "$out\venus-ambiente.jpg" $null 1400 $false
Convert-Img "$src\moher\Venus_002-copia-e1732520732967.jpg" "$out\venus-persona.jpg" $null 1400 $false
Convert-Img "$src\ref\venus.png"   "$out\venus-detalle.jpg" @(430, 330, 560, 560) 900 $false

Convert-Img "$src\ref\baltic.png"  "$out\baltic-ambiente.jpg" $null 1400 $true
Convert-Img "$src\moher\Baltic_02-copia.jpg" "$out\baltic-persona.jpg" $null 1400 $true
Convert-Img "$src\ref\baltic.png"  "$out\baltic-detalle.jpg" @(380, 280, 560, 560) 900 $true

Convert-Img "$src\ref\lara.png"    "$out\lara-ambiente.jpg" $null 1400 $false
Convert-Img "$src\moher\sillon-moher-lara-4.jpg" "$out\lara-persona.jpg" $null 1400 $false
Convert-Img "$src\ref\lara.png"    "$out\lara-detalle.jpg" @(340, 250, 560, 560) 900 $false

Convert-Img "$src\moher\Nordic_002-copia.jpg" "$out\hero-home.jpg" @(150, 60, 1250, 1440) 1250 $false
Convert-Img "$src\moher\Nordic_003-copia.jpg" "$out\tex-boucle.jpg" @(560, 760, 460, 460) 800 $false
Convert-Img "$src\ref\venus.png" "$out\tex-lino.jpg" @(560, 830, 440, 440) 800 $false

$bm = New-Object System.Drawing.Bitmap("$src\moher\sillon-sin-fondo.png")
Write-Output ("cutout alpha esquina: " + $bm.GetPixel(2,2).A)
$bm.Dispose()
