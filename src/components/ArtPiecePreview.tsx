import { ViewTransition } from "react";
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
    <figure className="art-piece art-card">
      <Link to={`/art-pieces/${artPiece.slug}`}>
        <div className="card-inner">
          <div className="card-front">
            {/* The same name on the details page makes the picture travel there. */}
            <ViewTransition
              name={`art-picture-${artPiece.slug}`}
              default="none"
              share="auto"
            >
              <img src={artPiece.imageSource} alt={artPiece.name} />
            </ViewTransition>
            {/* Shown on touch screens only, where the card cannot flip. */}
            <span className="card-chip" aria-hidden="true">
              →
            </span>
            <figcaption>
              <h2>{artPiece.name}</h2>
              <p>{artPiece.artist}</p>
            </figcaption>
          </div>
          {/* The back turns up on hover or keyboard focus; the link already says all that matters. */}
          <div className="card-back" aria-hidden="true">
            <span className="card-year">{artPiece.year}</span>
            <span className="card-genre">{artPiece.genre}</span>
            <span className="card-palette">
              {artPiece.colors.map((color) => (
                <span
                  key={color}
                  className="card-swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            <span className="card-cta">View details →</span>
          </div>
        </div>
      </Link>
      <FavoriteButton
        artPieceName={artPiece.name}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
    </figure>
  );
}
