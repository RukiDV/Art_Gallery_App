import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

type FavoritesPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  // Slugs in the order in which the favorites were added.
  favoriteOrder?: string[];
};

export default function FavoritesPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
  favoriteOrder = [],
}: FavoritesPageProps) {
  // A favorite that is not in the order goes to the end, in gallery order
  // (the sort keeps the order of equal entries).
  const position = (slug: string) => {
    const index = favoriteOrder.indexOf(slug);
    return index === -1 ? favoriteOrder.length : index;
  };
  const favorites = artPieces
    .filter((artPiece) => isFavorite(artPiece.slug))
    .sort((a, b) => position(a.slug) - position(b.slug));

  if (favorites.length === 0) {
    return <p className="status-message">No favorites yet</p>;
  }

  return (
    <div className="favorites-wall">
      <ArtPieceList
        artPieces={favorites}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
