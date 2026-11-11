import type { ArtPiece } from "./types";

export type SortOption =
  "default" | "name" | "artist" | "year-asc" | "year-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "artist", label: "Artist (A–Z)" },
  { value: "year-asc", label: "Year (oldest first)" },
  { value: "year-desc", label: "Year (newest first)" },
];

// A year is text such as "1889", "1887–88" or "ca. 1704–9", so the first
// number with four digits is taken as the start year.
export function getStartYear(year: string): number | undefined {
  const match = /\d{4}/.exec(year);

  return match ? Number(match[0]) : undefined;
}

// Paintings without a readable year go last, in both directions.
function compareYears(first: ArtPiece, second: ArtPiece, direction: 1 | -1) {
  const firstYear = getStartYear(first.year);
  const secondYear = getStartYear(second.year);

  if (firstYear === undefined && secondYear === undefined) {
    return 0;
  }
  if (firstYear === undefined) {
    return 1;
  }
  if (secondYear === undefined) {
    return -1;
  }

  return (firstYear - secondYear) * direction;
}

// Returns a new list; the sort is stable, so equal entries keep their order.
export function sortArtPieces(
  artPieces: ArtPiece[],
  option: SortOption
): ArtPiece[] {
  const sorted = [...artPieces];

  switch (option) {
    case "name":
      return sorted.sort((first, second) =>
        first.name.localeCompare(second.name)
      );
    case "artist":
      return sorted.sort((first, second) =>
        first.artist.localeCompare(second.artist)
      );
    case "year-asc":
      return sorted.sort((first, second) => compareYears(first, second, 1));
    case "year-desc":
      return sorted.sort((first, second) => compareYears(first, second, -1));
    default:
      return sorted;
  }
}
