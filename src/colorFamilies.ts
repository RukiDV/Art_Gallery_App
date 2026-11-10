import type { ArtPiece } from "./types";

export type ColorFamily =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Green"
  | "Blue"
  | "Purple"
  | "Brown"
  | "Neutral";

// The families in a fixed order, with the color of their circle in the filter.
// "Neutral" stands for black, white and grey.
export const COLOR_FAMILIES: { name: ColorFamily; color: string }[] = [
  { name: "Red", color: "#c0392b" },
  { name: "Orange", color: "#e67e22" },
  { name: "Yellow", color: "#f1c40f" },
  { name: "Green", color: "#2e8b57" },
  { name: "Blue", color: "#2f6fb5" },
  { name: "Purple", color: "#8e44ad" },
  { name: "Brown", color: "#8b5a2b" },
  { name: "Neutral", color: "#9a9a9a" },
];

// The limits that decide the family of a color (hue in degrees, the rest 0 to 1).
const MIN_SATURATION = 0.12;
const MIN_LIGHTNESS = 0.08;
const MAX_LIGHTNESS = 0.92;
const MAX_BROWN_LIGHTNESS = 0.4;

type Hsl = { hue: number; saturation: number; lightness: number };

function hexToHsl(hex: string): Hsl | undefined {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return undefined;
  }

  const red = parseInt(hex.slice(1, 3), 16) / 255;
  const green = parseInt(hex.slice(3, 5), 16) / 255;
  const blue = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const difference = max - min;
  const lightness = (max + min) / 2;

  if (difference === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation =
    lightness > 0.5 ? difference / (2 - max - min) : difference / (max + min);

  let hue: number;
  if (max === red) {
    hue = ((green - blue) / difference) % 6;
  } else if (max === green) {
    hue = (blue - red) / difference + 2;
  } else {
    hue = (red - green) / difference + 4;
  }
  hue *= 60;
  if (hue < 0) {
    hue += 360;
  }

  return { hue, saturation, lightness };
}

export function getColorFamily(hex: string): ColorFamily | undefined {
  const color = hexToHsl(hex);
  if (!color) {
    return undefined;
  }

  const { hue, saturation, lightness } = color;

  if (
    saturation < MIN_SATURATION ||
    lightness < MIN_LIGHTNESS ||
    lightness > MAX_LIGHTNESS
  ) {
    return "Neutral";
  }
  if (hue < 15 || hue >= 345) {
    return "Red";
  }
  if (hue < 70) {
    if (lightness < MAX_BROWN_LIGHTNESS) {
      return "Brown";
    }
    return hue < 40 ? "Orange" : "Yellow";
  }
  if (hue < 165) {
    return "Green";
  }
  if (hue < 260) {
    return "Blue";
  }
  return "Purple";
}

export function getColorFamilies(artPieces: ArtPiece[]): ColorFamily[] {
  const present = new Set<ColorFamily>();

  artPieces.forEach((artPiece) =>
    artPiece.colors.forEach((hex) => {
      const family = getColorFamily(hex);
      if (family) {
        present.add(family);
      }
    })
  );

  return COLOR_FAMILIES.map((family) => family.name).filter((name) =>
    present.has(name)
  );
}
