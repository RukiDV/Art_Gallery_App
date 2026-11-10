import type { ArtPiece } from "./types";

const UINT32_RANGE = 2 ** 32;

export function getRandomArtPiece(
  artPieces: ArtPiece[],
  excludedSlug?: string
): ArtPiece {
  const others = artPieces.filter((artPiece) => artPiece.slug !== excludedSlug);
  // With only one piece there is no other one, so that piece is returned.
  const candidates = others.length > 0 ? others : artPieces;

  const [randomValue] = crypto.getRandomValues(new Uint32Array(1));
  const index = Math.floor((randomValue / UINT32_RANGE) * candidates.length);

  return candidates[index];
}
