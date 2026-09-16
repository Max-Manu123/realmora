export const ELEMENT_TYPES = [
  "mountain",
  "forest",
  "water",
  "city",
  "castle",
  "road",
  "marker",
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];
export type MapType = "World" | "Region" | "Dungeon";

export type MapElement = {
  id: string;
  map_id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string | null;
  description: string | null;
  points: { x: number; y: number }[] | null;
};

export type MapRecord = {
  id: string;
  user_id: string;
  name: string;
  type: MapType;
  is_public: boolean;
  share_slug: string | null;
  background_color: string;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_SIZE: Record<ElementType, { width: number; height: number }> = {
  mountain: { width: 140, height: 110 },
  forest: { width: 130, height: 100 },
  water: { width: 220, height: 150 },
  city: { width: 110, height: 90 },
  castle: { width: 100, height: 100 },
  road: { width: 0, height: 0 },
  marker: { width: 56, height: 72 },
};

export const LORE_TYPES: ElementType[] = ["city", "castle", "marker"];

export const FREE_MAP_LIMIT = 3;

export function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "map"}-${suffix}`;
}

export function isElementType(value: string): value is ElementType {
  return (ELEMENT_TYPES as readonly string[]).includes(value);
}
