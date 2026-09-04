// Genera dist/sitemap.xml después del build, con URLs reales de tours y combos
// consultados directamente a Supabase (no URLs inventadas).
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return env;
}

// ⚠️ Mantené este valor sincronizado con src/lib/site-config.ts (SITE_URL).
const SITE_URL = "https://www.tudominio.com";

const STATIC_ROUTES = ["/", "/categorias", "/ofertas"];

async function fetchRows(url, key, table, select) {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.warn(`No se pudo consultar "${table}" (${res.status}), se omite del sitemap.`);
    return [];
  }
  return res.json();
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  let tourUrls = [];
  let comboUrls = [];

  if (supabaseUrl && supabaseKey) {
    const tours = await fetchRows(supabaseUrl, supabaseKey, "tours", "id,updated_at");
    const combos = await fetchRows(supabaseUrl, supabaseKey, "combos", "id,updated_at");
    tourUrls = tours.map((t) => ({ loc: `/tour/${t.id}`, lastmod: t.updated_at }));
    comboUrls = combos.map((c) => ({ loc: `/combo/${c.id}`, lastmod: c.updated_at }));
  } else {
    console.warn("Faltan credenciales de Supabase, el sitemap solo incluirá rutas estáticas.");
  }

  const allUrls = [
    ...STATIC_ROUTES.map((loc) => ({ loc, lastmod: undefined })),
    ...tourUrls,
    ...comboUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const outDir = path.join(root, "dist");
  if (!existsSync(outDir)) {
    console.warn('No existe "dist/" (¿corriste "npm run build" antes?). No se escribió el sitemap.');
    return;
  }
  writeFileSync(path.join(outDir, "sitemap.xml"), xml, "utf8");
  console.log(`sitemap.xml generado con ${allUrls.length} URLs.`);
}

main();
