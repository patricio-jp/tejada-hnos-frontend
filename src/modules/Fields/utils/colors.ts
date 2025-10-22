import type { Field } from "@/lib/map-types";

const FIELD_COLOR_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#22d3ee",
  "#f59e0b",
  "#ef4444",
];

const pickAvailableFieldColor = (usedColors: Set<string>, seed = 0): string => {
  for (let offset = 0; offset < FIELD_COLOR_PALETTE.length; offset += 1) {
    const candidate = FIELD_COLOR_PALETTE[(seed + offset) % FIELD_COLOR_PALETTE.length];
    if (!usedColors.has(candidate)) {
      usedColors.add(candidate);
      return candidate;
    }
  }

  const hue = (seed * 47) % 360;
  const fallback = `hsl(${hue} 70% 45%)`;
  usedColors.add(fallback);
  return fallback;
};

const collectUsedColors = (fields: Field[]): Set<string> => {
  const result = new Set<string>();
  fields.forEach((field) => {
    const color = field.boundary.properties.color;
    if (color) {
      result.add(color);
    }
  });
  return result;
};

export const ensureFieldColors = (fields: Field[]): Field[] => {
  const usedColors = collectUsedColors(fields);
  let seed = fields.length;

  return fields.map((field) => {
    const color = field.boundary.properties.color ?? pickAvailableFieldColor(usedColors, seed);
    seed += 1;
    if (field.boundary.properties.color === color) {
      return field;
    }

    return {
      ...field,
      boundary: {
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          color,
        },
      },
    };
  });
};

export const getNextFieldColor = (fields: Field[], seed?: number): string => {
  const usedColors = collectUsedColors(fields);
  const base = seed ?? fields.length;
  return pickAvailableFieldColor(usedColors, base);
};
