import type { ArtPiece } from "./types";

const UINT32_RANGE = 2 ** 32;

export function getRandomArtPiece(artPieces: ArtPiece[]): ArtPiece {
  const [randomValue] = crypto.getRandomValues(new Uint32Array(1));
  const index = Math.floor((randomValue / UINT32_RANGE) * artPieces.length);

  return artPieces[index];
}
