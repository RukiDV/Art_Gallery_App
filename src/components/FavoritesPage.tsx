import { Link } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";
import EmptyFrame from "./EmptyFrame";

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
    return (
      <div className="status-message">
        <EmptyFrame symbol={<HeartIcon />} />
        <p>No favorites yet</p>
        <div className="status-actions">
          <Link to="/art-pieces" className="button-link button-primary">
            Browse the gallery
          </Link>
        </div>
      </div>
    );
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

function HeartIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
