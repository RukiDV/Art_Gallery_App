import { type CSSProperties, useState, ViewTransition } from "react";

import { debugFlag } from "../debugFlags";
import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";
import TransitionLink, { OPEN_DETAILS_TRANSITION } from "./TransitionLink";

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
  // The favorites wall sizes each frame to the shape of its picture.
  const [ratio, setRatio] = useState<number>();

  return (
    <figure
      className="art-piece art-card"
      style={ratio ? ({ "--ratio": ratio } as CSSProperties) : undefined}
    >
      <TransitionLink to={`/art-pieces/${artPiece.slug}`}>
        <div className="card-inner">
          <div className="card-front">
            {/* The same name on the details page makes the picture travel there. */}
            {debugFlag("noVT") ? (
              <img
                src={artPiece.imageSource}
                alt={artPiece.name}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (naturalWidth > 0 && naturalHeight > 0) {
                    setRatio(
                      Math.round((naturalWidth / naturalHeight) * 1000) / 1000
                    );
                  }
                }}
              />
            ) : (
              <ViewTransition
                name={`art-picture-${artPiece.slug}`}
                default="none"
                share={{ [OPEN_DETAILS_TRANSITION]: "auto", default: "none" }}
              >
                <img
                  src={artPiece.imageSource}
                  alt={artPiece.name}
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (naturalWidth > 0 && naturalHeight > 0) {
                      setRatio(
                        Math.round((naturalWidth / naturalHeight) * 1000) / 1000
                      );
                    }
                  }}
                />
              </ViewTransition>
            )}
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
      </TransitionLink>
      <FavoriteButton
        artPieceName={artPiece.name}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
    </figure>
  );
}
