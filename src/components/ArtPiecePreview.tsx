import { Link } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

type ArtPiecePreviewProps = {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function ArtPiecePreview({
  artPiece,
  isFavorite,
  onToggleFavorite,
}: ArtPiecePreviewProps) {
  return (
    <figure className="art-piece">
      <Link to={`/art-pieces/${artPiece.slug}`}>
        <img src={artPiece.imageSource} alt={artPiece.name} />
        <figcaption>
          <h2>{artPiece.name}</h2>
          <p>{artPiece.artist}</p>
        </figcaption>
      </Link>
      <FavoriteButton
        artPieceName={artPiece.name}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
    </figure>
  );
}
