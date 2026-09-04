<?php
/**
 * GenVerde · LookupController
 * Endpoint público (con consentimiento + CSRF) para verificar una cédula
 * dominicana contra la JCE vía persona_segura.php. La API key vive solo
 * server-side. Cumple Ley 172-13 RD.
 */
class LookupController
{
    public function cedula(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        // CSRF: token desde header X-CSRF-TOKEN o body.
        $input = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($input)) {
            $input = $_POST;
        }
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($input['_csrf_token'] ?? '');
        if (!Csrf::check((string) $token)) {
            $this->error(403, 'CSRF', 'Tu sesión expiró. Recarga la página e inténtalo de nuevo.');
            return;
        }

        $cedula        = (string) ($input['cedula'] ?? '');
        $consentimiento = filter_var($input['consentimiento'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $incluirImagen  = filter_var($input['incluir_imagen'] ?? true, FILTER_VALIDATE_BOOLEAN);

        // 1. cédula requerida, 8-20 chars
        $len = strlen(trim($cedula));
        if ($len < 8 || $len > 20) {
            $this->error(422, 'VALIDATION_FAILED', 'La cédula es obligatoria (formato inválido).');
            return;
        }
        // 2. consentimiento obligatorio
        if (!$consentimiento) {
            $this->error(422, 'VALIDATION_FAILED', 'El titular debe autorizar la consulta de sus datos en bases externas (Ley 172-13).');
            return;
        }
        // 3. dígito verificador JCE
        if (!Validator::validCedula($cedula)) {
            $this->error(422, 'VALIDATION_FAILED', 'Cédula dominicana inválida (el dígito verificador no coincide).');
            return;
        }

        $res = (new PersonaSeguraService())->consultar(
            $cedula,
            $consentimiento,
            $incluirImagen,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );

        if (empty($res['ok'])) {
            $status = match ($res['errorType'] ?? '') {
                'red'         => 502,
                'validacion'  => 422,
                default       => 404,
            };
            $this->error($status, 'LOOKUP_FAILED', $res['error'] ?? 'No encontrado.');
            return;
        }

        $cacheId = (int) ($res['persona_cache_id'] ?? 0);
        $imagenUrl = (!empty($res['has_imagen']) && $cacheId)
            ? url('/persona-cache/' . $cacheId . '/imagen')
            : null;

        http_response_code(200);
        echo json_encode([
            'data' => array_merge($res['data'], [
                'imagen_url'       => $imagenUrl,
                'persona_cache_id' => $cacheId,
            ]),
            'meta' => [
                'fuente' => $res['fuente'] ?? null,
                'cached' => $res['cached'] ?? false,
            ],
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Sirve la foto cacheada de una persona. No expone la cédula.
     */
    public function imagen(string $id): void
    {
        $path = (new PersonaSeguraService())->pathImagen((int) $id);
        if (!$path) {
            http_response_code(404);
            echo 'Imagen no encontrada';
            return;
        }
        header('Content-Type: image/jpeg');
        header('Cache-Control: private, max-age=86400');
        header('Content-Length: ' . filesize($path));
        readfile($path);
    }

    private function error(int $status, string $code, string $message): void
    {
        http_response_code($status);
        echo json_encode(['error' => ['code' => $code, 'message' => $message]], JSON_UNESCAPED_UNICODE);
    }
}
