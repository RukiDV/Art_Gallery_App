import type { ArtPieceInfo } from "./types";

// The order of the favorites is the order of the entries that are favorites
// in the saved list. Moving one fills the favorite places of the list again,
// in the new order; entries that are not favorites stay where they are.
export function moveFavorite(
  infos: ArtPieceInfo[],
  slug: string,
  toIndex: number
): ArtPieceInfo[] {
  const favorites = infos.filter((info) => info.isFavorite);
  const from = favorites.findIndex((info) => info.slug === slug);
  if (from === -1) {
    return infos;
  }

  const to = Math.min(Math.max(toIndex, 0), favorites.length - 1);
  if (to === from) {
    return infos;
  }

  const reordered = [...favorites];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  let nextFavorite = 0;
  return infos.map((info) =>
    info.isFavorite ? reordered[nextFavorite++] : info
  );
}
