import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

type FavoritesPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function FavoritesPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: FavoritesPageProps) {
  const favorites = artPieces.filter((artPiece) => isFavorite(artPiece.slug));

  if (favorites.length === 0) {
    return <p>No favorites yet</p>;
  }

  return (
    <ArtPieceList
      artPieces={favorites}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
