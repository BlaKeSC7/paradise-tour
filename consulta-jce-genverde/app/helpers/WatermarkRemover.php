<?php
/**
 * GenVerde · WatermarkRemover
 * Elimina el rectángulo "PRM" inferior en fotos de JCE. Portado de NomiCount.
 *
 * Conservador: detecta y elimina únicamente el cuadro oscuro con texto "PRM"
 * blanco centrado en la parte inferior de las fotos. No toca rostro, cabello
 * ni el logo JCE. Solo depende de GD.
 */
class WatermarkRemover
{
    private bool $verbose;

    public function __construct(bool $verbose = false, array $opciones = [])
    {
        $this->verbose = $verbose;
        unset($opciones);
    }

    public function removeWatermark(string $inputPath, string $outputPath): bool
    {
        if (!file_exists($inputPath)) {
            $this->log("Archivo no existe: $inputPath");
            return false;
        }
        if (!extension_loaded('gd')) {
            $this->log('Extensión GD no disponible');
            return false;
        }

        $info = @getimagesize($inputPath);
        if ($info === false) {
            $this->log('Imagen inválida');
            return false;
        }

        $img = $this->cargarImagen($inputPath, $info[2]);
        if ($img === null) {
            $this->log('No se pudo cargar la imagen');
            return false;
        }

        $w = imagesx($img);
        $h = imagesy($img);

        [$pixR, $pixG, $pixB] = $this->leerPixelesRGB($img, $w, $h);
        $this->eliminarPRMInferior($pixR, $pixG, $pixB, $w, $h);

        $out = imagecreatetruecolor($w, $h);
        for ($y = 0; $y < $h; $y++) {
            for ($x = 0; $x < $w; $x++) {
                $color = ($pixR[$y][$x] << 16) | ($pixG[$y][$x] << 8) | $pixB[$y][$x];
                imagesetpixel($out, $x, $y, $color);
            }
        }
        $ok = imagejpeg($out, $outputPath, 92);
        imagedestroy($img);
        imagedestroy($out);

        return (bool) $ok;
    }

    private function eliminarPRMInferior(array &$r, array &$g, array &$b, int $w, int $h): void
    {
        $yIni = (int) ($h * 0.82);

        $colCount = array_fill(0, $w, 0);
        for ($x = 0; $x < $w; $x++) {
            for ($y = $yIni; $y < $h; $y++) {
                if (($r[$y][$x] + $g[$y][$x] + $b[$y][$x]) < 120) {
                    $colCount[$x]++;
                }
            }
        }

        $maxCol = max($colCount);
        if ($maxCol < 8) {
            return;
        }
        $umbralCol = max(5, (int) ($maxCol * 0.40));

        $bestStart = -1; $bestLen = 0;
        $curStart = -1; $huecos = 0;
        for ($x = 0; $x < $w; $x++) {
            if ($colCount[$x] >= $umbralCol) {
                if ($curStart < 0) $curStart = $x;
                $huecos = 0;
            } else {
                if ($curStart >= 0) {
                    $huecos++;
                    if ($huecos > 6) {
                        $len = $x - $huecos - $curStart;
                        if ($len > $bestLen) { $bestLen = $len; $bestStart = $curStart; }
                        $curStart = -1;
                        $huecos = 0;
                    }
                }
            }
        }
        if ($curStart >= 0) {
            $len = $w - $huecos - $curStart;
            if ($len > $bestLen) { $bestLen = $len; $bestStart = $curStart; }
        }

        if ($bestLen < 10) {
            return;
        }

        $xMin = $bestStart;
        $xMax = $bestStart + $bestLen - 1;

        $anchoCluster = $xMax - $xMin + 1;
        $umbralFila = max(3, (int) ($anchoCluster * 0.40));

        $yMin = -1;
        for ($y = $yIni; $y < $h; $y++) {
            $oscurosFila = 0;
            for ($x = $xMin; $x <= $xMax; $x++) {
                if (($r[$y][$x] + $g[$y][$x] + $b[$y][$x]) < 120) $oscurosFila++;
            }
            if ($oscurosFila >= $umbralFila) {
                $yMin = $y;
                break;
            }
        }
        if ($yMin < 0) {
            return;
        }

        $yMax = -1; $count = 0;
        for ($y = $yMin; $y < $h; $y++) {
            for ($x = $xMin; $x <= $xMax; $x++) {
                if (($r[$y][$x] + $g[$y][$x] + $b[$y][$x]) < 120) {
                    if ($y > $yMax) $yMax = $y;
                    $count++;
                }
            }
        }
        if ($yMax < 0) $yMax = $yMin;

        $widthZona = $xMax - $xMin + 1;
        $heightZona = $yMax - $yMin + 1;
        $densidad = $count / ($widthZona * $heightZona);

        if ($widthZona < $heightZona) {
            return;
        }
        if ($densidad < 0.40) {
            return;
        }

        $pixelesClaros = 0;
        for ($y = $yMin; $y <= $yMax; $y++) {
            for ($x = $xMin; $x <= $xMax; $x++) {
                if (($r[$y][$x] + $g[$y][$x] + $b[$y][$x]) > 600) $pixelesClaros++;
            }
        }
        if ($pixelesClaros < 5) {
            return;
        }

        $padX = 4; $padY = 3;
        $xMin = max(0, $xMin - $padX);
        $xMax = min($w - 1, $xMax + $padX);
        $yMin = max(0, $yMin - $padY);
        $yMax = min($h - 1, $yMax + $padY);

        $nSrc = 4;
        $yArriba = $yMin - 1;
        if ($yArriba < $nSrc) {
            return;
        }

        for ($x = $xMin; $x <= $xMax; $x++) {
            $sumR = 0; $sumG = 0; $sumB = 0;
            for ($dy = 0; $dy < $nSrc; $dy++) {
                $sumR += $r[$yArriba - $dy][$x];
                $sumG += $g[$yArriba - $dy][$x];
                $sumB += $b[$yArriba - $dy][$x];
            }
            $promR = (int) round($sumR / $nSrc);
            $promG = (int) round($sumG / $nSrc);
            $promB = (int) round($sumB / $nSrc);

            for ($y = $yMin; $y <= $yMax; $y++) {
                $r[$y][$x] = $promR;
                $g[$y][$x] = $promG;
                $b[$y][$x] = $promB;
            }
        }
    }

    private function cargarImagen(string $path, int $type)
    {
        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG  => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
            default        => null,
        };
    }

    private function leerPixelesRGB($img, int $w, int $h): array
    {
        $r = []; $g = []; $b = [];
        for ($y = 0; $y < $h; $y++) {
            $rowR = array_fill(0, $w, 0);
            $rowG = array_fill(0, $w, 0);
            $rowB = array_fill(0, $w, 0);
            for ($x = 0; $x < $w; $x++) {
                $rgb = imagecolorat($img, $x, $y);
                $rowR[$x] = ($rgb >> 16) & 0xFF;
                $rowG[$x] = ($rgb >> 8) & 0xFF;
                $rowB[$x] = $rgb & 0xFF;
            }
            $r[$y] = $rowR;
            $g[$y] = $rowG;
            $b[$y] = $rowB;
        }
        return [$r, $g, $b];
    }

    private function log(string $msg): void
    {
        if ($this->verbose) {
            error_log("WatermarkRemover: $msg");
        }
    }
}
