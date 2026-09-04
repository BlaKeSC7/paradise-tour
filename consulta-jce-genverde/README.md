# Consulta de cédula JCE (persona_segura) — archivos de referencia (GenVerde)

Implementación real, extraída de GenVerde (PHP MVC plano, sin framework).
Úsalos junto a `PROMPT-consulta-jce.md` como punto de partida para un nuevo proyecto.

## Contenido
```
app/controllers/LookupController.php     Endpoint HTTP: verificar cédula + servir imagen
app/services/PersonaSeguraService.php    Cliente persona_segura + caché 3 niveles + normalización + auditoría
app/models/PersonaCache.php              Caché en BD (nunca cédula en claro; solo sha256)
app/models/PersonaLookup.php             Auditoría de consultas (Ley 172-13)
app/helpers/Validator.php                validCedula(): dígito verificador RD
app/helpers/Geo.php                      Ciudad JCE → provincia (+ municipios)
app/helpers/WatermarkRemover.php         Quita marca de agua de la foto (GD)
assets/js/persona-lookup.js              Front: fetch, consentimiento, autollenado, bloqueo de campos
database/personas_cache_y_lookups.sql    Esquema de las 2 tablas (MySQL)
PROMPT-consulta-jce.md                   Prompt/documentación completa
```

## Cableado

### Rutas (registrar en tu router)
```php
$router->post('/afiliacion/lookup-cedula', 'LookupController@cedula');
$router->get('/persona-cache/{id}/imagen', 'LookupController@imagen');
```

### Variables de entorno (.env)
```
PERSONA_SEGURA_URL=https://psbi.me/persona.php
PERSONA_SEGURA_KEY=            # clave X-API-KEY (solo servidor) — pídela al proveedor
PERSONA_SEGURA_CACHE_DIAS=30
PERSONA_SEGURA_TIMEOUT=8
PERSONA_SEGURA_SSL_VERIFY=1
JCE_REMOVE_WATERMARK=1
```

### Carpetas de almacenamiento (crear, con escritura)
```
storage/cache/persona/        # caché JSON por hash (nivel 2)
storage/persona-imagenes/     # fotos .jpg (nombre = hash)
```

## Dependencias del entorno GenVerde que debes reemplazar
Estos archivos usan helpers propios de GenVerde; adáptalos a tu stack:
- `db()`            → tu conexión PDO / ORM.
- `env(clave, def)` → tu lector de variables de entorno.
- `url(ruta)`       → tu helper de URLs.
- `Csrf::check()`   → tu verificación CSRF.

## Notas de privacidad (Ley 172-13 RD)
- Consentimiento del titular obligatorio, revalidado en el servidor.
- La cédula en claro NUNCA se persiste (solo hash sha256; 16 chars en auditoría).
- La API key vive solo en el servidor.
- La foto se sirve por id de caché, jamás por cédula.

> La `PERSONA_SEGURA_KEY` es un secreto: NO la subas al repositorio ni al front.
