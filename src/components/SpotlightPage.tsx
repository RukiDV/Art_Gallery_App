import { type CSSProperties, useEffect, useState } from "react";

import { getRandomArtPiece } from "../randomArtPiece";
import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

const SLIDE_DURATION_MS = 5000;

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
  const [artPiece, setArtPiece] = useState(() => getRandomArtPiece(artPieces));
  const [isSlideshowRunning, setIsSlideshowRunning] = useState(false);

  // A new piece (by the timer or by "Show another") runs this effect again, so
  // the 5 seconds start over. Stopping or leaving the page clears the timer.
  useEffect(() => {
    if (!isSlideshowRunning) {
      return;
    }
    const timerId = setInterval(() => {
      setArtPiece(getRandomArtPiece(artPieces, artPiece.slug));
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timerId);
  }, [isSlideshowRunning, artPiece, artPieces]);

  return (
    <>
      <figure
        className="art-piece spotlight"
        aria-live="polite"
        // The blurred copy of the picture behind it (see styles.css).
        style={
          {
            "--art-image": `url(${JSON.stringify(artPiece.imageSource)})`,
          } as CSSProperties
        }
      >
        <img
          key={artPiece.slug}
          src={artPiece.imageSource}
          alt={artPiece.name}
        />
        <figcaption>
          <p>{artPiece.artist}</p>
        </figcaption>
        <FavoriteButton
          artPieceName={artPiece.name}
          isFavorite={isFavorite(artPiece.slug)}
          onToggle={() => onToggleFavorite(artPiece.slug)}
        />
      </figure>
      {artPieces.length > 1 && (
        <div className="spotlight-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() =>
              setArtPiece(getRandomArtPiece(artPieces, artPiece.slug))
            }
          >
            Show another
          </button>
          <button
            type="button"
            onClick={() => setIsSlideshowRunning((isRunning) => !isRunning)}
          >
            {isSlideshowRunning ? "Stop slideshow" : "Start slideshow"}
          </button>
        </div>
      )}
    </>
  );
}
