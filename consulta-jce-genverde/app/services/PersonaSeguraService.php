<?php
/**
 * GenVerde · PersonaSeguraService
 * Cliente para la API persona_segura.php de PointSeller / CDE-Software.
 * Adaptado de NomiCount a un contexto público single-tenant.
 *
 * Cache de 3 niveles:
 *   1. Tabla personas_cache (BD) — rápido, persistente.
 *   2. Filesystem JSON (TTL) — fallback histórico.
 *   3. API externa — último recurso.
 *
 * Privacidad (Ley 172-13 RD):
 *   - Consentimiento del titular obligatorio en cada lookup.
 *   - La cédula en claro NUNCA se persiste; solo su hash sha256.
 *   - Auditoría de cada consulta (PersonaLookup).
 *   - La API key viaja solo server-side, jamás al navegador.
 */
class PersonaSeguraService
{
    private string $endpoint;
    private string $apiKey;
    private int $cacheTtlDias;
    private int $timeoutSec;
    private string $cacheDir;
    private string $imagenesDir;

    public function __construct()
    {
        $root = dirname(__DIR__, 2);
        $this->endpoint     = (string) env('PERSONA_SEGURA_URL', '');
        $this->apiKey       = (string) env('PERSONA_SEGURA_KEY', '');
        $this->cacheTtlDias = (int) env('PERSONA_SEGURA_CACHE_DIAS', 30);
        $this->timeoutSec   = (int) env('PERSONA_SEGURA_TIMEOUT', 8);
        $this->cacheDir     = $root . '/storage/cache/persona';
        $this->imagenesDir  = $root . '/storage/persona-imagenes';
        foreach ([$this->cacheDir, $this->imagenesDir] as $dir) {
            if (!is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }
        }
    }

    /**
     * @return array ok=>bool; en éxito data/fuente/cached; en fallo error/errorType
     */
    public function consultar(string $cedula, bool $consentimiento, bool $incluirImagen, ?string $ip, ?string $userAgent): array
    {
        $cedulaLimpia = preg_replace('/\D/', '', $cedula) ?? '';
        if (strlen($cedulaLimpia) !== 11) {
            return ['ok' => false, 'error' => 'La cédula debe tener 11 dígitos.', 'errorType' => 'validacion'];
        }
        if (!$consentimiento) {
            return ['ok' => false, 'error' => 'Requiere consentimiento del titular de los datos.', 'errorType' => 'validacion'];
        }

        $hash = hash('sha256', $cedulaLimpia);

        // Nivel 1: cache en BD
        $cached = PersonaCache::buscar($hash);
        if ($cached !== null) {
            PersonaCache::upsert($hash, $cached); // refresca contador
            $this->audit($hash, 'ok_cache_db', $ip, $userAgent);
            return $this->respuesta($cached, 'cache_db', true, $incluirImagen);
        }

        // Nivel 2: cache en filesystem (histórico)
        $fs = $this->leerCacheFs($hash);
        if ($fs !== null) {
            $id = PersonaCache::upsert($hash, $fs, $fs['imagen_path'] ?? null);
            $row = PersonaCache::find($id) ?? $fs;
            $this->audit($hash, 'ok_cache_fs', $ip, $userAgent);
            return $this->respuesta($row, 'cache_fs', true, $incluirImagen);
        }

        // Nivel 3: API real
        $raw = $this->llamarApi($cedulaLimpia);
        if ($raw === null) {
            $this->audit($hash, 'error_red', $ip, $userAgent);
            return ['ok' => false, 'error' => 'No se pudo contactar la API de verificación.', 'errorType' => 'red'];
        }

        $apiResp = json_decode($raw, true);
        if (!is_array($apiResp)) {
            $this->audit($hash, 'error_red', $ip, $userAgent);
            return ['ok' => false, 'error' => 'Respuesta de la API inválida.', 'errorType' => 'red'];
        }
        if (empty($apiResp['ok'])) {
            $this->audit($hash, 'no_encontrado', $ip, $userAgent);
            return ['ok' => false, 'error' => (string) ($apiResp['error'] ?? 'Cédula no encontrada en la JCE.'), 'errorType' => 'no_encontrado'];
        }

        // Normalizar + imagen + persistir (BD + filesystem)
        $normalizado = $this->normalizar($apiResp);
        $imagenPath = null;
        if (!empty($apiResp['imagen_base64'])) {
            $imagenPath = $this->guardarImagen((string) $apiResp['imagen_base64'], $hash);
        }

        $this->escribirCacheFs($hash, $normalizado + ['imagen_path' => $imagenPath]);
        $id = PersonaCache::upsert($hash, $normalizado, $imagenPath);
        $row = PersonaCache::find($id) ?? ($normalizado + ['id' => $id, 'imagen_path' => $imagenPath]);

        $this->audit($hash, 'ok_api', $ip, $userAgent);
        return $this->respuesta($row, 'persona_segura', false, $incluirImagen);
    }

