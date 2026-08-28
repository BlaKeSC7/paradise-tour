import { createClient } from '@supabase/supabase-js';

/**
 * Acepta el link de Supabase en cualquier formato y lo deja como
 * https://<ref>.supabase.co:
 *   - https://abcdefghijk.supabase.co/   -> https://abcdefghijk.supabase.co
 *   - abcdefghijk.supabase.co            -> https://abcdefghijk.supabase.co
 *   - abcdefghijk                        -> https://abcdefghijk.supabase.co
 *   - https://supabase.com/dashboard/project/abcdefghijk
 *                                        -> https://abcdefghijk.supabase.co
 */
function normalizeSupabaseUrl(raw: string): string {
  const value = raw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

  const dashboardMatch = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch) return `https://${dashboardMatch[1]}.supabase.co`;

  const host = value.replace(/^https?:\/\//i, '').split('/')[0];
  if (!host) return '';

  // Solo el project ref, sin dominio.
  if (!host.includes('.')) return `https://${host}.supabase.co`;

  return `https://${host}`;
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  const faltan = [
    !supabaseUrl && 'VITE_SUPABASE_URL (el link del proyecto)',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY (Settings > API > anon public)',
  ].filter(Boolean);

  throw new Error(
    `Falta configurar Supabase en el archivo .env: ${faltan.join(' y ')}. ` +
      'Rellena los valores y reinicia el servidor con "npm run dev".'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
