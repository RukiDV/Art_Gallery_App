import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

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
    <div
      className="spotlight-page"
      // The first palette color tints the page glow, the picture glow and the label line.
      style={
        { "--art-glow": artPiece.colors[0] ?? "transparent" } as CSSProperties
      }
    >
      <figure className="art-piece spotlight" aria-live="polite">
        {/* The blurred copy of the picture behind it; a new one fades in. */}
        <div
          key={`backdrop-${artPiece.slug}`}
          className="spotlight-backdrop"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${JSON.stringify(artPiece.imageSource)})`,
          }}
        />
        <div className="spotlight-stage">
          <img
            key={artPiece.slug}
            src={artPiece.imageSource}
            alt={artPiece.name}
          />
        </div>
        <figcaption>
          <p>{artPiece.artist}</p>
          <span className="spotlight-palette" aria-hidden="true">
            {artPiece.colors.map((color) => (
              <span
                key={color}
                className="spotlight-swatch"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        </figcaption>
        {isSlideshowRunning && (
          <div
            key={`progress-${artPiece.slug}`}
            className="spotlight-progress"
            aria-hidden="true"
            style={{ animationDuration: `${SLIDE_DURATION_MS}ms` }}
          />
        )}
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
            className="button-primary icon-button"
            aria-label="Show another"
            title="Show another"
            onClick={() =>
              setArtPiece(getRandomArtPiece(artPieces, artPiece.slug))
            }
          >
            <Icon>
              <path d="M16 3h5v5" />
              <path d="M4 20 21 3" />
              <path d="M21 16v5h-5" />
              <path d="m15 15 6 6" />
              <path d="m4 4 5 5" />
            </Icon>
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={
              isSlideshowRunning ? "Stop slideshow" : "Start slideshow"
            }
            title={isSlideshowRunning ? "Stop slideshow" : "Start slideshow"}
            onClick={() => setIsSlideshowRunning((isRunning) => !isRunning)}
          >
            <Icon>
              {isSlideshowRunning ? (
                <>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </>
              ) : (
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
              )}
            </Icon>
          </button>
        </div>
      )}
    </div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