    /** Path absoluto de la imagen de un registro de cache (para servirla). */
    public function pathImagen(int $cacheId): ?string
    {
        $row = PersonaCache::find($cacheId);
        $stored = $row['imagen_path'] ?? null;
        if (!$stored) {
            return null;
        }
        // Resolvemos por nombre de archivo contra la carpeta del servidor actual.
        // Así funciona aunque en la BD haya una ruta absoluta antigua (de otro
        // entorno) o solo el nombre relativo.
        $abs = $this->imagenesDir . '/' . basename(str_replace('\\', '/', $stored));
        return is_file($abs) ? $abs : null;
    }

    private function respuesta(array $row, string $fuente, bool $cached, bool $incluirImagen): array
    {
        return [
            'ok' => true,
            'fuente' => $fuente,
            'cached' => $cached,
            'persona_cache_id' => (int) ($row['id'] ?? 0),
            'has_imagen' => $incluirImagen && !empty($row['imagen_path']),
            'data' => [
                'nombre'           => $row['nombre'] ?? '',
                'apellido'         => $row['apellido'] ?? '',
                'fecha_nacimiento' => $row['fecha_nacimiento'] ?? null,
                'sexo'             => $row['sexo'] ?? null,
                'nacionalidad'     => $row['nacionalidad'] ?? 'Dominicana',
                'estado_civil'     => $row['estado_civil'] ?? null,
                'ciudad'           => $row['ciudad'] ?? null,
                'provincia'        => Geo::provinciaDeCiudad($row['ciudad'] ?? null),
            ],
        ];
    }

    /* ---------------- Filesystem cache ---------------- */

    private function leerCacheFs(string $hash): ?array
    {
        $file = $this->cacheDir . '/' . $hash . '.json';
        if (!is_file($file)) {
            return null;
        }
        if ($this->cacheTtlDias > 0 && (time() - filemtime($file)) > $this->cacheTtlDias * 86400) {
            return null;
        }
        $data = json_decode((string) @file_get_contents($file), true);
        return is_array($data) ? $data : null;
    }

