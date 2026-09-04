import { Waves, Sailboat, Landmark, Mountain, type LucideIcon } from "lucide-react";

export interface CategoryMeta {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
}

// Coincide 1:1 con las categorías reales que existen en la tabla `tours` de Supabase.
export const CATEGORY_META: CategoryMeta[] = [
  {
    name: "Acuático",
    slug: "acuatico",
    icon: Waves,
    description: "Snorkel, buceo y aguas cristalinas",
  },
  {
    name: "Crucero",
    slug: "crucero",
    icon: Sailboat,
    description: "Catamarán, atardeceres y mar abierto",
  },
  {
    name: "Cultural",
    slug: "cultural",
    icon: Landmark,
    description: "Historia y tradiciones locales",
  },
  {
    name: "Aventura",
    slug: "aventura",
    icon: Mountain,
    description: "Adrenalina y naturaleza",
  },
];

export const getCategoryBySlug = (slug: string): CategoryMeta | undefined =>
  CATEGORY_META.find((c) => c.slug === slug);
