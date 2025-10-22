// Utilidades para conversión de colores

/**
 * Convierte un color hex a RGBA para deck.gl
 * @param hex - Color en formato hex (#RRGGBB o #RGB)
 * @param alpha - Opacidad (0-255), por defecto 100
 * @returns Array [R, G, B, A] para deck.gl
 */
export function hexToRGBA(hex: string, alpha: number = 100): [number, number, number, number] {
  // Remover el # si existe
  const cleanHex = hex.replace('#', '');
  
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    // Formato corto #RGB -> #RRGGBB
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    // Formato largo #RRGGBB
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else {
    // Color inválido, retornar azul por defecto
    return [0, 100, 255, alpha];
  }
  
  return [r, g, b, alpha];
}

/**
 * Convierte RGBA a hex
 * @param rgba - Array [R, G, B, A]
 * @returns String en formato #RRGGBB
 */
export function rgbaToHex(rgba: [number, number, number, number]): string {
  const [r, g, b] = rgba;
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Colores predefinidos para campos/parcelas
 */
export const PRESET_COLORS = {
  blue: '#0064FF',
  green: '#00C853',
  yellow: '#FFD600',
  orange: '#FF6D00',
  red: '#D50000',
  purple: '#AA00FF',
  pink: '#E91E63',
  teal: '#00BFA5',
  brown: '#795548',
  gray: '#757575',
} as const;

export type PresetColorKey = keyof typeof PRESET_COLORS;
