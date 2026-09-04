<?php
/**
 * GenVerde · Modelo PersonaLookup
 * Auditoría de consultas de cédula (Ley 172-13). Guarda solo 16 chars del hash.
 */
class PersonaLookup
{
    public static function log(string $cedulaHash16, string $resultado, ?string $ip, ?string $userAgent, string $fuente = 'persona_segura'): void
    {
        try {
            $stmt = db()->prepare(
                'INSERT INTO persona_lookups (cedula_hash, resultado, fuente, ip, user_agent)
                 VALUES (?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                substr($cedulaHash16, 0, 16),
                $resultado,
                $fuente,
                $ip,
                $userAgent ? substr($userAgent, 0, 255) : null,
            ]);
        } catch (Throwable $e) {
            error_log('GenVerde persona_lookup audit: ' . $e->getMessage());
        }
    }
}
