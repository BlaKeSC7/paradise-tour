<?php
/**
 * GenVerde · Modelo PersonaCache
 * Cache de datos JCE. Nunca guarda la cédula en claro (solo hash sha256).
 */
class PersonaCache
{
    public static function buscar(string $cedulaHash): ?array
    {
        $stmt = db()->prepare('SELECT * FROM personas_cache WHERE cedula_hash = ? LIMIT 1');
        $stmt->execute([$cedulaHash]);
        return $stmt->fetch() ?: null;
    }

    public static function find(int $id): ?array
    {
        $stmt = db()->prepare('SELECT * FROM personas_cache WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Upsert por cedula_hash. Incrementa el contador si ya existe.
     */
    public static function upsert(string $cedulaHash, array $d, ?string $imagenPath = null): int
    {
        $existente = self::buscar($cedulaHash);
        if ($existente) {
            $stmt = db()->prepare(
                'UPDATE personas_cache SET
                    nombre = ?, apellido = ?, fecha_nacimiento = ?, sexo = ?,
                    nacionalidad = ?, estado_civil = ?, ciudad = ?,
                    imagen_path = COALESCE(?, imagen_path),
                    consultas_count = consultas_count + 1,
                    ultima_consulta_en = NOW()
                 WHERE id = ?'
            );
            $stmt->execute([
                $d['nombre'] ?? $existente['nombre'],
                $d['apellido'] ?? $existente['apellido'],
                $d['fecha_nacimiento'] ?? null,
                $d['sexo'] ?? null,
                $d['nacionalidad'] ?? null,
                $d['estado_civil'] ?? null,
                $d['ciudad'] ?? null,
                $imagenPath,
                (int) $existente['id'],
            ]);
            return (int) $existente['id'];
        }

        $stmt = db()->prepare(
            "INSERT INTO personas_cache
                (cedula_hash, nombre, apellido, fecha_nacimiento, sexo,
                 nacionalidad, estado_civil, ciudad, imagen_path, fuente,
                 consultas_count, ultima_consulta_en, creado_en)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'persona_segura', 1, NOW(), NOW())"
        );
        $stmt->execute([
            $cedulaHash,
            $d['nombre'] ?? '',
            $d['apellido'] ?? '',
            $d['fecha_nacimiento'] ?? null,
            $d['sexo'] ?? null,
            $d['nacionalidad'] ?? null,
            $d['estado_civil'] ?? null,
            $d['ciudad'] ?? null,
            $imagenPath,
        ]);
        return (int) db()->lastInsertId();
    }
}
