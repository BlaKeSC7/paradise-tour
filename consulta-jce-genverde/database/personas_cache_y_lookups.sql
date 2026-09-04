-- Cache de personas consultadas a JCE (persona_segura) · Ley 172-13
-- NUNCA se guarda la cédula en claro, solo el hash sha256.
-- ============================================================
CREATE TABLE IF NOT EXISTS personas_cache (
    id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cedula_hash        CHAR(64)        NOT NULL,
    nombre             VARCHAR(120)    NOT NULL,
    apellido           VARCHAR(120)    NOT NULL,
    fecha_nacimiento   DATE            NULL,
    sexo               ENUM('M','F')   NULL,
    nacionalidad       VARCHAR(80)     NULL,
    estado_civil       VARCHAR(40)     NULL,
    ciudad             VARCHAR(120)    NULL,
    imagen_path        VARCHAR(255)    NULL,
    fuente             VARCHAR(40)     NOT NULL DEFAULT 'persona_segura',
    consultas_count    INT             NOT NULL DEFAULT 1,
    ultima_consulta_en DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_en          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_personas_cedula (cedula_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Auditoría de consultas de cédula (Ley 172-13)
-- ============================================================
CREATE TABLE IF NOT EXISTS persona_lookups (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cedula_hash VARCHAR(16)     NOT NULL,
    resultado   VARCHAR(40)     NOT NULL,
    fuente      VARCHAR(40)     NOT NULL DEFAULT 'persona_segura',
    ip          VARCHAR(45)     NULL,
    user_agent  VARCHAR(255)    NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_lookups_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
