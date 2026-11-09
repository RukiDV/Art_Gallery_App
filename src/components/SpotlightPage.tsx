import { useState } from "react";

import { getRandomArtPiece } from "../randomArtPiece";
import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

type SpotlightPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function SpotlightPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: SpotlightPageProps) {
  const [artPiece] = useState(() => getRandomArtPiece(artPieces));

  return (
    <figure className="art-piece spotlight">
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <figcaption>
        <p>{artPiece.artist}</p>
      </figcaption>
      <FavoriteButton
        artPieceName={artPiece.name}
        isFavorite={isFavorite(artPiece.slug)}
        onToggle={() => onToggleFavorite(artPiece.slug)}
      />
    </figure>
  );
}
