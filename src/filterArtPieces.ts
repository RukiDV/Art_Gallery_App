import { type ColorFamily, getColorFamily } from "./colorFamilies";
import type { ArtPiece } from "./types";

export function filterArtPieces(
  artPieces: ArtPiece[],
  query: string,
  genre: string,
  families: ColorFamily[] = []
): ArtPiece[] {
  const searchText = query.trim().toLowerCase();

  return artPieces.filter((artPiece) => {
    const matchesSearch =
      artPiece.name.toLowerCase().includes(searchText) ||
      artPiece.artist.toLowerCase().includes(searchText);
    const matchesGenre = genre === "" || artPiece.genre === genre;
    const matchesColor =
      families.length === 0 ||
      artPiece.colors.some((hex) => {
        const family = getColorFamily(hex);
        return family !== undefined && families.includes(family);
      });

    return matchesSearch && matchesGenre && matchesColor;
  });
}

export function getGenres(artPieces: ArtPiece[]): string[] {
  const genres = new Set(artPieces.map((artPiece) => artPiece.genre));

  return [...genres].sort((first, second) => first.localeCompare(second));
}