    private function escribirCacheFs(string $hash, array $data): void
    {
        @file_put_contents($this->cacheDir . '/' . $hash . '.json', json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    /* ---------------- Imagen ---------------- */

    private function guardarImagen(string $base64, string $hash): ?string
    {
        if (str_contains($base64, ',')) {
            $base64 = substr($base64, strpos($base64, ',') + 1);
        }
        $bin = base64_decode($base64, true);
        if ($bin === false || strlen($bin) < 100) {
            return null;
        }

        $path = $this->imagenesDir . '/' . $hash . '.jpg';
        if (@file_put_contents($path, $bin) === false) {
            return null;
        }

        if (filter_var(env('JCE_REMOVE_WATERMARK', '1'), FILTER_VALIDATE_BOOLEAN) && extension_loaded('gd')) {
            try {
                $remover = new WatermarkRemover();
                $tmp = $path . '.clean.jpg';
                if ($remover->removeWatermark($path, $tmp) && is_file($tmp)) {
                    @unlink($path);
                    @rename($tmp, $path);
                }
            } catch (Throwable $e) {
                error_log('GenVerde watermark: ' . $e->getMessage());
            }
        }

        // Guardamos solo el nombre relativo (portable entre entornos, p.ej.
        // dev Windows → producción Linux). Se resuelve en pathImagen().
        return $hash . '.jpg';
    }

    /* ---------------- API ---------------- */

    private function llamarApi(string $cedula): ?string
    {
        $headers = ['Content-Type: application/x-www-form-urlencoded', 'User-Agent: GenVerde/1.0'];
        if ($this->apiKey !== '' && !str_starts_with($this->apiKey, 'CAMBIA_')) {
            $headers[] = 'X-API-KEY: ' . $this->apiKey;
        }
        $sslVerify = filter_var(env('PERSONA_SEGURA_SSL_VERIFY', '1'), FILTER_VALIDATE_BOOLEAN);

        $exec = function (bool $verify) use ($cedula, $headers) {
            $ch = curl_init($this->endpoint);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => http_build_query(['cedula' => $cedula]),
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_TIMEOUT        => $this->timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_SSL_VERIFYPEER => $verify,
                CURLOPT_SSL_VERIFYHOST => $verify ? 2 : 0,
            ]);
            $body  = curl_exec($ch);
            $errno = curl_errno($ch);
            $err   = curl_error($ch);
            curl_close($ch);
            return [$body, $errno, $err];
        };

        if ($this->endpoint === '') {
            return null;
        }

        [$body, $errno, $err] = $exec($sslVerify);
        if ($body === false) {
            error_log("GenVerde persona_segura curl: [$errno] $err");
            // Retry sin verificación SSL si fue fallo de certificado (CA bundle viejo).
            // Códigos cURL: 51=peer failed verification, 58=cert problem, 60=ssl cacert, 35=ssl connect.
            if ($sslVerify && in_array($errno, [35, 51, 58, 60], true)) {
                [$body2] = $exec(false);
                if ($body2 !== false) {
                    return (string) $body2;
                }
            }
            return null;
        }
        return (string) $body;
    }

    /* ---------------- Normalización ---------------- */

    private function normalizar(array $r): array
    {
        [$nombre, $apellido] = $this->dividirNombre(trim((string) ($r['nombre_completo'] ?? '')));

        $sexoRaw = strtoupper(trim((string) ($r['sexo'] ?? '')));
        $sexo = null;
        if (str_starts_with($sexoRaw, 'M')) {
            $sexo = 'M';
        } elseif (str_starts_with($sexoRaw, 'F')) {
            $sexo = 'F';
        }

        return [
            'nombre'           => $nombre,
            'apellido'         => $apellido,
            'fecha_nacimiento' => $this->normalizarFecha($r['fecha_nacimiento'] ?? null),
            'sexo'             => $sexo,
            'nacionalidad'     => (string) ($r['nacionalidad'] ?? 'Dominicana'),
            'estado_civil'     => isset($r['EstadoCivil']) ? (string) $r['EstadoCivil'] : ($r['estado_civil'] ?? null),
            'ciudad'           => isset($r['ciudad']) ? (string) $r['ciudad'] : null,
        ];
    }

    /** @return array{0:string,1:string} */
    private function dividirNombre(string $completo): array
    {
        $partes = preg_split('/\s+/', trim($completo)) ?: [];
        $partes = array_values(array_filter($partes, fn($p) => $p !== ''));
        $n = count($partes);
        if ($n === 0) return ['', ''];
        if ($n === 1) return [$partes[0], ''];
        if ($n === 2) return [$partes[0], $partes[1]];
        if ($n === 3) return [$partes[0], $partes[1] . ' ' . $partes[2]];
        $mid = (int) ceil($n / 2);
        return [implode(' ', array_slice($partes, 0, $mid)), implode(' ', array_slice($partes, $mid))];
    }

    private function normalizarFecha($fecha): ?string
    {
        if (!is_string($fecha) || $fecha === '') {
            return null;
        }
        $ts = strtotime($fecha);
        return $ts !== false ? date('Y-m-d', $ts) : null;
    }

    private function audit(string $hash, string $resultado, ?string $ip, ?string $userAgent): void
    {
        PersonaLookup::log($hash, $resultado, $ip, $userAgent);
    }
}
